'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  FileText, 
  MessageSquare, 
  Target, 
  ArrowRight, 
  Copy, 
  Briefcase, 
  Layers, 
  Zap, 
  Check,
  Brain,
  Lightbulb,
  Award,
  Bot,
  Code2,
  BookmarkCheck,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Users,
  TrendingUp,
  HeartHandshake,
  DollarSign,
  Palette,
  HelpCircle,
  Filter,
  PenTool,
  Send
} from 'lucide-react';

interface InterviewPrepViewProps {
  userName?: string;
  onUsePrompt: (promptText: string) => void;
  onLaunchMockInterview: (role: string, jdText: string) => void;
  onNavigateToTab?: (tab: 'resume' | 'linkedin') => void;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  userName = "",
  onUsePrompt,
  onLaunchMockInterview,
  onNavigateToTab
}) => {
  const [roleInput, setRoleInput] = useState('Full Stack Software Engineer');
  const [activeRole, setActiveRole] = useState('Full Stack Software Engineer');
  const [difficulty, setDifficulty] = useState<'Fresher' | 'Mid' | 'Senior'>('Fresher');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Active quiz state
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: number]: boolean }>({});
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});

  // Carousel Indices
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqCategoryFilter, setMcqCategoryFilter] = useState<'All' | 'Technical' | 'Behavioral' | 'Strategy'>('All');
  
  const [typedTechCarouselIdx, setTypedTechCarouselIdx] = useState(0);
  const [typedHrCarouselIdx, setTypedHrCarouselIdx] = useState(0);

  // Typed Tests State
  const [typedTechAnswers, setTypedTechAnswers] = useState<{ [key: number]: string }>({});
  const [typedHrAnswers, setTypedHrAnswers] = useState<{ [key: number]: string }>({});
  const [revealedTypedTech, setRevealedTypedTech] = useState<{ [key: number]: boolean }>({});
  const [revealedTypedHr, setRevealedTypedHr] = useState<{ [key: number]: boolean }>({});

  // Multi-domain preset roles without company names
  const presetRoles = [
    { title: "Full Stack Software Engineer", category: "Tech", text: "Full Stack Software Engineer (Next.js, React, TypeScript, Node.js)" },
    { title: "AI & Machine Learning Engineer", category: "Tech", text: "AI Systems Engineer (Python, PyTorch, LLM RAG, CUDA Infrastructure)" },
    { title: "Growth Marketing Manager", category: "Marketing", text: "Growth Marketing Manager (LTV/CAC, Funnels, Multi-Touch Attribution)" },
    { title: "Head of HR & People Operations", category: "HR", text: "Head of HR Operations (Talent Retention, Performance & Compensation)" },
    { title: "Product Manager", category: "Product", text: "Product Manager (Roadmap Strategy, User Research, RICE Prioritization)" },
    { title: "UI/UX Product Designer", category: "Design", text: "UI/UX Product Designer (Design Systems, Figma, Interactive Prototypes)" },
    { title: "Enterprise Account Executive", category: "Sales", text: "Enterprise Account Executive (B2B SaaS Sales, Pipeline, Closing)" },
    { title: "Talent Acquisition Specialist", category: "HR", text: "Talent Acquisition Specialist (Technical Recruiting, Candidate Pipeline)" }
  ];

  const handleGeneratePlan = (roleName?: string) => {
    const rToUse = roleName || roleInput;
    if (!rToUse.trim()) return;
    setIsGenerating(true);
    setActiveRole(rToUse);
    setTimeout(() => {
      setIsGenerating(false);
      setUserAnswers({});
      setRevealedAnswers({});
      setCurrentMcqIndex(0);
      setTypedTechCarouselIdx(0);
      setTypedHrCarouselIdx(0);
    }, 400);
  };

  const copyToClipboard = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idKey);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setRevealedAnswers(prev => ({ ...prev, [qId]: true }));
  };

  const toggleReveal = (qId: number) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Comprehensive MCQ Bank without company names
  const masterQuestionsBank = [
    {
      id: 1,
      category: "Technical",
      domain: "Tech & Engineering",
      question: `How would you optimize React server components rendering in Next.js when fetching high-frequency data for a ${activeRole} service?`,
      options: [
        "Use client-side polling with setInterval inside useEffect on every page render",
        "Implement React cache() and Next.js revalidateTag for granular on-demand server revalidation",
        "Convert all server components to client components using 'use client' directives",
        "Disable caching completely and rely on browser local storage caching"
      ],
      correctIndex: 1,
      explanation: "Using React's cache() and Next.js revalidateTag allows high-performance server-side data fetching while ensuring data stays fresh without sacrificing Server Component benefits or inflating bundle size."
    },
    {
      id: 2,
      category: "Behavioral",
      domain: "Conflict & Leadership",
      question: "Behavioral Scenario: You strongly disagree with a senior peer's technical architecture decision right before a critical launch deadline. What is the best STAR response approach?",
      options: [
        "Escalate immediately to the VP of Engineering without consulting your peer",
        "Silently agree to avoid conflict and fix the bugs yourself after the release",
        "Schedule a 1-on-1, present a quantitative risk/trade-off benchmark matrix, and propose a phased migration path",
        "Publicly call out the flaw in the team Slack channel during sprint review"
      ],
      correctIndex: 2,
      explanation: "The STAR framework emphasizes constructive collaboration: validating concerns with quantitative data in private 1-on-1s, offering low-risk compromises, and driving consensus without stalling velocity."
    },
    {
      id: 3,
      category: "Strategy",
      domain: "System Design & Architecture",
      question: "When designing a distributed rate limiter for 100,000 requests per second, which algorithm best balances memory usage and accuracy?",
      options: [
        "Fixed Window Counter in a relational MySQL database table",
        "Sliding Window Log with Redis sorted sets (ZSET)",
        "Token Bucket using Redis Lua scripts for atomic increment operations",
        "Client-side local storage counter increment"
      ],
      correctIndex: 2,
      explanation: "The Token Bucket algorithm using atomic Redis Lua scripts prevents race conditions across multi-region API gateways while maintaining ultra-low latency (<2ms) and minimal memory overhead."
    },
    {
      id: 4,
      category: "Behavioral",
      domain: "Failure Recovery & STAR",
      question: "Behavioral Scenario: A high-visibility production deployment breaks core functionality for 15% of active users. How do you structure your answer to 'Tell me about a time you failed'?",
      options: [
        "Blame the QA team for missing the edge case during pre-release testing",
        "Explain the incident's root cause, your immediate containment actions, post-mortem insights, and the CI/CD automated safeguards you added",
        "Downplay the incident severity by asserting that 85% of users were unaffected",
        "Claim you have never experienced a deployment failure throughout your career"
      ],
      correctIndex: 1,
      explanation: "Top interviewers look for extreme accountability, fast incident containment, rigorous blameless post-mortems, and systemic prevention mechanisms."
    },
    {
      id: 5,
      category: "Technical",
      domain: "Marketing & Growth",
      question: "Growth Marketing Metric: When evaluating a $50k monthly paid acquisition campaign across LinkedIn and Meta, which metric combination best determines long-term ROI?",
      options: [
        "Cost Per Click (CPC) and Impression CPM alone",
        "Customer Lifetime Value to Customer Acquisition Cost ratio (LTV:CAC > 3:1) and Payback Period (< 12 months)",
        "Total Social Likes and Organic Share count",
        "Immediate Return on Ad Spend (ROAS) on Day 1 without churn consideration"
      ],
      correctIndex: 1,
      explanation: "LTV:CAC ratio (>3:1) and payback period (<12 months) account for gross margins, retention, and capital efficiency, making them the gold standard for growth investments."
    },
    {
      id: 6,
      category: "Behavioral",
      domain: "Stakeholder Management",
      question: "Behavioral Scenario: A non-technical Executive stakeholder demands an impossible 2-week deadline for a 2-month complex feature. What is the most effective approach?",
      options: [
        "Say yes immediately to please the executive, then work 90-hour weeks",
        "Refuse flatly and state that the timeline is completely unfeasible",
        "Present a phased MVP scope that delivers core business value in 2 weeks while scheduling remaining features for Sprint 2 and 3",
        "Ignore the request and continue building at your standard pace"
      ],
      correctIndex: 2,
      explanation: "Executive stakeholders value solution-oriented negotiation: offering an immediate trimmed MVP scope that solves urgent needs while managing expectations gracefully."
    },
    {
      id: 7,
      category: "Technical",
      domain: "HR & Talent Strategy",
      question: "HR & Talent Operations: Which metric best evaluates the quality and long-term retention of engineering hires?",
      options: [
        "Cost per hire alone",
        "Time-to-fill metric without performance tracking",
        "First-Year Retention Rate combined with 90-Day New Hire Performance & Ramp Score",
        "Total volume of applications received per job post"
      ],
      correctIndex: 2,
      explanation: "First-year retention and 90-day onboarding ramp scores measure candidate quality, cultural fit, and talent pipeline health far better than raw applicant volume."
    },
    {
      id: 8,
      category: "Strategy",
      domain: "Product & Strategy",
      question: "Product Prioritization: When using the RICE framework (Reach, Impact, Confidence, Effort), how is the priority score calculated?",
      options: [
        "RICE Score = (Reach × Impact × Confidence) / Effort",
        "RICE Score = (Reach + Impact + Confidence) - Effort",
        "RICE Score = Effort / (Reach × Impact)",
        "RICE Score = Reach × Effort × Confidence"
      ],
      correctIndex: 0,
      explanation: "RICE multiplies Reach (users impacted), Impact (scale of benefit), and Confidence (percentage probability) divided by Effort (person-months), yielding an objective ROI metric."
    }
  ];

  // 10 SEPARATE TYPED TECHNICAL & SYSTEM DESIGN QUESTIONS
  const typedTechQuestions = [
    { id: 1, title: "RSC vs Client Component Bundle Optimization", prompt: "Explain how React Server Components (RSC) in Next.js 15 reduce client-side JavaScript bundle sizes and improve TTI (Time to Interactive).", sampleAnswer: "RSC code runs exclusively on the server and stays on the server. Only the rendered HTML/RSC payload is sent to the client, zero JS dependencies needed for rendering." },
    { id: 2, title: "Concurrency & Distributed Locks in High-Traffic APIs", prompt: "How do you handle race conditions when updating account balances in high-concurrency Node.js/Redis systems?", sampleAnswer: "Use atomic Redis Lua scripts or Redlock distributed lock algorithms with TTLs to prevent double-spending and stale state overrides across microservices." },
    { id: 3, title: "REST vs GraphQL vs gRPC Microservice Protocols", prompt: "Compare REST, GraphQL, and gRPC. When would you mandate gRPC over REST for microservice-to-microservice calls?", sampleAnswer: "gRPC uses HTTP/2 multiplexing and binary Protocol Buffers, offering up to 10x performance improvements over REST JSON payloads for low-latency internal RPC calls." },
    { id: 4, title: "Distributed System Rate Limiting (100k QPS)", prompt: "Describe how to design a distributed rate limiter for 100,000 QPS with minimal memory footprint.", sampleAnswer: "Use the Token Bucket or Sliding Window Counter algorithm implemented via atomic Redis Lua scripts to track request counts per API key across multi-region edge gateways." },
    { id: 5, title: "Database Sharding vs Read-Replicas & Consistent Hashing", prompt: "Explain the difference between Read-Replicas and Sharding. What is a consistent hashing ring?", sampleAnswer: "Replicas scale read throughput by duplicating data. Sharding partitions dataset writes across nodes using consistent hashing so adding/removing nodes only re-keys ~1/N data keys." },
    { id: 6, title: "Node.js Event Loop & Memory Leak Debugging", prompt: "How do memory leaks occur in Node.js event loops and how do you diagnose them in production?", sampleAnswer: "Leaks occur via dangling event listeners, unclosed DB connections, or global closures holding references. Diagnosed via heap snapshots comparing delta memory allocation." },
    { id: 7, title: "Optimistic vs Pessimistic Locking", prompt: "Differentiate optimistic locking (versioning) from pessimistic locking (SELECT FOR UPDATE). When is each preferred?", sampleAnswer: "Optimistic uses version numbers for low-contention high-throughput systems. Pessimistic locks rows directly in DB for high-contention financial transactions where retries are unacceptable." },
    { id: 8, title: "Zero-Downtime CI/CD Canary Deployments", prompt: "Walk through how you configure automated Canary deployments with health rollback triggers.", sampleAnswer: "Route 5% traffic to new container version via ingress router, monitor error rates & P99 latency via Prometheus for 10 mins. Automatically rollback if error rates exceed 0.1% threshold." },
    { id: 9, title: "WebSockets vs SSE vs Long Polling", prompt: "Compare WebSockets, Server-Sent Events (SSE), and HTTP Long Polling for real-time live feeds.", sampleAnswer: "WebSockets provide full-duplex bi-directional TCP sockets. SSE provides low-overhead unidirectional server-to-client streaming via standard HTTP. Long polling holds HTTP requests until updates occur." },
    { id: 10, title: "Debugging P99 Latency Spikes in Microservices", prompt: "Describe your methodical approach to finding the root cause of an intermittent P99 latency spike.", sampleAnswer: "Analyze distributed APM traces (Jaeger/OpenTelemetry) to trace slow spans across service boundaries, inspect GC pause times, DB query lock waits, and network packet drops." }
  ];

  // 10 SEPARATE TYPED HR, BEHAVIORAL & LEADERSHIP QUESTIONS
  const typedHrQuestions = [
    { id: 1, title: "Handling Technical Disagreements with Peers", prompt: "Tell me about a time you strongly disagreed with a peer's architecture design right before a deadline. How did you handle it?", sampleAnswer: "STAR: Facilitated a 1-on-1, presented a benchmark matrix with metric trade-offs, compromised on a 2-phase delivery path to keep velocity while ensuring long-term code quality." },
    { id: 2, title: "Critical Production Mistakes & Post-Mortem Accountability", prompt: "Walk me through a production outage or mistake you caused. How did you react and ensure it never recurs?", sampleAnswer: "STAR: Took immediate ownership, led containment, ran a blameless post-mortem, and added automated CI/CD static checks and integration test coverage." },
    { id: 3, title: "Managing Competing Priorities & Deadlines", prompt: "How do you handle a situation where product managers, engineering leads, and clients all demand top priority for different tasks?", sampleAnswer: "Use objective frameworks (RICE matrix), align stakeholders on business ROI vs technical urgency, and establish realistic phased sprint commitments." },
    { id: 4, title: "Communicating Complex Technical Concepts to Executives", prompt: "Describe a time you had to present a complex technical refactor or infrastructure investment to non-technical executives.", sampleAnswer: "Translated technical debt into business metrics: frame refactor in terms of user churn reduction, system downtime prevention, and feature delivery acceleration." },
    { id: 5, title: "Building Collaborative & Inclusive Engineering Culture", prompt: "What concrete steps do you take to foster an inclusive, supportive environment for junior engineers and diverse team members?", sampleAnswer: "Establish structured 1-on-1 mentorship, create psychological safety during code reviews with constructive feedback, and encourage open technical RFC discussions." },
    { id: 6, title: "Handling Underperforming or Disengaged Teammates", prompt: "How do you handle working alongside a struggling or disengaged team member on a critical project?", sampleAnswer: "Engage empathetically in 1-on-1 to identify root blockers (lack of clarity, burnout, skill gap), break down tasks into smaller milestones, and offer pairing support." },
    { id: 7, title: "Adapting to Drastic Requirements Changes Mid-Sprint", prompt: "Tell me about a project where requirements shifted 180 degrees mid-way through development. How did you pivot?", sampleAnswer: "Maintained agile flexibility: reassessed reusable code components, re-scoped remaining sprint backlog with product owner, and communicated adjusted delivery timelines transparently." },
    { id: 8, title: "5-Year Career Trajectory & Goal Alignment", prompt: "Where do you see yourself professionally in 3 to 5 years, and why does this role fit that trajectory?", sampleAnswer: "Demonstrated clear growth: aiming to lead high-impact system architecture and mentor team members while scaling core products at this organization." },
    { id: 9, title: "Company Alignment & Passion", prompt: "Why are you interested in joining our company specifically over other opportunities in the market?", sampleAnswer: "Highlighted specific product innovations, engineering culture, market positioning, and alignment between my personal expertise and company mission." },
    { id: 10, title: "Going Above & Beyond Core Job Scope", prompt: "Describe a scenario where you went out of your way to solve an unassigned issue or improve overall company processes.", sampleAnswer: "Identified a recurring developer friction point (slow local build times), built an automated CI cache script in off-hours, saving the team 45 minutes daily." }
  ];

  // Filtered MCQs
  const filteredQuestions = masterQuestionsBank.filter(q => 
    mcqCategoryFilter === 'All' || q.category === mcqCategoryFilter
  );
  const activeQuestion = filteredQuestions[currentMcqIndex] || filteredQuestions[0];

  const activeTypedTech = typedTechQuestions[typedTechCarouselIdx] || typedTechQuestions[0];
  const activeTypedHr = typedHrQuestions[typedHrCarouselIdx] || typedHrQuestions[0];

  // Score & Progress
  const totalAnswered = Object.keys(userAnswers).length;
  const correctCount = Object.entries(userAnswers).filter(([qId, val]) => {
    const q = masterQuestionsBank.find(item => item.id === Number(qId));
    return q && q.correctIndex === val;
  }).length;

  const prepExecutionPlan = {
    roleTitle: activeRole,
    level: difficulty,

    roleAlignment: {
      targetKeywords: ["Strategic Execution", "Cross-Functional Leadership", "Stakeholder Alignment", "P99 System Latency", "LTV:CAC Optimization", "STAR Anecdotes", "Data-Driven ROI", "Scale Engineering"],
      impactFormula: "Reframe bullet points using: [Action Verb] + [Core Deliverable / Initiative] + [Quantified Metric]",
      exampleBullet: `Led strategic ${activeRole} initiatives at scale, reducing execution bottlenecks by 35% and improving core performance metrics across 1.5M+ active users.`
    },

    interviewerQuestions: [
      { q: "What is the single most critical strategic challenge the team plans to solve in the next two quarters?", reason: "Shows high-level strategic alignment and immediate focus on solving high-value problems." },
      { q: "How does the leadership team balance short-term sprint deadlines against long-term architectural quality?", reason: "Reveals organizational culture, engineering maturity, and cross-functional trust." },
      { q: "What does extraordinary performance look like for someone in this role within their first 90 days?", reason: "Demonstrates proactive drive, goal orientation, and execution focus." }
    ],

    weeklyTargets: [
      { metric: "20 MCQ Drills", label: "MCQ Carousel Practice", detail: "Technical, Behavioral & Strategy Questions" },
      { metric: "10 Tech Typed", label: "Typed Architecture Exam", detail: "Code & System Design Written Answers" },
      { metric: "10 HR Typed", label: "Typed Behavioral Exam", detail: "STAR Leadership Written Anecdotes" },
      { metric: "2 AI Simulator Runs", label: "Mock Interview Practice", detail: "1-on-1 Live Voice/Chat Sessions" }
    ]
  };

  const totalStepsCount = 7;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = Math.round((completedCount / totalStepsCount) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-300">
      
      {/* Title Greeting */}
      <div className="text-center pt-2 space-y-2">
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-slate-900 flex items-center justify-center gap-3">
          <span>AI Interview & Test Generator{userName ? `, ${userName.split(' ')[0]}` : ''}.</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto">
          Generate step-by-step interview preparation blueprints, MCQ practice carousels, interactive 10-question Technical & HR typed exam carousels, and live 1-on-1 AI mock interviews.
        </p>
      </div>

      {/* Target Role Search Bar & Difficulty (Fresher, Mid, Senior) */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGeneratePlan();
              }}
              placeholder="Enter target role (e.g. Full Stack Software Engineer, Growth Marketer, HR Manager...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['Fresher', 'Mid', 'Senior'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    difficulty === lvl
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleGeneratePlan()}
              disabled={isGenerating}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Multi-Domain Presets without Company Names */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Popular Target Roles:
          </div>
          <div className="flex flex-wrap gap-2">
            {presetRoles.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRoleInput(preset.title);
                  handleGeneratePlan(preset.title);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === preset.title
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset.category === 'Tech' && <Code2 className="w-3 h-3 text-blue-600 shrink-0" />}
                {preset.category === 'Marketing' && <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />}
                {preset.category === 'HR' && <Users className="w-3 h-3 text-amber-600 shrink-0" />}
                {preset.category === 'Product' && <Briefcase className="w-3 h-3 text-indigo-600 shrink-0" />}
                {preset.category === 'Design' && <Palette className="w-3 h-3 text-purple-600 shrink-0" />}
                {preset.category === 'Sales' && <DollarSign className="w-3 h-3 text-green-600 shrink-0" />}
                <span>{preset.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4 border border-blue-900/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider">
                Interview Preparation Masterclass
              </span>
              <span className="text-xs text-slate-400 font-medium">Level: {difficulty}</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {activeRole} ({difficulty} Level)
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs text-slate-300 font-medium">Progress</div>
              <div className="text-sm font-extrabold text-white">{completedCount} of {totalStepsCount} Steps ({progressPct}%)</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-extrabold text-xs bg-slate-900">
              {progressPct}%
            </div>
          </div>
        </div>

        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-500"
            style={{ width: `${Math.max(5, progressPct)}%` }}
          />
        </div>
      </div>

      {/* STEP-BY-STEP PLAN */}
      <div className="space-y-8">

        {/* STEP 1: Role Keyword Alignment */}
        <div className={`bg-white border rounded-3xl p-6 shadow-xs transition-all space-y-5 ${
          completedSteps[1] ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center ${
                completedSteps[1] ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                01
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Role Alignment & Impact Keyword Positioning</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Target keywords & metric formulas for {activeRole}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleStepComplete(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                completedSteps[1] 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{completedSteps[1] ? 'Completed' : 'Mark Step Complete'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider block">Target Skill Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {prepExecutionPlan.roleAlignment.targetKeywords.map((kw, kIdx) => (
                  <span key={kIdx} className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">Quantifiable Impact Formula:</span>
              <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-slate-200/80">
                {prepExecutionPlan.roleAlignment.exampleBullet}
              </p>
            </div>
          </div>
        </div>

        {/* STEP 2: INTERACTIVE MCQ CAROUSEL (NO "MARK STEP COMPLETE" BUTTON) */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-blue-600 text-white">
                02
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Interactive MCQ Practice Carousel (Technical & Behavioral)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Practice interactive multiple-choice questions with answer key rationales
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-extrabold text-blue-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Score: {correctCount} / {totalAnswered} Correct</span>
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              {(['All', 'Technical', 'Behavioral', 'Strategy'] as const).map((cat) => (
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
                  {cat} ({masterQuestionsBank.filter(q => cat === 'All' || q.category === cat).length})
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
                Q {currentMcqIndex + 1} of {filteredQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMcqIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                disabled={currentMcqIndex === filteredQuestions.length - 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* ACTIVE CAROUSEL MCQ CARD */}
          {activeQuestion && (
            <div key={activeQuestion.id} className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-200">
                  {activeQuestion.category} · {activeQuestion.domain}
                </span>

                <button
                  type="button"
                  onClick={() => toggleReveal(activeQuestion.id)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{revealedAnswers[activeQuestion.id] ? "Hide Rationale" : "Reveal Answer & Rationale"}</span>
                </button>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                {activeQuestion.question}
              </h4>

              <div className="space-y-2.5 pt-1">
                {activeQuestion.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[activeQuestion.id] === oIdx;
                  const isCorrect = activeQuestion.correctIndex === oIdx;
                  const hasAnswered = userAnswers[activeQuestion.id] !== undefined;

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
                      onClick={() => handleOptionSelect(activeQuestion.id, oIdx)}
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

              {revealedAnswers[activeQuestion.id] && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1 animate-in fade-in duration-300">
                  <strong className="font-extrabold block text-blue-950 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span>AI Answer Rationale:</span>
                  </strong>
                  <p className="leading-relaxed text-blue-900">{activeQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Carousel Pagination Pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {filteredQuestions.map((q, qIdx) => {
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

        {/* STEP 3: TECHNICAL TYPED EXAM CAROUSEL (NO "MARK STEP COMPLETE" BUTTON) */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-blue-600 text-white">
                03
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-blue-600" />
                  <span>Technical & System Design Typed Exam (Carousel)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Type out technical architecture and code answers with AI model benchmark evaluation
                </p>
              </div>
            </div>
          </div>

          {/* Typed Tech Header Controls */}
          <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
              Question {typedTechCarouselIdx + 1} of {typedTechQuestions.length}: {activeTypedTech.title}
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
                {typedTechCarouselIdx + 1} / {typedTechQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => setTypedTechCarouselIdx(prev => Math.min(typedTechQuestions.length - 1, prev + 1))}
                disabled={typedTechCarouselIdx === typedTechQuestions.length - 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* ACTIVE TYPED TECH CAROUSEL QUESTION CARD */}
          {activeTypedTech && (
            <div key={activeTypedTech.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase">
                  Technical Question {typedTechCarouselIdx + 1} of 10
                </span>
                <button
                  type="button"
                  onClick={() => setRevealedTypedTech(prev => ({ ...prev, [activeTypedTech.id]: !prev[activeTypedTech.id] }))}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{revealedTypedTech[activeTypedTech.id] ? "Hide Model Answer" : "Check AI Model Answer"}</span>
                </button>
              </div>

              <p className="text-sm font-bold text-slate-900 leading-snug">{activeTypedTech.prompt}</p>

              <textarea
                rows={3}
                value={typedTechAnswers[activeTypedTech.id] || ''}
                onChange={(e) => setTypedTechAnswers(prev => ({ ...prev, [activeTypedTech.id]: e.target.value }))}
                placeholder="Type your technical answer here (e.g. explain architecture, concurrency locks, APIs...)"
                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-blue-600 transition-all resize-none font-mono"
              />

              {revealedTypedTech[activeTypedTech.id] && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1 animate-in fade-in">
                  <strong className="font-extrabold block text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Model Answer Benchmark:</span>
                  </strong>
                  <p className="text-blue-900 leading-relaxed font-mono">{activeTypedTech.sampleAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Typed Tech Pagination Pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {typedTechQuestions.map((q, qIdx) => {
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

        {/* STEP 4: HR TYPED EXAM CAROUSEL (NO "MARK STEP COMPLETE" BUTTON) */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-blue-600 text-white">
                04
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span>HR, Behavioral & Leadership Typed Exam (Carousel)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Type out STAR anecdotes (Situation, Task, Action, Result) for behavioral rounds
                </p>
              </div>
            </div>
          </div>

          {/* Typed HR Header Controls */}
          <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
              Question {typedHrCarouselIdx + 1} of {typedHrQuestions.length}: {activeTypedHr.title}
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
                {typedHrCarouselIdx + 1} / {typedHrQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => setTypedHrCarouselIdx(prev => Math.min(typedHrQuestions.length - 1, prev + 1))}
                disabled={typedHrCarouselIdx === typedHrQuestions.length - 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* ACTIVE TYPED HR CAROUSEL QUESTION CARD */}
          {activeTypedHr && (
            <div key={activeTypedHr.id} className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 text-[10px] font-extrabold uppercase">
                  HR Question {typedHrCarouselIdx + 1} of 10
                </span>
                <button
                  type="button"
                  onClick={() => setRevealedTypedHr(prev => ({ ...prev, [activeTypedHr.id]: !prev[activeTypedHr.id] }))}
                  className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>{revealedTypedHr[activeTypedHr.id] ? "Hide STAR Benchmark" : "Check STAR Model Answer"}</span>
                </button>
              </div>

              <p className="text-sm font-bold text-slate-900 leading-snug">{activeTypedHr.prompt}</p>

              <textarea
                rows={3}
                value={typedHrAnswers[activeTypedHr.id] || ''}
                onChange={(e) => setTypedHrAnswers(prev => ({ ...prev, [activeTypedHr.id]: e.target.value }))}
                placeholder="Type your STAR response here (Situation, Task, Action, Quantified Result...)"
                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-white border border-amber-200/80 rounded-xl p-3.5 focus:outline-none focus:border-amber-600 transition-all resize-none"
              />

              {revealedTypedHr[activeTypedHr.id] && (
                <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-300 text-xs text-amber-950 space-y-1 animate-in fade-in">
                  <strong className="font-extrabold block text-amber-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>STAR Framework Benchmark Answer:</span>
                  </strong>
                  <p className="text-amber-900 leading-relaxed">{activeTypedHr.sampleAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Typed HR Pagination Pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {typedHrQuestions.map((q, qIdx) => {
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

        {/* STEP 5: Reverse Pitching */}
        <div className={`bg-white border rounded-3xl p-6 shadow-xs transition-all space-y-5 ${
          completedSteps[5] ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center ${
                completedSteps[5] ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                05
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Reverse Pitching – High-Impact Questions to Ask</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Leave a lasting impression on VP of HR, Engineering Managers & Executives</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleStepComplete(5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                completedSteps[5] 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{completedSteps[5] ? 'Completed' : 'Mark Step Complete'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {prepExecutionPlan.interviewerQuestions.map((iq, iqIdx) => (
              <div key={iqIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">"{iq.q}"</p>
                  <span className="text-[11px] text-slate-500 block">Why it works: {iq.reason}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(iq.q, `iq-${iqIdx}`)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 shrink-0"
                >
                  {copiedIndex === `iq-${iqIdx}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 6: Live 1-on-1 AI Simulator */}
        <div className={`p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl space-y-4 flex items-center justify-between flex-wrap gap-4 ${
          completedSteps[6] ? 'border-2 border-emerald-400' : ''
        }`}>
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                Step 06 · Live AI Simulator
              </span>
              <span className="text-xs text-slate-300 font-medium">Interactive Role-play Practice</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Start 1-on-1 AI Voice & Chat Mock Interview
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Launch our AI Interview Copilot pre-configured for <strong className="text-white">{activeRole} ({difficulty} Level)</strong> to simulate real follow-up technical & behavioral questions and receive instant STAR feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                toggleStepComplete(6);
                onLaunchMockInterview(activeRole, `${activeRole} (${difficulty} Level)`);
              }}
              className="px-6 py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 shrink-0 group"
            >
              <Bot className="w-4.5 h-4.5 text-white group-hover:scale-110 transition-transform" />
              <span>Launch Mock Interview →</span>
            </button>
          </div>
        </div>

        {/* STEP 7: Weekly Interview Readiness Roadmap & KPIs */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>Weekly Interview Readiness Targets</span>
              </h3>
              <p className="text-xs text-slate-400">KPIs to guarantee offer readiness for {activeRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {prepExecutionPlan.weeklyTargets.map((target, idx) => (
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
