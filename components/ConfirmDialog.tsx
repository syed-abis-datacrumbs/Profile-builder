'use client';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Styled confirm popup — ported directly from the LMS's CV Builder
 * ConfirmDialog (src/app/student/cv-generator/ConfirmDialog.tsx), same
 * illustrated layout: blurred backdrop, white rounded card, top-right X,
 * centered illustration circle, then title/message/buttons.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/50" onClick={onCancel} />

      <div className="relative bg-white rounded-3xl p-7 max-w-xs w-full shadow-2xl text-center">
        <button
          onClick={onCancel}
          className="absolute top-3.5 right-3.5 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 mt-2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/resume-popup-icon.png" alt="" className="w-full h-full object-cover" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">{message}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
