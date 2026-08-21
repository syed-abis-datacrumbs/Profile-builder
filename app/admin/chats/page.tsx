import { CvAiChatsClient } from "./CvAiChatsClient";
import { getAdminChats } from "@/lib/adminData";

// Force dynamic rendering since we are fetching from the DB on load
export const dynamic = 'force-dynamic';

export default async function CvAiChatsPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string; page?: string };
}) {
  const initialSearch = searchParams.search || '';
  const initialType = searchParams.type || 'resume';
  const initialPage = parseInt(searchParams.page || '1', 10);

  const initialData = await getAdminChats(initialSearch, initialType, initialPage);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">AI Chats</h1>
        <p className="text-sm text-slate-400 mt-1">
          Conversations students have had across the Resume, LinkedIn, and GitHub AI builders.
        </p>
      </div>
      <CvAiChatsClient 
        initialData={initialData}
        initialSearch={initialSearch}
        initialType={initialType}
        initialPage={initialPage}
      />
    </div>
  );
}
