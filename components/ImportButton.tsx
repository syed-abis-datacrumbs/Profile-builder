'use client';

import React from 'react';
import { Upload } from 'lucide-react';

export interface ImportButtonProps {
  onClick?: () => void;
  title?: string;
  className?: string;
  variant?: 'toolbar' | 'landing';
}

/**
 * Standardized Import button for MOMENTUM.
 * - 'toolbar' (default): Displayed in studio headers without text (icon only, h-7 w-7).
 * - 'landing': Displayed in landing views inside the prompt bar.
 */
export const ImportButton: React.FC<ImportButtonProps> = ({
  onClick,
  title = 'Import from PDF or GitHub',
  className = '',
  variant = 'toolbar',
}) => {
  if (!onClick) return null;

  if (variant === 'landing') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${className}`.trim()}
        title={title}
      >
        <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="hidden sm:inline">PDF / GitHub</span>
        <span className="sm:hidden">Import</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 w-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200/80 flex items-center justify-center shrink-0 cursor-pointer ${className}`.trim()}
      title={title}
      aria-label={title}
    >
      <Upload className="w-3.5 h-3.5 text-slate-700 shrink-0" />
    </button>
  );
};

export const StudioImportButton = ImportButton;
export default ImportButton;
