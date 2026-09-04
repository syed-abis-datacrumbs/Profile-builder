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
  UserPlus,
  Calendar,
  ArrowUpRight,
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

type SignupData = {
  totalUsers: number;
  signups7d: number;
  signups14d: number;
  signups30d: number;
  peakDay: { label: string; count: number };
  averageDaily: number;
  days: Array<{
    date: string;
    label: string;
    count: number;
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
  signups?: SignupData;
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
  const [signupRange, setSignupRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; count: number; x: number; y: number } | null>(null);

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

  // User Signups Graph computations
  const signups = data?.signups;
  const allSignupDays = signups?.days || [];
  const displaySignupDays =
    signupRange === '7d'
      ? allSignupDays.slice(-7)
      : signupRange === '14d'
      ? allSignupDays.slice(-14)
      : allSignupDays.slice(-30);

  const rangeSignupsTotal = displaySignupDays.reduce((acc, d) => acc + d.count, 0);
  const rangeDailyAvg = displaySignupDays.length > 0
    ? (rangeSignupsTotal / displaySignupDays.length).toFixed(1)
    : '0.0';

  const maxSignupCount = Math.max(...displaySignupDays.map((d) => d.count), 4);
  const svgWidth = 900;
  const svgHeight = 170;
  const padX = 40;
  const padTop = 25;
  const padBottom = 25;
  const plotWidth = svgWidth - padX * 2;
  const plotHeight = svgHeight - padTop - padBottom;

  const graphPoints = displaySignupDays.map((d, i) => {
    const x = padX + (displaySignupDays.length > 1 ? (i / (displaySignupDays.length - 1)) * plotWidth : plotWidth / 2);
    const y = padTop + plotHeight - (d.count / maxSignupCount) * plotHeight;
    return { x, y, data: d };
  });

  const linePath = graphPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaPath = graphPoints.length > 0
    ? `${linePath} L ${graphPoints[graphPoints.length - 1].x},${padTop + plotHeight} L ${graphPoints[0].x},${padTop + plotHeight} Z`
    : '';

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

      {/* ── User Signups Growth Graph ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                User Signups & Registration Growth
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Momentum Users
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Daily new Momentum users and platform adoption momentum over time
            </p>
          </div>

          {/* Time Range Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSignupRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  signupRange === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <p className="text-[11px] text-slate-400 font-medium">Total Momentum Users</p>
            <p className="text-xl font-extrabold text-white font-mono mt-0.5">
              {loading ? '...' : signups?.totalUsers ?? stats?.totalUsersCount ?? 0}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <p className="text-[11px] text-slate-400 font-medium">New in Selected Period</p>
            <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              +{loading ? '...' : rangeSignupsTotal}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <p className="text-[11px] text-slate-400 font-medium">Daily Average</p>
            <p className="text-xl font-extrabold text-blue-400 font-mono mt-0.5">
              {loading ? '...' : rangeDailyAvg} <span className="text-xs font-normal text-slate-400">/ day</span>
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <p className="text-[11px] text-slate-400 font-medium">Peak Day</p>
            <p className="text-base font-bold text-purple-300 truncate mt-1">
              {signups?.peakDay?.count ? `${signups.peakDay.count} on ${signups.peakDay.label}` : 'None'}
            </p>
          </div>
        </div>

        {/* SVG Graph Container */}
        {loading ? (
          <div className="h-48 bg-slate-950/50 rounded-xl flex items-center justify-center animate-pulse">
            <div className="h-6 w-32 bg-slate-800 rounded" />
          </div>
        ) : displaySignupDays.length === 0 ? (
          <div className="h-48 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
            <UserPlus className="w-8 h-8 mb-2 opacity-40" />
            No registration data available in this time window
          </div>
        ) : (
          <div className="relative pt-6 pb-2">
            {/* Tooltip Float Overlay */}
            {hoveredPoint && (
              <div
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${hoveredPoint.y - 15}px`,
                }}
                className="absolute -translate-x-1/2 -translate-y-full bg-slate-950 border border-blue-500/60 shadow-2xl rounded-xl px-3 py-2 pointer-events-none z-30 whitespace-nowrap transition-all duration-75"
              >
                <p className="text-[10px] text-slate-400 font-medium">{hoveredPoint.label}</p>
                <p className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  +{hoveredPoint.count} new {hoveredPoint.count === 1 ? 'signup' : 'signups'}
                </p>
              </div>
            )}

            {/* SVG Graph */}
            <div className="w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-44 sm:h-52 select-none overflow-visible"
              >
                <defs>
                  <linearGradient id="signupAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="90%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="signupLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0, 0.33, 0.66, 1].map((ratio) => {
                  const y = padTop + plotHeight - ratio * plotHeight;
                  const val = Math.round(ratio * maxSignupCount);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={svgWidth - padX}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray="4 4"
                        strokeOpacity="0.4"
                      />
                      <text
                        x={padX - 8}
                        y={y + 3}
                        fill="#64748b"
                        fontSize="10"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Area Fill */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill="url(#signupAreaGrad)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Main Stroke Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#signupLineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Active Hover Guideline & Indicator */}
                {hoveredPoint && (
                  <g>
                    <line
                      x1={hoveredPoint.x}
                      y1={padTop}
                      x2={hoveredPoint.x}
                      y2={padTop + plotHeight}
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="7"
                      fill="#3b82f6"
                      opacity="0.3"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="4.5"
                      fill="#60a5fa"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                )}

                {/* Data Points on Line */}
                {graphPoints.map((pt) => {
                  const hasSignups = pt.data.count > 0;
                  return (
                    <circle
                      key={pt.data.date}
                      cx={pt.x}
                      cy={pt.y}
                      r={hasSignups ? 3.5 : 2}
                      fill={hasSignups ? '#60a5fa' : '#475569'}
                      stroke={hasSignups ? '#1e293b' : 'transparent'}
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Invisible Hover Overlay Columns */}
                {graphPoints.map((pt) => {
                  const colW = plotWidth / (graphPoints.length || 1);
                  return (
                    <rect
                      key={pt.data.date}
                      x={pt.x - colW / 2}
                      y={padTop}
                      width={colW}
                      height={plotHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          label: pt.data.label,
                          count: pt.data.count,
                          x: pt.x,
                          y: pt.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* X-Axis Date Labels */}
            <div className="flex justify-between items-center px-6 pt-2 text-[10px] text-slate-400 font-mono">
              {displaySignupDays
                .filter((_, i) => {
                  if (displaySignupDays.length <= 7) return true;
                  if (displaySignupDays.length <= 14) return i % 2 === 0 || i === displaySignupDays.length - 1;
                  return i % 4 === 0 || i === displaySignupDays.length - 1;
                })
                .map((d) => (
                  <span key={d.date}>{d.label}</span>
                ))}
            </div>
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
