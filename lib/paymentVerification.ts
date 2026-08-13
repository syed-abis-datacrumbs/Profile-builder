import sharp from 'sharp';
import exifr from 'exifr';
import OpenAI from 'openai';
import { distance as levenshteinDistance } from 'fastest-levenshtein';
import { db } from './db';
import type { PaymentProof } from '@prisma/client';
import { PAYMENT_WINDOW_HOURS } from './paymentConfig';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WORD_SIMILARITY_THRESHOLD = 0.75;
const TAMPER_SOFTWARE_BLOCKLIST = ['photoshop', 'gimp', 'snapseed', 'picsart', 'lightroom'];
const DUPLICATE_LOOKBACK_MONTHS = 6;

/**
 * Difference hash (dHash): resize to 9x8 grayscale, compare adjacent pixel
 * brightness per row. Ported from LMS's cv-payment-verification.ts.
 */
export async function computeImageHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .resize(9, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let bits = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = data[row * 9 + col];
      const right = data[row * 9 + col + 1];
      bits += left < right ? '1' : '0';
    }
  }

  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

export function hammingDistance(hashA: string, hashB: string): number {
  if (!hashA || !hashB || hashA.length !== hashB.length) return Number.MAX_SAFE_INTEGER;
  const a = BigInt(`0x${hashA}`);
  const b = BigInt(`0x${hashB}`);
  let xor = a ^ b;
  let count = 0;
  const zero = BigInt(0);
  const one = BigInt(1);
  while (xor > zero) {
    count += Number(xor & one);
    xor >>= one;
  }
  return count;
}

export async function findDuplicateProof(
  hash: string,
  excludeUserId: string,
  reference?: string | null
): Promise<PaymentProof | null> {
  const since = new Date();
  since.setMonth(since.getMonth() - DUPLICATE_LOOKBACK_MONTHS);

  // The transaction reference is exact, so prefer it. Perceptual hashing
  // alone is unreliable: receipts from the same wallet app all shrink to
  // the same 8x8 thumbnail, so unrelated payments would collide.
  if (reference) {
    return db.paymentProof.findFirst({
      where: { createdAt: { gte: since }, userId: { not: excludeUserId }, transactionRef: reference },
      orderBy: { createdAt: 'desc' },
    });
  }

  const candidates = await db.paymentProof.findMany({
    where: { createdAt: { gte: since }, userId: { not: excludeUserId }, transactionRef: null },
    orderBy: { createdAt: 'desc' },
  });

  for (const candidate of candidates) {
    if (hammingDistance(hash, candidate.imageHash) === 0) return candidate;
  }
  return null;
}

/** Absence of EXIF (normal for phone screenshots) is never flagged — only a
 *  positive hit against known editing-software tags counts. */
export async function checkExifTamperSignal(buffer: Buffer): Promise<boolean> {
  try {
    const meta = await exifr.parse(buffer, { pick: ['Software', 'ProcessingSoftware'] });
    const software = `${meta?.Software ?? ''} ${meta?.ProcessingSoftware ?? ''}`.toLowerCase();
    if (!software.trim()) return false;
    return TAMPER_SOFTWARE_BLOCKLIST.some((tag) => software.includes(tag));
  } catch {
    return false;
  }
}

export interface ReceiptExtraction {
  text: string;
  /** Naive "YYYY-MM-DDTHH:mm:ss" wall-clock string exactly as printed on the
   *  receipt (no timezone conversion) — interpreted as Pakistan time (PKT,
   *  UTC+5) downstream. null when no readable transaction date. */
  transactionAtPkt: string | null;
  /** Transaction/reference ID printed on the receipt, alphanumerics only —
   *  the reliable way to spot a reused receipt (perceptual hashing can't
   *  tell two receipts from the same app apart; they look identical). */
  reference: string | null;
}

/** Reads the screenshot with OpenAI vision and returns a verbatim
 *  transcription plus transaction date/time and reference ID, in one
 *  JSON-mode call. Ported from LMS's extractReceipt. */
