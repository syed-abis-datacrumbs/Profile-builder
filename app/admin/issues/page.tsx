"use client";

import { useEffect, useState } from "react";
import { Bug, CheckCircle, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

interface Issue {
  id: string;
  text: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

export default function IssuesAdminPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);

  const fetchIssues = async (pg: number, stat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/issues?page=${pg}&status=${stat}`);
      const data = await res.json();
      setIssues(data.issues || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPageSize(data.pageSize || 20);
    } catch {
      console.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues(page, statusFilter);
  }, [page, statusFilter]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (res.ok) {
        setIssues((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {
      console.error("Failed to resolve issue");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-500" />
            Reported Issues
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review and resolve user-reported bugs.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-1 mb-6 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
          {["OPEN", "RESOLVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading issues...</div>
        ) : issues.length === 0 ? (
          <div className="text-slate-400 text-sm">No issues found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-200">
                      {issue.user ? issue.user.name : "Anonymous"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {issue.user ? issue.user.email : "No email"} • {new Date(issue.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {statusFilter === "OPEN" && (
                    <button
                      onClick={() => handleResolve(issue.id)}
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-500/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                </div>

                <div className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800 whitespace-pre-wrap">
                  {issue.text}
                </div>

                {issue.imageUrl && (
                  <div className="mt-2 relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-950/50">
                    <img src={issue.imageUrl} alt="Issue attached" className="w-full h-auto max-h-64 object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <a href={issue.imageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white bg-black/80 px-4 py-2 rounded-full text-sm font-medium pointer-events-auto hover:bg-blue-600 transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        View Full Size
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {total > pageSize && (
          <div className="mt-6 flex items-center justify-between py-4 border-t border-slate-800">
            <span className="text-sm text-slate-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
