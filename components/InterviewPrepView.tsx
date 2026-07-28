'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Folder, 
  PenTool, 
  Check, 
  ChevronDown, 
  ArrowUpRight, 
  Send,
  HelpCircle,
  Sparkles,
  FileText,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bot,
  Brain,
  Lightbulb,
  Award,
  Layers,
  ChevronRight,
  Code2
} from 'lucide-react';

interface InterviewPrepViewProps {
  userName?: string;
  onUsePrompt: (promptText: string) => void;
  onLaunchMockInterview: (role: string, jdText: string) => void;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  userName = "Abis",
  onUsePrompt,
  onLaunchMockInterview
}) => {
  const [jdInput, setJdInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('Senior Full Stack Engineer');
  const [difficulty, setDifficulty] = useState<'Mid' | 'Senior' | 'Staff'>('Senior');
  const [questionCategory, setQuestionCategory] = useState<'All' | 'Technical' | 'System Design' | 'Behavioral'>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Active quiz state
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: number]: boolean }>({});

  // Preset Sample JDs
  const sampleJDs = [
    {
      title: "Senior Full Stack Engineer @ Netflix",
      text: "We are seeking a Senior Full Stack Engineer to architect high-throughput streaming services and React/Next.js micro-frontends. Expertise in TypeScript, Node.js, Distributed Caching (Redis), and GraphQL required."
    },
    {
      title: "Staff AI Engineer @ OpenAI",
      text: "OpenAI is hiring a Staff AI Systems Engineer to build scalable training & inference infrastructure. Requires deep expertise in Python, PyTorch, CUDA, LLM Fine-tuning, and RAG pipelines."
    },
    {
      title: "Lead Product Manager @ Stripe",
      text: "Stripe is looking for a Lead Product Manager to drive developer experience and API billing products. Must possess strong technical strategy, metric-driven roadmap execution, and cross-functional leadership."
    }
  ];

  // Generated Practice Questions
  const [questions, setQuestions] = useState([
    {
      id: 1,
      category: "Technical",
      question: "How would you optimize React server components rendering in Next.js when fetching high-frequency data from a Redis cache?",
      options: [
        "Use client-side polling with setInterval inside useEffect",
        "Implement React cache() and unstable_cache() with revalidate tags for granular server-side revalidation",
        "Convert all server components to client components using 'use client'",
        "Disable caching completely and rely on browser local storage"
      ],
      correctIndex: 1,
      explanation: "Using React's cache() and Next.js unstable_cache() with revalidate tags allows high-performance server-side data fetching while ensuring data stays fresh without sacrificing Server Component benefits."
    },
    {
      id: 2,
      category: "System Design",
      question: "When designing a distributed rate limiter for 100,000 requests per second, which algorithm best balances memory usage and accuracy?",
      options: [
        "Fixed Window Counter in relational MySQL database",
        "Sliding Window Log with Redis sorted sets (ZSET)",
        "Token Bucket using Redis Lua scripts for atomic increment operations",
        "Client-side local storage counter"
      ],
      correctIndex: 2,
      explanation: "The Token Bucket algorithm using atomic Redis Lua scripts prevents race conditions across multi-region API gateways while maintaining low latency and minimal memory overhead."
    },
    {
      id: 3,
      category: "Behavioral",
      question: "Tell me about a time you resolved a major technical disagreement between senior engineers regarding architecture.",
      framework: "STAR Method Framework",
      situation: "Disagreement during migration from monolithic REST API to microservices GraphQL engine.",
      action: "Facilitated benchmark spikes, established quantitative SLA metrics, and created an RFC review process.",
      result: "Achieved team consensus, reducing API response times by 35% without delaying launch timelines."
    }
  ]);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
      setUserAnswers({});
      setRevealedAnswers({});
    }, 900);
  };

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const toggleReveal = (qId: number) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-300">
      
      {/* Header Greeting */}
      <div className="text-center pt-2 space-y-2">
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-slate-900">
          AI Interview & Test Generator, {userName.split(' ')[0]}.
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">
          Paste any Job Description to generate tailored technical tests, system design challenges, and real-time AI mock interviews.
        </p>
      </div>

      {/* Main JD Submission Box */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Target Job Description or Role</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Difficulty:</span>
            {(['Mid', 'Senior', 'Staff'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  difficulty === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          rows={3}
          value={jdInput}
          onChange={(e) => setJdInput(e.target.value)}
          placeholder="Paste Job Description here (e.g. Senior Full Stack Engineer requirements, skills, responsibilities...)"
          className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 focus:border-slate-400 focus:bg-white transition-all"
        />

        {/* Preset Sample JDs */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or select a sample Job Description:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleJDs.map((sample, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  setJdInput(sample.text);
                  setSelectedRole(sample.title);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/60 text-slate-700 text-xs font-semibold transition-all text-left truncate"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              <span>Smart Question Generator</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Custom Test...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Practice Test</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Generated Test Suite & Practice Quiz */}
      <div className="space-y-6">
        
        {/* Section Title & Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Custom Interview Practice Suite</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tailored questions generated for: <strong className="text-slate-800">{selectedRole} ({difficulty} Level)</strong>
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Technical', 'System Design', 'Behavioral'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setQuestionCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  questionCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-5">
          {questions
            .filter(q => questionCategory === 'All' || q.category === questionCategory)
            .map((q, idx) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                      {q.category}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleReveal(q.id)}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>{revealedAnswers[q.id] ? "Hide Explanation" : "Reveal Answer & Explanation"}</span>
                  </button>
                </div>

                {/* Question Title */}
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {q.question}
                </h4>

                {/* Multiple Choice Options (if present) */}
                {q.options && (
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[q.id] === oIdx;
                      const isCorrect = q.correctIndex === oIdx;
                      const isRevealed = revealedAnswers[q.id];

                      let borderStyle = "border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-800";
                      if (isSelected) {
                        borderStyle = "border-blue-600 bg-blue-50/60 text-blue-900 font-semibold";
                      }
                      if (isRevealed && isCorrect) {
                        borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                      }

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleOptionSelect(q.id, oIdx)}
                          className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${borderStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isRevealed && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Behavioral STAR Framework Breakdown */}
                {q.framework && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs text-slate-800">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>{q.framework} Recommendation</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                        <strong className="text-amber-900 block font-bold mb-1">Situation & Task:</strong>
                        <span className="text-slate-600">{q.situation}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                        <strong className="text-amber-900 block font-bold mb-1">Key Action:</strong>
                        <span className="text-slate-600">{q.action}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                        <strong className="text-amber-900 block font-bold mb-1">Quantified Result:</strong>
                        <span className="text-slate-600">{q.result}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Answer Explanation Box */}
                {revealedAnswers[q.id] && q.explanation && (
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1 animate-in fade-in">
                    <strong className="font-bold block text-blue-950">AI Answer Key & Rationale:</strong>
                    <p className="leading-relaxed text-blue-800">{q.explanation}</p>
                  </div>
                )}

              </div>
            ))}
        </div>

        {/* Live AI Mock Interview Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                Live Simulator
              </span>
              <span className="text-xs text-slate-300 font-medium">Ready for real-time practice?</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Start 1-on-1 AI Voice & Chat Mock Interview
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Launch our AI Interview Copilot pre-configured for <strong className="text-white">{selectedRole}</strong> to simulate real interviewer follow-up questions and receive instant technical feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onLaunchMockInterview(selectedRole, jdInput || "Senior Technical Role")}
            className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 shrink-0 group"
          >
            <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>Launch Mock Interview →</span>
          </button>
        </div>

      </div>

    </div>
  );
};
