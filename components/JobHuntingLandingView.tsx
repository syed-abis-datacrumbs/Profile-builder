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
  XCircle,
  DollarSign,
  FileText,
  Users,
  Globe,
  MessageSquare,
  Target,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Copy,
  ExternalLink,
  UserCheck,
  Award,
  Lightbulb,
  Brain,
  Filter,
  Trash2,
  Phone,
  Calendar,
  Clock,
  UserPlus,
  Download,
  Table as TableIcon
} from 'lucide-react';
import { LinkedinIcon } from './icons';

interface JobHuntingLandingViewProps {
  userName?: string;
  onUsePrompt: (promptText: string) => void;
  onOpenEditorDirectly: () => void;
  onNavigateToTab?: (tab: 'resume' | 'linkedin') => void;
}

interface SheetRow {
  id: string;
  company: string;
  contact: string;
  role: string;
  dateAdded: string;
  lastStageDate: string;
  status: 'Connection Request Sent' | 'Approached / Cold DM' | 'Following Up' | 'Recruiter Call' | 'Technical Interview' | 'Offer Received' | 'Rejected';
  notes: string;
}

const formatDateOrdinal = (dateInput?: string): string => {
  if (!dateInput) {
    const todayObj = new Date();
    const d = todayObj.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = months[todayObj.getMonth()];
    const s = ["th", "st", "nd", "rd"];
    const v = d % 100;
    const ord = s[(v - 20) % 10] || s[v] || s[0];
    return `${d}${ord} ${m}`;
  }

  if (/^\d{1,2}(st|nd|rd|th)\s+[A-Za-z]+$/i.test(dateInput.trim())) {
    return dateInput.trim();
  }

  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return dateInput;

  const day = dateObj.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dateObj.getMonth()];

  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const ord = s[(v - 20) % 10] || s[v] || s[0];

  return `${day}${ord} ${month}`;
};

