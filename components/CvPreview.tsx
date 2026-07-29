'use client';

import React from 'react';
import { CvData, CvPersonalInfo } from '../lib/cvTypes';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <span className="shrink-0">•</span>
      <span className="flex-1 min-w-0">{children}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-[16px] font-bold tracking-wide uppercase mt-4 mb-1">{children}</h2>
      <hr className="border-t border-slate-800 mb-2" />
    </>
  );
}

/** Read-only rich text (renders stored HTML: <strong>/<em>/<u>). */
function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

interface BulletKeys {
  /** Enter → add a new bullet after this one (receives this bullet's html). */
  onEnter: (html: string) => void;
  /** Backspace on an empty bullet → remove it. */
  onBackspaceEmpty: () => void;
  /** Paste containing newlines → append the first line here, rest = new bullets. */
  onPasteLines: (html: string, lines: string[]) => void;
}

/**
 * Inline rich-text field. Content is HTML (so the Bold/Italic/Underline toolbar
 * formats visually). Paste is always inserted as CLEAN plain text (no source
 * styles). In bullets, Enter/Backspace/multiline-paste add & remove points.
 * Commits innerHTML on blur only, so it never re-renders mid-edit.
 */
function RichText({
  html,
  onCommit,
  className,
  placeholder,
  block,
  bullet,
}: {
  html: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
  block?: boolean;
  bullet?: BulletKeys;
}) {
  const Tag = (block ? 'div' : 'span') as 'div';
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      data-ph={placeholder}
      dangerouslySetInnerHTML={{ __html: html || '' }}
      className={`${className || ''} outline-none rounded-sm hover:bg-slate-50/60 cursor-text empty:before:content-[attr(data-ph)] empty:before:text-slate-300`}
      onKeyDown={(e) => {
        if (!bullet) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          bullet.onEnter(e.currentTarget.innerHTML);
        } else if (e.key === 'Backspace' && (e.currentTarget.textContent ?? '') === '') {
          e.preventDefault();
          bullet.onBackspaceEmpty();
        }
      }}
      onPaste={(e) => {
        const text = e.clipboardData.getData('text/plain');
        if (bullet && text.includes('\n')) {
          e.preventDefault();
          const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
          bullet.onPasteLines(e.currentTarget.innerHTML, lines);
        } else {
          // Clean plain-text paste for every field (no pasted source styling).
          e.preventDefault();
          document.execCommand('insertText', false, text);
        }
      }}
      onBlur={(e) => {
        const v = e.currentTarget.innerHTML;
        if (v !== html) onCommit(v);
      }}
    />
  );
}