export async function extractReceipt(buffer: Buffer, mimeType: string): Promise<ReceiptExtraction | null> {
  try {
    const base64 = buffer.toString('base64');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 700,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Return ONLY a JSON object of the form {"text": string, "datetime": string|null, "reference": string|null}. ' +
                '"text": transcribe every piece of text visible in this image exactly as it appears, one line per line of the image — account titles, account numbers/IBANs (preserve any masking like x\'s, *, or dots exactly), amounts, dates, times, and payment method/app names. Do not summarize or translate. ' +
                '"datetime": the transaction date AND time shown on the receipt, normalized to "YYYY-MM-DDTHH:mm:ss" using a 24-hour clock, exactly as printed with NO timezone conversion. If a date is shown but no time, use T00:00:00. If no transaction date is visible at all, use null. ' +
                '"reference": the transaction / reference / receipt ID shown on the receipt (labelled ID, TID, Trx ID, Transaction ID, Reference No, RRN or similar), digits and letters only with no prefix or "#". If none is visible, use null. ' +
                'If this image is clearly not a payment receipt or transaction confirmation of any kind, return {"text": "NOT_A_RECEIPT", "datetime": null, "reference": null}.',
            },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const text = typeof parsed?.text === 'string' ? parsed.text.trim() : '';
    if (!text || text === 'NOT_A_RECEIPT') return null;
    const transactionAtPkt = typeof parsed?.datetime === 'string' && parsed.datetime.trim() ? parsed.datetime.trim() : null;
    const rawRef = typeof parsed?.reference === 'string' ? parsed.reference : '';
    const reference = rawRef.replace(/[^A-Za-z0-9]/g, '').trim() || null;
    return { text, transactionAtPkt, reference };
  } catch {
    return null;
  }
}

const FUTURE_SKEW_TOLERANCE_MS = 15 * 60 * 1000;

export type PaymentWindowResult = { ok: boolean; reason: 'ok' | 'no-date' | 'unparseable' | 'future' | 'expired' };

/** True only if `transactionAtPkt` (treated as Pakistan time) falls within
 *  the last PAYMENT_WINDOW_HOURS. A missing/unreadable date fails closed. */
export function checkPaymentWindow(transactionAtPkt: string | null): PaymentWindowResult {
  if (!transactionAtPkt) return { ok: false, reason: 'no-date' };

  const normalized = transactionAtPkt.includes('T') ? transactionAtPkt : `${transactionAtPkt}T00:00:00`;
  const ms = Date.parse(`${normalized}+05:00`);
  if (isNaN(ms)) return { ok: false, reason: 'unparseable' };

  const diff = Date.now() - ms;
  if (diff < -FUTURE_SKEW_TOLERANCE_MS) return { ok: false, reason: 'future' };
  if (diff > PAYMENT_WINDOW_HOURS * 60 * 60 * 1000) return { ok: false, reason: 'expired' };
  return { ok: true, reason: 'ok' };
}

export function detectPaymentMethod(text: string): string {
  const norm = text.toLowerCase();
  if (norm.includes('easypaisa') || norm.includes('easy paisa')) return 'easypaisa';
  if (norm.includes('jazzcash') || norm.includes('jazz cash')) return 'jazzcash';
  if (norm.includes('nayapay') || norm.includes('naya pay')) return 'nayapay';
  if (norm.includes('iban') || norm.includes('bank') || norm.includes('transfer')) return 'bank';
  return 'unknown';
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen ? 1 - dist / maxLen : 0;
}

function textContainsFuzzyPhrase(text: string, phrase: string): boolean {
  const phraseWords = normalize(phrase).split(' ').filter(Boolean);
  const textWords = normalize(text).split(' ').filter(Boolean);
  if (!phraseWords.length || !textWords.length) return false;
  return phraseWords.every((pw) => textWords.some((tw) => wordSimilarity(pw, tw) >= WORD_SIMILARITY_THRESHOLD));
}

