'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  PenTool, 
  Check, 
  ChevronDown, 
  ArrowUpRight, 
  Send,
  Briefcase,
  Search,
  Building2,
  MapPin,
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign,
  FileText,
  Users,
  Globe,
  MessageSquare,
  Target,
  ArrowRight,
  ChevronRight,
  Copy,
  ExternalLink,
  UserCheck,
  Award
} from 'lucide-react';
import { LinkedinIcon } from './icons';

interface JobHuntingLandingViewProps {
  userName?: string;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
  onNavigateToTab?: (tab: 'resume' | 'linkedin') => void;
}

export const JobHuntingLandingView: React.FC<JobHuntingLandingViewProps> = ({
  userName = "Abis",
  onUsePrompt,
  onOpenEditorDirectly,
  onNavigateToTab
}) => {
  const [jobRoleInput, setJobRoleInput] = useState('Senior Full Stack Engineer');
  const [activeRole, setActiveRole] = useState('Senior Full Stack Engineer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const presetRoles = [
    "Senior Full Stack Engineer",
    "Product Manager",
    "AI / ML Engineer",
    "DevOps & Cloud Architect",
    "UI/UX Product Designer",
    "Growth Marketing Lead"
  ];

  const handleGeneratePlan = (roleName?: string) => {
    const roleToUse = roleName || jobRoleInput;
    if (!roleToUse.trim()) return;
    setIsGenerating(true);
    setActiveRole(roleToUse);
    setTimeout(() => {
      setIsGenerating(false);
    }, 400);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Structured Execution Plan data tailored to activeRole
  const executionPlan = {
    roleTitle: activeRole,
    // Step 1: Create Resume
    resume: {
      atsScoreTarget: "94%+ ATS Keyword Match",
      recommendedTitle: `${activeRole} | Technical Specialist`,
      topKeywords: ["TypeScript", "Next.js 15 App Router", "Node.js", "Redis Caching", "GraphQL", "AWS/Cloud", "CI/CD Pipelines", "System Design"],
      bulletFormula: "Achieved [Metric X%] by re-architecting [System Y] using [Technology Z], resulting in $120k annual savings.",
      actionTip: "Customize your top 3 work experiences to echo exact tech stack terms found in the target job posting."
    },
    // Step 2: Create LinkedIn
    linkedin: {
      headlineFormula: `${activeRole} @ Scale | Building High-Performance Distributed Systems & Web Products | 5+ YOE`,
      aboutSummary: `Results-driven ${activeRole} with a proven track record of scaling high-traffic web applications and leading technical features from zero to one. Passionate about developer tooling, performance engineering, and user-centric architecture.`,
      profileTips: [
        "Turn on #OpenToWork (visible to Recruiters only) for maximum privacy and 3.5x recruiter DMs.",
        "Add key technical skills tags under your Experience entries so ATS parsers index your profile.",
        "Request 2-3 recommendations from previous engineering leads or product managers."
      ]
    },
    // Step 3: Add Relevant Personnel in Network
    networking: {
      targetRoles: ["Technical Recruiter / Talent Acquisition", "Engineering Manager / VP of Tech", "Staff Engineer / Tech Lead", "Founder / Co-founder"],
      connectionNote: `Hi [Name], I noticed your team at [Company] is scaling [Domain/Engineering]. I recently architected a high-throughput [Project/System] and love what you're building. Would love to connect!`
    },
    // Step 4: Secure Internal Referrals on LinkedIn (NEW)
    referrals: {
      whyReferrals: "Referred candidates have a 400% higher interview callback rate and bypass automated ATS screening.",
      searchFilterStrategy: "On LinkedIn Search, type [Target Company] -> People filter -> School/University Alumni OR Past Companies.",
      threeStepStrategy: [
        {
          step: "Phase 1: Warm Connect",
          desc: "Send a polite non-demanding connection request highlighting shared background (e.g. alumni, common past employer, shared group)."
        },
        {
          step: "Phase 2: 10-Min Coffee Chat",
          desc: "Ask for a brief 10-minute informational call to ask genuine questions about their team culture & tech stack."
        },
        {
          step: "Phase 3: Referral Request",
          desc: "Provide your target Job Req ID, resume link, and a 2-bullet summary they can easily copy into their internal referral portal."
        }
      ],
      templateMessage: `Hi [Name], thanks so much for your insights earlier! I'm submitting my application for the ${activeRole} position (Job Req #[12345]) at [Company]. Since employees can submit internal referrals, would you be open to submitting my resume? I've attached my resume and a short 2-bullet summary of my fit below to make it effortless for you. Really appreciate your support!`
    },
    // Step 5: Platforms to Find Jobs Including Tips
    platforms: [
      {
        name: "LinkedIn Jobs & Recruiter DMs",
        tips: "Filter by 'Date Posted: Past 24 Hours' & 'Under 10 Applicants'. Message the job poster directly after applying."
      },
      {
        name: "Wellfound (formerly AngelList)",
        tips: "Best for early-stage to Series B tech startups. Apply with customized founder pitches & salary expectations."
      },
      {
        name: "Y Combinator 'Work at a Startup'",
        tips: "Direct access to YC-backed founders. Include portfolio links and short demo videos for 40% higher response."
      },
      {
        name: "Otta & Hacker News ('Who is Hiring?')",
        tips: "Otta matches high-growth tech roles. On HN, reply directly to top-level company comments posted on the 1st of every month."
      }
    ],
    // Step 6: Best Messages to Send to HR / Managers
    messages: [
      {
        recipient: "Technical Recruiter / HR Lead",
        subject: `Application for ${activeRole} - [Your Name]`,
        body: `Hi [Recruiter Name],\n\nI just submitted my application for the ${activeRole} position at [Company]. Over the past 4+ years, I've specialized in building high-scale React/Node infrastructure, achieving 99.9% uptime and accelerating feature shipping speeds by 40%.\n\nI'd love to connect and share my portfolio. Are you free for a brief 10-minute intro call this week?\n\nBest,\n[Your Name]`
      },
      {
        recipient: "Hiring Manager / Tech Lead",
        subject: `Quick thought on [Company]'s Engineering & ${activeRole}`,
        body: `Hi [Manager Name],\n\nI’m a big fan of how [Company] handles [Product Feature]. As a ${activeRole}, I recently solved a similar architecture challenge involving real-time state synchronization and reduced latency by 30%.\n\nI applied for the ${activeRole} role and attached my resume here. Would love to share ideas on your tech roadmap if you have 10 minutes!\n\nBest,\n[Your Name]`
      }
    ],
    // Step 7: Weekly Target
    weeklyTargets: [
      { metric: "15 Roles", label: "Customized Applications", detail: "Tailored ATS resumes submitted weekly" },
      { metric: "25 Invites", label: "Recruiter Connections", detail: "Personalized DMs to recruiters" },
      { metric: "5 Referrals", label: "LinkedIn Referral Asks", detail: "Alumni & peer internal referral requests" },
      { metric: "8 Direct DMs", label: "Hiring Manager Outreach", detail: "Pitching engineering managers" }
    ]
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-300">
      
      {/* Title Greeting */}
      <div className="text-center pt-2 space-y-2">
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-slate-900">
          Job Hunting Execution Plan, {userName.split(' ')[0]}.
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">
          Enter your target job role below to generate a step-by-step strategy for resumes, LinkedIn optimization, internal referrals, outreach messages, and weekly targets.
        </p>
      </div>

      {/* Role Input Box */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={jobRoleInput}
              onChange={(e) => setJobRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGeneratePlan();
              }}
              placeholder="Enter target job role (e.g. Senior Full Stack Engineer, Product Manager...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => handleGeneratePlan()}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Roles Quick Chips */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Popular Target Roles:
          </div>
          <div className="flex flex-wrap gap-2">
            {presetRoles.map((role, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setJobRoleInput(role);
                  handleGeneratePlan(role);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeRole === role
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200/60 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* STEP-BY-STEP JOB HUNTING ROADMAP */}
      <div className="space-y-8">
        
        {/* Active Strategy Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-emerald-600" />
              <span>Step-by-Step Blueprint for <span className="text-emerald-700">{executionPlan.roleTitle}</span></span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Follow these 7 structured steps to land interviews 4x faster.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            7 Steps Active
          </span>
        </div>

        {/* STEP 1: Create Resume */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">
                01
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Create Resume Strategy</span>
                </h4>
                <p className="text-xs text-slate-500">Target ATS score: <strong className="text-slate-800">{executionPlan.resume.atsScoreTarget}</strong></p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('resume');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Build Resume for {executionPlan.roleTitle.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <strong className="text-slate-900 font-bold block">Top Required ATS Keywords:</strong>
              <div className="flex flex-wrap gap-1.5">
                {executionPlan.resume.topKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200/60">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <strong className="text-slate-900 font-bold block">Quantified Impact Bullet Formula:</strong>
              <p className="text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
                {executionPlan.resume.bulletFormula}
              </p>
              <p className="text-[11px] text-slate-500 italic">Tip: {executionPlan.resume.actionTip}</p>
            </div>
          </div>
        </div>

        {/* STEP 2: Create LinkedIn */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                02
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <LinkedinIcon className="w-4 h-4 text-blue-600" />
                  <span>Create & Optimize LinkedIn Profile</span>
                </h4>
                <p className="text-xs text-slate-500">Recruiter search ranking & keyword indexing</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('linkedin');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Optimize LinkedIn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
              <span className="font-bold text-blue-900 block">Recommended Profile Headline Formula:</span>
              <div className="font-mono text-slate-800 bg-white p-2.5 rounded-xl border border-blue-200 font-semibold text-[11px]">
                {executionPlan.linkedin.headlineFormula}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {executionPlan.linkedin.profileTips.map((tip, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1.5" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 3: Add Relevant Personnel in Network */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
              03
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Add Relevant Personnel to Network</span>
              </h4>
              <p className="text-xs text-slate-500">Target key decision makers on LinkedIn & Twitter/X</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">Who to Connect With:</span>
              <div className="grid grid-cols-2 gap-2">
                {executionPlan.networking.targetRoles.map((role, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">Connection Note Template:</span>
                <button
                  onClick={() => copyToClipboard(executionPlan.networking.connectionNote, 99)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedIndex === 99 ? "Copied!" : "Copy Note"}</span>
                </button>
              </div>
              <p className="text-slate-800 font-sans italic bg-white p-2.5 rounded-xl border border-emerald-200 leading-relaxed text-[11px]">
                "{executionPlan.networking.connectionNote}"
              </p>
            </div>
          </div>
        </div>

        {/* STEP 4: How to Secure Internal Referrals / References via LinkedIn (NEW!) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center shrink-0">
                04
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-amber-600" />
                  <span>Secure Internal Referrals & References on LinkedIn</span>
                </h4>
                <p className="text-xs text-amber-700 font-semibold">{executionPlan.referrals.whyReferrals}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shrink-0">
              4x Callback Rate
            </span>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Search Filter Strategy Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span className="font-bold text-amber-950 block">Search & Filtering Technique:</span>
              <p className="text-slate-800 font-medium leading-relaxed">
                {executionPlan.referrals.searchFilterStrategy}
              </p>
            </div>

            {/* 3-Step Strategy Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {executionPlan.referrals.threeStepStrategy.map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-extrabold text-slate-900 text-xs block">{st.step}</span>
                  <p className="text-slate-600 leading-relaxed font-medium text-[11px]">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* Referral Request Message Template */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Proven Internal Referral Request Template:</span>
                <button
                  onClick={() => copyToClipboard(executionPlan.referrals.templateMessage, 88)}
                  className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedIndex === 88 ? "Copied!" : "Copy Template"}</span>
                </button>
              </div>
              <pre className="text-slate-800 font-sans whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                {executionPlan.referrals.templateMessage}
              </pre>
            </div>

          </div>
        </div>

        {/* STEP 5: Top Platforms & Search Filtering Tips */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center shrink-0">
              05
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                <span>Top Platforms & Search Filtering Tips</span>
              </h4>
              <p className="text-xs text-slate-500">Where to find unadvertised high-paying positions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {executionPlan.platforms.map((plat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>{plat.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  <strong>Pro Tip:</strong> {plat.tips}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 6: Best Messages to Send to HR/Managers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center shrink-0">
              06
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>High-Converting Outreach Templates</span>
              </h4>
              <p className="text-xs text-slate-500">Cold DMs & emails for HR recruiters and engineering directors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {executionPlan.messages.map((msg, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-extrabold text-[10px]">
                    To: {msg.recipient}
                  </span>
                  <button
                    onClick={() => copyToClipboard(msg.body, idx)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedIndex === idx ? "Copied!" : "Copy Template"}</span>
                  </button>
                </div>
                <div className="font-bold text-slate-900">Subject: {msg.subject}</div>
                <pre className="text-slate-700 font-sans whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                  {msg.body}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 7: Weekly Target Dashboard */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                07
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span>Recommended Weekly Targets</span>
                </h4>
                <p className="text-xs text-slate-300 font-medium">Daily cadence to maintain momentum and guarantee interviews</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              Weekly KPI Dashboard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {executionPlan.weeklyTargets.map((target, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-xs">
                <div className="text-2xl font-black text-emerald-400 tracking-tight">{target.metric}</div>
                <div className="font-bold text-xs text-white">{target.label}</div>
                <div className="text-[10px] text-slate-400 font-medium leading-tight">{target.detail}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
