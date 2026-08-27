'use client';

import React from 'react';
import { CvData, CvPersonalInfo, CvProject } from '../lib/cvTypes';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function applyLinkToProjectContent(content: string, link?: string): string {
  // First strip any existing <a> tags inside content to prevent nested anchors
  const stripped = (content || '').replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
  if (!link || !link.trim()) return stripped;
  const url = normalizeUrl(link);

  // If content has <strong>...</strong>, wrap the first strong inner content in <a>
  if (/<strong\b[^>]*>(.*?)<\/strong>/i.test(stripped)) {
    return stripped.replace(/<strong\b[^>]*>(.*?)<\/strong>/i, (_, inner) => {
      return `<strong><a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline hover:text-blue-900 cursor-pointer font-bold">${inner}</a></strong>`;
    });
  }

  // If content has <b>...</b>
  if (/<b\b[^>]*>(.*?)<\/b>/i.test(stripped)) {
    return stripped.replace(/<b\b[^>]*>(.*?)<\/b>/i, (_, inner) => {
      return `<b><a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline hover:text-blue-900 cursor-pointer font-bold">${inner}</a></b>`;
    });
  }

  // If no bold tag, find title before '(' or '–' or '-' or ':'
  const match = stripped.match(/^([^(\-–:]+)(.*)$/);
  if (match && match[1].trim()) {
    const title = match[1].trim();
    const rest = match[2];
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline hover:text-blue-900 cursor-pointer font-bold">${title}</a>${rest}`;
  }

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline hover:text-blue-900 cursor-pointer font-bold">${stripped}</a>`;
}

function extractLinkFromProject(proj: CvProject): string {
  if (proj.link) return proj.link;
  const match = (proj.content || '').match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : '';
}

/** True if an HTML field has no real text left in it. A plain `!html` check
 *  isn't enough: clearing a block-style contentEditable field (a <div>, not
 *  a <span>) down to nothing commonly leaves the browser's own residual
 *  "<br>" behind instead of a true empty string, which is truthy and
 *  silently defeats a raw falsy check even though the field looks and acts
 *  completely empty. Stripping tags/nbsp and checking what's left is what
 *  actually matches what the user sees on screen. */
function isBlank(html?: string): boolean {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === '';
}

function Bullet({ children, marker = '•' }: { children: React.ReactNode; marker?: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="shrink-0">{marker}</span>
      <span className="flex-1 min-w-0">{children}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-[16px] font-bold tracking-wide uppercase mt-4 mb-1">{children}</h2>
      <hr className="border-t border-slate-800 mb-2" />
    </>
  );
}

/** Read-only rich text (renders stored HTML: <strong>/<em>/<u>). */
function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

interface BulletKeys {
  /** Enter → add a new bullet after this one (receives this bullet's html). */
  onEnter: (html: string) => void;
  /** Backspace on an empty bullet → remove it. */
  onBackspaceEmpty: () => void;
  /** Paste containing newlines → append the first line here, rest = new bullets. */
  onPasteLines: (html: string, lines: string[]) => void;
}

/**
 * Inline rich-text field. Content is HTML (so the Bold/Italic/Underline toolbar
 * formats visually). Paste is always inserted as CLEAN plain text (no source
 * styles). In bullets, Enter/Backspace/multiline-paste add & remove points.
 * Commits innerHTML on blur only, so it never re-renders mid-edit.
 */
function RichText({
  html,
  onCommit,
  className,
  placeholder,
  block,
  bullet,
  onEmptyBackspace,
  editable = true,
}: {
  html: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
  block?: boolean;
  bullet?: BulletKeys;
  /** Backspace pressed while this field is ALREADY empty (nothing left to
   *  delete) — used to remove the whole entry once every one of its fields
   *  is empty, so an already-cleared field doesn't just sit there forever
   *  showing its placeholder hint with no way to make it disappear. */
  onEmptyBackspace?: () => void;
  editable?: boolean;
}) {
  const elRef = React.useRef<HTMLElement | null>(null);

  // Initialize and update DOM innerHTML ONLY when the user is NOT actively focused/typing in this element
  React.useEffect(() => {
    if (elRef.current) {
      if (document.activeElement !== elRef.current && elRef.current.innerHTML !== (html || '')) {
        elRef.current.innerHTML = html || '';
      }
    }
  }, [html]);

  const Tag = (block ? 'div' : 'span') as 'div';
  return (
    <Tag
      ref={elRef as any}
      contentEditable={editable}
      suppressContentEditableWarning
      data-ph={placeholder}
      className={`${className || ''} outline-none rounded-sm hover:bg-slate-50/60 cursor-text empty:before:content-[attr(data-ph)] empty:before:text-slate-300`}
      onKeyDown={(e) => {
        const textVal = (e.currentTarget.textContent ?? '').trim();
        const isEmpty = textVal === '' || textVal === '\u200B' || e.currentTarget.innerHTML === '' || e.currentTarget.innerHTML === '<br>';

        if (bullet) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            bullet.onEnter(e.currentTarget.innerHTML);
            return;
          } else if (e.key === 'Backspace' && isEmpty) {
            e.preventDefault();
            bullet.onBackspaceEmpty();
            return;
          }
        }
        if (onEmptyBackspace && e.key === 'Backspace' && isEmpty) {
          e.preventDefault();
          onEmptyBackspace();
          return;
        }
      }}
      onPaste={(e) => {
        const text = e.clipboardData.getData('text/plain');
        if (bullet && text.includes('\n')) {
          e.preventDefault();
          const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
          bullet.onPasteLines(e.currentTarget.innerHTML, lines);
        } else {
          // Clean plain-text paste for every field (no pasted source styling).
          e.preventDefault();
          document.execCommand('insertText', false, text);
        }
      }}
      onBlur={(e) => {
        const v = e.currentTarget.innerHTML;
        if (v !== html) onCommit(v);
      }}
    />
  );
}

