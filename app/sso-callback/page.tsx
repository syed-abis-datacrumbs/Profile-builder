'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

// Google/Facebook OAuth redirects back here so Clerk can finish creating the
// session (and, for a first-time OAuth user, the account itself) before
// sending them on to redirectUrlComplete from AuthModal's authenticateWithRedirect.
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
