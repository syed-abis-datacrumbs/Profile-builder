'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Terminal,
  Eye,
  Copy,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { CvPreview } from '@/components/CvPreview';
import { GithubReadmePreview } from '@/components/GithubReadmePreview';
import { LinkedinCardPreview } from '@/components/admin/LinkedinCardPreview';
import { PreviewErrorBoundary } from '@/components/admin/PreviewErrorBoundary';
import {
  normalizeCvData,
  normalizeGithubData,
  normalizeLinkedinData,
} from '@/lib/admin/previewNormalizers';
import type { CvAiChatTurn } from '@/app/admin/chats/CvAiChatsClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  turns: CvAiChatTurn[];
  activeTurnIndex: number;
  onSelectTurnIndex: (index: number) => void;
  builderType: 'resume' | 'linkedin' | 'github';
}

export function TurnPreviewModal({
  isOpen,
  onClose,
  turns,
  activeTurnIndex,
  onSelectTurnIndex,
  builderType,
}: Props) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview');
  const [copied, setCopied] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const currentTurn = turns[activeTurnIndex] || null;
  const canPrev = activeTurnIndex > 0;
  const canNext = activeTurnIndex < turns.length - 1;

  // Extract raw payload
  const rawPayload = currentTurn?.rawOutput?.cv || currentTurn?.rawOutput?.github || currentTurn?.rawOutput?.profile || null;
  const jsonDisplay = rawPayload ? JSON.stringify(rawPayload, null, 2) : currentTurn?.rawText || '';

  // Normalized data for safe rendering
  const normalizedData = useMemo(() => {
    if (!rawPayload) return null;
    if (builderType === 'resume') return normalizeCvData(rawPayload);
    if (builderType === 'github') return normalizeGithubData(rawPayload);
    if (builderType === 'linkedin') return normalizeLinkedinData(rawPayload);
    return null;
  }, [rawPayload, builderType]);

  // Scoped keyboard shortcuts: ONLY active when modal is open, and never inside form controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an interactive form element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (activeTurnIndex > 0) {
          e.preventDefault();
          onSelectTurnIndex(activeTurnIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (activeTurnIndex < turns.length - 1) {
          e.preventDefault();
          onSelectTurnIndex(activeTurnIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeTurnIndex, turns.length, onClose, onSelectTurnIndex]);

  // Focus modal container on open for keyboard containment
  useEffect(() => {
    if (isOpen && modalContainerRef.current) {
      modalContainerRef.current.focus();
    }
  }, [isOpen]);

  const handleCopyJson = () => {
    if (!jsonDisplay) return;
    navigator.clipboard.writeText(jsonDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !currentTurn) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Time Travel Artifact Preview"
      ref={modalContainerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md text-slate-100 outline-none animate-in fade-in duration-150"
    >
      {/* Top Navbar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 gap-4">
        {/* Left: Title & Turn Scrubber */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
              {builderType}
            </span>
            <span className="text-sm font-bold text-slate-200 hidden sm:inline">Time-Travel Preview</span>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 gap-1">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => onSelectTurnIndex(activeTurnIndex - 1)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Turn (ArrowLeft)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-mono font-bold text-slate-300 select-none">
              Turn {activeTurnIndex + 1} / {turns.length}
            </span>

            <button
              type="button"
              disabled={!canNext}
              onClick={() => onSelectTurnIndex(activeTurnIndex + 1)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Turn (ArrowRight)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* User message snippet */}
          <div className="text-xs text-slate-400 truncate max-w-xs md:max-w-md hidden lg:block">
            <span className="text-slate-500 font-semibold">Prompt:</span> &ldquo;{currentTurn.userMessage}&rdquo;
          </div>
        </div>

        {/* Right Controls: View mode, Zoom, Close */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'json'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>

          {/* Zoom controls (for visual preview) */}
          {viewMode === 'preview' && (
            <div className="hidden sm:flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300 select-none">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-900/50">
        {viewMode === 'json' ? (
          <div className="w-full max-w-4xl bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col gap-3 shadow-2xl h-fit">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-400" />
                Turn {activeTurnIndex + 1} Raw Snapshot Payload
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {jsonDisplay || 'No snapshot recorded for this turn.'}
            </pre>
          </div>
        ) : (
          <div
            className="transition-transform duration-100 ease-out origin-top w-full max-w-5xl"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <PreviewErrorBoundary fallbackData={rawPayload} resetKey={currentTurn.id}>
              {!normalizedData ? (
                <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl max-w-md mx-auto space-y-3">
                  <Terminal className="w-8 h-8 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No Structured Snapshot Available</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This turn did not produce a structured JSON snapshot. Check the JSON tab to view the conversational reply text.
                  </p>
                </div>
              ) : builderType === 'resume' ? (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-[800px] mx-auto border border-slate-300 text-slate-900">
                  <CvPreview data={normalizedData as any} />
                </div>
              ) : builderType === 'github' ? (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl max-w-4xl mx-auto">
                  <GithubReadmePreview github={normalizedData as any} editable={false} />
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <LinkedinCardPreview profile={normalizedData as any} />
                </div>
              )}
            </PreviewErrorBoundary>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="h-12 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span>Navigate with</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
            →
          </kbd>
          <span className="hidden sm:inline">&middot; Press</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
            Esc
          </kbd>
          <span className="hidden sm:inline">to close</span>
        </div>

        <div>
          <span>Model: <span className="font-mono text-slate-300">{currentTurn.model || 'gpt-4o-mini'}</span></span>
          {currentTurn.tokens && <span className="ml-3 font-mono">{currentTurn.tokens} tokens</span>}
        </div>
      </div>
    </div>
  );
}