function CvPreviewBase({
  data,
  onChange,
}: {
  data: CvData;
  onChange?: (cv: CvData) => void;
}) {
  const editable = !!onChange;
  const commit = (cv: CvData) => onChange?.(cv);

  const setPersonal = (patch: Partial<CvPersonalInfo>) =>
    commit({ ...data, personalInfo: { ...data.personalInfo, ...patch } });

  // Clearing a field's text via keyboard only empties that ONE field — it
  // used to just sit there showing its placeholder hint forever, since the
  // editable view renders every entry regardless of content (so blank
  // slots stay usable to add new content). Instead, once EVERY field of an
  // entry is empty (same "is this entry meaningful" test the read-only
  // view already uses below), auto-remove the whole entry here rather than
  // leaving a dead placeholder row behind.
  const setEdu = (i: number, patch: Partial<CvData['education'][number]>) => {
    const next = { ...data.education[i], ...patch };
    const isEmpty = isBlank(next.institution) && isBlank(next.degree);
    commit({
      ...data,
      education: isEmpty ? data.education.filter((_, j) => j !== i) : data.education.map((e, j) => (j === i ? next : e)),
    });
  };
  const setWork = (i: number, patch: Partial<CvData['workExperience'][number]>) => {
    const next = { ...data.workExperience[i], ...patch };
    const isEmpty = isBlank(next.company) && isBlank(next.title) && isBlank(next.bullets);
    commit({
      ...data,
      workExperience: isEmpty
        ? data.workExperience.filter((_, j) => j !== i)
        : data.workExperience.map((w, j) => (j === i ? next : w)),
    });
  };
  const setProj = (i: number, patch: Partial<CvProject> | string) => {
    const current = data.projects[i] || { content: '' };
    const next = typeof patch === 'string' ? { ...current, content: patch } : { ...current, ...patch };
    const isEmpty = isBlank(next.content);
    commit({
      ...data,
      projects: isEmpty
        ? data.projects.filter((_, j) => j !== i)
        : data.projects.map((p, j) => (j === i ? next : p)),
    });
  };
  const setWs = (i: number, content: string) => {
    const workshops = data.workshops ?? [];
    const isEmpty = isBlank(content);
    commit({
      ...data,
      workshops: isEmpty ? workshops.filter((_, j) => j !== i) : workshops.map((w, j) => (j === i ? { content } : w)),
    });
  };
  const setCert = (i: number, patch: Partial<CvData['certifications'][number]>) => {
    const next = { ...data.certifications[i], ...patch };
    const isEmpty = isBlank(next.name) && isBlank(next.organization);
    commit({
      ...data,
      certifications: isEmpty
        ? data.certifications.filter((_, j) => j !== i)
        : data.certifications.map((c, j) => (j === i ? next : c)),
    });
  };
  const setAdditional = (patch: Partial<CvData['additional']>) =>
    commit({ ...data, additional: { ...data.additional, ...patch } });

  // Backspace on a field that's ALREADY empty — the setX() auto-remove
  // above only fires when a field's content actually changes, so a field
  // that was already blank (nothing left to type over) never reaches it.
  // These re-check ALL of the entry's relevant fields directly from
  // current data (whichever field the Backspace happened in is confirmed
  // empty by the keydown condition that calls these — that's true no
  // matter which one it was), and remove the whole entry only once every
  // one of them is empty; a still-filled sibling field is left alone.
  const eduEmptyBackspace = (i: number) => {
    const e = data.education[i];
    if (isBlank(e.institution) && isBlank(e.degree)) commit({ ...data, education: data.education.filter((_, j) => j !== i) });
  };
  const workEmptyBackspace = (i: number) => {
    const w = data.workExperience[i];
    if (isBlank(w.company) && isBlank(w.title) && isBlank(w.bullets))
      commit({ ...data, workExperience: data.workExperience.filter((_, j) => j !== i) });
  };
  const projectEmptyBackspace = (i: number) => {
    if (isBlank(data.projects[i].content)) commit({ ...data, projects: data.projects.filter((_, j) => j !== i) });
  };
  const workshopEmptyBackspace = (i: number) => {
    const workshops = data.workshops ?? [];
    if (isBlank(workshops[i].content)) commit({ ...data, workshops: workshops.filter((_, j) => j !== i) });
  };
  const certEmptyBackspace = (i: number) => {
    const c = data.certifications[i];
    if (isBlank(c.name) && isBlank(c.organization)) commit({ ...data, certifications: data.certifications.filter((_, j) => j !== i) });
  };
  const deleteCert = (i: number) => {
    commit({ ...data, certifications: data.certifications.filter((_, j) => j !== i) });
  };

  // Bullet editing (editable mode renders ALL lines incl. empty, so line index
  // == raw index — Enter/Backspace/paste act directly on the "\n"-joined list).
  const setBulletLine = (wi: number, li: number, v: string) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    lines[li] = v;
    setWork(wi, { bullets: lines.join('\n') });
  };
  const bulletEnter = (wi: number, li: number, html: string) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    lines[li] = html;
    lines.splice(li + 1, 0, '');
    setWork(wi, { bullets: lines.join('\n') });
  };
  const bulletBackspace = (wi: number, li: number) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    if (lines.length <= 1) return;
    lines.splice(li, 1);
    setWork(wi, { bullets: lines.join('\n') });
  };
  const bulletPaste = (wi: number, li: number, html: string, pasted: string[]) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    lines[li] = html + (pasted[0] ?? '');
    lines.splice(li + 1, 0, ...pasted.slice(1));
    setWork(wi, { bullets: lines.join('\n') });
  };
  const keysFor = (wi: number, li: number): BulletKeys => ({
    onEnter: (h) => bulletEnter(wi, li, h),
    onBackspaceEmpty: () => bulletBackspace(wi, li),
    onPasteLines: (h, lines) => bulletPaste(wi, li, h, lines),
  });

  const projEnter = (i: number, html: string) => {
    const next = [...data.projects];
    next[i] = { content: html };
    next.splice(i + 1, 0, { content: '' });
    commit({ ...data, projects: next });
  };
  const projBackspace = (i: number) => {
    if (data.projects.length <= 1) {
      commit({ ...data, projects: [{ content: '' }] });
      return;
    }
    commit({ ...data, projects: data.projects.filter((_, j) => j !== i) });
  };
  const projKeysFor = (i: number): BulletKeys => ({
    onEnter: (h) => projEnter(i, h),
    onBackspaceEmpty: () => projBackspace(i),
    onPasteLines: (h, lines) => {
      const next = [...data.projects];
      next[i] = { content: h + (lines[0] ?? '') };
      next.splice(i + 1, 0, ...lines.slice(1).map((c) => ({ content: c })));
      commit({ ...data, projects: next });
    },
  });

  const wsEnter = (i: number, html: string) => {
    const list = [...(data.workshops ?? [])];
    list[i] = { content: html };
    list.splice(i + 1, 0, { content: '' });
    commit({ ...data, workshops: list });
  };
  const wsBackspace = (i: number) => {
    const list = data.workshops ?? [];
    if (list.length <= 1) {
      commit({ ...data, workshops: [{ content: '' }] });
      return;
    }
    commit({ ...data, workshops: list.filter((_, j) => j !== i) });
  };
  const wsKeysFor = (i: number): BulletKeys => ({
    onEnter: (h) => wsEnter(i, h),
    onBackspaceEmpty: () => wsBackspace(i),
    onPasteLines: (h, lines) => {
      const list = [...(data.workshops ?? [])];
      list[i] = { content: h + (lines[0] ?? '') };
      list.splice(i + 1, 0, ...lines.slice(1).map((c) => ({ content: c })));
      commit({ ...data, workshops: list });
    },
  });

  const isStudent = data.cvType === 'student';

  const eduList = editable ? data.education : data.education.filter((e) => !isBlank(e.institution) || !isBlank(e.degree));
  const workList = editable
    ? data.workExperience
    : data.workExperience.filter((w) => !isBlank(w.company) || !isBlank(w.title) || !isBlank(w.bullets));
  const workshopList = editable ? data.workshops ?? [] : (data.workshops ?? []).filter((w) => !isBlank(w.content));
  const projectList = editable ? data.projects : data.projects.filter((p) => !isBlank(p.content));
  const certList = editable ? data.certifications : data.certifications.filter((c) => !isBlank(c.name) || !isBlank(c.organization));
  const hasAdditional = editable || data.additional.skills || data.additional.interests;

  const certRows: CvData['certifications'][] = [];
  for (let i = 0; i < certList.length; i += 2) certRows.push(certList.slice(i, i + 2));

  const [editingLinkKey, setEditingLinkKey] = React.useState<'linkedin' | 'github' | 'kaggle' | null>(null);
  const [editingLinkUrl, setEditingLinkUrl] = React.useState('');
  const [editingLinkLabel, setEditingLinkLabel] = React.useState('');

  const openLinkModal = (key: 'linkedin' | 'github' | 'kaggle', currentLabel: string, currentUrl: string) => {
    setEditingLinkKey(key);
    setEditingLinkLabel(currentLabel);
    setEditingLinkUrl(currentUrl);
  };

  const [editingProjectIndex, setEditingProjectIndex] = React.useState<number | null>(null);
  const [editingProjectUrl, setEditingProjectUrl] = React.useState('');
  const [hoveredProjectIndex, setHoveredProjectIndex] = React.useState<number | null>(null);
  const [focusedProjectIndex, setFocusedProjectIndex] = React.useState<number | null>(null);

  const activeProjectIndex = focusedProjectIndex !== null ? focusedProjectIndex : hoveredProjectIndex;

  const openProjectLinkModal = (index: number) => {
    const proj = data.projects[index];
    const currentUrl = proj ? extractLinkFromProject(proj) : '';
    setEditingProjectIndex(index);
    setEditingProjectUrl(currentUrl);
  };

  const p = data.personalInfo;

  return (
    <div className="bg-white text-slate-900 p-8 text-[17px] leading-snug font-serif relative">
      {/* Header */}
      <div data-cv-block>
        <h1 className="text-[40px] font-bold tracking-wide text-center">
          {editable ? <RichText html={p.fullName} placeholder="YOUR NAME" onCommit={(v) => setPersonal({ fullName: v })} /> : <Html html={p.fullName || 'YOUR NAME'} />}
        </h1>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-[16px] mt-1 text-slate-700 gap-2">
          <div className="text-left whitespace-nowrap">
            {editable ? <RichText html={p.phone} placeholder="Phone" onCommit={(v) => setPersonal({ phone: v })} /> : <Html html={p.phone} />}
          </div>
          <div className="flex flex-nowrap justify-center gap-x-3 whitespace-nowrap">
            {Boolean(p.linkedin && p.linkedin.trim()) && (
              <span className="inline-flex items-center group relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    openLinkModal('linkedin', p.linkedinLabel || 'LinkedIn', p.linkedin || '');
                  }}
                  className="text-blue-700 underline font-serif text-[16px] hover:text-blue-900 cursor-pointer bg-transparent border-0 p-0"
                  title="Click to add or change LinkedIn link"
                >
                  {p.linkedinLabel || 'LinkedIn'}
                </button>
                {editable && (
                  <button
                    onClick={() => setPersonal({ linkedin: '', linkedinLabel: '' })}
                    className="ml-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all focus:outline-none"
                    title="Remove"
                  >
                    <span className="text-[10px] font-bold leading-none mb-[1px]">✕</span>
                  </button>
                )}
              </span>
            )}
            {Boolean(p.github && p.github.trim()) && (
              <span className="inline-flex items-center group relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    openLinkModal('github', p.githubLabel || 'GitHub', p.github || '');
                  }}
                  className="text-blue-700 underline font-serif text-[16px] hover:text-blue-900 cursor-pointer bg-transparent border-0 p-0"
                  title="Click to add or change GitHub link"
                >
                  {p.githubLabel || 'GitHub'}
                </button>
                {editable && (
                  <button
                    onClick={() => setPersonal({ github: '', githubLabel: '' })}
                    className="ml-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all focus:outline-none"
                    title="Remove"
                  >
                    <span className="text-[10px] font-bold leading-none mb-[1px]">✕</span>
                  </button>
                )}
              </span>
            )}
            {Boolean(p.kaggle && p.kaggle.trim()) && (
              <span className="inline-flex items-center group relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    openLinkModal('kaggle', p.kaggleLabel || 'Kaggle', p.kaggle || '');
                  }}
                  className="text-blue-700 underline font-serif text-[16px] hover:text-blue-900 cursor-pointer bg-transparent border-0 p-0"
                  title="Click to add or change Kaggle link"
                >
                  {p.kaggleLabel || 'Kaggle'}
                </button>
                {editable && (
                  <button
                    onClick={() => setPersonal({ kaggle: '', kaggleLabel: '' })}
                    className="ml-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all focus:outline-none"
                    title="Remove"
                  >
                    <span className="text-[10px] font-bold leading-none mb-[1px]">✕</span>
                  </button>
                )}
              </span>
            )}
          </div>
          <div className="text-right text-blue-700 underline whitespace-nowrap">
            {editable ? (
              <RichText html={p.email} placeholder="email@example.com" onCommit={(v) => setPersonal({ email: v })} />
            ) : (
              p.email && (
                <a href={`mailto:${p.email}`} className="text-blue-700 underline">
                  {p.email}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* Social Link Edit Modal */}
      {editingLinkKey && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 p-3 sm:p-4 bg-black/50">
          <div className="fixed inset-0" onClick={() => setEditingLinkKey(null)} />
          <div className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                Edit {editingLinkKey === 'linkedin' ? 'LinkedIn' : editingLinkKey === 'github' ? 'GitHub' : 'Kaggle'} Link
              </h3>
              <button onClick={() => setEditingLinkKey(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3 min-h-0 text-left">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Enter the URL and optional label text for this link.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={editingLinkUrl}
                    onChange={(e) => setEditingLinkUrl(e.target.value)}
                    placeholder={
                      editingLinkKey === 'linkedin'
                        ? 'https://linkedin.com/in/username'
                        : editingLinkKey === 'github'
                        ? 'https://github.com/username'
                        : 'https://kaggle.com/username'
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-mono text-slate-900 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Button Label Text</label>
                  <input
                    type="text"
                    value={editingLinkLabel}
                    onChange={(e) => setEditingLinkLabel(e.target.value)}
                    placeholder={
                      editingLinkKey === 'linkedin'
                        ? 'Linkedin'
                        : editingLinkKey === 'github'
                        ? 'GitHub'
                        : 'Kaggle'
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (editingLinkKey === 'linkedin') setPersonal({ linkedin: '', linkedinLabel: '' });
                  if (editingLinkKey === 'github') setPersonal({ github: '', githubLabel: '' });
                  if (editingLinkKey === 'kaggle') setPersonal({ kaggle: '', kaggleLabel: '' });
                  setEditingLinkKey(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200 cursor-pointer mr-auto"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setEditingLinkKey(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingLinkKey === 'linkedin') setPersonal({ linkedin: editingLinkUrl, linkedinLabel: editingLinkLabel });
                  if (editingLinkKey === 'github') setPersonal({ github: editingLinkUrl, githubLabel: editingLinkLabel });
                  if (editingLinkKey === 'kaggle') setPersonal({ kaggle: editingLinkUrl, kaggleLabel: editingLinkLabel });
                  setEditingLinkKey(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Project Link Edit Modal */}
      {editingProjectIndex !== null && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 p-3 sm:p-4 bg-black/50">
          <div className="fixed inset-0" onClick={() => setEditingProjectIndex(null)} />
          <div className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="text-base">🔗</span> {data.projects[editingProjectIndex] && extractLinkFromProject(data.projects[editingProjectIndex]) ? 'Edit Project Link' : 'Attach Project Link'}
              </h3>
              <button onClick={() => setEditingProjectIndex(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3 min-h-0 text-left">
              <p className="text-[12px] text-slate-600 leading-relaxed">
                Enter the project repository or live app URL. The project heading itself will become a clickable link.
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project URL</label>
                <input
                  type="text"
                  value={editingProjectUrl}
                  onChange={(e) => setEditingProjectUrl(e.target.value)}
                  placeholder="https://github.com/username/project or https://app.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-mono text-slate-900 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              {editingProjectIndex !== null && extractLinkFromProject(data.projects[editingProjectIndex]) && (
                <button
                  type="button"
                  onClick={() => {
                    if (editingProjectIndex !== null) {
                      const cur = data.projects[editingProjectIndex];
                      const newContent = applyLinkToProjectContent(cur.content, '');
                      setProj(editingProjectIndex, { content: newContent, link: undefined, linkLabel: undefined });
                    }
                    setEditingProjectIndex(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200 cursor-pointer mr-auto"
                >
                  Clear Link
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingProjectIndex(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingProjectIndex !== null) {
                    const cur = data.projects[editingProjectIndex];
                    const trimmedUrl = editingProjectUrl.trim();
                    const newContent = applyLinkToProjectContent(cur.content, trimmedUrl);
                    setProj(editingProjectIndex, {
                      content: newContent,
                      link: trimmedUrl || undefined,
                      linkLabel: undefined,
                    });
                  }
                  setEditingProjectIndex(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                Save Link
              </button>
            </div>

          </div>
        </div>
      )}

      {(editable || eduList.length > 0) && (
        <section>
          {eduList.map((edu, pos) => {
            const i = data.education.indexOf(edu);
            return (
              <div key={i} data-cv-block className="mb-1.5">
                {pos === 0 && <SectionHeading>Education</SectionHeading>}
                <div className="flex justify-between items-baseline gap-3">
                  <span className="font-bold">
                    {editable ? (
                      <RichText
                        html={edu.institution}
                        placeholder="Institution"
                        onCommit={(v) => setEdu(i, { institution: v })}
                        onEmptyBackspace={() => eduEmptyBackspace(i)}
                      />
                    ) : (
                      <Html html={edu.institution} />
                    )}
                  </span>
                  <span className="text-slate-600 text-[16px] shrink-0 whitespace-nowrap">
                    {editable ? (
                      <>
                        <RichText html={edu.start} placeholder="Start" onCommit={(v) => setEdu(i, { start: v })} />
                        {' - '}
                        <RichText html={edu.end} placeholder="End" onCommit={(v) => setEdu(i, { end: v })} />
                      </>
                    ) : (
                      (edu.start || edu.end) && (
                        <>
                          {edu.start}
                          {edu.start && edu.end ? ' - ' : ''}
                          {edu.end}
                        </>
                      )
                    )}
                  </span>
                </div>
                {editable ? (
                  <RichText
                    block
                    html={edu.degree}
                    placeholder="Degree"
                    onCommit={(v) => setEdu(i, { degree: v })}
                    onEmptyBackspace={() => eduEmptyBackspace(i)}
                  />
                ) : (
                  edu.degree && (
                    <div>
                      <Html html={edu.degree} />
                    </div>
                  )
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Work Experience — professional layout only. */}
      {!isStudent && (editable || workList.length > 0) && (
        <section>
          {workList.map((job, pos) => {
            const i = data.workExperience.indexOf(job);
            const lines = editable ? job.bullets.split('\n') : job.bullets.split('\n').filter((l) => l.trim());
            return (
              <div key={i} data-cv-block className="mb-2">
                {pos === 0 && <SectionHeading>Work Experience</SectionHeading>}
                <div className="flex justify-between items-baseline gap-3">
                  <span className="font-bold">
                    {editable ? (
                      <>
                        <RichText html={job.company} placeholder="Company" onCommit={(v) => setWork(i, { company: v })} onEmptyBackspace={() => workEmptyBackspace(i)} />
                        {' – '}
                        <RichText html={job.title} placeholder="Title" onCommit={(v) => setWork(i, { title: v })} onEmptyBackspace={() => workEmptyBackspace(i)} />
                      </>
                    ) : (
                      <>
                        <Html html={job.company} />
                        {job.company && job.title ? ' – ' : ''}
                        <Html html={job.title} />
                      </>
                    )}
                  </span>
                  <span className="text-slate-600 text-[16px] shrink-0 whitespace-nowrap">
                    {editable ? (
                      <>
                        <RichText html={job.start} placeholder="Start" onCommit={(v) => setWork(i, { start: v })} />
                        {'- '}
                        <RichText html={job.end} placeholder="End" onCommit={(v) => setWork(i, { end: v })} />
                      </>
                    ) : (
                      (job.start || job.end) && <>{job.start}- {job.end}</>
                    )}
                  </span>
                </div>
                {lines.length > 0 && (
                  <div className="mt-0.5 space-y-0.5" data-bullet-group={`we-${i}`}>
                    {lines.map((line, j) => (
                      <Bullet key={j} marker={job.bulletStyle === 'number' ? `${j + 1}.` : '•'}>
                        {editable ? <RichText block html={line} placeholder="Bullet point" onCommit={(v) => setBulletLine(i, j, v)} bullet={keysFor(i, j)} /> : <Html html={line} />}
                      </Bullet>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {(editable || projectList.length > 0) && (
        <section data-bullet-group="projects">
          <SectionHeading>Projects</SectionHeading>
          {projectList.map((proj, pos) => {
            const i = data.projects.indexOf(proj);
            const hasLink = !!extractLinkFromProject(proj);
            const isTargeted = editable && activeProjectIndex === i;
            return (
              <div
                key={i}
                data-cv-block
                className="mb-1.5 relative group/proj-item"
                onMouseEnter={() => setHoveredProjectIndex(i)}
                onMouseLeave={() => setHoveredProjectIndex((prev) => (prev === i ? null : prev))}
                onFocus={() => setFocusedProjectIndex(i)}
                onBlur={() => setFocusedProjectIndex((prev) => (prev === i ? null : prev))}
              >
                {/* Floating "Add Link" / "Edit Link" pill above the project - ONLY for the targeted project */}
                {isTargeted && (
                  <div className="absolute -top-2.5 left-6 z-30 transition-all duration-150 flex items-center gap-1 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openProjectLinkModal(i);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-sans font-medium shadow-lg hover:bg-blue-600 transition-colors cursor-pointer border border-white/20"
                    >
                      <span className="text-[10px]">🔗</span>
                      <span>{hasLink ? 'Edit Link' : 'Add Link'}</span>
                    </button>
                    {hasLink && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const newContent = applyLinkToProjectContent(proj.content, '');
                          setProj(i, { content: newContent, link: undefined, linkLabel: undefined });
                        }}
                        className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-red-600 flex items-center justify-center text-[9px] transition-colors cursor-pointer shadow-md"
                        title="Remove link"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                <Bullet marker={data.projectsBulletStyle === 'number' ? `${pos + 1}.` : '•'}>
                  <div className="w-full">
                    {editable ? (
                      <RichText
                        block
                        html={proj.content}
                        placeholder="Project Title (Technologies) – Description"
                        onCommit={(v) => setProj(i, v)}
                        bullet={projKeysFor(i)}
                        onEmptyBackspace={() => projectEmptyBackspace(i)}
                      />
                    ) : (
                      <Html html={proj.content} />
                    )}
                  </div>
                </Bullet>
              </div>
            );
          })}
        </section>
      )}

      {/* Workshops — student layout only, right after Projects. */}
      {isStudent && (editable || workshopList.length > 0) && (
        <section data-bullet-group="workshops">
          {workshopList.map((ws, pos) => {
            const i = (data.workshops ?? []).indexOf(ws);
            return (
              <div key={i} data-cv-block className="mb-1">
                {pos === 0 && <SectionHeading>Workshops</SectionHeading>}
                <Bullet marker={data.workshopsBulletStyle === 'number' ? `${pos + 1}.` : '•'}>
                  {editable ? (
                    <RichText
                      block
                      html={ws.content}
                      placeholder="Workshop Title: Description"
                      onCommit={(v) => setWs(i, v)}
                      bullet={wsKeysFor(i)}
                      onEmptyBackspace={() => workshopEmptyBackspace(i)}
                    />
                  ) : (
                    <Html html={ws.content} />
                  )}
                </Bullet>
              </div>
            );
          })}
        </section>
      )}

      {(editable || certRows.length > 0) && (
        <section>
          {certRows.map((row, ri) => (
            <div key={ri} data-cv-block>
              {ri === 0 && <SectionHeading>Professional Certifications</SectionHeading>}
              <div className="grid grid-cols-2 gap-x-4 mb-1">
                {row.map((cert) => {
                  const i = data.certifications.indexOf(cert);
                  return (
                    <div key={i} className="relative group/cert-item">
                      {editable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteCert(i);
                          }}
                          className="opacity-0 group-hover/cert-item:opacity-100 absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-slate-100 hover:bg-red-500 text-slate-400 hover:text-white flex items-center justify-center text-[9px] font-bold transition-all shadow-sm cursor-pointer z-10 print:hidden border border-slate-300 hover:border-red-500"
                          title="Delete certification"
                          aria-label="Delete certification"
                        >
                          ✕
                        </button>
                      )}
                      <div className="font-bold pr-3">
                        {editable ? <RichText html={cert.name} placeholder="Certification" onCommit={(v) => setCert(i, { name: v })} onEmptyBackspace={() => certEmptyBackspace(i)} /> : <Html html={cert.name} />}
                      </div>
                      {editable ? (
                        <div className="text-slate-600">(<RichText html={cert.organization} placeholder="Organization" onCommit={(v) => setCert(i, { organization: v })} onEmptyBackspace={() => certEmptyBackspace(i)} />)</div>
                      ) : (
                        cert.organization && <div className="text-slate-600">(<Html html={cert.organization} />)</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {hasAdditional && (
        <section data-bullet-group="additional">
          <div data-cv-block>
            <SectionHeading>Additional</SectionHeading>
            <div className="space-y-0.5">
              <Bullet marker={data.additional.bulletStyle === 'number' ? '1.' : '•'}>
                <span className="font-bold">Technical Skills:</span>{' '}
                {editable ? <RichText html={data.additional.skills} placeholder="Skills…" onCommit={(v) => setAdditional({ skills: v })} /> : <Html html={data.additional.skills} />}
              </Bullet>
              {(editable || data.additional.interests) && (
                <Bullet marker={data.additional.bulletStyle === 'number' ? '2.' : '•'}>
                  <span className="font-bold">Interests:</span>{' '}
                  {editable ? <RichText html={data.additional.interests} placeholder="Interests…" onCommit={(v) => setAdditional({ interests: v })} /> : <Html html={data.additional.interests} />}
                </Bullet>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Memoized so the Studio's toolbar-state changes (on caret move) never
// re-render / reset the editable resume — only real data changes do.
export const CvPreview = React.memo(CvPreviewBase);