export function findMatchedTitle(text: string): string | null {
  const candidates = [process.env.CV_PAYMENT_BANK_TITLE, process.env.CV_PAYMENT_WALLET_TITLE].filter(
    (v): v is string => !!v
  );
  return candidates.find((known) => textContainsFuzzyPhrase(text, known)) ?? null;
}

function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export type AccountMatch = { raw: string; strength: 'full' | 'masked' | 'fuzzy' };

function fuzzyDigitsFound(pageDigits: string, knownDigits: string, maxDistance: number): boolean {
  const len = knownDigits.length;
  for (let i = 0; i + len <= pageDigits.length; i++) {
    if (levenshteinDistance(pageDigits.slice(i, i + len), knownDigits) <= maxDistance) return true;
  }
  return false;
}

/** Multi-strategy account-number match (full / masked-both-sides /
 *  masked-suffix-only / fuzzy) — ported from LMS's findMatchedAccountNumber. */
export function findMatchedAccountNumber(text: string, titleMatched: boolean): AccountMatch | null {
  const candidates = [
    process.env.CV_PAYMENT_BANK_IBAN,
    process.env.CV_PAYMENT_BANK_ACCOUNT_NUMBER,
    process.env.CV_PAYMENT_WALLET_NUMBER,
  ]
    .filter((v): v is string => !!v)
    .map((v) => ({ raw: v, digits: digitsOnly(v) }))
    .filter((c) => c.digits.length >= 6);

  const pageDigits = digitsOnly(text);
  const wholeMatch = candidates.find((c) => pageDigits.includes(c.digits));
  if (wholeMatch) return { raw: wholeMatch.raw, strength: 'full' };

  for (const line of text.split(/\n+/)) {
    const normalized = line.replace(/[•●○]/g, 'x');
    const tokens = normalized.match(/[0-9xX*]{4,}/g) || [];
    for (const token of tokens) {
      if (!/[xX*]/.test(token)) continue;

      const firstMask = token.search(/[xX*]/);
      const lastMask = token.length - 1 - [...token].reverse().join('').search(/[xX*]/);
      const prefix = digitsOnly(token.slice(0, firstMask));
      const suffix = digitsOnly(token.slice(lastMask + 1));

      if (prefix.length >= 3 && suffix.length >= 3) {
        const match = candidates.find((c) => c.digits.startsWith(prefix) && c.digits.endsWith(suffix));
        if (match) return { raw: match.raw, strength: 'masked' };
      } else if (titleMatched && suffix.length >= 4) {
        const match = candidates.find((c) => c.digits.endsWith(suffix));
        if (match) return { raw: match.raw, strength: 'masked' };
      }
    }
  }

  if (titleMatched) {
    const digitRuns = text.match(/\d+/g) || [];
    for (const run of digitRuns) {
      if (run.length < 4 || run.length > 6) continue;
      const match = candidates.find((c) => c.digits.endsWith(run));
      if (match) return { raw: match.raw, strength: 'masked' };
    }

    const fuzzyMatch = candidates.find((c) => fuzzyDigitsFound(pageDigits, c.digits, 2));
    if (fuzzyMatch) return { raw: fuzzyMatch.raw, strength: 'fuzzy' };
  }

  return null;
}

/** Strict variant: returns a token only if it equals CV_PAYMENT_AMOUNT_PKR
 *  EXACTLY (no over/under-payment allowed). Tolerates thousands separators
 *  and a trailing ".00". */
export function findExactAmount(text: string): string | null {
  const expected = Number(digitsOnly(process.env.CV_PAYMENT_AMOUNT_PKR ?? ''));
  if (!expected) return null;

  const tokens = text.match(/\d[\d,]*\.?\d*/g) || [];
  const match = tokens.find((t) => {
    const val = Number(t.replace(/,/g, ''));
    return !isNaN(val) && val === expected;
  });
  return match ?? null;
}
