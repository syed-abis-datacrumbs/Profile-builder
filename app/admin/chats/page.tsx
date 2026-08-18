import { CvAiChatsClient } from "./CvAiChatsClient";

// Force dynamic rendering since we are fetching from the DB on load
export const dynamic = 'force-dynamic';

export default async function CvAiChatsPage() {
  const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // We can't easily fetch on server side securely without passing cookies, 
  // so we'll let the client component do the initial fetch if we prefer,
  // OR we can just pass initial empty data and let the client mount and fetch.
  // We'll just pass empty initial data and let it load.

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">AI Chats</h1>
        <p className="text-sm text-slate-400 mt-1">
          Conversations students have had across the Resume, LinkedIn, and GitHub AI builders.
        </p>
      </div>
      <CvAiChatsClient />
    </div>
  );
}
