'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  FileCode,
  CheckCircle2,
  XCircle,
  Database,
  Eye,
  Maximize2,
} from 'lucide-react';
import type { CvAiChatTurn } from '@/app/admin/chats/CvAiChatsClient';
import { CvPreview } from '@/components/CvPreview';
import { GithubReadmePreview } from '@/components/GithubReadmePreview';
import { LinkedinCardPreview } from '@/components/admin/LinkedinCardPreview';
import { PreviewErrorBoundary } from '@/components/admin/PreviewErrorBoundary';
import { TurnPreviewModal } from '@/components/admin/TurnPreviewModal';
import {
  normalizeCvData,
  normalizeGithubData,
  normalizeLinkedinData,
} from '@/lib/admin/previewNormalizers';

interface LlmTurnInspectorProps {
  turn: CvAiChatTurn;
  prevTurn: CvAiChatTurn | null;
  builderType: 'resume' | 'linkedin' | 'github';
  onClose: () => void;
  allTurns?: CvAiChatTurn[];
  turnIndex?: number;
  onSelectTurnIndex?: (index: number) => void;
}

interface ChangeItem {
  section: string;
  type: 'added' | 'removed' | 'modified' | string;
  summary: string;
  items?: string[];
}

export function LlmTurnInspector({
  turn,
  prevTurn,
  builderType,
  onClose,
  allTurns,
  turnIndex,
  onSelectTurnIndex,
}: LlmTurnInspectorProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'diff' | 'raw' | 'snapshot'>('preview');
  const [previewScale, setPreviewScale] = useState<number>(55);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currData = turn.rawOutput?.cv || turn.rawOutput?.github || turn.rawOutput?.profile || null;
  const prevData = prevTurn?.rawOutput?.cv || prevTurn?.rawOutput?.github || prevTurn?.rawOutput?.profile || null;

  // Normalized safe data for visual renderers
  const normalizedCv = useMemo(() => (builderType === 'resume' && currData ? normalizeCvData(currData) : null), [currData, builderType]);
  const normalizedGithub = useMemo(() => (builderType === 'github' && currData ? normalizeGithubData(currData) : null), [currData, builderType]);
  const normalizedLinkedin = useMemo(() => (builderType === 'linkedin' && currData ? normalizeLinkedinData(currData) : null), [currData, builderType]);

  // Lazy compute diff between this turn and previous turn
  const computeDiff = (): {
    hasData: boolean;
    changes: ChangeItem[];
    isIdentical: boolean;
    isInitial: boolean;
  } => {
    if (!currData && !turn.rawText) {
      return {
        hasData: false,
        changes: [],
        isIdentical: false,
        isInitial: false,
      };
    }

    if (!prevData && currData) {
      return {
        hasData: true,
        changes: [{ section: 'Session Start', type: 'added', summary: 'Initial state established for this conversation' }],
        isIdentical: false,
        isInitial: true,
      };
    }

    const changes: ChangeItem[] = [];

    if (builderType === 'resume' && currData && prevData) {
      // 1. Personal Info
      const pPrev = prevData.personalInfo || {};
      const pCurr = currData.personalInfo || {};
      const pDiffs: string[] = [];
      for (const key of ['fullName', 'email', 'phone', 'linkedin', 'github', 'kaggle'] as const) {
        if ((pPrev[key] || '') !== (pCurr[key] || '')) {
          pDiffs.push(`${key}: "${pPrev[key] || ''}" → "${pCurr[key] || ''}"`);
        }
      }
      if (pDiffs.length > 0) {
        changes.push({ section: 'Personal Info', type: 'modified', summary: `${pDiffs.length} field(s) updated`, items: pDiffs });
      }

      // 2. Array sections
      const arraySections = [
        { key: 'projects', label: 'Projects', nameFn: (item: any) => item.title || item.name || 'Untitled Project' },
        { key: 'workExperience', label: 'Work Experience', nameFn: (item: any) => `${item.role || 'Role'} at ${item.company || 'Company'}` },
        { key: 'education', label: 'Education', nameFn: (item: any) => `${item.degree || 'Degree'} (${item.institution || 'School'})` },
        { key: 'certifications', label: 'Certifications', nameFn: (item: any) => `${item.name || 'Certificate'} from ${item.organization || 'Org'}` },
      ];

      for (const sec of arraySections) {
        const arrPrev = Array.isArray(prevData[sec.key]) ? prevData[sec.key] : [];
        const arrCurr = Array.isArray(currData[sec.key]) ? currData[sec.key] : [];

        if (arrCurr.length > arrPrev.length) {
          const added = arrCurr.slice(arrPrev.length);
          changes.push({
            section: sec.label,
            type: 'added',
            summary: `+${arrCurr.length - arrPrev.length} item(s) added`,
            items: added.map(sec.nameFn),
          });
        } else if (arrCurr.length < arrPrev.length) {
          changes.push({
            section: sec.label,
            type: 'removed',
            summary: `-${arrPrev.length - arrCurr.length} item(s) removed`,
          });
        } else {
          const diffItems: string[] = [];
          for (let i = 0; i < arrCurr.length; i++) {
            if (JSON.stringify(arrCurr[i]) !== JSON.stringify(arrPrev[i])) {
              diffItems.push(`Modified: ${sec.nameFn(arrCurr[i])}`);
            }
          }
          if (diffItems.length > 0) {
            changes.push({
              section: sec.label,
              type: 'modified',
              summary: `${diffItems.length} item(s) updated`,
              items: diffItems,
            });
          }
        }
      }

      // 3. Skills
      const sPrev = prevData.additional?.skills || '';
      const sCurr = currData.additional?.skills || '';
      if (sPrev !== sCurr) {
        changes.push({
          section: 'Skills',
          type: 'modified',
          summary: 'Technical skills list updated',
          items: [`Was: "${sPrev.slice(0, 100)}${sPrev.length > 100 ? '…' : ''}"`, `Now: "${sCurr.slice(0, 100)}${sCurr.length > 100 ? '…' : ''}"`],
        });
      }
    } else if (currData && prevData) {
      // Generic comparison
      for (const key of Object.keys(currData)) {
        if (JSON.stringify(currData[key]) !== JSON.stringify(prevData[key])) {
          changes.push({
            section: key,
            type: 'modified',
            summary: `Field "${key}" was updated`,
          });
        }
      }
    }

    const isIdentical = changes.length === 0 && Boolean(currData && prevData) && JSON.stringify(currData) === JSON.stringify(prevData);

    return {
      hasData: true,
      changes,
      isIdentical,
      isInitial: false,
    };
  };

  const diffResult = computeDiff();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawDisplayString = turn.rawText || (turn.rawOutput ? JSON.stringify(turn.rawOutput, null, 2) : '');
  const snapshotString = currData ? JSON.stringify(currData, null, 2) : '';

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">LLM Response Inspector</h3>
            <p className="text-[11px] text-slate-500 truncate">
              {turn.model || 'gpt-4o-mini'} &middot; {turn.latencyMs ? `${(turn.latencyMs / 1000).toFixed(2)}s` : 'Turn details'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
        {turn.parseSuccess === false ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Parse Failed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> JSON Valid
          </span>
        )}

        {turn.tokens && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-700 font-medium border border-slate-200 shadow-2xs">
            <Cpu className="w-3 h-3 text-slate-400" /> {turn.tokens.toLocaleString()} tokens
          </span>
        )}

        {turn.latencyMs && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-700 font-medium border border-slate-200 shadow-2xs">
            <Clock className="w-3 h-3 text-slate-400" /> {(turn.latencyMs / 1000).toFixed(2)}s
          </span>
        )}

        {turn.error && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Warning Logged
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 bg-white border-b border-slate-200 shrink-0 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'preview'
              ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Visual Preview
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'diff'
              ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Changes Diff
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'raw'
              ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          Raw Output
        </button>

        <button
          onClick={() => setActiveTab('snapshot')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'snapshot'
              ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Snapshot
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 0: VISUAL PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-3">
            {/* Header controls for preview */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {builderType} Preview
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  Read-Only
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Scale selection for resume */}
                {builderType === 'resume' && (
                  <select
                    value={previewScale}
                    onChange={(e) => setPreviewScale(Number(e.target.value))}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value={55}>Fit (55%)</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                  </select>
                )}

                {/* Expand to Fullscreen Modal Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                  title="Open Fullscreen Time-Travel Modal"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand</span>
                </button>
              </div>
            </div>

            {/* ErrorBoundary & Rendered Preview Component */}
            <PreviewErrorBoundary fallbackData={currData} resetKey={turn.id}>
              {!currData ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                  <Terminal className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                  <h4 className="text-sm font-bold text-slate-800">No Structured Snapshot Available</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    This turn did not record a structured {builderType} data object.
                  </p>
                </div>
              ) : builderType === 'resume' && normalizedCv ? (
                <div className="overflow-x-auto bg-slate-200/50 p-2 rounded-xl border border-slate-200">
                  <div
                    style={{
                      transform: `scale(${previewScale / 100})`,
                      transformOrigin: 'top left',
                      width: `${(100 / previewScale) * 100}%`,
                    }}
                    className="bg-white rounded-lg shadow-md border border-slate-200"
                  >
                    <CvPreview data={normalizedCv} />
                  </div>
                </div>
              ) : builderType === 'github' && normalizedGithub ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <GithubReadmePreview github={normalizedGithub} editable={false} />
                </div>
              ) : builderType === 'linkedin' && normalizedLinkedin ? (
                <div className="p-1">
                  <LinkedinCardPreview profile={normalizedLinkedin} />
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">Unrecognized snapshot payload.</p>
              )}
            </PreviewErrorBoundary>
          </div>
        )}

        {/* TAB 1: DIFF */}
        {activeTab === 'diff' && (
          <div className="space-y-4">
            {turn.error && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Parser / Validation Alert
                </div>
                <p className="font-mono">{turn.error}</p>
              </div>
            )}

            {!diffResult.hasData ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <Terminal className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                <h4 className="text-sm font-bold text-slate-800">No Structured Snapshot Available</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  This turn occurred before LLM response logging was activated or was a static guidance message. New chat turns will record and diff structured model outputs.
                </p>
              </div>
            ) : diffResult.isIdentical ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Warning: No Changes in Data Payload
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  The LLM generated a conversational reply, but the structured data object is <strong>identical</strong> to the previous turn.
                </p>
                <p className="text-[11px] text-rose-600">
                  This typically means the model said &quot;Done&quot; but failed to append or modify the targeted section in its JSON.
                </p>
              </div>
            ) : diffResult.isInitial ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 space-y-1">
                <span className="font-bold">Initial Turn</span>
                <p>This is the start of the session. Baseline data established.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detected Modifications ({diffResult.changes.length})
                </div>

                {diffResult.changes.map((c, i) => (
                  <div key={i} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{c.section}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.type === 'added'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.type === 'removed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {c.summary}
                      </span>
                    </div>

                    {c.items && c.items.length > 0 && (
                      <ul className="space-y-1 pl-3 border-l-2 border-slate-200 text-xs text-slate-600 font-mono">
                        {c.items.map((it, idx) => (
                          <li key={idx} className="break-words">
                            {it}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RAW MODEL OUTPUT */}
        {activeTab === 'raw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Raw Model String / Payload</span>
              {rawDisplayString && (
                <button
                  onClick={() => handleCopy(rawDisplayString)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            {rawDisplayString ? (
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-[500px]">
                {rawDisplayString}
              </pre>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No raw completion string recorded for this turn.</p>
            )}
          </div>
        )}

        {/* TAB 3: FULL SNAPSHOT */}
        {activeTab === 'snapshot' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Complete Turn State Snapshot</span>
              {snapshotString && (
                <button
                  onClick={() => handleCopy(snapshotString)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            {snapshotString ? (
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-[500px]">
                {snapshotString}
              </pre>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No structured data snapshot found.</p>
            )}
          </div>
        )}
      </div>

      {/* Option 2 Fullscreen Time-Travel Modal */}
      {isFullscreenModalOpen && (
        <TurnPreviewModal
          isOpen={isFullscreenModalOpen}
          onClose={() => setIsFullscreenModalOpen(false)}
          turns={allTurns && allTurns.length > 0 ? allTurns : [turn]}
          activeTurnIndex={turnIndex !== undefined && turnIndex >= 0 ? turnIndex : 0}
          onSelectTurnIndex={(idx) => {
            onSelectTurnIndex?.(idx);
          }}
          builderType={builderType}
        />
      )}
    </div>
  );
}
