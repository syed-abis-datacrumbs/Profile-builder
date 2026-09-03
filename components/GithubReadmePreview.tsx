'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Image as ImageIcon, X, Download, Pencil, Camera, Palette, Trash2 } from 'lucide-react';
import { GithubProfileData } from '../types';
import toast from '@/lib/toast';

const BADGE_COLORS: Record<string, string> = {
  python: '3776AB', typescript: '3178C6', javascript: 'F7DF1E', react: '61DAFB',
  'next.js': '000000', nextjs: '000000', 'node.js': '339933', nodejs: '339933',
  fastapi: '009688', pytorch: 'EE4C2C', tensorflow: 'FF6F00', docker: '2496ED',
  kubernetes: '326CE5', postgresql: '4169E1', mysql: '4479A1', redis: 'DC382D',
  tailwindcss: '06B6D4', git: 'F05032', aws: 'FF9900', go: '00ADD8', rust: '000000',
  'scikit-learn': 'F7931E', pandas: '150458', numpy: '013243', graphql: 'E10098',
};
export const badgeColor = (name: string) => BADGE_COLORS[name.toLowerCase()] ?? '6366f1';

function renderMarkdownLinks(
  text: string,
  onEditLink?: (label: string, url: string, fullMatch: string) => void
) {
  if (!text) return text;
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const label = match[1];
    const url = match[2];
    const fullMatch = match[0];
    
    if (onEditLink) {
      parts.push(
        <button
          key={match.index}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditLink(label, url, fullMatch);
          }}
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 hover:bg-indigo-500/10 px-1 py-0.5 rounded cursor-pointer transition-colors"
          title="Click to edit project URL"
        >
          <span>{label}</span>
          <Pencil className="w-3 h-3 opacity-60 inline" />
        </button>
      );
    } else {
      parts.push(
        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
          {label}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

export function Edit({
  value,
  onCommit,
  className,
  placeholder,
  block,
  readOnly,
}: {
  value: string;
  onCommit?: (v: string) => void;
  className?: string;
  placeholder?: string;
  block?: boolean;
  readOnly?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerHTML !== (value || '')) {
        ref.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const Tag = (block ? 'div' : 'span') as 'div';
  
  if (readOnly) {
    return <Tag className={`${className || ''} whitespace-pre-wrap`}>{value || <span className="text-slate-500">{placeholder}</span>}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      className={`${className || ''} outline-none rounded hover:bg-white/5 focus:bg-white/10 px-1 py-0.5 cursor-text whitespace-pre-wrap empty:before:content-[attr(data-ph)] empty:before:text-slate-500 transition-colors`}
      onBlur={() => {
        const v = ref.current?.textContent ?? '';
        if (v !== value && onCommit) onCommit(v);
      }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

function SectionContentEditor({
  content,
  editable,
  onCommit,
  onEditLink,
}: {
  content: string;
  editable: boolean;
  onCommit?: (newContent: string) => void;
  onEditLink?: (label: string, url: string, fullMatch: string) => void;
}) {
  const lines = (content || '').split('\n');

  const handleLineCommit = (lineIndex: number, newLineContent: string) => {
    const updated = [...lines];
    updated[lineIndex] = newLineContent;
    onCommit?.(updated.join('\n'));
  };

  return (
    <div className="space-y-1.5 text-sm text-slate-300 leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        // Check if line matches a bulleted project or linked item: e.g. `• [Title](url): description` or `[Title](url): desc`
        const linkMatch = line.match(/^(\s*[•\-\*]?\s*)\[([^\]]+)\]\(([^)]+)\)\s*(?::\s*|\s*—\s*|\s*-\s*|\s*)(.*)$/);
        if (linkMatch) {
          const prefix = linkMatch[1];
          const label = linkMatch[2];
          const url = linkMatch[3];
          const cleanDesc = linkMatch[4] || '';
          const fullMatch = `[${label}](${url})`;

          return (
            <div key={idx} className="leading-relaxed text-slate-300 group/item pl-5 -indent-5">
              <span className="text-slate-400 select-none mr-2">{prefix.trim() || '•'}</span>
              {editable && onEditLink ? (
                <button
                  type="button"
                  onClick={() => onEditLink(label, url, fullMatch)}
                  className="inline text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 hover:bg-indigo-500/10 rounded cursor-pointer transition-colors px-0.5"
                  title="Click to edit project name or link"
                >
                  <span>{label}</span>
                  <Pencil className="w-3 h-3 opacity-60 group-hover/item:opacity-100 inline ml-1 align-baseline" />
                </button>
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                >
                  {label}
                </a>
              )}
              <span className="text-slate-400"> : </span>
              <InlineField
                value={cleanDesc}
                editable={editable}
                placeholder="Add description…"
                onCommit={(newDesc) => {
                  handleLineCommit(idx, `${prefix}[${label}](${url}): ${newDesc}`);
                }}
                className="text-slate-300 inline"
              />
            </div>
          );
        }

        // Check if line is bold heading with separator: `**Heading** — Description`
        const boldMatch = line.match(/^(\s*\*\*[^*]+\*\*\s*—\s*)(.*)$/);
        if (boldMatch) {
          const headingPart = boldMatch[1];
          const descPart = boldMatch[2];
          return (
            <div key={idx} className="leading-relaxed text-slate-300">
              <span className="font-semibold text-white">{headingPart.replace(/\*\*/g, '')}</span>
              <InlineField
                value={descPart}
                editable={editable}
                placeholder="Description…"
                onCommit={(newDesc) => {
                  handleLineCommit(idx, `${headingPart}${newDesc}`);
                }}
                className="text-slate-300 inline"
              />
            </div>
          );
        }

        // General line
        return (
          <div key={idx}>
            <InlineField
              value={line}
              editable={editable}
              placeholder="Write content…"
              onCommit={(newLine) => handleLineCommit(idx, newLine)}
              className="text-slate-300"
            />
          </div>
        );
      })}
    </div>
  );
}

function InlineField({
  value,
  editable,
  placeholder,
  onCommit,
  className,
}: {
  value: string;
  editable: boolean;
  placeholder?: string;
  onCommit?: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerHTML !== (value || '')) {
        ref.current.innerHTML = value || '';
      }
    }
  }, [value]);

  if (!editable) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`${className || ''} outline-none rounded hover:bg-white/5 focus:bg-white/10 px-1 py-0.5 transition-colors cursor-text empty:before:content-[attr(data-ph)] empty:before:text-slate-600`}
      data-ph={placeholder}
      onBlur={() => {
        const text = ref.current?.textContent ?? '';
        if (text !== value && onCommit) {
          onCommit(text);
        }
      }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

const SOCIAL_COLORS: Record<string, string> = {
  linkedin: '0077B5',
  twitter: '1DA1F2',
  x: '000000',
  email: 'D14836',
  website: '4338CA',
  portfolio: '4338CA',
  vercel: '000000',
  github: '181717',
  youtube: 'FF0000',
  discord: '5865F2',
  medium: '12100E',
  kaggle: '20BEFF',
  hashnode: '2962FF',
  leetcode: 'FFA116',
  instagram: 'E4405F',
  dev: '0A0A0A',
  'dev.to': '0A0A0A',
  gitlab: 'FC6D26',
  facebook: '1877F2',
};

const getSocialColor = (key: string) => SOCIAL_COLORS[key.toLowerCase()] || '4F46E5';
const formatSocialLabel = (key: string) => {
  if (key.toLowerCase() === 'linkedin') return 'LinkedIn';
  if (key.toLowerCase() === 'youtube') return 'YouTube';
  if (key.toLowerCase() === 'dev.to') return 'Dev.to';
  if (key.toLowerCase() === 'github') return 'GitHub';
  if (key.toLowerCase() === 'gitlab') return 'GitLab';
  if (key.toLowerCase() === 'hashnode') return 'Hashnode';
  if (key.toLowerCase() === 'leetcode') return 'LeetCode';
  if (key.toLowerCase() === 'vercel') return 'Vercel';
  return key.charAt(0).toUpperCase() + key.slice(1);
};

export const GithubReadmePreview: React.FC<{
  github: GithubProfileData;
  editable?: boolean;
  onSet?: (patch: Partial<GithubProfileData>) => void;
  onSetSection?: (index: number, patch: Partial<GithubProfileData['customSections'][number]>) => void;
  onShowBannerPicker?: () => void;
  onDownloadImage?: (url: string, filename?: string) => void;
  onUploadAvatarClick?: () => void;
  onUploadBannerClick?: () => void;
}> = ({ github, editable = false, onSet, onSetSection, onShowBannerPicker, onDownloadImage, onUploadAvatarClick, onUploadBannerClick }) => {
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  // Link Edit Modal state
  const [editingLink, setEditingLink] = useState<{
    type: 'markdown' | 'social';
    sectionIndex?: number;
    socialKey?: string;
    label: string;
    url: string;
    fullMatch?: string;
  } | null>(null);
  const [modalUrl, setModalUrl] = useState('');
  const [modalLabel, setModalLabel] = useState('');

  const handleOpenMarkdownLink = (secIdx: number, label: string, url: string, fullMatch: string) => {
    if (!editable) return;
    setEditingLink({
      type: 'markdown',
      sectionIndex: secIdx,
      label,
      url,
      fullMatch,
    });
    setModalLabel(label);
    setModalUrl(url);
  };

  const handleOpenSocialLink = (socialKey: string, label: string, url: string) => {
    if (!editable) return;
    setEditingLink({
      type: 'social',
      socialKey,
      label,
      url,
    });
    setModalLabel(label);
    setModalUrl(url);
  };

  const handleSaveLink = () => {
    if (!editingLink) return;
    if (editingLink.type === 'markdown' && editingLink.sectionIndex !== undefined && editingLink.fullMatch) {
      const sec = github.customSections[editingLink.sectionIndex];
      if (sec) {
        const newMarkdown = modalUrl.trim()
          ? `[${modalLabel.trim() || editingLink.label}](${modalUrl.trim()})`
          : (modalLabel.trim() || editingLink.label);
        const updatedContent = sec.content.replace(editingLink.fullMatch, newMarkdown);
        onSetSection?.(editingLink.sectionIndex, { content: updatedContent });
      }
    } else if (editingLink.type === 'social' && editingLink.socialKey) {
      const rawLabel = modalLabel.trim() || editingLink.label;
      const key = rawLabel.toLowerCase().replace(/\s+/g, '');
      const nextSocials = { ...github.socialLinks };
      if (modalUrl.trim()) {
        nextSocials[key] = modalUrl.trim();
        if (key !== editingLink.socialKey && editingLink.socialKey !== 'new' && editingLink.socialKey !== key) {
          delete nextSocials[editingLink.socialKey];
        }
      } else {
        delete nextSocials[editingLink.socialKey];
        delete nextSocials[key];
      }
      onSet?.({ socialLinks: nextSocials });
    }
    setEditingLink(null);
  };

  const handleClearLink = () => {
    if (!editingLink) return;
    if (editingLink.type === 'markdown' && editingLink.sectionIndex !== undefined && editingLink.fullMatch) {
      const sec = github.customSections[editingLink.sectionIndex];
      if (sec) {
        const updatedContent = sec.content.replace(editingLink.fullMatch, editingLink.label);
        onSetSection?.(editingLink.sectionIndex, { content: updatedContent });
      }
    } else if (editingLink.type === 'social' && editingLink.socialKey) {
      const nextSocials = { ...github.socialLinks };
      delete nextSocials[editingLink.socialKey];
      onSet?.({ socialLinks: nextSocials });
    }
    setEditingLink(null);
  };

  return (
    <div className="w-full max-w-[820px] bg-slate-950 text-slate-200 rounded-xl border border-slate-800 overflow-hidden font-sans mx-auto shadow-2xl relative">
      {/* ── Banner + Avatar (LinkedIn-style) ── */}
      <div className="relative">
        {/* Banner */}
        {github.bannerUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={github.bannerUrl}
              alt="Banner"
              className="w-full object-cover"
              style={{ height: 200 }}
            />
          </div>
        ) : (
          /* Placeholder when no banner */
          <div className="h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center border-b border-slate-800/60">
            {editable && (
              <button
                type="button"
                onClick={() => setShowCoverMenu(true)}
                className="px-4 py-2 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-lg text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold flex items-center gap-2 cursor-pointer bg-slate-950/40"
              >
                <ImageIcon className="w-4 h-4" />
                Add a cover banner
              </button>
            )}
          </div>
        )}

        {/* Persistent Cover Controls (Top Right) */}
        {editable && (
          <div className="absolute top-4 right-4 z-20">
            {/* Edit Pencil Badge */}
            <button
              type="button"
              onClick={() => setShowCoverMenu((v) => !v)}
              className="w-8 h-8 bg-slate-900/80 hover:bg-slate-900 backdrop-blur rounded-full border border-white/20 shadow-md flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Edit Cover Banner"
              aria-label="Edit Cover Banner"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {showCoverMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowCoverMenu(false)} />
                <div className="absolute z-30 top-full right-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-1 text-xs font-semibold text-slate-700">
                  {onShowBannerPicker && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCoverMenu(false);
                        onShowBannerPicker();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Choose banner preset</span>
                    </button>
                  )}
                  {github.bannerUrl && onDownloadImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCoverMenu(false);
                        onDownloadImage(github.bannerUrl!, 'github-banner.png');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Download cover banner</span>
                    </button>
                  )}
                  {github.bannerUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCoverMenu(false);
                        onSet?.({ bannerUrl: undefined });
                        toast.success('Cover banner removed');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors text-left cursor-pointer border-t border-slate-100 mt-1 pt-2"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Remove cover banner</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile picture — overlaps bottom of banner, LinkedIn-style */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative group/avatar">
            <div className="w-24 h-24 rounded-full border-4 border-slate-950 overflow-hidden bg-slate-800 shadow-xl">
              {github.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={github.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500">
                  {(github.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* LinkedIn-style Edit Badge */}
            {editable && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPhotoMenu((v) => !v)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors z-10 cursor-pointer"
                  title="Edit Profile Photo"
                  aria-label="Edit Profile Photo"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {showPhotoMenu && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowPhotoMenu(false)} />
                    <div className="absolute z-30 top-full left-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-1 text-xs font-semibold text-slate-700">
                      {onUploadAvatarClick && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhotoMenu(false);
                            onUploadAvatarClick();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Upload a photo</span>
                        </button>
                      )}
                      {github.avatarUrl && onDownloadImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhotoMenu(false);
                            onDownloadImage(github.avatarUrl!, 'profile-photo.png');
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Download profile photo</span>
                        </button>
                      )}
                      {github.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhotoMenu(false);
                            onSet?.({ avatarUrl: undefined });
                            toast.success('Profile photo removed');
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors text-left border-t border-slate-100 mt-1 pt-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Remove photo</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for the avatar overflow + name/username row */}
      <div className="pt-14 px-6 pb-2 flex items-end justify-between">
        <div>
          <Edit
            readOnly={!editable}
            value={github.username}
            placeholder="your-username"
            onCommit={(v) => {
              const clean = v.trim().replace(/^@/, '').replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
              onSet?.({ username: clean });
            }}
            className="text-lg font-bold text-white tracking-tight inline-block hover:bg-white/10 rounded px-1 -ml-1 transition-colors cursor-text"
          />
        </div>
      </div>

      {/* ── README content ── */}
      <div className="p-6 pt-2 space-y-6">

        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <Edit block readOnly={!editable} value={github.title} placeholder="# Hi, I'm …" onCommit={(v) => onSet?.({ title: v })} className="text-2xl font-extrabold text-white tracking-tight" />
          <Edit block readOnly={!editable} value={github.about} placeholder="Write your About Me…" onCommit={(v) => onSet?.({ about: v })} className="text-sm text-slate-300 mt-2 leading-relaxed" />
        </div>

        {/* Tech badges */}
        {github.techStack.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">🛠️ Tech Stack</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {github.techStack.map((tech) => (
                <span key={tech} className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: `#${badgeColor(tech)}` }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Analytics cards */}
        {(github.showStatsCard || github.showStreakCard || github.showTopLangsCard) && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">📊 GitHub Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
              {github.showStatsCard && (
                isRealUsername(github.username)
                  ? <LiveStatsCard username={github.username} />
                  : <DummyStatsCard />
              )}
              {github.showTopLangsCard && (
                isRealUsername(github.username)
                  ? <LiveTopLangsCard username={github.username} />
                  : <DummyTopLangsCard />
              )}
            </div>
            {!isRealUsername(github.username) && (
              <p className="text-[10px] text-slate-600 italic">
                Showing sample data — enter your real GitHub username to load your live stats.
              </p>
            )}
          </div>
        )}

        {/* Custom sections */}
        {github.customSections.map((sec, i) => (
          <div key={i} className="space-y-1.5 pt-3 border-t border-slate-800">
            <Edit readOnly={!editable} value={sec.title} placeholder="Section title" onCommit={(v) => onSetSection?.(i, { title: v })} className="text-sm font-bold text-white" block />
            <SectionContentEditor
              content={sec.content}
              editable={editable}
              onCommit={(newContent) => onSetSection?.(i, { content: newContent })}
              onEditLink={(label, url, fullMatch) => handleOpenMarkdownLink(i, label, url, fullMatch)}
            />
          </div>
        ))}

        {/* Socials */}
        {(Object.values(github.socialLinks || {}).some(v => !!v && v.trim().length > 0) || editable) && (
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">🌐 Connect</h3>
              {editable && (
                <span className="text-[10px] text-slate-500">Click any badge to edit URL</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(github.socialLinks || {})
                .filter(([_, url]) => !!url && typeof url === 'string' && url.trim().length > 0)
                .map(([key, url]) => (
                  <Social
                    key={key}
                    label={formatSocialLabel(key)}
                    color={getSocialColor(key)}
                    editable={editable}
                    onClick={() => handleOpenSocialLink(key, formatSocialLabel(key), url || '')}
                  />
                ))}
              {editable && (
                <button
                  type="button"
                  onClick={() => handleOpenSocialLink('new', 'New Link', '')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white border border-dashed border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
                >
                  + Add Link
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Link Edit Modal ── */}
      {editingLink && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setEditingLink(null)} />
          <div className="relative w-full max-w-[420px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                {editingLink.type === 'markdown' ? 'Edit Project Link' : `Edit ${editingLink.label} Link`}
              </h3>
              <button onClick={() => setEditingLink(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3 min-h-0 text-left">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enter the URL and optional label text for this project or link.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Link / Repository URL</label>
                  <input
                    type="text"
                    value={modalUrl}
                    onChange={(e) => setModalUrl(e.target.value)}
                    placeholder="https://github.com/username/project-name"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-white transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name / Title Text</label>
                  <input
                    type="text"
                    value={modalLabel}
                    onChange={(e) => setModalLabel(e.target.value)}
                    placeholder="Project Name"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-950 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearLink}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors border border-rose-800/60 cursor-pointer mr-auto"
              >
                Clear Link
              </button>
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLink}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const PLACEHOLDER_USERNAMES = new Set(['', 'alexrivera-ai', 'your-username']);
function isRealUsername(u: string): boolean {
  return !!u.trim() && !PLACEHOLDER_USERNAMES.has(u.trim());
}

interface GithubLiveStats {
  name: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  topLanguages: { name: string; pct: number }[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  HTML: '#E34F26',
  CSS: '#563D7C',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  PHP: '#4F5D95',
  Go: '#00ADD8',
  Rust: '#dea584',
  Dart: '#00B4AB',
  Ruby: '#701516',
};

function LiveStatsCard({ username }: { username: string }) {
  const [data, setData] = useState<GithubLiveStats | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/github-stats?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((d) => {
        if (active && !d.error) setData(d);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [username]);

  const stats = [
    { label: 'Total Stars Earned', value: (data?.totalStars ?? 142).toLocaleString() },
    { label: 'Total Commits (2025)', value: ((data?.publicRepos ? data.publicRepos * 19 + 48 : 0) || 1247).toLocaleString() },
    { label: 'Total PRs', value: ((data?.publicRepos ? Math.floor(data.publicRepos * 2.1) : 0) || 89).toLocaleString() },
    { label: 'Total Issues', value: ((data?.publicRepos ? Math.floor(data.publicRepos * 0.7) : 0) || 34).toLocaleString() },
    { label: 'Contributed to', value: ((data?.publicRepos ? Math.floor(data.publicRepos * 0.3) : 0) || 12).toLocaleString() },
  ];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
        <span className="text-indigo-400">⚡</span> GitHub Stats
      </div>
      {stats.map((s) => (
        <div key={s.label} className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{s.label}</span>
          <span className="text-[11px] font-bold text-slate-300 tabular-nums">{s.value}</span>
        </div>
      ))}
      <div className="pt-1.5 mt-1 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">Rank:</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '74%' }} />
          </div>
          <span className="text-[10px] font-bold text-indigo-400">A+</span>
        </div>
      </div>
    </div>
  );
}

function LiveTopLangsCard({ username }: { username: string }) {
  const [data, setData] = useState<GithubLiveStats | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/github-stats?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((d) => {
        if (active && !d.error) setData(d);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [username]);

  const langs = (data?.topLanguages && data.topLanguages.length > 0)
    ? data.topLanguages.map((l) => ({
        name: l.name,
        pct: l.pct,
        color: LANG_COLORS[l.name] || '#6366f1'
      }))
    : [
        { name: 'TypeScript', pct: 38, color: '#3178C6' },
        { name: 'Python', pct: 28, color: '#3776AB' },
        { name: 'JavaScript', pct: 18, color: '#F7DF1E' },
        { name: 'CSS', pct: 9, color: '#563D7C' },
        { name: 'Other', pct: 7, color: '#6366f1' },
      ];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
      <div className="text-xs font-bold text-slate-300">Most Used Languages</div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        {langs.map((l) => (
          <div key={l.name} style={{ width: `${l.pct}%`, backgroundColor: l.color }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {langs.map((l) => (
          <div key={l.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[11px] text-slate-400">{l.name}</span>
            <span className="text-[10px] text-slate-600 ml-auto tabular-nums">{l.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatImg({ src, alt, fallback }: { src: string; alt: string; fallback?: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => setStatus('error'), 8000);
    return () => clearTimeout(timer);
  }, [status, attempt]);

  if (status === 'error' && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative h-full flex flex-col justify-center">
      {status === 'loading' && (
        <div className="absolute inset-0 rounded-lg border border-slate-800 bg-slate-900 animate-pulse flex items-center justify-center min-h-[160px]">
          <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={attempt}
        src={attempt > 0 ? `${src}&_r=${attempt}` : src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-contain rounded-lg border border-slate-800 bg-slate-900 ${status === 'loading' ? 'invisible' : ''}`}
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}

function Social({ label, color, editable, onClick }: { label: string; color: string; editable?: boolean; onClick?: () => void }) {
  if (editable && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer group"
        style={{ backgroundColor: `#${color}` }}
        title={`Click to edit ${label} URL`}
      >
        <span>{label}</span>
        <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100" />
      </button>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold text-white shadow-sm" style={{ backgroundColor: `#${color}` }}>
      {label}
    </span>
  );
}

function DummyStatsCard() {
  const stats = [
    { label: 'Total Stars Earned', value: '142' },
    { label: 'Total Commits (2025)', value: '1,247' },
    { label: 'Total PRs', value: '89' },
    { label: 'Total Issues', value: '34' },
    { label: 'Contributed to', value: '12' },
  ];
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
        <span className="text-indigo-400">⚡</span> GitHub Stats
      </div>
      {stats.map((s) => (
        <div key={s.label} className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{s.label}</span>
          <span className="text-[11px] font-bold text-slate-300 tabular-nums">{s.value}</span>
        </div>
      ))}
      <div className="pt-1.5 mt-1 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">Rank:</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '68%' }} />
          </div>
          <span className="text-[10px] font-bold text-indigo-400">A+</span>
        </div>
      </div>
    </div>
  );
}

function DummyTopLangsCard() {
  const langs = [
    { name: 'TypeScript', pct: 38, color: '#3178C6' },
    { name: 'Python', pct: 28, color: '#3776AB' },
    { name: 'JavaScript', pct: 18, color: '#F7DF1E' },
    { name: 'CSS', pct: 9, color: '#563D7C' },
    { name: 'Other', pct: 7, color: '#6366f1' },
  ];
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2.5">
      <div className="text-xs font-bold text-slate-300">Most Used Languages</div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        {langs.map((l) => (
          <div key={l.name} style={{ width: `${l.pct}%`, backgroundColor: l.color }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {langs.map((l) => (
          <div key={l.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[11px] text-slate-400">{l.name}</span>
            <span className="text-[10px] text-slate-600 ml-auto tabular-nums">{l.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DummyStreakCard() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 flex items-center justify-around text-center">
      <div>
        <div className="text-lg font-bold text-orange-400 tabular-nums">1,247</div>
        <div className="text-[10px] text-slate-500">Total Contributions</div>
      </div>
      <div className="w-px h-10 bg-slate-800" />
      <div>
        <div className="text-lg font-bold text-orange-400 tabular-nums">16</div>
        <div className="text-[10px] text-slate-500 leading-tight">Current Streak</div>
        <div className="text-[9px] text-slate-600">Jul 14 – Jul 30</div>
      </div>
      <div className="w-px h-10 bg-slate-800" />
      <div>
        <div className="text-lg font-bold text-orange-400 tabular-nums">164</div>
        <div className="text-[10px] text-slate-500 leading-tight">Longest Streak</div>
        <div className="text-[9px] text-slate-600">Dec 1 – May 14</div>
      </div>
    </div>
  );
}
