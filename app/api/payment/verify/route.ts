import { getCurrentUserId } from '../../../../lib/serverAuth';
import { db } from '../../../../lib/db';
import { uploadToCloudinary } from '../../../../lib/cloudinary';
import { PAYMENT_TESTING_MODE, PAYMENT_WINDOW_HOURS } from '../../../../lib/paymentConfig';
import {
  computeImageHash,
  findDuplicateProof,
  checkExifTamperSignal,
  extractReceipt,
  detectPaymentMethod,
  findMatchedTitle,
  findMatchedAccountNumber,
  findExactAmount,
  checkPaymentWindow,
} from '../../../../lib/paymentVerification';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ status: 'REJECTED', message: 'Not signed in.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('screenshot');

  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return Response.json(
      { status: 'REJECTED', message: 'Please upload an image of your payment receipt.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Response.json(
      { status: 'REJECTED', message: 'That image is too large. Please upload a file under 8MB.' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const [imageHash, tamperSignal, receipt] = await Promise.all([
    computeImageHash(buffer),
    checkExifTamperSignal(buffer),
    extractReceipt(buffer, file.type),
  ]);

  const receiptText = receipt?.text ?? null;
  const duplicate = await findDuplicateProof(imageHash, userId, receipt?.reference ?? null);

  let status: 'APPROVED' | 'REJECTED';
  let message: string;
  let decisionReason: string;
  let matchedTitle: string | null = null;
  let matchedAccountNumber: string | null = null;
  let matchedAmount: string | null = null;

  if (!receiptText) {
    status = 'REJECTED';
    message = "Couldn't read this image as a payment receipt. Please upload a clear screenshot.";
    decisionReason = 'OCR could not read any text from the image.';
  } else {
    matchedTitle = findMatchedTitle(receiptText);
    const accountMatch = findMatchedAccountNumber(receiptText, !!matchedTitle);
    matchedAccountNumber = accountMatch?.raw ?? null;
    // Strict: only a receipt showing EXACTLY the required amount matches —
    // an over- or under-payment leaves this null and is rejected below.
    matchedAmount = findExactAmount(receiptText);
    const expectedAmount = process.env.CV_PAYMENT_AMOUNT_PKR || 'the required amount';
    // Must be recent (within the window, Pakistan time) — checked BEFORE
    // title/amount approval, so a stale receipt is rejected even when both
    // match.
    const windowCheck = checkPaymentWindow(receipt?.transactionAtPkt ?? null);

    if (duplicate) {
      status = 'REJECTED';
      message = "This screenshot has already been used to verify another account's payment.";
      decisionReason = `Duplicate of proof ${duplicate.id} (userId ${duplicate.userId}).`;
    } else if (!windowCheck.ok) {
      status = 'REJECTED';
      if (windowCheck.reason === 'expired') {
        message = `This payment is more than ${PAYMENT_WINDOW_HOURS} hours old. Please make a fresh payment and upload a receipt from within the last ${PAYMENT_WINDOW_HOURS} hours.`;
      } else if (windowCheck.reason === 'future') {
        message = 'The date on this receipt looks invalid (it appears to be in the future). Please upload a genuine, recent payment receipt.';
      } else {
        message = "We couldn't read the date/time of the payment on this receipt. Please upload a clear screenshot that shows the transaction date and time.";
      }
      decisionReason = `dateWindow=${windowCheck.reason} transactionAtPkt=${receipt?.transactionAtPkt ?? 'none'}`;
    } else if (matchedTitle && matchedAmount) {
      // Approval requires the correct account title, exactly the required
      // amount, AND a within-window date (checked above). The account
      // number match is still computed and logged for audit visibility,
      // but doesn't gate approval.
      status = 'APPROVED';
      message = 'Payment verified! Your download will start now.';
      decisionReason = `Account title and exact amount matched; within ${PAYMENT_WINDOW_HOURS}h (${receipt?.transactionAtPkt ?? '?'} PKT).`;
    } else if (matchedTitle && !matchedAmount) {
      status = 'REJECTED';
      message = `We verified the account, but the amount doesn't match. Please pay exactly Rs. ${expectedAmount} and upload the new receipt.`;
      decisionReason = `titleMatched=true amountExactMatched=false`;
    } else {
      status = 'REJECTED';
      message = "We couldn't verify your payment. Please make sure the screenshot clearly shows the account title and the exact amount, then try again.";
      decisionReason = `titleMatched=${!!matchedTitle} numberMatched=${!!matchedAccountNumber} amountExactMatched=${!!matchedAmount}`;
    }
  }

  const upload = await uploadToCloudinary(buffer, { folder: 'profile-builder-payment-proofs' });

  await db.paymentProof.create({
    data: {
      userId,
      imageUrl: upload.url,
      imageHash,
      transactionRef: receipt?.reference ?? null,
      extractedMethod: receiptText ? detectPaymentMethod(receiptText) : 'unknown',
      extractedTitle: matchedTitle,
      extractedAccountNumber: matchedAccountNumber,
      extractedAmount: matchedAmount,
      titleMatched: !!matchedTitle,
      numberMatched: !!matchedAccountNumber,
      amountMatched: !!matchedAmount,
      duplicateOfProofId: duplicate?.id,
      tamperSignal,
      status,
      decisionReason,
    },
  });

  // Testing mode still runs the full verification + logs the proof, it just
  // doesn't PERSIST the unlock — a reload re-locks so the flow can be
  // retested. See PAYMENT_TESTING_MODE.
  if (status === 'APPROVED' && !PAYMENT_TESTING_MODE) {
    await db.paymentUnlock.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  return Response.json({ status, message });
}
