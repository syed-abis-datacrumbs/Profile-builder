export interface LinkedinTemplateSampleExperience {
  title: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

export interface LinkedinTemplateSampleEducation {
  school: string;
  degree: string;
  fieldOfStudy: string;
  start: string;
  end: string;
}

export interface LinkedinTemplateSampleCertification {
  name: string;
  organization: string;
  date: string;
}

export interface LinkedinTemplateSampleProject {
  title: string;
  description: string;
}

export interface LinkedinTemplateSampleAward {
  title: string;
  issuer: string;
  date: string;
}

export interface LinkedinActivityPost {
  id: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

export interface LinkedinRecommendation {
  id: string;
  recommenderName: string;
  recommenderAvatar?: string;
  recommenderTitle: string;
  relationship: string;
  text: string;
}

export interface LinkedinTemplateFeaturedItem {
  type: string;
  title: string;
  description: string;
  image: string;
  reactions?: string;
}

export interface LinkedinTemplateSample {
  fullName: string;
  /** Short job title (LMS's "currentPosition") — feeds cover-art fields bound to defaultFrom: "currentPosition". */
  title: string;
  headline: string;
  location: string;
  currentCompany: string;
  school: string;
  about: string;
  skills: string[];
  // Extended fields sourced from LMS sampleLinkedInProfiles.ts
  experience: LinkedinTemplateSampleExperience[];
  education: LinkedinTemplateSampleEducation[];
  certifications: LinkedinTemplateSampleCertification[];
  projects: LinkedinTemplateSampleProject[];
  awards: LinkedinTemplateSampleAward[];
  featured?: LinkedinTemplateFeaturedItem[];
  activity?: LinkedinActivityPost[];
  recommendations?: LinkedinRecommendation[];
}

export const DEFAULT_SAMPLE_ACTIVITY: LinkedinActivityPost[] = [
  {
    id: 'post-1',
    timeAgo: '2w • Edited',
    content: "Excited to share that our team just completed a major system migration, cutting API response times by 40%! Proud of what we've built and the engineering milestones achieved.",
    image: '/images/featured-thumbnail/project thumbnail.png',
    likes: 128,
    comments: 24,
  },
  {
    id: 'post-2',
    timeAgo: '1mo',
    content: "Architecture decisions compound over time. Prioritizing observability, clean modular contracts, and automated testing early on always pays massive dividends down the road.",
    likes: 85,
    comments: 11,
  },
];

export const DEFAULT_SAMPLE_RECOMMENDATIONS: LinkedinRecommendation[] = [
  {
    id: 'rec-1',
    recommenderName: 'Sarah Jenkins',
    recommenderAvatar: '/images/featured-thumbnail/mutual connection.png',
    recommenderTitle: 'VP of Engineering • Tech Leader & Strategic Advisor',
    relationship: 'March 14, 2024, Sarah managed directly',
    text: 'One of the most talented, dedicated professionals I have had the privilege to work with. Consistently demonstrated exceptional technical leadership, clear communication, and an ability to deliver high-impact results in fast-paced environments.',
  },
  {
    id: 'rec-2',
    recommenderName: 'David Chen',
    recommenderAvatar: '/images/featured-thumbnail/mutual connection 2.png',
    recommenderTitle: 'Principal Architect & Technology Strategist',
    relationship: 'November 28, 2023, David worked with on the same team',
    text: 'A brilliant team player with phenomenal problem-solving capabilities. Their deep expertise and collaborative spirit elevated our entire engineering department. Any team would be lucky to have them!',
  },
];

// Sample profile copy for the template preview screen — sourced directly from
// the DataCrumbs LMS's sampleLinkedInProfiles.ts (src/app/student/
// linkedin-builder/sampleLinkedInProfiles.ts). One entry per career track,
// keyed by the matching cover template id in lib/linkedinCovers.ts.
// The same fictional persona ("Ayesha Raza", Lahore, Pakistan) is used
// across all tracks for consistency. Every track carries 2 education
// entries, 2 projects, and 2 certifications so the full-profile preview
// (Experience/Education/Projects/Certifications cards) never looks sparse.
export const linkedinTemplateSamples: Record<string, LinkedinTemplateSample> = {
  'ideas-inspire': {
    fullName: 'Ayesha Raza',
    title: 'AI/ML Engineer',
    headline: 'AI/ML Engineer | Building production ML systems with PyTorch & MLOps',
    location: 'Lahore, Pakistan',
    currentCompany: 'NeuralWorks AI',
    school: 'University of the Punjab',
    about:
      "I build and ship machine learning models that actually make it to production — not just notebooks. My focus is the full lifecycle: data pipelines, training, evaluation, and monitoring models once they're live. Outside of shipping features, I spend time reproducing papers to separate what's genuinely production-ready from what only works on a clean benchmark, and I'm especially interested in efficient inference and making large models cheaper to serve at scale.\n\nAt NeuralWorks AI, I built a recommendation engine that now serves 200K+ daily users, and cutting inference latency by 40% through model quantization taught me how much of ML engineering is really systems engineering in disguise. Always happy to talk shop about feature stores, model monitoring, or the messy reality of keeping ML systems reliable in production — feel free to reach out.",
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'MLOps', 'Docker', 'SQL', 'AWS SageMaker'],
    experience: [
      {
        title: 'AI/ML Engineer',
        company: 'NeuralWorks AI',
        start: 'Mar 2023',
        end: 'Present',
        description:
          'Built a recommendation engine serving 200K+ daily users using PyTorch and a feature store.\nCut inference latency by 40% through model quantization and batching optimizations.\nPartnered with the data team to design the feature store now reused by two other ML projects.\nStood up model-monitoring dashboards that catch data drift before it reaches customers.',
      },
      {
        title: 'Machine Learning Intern',
        company: 'DataForge Labs',
        start: 'Aug 2022',
        end: 'Feb 2023',
        description:
          'Trained and evaluated classification models on customer churn data using scikit-learn.\nBuilt the data-cleaning pipeline the team still uses today.\nPresented model performance findings to stakeholders outside the data team.\nWrote unit tests for the feature-engineering module, catching two silent data bugs.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (F.Sc)',
        fieldOfStudy: 'Pre-Engineering',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Deep Learning Specialization', organization: 'DeepLearning.AI', date: '2022' },
      { name: 'Machine Learning', organization: 'Stanford Online', date: '2021' },
    ],
    projects: [
      {
        title: 'Real-Time Recommendation Engine',
        description: 'PyTorch-based collaborative filtering model served via FastAPI, processing 200K+ daily requests.',
      },
      {
        title: 'Model Drift Monitoring Dashboard',
        description: 'Lightweight monitoring service tracking prediction drift across 5 production models, alerting the team via Slack.',
      },
    ],
    awards: [],
  },

  'lets-work-together': {
    fullName: 'Hamza Iqbal',
    title: 'Data Scientist',
    headline: 'Data Scientist | Turning messy data into decisions that matter',
    location: 'Lahore, Pakistan',
    currentCompany: 'InsightMetrics',
    school: 'Lahore University of Management Sciences',
    about:
      "I spend most of my time somewhere between a spreadsheet and a statistics textbook. I care less about building the fanciest model and more about answering the actual business question — and being honest when the data doesn't say what everyone hoped it would. I'm most energized by the moments right before a launch, when an experiment either confirms or completely upends what the team assumed going in — and I try to make sure the team trusts the number either way.\n\nAt InsightMetrics, I built a churn-prediction model that helped the retention team cut monthly churn by 12%, and designed the A/B testing framework three product teams now rely on. Always glad to compare notes on experimentation design, churn modeling, or making statistics actually usable for non-technical stakeholders.",
    skills: ['Python', 'Pandas', 'SQL', 'Statistics', 'A/B Testing', 'Tableau', 'scikit-learn', 'R'],
    experience: [
      {
        title: 'Data Scientist',
        company: 'InsightMetrics',
        start: 'Jan 2023',
        end: 'Present',
        description:
          'Built a churn-prediction model that helped the retention team cut monthly churn by 12%.\nDesigned the A/B testing framework now used across three product teams.\nPresented quarterly findings directly to leadership, shaping two roadmap decisions.\nMentored a junior analyst on experiment design and statistical significance testing.',
      },
      {
        title: 'Data Analyst',
        company: 'RetailPulse',
        start: 'Jun 2021',
        end: 'Dec 2022',
        description:
          'Owned weekly sales-performance dashboards used by regional managers across 4 regions.\nRan cohort analyses that directly shaped two major pricing decisions.\nAutomated a manual reporting process, saving roughly 6 hours per week.\nPartnered with engineering to fix data-quality issues at the source rather than downstream.',
      },
    ],
    education: [
      {
        school: 'Lahore University of Management Sciences',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Data Science',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Professional Data Scientist Certificate', organization: 'IBM', date: '2021' },
      { name: 'Statistics with Python Specialization', organization: 'University of Michigan (Coursera)', date: '2020' },
    ],
    projects: [
      {
        title: 'Churn Prediction Model',
        description: 'End-to-end scikit-learn pipeline predicting customer churn with 87% accuracy, deployed via Flask.',
      },
      {
        title: 'A/B Testing Framework',
        description: 'Internal Python library standardizing experiment design and significance testing, adopted by three product teams.',
      },
    ],
    awards: [],
  },

  'helping-businesses': {
    fullName: 'Sana Mirza',
    title: 'Full Stack Developer',
    headline: 'Full Stack Developer | React, Node.js & everything in between',
    location: 'Lahore, Pakistan',
    currentCompany: 'TechNova Solutions',
    school: 'University of the Punjab',
    about:
      "I'm comfortable moving between a React component and a database migration in the same afternoon. I like owning a feature end-to-end — from the API contract to the pixel-level details of the UI. I care a lot about developer experience too — clean APIs, sane project structure, and documentation that saves the next person (often future me) an afternoon of guessing.\n\nAt TechNova Solutions, I build and maintain a React/Next.js front-end backed by a Node.js/PostgreSQL API serving 50K+ monthly active users, and led a TypeScript migration that noticeably cut runtime bugs. Open to chatting about React architecture, API design, or anything TypeScript-migration related.",
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'REST APIs', 'Docker'],
    experience: [
      {
        title: 'Full Stack Developer',
        company: 'TechNova Solutions',
        start: 'Jun 2023',
        end: 'Present',
        description:
          'Build and maintain a React/Next.js front-end backed by a Node.js/PostgreSQL API serving 50K+ monthly active users.\nLed a company-wide migration to TypeScript that noticeably cut runtime bugs.\nDesigned the REST API contract now shared across web and mobile clients.\nReviewed pull requests daily and mentored two junior developers on React best practices.',
      },
      {
        title: 'Junior Web Developer',
        company: 'PixelCraft Studio',
        start: 'Jan 2022',
        end: 'May 2023',
        description:
          'Shipped responsive marketing sites and internal tools for a range of small-business clients.\nTranslated Figma designs into pixel-accurate, production React pages.\nSet up CI checks that caught broken builds before they reached staging.\nFixed cross-browser bugs reported by clients, improving overall site stability.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Full-Stack Web Development', organization: 'DataCrumbs', date: '2022' },
      { name: 'Meta Back-End Developer Certificate', organization: 'Meta', date: '2021' },
    ],
    projects: [
      {
        title: 'Task Flow — Team Productivity App',
        description: 'React + Node.js app for small teams to plan sprints and track tasks with real-time WebSocket updates.',
      },
      {
        title: 'Client Onboarding Portal',
        description: 'Self-serve onboarding portal with document upload and status tracking, cutting manual onboarding emails significantly.',
      },
    ],
    awards: [],
  },

  'stunning-websites': {
    fullName: 'Bilal Ahmed',
    title: 'Frontend Developer',
    headline: 'Frontend Developer | Crafting fast, accessible interfaces with React',
    location: 'Lahore, Pakistan',
    currentCompany: 'PixelCraft Studio',
    school: 'University of the Punjab',
    about:
      "I care about the details most users never consciously notice — a button that feels instant, a layout that never jumps, a page that's usable with a keyboard alone. I build with React and Tailwind and I always check Lighthouse before I call something done. Accessibility isn't an afterthought for me — I test with a screen reader regularly and treat a11y bugs with the same priority as visual bugs, because a beautiful interface that excludes people isn't actually done.\n\nAt PixelCraft Studio, I rebuilt the company's main marketing site in Next.js, taking its Lighthouse performance score from 61 to 96. Always up for a conversation about performance budgets, design systems, or accessible component patterns.",
    skills: ['JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'HTML/CSS', 'Accessibility (a11y)', 'Figma', 'Git'],
    experience: [
      {
        title: 'Frontend Developer',
        company: 'PixelCraft Studio',
        start: 'Feb 2023',
        end: 'Present',
        description:
          "Rebuilt the company's main marketing site in Next.js from the ground up.\nImproved Lighthouse performance score from 61 to 96 and cut page load time in half.\nBuilt and maintain a shared component library used across 4 client projects.\nRan accessibility audits that brought every client site to WCAG AA compliance.",
      },
      {
        title: 'Web Development Intern',
        company: 'BrightPath Agency',
        start: 'Jul 2022',
        end: 'Jan 2023',
        description:
          "Built reusable React components for client sites across the agency's shared design system.\nFixed cross-browser layout bugs that had gone unresolved for months.\nConverted static Figma mockups into responsive, production-ready pages.\nWrote component documentation adopted as the team's onboarding reference.",
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Frontend Web Development', organization: 'Meta', date: '2022' },
      { name: 'Web Accessibility Certification', organization: 'W3Cx (edX)', date: '2021' },
    ],
    projects: [
      {
        title: 'Portfolio Site Rebuild',
        description: 'Next.js marketing site with Lighthouse score 96, fully accessible and mobile-first.',
      },
      {
        title: 'Shared Component Library',
        description: 'Reusable, accessible React/Tailwind component set adopted across 4 client projects, cutting new-page build time significantly.',
      },
    ],
    awards: [],
  },

  'purple-geometric': {
    fullName: 'Mahnoor Khan',
    title: 'Software Engineer',
    headline: 'Software Engineer | Building scalable backend systems',
    location: 'Lahore, Pakistan',
    currentCompany: 'TechNova Solutions',
    school: 'University of the Punjab',
    about:
      "I'm a software engineer who enjoys turning ambiguous problems into clean, maintainable products. Over the past few years I've worked across the stack — from React front-ends to Node.js APIs. I'd rather spend an extra hour writing a clear interface than leave the next engineer (or future me) guessing what a function actually expects — small habits like that compound fast on a team.\n\nAt TechNova Solutions, I build and maintain customer-facing React applications and the Node.js APIs behind them, and led a migration to TypeScript that cut production bugs from type mismatches by half. Happy to connect with other engineers thinking about API design, TypeScript adoption, or backend architecture.",
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'REST APIs', 'MongoDB', 'PostgreSQL', 'Git'],
    experience: [
      {
        title: 'Software Engineer',
        company: 'TechNova Solutions',
        start: 'Jun 2023',
        end: 'Present',
        description:
          'Build and maintain customer-facing React applications and the Node.js APIs behind them.\nLed a migration to TypeScript that cut production bugs from type mismatches by half.\nDesigned a service-boundary refactor that decoupled two tightly-coupled modules.\nPaired regularly with junior engineers to review architecture decisions before implementation.',
      },
      {
        title: 'Junior Web Developer',
        company: 'PixelCraft Studio',
        start: 'Jan 2022',
        end: 'May 2023',
        description:
          'Shipped responsive marketing sites and internal tools for a handful of small-business clients.\nWorked directly with designers to turn Figma mockups into production pages.\nDebugged and resolved recurring production issues flagged by client support tickets.\nWrote integration tests that caught regressions before client-facing releases.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Full-Stack Web Development', organization: 'DataCrumbs', date: '2022' },
      { name: 'Software Design and Architecture Specialization', organization: 'University of Alberta (Coursera)', date: '2021' },
    ],
    projects: [
      {
        title: 'Internal Dashboard',
        description: 'React + Node.js internal analytics dashboard with role-based access and real-time data updates.',
      },
      {
        title: 'Service Boundary Refactor',
        description: 'Decoupled two tightly-coupled backend modules into independently deployable services, cutting release coordination overhead.',
      },
    ],
    awards: [
      { title: 'Employee of the Quarter', issuer: 'TechNova Solutions', date: 'Dec 2023' },
    ],
  },

  'blue-blocks': {
    fullName: 'Usman Tariq',
    title: 'Data Analyst',
    headline: 'Data Analyst | Turning raw numbers into decisions leadership can act on',
    location: 'Lahore, Pakistan',
    currentCompany: 'RetailPulse',
    school: 'Lahore University of Management Sciences',
    about:
      "I sit between the data and the people who have to make decisions with it — my job is to make sure those decisions are grounded in numbers, not gut feeling. I've learned that the hardest part of analytics usually isn't the SQL — it's asking the right question and presenting the answer so a non-technical stakeholder can act on it in thirty seconds.\n\nAt RetailPulse, I own weekly sales and inventory dashboards used by 15+ regional managers, and led a pricing analysis that informed a 5% margin improvement on a key product line. Always glad to talk dashboards, pricing analysis, or how to make a report someone actually reads.",
    skills: ['SQL', 'Excel', 'Power BI', 'Tableau', 'Python', 'Data Cleaning', 'Statistics', 'Dashboarding'],
    experience: [
      {
        title: 'Data Analyst',
        company: 'RetailPulse',
        start: 'Sep 2022',
        end: 'Present',
        description:
          'Own weekly sales and inventory dashboards used by 15+ regional managers.\nLed a pricing analysis that informed a 5% margin improvement on a key product line.\nAutomated a previously manual month-end reporting process, saving roughly a full day each month.\nTrained regional managers on self-service dashboard filters, cutting ad-hoc report requests.',
      },
      {
        title: 'Business Analytics Intern',
        company: 'Horizon Consulting',
        start: 'Mar 2022',
        end: 'Aug 2022',
        description:
          'Cleaned and modeled client survey data in Excel and Power BI.\nBuilt the visuals behind quarterly client-facing reports.\nIdentified a data-entry error pattern that had been skewing survey results.\nSupported senior analysts during client presentations, fielding follow-up questions on methodology.',
      },
    ],
    education: [
      {
        school: 'Lahore University of Management Sciences',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Business Analytics',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.Com)',
        fieldOfStudy: 'Commerce',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Google Data Analytics Certificate', organization: 'Google', date: '2022' },
      { name: 'Excel Skills for Business Specialization', organization: 'Macquarie University (Coursera)', date: '2021' },
    ],
    projects: [
      {
        title: 'Retail Sales Dashboard',
        description: 'Power BI dashboard consolidating sales & inventory data for 15+ regional managers.',
      },
      {
        title: 'Product Pricing Analysis',
        description: 'SQL + Excel margin analysis across 200+ SKUs that informed a 5% margin improvement on a key product line.',
      },
    ],
    awards: [],
  },

  'yellow-wave': {
    fullName: 'Aun Ali',
    title: 'Cyber Security Analyst',
    headline: 'Cyber Security Analyst | Threat detection, incident response & security audits',
    location: 'Lahore, Pakistan',
    currentCompany: 'SecureNet Systems',
    school: 'University of the Punjab',
    about:
      "I think about systems the way an attacker would, then close the gaps before someone else finds them. My day-to-day is a mix of monitoring alerts, running vulnerability scans, and explaining risk in plain language. I try to stay a step ahead by following disclosed CVEs and threat-actor writeups closely — security is one of the few fields where yesterday's best practice can quietly become today's vulnerability.\n\nAt SecureNet Systems, I monitor SIEM alerts across a 300+ endpoint network, lead monthly vulnerability scans, and improved alert triage rules to cut mean-time-to-detect on phishing attempts. Always open to a conversation about SOC operations, incident response playbooks, or building a security-aware culture without slowing teams down.",
    skills: ['SIEM', 'Penetration Testing', 'Network Security', 'SOC Operations', 'Vulnerability Assessment', 'Linux', 'Python', 'Incident Response'],
    experience: [
      {
        title: 'Cyber Security Analyst',
        company: 'SecureNet Systems',
        start: 'Apr 2023',
        end: 'Present',
        description:
          'Monitor SIEM alerts for a 300+ endpoint network around the clock.\nLead monthly vulnerability scans and coordinate remediation with IT.\nImproved alert triage rules, cutting mean-time-to-detect on phishing attempts significantly.\nWrote the incident-response runbook now used across two security teams.',
      },
      {
        title: 'IT Security Intern',
        company: 'GuardianTech',
        start: 'Oct 2022',
        end: 'Mar 2023',
        description:
          "Assisted with penetration test reporting for external client engagements.\nHelped roll out multi-factor authentication across the company's internal tools.\nDocumented findings from vulnerability scans into client-ready remediation reports.\nShadowed the SOC team during live incident triage to learn escalation procedures.",
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Cyber Security',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'CompTIA Security+', organization: 'CompTIA', date: '2022' },
      { name: 'Certified Ethical Hacker (CEH)', organization: 'EC-Council', date: '2023' },
    ],
    projects: [
      {
        title: 'Phishing Detection Toolkit',
        description: 'Python-based tool to analyze email headers and flag phishing indicators, reducing response time.',
      },
      {
        title: 'Incident Response Runbook',
        description: 'Standardized playbook covering detection, containment, and reporting steps, adopted across two security teams.',
      },
    ],
    awards: [],
  },

  'ai-engineer-badge': {
    fullName: 'Zoya Siddiqui',
    title: 'Digital Marketing Specialist',
    headline: 'Digital Marketing Specialist | Performance campaigns & SEO that actually convert',
    location: 'Lahore, Pakistan',
    currentCompany: 'BrightPath Agency',
    school: 'Lahore University of Management Sciences',
    about:
      "I look at marketing as a numbers game with a creative front-end — every campaign I run has a metric it's supposed to move, and I obsess over that metric more than the vanity ones. I'm particularly drawn to the testing side of performance marketing — small, disciplined experiments on creative and audience targeting tend to beat big, unvalidated bets more often than people expect.\n\nAt BrightPath Agency, I manage paid campaigns across Meta and Google Ads for 6 client accounts, improving average ROAS from 2.1x to 3.4x over two quarters. Always glad to swap notes on paid campaign structure, SEO, or making a client's ad spend actually work harder.",
    skills: ['SEO', 'Google Ads', 'Meta Ads', 'Content Strategy', 'Google Analytics', 'Email Marketing', 'Copywriting'],
    experience: [
      {
        title: 'Digital Marketing Specialist',
        company: 'BrightPath Agency',
        start: 'May 2023',
        end: 'Present',
        description:
          'Manage paid campaigns across Meta and Google Ads for 6 client accounts.\nImproved average ROAS from 2.1x to 3.4x over two quarters.\nRan structured A/B tests on ad creative that cut client cost-per-acquisition noticeably.\nBuilt monthly performance reports that clients now request proactively before renewal calls.',
      },
      {
        title: 'Social Media Coordinator',
        company: 'Trendify Media',
        start: 'Aug 2021',
        end: 'Apr 2023',
        description:
          "Grew a client's Instagram following from 8K to 45K in under two years.\nBuilt and maintained a consistent content calendar across three platforms.\nCollaborated with the design team to launch a branded content series that outperformed baseline engagement.\nResponded to community engagement daily, keeping response time under two hours.",
      },
    ],
    education: [
      {
        school: 'Lahore University of Management Sciences',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Marketing',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.Com)',
        fieldOfStudy: 'Commerce',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Google Ads Certification', organization: 'Google', date: '2022' },
      { name: 'Meta Certified Digital Marketing Associate', organization: 'Meta', date: '2022' },
    ],
    projects: [
      {
        title: 'ROAS Optimization Campaign',
        description: 'Restructured Meta & Google Ads campaigns for 6 clients, lifting average ROAS from 2.1x to 3.4x.',
      },
      {
        title: 'Branded Content Series',
        description: 'Cross-platform content series that grew a client account from 8K to 45K followers with above-baseline engagement.',
      },
    ],
    awards: [],
  },

  'data-engineer': {
    fullName: 'Faisal Nadeem',
    title: 'Data Engineer',
    headline: 'Data Engineer | Building reliable pipelines that data teams can trust',
    location: 'Lahore, Pakistan',
    currentCompany: 'DataForge Labs',
    school: 'University of the Punjab',
    about:
      "I build the plumbing that data scientists and analysts depend on without thinking about it — pipelines that run on time, data that's actually clean, and warehouses that don't fall over under load. I've come to believe most 'data quality' problems are really pipeline design problems in disguise, which is why I spend as much time on retry logic and alerting as I do on the transformations themselves.\n\nAt DataForge Labs, I built and maintain Airflow pipelines processing 2M+ daily events into a Snowflake warehouse, cutting pipeline failure rate from 8% to under 1%. Always happy to talk pipeline architecture, orchestration, or how to make a data warehouse something people actually trust.",
    skills: ['Python', 'SQL', 'Apache Airflow', 'Snowflake', 'Spark', 'AWS', 'ETL', 'Data Modeling'],
    experience: [
      {
        title: 'Data Engineer',
        company: 'DataForge Labs',
        start: 'Feb 2023',
        end: 'Present',
        description:
          'Built and maintain Airflow pipelines processing 2M+ daily events into a Snowflake warehouse.\nCut pipeline failure rate from 8% to under 1% through better retry and alerting logic.\nDesigned the dimensional data model now used across three analytics teams.\nOnboarded two new engineers to the pipeline codebase, writing the setup docs they still use.',
      },
      {
        title: 'Backend Developer Intern',
        company: 'CloudBridge Technologies',
        start: 'Jul 2022',
        end: 'Jan 2023',
        description:
          'Built ETL scripts to migrate legacy MySQL data into a new PostgreSQL schema with zero data loss.\nWrote validation scripts that caught two schema mismatches before they hit production.\nDocumented the migration runbook the team reused for two later migrations.\nAssisted with query optimization on slow-running nightly batch jobs.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'AWS Certified Data Analytics', organization: 'Amazon Web Services', date: '2022' },
      { name: 'Data Engineering on Google Cloud', organization: 'Google Cloud (Coursera)', date: '2021' },
    ],
    projects: [
      {
        title: 'Event Streaming Pipeline',
        description: 'Airflow + Snowflake pipeline processing 2M+ daily events with <1% failure rate.',
      },
      {
        title: 'Legacy MySQL to PostgreSQL Migration',
        description: 'Zero-downtime migration of a legacy production database, including schema validation tooling reused on two later projects.',
      },
    ],
    awards: [],
  },

  'devops-engineer': {
    fullName: 'Areeba Malik',
    title: 'DevOps Engineer',
    headline: 'DevOps Engineer | CI/CD, infrastructure-as-code & reliable deployments',
    location: 'Lahore, Pakistan',
    currentCompany: 'CloudBridge Technologies',
    school: 'University of the Punjab',
    about:
      'I make sure the path from a merged pull request to production is fast, boring, and safe. I care a lot about making incidents rare — and short when they do happen. I think of infrastructure as a product with its own users — the engineering team — so I try to design it in a way that a tired on-call engineer can still understand at 2am.\n\nAt CloudBridge Technologies, I built CI/CD pipelines in GitHub Actions on top of Terraform-managed AWS infrastructure, cutting deployment time from 45 minutes to under 5. Always glad to talk CI/CD design, infrastructure-as-code, or reducing the blast radius of a bad deploy.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'Linux', 'Bash'],
    experience: [
      {
        title: 'DevOps Engineer',
        company: 'CloudBridge Technologies',
        start: 'Mar 2023',
        end: 'Present',
        description:
          'Built CI/CD pipelines in GitHub Actions on top of Terraform-managed AWS infrastructure.\nCut deployment time from 45 minutes to under 5 minutes.\nIntroduced automated rollback on failed health checks, reducing incident recovery time.\nWrote the on-call runbook new engineers now use during their first rotation.',
      },
      {
        title: 'Systems Administrator',
        company: 'NetOps Solutions',
        start: 'Aug 2021',
        end: 'Feb 2023',
        description:
          'Managed on-prem and cloud server infrastructure for internal engineering tools.\nIntroduced automated backups that recovered two incidents without data loss.\nStandardized server provisioning with scripts that cut new-environment setup time.\nMonitored system health and resolved recurring performance bottlenecks.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'AWS Certified DevOps Engineer', organization: 'Amazon Web Services', date: '2022' },
      { name: 'Certified Kubernetes Administrator (CKA)', organization: 'Cloud Native Computing Foundation', date: '2023' },
    ],
    projects: [
      {
        title: 'Zero-Downtime CI/CD Pipeline',
        description: 'GitHub Actions + Terraform pipeline cutting deploys from 45 min to under 5 min with automated rollback.',
      },
      {
        title: 'Automated Backup & Recovery System',
        description: 'Scheduled backup and restore tooling across on-prem and cloud servers that recovered two incidents with zero data loss.',
      },
    ],
    awards: [],
  },

  'mobile-app-developer': {
    fullName: 'Danish Qureshi',
    title: 'Mobile App Developer',
    headline: 'Mobile App Developer | React Native & Flutter apps used by thousands',
    location: 'Lahore, Pakistan',
    currentCompany: 'AppCrafters',
    school: 'University of the Punjab',
    about:
      "I build mobile apps that feel native, whether they're written in React Native or Flutter. I care a lot about the small stuff — animation timing, offline handling, app-start time. I test on the oldest, cheapest Android device I can find before I call a feature done — most performance complaints never show up on a flagship phone in the office.\n\nAt AppCrafters, I built and shipped a React Native e-commerce app with 40K+ downloads, and cut app cold-start time by 35% through bundle optimization. Always happy to talk cross-platform architecture, offline-first design, or squeezing more performance out of a React Native app.",
    skills: ['React Native', 'Flutter', 'Dart', 'JavaScript', 'Firebase', 'REST APIs', 'iOS', 'Android'],
    experience: [
      {
        title: 'Mobile App Developer',
        company: 'AppCrafters',
        start: 'Jun 2023',
        end: 'Present',
        description:
          'Built and shipped a React Native e-commerce app with 40K+ downloads.\nCut app cold-start time by 35% through bundle and asset optimization.\nImplemented offline-first cart syncing that reduced checkout drop-off on poor connections.\nCoordinated App Store and Play Store releases, including staged rollouts.',
      },
      {
        title: 'Flutter Developer Intern',
        company: 'MobileFirst Labs',
        start: 'Dec 2022',
        end: 'May 2023',
        description:
          'Built UI components for a Flutter fitness-tracking app.\nIntegrated push notifications using Firebase Cloud Messaging.\nFixed layout bugs across a range of screen sizes flagged during QA.\nWrote widget tests that caught two regressions before release.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Meta React Native Specialization', organization: 'Meta', date: '2022' },
      { name: 'Flutter & Dart: The Complete Guide', organization: 'Udemy', date: '2021' },
    ],
    projects: [
      {
        title: 'ShopEase — E-Commerce App',
        description: 'React Native app with 40K+ downloads, featuring offline mode and 35% faster cold-start after optimization.',
      },
      {
        title: 'FitTrack — Fitness Tracking App',
        description: 'Flutter fitness app with Firebase-powered push notifications and cross-device workout sync.',
      },
    ],
    awards: [],
  },

  'ui-ux-designer': {
    fullName: 'Hira Shah',
    title: 'UI/UX Designer',
    headline: 'UI/UX Designer | Research-driven design that solves real user problems',
    location: 'Lahore, Pakistan',
    currentCompany: 'PixelCraft Studio',
    school: 'National College of Arts',
    about:
      'I start with the user problem, not the pixels — usability testing and interviews before a single wireframe. My job is to make an interface so obvious that people never have to think about how to use it. I keep a running list of small usability annoyances I notice in everyday apps — most of my best design instincts come from paying attention to the friction other products create.\n\nAt PixelCraft Studio, I redesigned the onboarding flow for a fintech client, increasing signup completion rate from 58% to 79%. Always glad to talk usability research, design systems, or how to get engineering buy-in on a redesign.',
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing', 'Interaction Design'],
    experience: [
      {
        title: 'UI/UX Designer',
        company: 'PixelCraft Studio',
        start: 'Apr 2023',
        end: 'Present',
        description:
          'Redesigned the onboarding flow for a fintech client from scratch.\nIncreased signup completion rate from 58% to 79% based on usability testing insights.\nRan moderated usability sessions with 20+ participants across two design rounds.\nBuilt and maintain the Figma design system now shared across three client projects.',
      },
      {
        title: 'Junior Product Designer',
        company: 'Formcraft Design Co.',
        start: 'Sep 2021',
        end: 'Mar 2023',
        description:
          'Designed and maintained a component library used across 4 client products.\nCut new-screen design time significantly by standardizing patterns.\nConducted user interviews that surfaced a recurring navigation pain point.\nPartnered with engineers to make sure handoff specs matched shipped implementations.',
      },
    ],
    education: [
      {
        school: 'National College of Arts',
        degree: 'Bachelor of Design',
        fieldOfStudy: 'Communication Design',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Lahore Grammar School',
        degree: 'A Levels',
        fieldOfStudy: 'Art & Design',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Google UX Design Certificate', organization: 'Google', date: '2021' },
      { name: 'UI/UX Design Specialization', organization: 'CalArts (Coursera)', date: '2020' },
    ],
    projects: [
      {
        title: 'Fintech Onboarding Redesign',
        description: 'Full UX overhaul of a fintech onboarding flow, lifting completion rate from 58% to 79%.',
      },
      {
        title: 'Cross-Client Design System',
        description: 'Figma component library and interaction guidelines adopted across three client projects, standardizing design patterns.',
      },
    ],
    awards: [],
  },

  'graphic-designer': {
    fullName: 'Zain Abbas',
    title: 'Graphic Designer',
    headline: 'Graphic Designer | Brand identity, print & digital design',
    location: 'Lahore, Pakistan',
    currentCompany: 'Formcraft Design Co.',
    school: 'National College of Arts',
    about:
      "I design visuals that make brands instantly recognizable — logos, social templates, packaging, whatever the project calls for. I care about consistency as much as creativity. I think a good brand system should make future work faster, not just look good once — that's the standard I hold every style guide I hand off to.\n\nAt Formcraft Design Co., I've designed full brand identities for 10+ small-business clients, and built a social media template kit now adopted company-wide. Always glad to talk brand identity, typography, or how to keep a visual system consistent as a business scales.",
    skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Brand Identity', 'Typography', 'Layout Design', 'Adobe InDesign'],
    experience: [
      {
        title: 'Graphic Designer',
        company: 'Formcraft Design Co.',
        start: 'Jan 2023',
        end: 'Present',
        description:
          "Designed full brand identities — logo, color system, templates — for 10+ small-business clients.\nBuilt a social media template kit that's now adopted company-wide.\nPresented concept decks directly to clients and iterated based on live feedback.\nMaintained brand style guides that kept freelance collaborators' output consistent.",
      },
      {
        title: 'Freelance Designer',
        company: 'Self-Employed',
        start: 'Jun 2021',
        end: 'Dec 2022',
        description:
          'Delivered logo, packaging, and social media design projects for local startups.\nManaged client feedback and revisions independently, start to finish.\nSourced and prepared print-ready files for 3 packaging production runs.\nBuilt a personal portfolio site that became a steady source of referral clients.',
      },
    ],
    education: [
      {
        school: 'National College of Arts',
        degree: 'Bachelor of Design',
        fieldOfStudy: 'Visual Communication',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Lahore Grammar School',
        degree: 'A Levels',
        fieldOfStudy: 'Art & Design',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Graphic Design Specialization', organization: 'CalArts (Coursera)', date: '2021' },
      { name: 'Adobe Certified Professional: Illustrator', organization: 'Adobe', date: '2020' },
    ],
    projects: [
      {
        title: 'Brand Identity System',
        description: 'Complete brand identity — logo, color palette, typography, templates — for a local F&B startup.',
      },
      {
        title: 'Social Media Template Kit',
        description: 'Reusable Illustrator/Canva template set adopted company-wide, cutting new-campaign design time.',
      },
    ],
    awards: [],
  },

  'video-editor': {
    fullName: 'Noor Fatima',
    title: 'Video Editor',
    headline: 'Video Editor | Short-form & long-form content that keeps people watching',
    location: 'Lahore, Pakistan',
    currentCompany: 'Trendify Media',
    school: 'National College of Arts',
    about:
      "I edit for retention, not just polish — pacing, sound design, and the first three seconds are where I spend most of my attention. I've cut everything from 30-second social clips to 20-minute YouTube videos. I treat every cut as a small bet on the viewer's attention — if a moment doesn't earn the next three seconds, it usually doesn't survive the edit.\n\nAt Trendify Media, I edit 15+ short-form videos weekly for client social accounts, improving average watch-through rate by 22%. Always glad to talk pacing, sound design, or what actually keeps a short-form video from losing viewers early.",
    skills: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Color Grading', 'Sound Design', 'Motion Graphics'],
    experience: [
      {
        title: 'Video Editor',
        company: 'Trendify Media',
        start: 'Feb 2023',
        end: 'Present',
        description:
          'Edit 15+ short-form videos weekly for client social accounts.\nImproved average watch-through rate by 22% through tighter pacing and hook-first editing.\nBuilt a motion-graphics template set that sped up turnaround on recurring formats.\nCollaborated with clients directly on revisions, keeping turnaround under 48 hours.',
      },
      {
        title: 'Junior Video Editor',
        company: 'Frameworks Productions',
        start: 'Jul 2021',
        end: 'Jan 2023',
        description:
          'Edited YouTube long-form content from raw footage to final cut.\nManaged color grading and sound mixing for every upload.\nOrganized and archived raw footage libraries across 30+ shoots.\nAssisted on-set during two multi-camera shoots, syncing audio in post.',
      },
    ],
    education: [
      {
        school: 'National College of Arts',
        degree: 'Bachelor of Design',
        fieldOfStudy: 'Film & Media',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Lahore Grammar School',
        degree: 'A Levels',
        fieldOfStudy: 'Media Studies',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Video Editing Certificate', organization: 'Adobe', date: '2021' },
      { name: 'DaVinci Resolve Color Grading', organization: 'Blackmagic Design', date: '2022' },
    ],
    projects: [
      {
        title: 'Social Media Content Series',
        description: '15+ weekly short-form videos for brand clients, achieving 22% higher watch-through via hook-first editing.',
      },
      {
        title: 'Motion Graphics Template Set',
        description: 'Reusable After Effects template pack for recurring video formats, cutting average turnaround time.',
      },
    ],
    awards: [],
  },

  'backend-developer': {
    fullName: 'Ahsan Javed',
    title: 'Backend Developer',
    headline: 'Backend Developer | Scalable APIs & databases powering real products',
    location: 'Lahore, Pakistan',
    currentCompany: 'CloudBridge Technologies',
    school: 'University of the Punjab',
    about:
      "I build the systems users never see but always feel — APIs that respond fast, databases that don't fall over, and services that keep working when something upstream fails. I spend a lot of time thinking about failure modes before writing the happy path — the systems I'm proudest of are the ones that degrade gracefully instead of falling over completely.\n\nAt CloudBridge Technologies, I own the payments API serving 30K+ daily transactions, and redesigned the retry/queue logic to cut the failed-transaction rate by 60%. Always glad to talk API design, distributed systems, or reliability engineering.",
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'REST APIs', 'Microservices', 'Docker', 'System Design'],
    experience: [
      {
        title: 'Backend Developer',
        company: 'CloudBridge Technologies',
        start: 'May 2023',
        end: 'Present',
        description:
          'Own the payments API serving 30K+ daily transactions.\nRedesigned the retry/queue logic, cutting the failed-transaction rate by 60%.\nIntroduced Redis caching on hot read paths, reducing average response time.\nWrote the on-call runbook the payments team now relies on during incidents.',
      },
      {
        title: 'Backend Developer Intern',
        company: 'DataForge Labs',
        start: 'Nov 2022',
        end: 'Apr 2023',
        description:
          'Built internal REST APIs for a data-labeling tool used by the data science team.\nWrote the integration test suite the team still relies on today.\nOptimized slow database queries flagged in a performance review.\nDocumented API endpoints in OpenAPI, cutting onboarding time for new consumers.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Backend Development Certificate', organization: 'DataCrumbs', date: '2022' },
      { name: 'System Design Interview Preparation', organization: 'Educative', date: '2023' },
    ],
    projects: [
      {
        title: 'Payments API',
        description: 'Node.js payments service handling 30K+ daily transactions with redesigned retry logic cutting failures 60%.',
      },
      {
        title: 'Internal Data-Labeling API',
        description: 'REST API and integration test suite powering an internal labeling tool used daily by the data science team.',
      },
    ],
    awards: [],
  },

  'cloud-engineer': {
    fullName: 'Kiran Baig',
    title: 'Cloud Engineer',
    headline: 'Cloud Engineer | Designing scalable, cost-efficient AWS infrastructure',
    location: 'Lahore, Pakistan',
    currentCompany: 'CloudBridge Technologies',
    school: 'University of the Punjab',
    about:
      "I design cloud infrastructure that scales without anyone panicking during a traffic spike, and that doesn't quietly rack up an unexplainable bill either. Most of my work lives in Terraform. I treat the monthly AWS bill as a design review — a cost spike almost always points to a real architectural issue worth fixing, not just a line item to write off.\n\nAt CloudBridge Technologies, I migrated a monolithic app to a containerized AWS ECS architecture, reducing infrastructure costs by 28% while improving uptime to 99.95%. Always happy to talk cloud architecture, cost optimization, or infrastructure-as-code.",
    skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'CloudFormation', 'Networking', 'Cost Optimization'],
    experience: [
      {
        title: 'Cloud Engineer',
        company: 'CloudBridge Technologies',
        start: 'Apr 2023',
        end: 'Present',
        description:
          'Migrated a monolithic app to a containerized AWS ECS architecture.\nReduced infrastructure costs by 28% while improving uptime to 99.95%.\nImplemented auto-scaling policies that absorbed a 3x traffic spike without manual intervention.\nRan a quarterly cost review that identified and eliminated unused resources.',
      },
      {
        title: 'Cloud Support Intern',
        company: 'NetOps Solutions',
        start: 'Sep 2022',
        end: 'Mar 2023',
        description:
          'Assisted with AWS account audits across multiple client environments.\nHelped implement least-privilege IAM policies across 40+ service roles.\nDocumented infrastructure diagrams that became the team\'s onboarding reference.\nFlagged and resolved two misconfigured security groups during an audit.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect', organization: 'Amazon Web Services', date: '2022' },
      { name: 'HashiCorp Certified: Terraform Associate', organization: 'HashiCorp', date: '2023' },
    ],
    projects: [
      {
        title: 'Monolith to ECS Migration',
        description: 'Full infrastructure migration to AWS ECS with Terraform, cutting costs 28% and hitting 99.95% uptime.',
      },
      {
        title: 'Cloud Cost Optimization Review',
        description: 'Quarterly audit process identifying idle resources and rightsizing instances, trimming the AWS bill measurably.',
      },
    ],
    awards: [],
  },

  'qa-test-automation': {
    fullName: 'Talha Rauf',
    title: 'QA Automation Engineer',
    headline: 'QA / Test Automation Engineer | Catching bugs before users do',
    location: 'Lahore, Pakistan',
    currentCompany: 'TechNova Solutions',
    school: 'University of the Punjab',
    about:
      "I build automated test suites that let a team ship confidently instead of nervously. I care most about writing tests that fail for the right reasons — not flaky ones that everyone learns to ignore. I treat a flaky test as a bug in its own right — a suite nobody trusts is worse than no suite at all, so I'd rather delete a flaky test than let it erode confidence in the whole pipeline.\n\nAt TechNova Solutions, I built a Cypress end-to-end test suite covering 85% of critical user flows, cutting regression-testing time from 2 days to 3 hours per release. Always glad to talk test strategy, flaky-test triage, or building a testing culture engineers actually buy into.",
    skills: ['Cypress', 'Selenium', 'Test Automation', 'API Testing (Postman)', 'JavaScript', 'Regression Testing'],
    experience: [
      {
        title: 'QA Automation Engineer',
        company: 'TechNova Solutions',
        start: 'Mar 2023',
        end: 'Present',
        description:
          'Built a Cypress end-to-end test suite covering 85% of critical user flows.\nCut regression-testing time from 2 days to 3 hours per release.\nIntegrated the suite into CI, blocking merges on failed critical-path tests.\nTriaged and eliminated flaky tests, raising suite reliability the team could finally trust.',
      },
      {
        title: 'Manual QA Tester',
        company: 'AppCrafters',
        start: 'Aug 2021',
        end: 'Feb 2023',
        description:
          'Executed test plans across web and mobile releases every sprint.\nWrote the bug-reporting template the team standardized on company-wide.\nIdentified a recurring edge-case bug that had shipped undetected for two releases.\nCoordinated release-readiness sign-off with developers and product before every launch.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'ISTQB Certified Tester', organization: 'ISTQB', date: '2021' },
      { name: 'Test Automation University: Cypress', organization: 'Applitools', date: '2022' },
    ],
    projects: [
      {
        title: 'Cypress E2E Test Suite',
        description: 'End-to-end Cypress suite covering 85% of critical flows, integrated into CI, cutting regression time from 2 days to 3 hours.',
      },
      {
        title: 'Flaky Test Triage Initiative',
        description: 'Audited and stabilized the existing test suite, raising pass-rate trust across the engineering team.',
      },
    ],
    awards: [],
  },

  'game-developer': {
    fullName: 'Rimsha Anwar',
    title: 'Game Developer',
    headline: 'Game Developer | Building playable, polished experiences in Unity',
    location: 'Lahore, Pakistan',
    currentCompany: 'PixelForge Studios',
    school: 'University of the Punjab',
    about:
      'I build games from the gameplay-feel outward — input responsiveness and juice matter to me as much as the mechanics themselves. I mostly work in Unity and C#. I prototype fast and throw away a lot of ideas — the mechanics that survive playtesting are almost never the ones I expected to work best on paper.\n\nAt PixelForge Studios, I built core gameplay systems for a mobile puzzle game with 60K+ downloads, and optimized rendering to hit a stable 60fps on low-end Android devices. Always glad to talk gameplay feel, mobile performance optimization, or Unity architecture.',
    skills: ['Unity', 'C#', 'Game Design', '3D Math', 'Shader Basics', 'Mobile Optimization', 'Gameplay Programming'],
    experience: [
      {
        title: 'Game Developer',
        company: 'PixelForge Studios',
        start: 'Feb 2023',
        end: 'Present',
        description:
          'Built core gameplay systems for a mobile puzzle game with 60K+ downloads.\nOptimized rendering to hit a stable 60fps on low-end Android devices.\nDesigned and tuned the difficulty-progression curve based on playtest data.\nShipped three post-launch content updates without a single hotfix rollback.',
      },
      {
        title: 'Junior Game Developer',
        company: 'IndieWorks',
        start: 'Jun 2021',
        end: 'Jan 2023',
        description:
          'Implemented enemy AI behavior trees for a PC platformer released on Steam.\nBuilt the level-progression and save-state system used throughout the game.\nProfiled and fixed frame-rate drops flagged during QA passes.\nCollaborated with the art team to integrate animation state machines cleanly.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Unity Certified Programmer', organization: 'Unity Technologies', date: '2021' },
      { name: 'Game Design and Development Specialization', organization: 'Michigan State University (Coursera)', date: '2020' },
    ],
    projects: [
      {
        title: 'Mobile Puzzle Game',
        description: 'Unity puzzle game with 60K+ downloads, optimized to 60fps on low-end Android through render batching.',
      },
      {
        title: 'PC Platformer — Enemy AI System',
        description: 'Behavior-tree-driven enemy AI and save-state system for a PC platformer released on Steam.',
      },
    ],
    awards: [],
  },

  'mlops-engineer': {
    fullName: 'Saad Hussain',
    title: 'MLOps Engineer',
    headline: 'MLOps Engineer | Getting machine learning models from notebook to production',
    location: 'Lahore, Pakistan',
    currentCompany: 'NeuralWorks AI',
    school: 'University of the Punjab',
    about:
      "I sit at the intersection of ML and DevOps — my job is making sure a model that works in a notebook keeps working reliably in production, at scale, with monitoring that catches drift before customers do. I've found the biggest wins in MLOps rarely come from a fancier model — they come from making the boring parts (versioning, monitoring, rollback) reliable enough that data scientists can move fast without fear.\n\nAt NeuralWorks AI, I built an automated model deployment pipeline using MLflow and Kubernetes, cutting model release time from 2 weeks to 2 days. Always glad to talk model deployment, monitoring, or CI/CD for ML.",
    skills: ['MLflow', 'Kubernetes', 'Docker', 'Python', 'CI/CD for ML', 'Model Monitoring', 'AWS SageMaker'],
    experience: [
      {
        title: 'MLOps Engineer',
        company: 'NeuralWorks AI',
        start: 'May 2023',
        end: 'Present',
        description:
          'Built an automated model deployment pipeline using MLflow and Kubernetes.\nCut model release time from 2 weeks to 2 days.\nImplemented shadow-deployment testing to validate new models before full rollout.\nStandardized model versioning across four teams, eliminating a recurring source of deploy errors.',
      },
      {
        title: 'Machine Learning Engineer Intern',
        company: 'DataForge Labs',
        start: 'Nov 2022',
        end: 'Apr 2023',
        description:
          'Set up model monitoring dashboards tracking key production model metrics.\nCaught two instances of data drift before they affected production predictions.\nAutomated model retraining triggers based on monitored performance thresholds.\nDocumented the deployment process, cutting new-model onboarding time.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (F.Sc)',
        fieldOfStudy: 'Pre-Engineering',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Machine Learning Engineering for Production', organization: 'DeepLearning.AI', date: '2022' },
      { name: 'Certified Kubernetes Administrator (CKA)', organization: 'Cloud Native Computing Foundation', date: '2023' },
    ],
    projects: [
      {
        title: 'Automated Model Deployment Pipeline',
        description: 'MLflow + Kubernetes pipeline cutting model release cycles from 2 weeks to 2 days with full rollback support.',
      },
      {
        title: 'Model Drift Monitoring System',
        description: 'Automated drift-detection and retraining trigger system that caught data drift before it reached production.',
      },
    ],
    awards: [],
  },

  'business-intelligence-analyst': {
    fullName: 'Nimra Aslam',
    title: 'Business Intelligence Analyst',
    headline: 'Business Intelligence Analyst | Dashboards leadership actually uses',
    location: 'Lahore, Pakistan',
    currentCompany: 'Horizon Consulting',
    school: 'Lahore University of Management Sciences',
    about:
      "I build BI dashboards that people open every week, not once and forget. My job is translating scattered data across departments into a single source of truth executives can trust. A dashboard nobody trusts is worse than no dashboard at all, so I spend as much effort on data validation and clear labeling as I do on the visuals themselves.\n\nAt Horizon Consulting, I built a company-wide Power BI reporting suite consolidating data from 4 departments, replacing a patchwork of manual spreadsheets. Always glad to talk data modeling, DAX, or building reports that survive contact with an actual exec review.",
    skills: ['Power BI', 'SQL', 'Data Modeling', 'DAX', 'Excel', 'ETL', 'Stakeholder Reporting'],
    experience: [
      {
        title: 'Business Intelligence Analyst',
        company: 'Horizon Consulting',
        start: 'Jan 2023',
        end: 'Present',
        description:
          'Built a company-wide Power BI reporting suite consolidating data from 4 departments.\nReplaced a patchwork of manual spreadsheets with a single source of truth.\nDesigned the semantic data model that standardized metric definitions company-wide.\nTrained department leads on self-service reporting, cutting recurring ad-hoc requests.',
      },
      {
        title: 'Reporting Analyst',
        company: 'RetailPulse',
        start: 'Jun 2021',
        end: 'Dec 2022',
        description:
          'Maintained SQL-based sales reporting used by regional teams every week.\nAutomated a monthly reporting process that used to take two full days.\nAudited report accuracy after a system migration, catching several data mismatches.\nBuilt executive summary decks distilling detailed reports into decision-ready insights.',
      },
    ],
    education: [
      {
        school: 'Lahore University of Management Sciences',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Business Analytics',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.Com)',
        fieldOfStudy: 'Commerce',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Microsoft Certified: Power BI Data Analyst Associate', organization: 'Microsoft', date: '2022' },
      { name: 'Data Visualization with Tableau Specialization', organization: 'UC Davis (Coursera)', date: '2021' },
    ],
    projects: [
      {
        title: 'Enterprise BI Reporting Suite',
        description: 'Power BI suite consolidating 4 departments into a single dashboard used by C-suite weekly.',
      },
      {
        title: 'Semantic Data Model Standardization',
        description: 'Company-wide metric-definition model in Power BI eliminating inconsistent reporting across departments.',
      },
    ],
    awards: [],
  },

  'computer-vision-engineer': {
    fullName: 'Owais Bhatti',
    title: 'Computer Vision Engineer',
    headline: 'Computer Vision Engineer | Building systems that see and understand images',
    location: 'Lahore, Pakistan',
    currentCompany: 'NeuralWorks AI',
    school: 'University of the Punjab',
    about:
      "I build models that turn pixels into decisions — object detection, image classification, and segmentation systems that need to work reliably in the real world, not just on a clean benchmark dataset. Real-world camera footage is messy in ways benchmark datasets never are — glare, occlusion, weird angles — so I spend a disproportionate amount of time on data augmentation and edge-case handling.\n\nAt NeuralWorks AI, I built a real-time object-detection pipeline using YOLO for a retail analytics client, achieving 94% detection accuracy. Always glad to talk object detection, edge deployment, or making a CV model robust outside the lab.",
    skills: ['Python', 'OpenCV', 'PyTorch', 'YOLO', 'Image Processing', 'TensorFlow', 'Deep Learning'],
    experience: [
      {
        title: 'Computer Vision Engineer',
        company: 'NeuralWorks AI',
        start: 'Apr 2023',
        end: 'Present',
        description:
          'Built a real-time object-detection pipeline using YOLO for a retail analytics client.\nAchieved 94% detection accuracy on in-store camera footage.\nOptimized the model for edge hardware, hitting real-time inference on-device.\nBuilt an augmentation pipeline that improved accuracy on low-light footage significantly.',
      },
      {
        title: 'Computer Vision Intern',
        company: 'VisionLabs',
        start: 'Sep 2022',
        end: 'Mar 2023',
        description:
          'Trained image classification models for a manufacturing quality-inspection use case.\nBuilt the data-labeling pipeline used to prepare all training data.\nEvaluated model performance across multiple architectures before recommending one for production.\nDocumented labeling guidelines that improved annotation consistency across the team.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (F.Sc)',
        fieldOfStudy: 'Pre-Engineering',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Deep Learning Specialization', organization: 'DeepLearning.AI', date: '2022' },
      { name: 'Computer Vision Nanodegree', organization: 'Udacity', date: '2021' },
    ],
    projects: [
      {
        title: 'Retail Object Detection Pipeline',
        description: 'Real-time YOLO-based detection on in-store cameras achieving 94% accuracy, optimized for edge hardware.',
      },
      {
        title: 'Manufacturing Quality-Inspection Classifier',
        description: 'Image classification model for defect detection on a production line, including the full training data pipeline.',
      },
    ],
    awards: [],
  },

  'blockchain-web3-developer': {
    fullName: 'Laiba Rehman',
    title: 'Blockchain Developer',
    headline: 'Blockchain Developer | Smart contracts & decentralized applications',
    location: 'Lahore, Pakistan',
    currentCompany: 'ChainForge Labs',
    school: 'University of the Punjab',
    about:
      "I build smart contracts and the decentralized apps around them — and I spend as much time thinking about security audits as I do about features, because a bug in a deployed contract can't just be patched quietly. I treat every contract as if it's already under attack the moment it's deployed — that mindset is uncomfortable but it's the only one that holds up once real funds are involved.\n\nAt ChainForge Labs, I built and deployed Solidity smart contracts for a DeFi lending protocol, passing an external security audit with zero critical findings. Always glad to talk smart contract security, DeFi protocol design, or Web3 front-end integration.",
    skills: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js', 'React', 'Hardhat', 'Security Auditing Basics'],
    experience: [
      {
        title: 'Blockchain Developer',
        company: 'ChainForge Labs',
        start: 'Jun 2023',
        end: 'Present',
        description:
          'Built and deployed Solidity smart contracts for a DeFi lending protocol.\nPassed an external security audit with zero critical findings.\nWrote a Hardhat test suite covering edge cases across every contract function.\nDocumented contract architecture for the audit firm, speeding up the review process.',
      },
      {
        title: 'Web3 Developer Intern',
        company: 'CryptoBridge',
        start: 'Dec 2022',
        end: 'May 2023',
        description:
          'Built a React/ethers.js front-end for an NFT marketplace.\nIntegrated wallet connections for MetaMask and WalletConnect.\nWrote gas-optimization improvements that reduced minting transaction costs.\nTested contract interactions across multiple testnets before mainnet deployment.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Blockchain Developer Certification', organization: 'ConsenSys Academy', date: '2022' },
      { name: 'Smart Contract Security', organization: 'OpenZeppelin', date: '2023' },
    ],
    projects: [
      {
        title: 'DeFi Lending Protocol',
        description: 'Solidity smart contracts for a DeFi lending platform, passing external security audit with zero critical issues.',
      },
      {
        title: 'NFT Marketplace Front-End',
        description: 'React/ethers.js marketplace UI with multi-wallet support and gas-optimized minting flow.',
      },
    ],
    awards: [],
  },

  'embedded-iot-engineer': {
    fullName: 'Hassan Sheikh',
    title: 'Embedded Systems Engineer',
    headline: 'Embedded Systems / IoT Engineer | Firmware and hardware that just works',
    location: 'Lahore, Pakistan',
    currentCompany: 'SensorWorks',
    school: 'University of Engineering and Technology, Lahore',
    about:
      "I write the firmware that sits closest to the hardware — sensors, microcontrollers, and the communication protocols that tie them into a bigger IoT system. Debugging at the hardware layer has taught me patience most software work never demands — sometimes the bug really is a loose connection, not a logic error, and you only find that with a multimeter in hand.\n\nAt SensorWorks, I developed firmware for an ESP32-based environmental sensor product shipping to 5,000+ units, cutting power consumption by 30% through sleep-mode optimization. Always glad to talk low-power firmware design, IoT protocols, or debugging flaky hardware.",
    skills: ['C/C++', 'Embedded Systems', 'ESP32/Arduino', 'MQTT', 'RTOS', 'IoT Protocols', 'Debugging Hardware'],
    experience: [
      {
        title: 'Embedded Systems Engineer',
        company: 'SensorWorks',
        start: 'Mar 2023',
        end: 'Present',
        description:
          'Developed firmware for an ESP32-based environmental sensor product shipping to 5,000+ units.\nCut power consumption by 30% through sleep-mode optimization.\nImplemented OTA firmware updates, eliminating the need for physical device recalls.\nDebugged intermittent sensor read failures traced to a power-supply noise issue.',
      },
      {
        title: 'IoT Engineering Intern',
        company: 'SmartGrid Technologies',
        start: 'Aug 2022',
        end: 'Feb 2023',
        description:
          'Built MQTT-based communication between field sensors and a cloud dashboard.\nDebugged intermittent connectivity issues affecting sensors in the field.\nWrote firmware unit tests for sensor-reading modules ahead of a hardware revision.\nDocumented the wiring and provisioning steps used to onboard new sensor units.',
      },
    ],
    education: [
      {
        school: 'University of Engineering and Technology, Lahore',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Electrical Engineering',
        start: '2018',
        end: '2022',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (F.Sc)',
        fieldOfStudy: 'Pre-Engineering',
        start: '2016',
        end: '2018',
      },
    ],
    certifications: [
      { name: 'Embedded Systems Design', organization: 'Coursera', date: '2022' },
      { name: 'FreeRTOS Fundamentals', organization: 'Amazon Web Services', date: '2023' },
    ],
    projects: [
      {
        title: 'ESP32 Environmental Sensor',
        description: 'Low-power firmware for ESP32 environmental sensor deployed in 5,000+ units with 30% reduced power usage.',
      },
      {
        title: 'OTA Firmware Update System',
        description: 'Over-the-air update pipeline for field-deployed sensors, removing the need for physical device recalls.',
      },
    ],
    awards: [],
  },

  'product-manager-tech': {
    fullName: 'Maryam Yousaf',
    title: 'Product Manager',
    headline: 'Product Manager | Shipping features users actually asked for',
    location: 'Lahore, Pakistan',
    currentCompany: 'TechNova Solutions',
    school: 'Lahore University of Management Sciences',
    about:
      "I spend more time talking to users and reading support tickets than writing specs — the best roadmap decisions come from understanding a real problem, not guessing at one. I'd rather ship a smaller version of the right feature than a full version of the wrong one — most of my product instincts come from being willing to say no to good ideas that aren't the priority.\n\nAt TechNova Solutions, I own the roadmap for the customer dashboard product, and shipped a redesigned onboarding flow that increased activation rate by 18%. Always glad to talk roadmapping, user research, or the tradeoffs behind a prioritization call.",
    skills: ['Product Strategy', 'User Research', 'Roadmapping', 'Agile/Scrum', 'SQL', 'A/B Testing', 'Stakeholder Management'],
    experience: [
      {
        title: 'Product Manager',
        company: 'TechNova Solutions',
        start: 'Feb 2023',
        end: 'Present',
        description:
          'Own the roadmap for the customer dashboard product.\nShipped a redesigned onboarding flow that increased activation rate by 18%.\nRan weekly user interviews that directly shaped two quarterly priorities.\nAligned engineering, design, and support around a shared quarterly roadmap.',
      },
      {
        title: 'Associate Product Manager',
        company: 'Horizon Consulting',
        start: 'Jul 2021',
        end: 'Jan 2023',
        description:
          'Ran user interviews to understand pain points behind 40+ feature requests.\nPrioritized the backlog down to a quarterly roadmap engineering could actually deliver.\nWrote product specs that reduced back-and-forth clarification during development.\nTracked feature adoption post-launch and reported findings back to stakeholders.',
      },
    ],
    education: [
      {
        school: 'Lahore University of Management Sciences',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Certified Scrum Product Owner', organization: 'Scrum Alliance', date: '2022' },
      { name: 'Digital Product Management Specialization', organization: 'University of Virginia (Coursera)', date: '2021' },
    ],
    projects: [
      {
        title: 'Dashboard Onboarding Redesign',
        description: 'Led end-to-end product redesign of onboarding flow, increasing activation rate by 18% within one quarter.',
      },
      {
        title: 'Feature Request Prioritization Framework',
        description: 'Structured scoring framework for prioritizing 40+ inbound feature requests into a quarterly roadmap.',
      },
    ],
    awards: [],
  },

  'business-analyst-it': {
    fullName: 'Imran Farooq',
    title: 'Business Analyst',
    headline: 'Business Analyst | Bridging business needs and technical solutions',
    location: 'Lahore, Pakistan',
    currentCompany: 'Horizon Consulting',
    school: 'Lahore University of Management Sciences',
    about:
      "I translate what a business actually needs into requirements an engineering team can build against — and just as importantly, I catch the gaps and contradictions before they become expensive to fix. Most project overruns I've seen trace back to a requirement nobody wrote down clearly, which is why I'd rather over-document early than debug a misunderstanding mid-build.\n\nAt Horizon Consulting, I gathered and documented requirements for a client's ERP implementation, reducing scope-change requests during development. Always glad to talk requirements gathering, process mapping, or keeping a project scope honest.",
    skills: ['Requirements Gathering', 'Process Mapping', 'SQL', 'Stakeholder Management', 'UAT', 'Documentation'],
    experience: [
      {
        title: 'Business Analyst',
        company: 'Horizon Consulting',
        start: 'Sep 2022',
        end: 'Present',
        description:
          "Gathered and documented requirements for a client's ERP implementation.\nReduced scope-change requests during development by identifying gaps early.\nFacilitated stakeholder workshops that resolved conflicting requirements before build.\nOwned UAT coordination, cutting the average defect-triage cycle in half.",
      },
      {
        title: 'Junior Business Analyst',
        company: 'TechNova Solutions',
        start: 'Jan 2021',
        end: 'Aug 2022',
        description:
          'Wrote functional specifications for internal tooling projects.\nRan UAT sessions with stakeholders before every release.\nMapped as-is and to-be process flows for a manual approval workflow.\nMaintained the requirements traceability matrix used across two projects.',
      },
    ],
    education: [
      {
        school: 'Lahore University of Management Sciences',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Management Information Systems',
        start: '2016',
        end: '2020',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.Com)',
        fieldOfStudy: 'Commerce',
        start: '2014',
        end: '2016',
      },
    ],
    certifications: [
      { name: 'Certified Business Analysis Professional (CBAP)', organization: 'IIBA', date: '2022' },
      { name: 'Agile Analysis Certification', organization: 'IIBA', date: '2021' },
    ],
    projects: [
      {
        title: 'ERP Requirements Documentation',
        description: 'Full requirements gathering and documentation for a client ERP rollout, cutting scope changes during development.',
      },
      {
        title: 'Approval Workflow Process Mapping',
        description: 'As-is/to-be process mapping for a manual approval workflow, forming the basis for its later automation.',
      },
    ],
    awards: [],
  },

  'technical-writer': {
    fullName: 'Sadia Kamal',
    title: 'Technical Writer',
    headline: 'Technical Writer | Documentation developers actually want to read',
    location: 'Lahore, Pakistan',
    currentCompany: 'CloudBridge Technologies',
    school: 'University of the Punjab',
    about:
      "I write documentation with the assumption that nobody wants to read it — so it needs to answer the question fast and get out of the way. I've written API references, onboarding guides, and internal runbooks. I test my own docs by trying to follow them cold, as a new developer would — most documentation bugs I find aren't factual errors, they're missing context a first-time reader needed.\n\nAt CloudBridge Technologies, I rewrote the public API documentation from scratch, cutting support tickets related to integration confusion by 35%. Always glad to talk docs-as-code workflows, API reference structure, or writing for developers who are skimming, not reading.",
    skills: ['Technical Writing', 'API Documentation', 'Markdown', 'Docs-as-Code', 'Information Architecture', 'Editing'],
    experience: [
      {
        title: 'Technical Writer',
        company: 'CloudBridge Technologies',
        start: 'Apr 2023',
        end: 'Present',
        description:
          'Rewrote the public API documentation from scratch.\nCut support tickets related to integration confusion by 35%.\nMigrated docs to a docs-as-code workflow reviewed alongside engineering pull requests.\nBuilt a documentation style guide adopted across two other teams.',
      },
      {
        title: 'Documentation Specialist',
        company: 'DataForge Labs',
        start: 'Aug 2021',
        end: 'Mar 2023',
        description:
          'Wrote internal engineering runbooks used during on-call incidents.\nCreated onboarding guides that cut new-hire ramp-up time from three weeks to under two.\nInterviewed engineers to capture undocumented tribal knowledge into shared docs.\nAudited existing docs quarterly, retiring outdated pages that misled readers.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'English Literature',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Lahore Grammar School',
        degree: 'A Levels',
        fieldOfStudy: 'English Language',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Technical Writing Certification', organization: 'Google', date: '2021' },
      { name: 'API Documentation Fundamentals', organization: 'Write the Docs', date: '2022' },
    ],
    projects: [
      {
        title: 'API Documentation Overhaul',
        description: 'Complete rewrite of public API docs in docs-as-code workflow, reducing integration support tickets by 35%.',
      },
      {
        title: 'New-Hire Onboarding Guide',
        description: 'Engineering onboarding documentation that cut new-hire ramp-up time from three weeks to under two.',
      },
    ],
    awards: [],
  },

  'network-engineer': {
    fullName: 'Waleed Akram',
    title: 'Network Engineer',
    headline: 'Network Engineer | Reliable, secure infrastructure at every layer',
    location: 'Lahore, Pakistan',
    currentCompany: 'NetOps Solutions',
    school: 'University of Engineering and Technology, Lahore',
    about:
      "I keep networks fast, secure, and boring — the way infrastructure should be. My work ranges from configuring routers and firewalls to troubleshooting the mystery outage nobody can explain. A good network is one nobody thinks about, which means my best work is usually invisible — the outage that never happened because the redundant link was already there.\n\nAt NetOps Solutions, I manage network infrastructure for a 500+ employee office, and led a firewall migration that reduced unauthorized-access attempts by 90%. Always glad to talk network design, firewall policy, or troubleshooting the outage nobody can reproduce.",
    skills: ['Cisco Networking', 'Firewalls', 'VPN', 'TCP/IP', 'Network Security', 'Routing & Switching'],
    experience: [
      {
        title: 'Network Engineer',
        company: 'NetOps Solutions',
        start: 'Feb 2023',
        end: 'Present',
        description:
          'Manage network infrastructure for a 500+ employee office.\nLed a firewall migration that reduced unauthorized-access attempts by 90%.\nDesigned redundant network links that eliminated single points of failure.\nDocumented network topology diagrams the IT team now uses for onboarding.',
      },
      {
        title: 'Network Support Engineer',
        company: 'SecureNet Systems',
        start: 'Jun 2021',
        end: 'Jan 2023',
        description:
          'Diagnosed and resolved Tier 2 network incidents across client environments.\nDocumented troubleshooting runbooks that cut average resolution time in half.\nConfigured VPN access for remote employees across three client sites.\nMonitored network performance, flagging capacity issues before they caused outages.',
      },
    ],
    education: [
      {
        school: 'University of Engineering and Technology, Lahore',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Electrical Engineering',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (F.Sc)',
        fieldOfStudy: 'Pre-Engineering',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Cisco Certified Network Associate (CCNA)', organization: 'Cisco', date: '2021' },
      { name: 'Cisco Certified Network Professional (CCNP)', organization: 'Cisco', date: '2023' },
    ],
    projects: [
      {
        title: 'Office Network Overhaul',
        description: 'Firewall migration and switch standardization across 3 office locations, cutting security incidents by 90%.',
      },
      {
        title: 'Redundant Network Link Design',
        description: 'Failover network architecture eliminating single points of failure across the primary office site.',
      },
    ],
    awards: [],
  },

  'database-administrator': {
    fullName: 'Anum Zafar',
    title: 'Database Administrator',
    headline: 'Database Administrator | Keeping data reliable, fast & backed up',
    location: 'Lahore, Pakistan',
    currentCompany: 'DataForge Labs',
    school: 'University of the Punjab',
    about:
      "I keep databases running the way nobody notices — fast queries, reliable backups, and no 3am pages for something that could've been caught earlier. I treat every backup as untested until it's actually been restored — a backup nobody has practiced recovering from is really just a hope, not a plan.\n\nAt DataForge Labs, I manage a 2TB+ PostgreSQL production database, cutting average query time by 45% through indexing and query optimization work. Always glad to talk indexing strategy, backup and recovery design, or database performance tuning.",
    skills: ['PostgreSQL', 'MySQL', 'Database Optimization', 'Backup & Recovery', 'SQL', 'Replication', 'Indexing'],
    experience: [
      {
        title: 'Database Administrator',
        company: 'DataForge Labs',
        start: 'Jan 2023',
        end: 'Present',
        description:
          'Manage a 2TB+ PostgreSQL production database supporting the core product.\nCut average query time by 45% through indexing and query optimization.\nSet up streaming replication for read-heavy workloads, reducing load on the primary.\nRan quarterly disaster-recovery drills that verified every backup actually restores cleanly.',
      },
      {
        title: 'Junior DBA',
        company: 'RetailPulse',
        start: 'May 2021',
        end: 'Dec 2022',
        description:
          'Maintained MySQL databases for a high-traffic e-commerce platform.\nImplemented an automated backup-and-restore process that passed every disaster-recovery drill.\nTuned slow queries flagged during peak sales traffic, avoiding a repeat outage.\nDocumented schema-change procedures now followed by the wider engineering team.',
      },
    ],
    education: [
      {
        school: 'University of the Punjab',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        start: '2017',
        end: '2021',
      },
      {
        school: 'Punjab Group of Colleges',
        degree: 'Intermediate (I.C.S)',
        fieldOfStudy: 'Computer Science',
        start: '2015',
        end: '2017',
      },
    ],
    certifications: [
      { name: 'Oracle Certified Database Administrator', organization: 'Oracle', date: '2021' },
      { name: 'PostgreSQL Administration Certification', organization: 'EDB', date: '2022' },
    ],
    projects: [
      {
        title: 'PostgreSQL Performance Optimization',
        description: '2TB+ production DB optimization project cutting average query time by 45% through indexing and query rewriting.',
      },
      {
        title: 'Disaster Recovery Automation',
        description: 'Automated backup-and-restore pipeline verified quarterly through full disaster-recovery drills.',
      },
    ],
    awards: [],
  },
  'hr-talent-acquisition': {
    fullName: 'Ayesha Raza',
    title: 'HR & Talent Acquisition Lead',
    headline: 'HR & Talent Acquisition Lead | Connecting Top Tech Talent & Scaling High-Performing Teams',
    location: 'Lahore, Pakistan',
    currentCompany: 'TalentScale Global',
    school: 'Lahore University of Management Sciences (LUMS)',
    about: 'Dynamic Talent Acquisition & HR Leader with 6+ years of experience partnering with executive leadership to attract, hire, and retain top engineering and product talent.\n\nSpecialized in technical recruiting, workforce planning, employer branding, and building high-retention company culture across fast-growing tech companies.',
    skills: ['Technical Recruiting', 'Talent Acquisition', 'Executive Sourcing', 'Workforce Planning', 'HR Strategy', 'Employer Branding', 'Employee Retention', 'Interview Training'],
    experience: [
      {
        title: 'Lead Technical Recruiter & HR Business Partner',
        company: 'TalentScale Global',
        start: '2022',
        end: 'Present',
        description: 'Led end-to-end recruitment strategy for 50+ technical and leadership hires across AI, Full-Stack, and Cloud domains. Reduced time-to-hire by 35% while increasing candidate acceptance rate to 92%.'
      },
      {
        title: 'Senior Talent Acquisition Specialist',
        company: 'InnovateX Technologies',
        start: '2019',
        end: '2022',
        description: 'Sourced and closed 120+ senior engineering professionals across software, data, and design. Implemented structured interview scorecards and automated pipeline tracking.'
      }
    ],
    education: [
      {
        school: 'Lahore University of Management Sciences (LUMS)',
        degree: 'Bachelor of Business Administration (BBA)',
        fieldOfStudy: 'Human Resources',
        start: '2015',
        end: '2019'
      }
    ],
    certifications: [
      {
        name: 'SHRM Certified Professional (SHRM-CP)',
        organization: 'Society for Human Resource Management',
        date: '2021'
      },
      {
        name: 'AIRS Certified Diversity and Technical Recruiter (CDR)',
        organization: 'AIRS powered by KellyOCG',
        date: '2020'
      }
    ],
    projects: [
      {
        title: 'Tech Hiring Playbook & Onboarding Framework',
        description: 'Designed standardized technical interview rubric and 30-60-90 day onboarding roadmap adopted across 8 engineering teams.'
      }
    ],
    awards: [
      {
        title: 'Top Recruiter of the Year',
        issuer: 'TalentScale Global',
        date: '2023'
      }
    ]
  },
};