export const JobHuntingLandingView: React.FC<JobHuntingLandingViewProps> = ({
  userName = "Abis",
  onUsePrompt,
  onOpenEditorDirectly,
  onNavigateToTab
}) => {
  const [jobRoleInput, setJobRoleInput] = useState('Full Stack Software Engineer');
  const [activeRole, setActiveRole] = useState('Full Stack Software Engineer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Interactive Quiz & Carousel State
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: number]: boolean }>({});
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqCategoryFilter, setMcqCategoryFilter] = useState<'All' | 'ATS & Resumes' | 'Networking' | 'Negotiation'>('All');

  // Typed Written Exams State (Step 4)
  const [typedTechCarouselIdx, setTypedTechCarouselIdx] = useState(0);
  const [typedTechAnswers, setTypedTechAnswers] = useState<{ [key: number]: string }>({});
  const [revealedTypedTech, setRevealedTypedTech] = useState<{ [key: number]: boolean }>({});

  // SPREADSHEET SHEET TRACKER STATE (STEP 5)
  const [sheetRows, setSheetRows] = useState<SheetRow[]>([
    {
      id: '1',
      company: 'Stripe',
      contact: 'Sarah Jenkins (Tech Recruiter)',
      role: 'Senior Full Stack Engineer',
      dateAdded: '15th July',
      lastStageDate: '28th July',
      status: 'Recruiter Call',
      notes: 'Passed 20-min initial screen. System Architecture round scheduled for Friday 3 PM.'
    },
    {
      id: '2',
      company: 'Datadog',
      contact: 'Michael Chen (Senior Recruiter)',
      role: 'Backend Systems Engineer',
      dateAdded: '30th July',
      lastStageDate: '30th July',
      status: 'Connection Request Sent',
      notes: 'Sent LinkedIn connection note mentioning shared interest in eBPF kernel tooling.'
    },
    {
      id: '3',
      company: 'Vercel',
      contact: 'Alex Rivera (Engineering Lead)',
      role: 'Full Stack Engineer (Next.js)',
      dateAdded: '20th July',
      lastStageDate: '29th July',
      status: 'Approached / Cold DM',
      notes: 'Sent tailored 3-sentence LinkedIn DM with link to Next.js 15 showcase project.'
    },
    {
      id: '4',
      company: 'Figma',
      contact: 'Jessica Alba (Talent Manager)',
      role: 'Product Engineer',
      dateAdded: '18th July',
      lastStageDate: '27th July',
      status: 'Following Up',
      notes: 'Sent 7-day polite follow-up DM on LinkedIn after initial screening chat.'
    },
    {
      id: '5',
      company: 'Linear',
      contact: 'Marcus Vance (Talent Acquisition)',
      role: 'Product Engineer',
      dateAdded: '10th July',
      lastStageDate: '25th July',
      status: 'Technical Interview',
      notes: 'Completed live coding round. Recruiter mentioned positive feedback, awaiting team sync.'
    },
    {
      id: '6',
      company: 'OpenAI',
      contact: 'Elena Rostova (Tech Sourcing Lead)',
      role: 'AI Infrastructure Engineer',
      dateAdded: '5th July',
      lastStageDate: '22nd July',
      status: 'Offer Received',
      notes: 'Initial offer band shared ($185k base + equity). Reviewing compensation by Wednesday.'
    }
  ]);

  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [sheetStatusFilter, setSheetStatusFilter] = useState<'All' | SheetRow['status']>('All');

  const presetRoles = [
    "Full Stack Software Engineer",
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
      setUserAnswers({});
      setRevealedAnswers({});
      setCurrentMcqIndex(0);
      setTypedTechCarouselIdx(0);
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

  // SPREADSHEET SHEET ACTIONS
  const handleAddSheetRow = () => {
    const todayFormatted = formatDateOrdinal();
    const newRow: SheetRow = {
      id: Date.now().toString(),
      company: 'New Company',
      contact: 'Recruiter Contact',
      role: activeRole,
      dateAdded: todayFormatted,
      lastStageDate: todayFormatted,
      status: 'Connection Request Sent',
      notes: 'Sent connection request on LinkedIn.'
    };
    setSheetRows([newRow, ...sheetRows]);
  };

  const handleUpdateSheetCell = (id: string, field: keyof SheetRow, value: string) => {
    const todayFormatted = formatDateOrdinal();
    setSheetRows(sheetRows.map(row => {
      if (row.id !== id) return row;
      if (field === 'status') {
        return { ...row, status: value as SheetRow['status'], lastStageDate: todayFormatted };
      }
      return { ...row, [field]: value };
    }));
  };

  const handleDeleteSheetRow = (id: string) => {
    setSheetRows(sheetRows.filter(row => row.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Contact', 'Role', 'Date Added', 'Last Stage Date', 'Status Stage', 'Notes'];
    const csvRows = sheetRows.map(r => [
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.contact.replace(/"/g, '""')}"`,
      `"${r.role.replace(/"/g, '""')}"`,
      `"${r.dateAdded}"`,
      `"${r.lastStageDate}"`,
      `"${r.status}"`,
      `"${r.notes.replace(/"/g, '""')}"`
    ].join(','));
    
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `job_hunting_outreach_tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Job Hunting Specific MCQ Question Bank
  const jobHuntingMcqs = [
    {
      id: 1,
      category: "ATS & Resumes",
      question: `When tailoring your resume for a ${activeRole} opening, what is the single most effective way to pass ATS keyword parsers?`,
      options: [
        "Include hidden white text at the bottom of the page with 100 random buzzwords",
        "Mirror exact technical stack phrases and impact action verbs directly from the job description in your top experience bullets",
        "Save your resume as an unparseable JPG image file",
        "Write a 4-page detailed narrative biography without bullet points"
      ],
      correctIndex: 1,
      explanation: "ATS scanners parse plain text and calculate semantic keyword density. Matching exact stack terminology in your accomplishment bullets ensures high relevance scores."
    },
    {
      id: 2,
      category: "Networking",
      question: "Which outreach strategy yields the highest response rate when sending cold LinkedIn DMs to recruiters?",
      options: [
        "Sending a generic 'Hi, please refer me for any open job' message",
        "Sending a concise 3-sentence message highlighting 2 specific accomplishments, a matching skill stack, and an offer to share a tailored 1-page PDF resume",
        "Attaching a 50-page portfolio presentation without any text message",
        "Repeatedly messaging the VP of HR 5 times a day until they reply"
      ],
      correctIndex: 1,
      explanation: "Recruiters evaluate candidates in seconds. A concise 3-sentence value proposition showing clear alignment yields a 4x higher response rate than generic pleas."
    },
    {
      id: 3,
      category: "Negotiation",
      question: "When a recruiter asks 'What is your current salary and expected range?' during the first screening call, what is the strongest response?",
      options: [
        "Give your minimum acceptable number immediately so you don't waste time",
        "Refuse to answer angrily and demand they disclose the exact budget first",
        "State that you are focused on finding the right role fit and ask for the benchmarked budget range for the position",
        "Quote double your current salary without market research"
      ],
      correctIndex: 2,
      explanation: "Anchoring your response to the company's established compensation band protects your leverage and prevents anchoring below market value early in the interview process."
    },
    {
      id: 4,
      category: "ATS & Resumes",
      question: "What is the optimal length and metric density for an experienced candidate's resume?",
      options: [
        "3 to 4 pages with narrative paragraph descriptions",
        "Strictly 1 to 2 pages, where 80%+ of bullet points include quantified metrics (e.g. %, $, time saved)",
        "Half a page with only company logos and job titles",
        "A list of hobbies and personal interests"
      ],
      correctIndex: 1,
      explanation: "Executive recruiters spend 6-8 seconds on initial scans. Concise 1-2 page resumes with metric-heavy bullet points stand out immediately."
    }
  ];

  // 10 SEPARATE TYPED JOB HUNTING & OUTREACH EXAM QUESTIONS
  const typedJobTechQuestions = [
    { id: 1, title: "Cold Outreach to Hiring Managers", prompt: "Draft a 3-sentence cold LinkedIn DM to an Engineering Director for an open position.", sampleAnswer: "Hi [Name], loved your recent engineering blog post on scaling microservices. I'm a Senior Engineer with 5+ YOE building high-throughput Node.js APIs (reduced latency by 40% at previous role). Would love to connect and share a tailored resume if you're building out the team!" },
    { id: 2, title: "Salary Expectation Screening Defense", prompt: "How do you respond when an HR recruiter asks for your salary expectations on call #1?", sampleAnswer: "I'm primarily focused on finding the right long-term technical fit. Could you share the approved compensation band for this role so I can confirm alignment?" },
    { id: 3, title: "Handling 7-Day Recruiter Ghosting", prompt: "Write a polite follow-up email after receiving no update 7 days after a successful technical interview.", sampleAnswer: "Hi [Recruiter Name], I really enjoyed my conversation with the team last week regarding the [Role] position. I remain very enthusiastic about the opportunity. Could you provide a quick update on the next steps in the hiring process?" },
    { id: 4, title: "Explaining an Employment Gap", prompt: "How do you frame a 6-month employment gap constructively in an interview?", sampleAnswer: "During that period, I took dedicated time to upskill in cloud infrastructure and modern frontend systems while freelancing for two tech startups, delivering high-impact features." },
    { id: 5, title: "Managing Multiple Competing Offers", prompt: "How do you leverage a pending offer from Company A to accelerate decision timelines with Company B?", sampleAnswer: "Hi [Company B Recruiter], I'm currently in the final decision window for an offer expiring Friday. However, Company B remains my top choice. Is it possible to expedite the feedback from my final round?" },
    { id: 6, title: "Answering 'Why Our Company?'", prompt: "Structure a response explaining why you want to join a specific mid-stage tech startup.", sampleAnswer: "I've been following your product growth in [Industry], specifically your recent API release. My background in high-concurrency Node/React applications directly solves the scalability challenges your team is tackling." },
    { id: 7, title: "Handling Rejection Gracefully for Future Roles", prompt: "Write a LinkedIn message after receiving a rejection email for a final interview round.", sampleAnswer: "Thank you for the update, [Recruiter Name]. I truly enjoyed meeting the engineering team. Please keep my profile in mind for future senior roles, as I'd love to stay connected!" },
    { id: 8, title: "Requesting a Peer Referral on LinkedIn", prompt: "Draft a message asking a 2nd-degree connection for an internal job referral.", sampleAnswer: "Hi [Name], I noticed you're currently working on the core platform team at [Company]. I'm applying for the open [Role] position and would love to get your perspective on team culture over a quick 5-min chat!" },
    { id: 9, title: "Overcoming Under-qualification Objections", prompt: "How do you answer when an interviewer notes you lack 1 specific framework requested in the JD?", sampleAnswer: "While my core expertise is in React/TypeScript, I have deep mastery of fundamental web architecture principles. In my last role, I onboarded onto Go within 2 weeks and shipped production features in Sprint 1." },
    { id: 10, title: "Post-Interview Thank You Email Strategy", prompt: "Write a high-converting post-interview thank you note to the Hiring Manager within 24 hours.", sampleAnswer: "Hi [Hiring Manager], thank you for the insightful conversation today about your distributed caching architecture. Our discussion confirmed my excitement for the role. Attached is a quick 1-pager outlining how I'd approach the Q3 scaling bottleneck we discussed." }
  ];

  const filteredMcqs = jobHuntingMcqs.filter(q => 
    mcqCategoryFilter === 'All' || q.category === mcqCategoryFilter
  );
  const activeMcq = filteredMcqs[currentMcqIndex] || filteredMcqs[0];
  const activeTypedTech = typedJobTechQuestions[typedTechCarouselIdx] || typedJobTechQuestions[0];

  const totalAnswered = Object.keys(userAnswers).length;
  const correctCount = Object.entries(userAnswers).filter(([qId, val]) => {
    const q = jobHuntingMcqs.find(item => item.id === Number(qId));
    return q && q.correctIndex === val;
  }).length;

  const filteredSheetRows = sheetRows.filter(row => {
    const matchesFilter = sheetStatusFilter === 'All' || row.status === sheetStatusFilter;
    const matchesSearch = sheetSearchQuery === '' || 
      row.company.toLowerCase().includes(sheetSearchQuery.toLowerCase()) ||
      row.contact.toLowerCase().includes(sheetSearchQuery.toLowerCase()) ||
      row.role.toLowerCase().includes(sheetSearchQuery.toLowerCase()) ||
      row.notes.toLowerCase().includes(sheetSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: SheetRow['status']) => {
    switch (status) {
      case 'Connection Request Sent':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      case 'Approached / Cold DM':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Following Up':
        return 'bg-cyan-100 text-cyan-900 border-cyan-200 font-bold';
      case 'Recruiter Call':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Technical Interview':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Offer Received':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'Rejected':
        return 'bg-rose-100 text-rose-900 border-rose-200';
    }
  };

  const executionPlan = {
    roleTitle: activeRole,
    resume: {
      atsScoreTarget: "94%+ ATS Keyword Match",
      recommendedTitle: `${activeRole} | Technical Specialist`,
      topKeywords: ["TypeScript", "Next.js 15", "Node.js", "Redis Caching", "GraphQL", "AWS/Cloud", "CI/CD Pipelines", "System Design"],
      bulletFormula: "Achieved [Metric X%] by re-architecting [System Y] using [Technology Z], resulting in $120k annual savings.",
      actionTip: "Customize your top 3 work experiences to echo exact tech stack terms found in the target job posting."
    },
    linkedin: {
      headlineFormula: `${activeRole} | Building High-Performance Distributed Systems & Web Products | 5+ YOE`,
      aboutSummary: `Results-driven ${activeRole} with a proven track record of scaling high-traffic web applications and leading technical features from zero to one.`
    },
    weeklyTargets: [
      { metric: `${sheetRows.length} Sheet Rows`, label: "Target Outreaches", detail: "Tracked in Data Sheet" },
      { metric: `${sheetRows.filter(e => e.status === 'Recruiter Call').length} Calls`, label: "Recruiter Screenings", detail: "Scheduled / Completed" },
      { metric: `${sheetRows.filter(e => e.status === 'Technical Interview').length} Active`, label: "Technical Rounds", detail: "System Design & Code" },
      { metric: `${sheetRows.filter(e => e.status === 'Offer Received').length} Offers`, label: "Pending Offers", detail: "Compensation Review" }
    ]
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-300">
      
      {/* Title Greeting */}
      <div className="text-center pt-2 space-y-2">
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-slate-900 flex items-center justify-center gap-3">
          <span>Job Hunting Blueprint, {userName.split(' ')[0]}.</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto">
          Step-by-step masterclass blueprint, recruiter outreach practice carousels, and an interactive Job & Recruiter Contact Spreadsheet.
        </p>
      </div>

      {/* Target Role Input */}
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
              placeholder="Enter target role (e.g. Full Stack Software Engineer, Product Manager...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => handleGeneratePlan()}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Presets */}
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
                  setJobRoleInput(preset);
                  handleGeneratePlan(preset);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeRole === preset
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-lg space-y-2 border border-emerald-900/40">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-wider">
          Job Hunting Masterclass
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Target Role: {activeRole}
        </h2>
      </div>

      {/* EXECUTION PLAN STEPS */}
      <div className="space-y-8">

        {/* STEP 1: ATS Resume */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                01
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Resume Optimization for ATS Systems</span>
                </h3>
                <p className="text-xs text-slate-500">{executionPlan.resume.atsScoreTarget}</p>
              </div>
            </div>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('resume')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Edit Resume →</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <span className="font-extrabold text-emerald-900 uppercase tracking-wider block">Top Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {executionPlan.resume.topKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-bold shadow-2xs">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider block">Quantifiable Impact Formula:</span>
              <p className="text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                {executionPlan.resume.bulletFormula}
              </p>
            </div>
          </div>
        </div>

        {/* STEP 2: LinkedIn Positioning */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
                02
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <LinkedinIcon className="w-5 h-5 text-blue-600" />
                  <span>LinkedIn Profile Positioning</span>
                </h3>
                <p className="text-xs text-slate-500">Recruiter placement optimization</p>
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
            <span className="font-extrabold text-blue-950 uppercase tracking-wider block text-xs">High-Converting Headline:</span>
            <p className="text-xs text-blue-950 font-bold bg-white p-3 rounded-xl border border-blue-200">
              {executionPlan.linkedin.headlineFormula}
            </p>
          </div>
        </div>

        {/* INTERACTIVE FEATURE: AI RECRUITER COLD OUTREACH & INMAIL GENERATOR */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl space-y-5 border border-indigo-500/30">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                  <span>AI Recruiter Cold Outreach & InMail Generator</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                    PRO FEATURE
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Bypass the application black hole with personalized DMs, elevator pitches & 1-click tracking
                </p>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400">
              Target Role: <strong className="text-white font-bold">{activeRole}</strong>
            </div>
          </div>

          {/* OUTREACH CONTROLS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block uppercase text-[10px] tracking-wider">
                1. Target Audience:
              </label>
              <select
                value={sheetSearchQuery ? sheetSearchQuery : 'Hiring Manager'}
                onChange={(e) => {
                  const target = e.target.value;
                  const sampleHooks: Record<string, string> = {
                    'Hiring Manager': `Architected high-throughput microservices using ${activeRole} stack, reducing latency by 40%.`,
                    'Talent Recruiter': `Experienced ${activeRole} with proven track record of shipping scalable production web apps.`,
                    'Peer Referral': `Followed your recent work on open-source dev tools and loved your engineering architecture.`,
                    'VP of Engineering': `Led cross-functional team of 6 engineers delivering enterprise SaaS platform under deadline.`
                  };
                  if (sampleHooks[target]) setSheetSearchQuery('');
                }}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="Hiring Manager" className="bg-slate-900 text-white font-bold">Hiring Manager (Engineering Lead)</option>
                <option value="Talent Recruiter" className="bg-slate-900 text-white font-bold">Talent Recruiter / HR Lead</option>
                <option value="Peer Referral" className="bg-slate-900 text-white font-bold">Peer Developer (Internal Referral)</option>
                <option value="VP of Engineering" className="bg-slate-900 text-white font-bold">VP of Engineering / CTO</option>
              </select>
            </div>

            {/* Outreach Goal */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block uppercase text-[10px] tracking-wider">
                2. Outreach Goal:
              </label>
              <select
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="Initial DM" className="bg-slate-900 text-white font-bold">Initial Cold DM Pitch (3 Sentences)</option>
                <option value="7-Day Followup" className="bg-slate-900 text-white font-bold">7-Day Polite Follow-Up Note</option>
                <option value="Post Interview" className="bg-slate-900 text-white font-bold">Post-Interview Thank You & Recap</option>
                <option value="Salary Counter" className="bg-slate-900 text-white font-bold">Salary Counter-Proposal Script</option>
              </select>
            </div>

            {/* Key Hook / Accomplishment */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block uppercase text-[10px] tracking-wider">
                3. Key Metric / Hook:
              </label>
              <input
                type="text"
                defaultValue={`Built scalable ${activeRole} system reducing load times by 45% for 100k+ MAU`}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-400 text-xs placeholder-slate-400"
                placeholder="e.g. Optimized DB queries by 60%..."
              />
            </div>
          </div>

          {/* GENERATED PITCH CARDS DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Pitch Format 1: 3-Sentence LinkedIn InMail */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase">
                  Option A: 3-Sentence LinkedIn DM
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`Hi [Name], loved your team's recent updates on engineering scaling. I'm a ${activeRole} with a strong track record of shipping high-impact features (e.g. reduced latency by 45% at previous role). Would love to connect and share a tailored 1-page resume if you're building out the team!`, 101)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedIndex === 101 ? 'Copied!' : 'Copy DM'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-xl border border-white/10">
                "Hi [Name], loved your team's recent updates on engineering scaling. I'm a <strong>{activeRole}</strong> with a strong track record of shipping high-impact features (e.g. reduced latency by 45% at previous role). Would love to connect and share a tailored 1-page resume if you're building out the team!"
              </p>

              <button
                type="button"
                onClick={() => {
                  const todayFormatted = formatDateOrdinal();
                  const newRow: SheetRow = {
                    id: Date.now().toString(),
                    company: 'Target Company',
                    contact: 'Recruiter Contact',
                    role: activeRole,
                    dateAdded: todayFormatted,
                    lastStageDate: todayFormatted,
                    status: 'Approached / Cold DM',
                    notes: `Sent LinkedIn DM: "Hi [Name], loved your team's recent updates on engineering scaling..."`
                  };
                  setSheetRows([newRow, ...sheetRows]);
                  copyToClipboard('Logged to Data Sheet!', 101);
                }}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log to Data Sheet Tracker</span>
              </button>
            </div>

            {/* Pitch Format 2: Formal Cold Email */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase">
                  Option B: Cold Email with Subject Line
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`Subject: ${activeRole} Candidate - Ex-Startup Engineer\n\nHi [Hiring Manager Name],\n\nI noticed [Company Name] is actively expanding its core product team. As a ${activeRole}, I've spent the last 4 years architecting resilient frontend/backend systems that scale seamlessly.\n\n3 Quick Highlights:\n• Re-architected API data layer reducing response times by 45%\n• Standardized Next.js 15 micro-frontend architecture for 100k+ MAU\n• Built automated CI/CD pipelines cutting deployment cycles in half\n\nI've attached my 1-page resume for your review. Would you be open to a 10-minute introductory call next Tuesday?\n\nBest regards,\n[Your Name]`, 102)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedIndex === 102 ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="text-emerald-400 font-bold">Subject: {activeRole} Candidate - Product Scaling</div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Hi [Hiring Manager], noticed [Company] is expanding its core team. As a {activeRole}, I recently optimized Next.js micro-frontends reducing latency by 45% for 100k MAU. Attached is my 1-page resume for review!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const todayFormatted = formatDateOrdinal();
                  const newRow: SheetRow = {
                    id: Date.now().toString(),
                    company: 'Target Company',
                    contact: 'Engineering Manager',
                    role: activeRole,
                    dateAdded: todayFormatted,
                    lastStageDate: todayFormatted,
                    status: 'Approached / Cold DM',
                    notes: `Sent Cold Email: Subject: ${activeRole} Candidate - Product Scaling`
                  };
                  setSheetRows([newRow, ...sheetRows]);
                  copyToClipboard('Logged to Data Sheet!', 102);
                }}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log to Data Sheet Tracker</span>
              </button>
            </div>

          </div>
        </div>

        {/* STEP 3: INTERACTIVE JOB HUNTING MCQ PRACTICE CAROUSEL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-emerald-600 text-white">
                03
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Interactive Job Hunting & Recruiter Tactics MCQ Carousel</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Practice recruiter outreach, ATS formatting, and salary negotiation questions
                </p>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Score: {correctCount} / {totalAnswered} Correct</span>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              {(['All', 'ATS & Resumes', 'Networking', 'Negotiation'] as const).map((cat) => (
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
                  {cat} ({jobHuntingMcqs.filter(q => cat === 'All' || q.category === cat).length})
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
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {activeMcq.category}
                </span>

                <button
                  type="button"
                  onClick={() => toggleReveal(activeMcq.id)}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
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

                  let style = "border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/60 hover:border-emerald-300 hover:scale-[1.005]";
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
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in duration-300">
                  <strong className="font-extrabold block text-emerald-950 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-emerald-600" />
                    <span>AI Strategy Rationale:</span>
                  </strong>
                  <p className="leading-relaxed text-emerald-900">{activeMcq.explanation}</p>
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
                      ? 'bg-emerald-600 text-white shadow-xs'
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

        {/* STEP 4: OUTREACH & TECHNICAL TYPED EXAM CAROUSEL (10 QUESTIONS) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs transition-all space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-emerald-600 text-white">
                04
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-emerald-600" />
                  <span>Outreach & Recruiter Strategy Typed Exam (Carousel)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Type out cold DMs, follow-up messages, and salary negotiation tactics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
              Question {typedTechCarouselIdx + 1} of {typedJobTechQuestions.length}: {activeTypedTech.title}
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
                {typedTechCarouselIdx + 1} / {typedJobTechQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => setTypedTechCarouselIdx(prev => Math.min(typedJobTechQuestions.length - 1, prev + 1))}
                disabled={typedTechCarouselIdx === typedJobTechQuestions.length - 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {activeTypedTech && (
            <div key={activeTypedTech.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase">
                  Outreach Question {typedTechCarouselIdx + 1} of 10
                </span>
                <button
                  type="button"
                  onClick={() => setRevealedTypedTech(prev => ({ ...prev, [activeTypedTech.id]: !prev[activeTypedTech.id] }))}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
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
                placeholder="Type your outreach message or response here..."
                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-emerald-600 transition-all resize-none font-mono"
              />

              {revealedTypedTech[activeTypedTech.id] && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in">
                  <strong className="font-extrabold block text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>AI High-Converting Benchmark:</span>
                  </strong>
                  <p className="text-emerald-900 leading-relaxed font-mono">{activeTypedTech.sampleAnswer}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {typedJobTechQuestions.map((q, qIdx) => {
              const isTyped = typedTechAnswers[q.id] && typedTechAnswers[q.id].trim().length > 0;
              const isCurrent = typedTechCarouselIdx === qIdx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setTypedTechCarouselIdx(qIdx)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-xs'
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

        {/* STEP 5: INTERACTIVE JOB HUNTING SPREADSHEET / SHEET TRACKER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl font-extrabold text-sm flex items-center justify-center bg-emerald-600 text-white">
                05
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-emerald-600" />
                  <span>Recruiter Outreach & Call Data Sheet</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Spreadsheet tracker to edit, filter, and export contacts approached and recruiter screening calls
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleAddSheetRow}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          {/* SPREADSHEET SHEET CONTROLS & FILTERS */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-b border-slate-100 pb-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search spreadsheet rows (Company, Recruiter, Role, Notes)..."
                value={sheetSearchQuery}
                onChange={(e) => setSheetSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Status:</span>
              {(['All', 'Connection Request Sent', 'Approached / Cold DM', 'Following Up', 'Recruiter Call', 'Technical Interview', 'Offer Received'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSheetStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                    sheetStatusFilter === st
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : st === 'All'
                      ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      : getStatusBadge(st as SheetRow['status'])
                  }`}
                >
                  {st === 'All' ? 'All' : st.split(' ')[0]} ({sheetRows.filter(e => st === 'All' || e.status === st).length})
                </button>
              ))}
            </div>
          </div>

          {/* SPREADSHEET TABLE GRID CONTAINER */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">#</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-200">Company</th>
                  <th className="py-2.5 px-3 min-w-[150px] border-r border-slate-200">Contact / Recruiter</th>
                  <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-200">Role</th>
                  <th className="py-2.5 px-3 min-w-[110px] border-r border-slate-200">Date Added</th>
                  <th className="py-2.5 px-3 min-w-[125px] border-r border-slate-200">Last Stage Date</th>
                  <th className="py-2.5 px-3 min-w-[170px] border-r border-slate-200">Status Stage</th>
                  <th className="py-2.5 px-3 min-w-[220px] border-r border-slate-200">Call / Outreach Notes</th>
                  <th className="py-2.5 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                {filteredSheetRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400 italic">
                      No rows match the spreadsheet filter. Click "+ Add Row" above to add new data.
                    </td>
                  </tr>
                ) : (
                  filteredSheetRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors group">
                      {/* Row Index */}
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] border-r border-slate-200 bg-slate-50/50">
                        {idx + 1}
                      </td>

                      {/* Company Name Cell */}
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.company}
                          onChange={(e) => handleUpdateSheetCell(row.id, 'company', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 rounded font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Contact / Recruiter Cell */}
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.contact}
                          onChange={(e) => handleUpdateSheetCell(row.id, 'contact', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 rounded text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Role Title Cell */}
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.role}
                          onChange={(e) => handleUpdateSheetCell(row.id, 'role', e.target.value)}
                          className="w-full bg-transparent px-2 py-1 rounded text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Date Added Cell */}
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.dateAdded}
                          onChange={(e) => handleUpdateSheetCell(row.id, 'dateAdded', e.target.value)}
                          className="w-full bg-transparent px-1 py-1 rounded text-slate-700 font-semibold text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. 24th June"
                        />
                      </td>

                      {/* Last Stage Date Cell */}
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.lastStageDate}
                          onChange={(e) => handleUpdateSheetCell(row.id, 'lastStageDate', e.target.value)}
                          className="w-full bg-transparent px-1 py-1 rounded text-slate-700 font-semibold text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. 28th July"
                        />
                      </td>

                      {/* Status Dropdown Cell */}
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <select
                          value={row.status}
                          onChange={(e) => handleUpdateSheetCell(row.id, 'status', e.target.value as SheetRow['status'])}
                          className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-none transition-colors ${getStatusBadge(row.status)}`}
                        >
                          <option value="Connection Request Sent" className="bg-indigo-50 text-indigo-900 font-bold">Connection Request Sent</option>
                          <option value="Approached / Cold DM" className="bg-blue-50 text-blue-900 font-bold">Approached / Cold DM</option>
                          <option value="Following Up" className="bg-cyan-50 text-cyan-900 font-bold">Following Up</option>
                          <option value="Recruiter Call" className="bg-amber-50 text-amber-900 font-bold">Recruiter Call</option>
                          <option value="Technical Interview" className="bg-purple-50 text-purple-900 font-bold">Technical Interview</option>
                          <option value="Offer Received" className="bg-emerald-50 text-emerald-900 font-bold">Offer Received</option>
                          <option value="Rejected" className="bg-rose-50 text-rose-900 font-bold">Rejected</option>
                        </select>
                      </td>

                      {/* Notes / Call Log Cell */}
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => handleUpdateSheetCell(row.id, 'notes', e.target.value)}
                          placeholder="Add call notes or follow-up status..."
                          className="w-full bg-transparent px-2 py-1 rounded text-slate-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Action Cell */}
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSheetRow(row.id)}
                          className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SPREADSHEET FOOTER METRICS SUMMARY */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 font-medium pt-1 px-1">
            <span className="font-bold text-slate-700">Total Tracked: <strong className="text-emerald-700 font-black">{filteredSheetRows.length} Rows</strong></span>
            <div className="flex items-center gap-3 flex-wrap">
              <span>Connection Sent: <strong className="text-indigo-700 font-bold">{sheetRows.filter(r => r.status === 'Connection Request Sent').length}</strong></span>
              <span>Approached: <strong className="text-blue-700 font-bold">{sheetRows.filter(r => r.status === 'Approached / Cold DM').length}</strong></span>
              <span>Follow Ups: <strong className="text-cyan-700 font-bold">{sheetRows.filter(r => r.status === 'Following Up').length}</strong></span>
              <span>Calls: <strong className="text-amber-700 font-bold">{sheetRows.filter(r => r.status === 'Recruiter Call').length}</strong></span>
              <span>Interviews: <strong className="text-purple-700 font-bold">{sheetRows.filter(r => r.status === 'Technical Interview').length}</strong></span>
              <span>Offers: <strong className="text-emerald-700 font-bold">{sheetRows.filter(r => r.status === 'Offer Received').length}</strong></span>
            </div>
          </div>
        </div>

        {/* STEP 6: Weekly Targets */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                06
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
