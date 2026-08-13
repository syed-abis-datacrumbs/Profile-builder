import { PAYMENT_WINDOW_HOURS } from '../../../../lib/paymentConfig';

// Server-only env vars, surfaced to the client through this one route so the
// displayed instructions and the server-side matching values can never drift
// apart. Mirrors LMS's getCvPaymentInstructions().
export async function GET() {
  return Response.json({
    bankName: process.env.CV_PAYMENT_BANK_NAME || '',
    bankTitle: process.env.CV_PAYMENT_BANK_TITLE || '',
    bankIban: process.env.CV_PAYMENT_BANK_IBAN || '',
    bankAccountNumber: process.env.CV_PAYMENT_BANK_ACCOUNT_NUMBER || '',
    walletTitle: process.env.CV_PAYMENT_WALLET_TITLE || '',
    walletNumber: process.env.CV_PAYMENT_WALLET_NUMBER || '',
    amountPkr: process.env.CV_PAYMENT_AMOUNT_PKR || '',
    windowHours: PAYMENT_WINDOW_HOURS,
  });
}
