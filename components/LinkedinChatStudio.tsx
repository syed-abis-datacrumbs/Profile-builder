'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import { LinkedinProfileData } from '../types';
import { LinkedinIcon } from './icons';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

/** Inline plain-text edit. Commits on blur. */
function Edit({
  value,
  onCommit,
  className,
  placeholder,
  block,
}: {
  value: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
  block?: boolean;
}) {
  const Tag = (block ? 'div' : 'span') as 'div';
  return (
    <Tag
      key={value}
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      className={`${className || ''} outline-none rounded hover:bg-slate-50 focus:bg-blue-50 cursor-text whitespace-pre-wrap empty:before:content-[attr(data-ph)] empty:before:text-slate-300`}
      onBlur={(e) => {
        const v = e.currentTarget.textContent ?? '';
        if (v !== value) onCommit(v);
      }}
    >
      {value}
    </Tag>
  );
}

export const LinkedinChatStudio: React.FC<{
  linkedin: LinkedinProfileData;
  onChange: (l: LinkedinProfileData) => void;
  onBack: () => void;
}> = ({ linkedin, onChange, onBack }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Loaded your LinkedIn profile. Edit any text on the right, or ask me — e.g. "make my headline more keyword-rich", "add a highlight about leading a team", "add Python to skills", or "turn off Open to Work".',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/linkedin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, linkedin }),
      });
      const data = await res.json();
      if (data.error) setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      else {
        if (data.linkedin) onChange(data.linkedin as LinkedinProfileData);
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Done.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const set = (patch: Partial<LinkedinProfileData>) => onChange({ ...linkedin, ...patch });
  const setHighlight = (i: number, v: string) =>
    set({ experienceHighlights: linkedin.experienceHighlights.map((h, j) => (j === i ? v : h)) });
  const setSkill = (i: number, v: string) =>
    set({ keySkills: linkedin.keySkills.map((s, j) => (j === i ? v : s)) });

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-150px)]">
      {/* LEFT — chat */}
      <div className="lg:w-[34%] xl:w-[30%] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <button onClick={onBack} className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center" title="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Sparkles className="w-4 h-4 text-[#0A66C2]" />
          <span className="font-bold text-sm text-slate-800">AI LinkedIn Assistant</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#0A66C2] text-white' : 'bg-slate-100 text-slate-700'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 rounded-2xl px-3 py-2 text-xs flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0 p-3 border-t border-slate-100">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#0A66C2] transition-colors">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask the AI to optimize your profile…"
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-24"
            />
            <button onClick={send} disabled={loading || !input.trim()} className="w-8 h-8 rounded-full bg-[#0A66C2] hover:bg-[#0958A8] text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — editable LinkedIn preview */}
      <div className="lg:flex-1 flex flex-col bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
          <LinkedinIcon className="w-4 h-4 text-[#0A66C2]" />
          <span className="text-xs font-bold text-slate-700">LinkedIn profile</span>
          <span className="hidden md:block ml-auto text-[11px] text-slate-400">Click text to edit · Open-to-Work & structure via chat</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
          <div className="w-full max-w-[720px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Cover + avatar */}
            <div className="h-24 bg-gradient-to-r from-[#0A66C2] to-indigo-500" />
            <div className="px-6 pb-6">
              <div className="-mt-10 w-20 h-20 rounded-full bg-slate-200 border-4 border-white" />
              <div className="mt-2">
                <div className="text-xl font-bold text-slate-900">Your Name</div>
                <Edit block value={linkedin.headline} placeholder="Your headline…" onCommit={(v) => set({ headline: v })} className="text-sm text-slate-700 mt-0.5 leading-snug" />
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2">
                  <Edit value={linkedin.industry} placeholder="Industry" onCommit={(v) => set({ industry: v })} />
                  <span>·</span>
                  <Edit value={linkedin.targetRole} placeholder="Target role" onCommit={(v) => set({ targetRole: v })} />
                </div>
                {linkedin.openToWork && (
                  <span className="inline-block mt-2 text-[11px] font-semibold text-green-800 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    #OpenToWork
                  </span>
                )}
              </div>

              {/* About */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-1">About</h3>
                <Edit block value={linkedin.about} placeholder="Write your About section…" onCommit={(v) => set({ about: v })} className="text-sm text-slate-700 leading-relaxed" />
              </div>

              {/* Experience highlights */}
              {linkedin.experienceHighlights.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">Experience Highlights</h3>
                  <ul className="space-y-1.5">
                    {linkedin.experienceHighlights.map((h, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-[#0A66C2] shrink-0">▹</span>
                        <Edit block value={h} placeholder="Highlight…" onCommit={(v) => setHighlight(i, v)} className="flex-1" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {linkedin.keySkills.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedin.keySkills.map((s, i) => (
                      <Edit key={i} value={s} placeholder="Skill" onCommit={(v) => setSkill(i, v)} className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-md px-2 py-1" />
                    ))}
                  </div>
                </div>
              )}

              {/* Featured post */}
              {(linkedin.featuredPost || true) && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">Featured Post</h3>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <Edit block value={linkedin.featuredPost} placeholder="Draft a featured post…" onCommit={(v) => set({ featuredPost: v })} className="text-sm text-slate-700 leading-relaxed" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
