'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Printer, 
  Palette, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  User, 
  ExternalLink,
  ChevronRight,
  Wand2,
  Check,
  Globe,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './icons';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem } from '../types';

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  onAIRefine: (field: string, prompt?: string) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  onAIRefine
}) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'template'>('personal');
  // LMS-style layout switch: Student leads with Education, Professional with Work Experience.
  const isStudent = data.resumeType === 'student';
  const [copiedPDF, setCopiedPDF] = useState(false);

  // Update sub-objects cleanly
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "Tech Corp",
      role: "Software Engineer",
      location: "Remote",
      startDate: "2022",
      endDate: "Present",
      current: true,
      bullets: ["Architected microservices using React and Node.js.", "Improved test coverage to 95%."]
    };
    onChange({
      ...data,
      experiences: [newExp, ...data.experiences]
    });
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    onChange({
      ...data,
      experiences: data.experiences.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter(item => item.id !== id)
    });
  };

  const addSkill = (skill: string) => {
    if (!skill.trim() || data.skills.includes(skill.trim())) return;
    onChange({
      ...data,
      skills: [...data.skills, skill.trim()]
    });
  };

  const removeSkill = (skillToRemove: string) => {
    onChange({
      ...data,
      skills: data.skills.filter(s => s !== skillToRemove)
    });
  };

  const handlePrintPDF = () => {
    setCopiedPDF(true);
    setTimeout(() => setCopiedPDF(false), 2500);
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      
      {/* Left Form Controls & Section Tabs */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Editor Toolbar & Section Switches */}
        <div className="glass-panel p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between overflow-x-auto gap-1">
          <button
            onClick={() => setActiveSection('personal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeSection === 'personal'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Info</span>
          </button>

          <button
            onClick={() => setActiveSection('experience')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeSection === 'experience'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Work</span>
          </button>

          <button
            onClick={() => setActiveSection('skills')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeSection === 'skills'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Skills</span>
          </button>

          <button
            onClick={() => setActiveSection('education')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeSection === 'education'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education</span>
          </button>

          <button
            onClick={() => setActiveSection('template')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeSection === 'template'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>
        </div>

        {/* Section Form Editor */}
        <div className="glass-panel p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-210px)]">
          
          {/* PERSONAL INFO */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Personal Header</span>
                </h3>
                <button
                  onClick={() => onAIRefine('personal_bio')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Polish Bio</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Job Title</label>
                  <input
                    type="text"
                    value={data.personalInfo.jobTitle}
                    onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Phone</label>
                  <input
                    type="text"
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Location</label>
                  <input
                    type="text"
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">Website / Portfolio</label>
                  <input
                    type="text"
                    value={data.personalInfo.website}
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 block">Professional Summary / Bio</label>
                <textarea
                  rows={4}
                  value={data.personalInfo.bio}
                  onChange={(e) => updatePersonalInfo('bio', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none leading-relaxed"
                  placeholder="Write a compelling professional summary..."
                />
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeSection === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Work Experience</span>
                </h3>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {data.experiences.map((exp, index) => (
                <div key={exp.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Role #{index + 1}</span>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-slate-400 block">Achievement Bullets</label>
                      <button
                        onClick={() => onAIRefine('experience_bullets', exp.role)}
                        className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> AI Enhance Bullets
                      </button>
                    </div>
                    {exp.bullets.map((b, bIdx) => (
                      <input
                        key={bIdx}
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const newBullets = [...exp.bullets];
                          newBullets[bIdx] = e.target.value;
                          updateExperience(exp.id, 'bullets', newBullets);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg text-xs glass-input text-slate-200 mb-1.5"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SKILLS */}
          {activeSection === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Technical & Core Skills</span>
                </h3>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                  Add New Skill (Press Enter)
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addSkill(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input text-slate-100 focus:outline-none"
                  placeholder="e.g. Next.js, Python, System Design"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700 text-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION */}
          {activeSection === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>Education & Academics</span>
                </h3>
              </div>

              {data.education.map((edu) => (
                <div key={edu.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange({
                            ...data,
                            education: data.education.map(item => item.id === edu.id ? { ...item, institution: val } : item)
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange({
                            ...data,
                            education: data.education.map(item => item.id === edu.id ? { ...item, degree: val } : item)
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* THEME & TEMPLATE */}
          {activeSection === 'template' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>Resume Visual Styling</span>
                </h3>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-2 block">Choose Layout Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'modern', name: 'Modern Tech', desc: 'Clean header, skill chips, dark accent bar' },
                    { id: 'minimal', name: 'Minimal Corporate', desc: 'Classic single-column ATS benchmark' },
                    { id: 'executive', name: 'Executive Gold', desc: 'Bold typography & high-impact summaries' },
                    { id: 'creative', name: 'Creative Designer', desc: 'Vibrant indigo accents & compact tags' }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => onChange({ ...data, template: tpl.id as any })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        data.template === tpl.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{tpl.name}</div>
                      <div className="text-[10px] mt-1 text-slate-400">{tpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Studio Live Printable Preview */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        
        {/* Preview Control Bar */}
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 no-print">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Live Printable Document</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              A4 Format Standard
            </span>
          </div>

          {/* LMS-style "Resume type" toggle — switches the layout live. */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Type</span>
            <div className="flex items-center gap-0.5 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              {(['professional', 'student'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ ...data, resumeType: t })}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-colors ${
                    (data.resumeType ?? 'professional') === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            {copiedPDF ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
            <span>{copiedPDF ? 'Opening Print / PDF...' : 'Download PDF / Print'}</span>
          </button>
        </div>

        {/* The Live Document Paper Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center max-h-[calc(100vh-210px)]">
          <div
            id="resume-preview-area"
            className="w-full max-w-[800px] min-h-[1050px] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm text-sm font-sans flex flex-col justify-between"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {/* flex-col so the sections below can be reordered by CSS `order`
                depending on Professional vs Student, without moving markup. */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="border-b-2 border-indigo-600 pb-4 mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {data.personalInfo.fullName || 'Your Name'}
                </h1>
                <p className="text-sm font-semibold text-indigo-700 mt-1 uppercase tracking-wider">
                  {data.personalInfo.jobTitle || 'Professional Job Title'}
                </p>

                {/* Contact Line */}
                <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-600 mt-3 font-sans">
                  {data.personalInfo.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {data.personalInfo.email}
                    </span>
                  )}
                  {data.personalInfo.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {data.personalInfo.phone}
                    </span>
                  )}
                  {data.personalInfo.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {data.personalInfo.location}
                    </span>
                  )}
                  {data.personalInfo.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-500" />
                      {data.personalInfo.website}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio Summary */}
              {data.personalInfo.bio && (
                <div className="mb-6 order-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2 font-sans">
                    Executive Summary
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {data.personalInfo.bio}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              {data.experiences.length > 0 && (
                <div className={`mb-6 ${isStudent ? 'order-4' : 'order-2'}`}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3 font-sans">
                    Work Experience
                  </h2>
                  <div className="space-y-4">
                    {data.experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-sans">
                          <span className="font-bold text-sm text-slate-900">{exp.role}</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {exp.startDate} – {exp.endDate}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-indigo-800 mb-1 font-sans">
                          {exp.company} <span className="text-slate-400 font-normal">| {exp.location}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 text-xs text-slate-700 space-y-1 font-sans">
                          {exp.bullets.map((b, idx) => (
                            <li key={idx} className="leading-snug">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {data.skills.length > 0 && (
                <div className="mb-6 order-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2 font-sans">
                    Technical Expertise & Tools
                  </h2>
                  <div className="flex flex-wrap gap-1.5 font-sans text-xs text-slate-800">
                    {data.skills.map((skill, i) => (
                      <span key={i} className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded border border-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <div className={`mb-6 ${isStudent ? 'order-2' : 'order-4'}`}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2 font-sans">
                    Education
                  </h2>
                  {data.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-xs font-sans">
                      <div>
                        <span className="font-bold text-slate-900">{edu.degree}</span>
                        <span className="text-slate-600 font-normal"> – {edu.institution}</span>
                      </div>
                      <span className="text-slate-500 font-medium">{edu.startDate} – {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Footer */}
            <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 text-center font-sans">
              Generated with ProfileArchitect AI Career Builder
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
