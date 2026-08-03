'use client';

import React, { useState } from 'react';
import {
  Copy,
  Download,
  Check,
  Sparkles,
  Code,
  Eye,
  Terminal,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  Palette
} from 'lucide-react';
import { GithubIcon } from './icons';
import { GithubProfileData } from '../types';

interface GithubEditorProps {
  data: GithubProfileData;
  onChange: (newData: GithubProfileData) => void;
  onAIRefine: (prompt: string) => void;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
}

export const GithubEditor: React.FC<GithubEditorProps> = ({
  data,
  onChange,
  onAIRefine,
  isLoggedIn,
  onRequireAuth
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');

  const availableBadges = [
    { name: 'TypeScript', color: '3178C6', logo: 'typescript' },
    { name: 'JavaScript', color: 'F7DF1E', logo: 'javascript' },
    { name: 'React', color: '61DAFB', logo: 'react' },
    { name: 'Next.js', color: '000000', logo: 'next.js' },
    { name: 'Python', color: '3776AB', logo: 'python' },
    { name: 'PyTorch', color: 'EE4C2C', logo: 'pytorch' },
    { name: 'FastAPI', color: '009688', logo: 'fastapi' },
    { name: 'Node.js', color: '339933', logo: 'node.js' },
    { name: 'TailwindCSS', color: '06B6D4', logo: 'tailwindcss' },
    { name: 'PostgreSQL', color: '4169E1', logo: 'postgresql' },
    { name: 'Docker', color: '2496ED', logo: 'docker' },
    { name: 'Git', color: 'F05032', logo: 'git' }
  ];

  const toggleBadge = (tech: string) => {
    if (data.techStack.includes(tech)) {
      onChange({ ...data, techStack: data.techStack.filter(t => t !== tech) });
    } else {
      onChange({ ...data, techStack: [...data.techStack, tech] });
    }
  };

  // Generate full raw Markdown output
  const generateMarkdown = () => {
    let md = `# ${data.title}\n\n`;
    md += `${data.about}\n\n`;

    if (data.techStack.length > 0) {
      md += `### 🛠️ Tech Stack & Skills\n\n`;
      data.techStack.forEach(tech => {
        const badge = availableBadges.find(b => b.name.toLowerCase() === tech.toLowerCase()) || { color: '6366f1', logo: tech.toLowerCase() };
        md += `![${tech}](https://img.shields.io/badge/${encodeURIComponent(tech)}-${badge.color}?style=for-the-badge&logo=${badge.logo}&logoColor=white) `;
      });
      md += `\n\n`;
    }

    if (data.showStatsCard || data.showStreakCard || data.showTopLangsCard) {
      md += `### 📊 GitHub Analytics\n\n`;
      md += `<p align="center">\n`;
      if (data.showStatsCard) {
        md += `  <img src="https://github-readme-stats.vercel.app/api?username=${data.username}&show_icons=true&theme=${data.theme}" alt="GitHub Stats" />\n`;
      }
      if (data.showTopLangsCard) {
        md += `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${data.username}&layout=compact&theme=${data.theme}" alt="Top Languages" />\n`;
      }
      if (data.showStreakCard) {
        md += `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${data.username}&theme=${data.theme}" alt="GitHub Streak" />\n`;
      }
      md += `</p>\n\n`;
    }

    if (data.customSections && data.customSections.length > 0) {
      data.customSections.forEach(sec => {
        md += `### ${sec.title}\n${sec.content}\n\n`;
      });
    }

    if (data.socialLinks.linkedin || data.socialLinks.twitter || data.socialLinks.email) {
      md += `### 🌐 Connect With Me\n\n`;
      if (data.socialLinks.linkedin) md += `[<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />](${data.socialLinks.linkedin}) `;
      if (data.socialLinks.twitter) md += `[<img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" />](${data.socialLinks.twitter}) `;
      if (data.socialLinks.email) md += `[<img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" />](mailto:${data.socialLinks.email}) `;
      md += `\n`;
    }

    return md;
  };

  const fullMarkdown = generateMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([fullMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "README.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

      {/* Left Settings & Inputs */}
      <div className="lg:col-span-5 flex flex-col gap-4">

        <div className="glass-panel p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
              <GithubIcon className="w-4 h-4 text-indigo-400" />
              <span>GitHub README Controls</span>
            </div>
            <button
              onClick={() => onAIRefine('generate_github')}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Bio Generator</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">GitHub Username</label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => onChange({ ...data, username: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
              placeholder="e.g. alexrivera-ai"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Profile Catchy Headline</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">About Me Bio</label>
            <textarea
              rows={4}
              value={data.about}
              onChange={(e) => onChange({ ...data, about: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Tech Badges Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-2 block flex items-center justify-between">
              <span>Tech Stack Badges</span>
              <span className="text-[10px] text-indigo-400">{data.techStack.length} selected</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableBadges.map((badge) => {
                const isSelected = data.techStack.includes(badge.name);
                return (
                  <button
                    key={badge.name}
                    onClick={() => toggleBadge(badge.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    {badge.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analytics Cards Toggles */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">GitHub Stats Widgets</label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300">Stats Overview Card</span>
              <input
                type="checkbox"
                checked={data.showStatsCard}
                onChange={(e) => onChange({ ...data, showStatsCard: e.target.checked })}
                className="rounded accent-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300">Top Languages Widget</span>
              <input
                type="checkbox"
                checked={data.showTopLangsCard}
                onChange={(e) => onChange({ ...data, showTopLangsCard: e.target.checked })}
                className="rounded accent-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300">Commit Streak Counter</span>
              <input
                type="checkbox"
                checked={data.showStreakCard}
                onChange={(e) => onChange({ ...data, showStreakCard: e.target.checked })}
                className="rounded accent-indigo-500"
              />
            </label>
          </div>

          {/* Theme Theme Picker */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Stats Theme</label>
            <select
              value={data.theme}
              onChange={(e) => {
                if (!isLoggedIn) { onRequireAuth(); return; }
                onChange({ ...data, theme: e.target.value as any });
              }}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none bg-slate-900"
            >
              <option value="dark">Dark Theme</option>
              <option value="tokyonight">Tokyo Night</option>
              <option value="dracula">Dracula</option>
              <option value="radial">Radial Glow</option>
              <option value="cyberpunk">Cyberpunk</option>
            </select>
          </div>

        </div>

      </div>

      {/* Right Studio Live Preview & Raw Code */}
      <div className="lg:col-span-7 flex flex-col gap-3">

        {/* Toggle View & Actions */}
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'visual'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'code'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Markdown Source</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download README.md</span>
            </button>
          </div>
        </div>

        {/* Display Container */}
        <div className="flex-1 p-6 bg-slate-950 rounded-2xl border border-slate-800 overflow-y-auto max-h-[calc(100vh-210px)]">
          {viewMode === 'visual' ? (
            <div className="space-y-6 text-slate-200 font-sans">

              {/* GitHub Styled Header */}
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{data.title}</span>
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                  {data.about}
                </p>
              </div>

              {/* Tech Stack Badges Render */}
              {data.techStack.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Tech Stack & Tools</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {data.techStack.map((tech) => {
                      const badge = availableBadges.find(b => b.name.toLowerCase() === tech.toLowerCase()) || { color: '6366f1' };
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                          style={{ backgroundColor: `#${badge.color}` }}
                        >
                          {tech}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Analytics Preview Widgets */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  GitHub Live Analytics Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.showStatsCard && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                      <div className="text-xs font-bold text-slate-300 mb-2">GitHub Stats Card</div>
                      <div className="h-28 rounded bg-slate-800/80 flex items-center justify-center text-xs text-slate-400 border border-slate-700/50">
                        📊 [ Live GitHub Stats Widget for @{data.username} ]
                      </div>
                    </div>
                  )}
                  {data.showTopLangsCard && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                      <div className="text-xs font-bold text-slate-300 mb-2">Top Languages Breakdown</div>
                      <div className="h-28 rounded bg-slate-800/80 flex items-center justify-center text-xs text-slate-400 border border-slate-700/50">
                        ⚡ [ Top Languages Graph for @{data.username} ]
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <pre className="font-mono text-xs text-indigo-300 bg-slate-900/90 p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {fullMarkdown}
            </pre>
          )}
        </div>

      </div>

    </div>
  );
};
