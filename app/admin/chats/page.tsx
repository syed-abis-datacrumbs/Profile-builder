import { CvAiChatsClient } from "./CvAiChatsClient";
import { getAdminChats } from "@/lib/adminData";

// Force dynamic rendering since we are fetching from the DB on load
export const dynamic = 'force-dynamic';

export default async function CvAiChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; page?: string }> | { search?: string; type?: string; page?: string };
}) {
  const resolvedParams = await searchParams;
  const initialSearch = resolvedParams?.search || '';
  const initialType = resolvedParams?.type || 'resume';
  const initialPage = parseInt(resolvedParams?.page || '1', 10);

  const initialData = await getAdminChats(initialSearch, initialType, initialPage);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Chats</h1>
        <p className="text-sm text-slate-500 mt-1">
          Conversations users have had across the Resume, LinkedIn, and GitHub AI builders.
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
