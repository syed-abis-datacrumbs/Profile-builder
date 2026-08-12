// AUTO-PORTED from the DataCrumbs LMS CV builder (sampleCvData.ts) so the
// prototype offers the SAME field-based CV templates. The sample array below is
// copied verbatim from the LMS; lmsSampleToResumeData() maps each LMS CvData
// onto the prototype's ResumeData shape.
import { ResumeData } from '../types';

export interface LmsResumeSample {
  label: string;
  // Raw LMS CvData (kept loose — mapped at load time).
  data: any;
}

export const LMS_RESUME_SAMPLES: LmsResumeSample[] = [
  {
    label: "AI/ML Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 300 1234567",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "Indus University", degree: "Bachelor of Science in Artificial Intelligence", start: "Jul 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "AI Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Developed AI models using machine learning algorithms to extract actionable insights, **achieving a 15% cost reduction** for 3 small businesses through predictive analytics and anomaly detection, which significantly improved their operational efficiency.\nAutomated machine learning pipelines in Python, integrating advanced NLP techniques and time-series forecasting, **cutting manual reporting by 80%** and allowing for more timely decision-making.\nImplemented reinforcement learning from human feedback (RLHF) on LLMs, **enhancing response relevance by 30%** in enterprise support scenarios, leading to improved user satisfaction.",
        },
      ],
      workshops: [
        { title: "AI Chatbots & Automation", description: "Learned to build and deploy AI-driven chatbots using NLP, APIs, and automation tools, focusing on intelligent workflows for customer support and lead handling." },
        { title: "Prompt Engineering & LLM Fine-Tuning", description: "Hands-on training in prompt design, retrieval-augmented generation, and fine-tuning open-source language models for domain-specific tasks." },
      ],
      projects: [
        { title: "LegalSummarizeAI", technologies: "OpenAI GPT, Hugging Face", description: "Fine-tuned a domain-specific LLM for legal document summarization, achieving a **92% ROUGE score**; reduced contract review time by 48% for a mid-sized law firm." },
        { title: "LegalRAG-Pipeline", technologies: "LangChain, FAISS", description: "Built a retrieval-augmented generation (RAG) pipeline enabling real-time access to **1M+ documents**; improved query resolution accuracy by 41%." },
        { title: "GlobalChatBotX", technologies: "LLaMA 2, Translation APIs", description: "Engineered a multilingual chatbot supporting **14 languages**; boosted international customer satisfaction scores by 33%." },
      ],
      certifications: [
        { name: "TensorFlow Developer", organization: "Tensorflow University" },
        { name: "Data Science Bootcamp", organization: "DataCrumbs" },
        { name: "Meta Full-Stack Developer", organization: "Arizona University" },
        { name: "MongoDB Node.js Developer Path", organization: "MongoDB University" },
      ],
      additional: {
        skills: "Python, OpenAI API, LLaMA 2, Vector Databases (FAISS, Pinecone), RAG, Prompt Engineering, Natural Language Processing, PyTorch, TensorFlow",
        interests: "Participating in or leading open-source AI or machine learning projects",
      },
    },
  },
  {
    label: "AI/ML Engineer (2 pages)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 300 1234567",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        linkedinLabel: "LinkedIn",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "Indus University", degree: "Bachelor of Science in Artificial Intelligence", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels (Physics, Mathematics, Computer Science)", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "AI Engineer (Intern)",
          start: "Nov 2024",
          end: "Present",
          bullets:
            "Developed AI models using machine learning algorithms to extract insights, **achieving a 15% cost reduction** for 3 small businesses through predictive analytics and anomaly detection.\nAutomated machine learning pipelines in Python, integrating NLP and time-series forecasting, **cutting manual reporting by 80%**.\nBuilt AI dashboards delivering real-time insights and **boosting decision speed by 50%** for the operations team.\nImplemented reinforcement learning from human feedback (RLHF) on LLMs, **enhancing response relevance by 30%** in enterprise support scenarios.\nDesigned secure, on-premise LLM deployments with vector embeddings, ensuring GDPR compliance while maintaining **90%+ retrieval accuracy**.",
        },
        {
          company: "NeuralWorks Lab",
          title: "Machine Learning Research Assistant",
          start: "Jun 2024",
          end: "Oct 2024",
          bullets:
            "Researched transformer architectures for low-resource languages, **improving translation BLEU scores by 22%**.\nBuilt and benchmarked 10+ model variants, authoring reproducible training pipelines with PyTorch and Weights & Biases.\nCo-authored an internal white paper on efficient fine-tuning (LoRA/QLoRA), **reducing GPU training cost by 40%**.\nMentored 4 junior students on data preprocessing, model evaluation, and experiment tracking.",
        },
      ],
      workshops: [
        { title: "AI Chatbots & Automation", description: "Learned to build and deploy AI-driven chatbots using NLP, APIs, and automation tools, focusing on intelligent workflows for customer support and lead handling." },
        { title: "Prompt Engineering & LLM Fine-Tuning", description: "Hands-on training in prompt design, retrieval-augmented generation, and fine-tuning open-source language models for domain-specific tasks." },
      ],
      projects: [
        { title: "LegalSummarizeAI", technologies: "OpenAI GPT, Hugging Face", description: "Fine-tuned a domain-specific LLM for legal document summarization, achieving a **92% ROUGE score**; reduced contract review time by 48% for a mid-sized law firm." },
        { title: "LegalRAG-Pipeline", technologies: "LangChain, FAISS", description: "Built a retrieval-augmented generation (RAG) pipeline enabling real-time access to **1M+ documents**; improved query resolution accuracy by 41%." },
        { title: "GlobalChatBotX", technologies: "LLaMA 2, Translation APIs", description: "Engineered a multilingual chatbot supporting **14 languages**; boosted international customer satisfaction scores by 33%." },
        { title: "FinEmbedQA", technologies: "Pinecone, OpenAI Embeddings", description: "Developed a secure on-premise financial Q&A system with vector embeddings, ensuring GDPR compliance while maintaining **90%+ retrieval accuracy**." },
        { title: "CodeAssistAI", technologies: "Fine-tuned Codex", description: "Created an AI-driven code generation assistant, **reducing internal tooling development time by 37%** and cutting bug rates by 22%." },
        { title: "VisionInspect", technologies: "PyTorch, OpenCV", description: "Built a computer-vision defect detector for a manufacturing line, reaching **98.5% precision** and cutting manual QA effort by 60%." },
      ],
      certifications: [
        { name: "TensorFlow Developer", organization: "Tensorflow University" },
        { name: "Data Science Bootcamp", organization: "DataCrumbs" },
        { name: "Deep Learning Specialization", organization: "DeepLearning.AI" },
        { name: "Machine Learning Engineering", organization: "Google Cloud" },
      ],
      additional: {
        skills: "Python, PyTorch, TensorFlow, scikit-learn, OpenAI API, LLaMA 2, Hugging Face Transformers, LangChain, Vector Databases (FAISS, Pinecone), RAG, RLHF, Prompt Engineering, Natural Language Processing, Computer Vision, MLOps (Docker, MLflow, Weights & Biases), SQL, Pandas, NumPy",
        interests: "Participating in or leading open-source AI or machine learning projects, writing technical blogs on LLMs, and competing in Kaggle competitions",
      },
    },
  },
  {
    label: "Data Science (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 301 2345678",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NED University", degree: "Bachelor of Science in Data Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Data Analyst (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Analyzed 500K+ records to surface business insights, **improving decision speed by 50%** through interactive dashboards that facilitated real-time data exploration and enhanced stakeholder engagement.\nBuilt automated ETL pipelines in Python and SQL, **reducing manual data prep time by 70%**, which allowed the team to focus on in-depth data analysis instead of time-consuming data cleaning tasks.\nDelivered A/B testing analysis that **increased conversion by 18%** for a client marketing campaign, providing actionable recommendations that were implemented in subsequent strategies, ultimately driving higher client satisfaction.",
        },
      ],
      workshops: [
        { title: "Applied Machine Learning", description: "Trained on end-to-end ML workflows covering feature engineering, model selection, and evaluation using scikit-learn and Python." },
        { title: "Data Storytelling & Visualization", description: "Practiced turning raw datasets into clear dashboards and narratives with Power BI and matplotlib for business stakeholders." },
      ],
      projects: [
        { title: "Customer Churn Prediction System", technologies: "Python, scikit-learn", description: "Developed a machine learning pipeline to predict customer churn with **89% accuracy**; insights from feature importance guided a retention strategy, reducing churn by 17%." },
        { title: "Retail Sales Forecasting", technologies: "Python, Prophet, Power BI", description: "Forecasted store-level demand with **91% accuracy**, cutting overstock costs by 22% across 40+ outlets." },
        { title: "Credit Score Classification", technologies: "Python, CatBoost", description: "Improved classification accuracy by **15%** using a hybrid CatBoost + ANN model on 100K+ customer records." },
      ],
      certifications: [
        { name: "Data Science Bootcamp", organization: "DataCrumbs" },
        { name: "TensorFlow Developer", organization: "Tensorflow University" },
        { name: "Google Data Analytics", organization: "Coursera" },
        { name: "SQL for Data Science", organization: "MongoDB University" },
      ],
      additional: {
        skills: "Python (NumPy, Pandas, Matplotlib, Scikit-learn), SQL, Power BI, Tableau, Jupyter Notebooks, Statistical Analysis, Machine Learning, Data Visualization",
        interests: "Competing in Kaggle competitions and exploring open datasets",
      },
    },
  },
  {
    label: "Data Science (2 pages)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 301 2345678",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        linkedinLabel: "LinkedIn",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NED University", degree: "Bachelor of Science in Data Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels (Mathematics, Statistics, Economics)", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Data Analyst (Intern)",
          start: "Nov 2024",
          end: "Present",
          bullets:
            "Analyzed 500K+ records to surface business insights, **improving decision speed by 50%** through interactive dashboards.\nBuilt automated ETL pipelines in Python and SQL, **reducing manual data prep time by 70%**.\nDelivered A/B testing analysis that **increased conversion by 18%** for a client marketing campaign.\nDesigned KPI dashboards in Power BI adopted by 3 departments, **standardizing weekly reporting**.\nPartnered with engineering to instrument event tracking, **improving data quality coverage from 62% to 94%**.",
        },
        {
          company: "InsightIQ",
          title: "Business Intelligence Assistant",
          start: "Jun 2024",
          end: "Oct 2024",
          bullets:
            "Wrote complex SQL across 1M+ rows to model customer cohorts, **uncovering a segment worth 12% of revenue**.\nAutomated recurring reports with Python, **saving the team ~15 hours per week**.\nBuilt a churn early-warning model (logistic regression) with **0.86 AUC**, flagging at-risk accounts.\nDocumented data definitions and a metrics dictionary, reducing cross-team reporting disputes.",
        },
      ],
      workshops: [
        { title: "Applied Machine Learning", description: "Trained on end-to-end ML workflows covering feature engineering, model selection, and evaluation using scikit-learn and Python." },
        { title: "Data Storytelling & Visualization", description: "Practiced turning raw datasets into clear dashboards and narratives with Power BI and matplotlib for business stakeholders." },
      ],
      projects: [
        { title: "Customer Churn Prediction System", technologies: "Python, scikit-learn", description: "Developed a machine learning pipeline to predict customer churn with **89% accuracy**; insights from feature importance guided a retention strategy, reducing churn by 17%." },
        { title: "Retail Sales Forecasting", technologies: "Python, Prophet, Power BI", description: "Forecasted store-level demand with **91% accuracy**, cutting overstock costs by 22% across 40+ outlets." },
        { title: "Credit Score Classification", technologies: "Python, CatBoost", description: "Improved classification accuracy by **15%** using a hybrid CatBoost + ANN model on 100K+ customer records." },
        { title: "Marketing Funnel Analysis", technologies: "SQL, Tableau", description: "Analyzed a 6-stage funnel to pinpoint drop-offs, **increasing conversion by 14%** through targeted fixes." },
        { title: "Customer Segmentation Engine", technologies: "Python, K-Means", description: "Segmented 100K+ customers into actionable cohorts, **lifting campaign ROI by 25%**." },
        { title: "A/B Testing Framework", technologies: "Python, SciPy", description: "Built a reusable experimentation toolkit with automated significance testing, **speeding up analysis by 3x**." },
      ],
      certifications: [
        { name: "Data Science Bootcamp", organization: "DataCrumbs" },
        { name: "Google Data Analytics", organization: "Coursera" },
        { name: "Microsoft Power BI Data Analyst", organization: "Microsoft" },
        { name: "Tableau Desktop Specialist", organization: "Tableau" },
      ],
      additional: {
        skills: "Python (NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn), SQL, Power BI, Tableau, Excel (Advanced), Jupyter Notebooks, Statistical Analysis, Hypothesis Testing, A/B Testing, Machine Learning, Data Visualization, ETL, Git",
        interests: "Competing in Kaggle competitions, exploring open datasets, and writing about data storytelling",
      },
    },
  },
  {
    label: "Full Stack Developer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 302 3456789",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Portfolio",
      },
      education: [
        { institution: "FAST NUCES", degree: "Bachelor of Science in Software Engineering", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "Full Stack Zone",
          title: "Software Developer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Contributed to **3+ full-stack projects** using Next.js, Node.js, PostgreSQL, and MongoDB in production systems, delivering end-to-end features that improved overall user experience and system reliability.\nDesigned scalable, secure REST APIs with a team of 5 developers and participated in architectural planning, ensuring maintainable code and smooth collaboration across the front and back end.\nImproved database performance by **~30%** through schema refinement and query optimization, reducing average response times and supporting a steadily growing user base.",
        },
      ],
      workshops: [
        { title: "Modern Full-Stack Development", description: "Built and deployed end-to-end web apps with React, Node.js, and REST APIs, covering authentication, database design, and hosting." },
        { title: "Git, CI/CD & Deployment", description: "Learned branching workflows, automated testing pipelines, and container-based deployment to cloud platforms." },
      ],
      projects: [
        { title: "Uber Clone – Ride Booking App", technologies: "MERN, WebSockets", description: "Built a real-time ride booking system handling **1,000+ concurrent users** with 90% faster API performance through caching and optimization." },
        { title: "E-Commerce Platform", technologies: "Node.js, MongoDB, React", description: "Developed a secure, role-based e-commerce backend with dynamic filtering and real-time updates, **improving order processing speed by 40%**." },
        { title: "URL Shortener with QR & Analytics", technologies: "Express.js, MongoDB", description: "Created a URL shortener API with QR generation and analytics, tracking **5K+ clicks** and reducing link management time by 60%." },
      ],
      certifications: [
        { name: "Meta Full-Stack Developer", organization: "Arizona University" },
        { name: "MongoDB Node.js Developer Path", organization: "MongoDB University" },
        { name: "No Code Web Development", organization: "DataCrumbs" },
        { name: "Responsive Web Design", organization: "freeCodeCamp" },
      ],
      additional: {
        skills: "JavaScript (ES6+), TypeScript, React.js, Next.js, Node.js, Express.js, MongoDB, PostgreSQL, REST APIs, WebSockets, Tailwind CSS, Git/GitHub, Docker",
        interests: "Building and contributing to open-source full stack applications",
      },
    },
  },
  {
    label: "Frontend Developer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 303 4567890",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Portfolio",
      },
      education: [
        { institution: "NED University", degree: "Bachelor of Science in Software Engineering", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Front End Developer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Built responsive web applications using React.js, Next.js, and Tailwind CSS, **enhancing mobile usability by 50%** and delivering a consistent experience across devices and screen sizes.\nDeveloped reusable UI components, **reducing development time by 30%** across the team and improving design consistency throughout the product.\nOptimized web performance with code splitting and lazy loading, **improving load time by 45%**, which boosted user retention and search rankings.",
        },
      ],
      workshops: [
        { title: "Responsive UI Engineering", description: "Trained in building accessible, mobile-first interfaces with React and Tailwind CSS, covering layout systems and component patterns." },
        { title: "Web Performance Optimization", description: "Practiced auditing and improving Core Web Vitals through code splitting, lazy loading, and asset optimization." },
      ],
      projects: [
        { title: "Portfolio Website", technologies: "React.js, Framer Motion, Tailwind CSS", description: "Developed a personal site showcasing 10+ projects, attracting **2,500+ monthly visitors** with a 20% bounce rate; implemented smooth animations and responsive layouts for a polished, professional feel." },
        { title: "Weather Dashboard", technologies: "React, OpenWeatherMap API", description: "Built a real-time weather app displaying 10+ metrics with dynamic search, serving **1,000+ users** in the first month while maintaining fast load times and an intuitive, accessible interface." },
        { title: "TaskTrack App", technologies: "React, Redux, Firebase", description: "Developed a task management system tracking **1,500+ tasks/month** across 200+ users, boosting team productivity by 35% through real-time sync, reminders, and a clean drag-and-drop workflow." },
      ],
      certifications: [
        { name: "Meta Front-End Developer", organization: "Meta" },
        { name: "Responsive Web Design", organization: "freeCodeCamp" },
        { name: "No Code Web Development", organization: "DataCrumbs" },
        { name: "JavaScript Algorithms & Data Structures", organization: "freeCodeCamp" },
      ],
      additional: {
        skills: "HTML5, CSS3, SASS, JavaScript (ES6+), React.js, Next.js, Tailwind CSS, Git, GitHub, REST APIs, Figma, Firebase, GraphQL, Jest, React Testing Library",
        interests: "Building accessible, pixel-perfect user interfaces",
      },
    },
  },
  {
    label: "Software Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 304 5678901",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NUST", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "TechNova",
          title: "Software Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Designed and shipped backend microservices in Java and Node.js serving **200K+ daily requests** with 99.9% uptime, supporting critical business features at scale.\nReduced API latency by **35%** through query optimization, Redis caching, and connection pooling, noticeably improving the end-user experience.\nWrote unit and integration tests raising coverage to **85%**, cutting production incidents by 40% and increasing overall release confidence.",
        },
      ],
      workshops: [
        { title: "Data Structures & Problem Solving", description: "Intensive training in algorithms, complexity analysis, and the problem patterns used in technical coding interviews." },
        { title: "Clean Code & Design Patterns", description: "Learned SOLID principles, refactoring techniques, and common design patterns for maintainable production code." },
      ],
      projects: [
        { title: "Distributed Task Queue", technologies: "Go, Redis", description: "Built a fault-tolerant task queue processing **50K+ jobs/hour** with retries and dead-letter handling, ensuring reliable background processing under heavy load." },
        { title: "Real-Time Chat Backend", technologies: "Node.js, WebSockets, MongoDB", description: "Engineered a scalable chat service supporting **10K+ concurrent connections** with sub-100ms delivery and horizontal scaling for spikes in traffic." },
        { title: "CI/CD Pipeline Automation", technologies: "Docker, GitHub Actions", description: "Automated build, test, and deploy pipelines, **cutting release time by 60%** across 5 services while reducing manual errors and improving deployment consistency." },
      ],
      certifications: [
        { name: "Meta Back-End Developer", organization: "Meta" },
        { name: "AWS Certified Cloud Practitioner", organization: "Amazon Web Services" },
        { name: "MongoDB Node.js Developer Path", organization: "MongoDB University" },
        { name: "Docker & Kubernetes", organization: "DataCrumbs" },
      ],
      additional: {
        skills: "Java, Python, C++, Spring Boot, Node.js, Express.js, PostgreSQL, Redis, Docker, Kubernetes, AWS, Microservices, REST APIs, CI/CD, Unit Testing, System Design, Data Structures & Algorithms, Git/GitHub",
        interests: "Solving algorithmic challenges on competitive programming platforms, and contributing to open-source backend tools and developer libraries",
      },
    },
  },
  {
    label: "Data Analytics (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 305 6789012",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "LUMS", degree: "Bachelor of Science in Data Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "InsightIQ",
          title: "Data Analyst (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Built executive dashboards in Power BI tracking 20+ KPIs, **cutting report turnaround from days to minutes** and giving leadership faster access to key metrics.\nWrote complex SQL queries across 1M+ rows to surface trends that **grew revenue by 12%**, directly informing quarterly business strategy.\nAutomated weekly reporting with Python, **saving the team ~15 hours/week** and freeing analysts to focus on higher-value work.\nPartnered with cross-functional teams to define tracking requirements, **improving data quality coverage from 68% to 95%** across core dashboards.",
        },
      ],
      workshops: [
        { title: "Excel & SQL for Analytics", description: "Hands-on training in advanced spreadsheet modelling and SQL querying for day-to-day business reporting." },
        { title: "Dashboard Design with Power BI", description: "Built interactive dashboards and KPI reports covering data modelling, DAX measures, and stakeholder presentation." },
      ],
      projects: [
        { title: "Sales Performance Dashboard", technologies: "Power BI, SQL", description: "Delivered an interactive dashboard for 40+ stores, **improving forecast accuracy by 18%** and helping managers spot underperforming regions at a glance." },
        { title: "Customer Segmentation", technologies: "Python, K-Means", description: "Segmented 100K+ customers into actionable cohorts, **lifting campaign ROI by 25%** through more precisely targeted marketing." },
        { title: "Marketing Funnel Analysis", technologies: "SQL, Tableau", description: "Analyzed a 6-stage funnel to pinpoint drop-offs, **increasing conversion by 14%** with data-backed recommendations for each stage." },
      ],
      certifications: [
        { name: "Google Data Analytics", organization: "Coursera" },
        { name: "Microsoft Power BI Data Analyst", organization: "Microsoft" },
        { name: "Tableau Desktop Specialist", organization: "Tableau" },
        { name: "SQL for Data Analytics", organization: "DataCrumbs" },
      ],
      additional: {
        skills: "Advanced Excel, SQL, Power BI, Tableau, Looker Studio, Python (Pandas, NumPy), Google Analytics, Data Cleaning, ETL, Dashboarding, A/B Testing, Predictive Modeling, Statistical Analysis, Data Storytelling",
        interests: "Turning messy, real-world data into clear, decision-ready stories, and exploring new visualization and analytics techniques",
      },
    },
  },
  {
    label: "Cyber Security (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 306 7890123",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "TryHackMe",
      },
      education: [
        { institution: "FAST NUCES", degree: "Bachelor of Science in Cyber Security", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "SecureNet",
          title: "Security Analyst (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Performed vulnerability assessments on 30+ assets, **remediating 95% of critical findings** within SLA and strengthening the organization's overall security posture.\nMonitored SIEM alerts and triaged incidents, **reducing mean time to respond by 40%** through improved detection and escalation workflows.\nAuthored hardening guides aligned to CIS benchmarks, **closing 50+ misconfigurations** and reducing the attack surface across key systems.",
        },
      ],
      workshops: [
        { title: "Ethical Hacking & Penetration Testing", description: "Hands-on labs covering reconnaissance, vulnerability scanning, and exploitation using Kali Linux and Burp Suite." },
        { title: "Security Operations & Incident Response", description: "Trained in SIEM monitoring, log analysis, and following structured incident response playbooks." },
      ],
      projects: [
        { title: "Network Vulnerability Scanner", technologies: "Python, Nmap", description: "Built an automated scanner flagging **200+ vulnerabilities** across a lab network with prioritized reporting, helping teams focus on the highest-risk issues first." },
        { title: "Phishing Detection System", technologies: "Python, scikit-learn", description: "Trained an ML classifier detecting phishing URLs with **96% accuracy** on 50K+ samples, significantly reducing exposure to social-engineering attacks." },
        { title: "SIEM Log Analyzer", technologies: "ELK Stack", description: "Ingested and correlated logs to surface anomalies, **cutting alert noise by 55%** and speeding up investigation of genuine threats." },
      ],
      certifications: [
        { name: "CompTIA Security+", organization: "CompTIA" },
        { name: "Certified Ethical Hacker (CEH)", organization: "EC-Council" },
        { name: "Google Cybersecurity", organization: "Coursera" },
        { name: "SOC Level 1", organization: "TryHackMe" },
      ],
      additional: {
        skills: "Penetration Testing, Nmap, Wireshark, Burp Suite, Metasploit, Kali Linux, SIEM (Splunk), Python, Network Security, OWASP Top 10, Threat Modeling, Vulnerability Management, Log Analysis, Cryptography, Incident Response",
        interests: "Participating in CTF competitions and bug bounty programs, and staying current with emerging threats and security research",
      },
    },
  },
  {
    label: "Digital Marketing (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 307 8901234",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "Portfolio",
        kaggle: "",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "IBA Karachi", degree: "Bachelor of Business Administration (Marketing)", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "BrandFlow Agency",
          title: "Marketing Associate (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Managed paid social campaigns across Meta and Google Ads, **improving ROAS by 32%** on a PKR 2M budget through continuous testing and audience refinement.\nGrew organic social following by **45% in 3 months** through a data-driven content calendar and consistent, on-brand storytelling.\nRan A/B tests on landing pages that **lifted conversion rate by 20%**, turning insights into repeatable optimization playbooks.",
        },
      ],
      workshops: [
        { title: "Performance Marketing & Paid Ads", description: "Trained in planning and optimizing Meta and Google Ads campaigns, covering audience targeting, budgets, and ROAS." },
        { title: "SEO & Content Strategy", description: "Practiced keyword research, on-page optimization, and content planning to grow organic search traffic." },
      ],
      projects: [
        { title: "SEO Growth Campaign", technologies: "Google Search Console, Ahrefs", description: "Optimized 40+ pages, **doubling organic traffic** and ranking 15 keywords on page one through technical fixes and targeted content improvements." },
        { title: "Email Marketing Automation", technologies: "Mailchimp, HubSpot", description: "Built automated drip funnels, **raising email revenue by 28%** with a 34% open rate by segmenting audiences and personalizing every touchpoint." },
        { title: "Social Media Content Strategy", technologies: "Meta Ads, Canva", description: "Launched a 90-day content plan that **grew engagement by 60%** across platforms, pairing consistent posting with data-led creative decisions." },
      ],
      certifications: [
        { name: "Google Digital Marketing & E-commerce", organization: "Google" },
        { name: "Meta Social Media Marketing", organization: "Meta" },
        { name: "HubSpot Content Marketing", organization: "HubSpot Academy" },
        { name: "Google Analytics Certification", organization: "Google" },
      ],
      additional: {
        skills: "SEO, SEM, Google Ads, Meta Ads Manager, Google Analytics, Content Strategy, Email Marketing, Copywriting, Canva, HubSpot, Mailchimp, A/B Testing, Conversion Optimization, Marketing Analytics, Brand Strategy",
        interests: "Studying brand storytelling and consumer psychology, and experimenting with new content formats and growth tactics",
      },
    },
  },
  {
    label: "Data Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 308 9012345",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NUST", degree: "Bachelor of Science in Data Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Data Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Built and maintained scalable ETL pipelines in Python and SQL processing **500GB+ of data daily**, ensuring reliable, timely delivery to downstream analytics and reporting teams.\nOptimized data warehouse queries and partitioning on Snowflake, **cutting average query time by 45%** while significantly reducing compute costs across the platform.\nOrchestrated automated workflows with Apache Airflow, **reducing manual data jobs by 70%** and improving pipeline reliability, monitoring, and failure recovery.",
        },
      ],
      workshops: [
        { title: "Building Data Pipelines", description: "Hands-on training in ETL/ELT design with Python and Airflow, covering scheduling, orchestration, and data quality checks." },
        { title: "Cloud Data Warehousing", description: "Learned dimensional modelling and warehouse optimization on BigQuery and Snowflake." },
      ],
      projects: [
        { title: "Real-Time Streaming Pipeline", technologies: "Kafka, Spark", description: "Designed a streaming pipeline ingesting **1M+ events/hour**, enabling near real-time analytics with sub-second latency for live business dashboards." },
        { title: "Data Lake Architecture", technologies: "AWS S3, Glue", description: "Built a partitioned data lake consolidating 10+ sources, **cutting storage costs by 30%** while improving query performance and data discoverability." },
        { title: "Automated Data Quality Framework", technologies: "Python, Great Expectations", description: "Developed a validation framework catching **95% of data anomalies** before production, greatly boosting trust in analytics and reporting." },
      ],
      certifications: [
        { name: "AWS Certified Data Engineer", organization: "Amazon Web Services" },
        { name: "Data Engineering Bootcamp", organization: "DataCrumbs" },
        { name: "Databricks Lakehouse Fundamentals", organization: "Databricks" },
        { name: "SQL for Data Engineering", organization: "Coursera" },
      ],
      additional: {
        skills: "Python, SQL, Apache Spark, Apache Airflow, Kafka, Snowflake, dbt, AWS (S3, Glue, Redshift), ETL/ELT, Data Warehousing, Data Modeling, Docker, Pandas, Git/GitHub",
        interests: "Building reliable, scalable data infrastructure, and exploring modern data-stack tools and streaming technologies",
      },
    },
  },
  {
    label: "DevOps Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 309 0123456",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "FAST NUCES", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "DevOps Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Automated CI/CD pipelines with GitHub Actions and Jenkins for 10+ services, **cutting deployment time by 60%** and enabling multiple safe, repeatable releases per day.\nContainerized applications with Docker and orchestrated them on Kubernetes, **improving resource utilization by 40%** while ensuring zero-downtime deployments.\nImplemented infrastructure-as-code with Terraform on AWS, **provisioning environments 3x faster** and keeping configurations consistent and version-controlled.\nSet up centralized logging and alerting for production systems, **reducing mean time to detect incidents by 45%** and improving overall system observability and reliability.",
        },
      ],
      workshops: [
        { title: "Docker & Kubernetes Fundamentals", description: "Hands-on training in containerizing applications and orchestrating deployments, scaling, and rolling updates." },
        { title: "CI/CD Automation", description: "Built automated build, test, and deploy pipelines with GitHub Actions and infrastructure-as-code using Terraform." },
      ],
      projects: [
        { title: "Kubernetes Auto-Scaling Cluster", technologies: "Kubernetes, Helm", description: "Configured a self-healing, auto-scaling cluster handling **traffic spikes of 5x**, maintaining 99.9% uptime under heavy production load." },
        { title: "Centralized Monitoring Stack", technologies: "Prometheus, Grafana", description: "Built observability dashboards and alerting that **reduced incident response time by 50%** across the engineering team." },
        { title: "Automated Backup & Recovery", technologies: "Bash, AWS", description: "Developed automated backup scripts and disaster-recovery runbooks, **cutting recovery time by 65%** during outages and failovers." },
      ],
      certifications: [
        { name: "AWS Certified DevOps Engineer", organization: "Amazon Web Services" },
        { name: "Certified Kubernetes Administrator (CKA)", organization: "CNCF" },
        { name: "Docker & Kubernetes Bootcamp", organization: "DataCrumbs" },
        { name: "Terraform Associate", organization: "HashiCorp" },
      ],
      additional: {
        skills: "Docker, Kubernetes, Terraform, Ansible, Jenkins, GitHub Actions, AWS, Linux, Bash, Python, CI/CD, Prometheus, Grafana, Nginx, Infrastructure as Code, Git/GitHub",
        interests: "Automating everything that can be automated, and exploring cloud-native and site-reliability engineering practices",
      },
    },
  },
  {
    label: "Mobile App Developer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 310 1234567",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://your-portfolio.com",
        kaggleLabel: "Portfolio",
      },
      education: [
        { institution: "NED University", degree: "Bachelor of Science in Software Engineering", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Mobile App Developer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Built cross-platform mobile apps with Flutter and React Native, **shipping 4+ production apps** with smooth 60fps performance across both iOS and Android.\nIntegrated REST and GraphQL APIs with local caching, **reducing load times by 40%** and enabling reliable offline functionality for users.\nCollaborated with designers to implement pixel-perfect UIs, **improving app store ratings from 3.8 to 4.6** through polished UX and steady bug fixes.\nImplemented push notifications and in-app analytics with Firebase, **increasing user engagement by 30%** through targeted, well-timed re-engagement campaigns.",
        },
      ],
      workshops: [
        { title: "Cross-Platform App Development", description: "Built and shipped mobile apps with Flutter and React Native, covering navigation, state management, and native device APIs." },
        { title: "App Store Deployment & Analytics", description: "Learned release workflows for the Play Store and App Store, plus crash reporting and in-app analytics." },
      ],
      projects: [
        { title: "FoodDelivery App", technologies: "Flutter, Firebase", description: "Built a full-featured delivery app with real-time order tracking, reaching **2,000+ downloads** in its first month with a 4.5-star average rating." },
        { title: "FitTrack Fitness App", technologies: "React Native, Redux", description: "Developed a workout-tracking app with charts and reminders used by **1,500+ active users**, boosting daily retention by 30%." },
        { title: "ExpenseMate", technologies: "Flutter, SQLite", description: "Created an offline-first expense tracker with sync and budgeting, **cutting manual entry time by 50%** through smart auto-categorization." },
      ],
      certifications: [
        { name: "Flutter Development Bootcamp", organization: "DataCrumbs" },
        { name: "Meta React Native Specialization", organization: "Meta" },
        { name: "Google Associate Android Developer", organization: "Google" },
        { name: "Firebase Fundamentals", organization: "Google" },
      ],
      additional: {
        skills: "Flutter, Dart, React Native, JavaScript, TypeScript, Kotlin, Swift, Firebase, REST APIs, GraphQL, Redux, SQLite, State Management, CI/CD (Fastlane), Git/GitHub",
        interests: "Crafting delightful mobile experiences, and experimenting with new cross-platform frameworks and app ideas",
      },
    },
  },
  {
    label: "UI/UX Designer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 311 2345678",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://behance.net/your-username",
        githubLabel: "Behance",
        kaggle: "https://dribbble.com/your-username",
        kaggleLabel: "Dribbble",
      },
      education: [
        { institution: "Indus Valley School of Art and Architecture", degree: "Bachelor of Design (Communication Design)", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "UI/UX Designer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Designed intuitive user interfaces in Figma for web and mobile products, **improving task completion rates by 35%** through research-driven, user-centered design.\nConducted usability testing and user interviews with 20+ participants, **reducing user-reported friction by 40%** and informing key product decisions.\nBuilt and maintained a reusable design system, **cutting design-to-development handoff time by 50%** and ensuring visual consistency across products.",
        },
      ],
      workshops: [
        { title: "UX Research & Usability Testing", description: "Trained in user interviews, persona building, and moderated usability testing to validate design decisions." },
        { title: "Design Systems in Figma", description: "Practiced building reusable component libraries, design tokens, and clickable prototypes for consistent products." },
      ],
      projects: [
        { title: "E-Commerce App Redesign", technologies: "Figma, Maze", description: "Redesigned a shopping app's checkout flow, **lifting conversion by 22%** in usability tests through a simplified, friction-free 3-step process." },
        { title: "SaaS Dashboard UI Kit", technologies: "Figma", description: "Created a comprehensive dashboard design system with 80+ reusable components, **speeding up team design work by 45%**." },
        { title: "Banking App Prototype", technologies: "Figma, ProtoPie", description: "Designed an accessible, WCAG-compliant banking prototype, **raising accessibility scores to 98%** with inclusive, thoughtful patterns." },
      ],
      certifications: [
        { name: "Google UX Design Professional Certificate", organization: "Google" },
        { name: "UI/UX Design Bootcamp", organization: "DataCrumbs" },
        { name: "Interaction Design Specialization", organization: "Coursera" },
        { name: "Figma Advanced Certification", organization: "Figma" },
      ],
      additional: {
        skills: "Figma, Adobe XD, Sketch, Prototyping, Wireframing, User Research, Usability Testing, Design Systems, Interaction Design, Information Architecture, Accessibility (WCAG), Adobe Illustrator, Adobe Photoshop, Design Thinking",
        interests: "Studying human-centered design and accessibility, and exploring emerging design tools and micro-interaction patterns",
      },
    },
  },
  {
    label: "Graphic Designer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 312 3456789",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://behance.net/your-username",
        githubLabel: "Behance",
        kaggle: "https://dribbble.com/your-username",
        kaggleLabel: "Dribbble",
      },
      education: [
        { institution: "Indus Valley School of Art and Architecture", degree: "Bachelor of Design (Visual Communication)", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Graphic Designer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Designed branding, social media, and marketing collateral for 10+ campaigns, **increasing social engagement by 45%** through cohesive, on-brand visual storytelling.\nCreated brand identities including logos, color systems, and style guides, **reducing brand inconsistencies by 60%** across client touchpoints.\nProduced print and digital assets under tight deadlines, **delivering 50+ designs per month** while maintaining a high standard of quality and brand alignment.",
        },
      ],
      workshops: [
        { title: "Brand Identity Design", description: "Hands-on training in logo development, typography, and building complete brand guideline systems." },
        { title: "Adobe Creative Suite Masterclass", description: "Intensive practice in Photoshop, Illustrator, and InDesign for both print and digital deliverables." },
      ],
      projects: [
        { title: "Startup Brand Identity", technologies: "Illustrator, Photoshop", description: "Developed a complete brand identity for a tech startup, **boosting brand recall by 35%** in early market testing through a distinctive visual system." },
        { title: "Social Media Campaign Series", technologies: "Canva, Figma", description: "Designed a 90-day content series that **grew follower engagement by 55%** with a consistent, instantly recognizable visual language." },
        { title: "Product Packaging Design", technologies: "Illustrator, InDesign", description: "Created retail packaging for a product line, **contributing to a 25% sales lift** through eye-catching, standout shelf presence." },
      ],
      certifications: [
        { name: "Graphic Design Bootcamp", organization: "DataCrumbs" },
        { name: "Adobe Certified Professional (Photoshop)", organization: "Adobe" },
        { name: "Graphic Design Specialization", organization: "CalArts (Coursera)" },
        { name: "Canva Design Certification", organization: "Canva" },
      ],
      additional: {
        skills: "Adobe Photoshop, Adobe Illustrator, Adobe InDesign, Figma, Canva, Branding, Typography, Logo Design, Layout Design, Color Theory, Print Design, Social Media Graphics, Packaging Design, Visual Identity",
        interests: "Exploring typography and brand storytelling, and experimenting with new illustration and design styles",
      },
    },
  },
  {
    label: "Video Editor (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 313 4567890",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://your-portfolio.com",
        githubLabel: "Portfolio",
        kaggle: "https://youtube.com/@your-channel",
        kaggleLabel: "YouTube",
      },
      education: [
        { institution: "SZABIST", degree: "Bachelor of Media Sciences", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Video Editor (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Edited and produced 100+ short-form and long-form videos for social media, **growing channel watch time by 50%** through tight pacing and strong storytelling.\nCreated motion graphics, transitions, and color grading in After Effects and Premiere Pro, **improving average viewer retention by 35%**.\nManaged the full post-production workflow under tight deadlines, **cutting turnaround time by 40%** while maintaining consistent brand quality.",
        },
      ],
      workshops: [
        { title: "Video Editing & Post-Production", description: "Trained in narrative editing, colour grading, and audio mixing using Premiere Pro and DaVinci Resolve." },
        { title: "Motion Graphics with After Effects", description: "Practiced building animated titles, transitions, and explainer sequences for social and brand content." },
      ],
      projects: [
        { title: "Brand Promo Series", technologies: "Premiere Pro, After Effects", description: "Produced a promotional video series that **reached 500K+ views**, driving a measurable increase in brand awareness and reach." },
        { title: "YouTube Content Pipeline", technologies: "DaVinci Resolve", description: "Built a repeatable editing and thumbnail workflow that **doubled upload frequency** while keeping production quality consistently high." },
        { title: "Explainer Animation", technologies: "After Effects", description: "Created an animated explainer video that **boosted product page conversions by 28%** through clear, engaging visuals." },
      ],
      certifications: [
        { name: "Video Editing Bootcamp", organization: "DataCrumbs" },
        { name: "Adobe Premiere Pro Certification", organization: "Adobe" },
        { name: "Motion Graphics Specialization", organization: "Coursera" },
        { name: "DaVinci Resolve Certified User", organization: "Blackmagic Design" },
      ],
      additional: {
        skills: "Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve, Final Cut Pro, Motion Graphics, Color Grading, Sound Design, Storyboarding, Video Compositing, Audio Editing, Thumbnail Design, Social Media Video",
        interests: "Studying visual storytelling and editing rhythm, and experimenting with new motion-graphics and color-grading techniques",
      },
    },
  },
  {
    label: "Backend Developer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 314 5678901",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NUST", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Backend Developer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Designed and built RESTful and GraphQL APIs in Node.js and Express serving **150K+ daily requests**, ensuring secure, well-documented, and maintainable endpoints.\nOptimized PostgreSQL schemas, indexing, and queries, **reducing average response time by 40%** and improving reliability under peak traffic.\nImplemented authentication, caching, and rate limiting with Redis and JWT, **cutting redundant database load by 55%** while hardening the platform's security.",
        },
      ],
      workshops: [
        { title: "Scalable API Design", description: "Trained in designing REST and GraphQL APIs, covering authentication, versioning, caching, and rate limiting." },
        { title: "Database Design & Optimization", description: "Hands-on practice in schema design, indexing strategies, and query tuning for high-traffic systems." },
      ],
      projects: [
        { title: "E-Commerce Backend", technologies: "Node.js, PostgreSQL", description: "Built a scalable, role-based backend with payments and inventory, **handling 5K+ orders/day** with 99.9% uptime and clean, testable code." },
        { title: "Real-Time Notification Service", technologies: "WebSockets, Redis", description: "Engineered a pub/sub notification system delivering **1M+ messages/day** with sub-100ms latency and horizontal scalability." },
        { title: "URL Shortener & Analytics API", technologies: "Express, MongoDB", description: "Created a high-throughput shortener tracking **500K+ clicks**, with rate limiting, caching, and detailed usage analytics." },
      ],
      certifications: [
        { name: "Meta Back-End Developer", organization: "Meta" },
        { name: "MongoDB Node.js Developer Path", organization: "MongoDB University" },
        { name: "Backend Development Bootcamp", organization: "DataCrumbs" },
        { name: "AWS Certified Cloud Practitioner", organization: "Amazon Web Services" },
      ],
      additional: {
        skills: "Node.js, Express.js, Python, Java, PostgreSQL, MongoDB, Redis, REST APIs, GraphQL, Docker, JWT/OAuth, Microservices, System Design, SQL, Git/GitHub",
        interests: "Designing clean, scalable backend architectures, and contributing to open-source API and developer tools",
      },
    },
  },
  {
    label: "Cloud Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 315 6789012",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "FAST NUCES", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Cloud Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Architected and deployed cloud infrastructure on AWS across 10+ services, **improving system scalability by 50%** while keeping environments secure and cost-efficient.\nAutomated provisioning with Terraform and CloudFormation, **reducing setup time by 65%** and eliminating configuration drift across environments.\nOptimized cloud spend through right-sizing, autoscaling, and reserved instances, **cutting monthly cloud costs by 30%** without impacting performance.",
        },
      ],
      workshops: [
        { title: "AWS Cloud Fundamentals", description: "Hands-on labs covering EC2, S3, IAM, VPC networking, and designing cost-optimized architectures." },
        { title: "Infrastructure as Code with Terraform", description: "Learned to provision and version reproducible cloud environments across multiple accounts." },
      ],
      projects: [
        { title: "Serverless API Platform", technologies: "AWS Lambda, API Gateway", description: "Built a fully serverless backend scaling to **1M+ requests/day** with pay-per-use cost efficiency and near-zero maintenance." },
        { title: "Multi-Region Deployment", technologies: "AWS, Route 53", description: "Designed a highly available multi-region setup, **achieving 99.99% uptime** with automated failover and health checks." },
        { title: "Cloud Cost Dashboard", technologies: "CloudWatch, Grafana", description: "Created a monitoring dashboard surfacing spend and usage patterns, **saving 22% in unused resources** across teams." },
      ],
      certifications: [
        { name: "AWS Certified Solutions Architect", organization: "Amazon Web Services" },
        { name: "Microsoft Azure Fundamentals (AZ-900)", organization: "Microsoft" },
        { name: "Cloud Computing Bootcamp", organization: "DataCrumbs" },
        { name: "Terraform Associate", organization: "HashiCorp" },
      ],
      additional: {
        skills: "AWS (EC2, S3, Lambda, RDS, VPC), Azure, Terraform, CloudFormation, Docker, Kubernetes, Linux, Python, Bash, Networking, IAM/Security, CI/CD, Monitoring (CloudWatch), Git/GitHub",
        interests: "Building resilient, cost-efficient cloud systems, and exploring serverless and cloud-native architecture patterns",
      },
    },
  },
  {
    label: "QA / Test Automation (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 316 7890123",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NED University", degree: "Bachelor of Science in Software Engineering", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "QA Automation Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Designed and maintained automated test suites with Selenium and Cypress, **increasing test coverage to 85%** and catching regressions well before release.\nBuilt end-to-end and API test frameworks integrated into CI/CD, **reducing manual testing effort by 60%** and speeding up release cycles.\nIdentified, documented, and tracked 200+ bugs with detailed repro steps, **lowering production defects by 40%** through close collaboration with developers.",
        },
      ],
      workshops: [
        { title: "Test Automation with Selenium & Cypress", description: "Built end-to-end automated test suites covering page objects, fixtures, and CI integration." },
        { title: "API & Performance Testing", description: "Trained in Postman, REST Assured, and JMeter for contract testing and load benchmarking." },
      ],
      projects: [
        { title: "E-Commerce Test Automation", technologies: "Cypress, JavaScript", description: "Automated 300+ end-to-end test cases, **cutting regression time from 2 days to 3 hours** with reliable, repeatable CI runs." },
        { title: "API Testing Framework", technologies: "Postman, REST Assured", description: "Built a reusable API test suite validating **500+ endpoints**, integrated directly into the deployment pipeline." },
        { title: "Performance Test Harness", technologies: "JMeter", description: "Created load tests simulating **10K concurrent users**, uncovering bottlenecks that improved response times by 35%." },
      ],
      certifications: [
        { name: "ISTQB Certified Tester (Foundation)", organization: "ISTQB" },
        { name: "Test Automation Bootcamp", organization: "DataCrumbs" },
        { name: "Selenium WebDriver Certification", organization: "Coursera" },
        { name: "Cypress End-to-End Testing", organization: "Test Automation University" },
      ],
      additional: {
        skills: "Selenium, Cypress, Playwright, JavaScript, Python, Java, REST Assured, Postman, JMeter, TestNG, JUnit, CI/CD (Jenkins), API Testing, Performance Testing, Git/GitHub",
        interests: "Building robust, reliable test automation, and exploring quality-engineering and shift-left testing practices",
      },
    },
  },
  {
    label: "Game Developer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 317 8901234",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://your-username.itch.io",
        kaggleLabel: "itch.io",
      },
      education: [
        { institution: "FAST NUCES", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Game Developer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Developed 2D and 3D game mechanics in Unity with C#, **shipping 3+ playable prototypes** with smooth gameplay and carefully optimized performance.\nImplemented physics, AI behaviors, and core gameplay systems, **improving frame rates by 35%** through profiling and targeted optimization.\nCollaborated with artists and designers on level design and UX, **boosting player retention by 25%** through iterative playtesting and polish.",
        },
      ],
      workshops: [
        { title: "Game Development with Unity", description: "Hands-on training in C# scripting, physics, animation systems, and building playable prototypes." },
        { title: "Game Design & Level Building", description: "Practiced core loop design, level pacing, and playtesting to improve player retention." },
      ],
      projects: [
        { title: "2D Platformer Game", technologies: "Unity, C#", description: "Built a complete platformer with 10+ levels and enemy AI, reaching **5K+ downloads** on itch.io with consistently positive reviews." },
        { title: "Multiplayer Shooter Prototype", technologies: "Unreal Engine, Blueprints", description: "Developed a networked multiplayer prototype supporting **8 concurrent players** with low-latency state synchronization." },
        { title: "Mobile Puzzle Game", technologies: "Unity, Firebase", description: "Created a mobile puzzle game with leaderboards and ads, **achieving a 40% day-1 retention** rate through addictive core loops." },
      ],
      certifications: [
        { name: "Unity Certified Associate", organization: "Unity" },
        { name: "Game Development Bootcamp", organization: "DataCrumbs" },
        { name: "C# Programming Specialization", organization: "Coursera" },
        { name: "Unreal Engine Fundamentals", organization: "Epic Games" },
      ],
      additional: {
        skills: "Unity, Unreal Engine, C#, C++, Game Physics, 3D Math, Gameplay Programming, AI (Behavior Trees), Shaders, Blender, Multiplayer Networking, Optimization, Level Design, Git/GitHub",
        interests: "Prototyping game ideas and studying game design, and participating in game jams and interactive-media experiments",
      },
    },
  },
  {
    label: "MLOps Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 318 9012345",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NUST", degree: "Bachelor of Science in Data Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "MLOps Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Built and automated ML training and deployment pipelines with MLflow and Kubeflow, **reducing model deployment time by 60%** and standardizing releases across teams.\nContainerized and served models with Docker and FastAPI on Kubernetes, **handling 100K+ predictions/day** with autoscaling and sub-200ms latency.\nImplemented model monitoring and drift detection, **catching 90% of performance regressions** before they impacted production users.",
        },
      ],
      workshops: [
        { title: "ML Model Deployment & Monitoring", description: "Trained in packaging models as services, tracking experiments with MLflow, and monitoring drift in production." },
        { title: "Docker & Kubernetes for ML", description: "Hands-on practice containerizing training and inference workloads and orchestrating them at scale." },
      ],
      projects: [
        { title: "End-to-End ML Pipeline", technologies: "Kubeflow, MLflow", description: "Automated the full train-to-deploy lifecycle, **cutting release cycles from weeks to days** with fully reproducible experiments." },
        { title: "Feature Store", technologies: "Feast, Redis", description: "Built a centralized feature store serving **50+ models**, ensuring consistency between training and inference." },
        { title: "Model Monitoring Dashboard", technologies: "Prometheus, Grafana", description: "Created drift and performance dashboards, **reducing silent model failures by 70%** in production." },
      ],
      certifications: [
        { name: "MLOps Specialization", organization: "DeepLearning.AI" },
        { name: "MLOps Bootcamp", organization: "DataCrumbs" },
        { name: "AWS Certified Machine Learning", organization: "Amazon Web Services" },
        { name: "Kubernetes for ML", organization: "Coursera" },
      ],
      additional: {
        skills: "Python, MLflow, Kubeflow, Docker, Kubernetes, FastAPI, TensorFlow, PyTorch, CI/CD, Model Monitoring, Feature Stores, AWS SageMaker, Airflow, Prometheus, Git/GitHub",
        interests: "Bridging ML and production systems, and exploring model-serving, observability, and MLOps tooling",
      },
    },
  },
  {
    label: "Business Intelligence Analyst (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 319 0123456",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "LUMS", degree: "Bachelor of Science in Data Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "InsightIQ",
          title: "BI Analyst (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Designed interactive Power BI and Tableau dashboards for 15+ stakeholders, **cutting reporting time by 55%** and enabling faster, data-driven decisions.\nModeled data warehouses and wrote optimized SQL across 2M+ rows, **improving query performance by 40%** for recurring business reports.\nTranslated business requirements into KPIs and metrics, **increasing report adoption by 35%** across sales and operations teams.",
        },
      ],
      workshops: [
        { title: "Power BI & DAX Masterclass", description: "Hands-on training in data modelling, DAX measures, and building executive-ready interactive dashboards." },
        { title: "SQL for Business Reporting", description: "Practiced complex joins, window functions, and query optimization for analytical reporting." },
      ],
      projects: [
        { title: "Executive KPI Dashboard", technologies: "Power BI, DAX", description: "Built a company-wide KPI dashboard consolidating 25+ metrics, **saving leadership 10+ hours/week** in manual reporting." },
        { title: "Sales Analytics Model", technologies: "SQL, Tableau", description: "Created a sales performance model for 40+ regions, **improving forecast accuracy by 20%** and surfacing growth opportunities." },
        { title: "Self-Service Reporting Portal", technologies: "Power BI", description: "Developed a self-service reporting layer, **reducing ad-hoc report requests by 50%** across departments." },
      ],
      certifications: [
        { name: "Microsoft Power BI Data Analyst (PL-300)", organization: "Microsoft" },
        { name: "Business Intelligence Bootcamp", organization: "DataCrumbs" },
        { name: "Tableau Desktop Specialist", organization: "Tableau" },
        { name: "Google Data Analytics", organization: "Coursera" },
      ],
      additional: {
        skills: "Power BI, Tableau, SQL, DAX, Excel (Advanced), Data Modeling, Data Warehousing, ETL, KPI Design, Dashboarding, Python (Pandas), Google Analytics, Requirements Analysis, Git/GitHub",
        interests: "Turning business questions into clear metrics and dashboards, and studying data-driven decision-making",
      },
    },
  },
  {
    label: "Computer Vision Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 320 1234567",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "Indus University", degree: "Bachelor of Science in Artificial Intelligence", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Computer Vision Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Developed and trained deep-learning models for object detection and segmentation, **achieving 96% mAP** on custom datasets using PyTorch and OpenCV.\nOptimized CV models for edge deployment with quantization and pruning, **cutting inference time by 45%** while preserving accuracy.\nBuilt annotation and data-augmentation pipelines, **reducing labeling effort by 60%** and improving overall dataset quality.",
        },
      ],
      workshops: [
        { title: "Deep Learning for Computer Vision", description: "Hands-on training in CNNs, object detection, and image segmentation using PyTorch and OpenCV." },
        { title: "Edge AI & Model Optimization", description: "Learned quantization, pruning, and deploying vision models to edge devices for real-time inference." },
      ],
      projects: [
        { title: "Defect Detection System", technologies: "PyTorch, OpenCV", description: "Built a manufacturing defect detector reaching **98.5% precision**, cutting manual QA effort by 60% on the production line." },
        { title: "Face Recognition Attendance", technologies: "dlib, FaceNet", description: "Developed a real-time attendance system with **99% recognition accuracy** across varied lighting conditions." },
        { title: "Medical Image Segmentation", technologies: "U-Net, TensorFlow", description: "Segmented medical scans with a **0.92 Dice score**, assisting faster and more consistent diagnosis workflows." },
      ],
      certifications: [
        { name: "Deep Learning Specialization", organization: "DeepLearning.AI" },
        { name: "Computer Vision Bootcamp", organization: "DataCrumbs" },
        { name: "TensorFlow Developer", organization: "TensorFlow University" },
        { name: "PyTorch for Deep Learning", organization: "Coursera" },
      ],
      additional: {
        skills: "Python, PyTorch, TensorFlow, OpenCV, Keras, Deep Learning, CNNs, Object Detection (YOLO), Image Segmentation, Model Optimization, NumPy, CUDA, Data Augmentation, Git/GitHub",
        interests: "Exploring vision models and edge AI, and competing in computer-vision challenges on Kaggle",
      },
    },
  },
  {
    label: "Blockchain / Web3 Developer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 321 2345678",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NUST", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Blockchain Developer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Developed and audited smart contracts in Solidity, **securing $500K+ in on-chain value** with gas-optimized, thoroughly tested code.\nBuilt decentralized apps (dApps) with React and ethers.js, **cutting transaction costs by 30%** through efficient contract design.\nIntegrated wallets, IPFS, and on-chain data, **improving dApp load performance by 40%** and enhancing the user experience.",
        },
      ],
      workshops: [
        { title: "Smart Contract Development", description: "Hands-on training in Solidity, contract security patterns, and automated testing with Hardhat." },
        { title: "Web3 & dApp Integration", description: "Practiced connecting front-ends to chains using ethers.js, wallet providers, and IPFS storage." },
      ],
      projects: [
        { title: "NFT Marketplace", technologies: "Solidity, Hardhat", description: "Built a full NFT marketplace with minting and royalties, **processing 1,000+ transactions** securely and gas-efficiently." },
        { title: "DeFi Staking Platform", technologies: "Solidity, React", description: "Developed a staking dApp with **$200K+ TVL**, featuring audited, well-tested reward-distribution contracts." },
        { title: "DAO Voting System", technologies: "Ethereum, ethers.js", description: "Created an on-chain governance system, **enabling 500+ token holders** to vote transparently and immutably." },
      ],
      certifications: [
        { name: "Blockchain Developer Bootcamp", organization: "DataCrumbs" },
        { name: "Ethereum & Solidity", organization: "Coursera" },
        { name: "Certified Blockchain Developer", organization: "Blockchain Council" },
        { name: "Smart Contract Security", organization: "Cyfrin Updraft" },
      ],
      additional: {
        skills: "Solidity, Ethereum, Hardhat, ethers.js, Web3.js, React, JavaScript, Smart Contracts, DeFi, IPFS, Node.js, Truffle, Gas Optimization, Security Auditing, Git/GitHub",
        interests: "Exploring decentralized systems and smart-contract security, and contributing to open-source Web3 projects",
      },
    },
  },
  {
    label: "Embedded / IoT Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 322 3456789",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NED University", degree: "Bachelor of Science in Electrical Engineering", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Embedded / IoT Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Developed firmware in C/C++ for ARM microcontrollers, **reducing power consumption by 35%** through low-power design and careful optimization.\nBuilt IoT devices with sensors and MQTT connectivity, **handling 10K+ data points/hour** with reliable, real-time cloud sync.\nDebugged and optimized real-time embedded systems, **improving system responsiveness by 40%** using an RTOS and interrupt tuning.",
        },
      ],
      workshops: [
        { title: "Embedded C & Microcontrollers", description: "Hands-on labs in firmware development, interrupts, and peripheral interfacing on ARM and ESP32 boards." },
        { title: "IoT Connectivity & Protocols", description: "Trained in MQTT, BLE, and building secure device-to-cloud data pipelines." },
      ],
      projects: [
        { title: "Smart Home Automation", technologies: "ESP32, MQTT", description: "Built a home-automation system controlling 15+ devices, **cutting energy usage by 25%** through smart scheduling and sensors." },
        { title: "Air Quality Monitor", technologies: "Arduino, LoRa", description: "Developed a long-range air-quality network covering **5+ km**, streaming live sensor data to a central dashboard." },
        { title: "Wearable Health Tracker", technologies: "STM32, BLE", description: "Created a wearable monitoring vitals with **7-day battery life** and reliable Bluetooth sync to a mobile app." },
      ],
      certifications: [
        { name: "Embedded Systems Bootcamp", organization: "DataCrumbs" },
        { name: "IoT Specialization", organization: "Coursera" },
        { name: "ARM Cortex-M Programming", organization: "Udemy" },
        { name: "AWS IoT Core", organization: "Amazon Web Services" },
      ],
      additional: {
        skills: "C, C++, Embedded C, ARM Cortex-M, Arduino, ESP32, STM32, RTOS, MQTT, BLE, LoRa, I2C/SPI/UART, PCB Basics, Sensor Integration, Git/GitHub",
        interests: "Building connected hardware and low-power systems, and tinkering with electronics and robotics projects",
      },
    },
  },
  {
    label: "Product Manager (Tech) (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 323 4567890",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://your-portfolio.com",
        githubLabel: "Portfolio",
        kaggle: "",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "IBA Karachi", degree: "Bachelor of Business Administration", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Associate Product Manager (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Defined product roadmaps and PRDs for 3 features, **increasing user activation by 28%** through data-informed prioritization.\nRan user research and A/B tests with 500+ users, **improving retention by 20%** by validating features before build.\nCoordinated cross-functional teams of engineers and designers, **shipping 5+ releases on schedule** with clear scope and success metrics.",
        },
      ],
      workshops: [
        { title: "Product Discovery & Roadmapping", description: "Trained in user research, opportunity sizing, and translating insights into a prioritized product roadmap." },
        { title: "Agile & Stakeholder Management", description: "Practiced backlog grooming, sprint planning, and communicating trade-offs to engineering and business stakeholders." },
      ],
      projects: [
        { title: "Onboarding Redesign", technologies: "Figma, Amplitude", description: "Led an onboarding revamp, **lifting activation by 32%** through funnel analysis and rapid iteration." },
        { title: "Feature Prioritization Framework", technologies: "RICE", description: "Built a scoring framework aligning 20+ features, **improving delivery focus and velocity by 25%**." },
        { title: "Product Analytics Dashboard", technologies: "Mixpanel", description: "Defined a product analytics dashboard spec, **enabling data-driven decisions** across the whole team." },
      ],
      certifications: [
        { name: "Product Management Bootcamp", organization: "DataCrumbs" },
        { name: "Google Project Management", organization: "Google" },
        { name: "Digital Product Management", organization: "Coursera" },
        { name: "Agile with Atlassian Jira", organization: "Atlassian" },
      ],
      additional: {
        skills: "Product Strategy, Roadmapping, User Research, A/B Testing, Agile/Scrum, PRDs, Wireframing (Figma), Analytics (Mixpanel, Amplitude), SQL, Stakeholder Management, Prioritization (RICE), Jira, Market Research, Data Analysis",
        interests: "Building products users love, and studying product strategy, UX, and growth",
      },
    },
  },
  {
    label: "Business Analyst (IT) (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 324 5678901",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "IBA Karachi", degree: "Bachelor of Business Administration (MIS)", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Business Analyst (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Gathered and documented requirements for 4 software projects, **reducing rework by 30%** through clear specs and stakeholder alignment.\nMapped and optimized business processes with BPMN, **improving operational efficiency by 25%** across departments.\nBuilt dashboards and analyzed data with SQL and Power BI, **surfacing insights that saved 15% in costs** for the operations team.",
        },
      ],
      workshops: [
        { title: "Requirements Gathering & Documentation", description: "Trained in stakeholder interviews, writing user stories, and producing clear functional specifications." },
        { title: "Process Mapping & BPMN", description: "Practiced modelling as-is and to-be workflows to identify automation and efficiency opportunities." },
      ],
      projects: [
        { title: "Process Automation Analysis", technologies: "BPMN, Visio", description: "Analyzed and redesigned a manual workflow, **cutting processing time by 40%** through targeted automation." },
        { title: "Requirements Traceability Matrix", technologies: "Jira, Confluence", description: "Built an RTM covering 200+ requirements, **improving delivery accuracy by 30%** and reducing scope creep." },
        { title: "Sales Insights Dashboard", technologies: "Power BI, SQL", description: "Delivered a dashboard tracking 20+ KPIs, **enabling faster decisions** across the sales team." },
      ],
      certifications: [
        { name: "Business Analysis Bootcamp", organization: "DataCrumbs" },
        { name: "ECBA (Entry Certificate in Business Analysis)", organization: "IIBA" },
        { name: "Agile Business Analysis", organization: "Coursera" },
        { name: "SQL for Business Analysts", organization: "Udemy" },
      ],
      additional: {
        skills: "Requirements Gathering, BPMN, User Stories, SQL, Power BI, Excel (Advanced), Process Modeling, Stakeholder Management, Agile/Scrum, Jira, Confluence, Gap Analysis, Data Analysis, Documentation",
        interests: "Bridging business and technology, and streamlining processes with data-driven analysis",
      },
    },
  },
  {
    label: "Technical Writer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 325 6789012",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://your-portfolio.com",
        githubLabel: "Portfolio",
        kaggle: "https://github.com/your-username",
        kaggleLabel: "GitHub",
      },
      education: [
        { institution: "University of Karachi", degree: "Bachelor of Arts in English (Linguistics)", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Technical Writer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Authored and maintained developer documentation for 5+ APIs, **reducing support tickets by 40%** through clear, example-driven guides.\nCreated tutorials, how-to guides, and release notes, **improving developer onboarding time by 35%**.\nCollaborated with engineers to document complex features, **raising docs satisfaction scores to 4.7/5** across users.",
        },
      ],
      workshops: [
        { title: "API Documentation Essentials", description: "Hands-on training in writing reference docs, quickstarts, and code samples using OpenAPI and Markdown." },
        { title: "Docs-as-Code Workflow", description: "Learned Git-based documentation pipelines, static site generators, and structured review workflows." },
      ],
      projects: [
        { title: "API Documentation Portal", technologies: "Docusaurus, Markdown", description: "Built a searchable docs site for 50+ endpoints, **cutting time-to-first-call by 45%** for developers." },
        { title: "Onboarding Guide Series", technologies: "GitBook", description: "Wrote a step-by-step onboarding series, **reducing setup errors by 30%** for new users." },
        { title: "Knowledge Base Revamp", technologies: "Notion, Zendesk", description: "Restructured a 100+ article knowledge base, **improving self-serve resolution by 50%**." },
      ],
      certifications: [
        { name: "Technical Writing Bootcamp", organization: "DataCrumbs" },
        { name: "Google Technical Writing", organization: "Google" },
        { name: "Technical Writing Specialization", organization: "Coursera" },
        { name: "API Documentation", organization: "Udemy" },
      ],
      additional: {
        skills: "Technical Writing, API Documentation, Markdown, Docusaurus, GitBook, Confluence, Git/GitHub, HTML/CSS, DITA, Content Strategy, Editing, Diagrams, Notion, Developer Experience",
        interests: "Making complex topics clear and accessible, and studying documentation and developer-experience best practices",
      },
    },
  },
  {
    label: "Network Engineer (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 326 7890123",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "FAST NUCES", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Network Engineer (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Configured and maintained routers, switches, and firewalls for a 200+ device network, **achieving 99.9% network uptime** across sites.\nImplemented VLANs, VPNs, and network segmentation, **reducing security incidents by 40%** and improving traffic isolation.\nMonitored and optimized network performance, **cutting average latency by 30%** through QoS tuning and capacity planning.",
        },
      ],
      workshops: [
        { title: "Routing & Switching Fundamentals", description: "Hands-on labs in VLANs, OSPF, BGP, and troubleshooting enterprise network topologies." },
        { title: "Network Security & Firewalls", description: "Trained in ACLs, VPN tunnels, and network segmentation for securing corporate infrastructure." },
      ],
      projects: [
        { title: "Enterprise Network Design", technologies: "Cisco Packet Tracer", description: "Designed a scalable multi-site network for 300+ users, **ensuring 99.9% reliability** with redundant links." },
        { title: "Network Monitoring Setup", technologies: "Nagios, PRTG", description: "Deployed monitoring and alerting, **reducing mean time to detect issues by 50%** across the infrastructure." },
        { title: "VPN & Firewall Config", technologies: "pfSense", description: "Configured secure site-to-site VPNs, **protecting 100% of remote traffic** with hardened firewall rules." },
      ],
      certifications: [
        { name: "Cisco CCNA", organization: "Cisco" },
        { name: "Networking Bootcamp", organization: "DataCrumbs" },
        { name: "CompTIA Network+", organization: "CompTIA" },
        { name: "AWS Networking Fundamentals", organization: "Amazon Web Services" },
      ],
      additional: {
        skills: "TCP/IP, Routing & Switching, Cisco IOS, VLANs, VPN, Firewalls (pfSense), DNS/DHCP, Subnetting, Network Security, Wireshark, QoS, Load Balancing, Linux, Network Monitoring, Git/GitHub",
        interests: "Designing reliable, secure networks, and exploring network automation and cloud networking",
      },
    },
  },
  {
    label: "Database Administrator (1 page)",
    data: {
      personalInfo: {
        fullName: "Zoya Siddiqui",
        phone: "+92 327 8901234",
        email: "your.email@example.com",
        linkedin: "https://linkedin.com/in/your-name",
        github: "https://github.com/your-username",
        githubLabel: "GitHub",
        kaggle: "https://kaggle.com/your-username",
        kaggleLabel: "Kaggle",
      },
      education: [
        { institution: "NED University", degree: "Bachelor of Science in Computer Science", start: "Jun 2022", end: "Jun 2026" },
        { institution: "Nixor College", degree: "A-Levels", start: "Jun 2020", end: "Jun 2022" },
      ],
      workExperience: [
        {
          company: "DataCrumbs",
          title: "Database Administrator (Intern)",
          start: "Nov 2024",
          end: "Dec 2024",
          bullets:
            "Administered and tuned PostgreSQL and MySQL databases, **improving query performance by 45%** through indexing and optimization.\nImplemented backup, replication, and disaster recovery, **achieving 99.99% data availability** with automated failover.\nHardened database security and access controls, **reducing unauthorized-access risks by 50%** through audits and role management.",
        },
      ],
      workshops: [
        { title: "Database Performance Tuning", description: "Hands-on training in indexing strategies, execution plan analysis, and query optimization." },
        { title: "Backup, Recovery & High Availability", description: "Practiced replication, failover clustering, and running disaster-recovery drills." },
      ],
      projects: [
        { title: "High-Availability Cluster", technologies: "PostgreSQL, Patroni", description: "Set up a replicated HA cluster, **achieving zero-downtime failover** during maintenance and outages." },
        { title: "Query Optimization Project", technologies: "SQL, EXPLAIN", description: "Tuned slow queries on a 5M-row database, **cutting report generation time by 60%**." },
        { title: "Automated Backup System", technologies: "Bash, cron", description: "Built automated, tested backups, **guaranteeing recovery within 15 minutes** of any failure." },
      ],
      certifications: [
        { name: "Oracle Database Administration", organization: "Oracle" },
        { name: "Database Administration Bootcamp", organization: "DataCrumbs" },
        { name: "PostgreSQL Certification", organization: "EDB" },
        { name: "Microsoft SQL Server (Azure)", organization: "Microsoft" },
      ],
      additional: {
        skills: "PostgreSQL, MySQL, Oracle, SQL Server, SQL, Query Optimization, Indexing, Replication, Backup & Recovery, Database Security, Performance Tuning, Linux, Bash, Monitoring, Git/GitHub",
        interests: "Keeping data fast, safe, and highly available, and exploring database internals and performance tuning",
      },
    },
  },
];

