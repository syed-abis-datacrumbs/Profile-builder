import { describe, it, expect } from 'bun:test';
import { getSystemPrompt, getDefaultStudentWorkshops } from '@/app/api/resume-chat/route';

describe('Student Resume Workshops & System Prompt Invariants', () => {
  it('generates a student-specific system prompt with workExperience: [] schema', () => {
    const studentPrompt = getSystemPrompt('student');
    expect(studentPrompt).toContain('"workExperience": []');
    expect(studentPrompt).toContain('"workshops": [');
    expect(studentPrompt).toContain('THIS RESUME IS FOR A STUDENT');
    expect(studentPrompt).toContain('workExperience" MUST ALWAYS BE AN EMPTY ARRAY');
    expect(studentPrompt).toContain('workshops" MUST ALWAYS BE POPULATED WITH 2 TO 3 HIGH-IMPACT');
  });

  it('generates a professional-specific system prompt with workshops: [] schema', () => {
    const profPrompt = getSystemPrompt('professional');
    expect(profPrompt).toContain('"workshops": []');
    expect(profPrompt).toContain('"workExperience": [');
    expect(profPrompt).toContain('RULES FOR PROFESSIONAL RESUMES');
  });

  it('provides rich digital marketing workshops when prompted with marketing/ads context', () => {
    const marketingWorkshops = getDefaultStudentWorkshops('make a cv for digital marketer with meta and google ads');
    expect(marketingWorkshops.length).toBeGreaterThanOrEqual(2);
    const text = marketingWorkshops.map((w) => w.content).join(' ');
    expect(text.toLowerCase()).toContain('marketing');
    expect(text.toLowerCase()).toContain('performance marketing');
    expect(text.toLowerCase()).toContain('seo');
  });

  it('provides rich AI workshops when prompted with AI / ML context', () => {
    const aiWorkshops = getDefaultStudentWorkshops('make cv for AI Engineer machine learning');
    expect(aiWorkshops.length).toBeGreaterThanOrEqual(2);
    const text = aiWorkshops.map((w) => w.content).join(' ');
    expect(text.toLowerCase()).toContain('ai');
    expect(text.toLowerCase()).toContain('prompt engineering');
  });

  it('provides rich software engineering workshops when prompted with full-stack context', () => {
    const softwareWorkshops = getDefaultStudentWorkshops('make cv for full stack software developer');
    expect(softwareWorkshops.length).toBeGreaterThanOrEqual(2);
    const text = softwareWorkshops.map((w) => w.content).join(' ');
    expect(text.toLowerCase()).toContain('full-stack');
    expect(text.toLowerCase()).toContain('frontend');
  });

  it('provides finance workshops for finance context', () => {
    const financeWorkshops = getDefaultStudentWorkshops('financial analyst and accounting student');
    expect(financeWorkshops.length).toBeGreaterThanOrEqual(2);
    const text = financeWorkshops.map((w) => w.content).join(' ');
    expect(text.toLowerCase()).toContain('financial');
  });
});
