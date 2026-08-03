import { clerkMiddleware } from '@clerk/nextjs/server';

// File is named `proxy.ts`, not `middleware.ts` — Next.js 16 renamed the
// middleware convention to "proxy" (see node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/proxy.md). clerkMiddleware() still
// returns a plain (request) => response function, so it works unchanged
// under the new file name/convention.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static assets, run on everything else.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
