'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck, Clock, Landmark, Smartphone } from 'lucide-react';

interface PaymentInstructions {
  bankName: string;
  bankTitle: string;
  bankIban: string;
  bankAccountNumber: string;
  walletTitle: string;
  walletNumber: string;
  amountPkr: string;
  windowHours: number;
}

interface PaymentModalProps {
  /** What this unlock actually does — shown in the header subtitle. */
  reason: string;
  onApproved: () => void;
  onClose: () => void;
}

type ChatMessage =
  | { from: 'bot'; kind: 'instructions'; instructions: PaymentInstructions }
  | { from: 'bot'; kind: 'text'; text: string; tone: 'info' | 'success' | 'error' }
  | { from: 'bot'; kind: 'loading' }
  | { from: 'user'; kind: 'image'; previewUrl: string };

function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

function formatWalletNumber(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

function InstructionsBubble({ instructions }: { instructions: PaymentInstructions }) {
  return (
    <div className="space-y-3">
      <p>
        Pay a one-time fee of <span className="font-bold text-slate-900">PKR {instructions.amountPkr}</span> to
        any of the accounts below, then upload a screenshot of your payment receipt.
      </p>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
        <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Read before you pay</p>
        <ul className="space-y-1.5 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Pay the <span className="font-bold text-slate-900">exact amount of PKR {instructions.amountPkr}</span>{' '}
              — paying more or less will be rejected.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Upload a screenshot from{' '}
              <span className="font-bold text-slate-900">within the last {instructions.windowHours} hours</span> —
              older receipts are rejected.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              The screenshot must clearly show the <span className="font-bold text-slate-900">account title</span>,{' '}
              <span className="font-bold text-slate-900">amount</span>, and{' '}
              <span className="font-bold text-slate-900">date &amp; time</span>.
            </span>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5" />
          {instructions.bankName}
        </p>
        <p className="text-xs text-slate-500">
          Account Title: <span className="text-slate-900 font-medium">{instructions.bankTitle}</span>
        </p>
        <p className="text-xs text-slate-500">
          IBAN: <span className="text-slate-900 font-mono">{formatIban(instructions.bankIban)}</span>
        </p>
        <p className="text-xs text-slate-500">
          Account Number: <span className="text-slate-900 font-mono">{instructions.bankAccountNumber}</span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" />
          Easypaisa / JazzCash
        </p>
        <p className="text-xs text-slate-500">
          Account Title: <span className="text-slate-900 font-medium">{instructions.walletTitle}</span>
        </p>
        <p className="text-xs text-slate-500">
          Account Number:{' '}
          <span className="text-slate-900 font-mono">{formatWalletNumber(instructions.walletNumber)}</span>
        </p>
      </div>
    </div>
  );
}

// Rough progress estimate for the loading bar — OCR + matching typically
// takes a few seconds, this isn't a byte-accurate readout.
const ESTIMATED_VERIFY_MS = 8000;

export function PaymentModal({ reason, onApproved, onClose }: PaymentModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/payment/instructions')
      .then((r) => r.json())
      .then((instructions: PaymentInstructions) => {
        setMessages([{ from: 'bot', kind: 'instructions', instructions }]);
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleFileSelected(file: File) {
    const previewUrl = URL.createObjectURL(file);
    setMessages((prev) => [...prev, { from: 'user', kind: 'image', previewUrl }, { from: 'bot', kind: 'loading' }]);
    setSubmitting(true);
    setProgress(0);
    const startedAt = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(90, Math.round((elapsed / ESTIMATED_VERIFY_MS) * 90)));
    }, 150);

    try {
      const body = new FormData();
      body.append('screenshot', file);
      const res = await fetch('/api/payment/verify', { method: 'POST', body });
      const data: { status: 'APPROVED' | 'REJECTED'; message: string } = await res.json();

      setProgress(100);
      setMessages((prev) => [
        ...prev.filter((m) => m.kind !== 'loading'),
        {
          from: 'bot',
          kind: 'text',
          text: data.status === 'APPROVED' ? `✅ ${data.message}` : data.message,
          tone: data.status === 'APPROVED' ? 'success' : 'error',
        },
      ]);

      if (data.status === 'APPROVED') {
        setApproved(true);
        setTimeout(() => onApproved(), 900);
      }
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.kind !== 'loading'),
        { from: 'bot', kind: 'text', text: 'Something went wrong sending that. Please try again.', tone: 'error' },
      ]);
    } finally {
      clearInterval(progressTimer);
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Remove Watermark</h2>
            <p className="text-[11px] text-slate-500">{reason}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((msg, i) => {
            if (msg.from === 'user' && msg.kind === 'image') {
              return (
                <div key={i} className="flex justify-end">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={msg.previewUrl} alt="Payment screenshot" className="max-w-[60%] rounded-xl border border-slate-200" />
                </div>
              );
            }
            if (msg.kind === 'loading') {
              return (
                <div key={i} className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 w-56">
                    <p className="text-[11px] text-slate-500 mb-2">Reading receipt — usually takes 5-10 seconds</p>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-[width] duration-150 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }
            if (msg.kind === 'instructions') {
              return (
                <div key={i} className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-slate-700 max-w-[95%]">
                    <InstructionsBubble instructions={msg.instructions} />
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="flex justify-start">
                <div
                  className={`rounded-2xl rounded-bl-sm px-4 py-3 text-xs max-w-[90%] border ${
                    msg.tone === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : msg.tone === 'error'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0 space-y-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
            }}
          />
          <button
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none"
            disabled={submitting || approved}
            onClick={() => fileInputRef.current?.click()}
          >
            {approved ? 'Payment verified' : submitting ? 'Verifying...' : '+ Attach payment screenshot'}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified automatically and securely</span>
            <Clock className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