function CvPreviewBase({
  data,
  onChange,
}: {
  data: CvData;
  onChange?: (cv: CvData) => void;
}) {
  const editable = !!onChange;
  const commit = (cv: CvData) => onChange?.(cv);

  const setPersonal = (patch: Partial<CvPersonalInfo>) =>
    commit({ ...data, personalInfo: { ...data.personalInfo, ...patch } });
  const setEdu = (i: number, patch: Partial<CvData['education'][number]>) =>
    commit({ ...data, education: data.education.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const setWork = (i: number, patch: Partial<CvData['workExperience'][number]>) =>
    commit({ ...data, workExperience: data.workExperience.map((w, j) => (j === i ? { ...w, ...patch } : w)) });
  const setProj = (i: number, patch: Partial<CvData['projects'][number]>) =>
    commit({ ...data, projects: data.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const setWs = (i: number, patch: Partial<NonNullable<CvData['workshops']>[number]>) =>
    commit({ ...data, workshops: (data.workshops ?? []).map((w, j) => (j === i ? { ...w, ...patch } : w)) });
  const setCert = (i: number, patch: Partial<CvData['certifications'][number]>) =>
    commit({ ...data, certifications: data.certifications.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const setAdditional = (patch: Partial<CvData['additional']>) =>
    commit({ ...data, additional: { ...data.additional, ...patch } });

  // Bullet editing (editable mode renders ALL lines incl. empty, so line index
  // == raw index — Enter/Backspace/paste act directly on the "\n"-joined list).
  const setBulletLine = (wi: number, li: number, v: string) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    lines[li] = v;
    setWork(wi, { bullets: lines.join('\n') });
  };
  const bulletEnter = (wi: number, li: number, html: string) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    lines[li] = html;
    lines.splice(li + 1, 0, '');
    setWork(wi, { bullets: lines.join('\n') });
  };
  const bulletBackspace = (wi: number, li: number) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    if (lines.length <= 1) return;
    lines.splice(li, 1);
    setWork(wi, { bullets: lines.join('\n') });
  };
  const bulletPaste = (wi: number, li: number, html: string, pasted: string[]) => {
    const lines = data.workExperience[wi].bullets.split('\n');
    lines[li] = html + (pasted[0] ?? '');
    lines.splice(li + 1, 0, ...pasted.slice(1));
    setWork(wi, { bullets: lines.join('\n') });
  };
  const keysFor = (wi: number, li: number): BulletKeys => ({
    onEnter: (h) => bulletEnter(wi, li, h),
    onBackspaceEmpty: () => bulletBackspace(wi, li),
    onPasteLines: (h, lines) => bulletPaste(wi, li, h, lines),
  });

  const isStudent = data.cvType === 'student';

  const eduList = editable ? data.education : data.education.filter((e) => e.institution || e.degree);
  const workList = editable ? data.workExperience : data.workExperience.filter((w) => w.company || w.title || w.bullets);
  const workshopList = editable ? (data.workshops ?? []) : (data.workshops ?? []).filter((w) => w.title || w.description);
  const projectList = editable ? data.projects : data.projects.filter((p) => p.title || p.description);
  const certList = editable ? data.certifications : data.certifications.filter((c) => c.name || c.organization);
  const hasAdditional = editable || data.additional.skills || data.additional.interests;

  const certRows: CvData['certifications'][] = [];
  for (let i = 0; i < certList.length; i += 2) certRows.push(certList.slice(i, i + 2));

  const p = data.personalInfo;

  return (
    <div className="bg-white text-slate-900 p-8 text-[17px] leading-snug font-serif">
      {/* Header */}
      <div data-cv-block>
        <h1 className="text-[40px] font-bold tracking-wide text-center">
          {editable ? <RichText html={p.fullName} placeholder="YOUR NAME" onCommit={(v) => setPersonal({ fullName: v })} /> : <Html html={p.fullName || 'YOUR NAME'} />}
        </h1>
        <div className="grid grid-cols-3 items-center text-[16px] mt-1 text-slate-700">
          <div className="text-left">
            {editable ? <RichText html={p.phone} placeholder="Phone" onCommit={(v) => setPersonal({ phone: v })} /> : <Html html={p.phone} />}
          </div>
          <div className="flex flex-wrap justify-center gap-x-3">
            {p.linkedin && (
              <a href={normalizeUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                {p.linkedinLabel || 'Linkedin'}
              </a>
            )}
            {p.github && (
              <a href={normalizeUrl(p.github)} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                {p.githubLabel || 'GitHub'}
              </a>
            )}
            {p.kaggle && (
              <a href={normalizeUrl(p.kaggle)} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                {p.kaggleLabel || 'Kaggle'}
              </a>
            )}
          </div>
          <div className="text-right text-blue-700 underline">
            {editable ? (
              <RichText html={p.email} placeholder="email@example.com" onCommit={(v) => setPersonal({ email: v })} />
            ) : (
              p.email && (
                <a href={`mailto:${p.email}`} className="text-blue-700 underline">
                  {p.email}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {(editable || eduList.length > 0) && (
        <section>
          {eduList.map((edu, pos) => {
            const i = data.education.indexOf(edu);
            return (
              <div key={i} data-cv-block className="mb-1.5">
                {pos === 0 && <SectionHeading>Education</SectionHeading>}
                <div className="flex justify-between items-baseline gap-3">
                  <span className="font-bold">
                    {editable ? <RichText html={edu.institution} placeholder="Institution" onCommit={(v) => setEdu(i, { institution: v })} /> : <Html html={edu.institution} />}
                  </span>
                  <span className="text-slate-600 text-[16px] shrink-0 whitespace-nowrap">
                    {editable ? (
                      <>
                        <RichText html={edu.start} placeholder="Start" onCommit={(v) => setEdu(i, { start: v })} /> -{' '}
                        <RichText html={edu.end} placeholder="End" onCommit={(v) => setEdu(i, { end: v })} />
                      </>
                    ) : (
                      (edu.start || edu.end) && <>{edu.start} - {edu.end}</>
                    )}
                  </span>
                </div>
                {editable ? <RichText block html={edu.degree} placeholder="Degree" onCommit={(v) => setEdu(i, { degree: v })} /> : edu.degree && <div><Html html={edu.degree} /></div>}
              </div>
            );
          })}
        </section>
      )}

      {/* Work Experience — professional layout only. */}
      {!isStudent && (editable || workList.length > 0) && (
        <section>
          {workList.map((job, pos) => {
            const i = data.workExperience.indexOf(job);
            const lines = editable ? job.bullets.split('\n') : job.bullets.split('\n').filter((l) => l.trim());
            return (
              <div key={i} data-cv-block className="mb-2">
                {pos === 0 && <SectionHeading>Work Experience</SectionHeading>}
                <div className="flex justify-between items-baseline gap-3">
                  <span className="font-bold">
                    {editable ? (
                      <>
                        <RichText html={job.company} placeholder="Company" onCommit={(v) => setWork(i, { company: v })} />
                        {' – '}
                        <RichText html={job.title} placeholder="Title" onCommit={(v) => setWork(i, { title: v })} />
                      </>
                    ) : (
                      <>
                        <Html html={job.company} />
                        {job.company && job.title ? ' – ' : ''}
                        <Html html={job.title} />
                      </>
                    )}
                  </span>
                  <span className="text-slate-600 text-[16px] shrink-0 whitespace-nowrap">
                    {editable ? (
                      <>
                        <RichText html={job.start} placeholder="Start" onCommit={(v) => setWork(i, { start: v })} />
                        {'- '}
                        <RichText html={job.end} placeholder="End" onCommit={(v) => setWork(i, { end: v })} />
                      </>
                    ) : (
                      (job.start || job.end) && <>{job.start}- {job.end}</>
                    )}
                  </span>
                </div>
                {lines.length > 0 && (
                  <div className="mt-0.5 space-y-0.5">
                    {lines.map((line, j) => (
                      <Bullet key={j}>
                        {editable ? <RichText block html={line} placeholder="Bullet point" onCommit={(v) => setBulletLine(i, j, v)} bullet={keysFor(i, j)} /> : <Html html={line} />}
                      </Bullet>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {(editable || projectList.length > 0) && (
        <section>
          {projectList.map((proj, pos) => {
            const i = data.projects.indexOf(proj);
            return (
              <div key={i} data-cv-block className="mb-1">
                {pos === 0 && <SectionHeading>Projects</SectionHeading>}
                <Bullet>
                  {editable ? (
                    <>
                      <RichText html={proj.title} placeholder="Project" onCommit={(v) => setProj(i, { title: v })} className="font-bold" />
                      {' ('}
                      <RichText html={proj.technologies} placeholder="Tech" onCommit={(v) => setProj(i, { technologies: v })} />
                      {') – '}
                      <RichText html={proj.description} placeholder="Description" onCommit={(v) => setProj(i, { description: v })} />
                    </>
                  ) : (
                    <>
                      <span className="font-bold"><Html html={proj.title} /></span>
                      {proj.technologies && <span> (<Html html={proj.technologies} />)</span>}
                      {proj.description && <span> – <Html html={proj.description} /></span>}
                    </>
                  )}
                </Bullet>
              </div>
            );
          })}
        </section>
      )}

      {/* Workshops — student layout only, right after Projects. */}
      {isStudent && (editable || workshopList.length > 0) && (
        <section>
          {workshopList.map((ws, pos) => {
            const i = (data.workshops ?? []).indexOf(ws);
            return (
              <div key={i} data-cv-block className="mb-1">
                {pos === 0 && <SectionHeading>Workshops</SectionHeading>}
                <Bullet>
                  {editable ? (
                    <>
                      <RichText html={ws.title} placeholder="Workshop" onCommit={(v) => setWs(i, { title: v })} className="font-bold" />
                      {': '}
                      <RichText html={ws.description} placeholder="Description" onCommit={(v) => setWs(i, { description: v })} />
                    </>
                  ) : (
                    <>
                      <span className="font-bold"><Html html={ws.title} /></span>
                      {ws.description && <span>: <Html html={ws.description} /></span>}
                    </>
                  )}
                </Bullet>
              </div>
            );
          })}
        </section>
      )}

      {(editable || certRows.length > 0) && (
        <section>
          {certRows.map((row, ri) => (
            <div key={ri} data-cv-block>
              {ri === 0 && <SectionHeading>Professional Certifications</SectionHeading>}
              <div className="grid grid-cols-2 gap-x-4 mb-1">
                {row.map((cert) => {
                  const i = data.certifications.indexOf(cert);
                  return (
                    <div key={i}>
                      <div className="font-bold">
                        {editable ? <RichText html={cert.name} placeholder="Certification" onCommit={(v) => setCert(i, { name: v })} /> : <Html html={cert.name} />}
                      </div>
                      {editable ? (
                        <div className="text-slate-600">(<RichText html={cert.organization} placeholder="Organization" onCommit={(v) => setCert(i, { organization: v })} />)</div>
                      ) : (
                        cert.organization && <div className="text-slate-600">(<Html html={cert.organization} />)</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {hasAdditional && (
        <section>
          <div data-cv-block>
            <SectionHeading>Additional</SectionHeading>
            <div className="space-y-0.5">
              <Bullet>
                <span className="font-bold">Technical Skills:</span>{' '}
                {editable ? <RichText html={data.additional.skills} placeholder="Skills…" onCommit={(v) => setAdditional({ skills: v })} /> : <Html html={data.additional.skills} />}
              </Bullet>
              {(editable || data.additional.interests) && (
                <Bullet>
                  <span className="font-bold">Interests:</span>{' '}
                  {editable ? <RichText html={data.additional.interests} placeholder="Interests…" onCommit={(v) => setAdditional({ interests: v })} /> : <Html html={data.additional.interests} />}
                </Bullet>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Memoized so the Studio's toolbar-state changes (on caret move) never
// re-render / reset the editable resume — only real data changes do.
export const CvPreview = React.memo(CvPreviewBase);
