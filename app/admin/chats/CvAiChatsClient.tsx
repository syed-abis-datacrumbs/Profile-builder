"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MessageSquare, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export interface CvAiChatSession {
  sessionId: string;
  turnCount: number;
  startedAt: string;
  lastAt: string;
  firstMessage: string;
  student: { id: string; name: string; email: string };
}

export interface CvAiChatTurn {
  id: string;
  userMessage: string;
  aiReply: string;
  isAutoFit: boolean;
  createdAt: string;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CvAiChatsClient() {
  const [sessions, setSessions] = useState<CvAiChatSession[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // The open transcript (fetched on demand, cached per session).
  const [openSession, setOpenSession] = useState<CvAiChatSession | null>(null);
  const [turns, setTurns] = useState<CvAiChatTurn[] | null>(null);
  const [turnsLoading, setTurnsLoading] = useState(false);

  const fetchSessions = async (query: string, pg: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chats?search=${encodeURIComponent(query)}&page=${pg}`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPageSize(data.pageSize || 25);
    } catch {
      console.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSessions(search, 1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openTranscript = async (session: CvAiChatSession) => {
    setOpenSession(session);
    setTurns(null);
    setTurnsLoading(true);
    try {
      const res = await fetch(`/api/admin/chats/${session.sessionId}`);
      const data = await res.json();
      setTurns(data);
    } catch {
      console.error("Failed to load transcript");
      setTurns([]);
    } finally {
      setTurnsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl">
          <MessageSquare className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold text-white">{total} conversations</span>
        </div>
      </div>

      <div className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden ${loading ? "opacity-60" : ""}`}>
        {loading && sessions.length === 0 ? (
          <div className="text-center py-16 text-slate-500 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-600" />
            Loading conversations...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            No AI chats found
          </div>
        ) : (
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-800 bg-slate-950/80 backdrop-blur text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Student</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">First message</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Turns</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Started</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 max-w-[170px]">
                      <div className="font-semibold text-white truncate">{s.student.name}</div>
                      <div className="text-slate-400 text-xs truncate">{s.student.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-[320px]">
                      <span className="line-clamp-2 text-xs leading-relaxed">{s.firstMessage}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">
                        {s.turnCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(s.startedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openTranscript(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm text-slate-400">
          <span>
            Page {page} of {totalPages} &middot; {total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchSessions(search, page - 1)}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => fetchSessions(search, page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Transcript drawer */}
      {openSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpenSession(null)}
        >
          <div
            className="w-full max-w-2xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-sm font-bold text-white truncate">{openSession.student.name}</h2>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {openSession.student.email} &middot; {formatDateTime(openSession.startedAt)}
                </p>
              </div>
              <button
                onClick={() => setOpenSession(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {turnsLoading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mb-3" />
                  <p className="text-sm">Loading transcript...</p>
                </div>
              )}
              
              {turns?.length === 0 && !turnsLoading && (
                <p className="text-sm text-slate-500 text-center py-10">No messages in this conversation.</p>
              )}
              
              {turns?.map((t) => (
                <div key={t.id} className="space-y-3">
                  <div className="flex justify-end">
                    <div
                      className={`max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        t.isAutoFit
                          ? "bg-slate-800 text-slate-400 italic border border-slate-700"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {t.isAutoFit && (
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 not-italic text-slate-500">
                          Auto page-fit (sent by the app)
                        </p>
                      )}
                      {t.userMessage}
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-slate-800 text-slate-200 border border-slate-700 shadow-sm">
                      {t.aiReply}
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 text-center font-medium">{formatDateTime(t.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
