'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  ExternalLink,
  Activity,
  Globe,
  Radio,
  Layers,
  MessageSquare,
  FileText,
  Smartphone,
  Laptop,
  Tablet,
  RefreshCw,
  Users,
  Compass,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

type RealtimeData = {
  activeNow: number;
  active30m: number;
  activeToday: number;
  countries: Array<{
    country: string;
    countryCode: string;
    flag: string;
    count: number;
    pct: number;
  }>;
  tools: Array<{
    tool: string;
    label: string;
    count: number;
    pct: number;
  }>;
  devices: Array<{
    device: string;
    count: number;
    pct: number;
  }>;
  recentVisitors: Array<{
    id: string;
    path: string;
    tool: string;
    country: string;
    countryCode: string;
    flag: string;
    device: string;
    lastActive: string;
  }>;
};

type TrafficApiResponse = {
  gaConfig: {
    streamName: string;
    streamUrl: string;
    links: {
      realtime: string;
      acquisition: string;
      engagement: string;
      tech: string;
      demographics: string;
    };
  };
  realtime: RealtimeData;
  stats: {
    totalChats: number;
    todayChats: number;
    resumeChats: number;
    githubChats: number;
    linkedinChats: number;
    totalResumes: number;
    totalGithubSaves: number;
    totalLinkedinSaves: number;
    totalUsersCount: number;
    totalUnlockedCount: number;
  };
};

