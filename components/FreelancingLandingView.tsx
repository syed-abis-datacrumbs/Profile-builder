'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  DollarSign, 
  FileText, 
  MessageSquare, 
  Target, 
  ArrowRight, 
  Copy, 
  Briefcase, 
  Layers, 
  Zap, 
  Video,
  Filter,
  UserPlus,
  Compass,
  TrendingUp,
  Share2,
  BookmarkCheck,
  Check,
  Award,
  Lightbulb,
  Brain,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Users
} from 'lucide-react';
import { LinkedinIcon } from './icons';

interface FreelancingLandingViewProps {
  userName?: string;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
  onNavigateToTab?: (tab: 'resume' | 'linkedin') => void;
}

export const FreelancingLandingView: React.FC<FreelancingLandingViewProps> = ({
  userName = "Abis",
  onUsePrompt,
  onOpenEditorDirectly,
  onNavigateToTab
}) => {
  const [serviceInput, setServiceInput] = useState('Full-Stack Web Development');
  const [activeService, setActiveService] = useState('Full-Stack Web Development');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Interactive Quiz & Carousel State
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: number]: boolean }>({});
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqCategoryFilter, setMcqCategoryFilter] = useState<'All' | 'Pricing' | 'Proposals' | 'Client Outbound'>('All');

  // Typed Written Exams State
  const [typedTechCarouselIdx, setTypedTechCarouselIdx] = useState(0);
  const [typedHrCarouselIdx, setTypedHrCarouselIdx] = useState(0);
  const [typedTechAnswers, setTypedTechAnswers] = useState<{ [key: number]: string }>({});
  const [typedHrAnswers, setTypedHrAnswers] = useState<{ [key: number]: string }>({});
  const [revealedTypedTech, setRevealedTypedTech] = useState<{ [key: number]: boolean }>({});
  const [revealedTypedHr, setRevealedTypedHr] = useState<{ [key: number]: boolean }>({});

  const presetServices = [
    "Full-Stack Web Development",
    "AI & LLM RAG Integration",
    "UI/UX Design Systems",
    "Mobile App Development",
    "DevOps & Infrastructure",
    "Growth Marketing & SEO"
  ];

  const handleGeneratePlan = (serviceName?: string) => {
    const serviceToUse = serviceName || serviceInput;
    if (!serviceToUse.trim()) return;
    setIsGenerating(true);
    setActiveService(serviceToUse);
    setTimeout(() => {
      setIsGenerating(false);
      setUserAnswers({});
      setRevealedAnswers({});
      setCurrentMcqIndex(0);
      setTypedTechCarouselIdx(0);
      setTypedHrCarouselIdx(0);
    }, 400);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setRevealedAnswers(prev => ({ ...prev, [qId]: true }));
  };

  const toggleReveal = (qId: number) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Freelancing Client Acquisition MCQs
  const freelanceMcqs = [
    {
      id: 1,
      category: "Pricing",
      question: `When quoting a $5,000+ client project for ${activeService}, which payment structure minimizes financial risk?`,
      options: [
        "Deliver 100% of the project first and send an invoice 30 days after launch",
        "Require a 50% upfront deposit before starting work, 25% at mid-project demo, and 25% before final code transfer",
        "Work for free with the promise of future equity",
        "Accept hourly micro-payments without any written scope contract"
      ],
      correctIndex: 1,
      explanation: "A 50/25/25 milestone structure guarantees cash flow liquidity, validates client commitment early, and eliminates non-payment risk before releasing final production assets."
    },
    {
      id: 2,
      category: "Proposals",
      question: "What is the highest converting element in a personalized cold video pitch to a potential client?",
      options: [
        "Reading your resume line-by-line for 10 minutes",
        "A 90-second Loom video auditing their current website/app, identifying 2 specific friction points, and proposing immediate fixes",
        "Sending a template PDF with 10 generic case studies",
        "Demanding a 1-hour paid consultation call immediately"
      ],
      correctIndex: 1,
      explanation: "Short video audits provide immediate value, build instant personal trust, and prove technical capability before asking for a sales discovery call."
    },
    {
      id: 3,
      category: "Client Outbound",
      question: "How do you handle scope creep when a client requests 3 additional features mid-project without extra budget?",
      options: [
        "Do all extra work for free to avoid disappointing the client",
        "Refuse flatly and threaten legal action",
        "Acknowledge the feature value, present a formal Change Order with calculated cost/timeline adjustments, and offer to queue it for Phase 2",
        "Ignore the client's messages and turn off your phone"
      ],
      correctIndex: 2,
      explanation: "Change Orders protect your project scope professionally. Offering Phase 2 additions keeps client relationships strong while maintaining project profitability."
    },
    {
      id: 4,
      category: "Pricing",
      question: "Why is Value-Based Fixed Pricing superior to Hourly Billing for high-efficiency senior freelancers?",
      options: [
        "Hourly billing penalizes you for working faster and mastering advanced developer tools",
        "Fixed pricing allows clients to demand infinite revisions forever",
        "Hourly billing is harder to track in spreadsheet apps",
        "There is no difference between the two models"
      ],
      correctIndex: 0,
      explanation: "As your skill grows, fast execution reduces hourly earnings under hourly billing. Value-Based pricing decouples income from time, rewarding speed and business impact."
    }
  ];

  // 10 SEPARATE TYPED FREELANCE PROPOSAL & TECHNICAL PITCH QUESTIONS
  const typedFreelanceTechQuestions = [
    { id: 1, title: "Loom Video Pitch Script (90 Sec)", prompt: "Write a 90-second Loom video audit script pointing out 2 UX/performance bugs on a prospect's app.", sampleAnswer: "Hi [Founder Name]! Was checking out [App Name] and noticed your checkout page takes 3.8s to load, which typically drops conversions by 20%. I recorded a quick 60s breakdown showing how updating your Next.js caching will reduce this to under 800ms. Would love to send over the fix!" },
    { id: 2, title: "Structuring 50% Deposit Terms", prompt: "Write a polite email insisting on a 50% upfront deposit before starting project kickoff.", sampleAnswer: "Hi [Client Name], excited to kick off! As per our agreement, our standard policy requires a 50% initial deposit ($2,500) to reserve developer sprint capacity. Here is the invoice link to begin work on Monday." },
    { id: 3, title: "Handling 'Your Price is Too High' Objection", prompt: "How do you respond when a potential client asks for a 40% discount on a $5k project proposal?", sampleAnswer: "I understand budget constraints! Rather than discounting our rate, we can trim the scope to deliver the core MVP in Phase 1 for $3k, and add advanced analytics in Phase 2 once initial revenue comes in." },
    { id: 4, title: "Drafting a 1-Page Scope of Work (SOW)", prompt: "Outline the key sections required in a bulletproof 1-page freelance Scope of Work contract.", sampleAnswer: "1. Core Deliverables list, 2. Timeline & Milestones, 3. Out-of-Scope boundaries, 4. Payment Schedule (50/25/25), 5. Client feedback turn-around window (max 3 days)." },
    { id: 5, title: "Upselling a Monthly Maintenance Retainer", prompt: "Pitch a $1,000/mo post-launch maintenance retainer to a client after completing their MVP.", sampleAnswer: "Congrats on the launch! To ensure zero downtime, automated security patches, and 5 hours of monthly feature updates, I offer a dedicated $1,000/mo retainer to keep everything running seamlessly." },
    { id: 6, title: "Converting Upwork/Fiverr Leads to Off-Platform Retainers", prompt: "How do you transition a satisfied one-off marketplace client into a direct long-term retainer?", sampleAnswer: "Delivered project ahead of time! Propose a quarterly feature roadmap directly during final sign-off, demonstrating how ongoing monthly updates save them hiring full-time staff." },
    { id: 7, title: "Handling Client Delays in Providing Assets", prompt: "Write a message to a client who hasn't provided text copy or brand logos for 2 weeks.", sampleAnswer: "Hi [Client], checking in! To keep our target launch date of the 15th on track, we need the brand assets by Friday. Otherwise, we will pause sprint allocation and adjust the launch date accordingly." },
    { id: 8, title: "Requesting a LinkedIn Recommendation Post-Project", prompt: "Draft a request for a 5-star LinkedIn recommendation from a satisfied client CEO.", sampleAnswer: "Hi [CEO Name], it was a pleasure building [App Name] with you! If you're happy with the results, would you mind leaving a brief 2-sentence recommendation on my LinkedIn profile highlighting our speed?" },
    { id: 9, title: "Build in Public LinkedIn Post Script", prompt: "Write a high-converting 'Build in Public' post sharing a recent client technical win.", sampleAnswer: "Just reduced API latency from 4.2s to 750ms for a SaaS client handling 50k monthly active users 🚀 Here is the exact Redis caching architecture we implemented. DM me if your web app is facing scale bottlenecks!" },
    { id: 10, title: "Navigating Unrealistic Deadlines gracefully", prompt: "How do you handle a client demanding a 4-week web app build in 5 days?", sampleAnswer: "To launch in 5 days without sacrificing security or code quality, we can launch a streamlined 1-page landing page with core sign-up functionality, while building remaining features in Sprint 2." }
  ];

  // 10 SEPARATE TYPED CLIENT NEGOTIATION & HR QUESTIONS FOR FREELANCERS
  const typedFreelanceHrQuestions = [
    { id: 1, title: "Establishing Professional Boundaries with Clients", prompt: "How do you handle a client texting your personal phone at 11 PM on a Sunday?", sampleAnswer: "Set clear communication channels early: respond during business hours via Slack/Email stating: 'Hi [Name], received your note! I will review this first thing Monday morning at 9 AM during our sprint hours.'" },
    { id: 2, title: "Handling Non-Payment of Final Invoice", prompt: "What step-by-step actions do you take if a client stops responding when the final 25% invoice is due?", sampleAnswer: "1. Send polite reminder email, 2. Pause staging server access or production deployments, 3. Send formal notice referencing contract terms, 4. Escalate to collections/legal if unpaid after 30 days." },
    { id: 3, title: "Handling Unfavorable Contract Clauses (IP & Indemnity)", prompt: "How do you negotiate when a corporate client's legal team sends an aggressive 20-page NDA with unlimited liability?", sampleAnswer: "Request modification to limit liability to the total contract value (capped at project fee) and ensure IP ownership transfers only upon receipt of 100% full payment." },
    { id: 4, title: "Explaining Value-Based Pricing to Non-Technical Founders", prompt: "How do you articulate why your $10k project fee is worth it compared to a $500 offshore quote?", sampleAnswer: "Frame in business outcome terms: 'A $500 code build that crashes under traffic costs $50k in lost sales. Our $10k build includes security, scalability, and 99.9% uptime guaranteed.'" },
    { id: 5, title: "Firing a Toxic or Unreasonable Client", prompt: "Write a professional email offboarding a client who is abusive to your team.", sampleAnswer: "Hi [Client], after reviewing our sprint alignment, we have decided to wrap up our engagement at the end of this milestone. We will hand over all completed code and documentation by Friday." },
    { id: 6, title: "Managing Multiple Concurrent Client Projects", prompt: "How do you prevent burn-out when managing 3 major freelance projects simultaneously?", sampleAnswer: "Use strict time-blocking calendar slots, establish weekly async status updates instead of daily meetings, and limit total active development hours to 35h/week." },
    { id: 7, title: "Securing Case Study & Testimonial Rights", prompt: "How do you ensure you have the right to feature a client project in your public portfolio?", sampleAnswer: "Include a standard Portfolio Clause in your master service agreement stating: 'Freelance consultant retains the right to display non-confidential project screenshots and metrics in portfolio.'" },
    { id: 8, title: "Pitching Retainers vs One-Off Projects", prompt: "Why are $3k/month recurring retainers healthier for a freelance business than $10k one-off builds?", sampleAnswer: "Retainers provide predictable recurring revenue, lower customer acquisition costs, and allow deeper long-term technical impact without perpetual sales prospecting." },
    { id: 9, title: "Qualifying Prospects on the Initial Discovery Call", prompt: "What 3 key qualifying questions do you ask in the first 5 minutes of a client call?", sampleAnswer: "1. What is the deadline driver for this launch? 2. Have you allocated budget for development & hosting? 3. Who is the final decision maker for project sign-off?" },
    { id: 10, title: "Transitioning from Solo Freelancer to Agency Owner", prompt: "How do you structure delegating sub-tasks to junior contractors while maintaining client quality?", sampleAnswer: "Act as lead architect: create strict coding standards, conduct mandatory code reviews for all PRs, and maintain sole ownership of client communication and final sign-offs." }
  ];

  const filteredMcqs = freelanceMcqs.filter(q => 
    mcqCategoryFilter === 'All' || q.category === mcqCategoryFilter
  );
  const activeMcq = filteredMcqs[currentMcqIndex] || filteredMcqs[0];

  const activeTypedTech = typedFreelanceTechQuestions[typedTechCarouselIdx] || typedFreelanceTechQuestions[0];
  const activeTypedHr = typedFreelanceHrQuestions[typedHrCarouselIdx] || typedFreelanceHrQuestions[0];

  const totalAnswered = Object.keys(userAnswers).length;
  const correctCount = Object.entries(userAnswers).filter(([qId, val]) => {
    const q = freelanceMcqs.find(item => item.id === Number(qId));
    return q && q.correctIndex === val;
  }).length;

  const executionPlan = {
    serviceTitle: activeService,
    profile: {
      headlineFormula: `Specialized ${activeService} Consultant | Helping Startups Scale Product Speed & Architecture | $100k+ Client Impact`,
      featuredSection: [
        "1. 90-Second Loom video demo of your best client MVP build",
        "2. Carousel PDF of a real case study (Problem -> Solution -> Result)",
        "3. Direct Calendly booking link for a 15-min discovery call"
      ],
      bioSummary: `I help early-stage to growth tech startups build high-performance ${activeService} solutions. Specialized in rapid prototyping, clean scalable code, and zero-downtime deployments.`
    },
    approaches: [
      {
        title: "Approach 1: Build in Public",
        badge: "Organic Inbound",
        icon: "Share2",
        desc: "Share 2x weekly real client builds, code refactoring wins, architecture diagrams, and milestone updates on LinkedIn. Tech founders browsing your feed will see proof of work and DM you directly for project quotes.",
        actionTip: "Post before/after metrics (e.g. 'Reduced load time from 4.2s to 0.8s using Next.js 15 & Redis')."
      },
      {
        title: "Approach 2: Loom Video Pitch",
        badge: "60% Response Rate",
        icon: "Video",
        desc: "Record a personalized 90-second Loom video walking through a target client's website/app. Show 2-3 specific features you can build or optimize for their upcoming sprint, and attach it to your LinkedIn message.",
        actionTip: "Keep videos under 2 minutes and focus purely on providing immediate value before asking for a call."
      }
    ],
    weeklyTargets: [
      { metric: "10 Video Audits", label: "Custom Loom DMs", detail: "Sent on LinkedIn" },
      { metric: "3 Discovery Calls", label: "High-Ticket Clients", detail: "$5k+ Project Scope" },
      { metric: "10 MCQ Drills", label: "Client Proposal Practice", detail: "Interactive Carousel" },
      { metric: "20 Typed Exams", label: "Pitch & Negotiation Written", detail: "10 Pitch + 10 Negotiation" }
    ]
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-300">
      
      {/* Title Greeting */}
      <div className="text-center pt-2 space-y-2">
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-slate-900 flex items-center justify-center gap-3">
          <span>Freelance Client Acquisition Blueprint, {userName.split(' ')[0]}.</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto">
          Scale your freelance consulting revenue using LinkedIn inbound authority, personalized video audits, interactive client proposal MCQs, and written negotiation exams.
        </p>
      </div>

      {/* Service Selection Bar */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGeneratePlan();
              }}
              placeholder="Enter your freelance service (e.g. Full-Stack Web Development, AI Integration...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => handleGeneratePlan()}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Freelance Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Popular Freelance Services:
          </div>
          <div className="flex flex-wrap gap-2">
            {presetServices.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setServiceInput(preset);
                  handleGeneratePlan(preset);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeService === preset
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-2 border border-blue-900/40">
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider">
          Freelance Acquisition Blueprint
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Service: {activeService}
        </h2>
      </div>

      {/* EXECUTION PLAN STEPS */}
      <div className="space-y-8">

        {/* STEP 1: Profile Optimization */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
                01
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <LinkedinIcon className="w-5 h-5 text-blue-600" />
                  <span>LinkedIn Profile Positioning for Freelancers</span>
                </h3>
                <p className="text-xs text-slate-500">Transform your profile into a high-converting landing page</p>
              </div>
            </div>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('linkedin')}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Edit LinkedIn →</span>
              </button>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-2">
            <span className="font-extrabold text-blue-950 uppercase tracking-wider block text-xs">High-Ticket Headline Formula:</span>
            <p className="text-xs text-blue-950 font-bold bg-white p-3 rounded-xl border border-blue-200">
              {executionPlan.profile.headlineFormula}
            </p>
          </div>
        </div>

        {/* STEP 2: Proven Client Acquisition Approaches */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
              02
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span>Proven Client Acquisition Approaches</span>
              </h3>
              <p className="text-xs text-slate-500">High-converting inbound and video audit outreach tactics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {executionPlan.approaches.map((app, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{app.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                    {app.badge}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">{app.desc}</p>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold">
                  Pro Tip: {app.actionTip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 3: INTERACTIVE FREELANCE MCQ PRACTICE CAROUSEL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-blue-600 text-white">
                03
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Interactive Client Acquisition & Proposal MCQ Carousel</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Practice high-ticket pricing models, Loom video pitches, contract terms, and scope creep tactics
                </p>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-extrabold text-blue-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Score: {correctCount} / {totalAnswered} Correct</span>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              {(['All', 'Pricing', 'Proposals', 'Client Outbound'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setMcqCategoryFilter(cat);
                    setCurrentMcqIndex(0);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    mcqCategoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({freelanceMcqs.filter(q => cat === 'All' || q.category === cat).length})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentMcqIndex(prev => Math.max(0, prev - 1))}
                disabled={currentMcqIndex === 0}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <span className="text-xs font-extrabold text-slate-800 min-w-[75px] text-center">
                Q {currentMcqIndex + 1} of {filteredMcqs.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMcqIndex(prev => Math.min(filteredMcqs.length - 1, prev + 1))}
                disabled={currentMcqIndex === filteredMcqs.length - 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* ACTIVE CAROUSEL MCQ CARD */}
          {activeMcq && (
            <div key={activeMcq.id} className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-200">
                  {activeMcq.category}
                </span>

                <button
                  type="button"
                  onClick={() => toggleReveal(activeMcq.id)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{revealedAnswers[activeMcq.id] ? "Hide Rationale" : "Reveal Answer & Rationale"}</span>
                </button>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                {activeMcq.question}
              </h4>

              <div className="space-y-2.5 pt-1">
                {activeMcq.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[activeMcq.id] === oIdx;
                  const isCorrect = activeMcq.correctIndex === oIdx;
                  const hasAnswered = userAnswers[activeMcq.id] !== undefined;

                  let style = "border-slate-200 bg-white text-slate-800 hover:bg-blue-50/60 hover:border-blue-300 hover:scale-[1.005]";
                  let badgeStyle = "bg-slate-100 border-slate-300 text-slate-700";

                  if (hasAnswered) {
                    if (isCorrect) {
                      style = "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold shadow-md ring-2 ring-emerald-400/40 animate-in fade-in scale-[1.01]";
                      badgeStyle = "bg-emerald-600 border-emerald-600 text-white";
                    } else if (isSelected) {
                      style = "border-rose-500 bg-rose-50/90 text-rose-950 font-bold shadow-md ring-2 ring-rose-400/40 animate-in fade-in";
                      badgeStyle = "bg-rose-600 border-rose-600 text-white";
                    } else {
                      style = "border-slate-200 bg-white/60 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleOptionSelect(activeMcq.id, oIdx)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all duration-200 flex items-center justify-between ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 transition-colors ${badgeStyle}`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>

                      {hasAnswered && isCorrect && (
                        <span className="flex items-center gap-1 text-emerald-700 font-extrabold text-[11px] shrink-0">
                          <span>Correct</span>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
                        </span>
                      )}

                      {hasAnswered && isSelected && !isCorrect && (
                        <span className="flex items-center gap-1 text-rose-700 font-extrabold text-[11px] shrink-0">
                          <span>Incorrect</span>
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {revealedAnswers[activeMcq.id] && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1 animate-in fade-in duration-300">
                  <strong className="font-extrabold block text-blue-950 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span>AI Freelance Strategy Rationale:</span>
                  </strong>
                  <p className="leading-relaxed text-blue-900">{activeMcq.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination Pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {filteredMcqs.map((q, qIdx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = currentMcqIndex === qIdx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentMcqIndex(qIdx)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 4: CLIENT PITCH & PROPOSAL TYPED EXAM CAROUSEL (10 QUESTIONS) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-blue-600 text-white">
                04
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-blue-600" />
                  <span>Client Pitch & Proposal Strategy Typed Exam (Carousel)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Type out Loom scripts, deposit terms, retainers, and price objection responses
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
              Question {typedTechCarouselIdx + 1} of {typedFreelanceTechQuestions.length}: {activeTypedTech.title}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTypedTechCarouselIdx(prev => Math.max(0, prev - 1))}
                disabled={typedTechCarouselIdx === 0}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <span className="text-xs font-extrabold text-slate-800 min-w-[70px] text-center">
                {typedTechCarouselIdx + 1} / {typedFreelanceTechQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => setTypedTechCarouselIdx(prev => Math.min(typedFreelanceTechQuestions.length - 1, prev + 1))}
                disabled={typedTechCarouselIdx === typedFreelanceTechQuestions.length - 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {activeTypedTech && (
            <div key={activeTypedTech.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase">
                  Pitch Question {typedTechCarouselIdx + 1} of 10
                </span>
                <button
                  type="button"
                  onClick={() => setRevealedTypedTech(prev => ({ ...prev, [activeTypedTech.id]: !prev[activeTypedTech.id] }))}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{revealedTypedTech[activeTypedTech.id] ? "Hide Benchmark" : "Check AI Model Answer"}</span>
                </button>
              </div>

              <p className="text-sm font-bold text-slate-900 leading-snug">{activeTypedTech.prompt}</p>

              <textarea
                rows={3}
                value={typedTechAnswers[activeTypedTech.id] || ''}
                onChange={(e) => setTypedTechAnswers(prev => ({ ...prev, [activeTypedTech.id]: e.target.value }))}
                placeholder="Type your pitch or proposal response here..."
                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-blue-600 transition-all resize-none font-mono"
              />

              {revealedTypedTech[activeTypedTech.id] && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1 animate-in fade-in">
                  <strong className="font-extrabold block text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI High-Ticket Pitch Benchmark:</span>
                  </strong>
                  <p className="text-blue-900 leading-relaxed font-mono">{activeTypedTech.sampleAnswer}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {typedFreelanceTechQuestions.map((q, qIdx) => {
              const isTyped = typedTechAnswers[q.id] && typedTechAnswers[q.id].trim().length > 0;
              const isCurrent = typedTechCarouselIdx === qIdx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setTypedTechCarouselIdx(qIdx)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isTyped
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 5: HR & CLIENT NEGOTIATION TYPED EXAM CAROUSEL (10 QUESTIONS) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-blue-600 text-white">
                05
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span>Client Boundaries & Contract Written Exam (Carousel)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Type out answers for contract clauses, non-payment protocols, and client offboarding
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
              Question {typedHrCarouselIdx + 1} of {typedFreelanceHrQuestions.length}: {activeTypedHr.title}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTypedHrCarouselIdx(prev => Math.max(0, prev - 1))}
                disabled={typedHrCarouselIdx === 0}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <span className="text-xs font-extrabold text-slate-800 min-w-[70px] text-center">
                {typedHrCarouselIdx + 1} / {typedFreelanceHrQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => setTypedHrCarouselIdx(prev => Math.min(typedFreelanceHrQuestions.length - 1, prev + 1))}
                disabled={typedHrCarouselIdx === typedFreelanceHrQuestions.length - 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {activeTypedHr && (
            <div key={activeTypedHr.id} className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 text-[10px] font-extrabold uppercase">
                  Contract Question {typedHrCarouselIdx + 1} of 10
                </span>
                <button
                  type="button"
                  onClick={() => setRevealedTypedHr(prev => ({ ...prev, [activeTypedHr.id]: !prev[activeTypedHr.id] }))}
                  className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>{revealedTypedHr[activeTypedHr.id] ? "Hide Benchmark" : "Check Contract Benchmark"}</span>
                </button>
              </div>

              <p className="text-sm font-bold text-slate-900 leading-snug">{activeTypedHr.prompt}</p>

              <textarea
                rows={3}
                value={typedHrAnswers[activeTypedHr.id] || ''}
                onChange={(e) => setTypedHrAnswers(prev => ({ ...prev, [activeTypedHr.id]: e.target.value }))}
                placeholder="Type your response here..."
                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-white border border-amber-200/80 rounded-xl p-3.5 focus:outline-none focus:border-amber-600 transition-all resize-none"
              />

              {revealedTypedHr[activeTypedHr.id] && (
                <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-300 text-xs text-amber-950 space-y-1 animate-in fade-in">
                  <strong className="font-extrabold block text-amber-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Contract Benchmark Answer:</span>
                  </strong>
                  <p className="text-amber-900 leading-relaxed">{activeTypedHr.sampleAnswer}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {typedFreelanceHrQuestions.map((q, qIdx) => {
              const isTyped = typedHrAnswers[q.id] && typedHrAnswers[q.id].trim().length > 0;
              const isCurrent = typedHrCarouselIdx === qIdx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setTypedHrCarouselIdx(qIdx)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-amber-600 text-white shadow-xs'
                      : isTyped
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 6: Recommended Weekly Targets */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>Weekly Freelance Acquisition Dashboard</span>
              </h3>
              <p className="text-xs text-slate-400">Target KPIs to close $5,000+ monthly client retainers</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {executionPlan.weeklyTargets.map((target, idx) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl space-y-1">
                <div className="text-lg font-extrabold text-blue-400">{target.metric}</div>
                <div className="text-xs font-bold text-slate-200">{target.label}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{target.detail}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
