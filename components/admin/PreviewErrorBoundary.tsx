'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Copy, Check, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackData?: any;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class PreviewErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[PreviewErrorBoundary caught render error]:', error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, copied: false });
    }
  }

  private handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      const jsonString = this.props.fallbackData
        ? typeof this.props.fallbackData === 'string'
          ? this.props.fallbackData
          : JSON.stringify(this.props.fallbackData, null, 2)
        : '';

      return (
        <div className="p-4 space-y-3 bg-white rounded-xl border border-amber-200 shadow-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Visual Preview Fallback Triggered</span>
            </div>
            <p className="leading-relaxed text-amber-700/90">
              This historical turn payload cannot be visually rendered by the preview engine (unexpected or deprecated schema structure).
              Displaying the raw turn snapshot below:
            </p>
            {this.state.error && (
              <p className="text-[11px] font-mono text-amber-800/80 pt-1 border-t border-amber-200/60 break-all">
                {this.state.error.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              Raw Snapshot JSON
            </span>
            {jsonString && (
              <button
                type="button"
                onClick={() => this.handleCopy(jsonString)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                {this.state.copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{this.state.copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {jsonString ? (
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-[500px]">
              {jsonString}
            </pre>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-4">No snapshot payload available.</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