export default function AdminTrafficPage() {
  const [data, setData] = useState<TrafficApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrafficData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/traffic');
      if (!res.ok) throw new Error('Failed to fetch');
      const json: TrafficApiResponse = await res.json();
      setData(json);
      setLastUpdated(new Date());
      if (isManual) toast.success('Traffic data updated');
    } catch (err) {
      console.error('Failed to load traffic stats:', err);
      if (isManual) toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  // Live auto-polling every 12 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTrafficData();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTrafficData]);

  const realtime = data?.realtime;
  const stats = data?.stats;

  // Formatting time ago
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 10) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      return `${diffHours}h ago`;
    } catch {
      return 'Recently';
    }
  };

  const topCountry = realtime?.countries?.[0];

  const totalToolChats =
    (stats?.resumeChats ?? 0) +
    (stats?.githubChats ?? 0) +
    (stats?.linkedinChats ?? 0) || 1;

  const resumeChatPct = Math.round(((stats?.resumeChats ?? 0) / totalToolChats) * 100);
  const githubChatPct = Math.round(((stats?.githubChats ?? 0) / totalToolChats) * 100);
  const linkedinChatPct = Math.round(((stats?.linkedinChats ?? 0) / totalToolChats) * 100);

  const totalSaves =
    (stats?.totalResumes ?? 0) +
    (stats?.totalGithubSaves ?? 0) +
    (stats?.totalLinkedinSaves ?? 0) || 1;

  const resumeSavePct = Math.round(((stats?.totalResumes ?? 0) / totalSaves) * 100);
  const githubSavePct = Math.round(((stats?.totalGithubSaves ?? 0) / totalSaves) * 100);
  const linkedinSavePct = Math.round(((stats?.totalLinkedinSaves ?? 0) / totalSaves) * 100);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Traffic & Real-Time Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Pulse
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time active visitors, locations, and tool usage across Profile Builder without leaving the dashboard.
          </p>
        </div>

        {/* Live Actions & Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle automatic refresh every 12 seconds"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => fetchTrafficData(true)}
            disabled={refreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <a
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow hover:shadow-blue-500/20"
          >
            <span>Google Analytics</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── Real-Time Hero Metrics (30m & Live Now) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Right Now */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Active Right Now
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-4xl font-extrabold text-white font-mono">
              {loading ? '...' : realtime?.activeNow ?? 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Users browsing in the last 5 minutes</p>
          </div>
        </div>

        {/* Active in Last 30 Min */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Users (30 Min)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-4xl font-extrabold text-white font-mono">
              {loading ? '...' : realtime?.active30m ?? 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Standard GA real-time window</p>
          </div>
        </div>

        {/* Unique Visitors Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Visitors Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-4xl font-extrabold text-white font-mono">
              {loading ? '...' : realtime?.activeToday ?? 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Unique visitors since midnight</p>
          </div>
        </div>

        {/* Top Active Country */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Top Country
            </span>
            <span className="text-2xl">{topCountry?.flag || '🌍'}</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white truncate">
              {loading ? '...' : topCountry?.country || 'Global'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {topCountry ? `${topCountry.count} active (${topCountry.pct}%)` : 'Monitoring visitors'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Real-time Countries & Active Tools ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Countries Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-blue-400" />
                  Active Users by Country
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live visitor distribution detected from IP & CDN headers
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Real-time (30m)
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 bg-slate-800/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !realtime?.countries || realtime.countries.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Globe className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" />
                <p className="text-sm font-medium">Waiting for live visitor pings...</p>
                <p className="text-xs text-slate-600 mt-1">Active users will appear here as they browse.</p>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                {realtime.countries.map((c) => (
                  <div key={c.country} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        {c.country}
                      </span>
                      <span className="text-slate-400 font-mono">
                        <strong className="text-white">{c.count}</strong> {c.count === 1 ? 'user' : 'users'} ({c.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(c.pct, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lastUpdated && (
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              <span>Automatic Geo-detection active</span>
            </div>
          )}
        </div>

        {/* Real-time Active Tools & Devices Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-indigo-400" />
                  Active Users by Tool & Page
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Where users are currently active across Momentum
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Real-time (30m)
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 bg-slate-800/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !realtime?.tools || realtime.tools.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Layers className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" />
                <p className="text-sm font-medium">No tool sessions recorded in last 30 min</p>
                <p className="text-xs text-slate-600 mt-1">Visits to Resume, GitHub, or LinkedIn tools will show here.</p>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                {realtime.tools.map((t) => (
                  <div key={t.tool} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            t.tool === 'resume'
                              ? 'bg-blue-500'
                              : t.tool === 'github'
                              ? 'bg-purple-500'
                              : t.tool === 'linkedin'
                              ? 'bg-indigo-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        {t.label}
                      </span>
                      <span className="text-slate-400 font-mono">
                        <strong className="text-white">{t.count}</strong> {t.count === 1 ? 'user' : 'users'} ({t.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.tool === 'resume'
                            ? 'bg-blue-500'
                            : t.tool === 'github'
                            ? 'bg-purple-500'
                            : t.tool === 'linkedin'
                            ? 'bg-indigo-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(t.pct, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Devices Breakdown (Inline) */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                Active Devices
              </span>
              <div className="flex items-center gap-3 font-mono text-slate-400">
                {(realtime?.devices || []).map((d) => (
                  <span key={d.device} className="flex items-center gap-1">
                    {d.device === 'Mobile' ? (
                      <Smartphone className="w-3 h-3 text-slate-400" />
                    ) : (
                      <Laptop className="w-3 h-3 text-slate-400" />
                    )}
                    {d.device}: <strong className="text-white">{d.pct}%</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Recent Visitor Activity Stream ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              Live Visitor Activity Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time feed of recent visitor pulses across the platform
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Realtime Feed
          </span>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !realtime?.recentVisitors || realtime.recentVisitors.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No visitor pulses recorded yet. Once users visit momentum.datacrumbs.org, they will stream in real-time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Country / Location</th>
                  <th className="py-2.5 px-3">Active Tool</th>
                  <th className="py-2.5 px-3">Page / Path</th>
                  <th className="py-2.5 px-3">Device</th>
                  <th className="py-2.5 px-3 text-right">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {realtime.recentVisitors.map((v) => {
                  const isVeryRecent = Date.now() - new Date(v.lastActive).getTime() < 300000;
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isVeryRecent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                            }`}
                          />
                          <span className={isVeryRecent ? 'text-emerald-300' : 'text-slate-400'}>
                            {isVeryRecent ? 'Active' : 'Idle'}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200 whitespace-nowrap">
                        <span className="mr-1.5">{v.flag}</span>
                        {v.country}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {v.tool}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 truncate max-w-[200px]">
                        {v.path}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {v.device === 'Mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          {v.device}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono whitespace-nowrap">
                        {formatTimeAgo(v.lastActive)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Platform Usage & Saved Creations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Activity Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-blue-400" />
                AI Tool Activity Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total AI conversations across Profile Builder tools
              </p>
            </div>
            <span className="text-xl font-bold text-white font-mono">
              {loading ? '...' : stats?.totalChats ?? 0}
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Resume AI Studio
                </span>
                <span className="text-slate-400 font-mono">
                  {stats?.resumeChats ?? 0} ({resumeChatPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${resumeChatPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  GitHub README AI
                </span>
                <span className="text-slate-400 font-mono">
                  {stats?.githubChats ?? 0} ({githubChatPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${githubChatPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  LinkedIn AI Studio
                </span>
                <span className="text-slate-400 font-mono">
                  {stats?.linkedinChats ?? 0} ({linkedinChatPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${linkedinChatPct}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Chats generated today</span>
            <span className="font-bold text-emerald-400 font-mono">
              +{stats?.todayChats ?? 0} today
            </span>
          </div>
        </div>

        {/* Saved Profiles Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-emerald-400" />
                Saved Profiles & Creations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Profiles saved across user accounts
              </p>
            </div>
            <span className="text-xl font-bold text-white font-mono">
              {loading
                ? '...'
                : (stats?.totalResumes ?? 0) +
                  (stats?.totalGithubSaves ?? 0) +
                  (stats?.totalLinkedinSaves ?? 0)}
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Saved Resumes
                </span>
                <span className="text-slate-400 font-mono">
                  {stats?.totalResumes ?? 0} ({resumeSavePct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${resumeSavePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  Saved GitHub Profiles
                </span>
                <span className="text-slate-400 font-mono">
                  {stats?.totalGithubSaves ?? 0} ({githubSavePct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${githubSavePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Saved LinkedIn Profiles
                </span>
                <span className="text-slate-400 font-mono">
                  {stats?.totalLinkedinSaves ?? 0} ({linkedinSavePct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${linkedinSavePct}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Unlocked Pro Users</span>
            <span className="font-bold text-blue-400 font-mono">
              {stats?.totalUnlockedCount ?? 0} unlocked
            </span>
          </div>
        </div>
      </div>

      {/* ── Google Analytics Quick Launch (For Deep Historical Analysis) ── */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              Google Analytics Console Reports
            </h4>
            <p className="text-xs text-slate-400">
              For deep multi-month cohort retention and search engine acquisition analysis
            </p>
          </div>
          <span className="text-[11px] text-slate-500">Google Analytics 4 Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Live Realtime', href: data?.gaConfig?.links?.realtime },
            { label: 'Traffic Acquisition', href: data?.gaConfig?.links?.acquisition },
            { label: 'Pages & Tool Views', href: data?.gaConfig?.links?.engagement },
            { label: 'Tech & Devices', href: data?.gaConfig?.links?.tech },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href || 'https://analytics.google.com/analytics/web/'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between group"
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