const splitLines = (s: string): string[] =>
  (s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const splitCsv = (s: string): string[] =>
  (s || '').split(',').map((x) => x.trim()).filter(Boolean);

/** Maps one LMS sample resume onto the prototype's ResumeData. The label's
 *  "(N page)" suffix becomes the job title; workshops (no prototype section)
 *  are dropped; cvType carries into the Professional/Student toggle. */
export function lmsSampleToResumeData(sample: LmsResumeSample): ResumeData {
  const cv = sample.data || {};
  const p = cv.personalInfo || {};
  const jobTitle = sample.label.replace(/\s*\(\d+\s*pages?\)\s*$/i, '').trim();
  return {
    personalInfo: {
      fullName: p.fullName || '',
      jobTitle,
      email: p.email || '',
      phone: p.phone || '',
      location: '',
      website: '',
      linkedin: p.linkedin || '',
      github: p.github || '',
      bio: '',
    },
    experiences: (cv.workExperience || []).map((w: any, i: number) => ({
      id: `exp-${i}`,
      company: w.company || '',
      role: w.title || '',
      location: '',
      startDate: w.start || '',
      endDate: w.end || '',
      current: false,
      bullets: splitLines(w.bullets),
    })),
    education: (cv.education || []).map((e: any, i: number) => ({
      id: `edu-${i}`,
      institution: e.institution || '',
      degree: e.degree || '',
      field: '',
      startDate: e.start || '',
      endDate: e.end || '',
    })),
    skills: splitCsv(cv.additional && cv.additional.skills),
    projects: (cv.projects || []).map((pr: any, i: number) => ({
      id: `proj-${i}`,
      title: pr.title || '',
      description: pr.description || '',
      technologies: splitCsv(pr.technologies),
    })),
    certifications: (cv.certifications || []).map((c: any) =>
      c.organization ? `${c.name} — ${c.organization}` : c.name,
    ),
    template: 'modern',
    accentColor: '#6366f1',
    resumeType: cv.cvType === 'student' ? 'student' : 'professional',
  };
}

// Keyword sets per field, keyed by the sample label with its "(N page/s)"
// suffix stripped — used to pick a starting template from a free-typed
// prompt (e.g. "build me a cybersecurity resume" -> Cyber Security), instead
// of always seeding the AI from the same fixed default field.
const FIELD_KEYWORDS: Record<string, string[]> = {
  'AI/ML Engineer': ['ai', 'ml', 'machine learning', 'artificial intelligence', 'deep learning', 'llm', 'nlp'],
  'Data Science': ['data scien'],
  'Full Stack Developer': ['full stack', 'full-stack', 'fullstack'],
  'Frontend Developer': ['frontend', 'front-end', 'front end', 'react developer', 'ui developer'],
  'Software Engineer': ['software engineer', 'swe'],
  'Data Analytics': ['data analy', 'data analyst', 'analytics'],
  'Cyber Security': ['cyber', 'security', 'infosec', 'pentest'],
  'Digital Marketing': ['marketing', 'seo', 'digital market'],
  'Data Engineer': ['data engineer', 'etl', 'data pipeline'],
  'DevOps Engineer': ['devops', 'ci/cd', 'site reliability', 'sre'],
  'Mobile App Developer': ['mobile', 'android', 'ios developer', 'flutter', 'react native', 'swift', 'kotlin'],
  'UI/UX Designer': ['ui/ux', 'ux design', 'ui design', 'user experience', 'user interface', 'figma'],
  'Graphic Designer': ['graphic design', 'illustrator', 'branding designer'],
  'Video Editor': ['video edit', 'premiere', 'after effects', 'video production'],
  'Backend Developer': ['backend', 'back-end', 'back end', 'server-side'],
  'Cloud Engineer': ['cloud engineer', 'cloud infrastructure', 'aws engineer', 'azure engineer', 'gcp engineer'],
  'QA / Test Automation': ['qa engineer', 'quality assurance', 'test automation', 'sdet'],
  'Game Developer': ['game dev', 'unity', 'unreal engine', 'game design'],
  'MLOps Engineer': ['mlops', 'ml ops', 'ml infrastructure', 'ml pipeline'],
  'Business Intelligence Analyst': ['business intelligence', 'bi analyst', 'power bi', 'tableau'],
  'Computer Vision Engineer': ['computer vision', 'cv engineer', 'image recognition', 'opencv'],
  'Blockchain / Web3 Developer': ['blockchain', 'web3', 'smart contract', 'solidity', 'crypto'],
  'Embedded / IoT Engineer': ['embedded', 'iot', 'firmware', 'microcontroller'],
  'Product Manager (Tech)': ['product manager', 'product management', 'tpm'],
  'Business Analyst (IT)': ['business analyst', 'requirements analyst'],
  'Technical Writer': ['technical writ', 'documentation specialist', 'tech writer'],
  'Network Engineer': ['network engineer', 'networking', 'ccna', 'cisco'],
  'Database Administrator': ['dba', 'database admin'],
};

/** Picks the LMS resume sample whose field keywords best match a free-typed
 *  prompt, falling back to the generic Software Engineer field when nothing
 *  matches (or that field is missing, the first sample overall). */
export function matchResumeSampleToPrompt(prompt: string): LmsResumeSample {
  const lower = prompt.toLowerCase();
  let best: LmsResumeSample | null = null;
  let bestScore = 0;

  for (const sample of LMS_RESUME_SAMPLES) {
    const field = sample.label.replace(/\s*\(\d+\s*pages?\)\s*$/i, '').trim();
    const keywords = FIELD_KEYWORDS[field];
    if (!keywords) continue;
    const score = keywords.reduce((n, kw) => (lower.includes(kw) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = sample;
    }
  }

  if (best) return best;
  return (
    LMS_RESUME_SAMPLES.find((s) => s.label.startsWith('Software Engineer')) ||
    LMS_RESUME_SAMPLES[0]
  );
}

// Single source of truth for a template's accent colour, cycled by its
// position in LMS_RESUME_SAMPLES — so the same template always gets the
// same colour everywhere it's shown (grid card, preview popup, Studio
// canvas) without threading the colour through props at every call site.
export const RESUME_TEMPLATE_ACCENTS = ['#dc2626', '#1e3a8a', '#059669', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#4338ca'];

export function getResumeAccentColor(sample?: { label: string } | null): string {
  const idx = sample ? LMS_RESUME_SAMPLES.findIndex((s) => s.label === sample.label) : -1;
  return RESUME_TEMPLATE_ACCENTS[(idx < 0 ? 0 : idx) % RESUME_TEMPLATE_ACCENTS.length];
}
