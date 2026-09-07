"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MessageSquare, X, ChevronLeft, ChevronRight, Loader2, Terminal, RefreshCw } from 'lucide-react';
import { LlmTurnInspector } from "@/components/LlmTurnInspector";

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
  rawOutput?: any;
  rawText?: string | null;
  parseSuccess?: boolean;
  model?: string | null;
  tokens?: number | null;
  latencyMs?: number | null;
  error?: string | null;
  createdAt: string;
}

import { formatKarachiDateTime } from "@/lib/dateUtils";

function formatDateTime(iso: string) {
  return formatKarachiDateTime(iso);
}

export function CvAiChatsClient({
  initialData,
  initialSearch,
  initialType,
  initialPage,
}: {
  initialData: { sessions: CvAiChatSession[]; total: number; pageSize: number };
  initialSearch: string;
  initialType: string;
  initialPage: number;
}) {
  const [sessions, setSessions] = useState<CvAiChatSession[]>(initialData.sessions);
  const [total, setTotal] = useState(initialData.total);
  const [pageSize, setPageSize] = useState(initialData.pageSize);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<'resume' | 'linkedin' | 'github'>(initialType as any);
  const [loading, setLoading] = useState(false);

  // The open transcript (fetched on demand, cached per session).
  const [openSession, setOpenSession] = useState<CvAiChatSession | null>(null);
  const [turns, setTurns] = useState<CvAiChatTurn[] | null>(null);
  const [turnsLoading, setTurnsLoading] = useState(false);
  const [inspectingTurnId, setInspectingTurnId] = useState<string | null>(null);

  const inspectingTurnIndex = turns ? turns.findIndex((t) => t.id === inspectingTurnId) : -1;
  const inspectingTurn = inspectingTurnIndex >= 0 && turns ? turns[inspectingTurnIndex] : null;
  const prevTurnForInspector = inspectingTurnIndex > 0 && turns ? turns[inspectingTurnIndex - 1] : null;

  const fetchSessions = async (query: string, pg: number, type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chats?search=${encodeURIComponent(query)}&page=${pg}&type=${type}`);
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

  // We track previous parameters to debounce search slightly or skip initial SSR load
  useEffect(() => {
    if (page === initialPage && search === initialSearch && activeTab === initialType) {
      setSessions(initialData.sessions);
      setTotal(initialData.total);
      setPageSize(initialData.pageSize);
      return;
    }

    const handler = setTimeout(() => {
      fetchSessions(search, page, activeTab);
    }, 400);
    return () => clearTimeout(handler);
  }, [page, search, activeTab, initialPage, initialSearch, initialType, initialData]);

  // Reset page to 1 when search or tab changes
  useEffect(() => {
    if (search !== initialSearch || activeTab !== initialType) {
      setPage(1);
    }
  }, [search, activeTab, initialSearch, initialType]);

  const openTranscript = async (session: CvAiChatSession) => {
    setOpenSession(session);
    setTurns(null);
    setTurnsLoading(true);
    setInspectingTurnId(null);
    try {
      const encodedId = encodeURIComponent(session.sessionId);
      const res = await fetch(`/api/admin/chats/${encodedId}`);
      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errPayload.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setTurns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load transcript:", err);
      setTurns([]);
    } finally {
      setTurnsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-6 p-1 bg-slate-200/60 rounded-xl w-fit">
        {(['resume', 'linkedin', 'github'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs transition-colors"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => fetchSessions(search, page, activeTab)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 shadow-xs rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh chat logs"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-xs rounded-xl">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">{total} conversations</span>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${loading ? "opacity-60" : ""}`}>
        {loading && sessions.length === 0 ? (
          <div className="text-center py-16 text-slate-500 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
            Loading conversations...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">No AI chats found</p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[650px] text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-200 bg-slate-50/90 backdrop-blur text-left">
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">User</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">First message</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">Turns</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">Started</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap text-right">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s, idx) => (
                  <tr key={`${s.sessionId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 max-w-[170px]">
                      <div className="font-semibold text-slate-900 truncate">{s.student.name}</div>
                      <div className="text-slate-500 text-xs truncate">{s.student.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[320px]">
                      <span className="line-clamp-2 text-xs leading-relaxed">{s.firstMessage}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                        {s.turnCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(s.startedAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openTranscript(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
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
        <div className="flex items-center justify-between mt-6 text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} &middot; {total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchSessions(search, page - 1, activeTab)}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => fetchSessions(search, page + 1, activeTab)}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-xs cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Transcript modal / drawer with LLM Inspector */}
      {openSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 sm:p-4"
          onClick={() => { setOpenSession(null); setInspectingTurnId(null); }}
        >
          <div
            className={`w-full ${inspectingTurn ? 'max-w-6xl' : 'max-w-2xl'} h-[88vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 truncate">{openSession.student.name}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {activeTab}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {openSession.student.email} &middot; {formatDateTime(openSession.startedAt)}
                </p>
              </div>
              <button
                onClick={() => { setOpenSession(null); setInspectingTurnId(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Body: Chat left + Inspector right */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              {/* Chat column */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                {turnsLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mb-3 text-blue-600" />
                    <p className="text-sm">Loading transcript...</p>
                  </div>
                )}
                
                {turns?.length === 0 && !turnsLoading && (
                  <p className="text-sm text-slate-500 text-center py-10">No messages in this conversation.</p>
                )}
                
                {turns?.map((t) => (
                  <div key={t.id} className="space-y-3">
                    {/* User Bubble */}
                    <div className="flex justify-end">
                      <div
                        className={`max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-xs ${
                          t.isAutoFit
                            ? "bg-slate-100 text-slate-600 italic border border-slate-200"
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
                    
                    {/* AI Bubble & Inspector Trigger */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] space-y-2">
                        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-slate-100 text-slate-800 border border-slate-200 shadow-xs">
                          {t.aiReply}
                        </div>

                        {/* Inspector Action & Telemetry Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setInspectingTurnId(inspectingTurnId === t.id ? null : t.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              inspectingTurnId === t.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                            }`}
                            title="Inspect LLM raw response, diff, and parse status"
                          >
                            <Terminal className={`w-3.5 h-3.5 ${inspectingTurnId === t.id ? 'text-white' : 'text-blue-600'}`} />
                            <span>Inspect LLM Turn</span>
                          </button>

                          {t.parseSuccess === false && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              ⚠️ Parse Failed
                            </span>
                          )}

                          {t.tokens && (
                            <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200/60">
                              {t.tokens} tok
                            </span>
                          )}

                          {t.latencyMs && (
                            <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200/60">
                              {(t.latencyMs / 1000).toFixed(1)}s
                            </span>
                          )}

                          {t.error && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold" title={t.error}>
                              ⚠️ Alert
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 text-center font-medium">{formatDateTime(t.createdAt)}</p>
                  </div>
                ))}
              </div>

              {/* Inspector Column */}
              {inspectingTurn && (
                <div className="w-full md:w-[450px] lg:w-[500px] shrink-0 h-full border-t md:border-t-0 md:border-l border-slate-200 overflow-hidden flex flex-col bg-slate-50 animate-in slide-in-from-right-4 duration-200">
                  <LlmTurnInspector
                    turn={inspectingTurn}
                    prevTurn={prevTurnForInspector}
                    builderType={activeTab}
                    onClose={() => setInspectingTurnId(null)}
                    allTurns={turns || []}
                    turnIndex={inspectingTurnIndex}
                    onSelectTurnIndex={(idx) => {
                      if (turns && turns[idx]) {
                        setInspectingTurnId(turns[idx].id);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
