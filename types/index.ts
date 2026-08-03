export type ActiveTab = 'resume' | 'github' | 'linkedin' | 'jobhunting' | 'freelancing' | 'interview' | 'assistant';

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatarUrl?: string;
  bio: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  githubUrl?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: string[];
  template: 'modern' | 'minimal' | 'executive' | 'creative';
  accentColor: string;
  /** LMS-style layout switch. Professional leads with Work Experience; Student
   *  leads with Education. Optional for back-compat (absent = professional). */
  resumeType?: 'professional' | 'student';
}

export interface GithubProfileData {
  username: string;
  title: string;
  about: string;
  /** Full-width cover/banner image URL displayed at the top of the README. */
  bannerUrl?: string;
  /** Profile picture URL shown overlapping the banner (LinkedIn-style). Preview-only — not part of the README. */
  avatarUrl?: string;
  techStack: string[];
  showStatsCard: boolean;
  showStreakCard: boolean;
  showTopLangsCard: boolean;
  theme: 'dark' | 'tokyonight' | 'radial' | 'dracula' | 'cyberpunk';
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    email?: string;
    website?: string;
  };
  customSections: { title: string; content: string }[];
}

export interface LinkedinProfileData {
  headline: string;
  about: string;
  industry: string;
  targetRole: string;
  experienceHighlights: string[];
  keySkills: string[];
  featuredPost: string;
  openToWork: boolean;
}

export interface SavedProfile {
  id: string;
  name: string;
  updatedAt: string;
  resume: ResumeData;
  github: GithubProfileData;
  linkedin: LinkedinProfileData;
}
