import { ResumeData, GithubProfileData, LinkedinProfileData } from '../types';

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "Alex Rivera",
    jobTitle: "Senior AI & Full-Stack Architect",
    email: "alex.rivera@techcraft.io",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA (Hybrid)",
    website: "https://alexrivera.dev",
    linkedin: "linkedin.com/in/alex-rivera-dev",
    github: "github.com/alexrivera-ai",
    bio: "Versatile Full-Stack Engineer and AI Systems Architect with 7+ years of experience designing high-throughput cloud services, web applications, and autonomous LLM agents. Skilled in Next.js, TypeScript, Python, PyTorch, and distributed microservices."
  },
  experiences: [
    {
      id: "exp-1",
      company: "Nexus AI Labs",
      role: "Lead Full-Stack AI Engineer",
      location: "San Francisco, CA",
      startDate: "2023 - Present",
      endDate: "Present",
      current: true,
      bullets: [
        "Architected and deployed enterprise RAG pipeline serving 2M+ active users, reducing query latency by 42%.",
        "Engineered real-time collaboration dashboard using Next.js App Router, WebSockets, and TailwindCSS.",
        "Mentored a team of 8 engineers and introduced automated CI/CD workflows with GitHub Actions."
      ]
    },
    {
      id: "exp-2",
      company: "CloudScale Technologies",
      role: "Senior Software Engineer",
      location: "Austin, TX",
      startDate: "2020",
      endDate: "2023",
      current: false,
      bullets: [
        "Built multi-tenant SaaS backend in Python/FastAPI handling 15,000 requests/sec with 99.99% uptime.",
        "Refactored legacy React codebase to modern TypeScript and Next.js, boosting Lighthouse score from 68 to 98.",
        "Optimized PostgreSQL database queries and Redis caching, cutting cloud infrastructure costs by $85k/year."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "B.S. in Computer Science & Artificial Intelligence",
      field: "Computer Science",
      startDate: "2016",
      endDate: "2020",
      gpa: "3.92 / 4.0"
    }
  ],
  skills: [
    "TypeScript", "React / Next.js", "Python", "Node.js", "PyTorch / OpenAI API",
    "TailwindCSS", "PostgreSQL", "Docker / K8s", "GraphQL / REST", "GraphQL", "AWS / Vercel"
  ],
  projects: [
    {
      id: "proj-1",
      title: "OmniMind AI Workspace",
      description: "An agentic workspace enabling real-time code synthesis and visual diagramming powered by Gemini 1.5 Flash.",
      technologies: ["Next.js", "TypeScript", "TailwindCSS", "OpenAI API"],
      link: "https://omnimind-ai.demo.app",
      githubUrl: "https://github.com/alexrivera-ai/omnimind"
    },
    {
      id: "proj-2",
      title: "VectorFlow DB Engine",
      description: "Lightweight in-memory vector indexing engine optimized for semantic search and sub-millisecond retrieval.",
      technologies: ["Rust", "Python", "FastAPI", "Docker"],
      link: "https://vectorflow.io",
      githubUrl: "https://github.com/alexrivera-ai/vectorflow"
    }
  ],
  certifications: [
    "AWS Certified Solutions Architect – Professional (2024)",
    "DeepLearning.AI TensorFlow Developer Certificate",
    "Certified Kubernetes Application Developer (CKAD)"
  ],
  template: 'modern',
  accentColor: '#6366f1',
  resumeType: 'professional'
};

export const defaultGithubData: GithubProfileData = {
  username: "alexrivera-ai",
  title: "🚀 Building Next-Gen AI Agents & Scalable Web Apps",
  about: "👋 Hi, I'm Alex! I build autonomous AI tools, reactive full-stack interfaces, and high-performance distributed systems. Currently exploring Agentic Workflows, Vector Databases, and LLM fine-tuning.",
  bannerUrl: "https://res.cloudinary.com/dnqk2jlds/image/upload/f_auto,q_auto,w_1400/v1784892308/lms-assets/github-builder-banner.png",
  avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  techStack: [
    "TypeScript", "JavaScript", "React", "Next.js", "Python", "PyTorch",
    "FastAPI", "Node.js", "TailwindCSS", "PostgreSQL", "Docker", "Git"
  ],
  showStatsCard: true,
  showStreakCard: false,
  showTopLangsCard: true,
  theme: "dark",
  socialLinks: {
    linkedin: "https://linkedin.com/in/alex-rivera-dev",
    twitter: "https://x.com/alexrivera_tech",
    email: "alex.rivera@techcraft.io",
    website: "https://alexrivera.dev"
  },
  customSections: [
    {
      title: "⚡ Quick Stats",
      content: "- 💬 Ask me about **Next.js, Python, and AI Agents**\n- 📫 Reach me at: **alex.rivera@techcraft.io**\n- 🔭 Currently working on: **ProfileArchitect - AI Career Builder**"
    }
  ]
};

export const defaultLinkedinData: LinkedinProfileData = {
  headline: "Senior AI & Full-Stack Architect | Building Autonomous Systems & High-Scale Next.js Applications | Ex-Nexus AI Labs",
  about: "Driven Full-Stack Engineer and AI Systems Architect with 7+ years of experience transforming complex engineering challenges into sleek, human-centered products.\n\nOver the past 5 years, I've scaled microservice backends to serve millions of requests and pioneered generative AI workflows that boost developer productivity.\n\nKey Highlights:\n- 🚀 Led full-stack engineering at Nexus AI Labs serving 2M+ active users\n- ⚡ Expert in Next.js, TypeScript, Python, and Enterprise RAG Architectures\n- 🏆 Speaker & Mentor in AI Software Engineering\n\nAlways open to discussing AI innovations, tech leadership, or advisory roles!",
  industry: "Software Engineering & Artificial Intelligence",
  targetRole: "Senior AI Engineer / Lead Software Architect",
  experienceHighlights: [
    "Pioneered enterprise RAG solution cut search latency by 42% for 2M users.",
    "Engineered reactive Next.js workspace app with WebSockets and TailwindCSS.",
    "Reduced cloud infrastructure costs by $85k/year through query and cache optimization."
  ],
  keySkills: [
    "Artificial Intelligence (AI)", "Full-Stack Development", "Next.js",
    "TypeScript", "Python", "Large Language Models (LLM)", "System Architecture"
  ],
  featuredPost: "🔥 Thrilled to release ProfileArchitect - AI Career Builder! An open-source workspace to generate ATS-optimized Resumes, custom GitHub Markdown bios, and high-impact LinkedIn profiles in seconds. Check out the live demo below! 👇",
  openToWork: true
};
