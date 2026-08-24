"use client";

import { useEffect, useState } from "react";
import {
  Bug,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  FileText,
  Layers,
  Clock,
  User,
  ExternalLink,
  X,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import toast from "@/lib/toast";

export interface Issue {
  id: string;
  userId?: string | null;
  category?: string;
  text: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface IssueCounts {
  open: number;
  resolved: number;
  resume: number;
  github: number;
  linkedin: number;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badgeBg: string; badgeText: string }
> = {
  resume: {
    label: "Resume Builder",
    icon: FileText,
    badgeBg: "bg-blue-500/10 border-blue-500/30",
    badgeText: "text-blue-400",
  },
  github: {
    label: "GitHub README",
    icon: GithubIcon,
    badgeBg: "bg-purple-500/10 border-purple-500/30",
    badgeText: "text-purple-400",
  },
  linkedin: {
    label: "LinkedIn Optimizer",
    icon: LinkedinIcon,
    badgeBg: "bg-sky-500/10 border-sky-500/30",
    badgeText: "text-sky-400",
  },
};

export function IssuesClient({
  initialData,
  initialStatus,
  initialCategory,
  initialPage,
}: {
  initialData: { issues: Issue[]; total: number; pageSize: number; counts?: IssueCounts };
  initialStatus: string;
  initialCategory: string;
  initialPage: number;
}) {
  const [issues, setIssues] = useState<Issue[]>(initialData.issues);
  const [total, setTotal] = useState(initialData.total);
  const [counts, setCounts] = useState<IssueCounts | undefined>(initialData.counts);
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialData.pageSize);

  // Modal inspection state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [inspectImageFull, setInspectImageFull] = useState<string | null>(null);

  const fetchIssues = async (pg: number, stat: string, cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/issues?page=${pg}&status=${stat}&category=${cat}`);
      const data = await res.json();
      setIssues(data.issues || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPageSize(data.pageSize || 20);
      if (data.counts) setCounts(data.counts);
    } catch {
      toast.error("Failed to load reported issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === initialPage && statusFilter === initialStatus && categoryFilter === initialCategory) {
      setIssues(initialData.issues);
      setTotal(initialData.total);
      setPageSize(initialData.pageSize);
      if (initialData.counts) setCounts(initialData.counts);
    } else {
      fetchIssues(page, statusFilter, categoryFilter);
    }
  }, [page, statusFilter, categoryFilter, initialPage, initialStatus, initialCategory, initialData]);

  const handleUpdateStatus = async (id: string, newStatus: "OPEN" | "RESOLVED") => {
    try {
      const res = await fetch(`/api/admin/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Issue marked as ${newStatus.toLowerCase()}`);
        setIssues((prev) => prev.filter((i) => i.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        if (selectedIssue && selectedIssue.id === id) {
          setSelectedIssue((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        // Refresh counts
        fetchIssues(page, statusFilter, categoryFilter);
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error while updating status");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-500" />
            User Reported Issues & Feedback
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Categorized bug reports, UI issues, and user feedback across Profile Builder modules.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Controls: Parent Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          {/* Parent Feature Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {[
              { id: "ALL", label: "All Features", icon: Layers },
              { id: "resume", label: "Resume Builder", icon: FileText },
              { id: "github", label: "GitHub README", icon: GithubIcon },
              { id: "linkedin", label: "LinkedIn Optimizer", icon: LinkedinIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCategoryFilter(tab.id);
                    setPage(1);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                    isSelected
                      ? "bg-slate-800 border-blue-500/50 text-white shadow-sm ring-1 ring-blue-500/30"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Child Status Filter (Open / Resolved) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            {["OPEN", "RESOLVED"].map((tab) => {
              const isSelected = statusFilter === tab;
              const count = tab === "OPEN" ? counts?.open : counts?.resolved;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? tab === "OPEN"
                        ? "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                        : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${tab === "OPEN" ? "bg-rose-400" : "bg-emerald-400"}`} />
                  <span className="capitalize">{tab.toLowerCase()}</span>
                  {count !== undefined && (
                    <span className="ml-1 text-[11px] opacity-75 font-mono">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area: Table List of Rows */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading reported issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-bold text-white mb-1">No {statusFilter.toLowerCase()} issues</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no reported issues in this category right now.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3.5 px-4">Feature</th>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Issue Description</th>
                    <th className="py-3.5 px-4 text-center">Attachment</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {issues.map((issue) => {
                    const cat = CATEGORY_CONFIG[issue.category || "resume"] || CATEGORY_CONFIG.resume;
                    const CatIcon = cat.icon;

                    return (
                      <tr
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        {/* Feature Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cat.badgeBg} ${cat.badgeText}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            {cat.label}
                          </span>
                        </td>

                        {/* User info */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200 text-xs truncate max-w-[180px]">
                              {issue.user ? issue.user.email : "Anonymous"}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-600" />
                              {new Date(issue.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Issue preview text */}
                        <td className="py-3.5 px-4">
                          <p className="text-slate-300 font-medium line-clamp-2 max-w-md text-xs leading-relaxed group-hover:text-white transition-colors">
                            {issue.text}
                          </p>
                        </td>

                        {/* Attachment thumbnail pill */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {issue.imageUrl ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIssue(issue);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors text-[11px] font-semibold"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>1 Attachment</span>
                            </button>
                          ) : (
                            <span className="text-slate-600 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {issue.status === "OPEN" ? (
                              <button
                                onClick={() => handleUpdateStatus(issue.id, "RESOLVED")}
                                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-500/20 cursor-pointer shadow-2xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Resolve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(issue.id, "OPEN")}
                                className="px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-amber-500/20 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reopen
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedIssue(issue)}
                              className="px-2.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              title="Inspect full details"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between py-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} reported issues
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Issue Detail Inspection Modal ─────────────────────────────── */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedIssue(null)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3">
                {(() => {
                  const cat = CATEGORY_CONFIG[selectedIssue.category || "resume"] || CATEGORY_CONFIG.resume;
                  const CatIcon = cat.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.badgeBg} ${cat.badgeText}`}>
                      <CatIcon className="w-3.5 h-3.5" />
                      {cat.label}
                    </span>
                  );
                })()}

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedIssue.status === "OPEN"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedIssue.status === "OPEN" ? "bg-rose-400" : "bg-emerald-400"}`} />
                  {selectedIssue.status}
                </span>
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
              {/* User Details Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {selectedIssue.user ? selectedIssue.user.email : "Anonymous User"}
                    </h4>
                    {selectedIssue.user?.name && (
                      <p className="text-xs text-slate-400">{selectedIssue.user.name}</p>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(selectedIssue.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Description Content */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Issue Description & Feedback
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedIssue.text}
                </div>
              </div>

              {/* Attachment Image Preview */}
              {selectedIssue.imageUrl && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Attached Screenshot
                    </label>
                    <a
                      href={selectedIssue.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full Size
                    </a>
                  </div>

                  <div
                    onClick={() => setInspectImageFull(selectedIssue.imageUrl)}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer max-h-72 flex items-center justify-center"
                  >
                    <img
                      src={selectedIssue.imageUrl}
                      alt="Reported Issue Attachment"
                      className="max-h-72 w-auto object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Maximize2 className="w-4 h-4" />
                      Click to Expand
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
              <div>
                {selectedIssue.status === "OPEN" ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, "RESOLVED")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, "OPEN")}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reopen Issue
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Size Image Lightbox ───────────────────────────────────── */}
      {inspectImageFull && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setInspectImageFull(null)}
        >
          <button
            onClick={() => setInspectImageFull(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={inspectImageFull}
            alt="Full size screenshot"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
