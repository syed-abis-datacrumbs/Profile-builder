'use client';

import React from 'react';
import { Sparkles, MessageSquare, X, Send, Loader2, ArrowLeft, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MobileChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSend: (text?: string) => void;
  title?: string;
  suggestions?: string[];
  onBack?: () => void;
  isLoggedIn?: boolean;
  unlocked?: boolean;
  aiMessagesUsed?: number;
  onRequireAuth?: () => void;
  badgeAction?: React.ReactNode;
}

function renderMessageText(text: string) {
  if (!text.includes('**')) return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export const MobileChatWidget: React.FC<MobileChatWidgetProps> = ({
  isOpen,
  onToggle,
  messages,
  input,
  setInput,
  loading,
  onSend,
  title = 'AI Assistant',
  suggestions = [],
  onBack,
  unlocked = true,
  aiMessagesUsed = 0,
  onRequireAuth,
  badgeAction,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Trigger Button (Visible only on Mobile screens below lg) */}
      <div className="fixed bottom-6 right-4 z-40 lg:hidden flex items-center gap-2">
        {!isOpen && (
          <div
            onClick={onToggle}
            className="bg-white text-slate-900 text-xs font-bold px-3.5 py-2 rounded-full shadow-xl border border-slate-200/90 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-all shrink-0"
          >
            <span>Build with AI</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          </div>
        )}

        <div className="relative shrink-0">
          <button
            onClick={onToggle}
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer border-2 ${
              isOpen
                ? 'bg-slate-900 text-white border-slate-700 scale-105'
                : 'bg-[#2a2a2e] text-white border-slate-700/60 hover:bg-black hover:scale-105'
            }`}
            aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="AI Chat" className="w-7 h-7 object-contain drop-shadow-sm" />
              </div>
            )}
          </button>

          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-xs">
              1
            </span>
          )}
        </div>
      </div>

      {/* Floating Widget Popup (Visible on Mobile when isOpen === true) */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto"
            />

            {/* Floating Drawer / Card */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-h-[82vh] h-[550px] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto border-t border-slate-200/80 z-10"
            >
              {/* Header */}
              <div className="shrink-0 px-4 py-3 border-b border-slate-200/80 bg-slate-50/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-200/60 transition-colors"
                      title="Back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="" className="w-4.5 h-4.5 object-contain" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 truncate">{title}</span>
                </div>
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Scroll Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 text-sm">
                {messages.length === 0 && !loading && (
                  <div className="pt-2 space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Try asking
                    </p>
                    <div className="flex flex-col gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => onSend(s)}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-xs font-medium hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-slate-900 text-white px-4 py-2.5 max-w-[88%] font-medium shadow-2xs'
                          : 'bg-white text-slate-800 p-3.5 max-w-[92%] border border-slate-200/80 shadow-2xs space-y-1.5'
                      }`}
                    >
                      {renderMessageText(m.content)}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200/80 text-slate-600 rounded-2xl px-3.5 py-2 text-xs font-medium flex items-center gap-2 shadow-2xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Generating updates…</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action / Input Area */}
              <div className="shrink-0 p-3 bg-white border-t border-slate-200/80 flex flex-col gap-2">
                {badgeAction && <div className="self-start">{badgeAction}</div>}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 flex items-center gap-2 focus-within:border-slate-400 focus-within:bg-white transition-all shadow-2xs">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                    placeholder={
                      aiMessagesUsed >= 5 && !unlocked
                        ? 'AI Limit Reached. Upgrade to Pro.'
                        : 'Ask anything...'
                    }
                    disabled={aiMessagesUsed >= 5 && !unlocked}
                    className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-normal disabled:opacity-50 max-h-24 leading-snug py-0.5"
                  />
                  <button
                    onClick={() => onSend()}
                    disabled={!input.trim() || loading || (aiMessagesUsed >= 5 && !unlocked)}
                    className="w-8 h-8 rounded-full bg-slate-900 text-white hover:bg-black flex items-center justify-center transition-colors disabled:opacity-30 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
