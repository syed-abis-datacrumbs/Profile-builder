'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  FileUp,
  Loader2,
  ArrowRight,
  Clipboard,
} from 'lucide-react';
import { GithubIcon } from './icons';
import { CvData } from '../lib/cvTypes';
import { toast } from '../lib/toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (imported: {
    cvData: CvData;
    linkedinData?: any;
    githubData?: any;
  }) => void;
}

type ImportTab = 'pdf' | 'github' | 'text';

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('pdf');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Please upload a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Please drop a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  // 1. Submit PDF
  const handleParsePdf = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus('Reading PDF content...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setLoadingStatus('Structuring career details with AI...');
      const res = await fetch('/api/import/pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume PDF.');
      }

      toast.success('Resume imported successfully!');
      onImportSuccess({
        cvData: data.cvData,
        linkedinData: data.linkedinData,
      });
      onClose();
    } catch (err: any) {
      console.error('[Import PDF error]:', err);
      setErrorMessage(err.message || 'Failed to parse resume PDF.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const cleanGithubUsername = (input: string) => {
    return input
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^github\.com\//i, '')
      .replace(/^@/, '')
      .replace(/\/+$/, '')
      .split('/')[0]
      .split('?')[0]
      .trim();
  };

  // 2. Submit GitHub
  const handleFetchGithub = async () => {
    const cleanUser = cleanGithubUsername(githubUsername);
    if (!cleanUser) {
      setErrorMessage('Please enter a GitHub username or profile URL.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus('Fetching public profile & repositories...');

    try {
      const res = await fetch(
        `/api/import/github?username=${encodeURIComponent(cleanUser)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch GitHub profile.');
      }

      // Convert fetched data into partial CvData and GithubProfileData
      const cvProjects = data.cvProjects || [];
      const cvSkills = (data.cvSkills || []).join(', ');

      const fallbackCv: CvData = {
        personalInfo: {
          fullName: data.userInfo?.name || githubUsername,
          phone: '',
          email: '',
          linkedin: '',
          linkedinLabel: 'LinkedIn',
          github: `https://github.com/${githubUsername}`,
          githubLabel: 'GitHub',
          kaggle: '',
          kaggleLabel: 'Kaggle',
        },
        summary: data.userInfo?.bio || `Software engineer building open-source tools with ${cvSkills}.`,
        education: [],
        workExperience: [],
        projects: cvProjects,
        certifications: [],
        additional: {
          skills: cvSkills,
          interests: 'Open Source, Software Engineering',
        },
      };

      toast.success('GitHub profile & projects imported!');
      onImportSuccess({
        cvData: fallbackCv,
        githubData: data.githubProfileData,
      });
      onClose();
    } catch (err: any) {
      console.error('[Import GitHub error]:', err);
      setErrorMessage(err.message || 'Failed to import GitHub profile.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // 3. Submit Raw Text
  const handleParseText = () => {
    if (!rawText.trim()) return;

    setIsLoading(true);
    setLoadingStatus('Parsing text...');

    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const name = lines[0] || 'Professional';
    const skillsFound =
      rawText.match(
        /React|Next\.js|TypeScript|JavaScript|Python|Node\.js|Node|Tailwind|SQL|PostgreSQL|Docker|AWS|PyTorch|GraphQL|Java|C\+\+|Git/gi
      ) || ['TypeScript', 'React', 'Node.js'];

    const uniqueSkills = Array.from(new Set(skillsFound)).join(', ');

    const fallbackCv: CvData = {
      personalInfo: {
        fullName: name,
        phone: '',
        email: '',
        linkedin: '',
        linkedinLabel: 'LinkedIn',
        github: '',
        githubLabel: 'GitHub',
        kaggle: '',
        kaggleLabel: 'Kaggle',
      },
      summary: rawText.slice(0, 250) + (rawText.length > 250 ? '...' : ''),
      education: [],
      workExperience: [],
      projects: [],
      certifications: [],
      additional: {
        skills: uniqueSkills,
        interests: '',
      },
    };

    setTimeout(() => {
      setIsLoading(false);
      toast.success('Text imported into workspace!');
      onImportSuccess({ cvData: fallbackCv });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-900 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import Profile Data</h2>
              <p className="text-xs text-slate-500">
                Populate your workspace instantly from any existing credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-2 bg-slate-50/50">
          <button
            onClick={() => {
              setActiveTab('pdf');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pdf'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('github');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'github'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5 fill-current" />
            <span>GitHub Auto-Fetch</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('text');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {/* Error banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="text-xs font-semibold text-slate-900">{loadingStatus}</div>
              <div className="text-[11px] text-slate-500">This usually takes 2–4 seconds</div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* TAB 1: PDF UPLOAD */}
              {activeTab === 'pdf' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-indigo-500 bg-indigo-50/60'
                        : selectedFile
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                          <Check className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-slate-900">{selectedFile.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                          <FileUp className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          Drop your resume PDF here or <span className="text-indigo-600 underline">browse</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Supports any standard Resume, CV, or LinkedIn PDF export (up to 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleParsePdf}
                      disabled={!selectedFile || isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse & Populate Resume</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: GITHUB AUTO-FETCH */}
              {activeTab === 'github' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-700 font-semibold">
                      Enter GitHub Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 text-xs font-mono">
                        github.com/
                      </span>
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(cleanGithubUsername(e.target.value))}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData('text');
                          setGithubUsername(cleanGithubUsername(pasted));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFetchGithub();
                        }}
                        placeholder="username or profile link"
                        className="w-full pl-28 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-mono transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Instant 1-click import: fetches your real repositories, primary coding languages,
                      avatar, and bio directly from the GitHub API.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFetchGithub}
                      disabled={!githubUsername.trim() || isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <GithubIcon className="w-3.5 h-3.5 fill-current" />
                      <span>Fetch Profile & Repos</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: RAW TEXT PASTE */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste unformatted resume text, bio summary, or skills list here..."
                    className="w-full p-3.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 leading-relaxed transition-all"
                  />

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleParseText}
                      disabled={!rawText.trim() || isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse Text</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
