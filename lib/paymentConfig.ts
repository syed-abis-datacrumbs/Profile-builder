// TESTING TOGGLE — while true, the payment unlock never persists: status
// checks always report "not unlocked" and the verify route skips the
// permanent DB unlock. Keeps "Remove Watermark" available on every load so
// the flow can be exercised repeatedly during development. Set to false
// before shipping. Same convention as LMS's PAYMENT_TESTING_MODE.
export const PAYMENT_TESTING_MODE = false;

// A payment receipt must be dated within this many hours (Pakistan time) to
// be accepted. Kept in this plain config module (no server-only imports) so
// both the verification pipeline and the client-facing instructions read
// the same number without the client pulling in server code.
export const PAYMENT_WINDOW_HOURS = 24;
