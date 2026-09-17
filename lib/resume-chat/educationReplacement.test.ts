import { describe, it, expect } from 'bun:test';
import { applyJsonPatches } from '../jsonPatch';
import type { CvData } from '../cvTypes';

interface EduEntry {
  institution: string;
  degree: string;
  start?: string;
  end?: string;
}

// ── Post-processing guardrails mirroring route.ts logic ───────────────────────

function applyNegationRemoval(education: EduEntry[], message: string): EduEntry[] {
  const targetQuery = message
    .replace(/\b(?:please\s+)?(?:remove|delete|drop|clear|strip|hide|take\s+out|eliminate)\s+(?:the\s+)?/i, '')
    .replace(/\b(?:i\s+(?:have\s+not|haven'?t|did\s+not|didn'?t|do\s+not|don'?t|never)\s+(?:done|had|taken|got|have|completed)|no|without)\s+(?:the\s+)?/i, '')
    .replace(/\b(?:from\s+my\s+resume|from\s+resume|from\s+education|from\s+projects|from\s+experience|from\s+certifications|section|entirely|completely|entry|item)\b/gi, '')
    .trim();

  let matchIdx = education.findIndex(e =>
    /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|a[- ]?level|o[- ]?level|hsc|ssc|matric|fsc|nixor)\b/i.test(`${e.institution} ${e.degree}`)
  );
  if (matchIdx === -1 && education.length > 1) {
    matchIdx = 1;
  }

  if (matchIdx !== -1) {
    return education.filter((_, i) => i !== matchIdx);
  }
  return education;
}

function consolidateSecondaryTier(education: EduEntry[], userMsg: string): EduEntry[] {
  let cleanEducation = [...education];
  const lastMsgLower = userMsg.toLowerCase();

  const isSecondaryEduEntry = (e: EduEntry) =>
    /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|a[- ]?levels?|o[- ]?levels?|fsc|matric|nixor|premier)\b/i.test(
      `${e.institution || ''} ${e.degree || ''}`
    );
  const isTemplateCollegeEntry = (e: EduEntry) =>
    /\b(nixor\s+college|nixor|state\s+college\s+preparatory|your\s+college|college\s+name)\b/i.test(
      `${e.institution || ''}`
    );

  const isNegationOfSecondary = /\b(?:have\s+not|haven'?t|did\s+not|didn'?t|do\s+not|don'?t|never|no|without)\s+(?:done\s+)?(?:a[- ]?levels?|intermediate|internmediate|college|fsc)\b/i.test(lastMsgLower);
  if (isNegationOfSecondary) {
    cleanEducation = cleanEducation.filter(e => {
      if (/\ba[- ]?levels?\b/i.test(lastMsgLower) && /\ba[- ]?levels?\b/i.test(`${e.degree || ''} ${e.institution || ''}`)) return false;
      if (/\bintermediate\b/i.test(lastMsgLower) && /\bintermediate\b/i.test(`${e.degree || ''} ${e.institution || ''}`)) return false;
      if (isTemplateCollegeEntry(e)) return false;
      return true;
    });
  } else {
    const secondaryEntries = cleanEducation.filter(isSecondaryEduEntry);
    if (secondaryEntries.length > 1) {
      const hasRealCollege = secondaryEntries.some(e => !isTemplateCollegeEntry(e));
      if (hasRealCollege) {
        cleanEducation = cleanEducation.filter(e => !isTemplateCollegeEntry(e));
      }
    }
  }
  return cleanEducation;
}

// ── Test Suite ───────────────────────────────────────────────────────────────

describe('Resume Chat - Education & College Replacement (JSON Patch & Guardrails)', () => {
  const initialCv: CvData = {
    summary: 'Software Engineer',
    personalInfo: { fullName: 'Ali Khan', email: 'ali@example.com', phone: '123' },
    education: [
      { institution: 'Indus University', degree: 'Bachelor of Science in Artificial Intelligence', start: 'Jul 2022', end: 'Jun 2026' },
      { institution: 'Nixor College', degree: 'A-Levels', start: 'Jun 2020', end: 'Jun 2022' },
    ],
    workExperience: [],
    workshops: [],
    projects: [],
    certifications: [],
    additional: { skills: 'TypeScript', interests: 'AI' },
  };

  describe('RFC 6902 JSON Patch Education Operations', () => {
    it('replaces secondary education institution cleanly via patch (e.g. DJ not SMI)', () => {
      const patches = [
        { op: 'replace', path: '/education/1/institution', value: 'DJ' },
      ];
      const result = applyJsonPatches(initialCv, patches);
      expect(result.success).toBe(true);
      const updated = result.document as CvData;
      expect(updated.education[1].institution).toBe('DJ');
      expect(updated.education[1].degree).toBe('A-Levels');
      expect(updated.education[0].institution).toBe('Indus University');
    });

    it('replaces entire secondary education tier via patch with new institution and degree', () => {
      const patches = [
        {
          op: 'replace',
          path: '/education/1',
          value: {
            institution: 'DJ Science',
            degree: 'Intermediate in Engineering',
            start: 'Jun 2018',
            end: 'Jun 2020',
            location: 'Karachi, Pakistan',
          },
        },
      ];
      const result = applyJsonPatches(initialCv, patches);
      expect(result.success).toBe(true);
      const updated = result.document as CvData;
      expect(updated.education.length).toBe(2);
      expect(updated.education[1].institution).toBe('DJ Science');
      expect(updated.education[1].degree).toBe('Intermediate in Engineering');
      expect(updated.education[0].institution).toBe('Indus University');
    });

    it('removes secondary education entry cleanly via patch on negation (no a-levels)', () => {
      const patches = [
        { op: 'remove', path: '/education/1' },
      ];
      const result = applyJsonPatches(initialCv, patches);
      expect(result.success).toBe(true);
      const updated = result.document as CvData;
      expect(updated.education.length).toBe(1);
      expect(updated.education[0].institution).toBe('Indus University');
    });

    it('adds a university education at index 0 without clobbering college at index 1', () => {
      const cvWithCollegeOnly: CvData = {
        ...initialCv,
        education: [{ institution: 'DJ Science', degree: 'Intermediate', start: '2018', end: '2020' }],
      };
      const patches = [
        {
          op: 'add',
          path: '/education/0',
          value: {
            institution: 'NED University',
            degree: 'B.E. in Computer Science',
            start: '2020',
            end: '2024',
          },
        },
      ];
      const result = applyJsonPatches(cvWithCollegeOnly, patches);
      expect(result.success).toBe(true);
      const updated = result.document as CvData;
      expect(updated.education.length).toBe(2);
      expect(updated.education[0].institution).toBe('NED University');
      expect(updated.education[1].institution).toBe('DJ Science');
    });
  });

  describe('Negation & Removal Handling', () => {
    it('removes Nixor College when user says "i have not done a-levels"', () => {
      const result = applyNegationRemoval(initialCv.education, 'i have not done a-levels');
      expect(result.length).toBe(1);
      expect(result[0].institution).toBe('Indus University');
      expect(result.some(e => e.institution === 'Nixor College')).toBe(false);
    });

    it('removes Nixor College when user says "no a-levels"', () => {
      const result = applyNegationRemoval(initialCv.education, 'no a-levels');
      expect(result.length).toBe(1);
      expect(result[0].institution).toBe('Indus University');
      expect(result.some(e => e.institution === 'Nixor College')).toBe(false);
    });
  });

  describe('Post-Processing Secondary Tier Deduplication', () => {
    it('purges Nixor College when LLM inadvertently leaves both DJ Science and Nixor College', () => {
      const dualSecondaryEdu: EduEntry[] = [
        { institution: 'Indus University', degree: 'Bachelor of Science in Artificial Intelligence' },
        { institution: 'DJ Science', degree: 'Intermediate in Engineering' },
        { institution: 'Nixor College', degree: 'A-Levels' },
      ];
      const consolidated = consolidateSecondaryTier(dualSecondaryEdu, 'i haev done intermediate in engineering from DJ Science');
      expect(consolidated.length).toBe(2);
      expect(consolidated[0].institution).toBe('Indus University');
      expect(consolidated[1].institution).toBe('DJ Science');
      expect(consolidated.some(e => e.institution === 'Nixor College')).toBe(false);
    });

    it('purges Nixor College when LLM inadvertently leaves both Beaconhouse and Nixor College', () => {
      const dualSecondaryEdu: EduEntry[] = [
        { institution: 'Indus University', degree: 'Bachelor of Science in Artificial Intelligence' },
        { institution: 'Nixor College', degree: 'A-Levels' },
        { institution: 'Beaconhouse', degree: 'Intermediate' },
      ];
      const consolidated = consolidateSecondaryTier(dualSecondaryEdu, 'i have done intermediate from Beaconhouse');
      expect(consolidated.length).toBe(2);
      expect(consolidated[0].institution).toBe('Indus University');
      expect(consolidated[1].institution).toBe('Beaconhouse');
      expect(consolidated.some(e => e.institution === 'Nixor College')).toBe(false);
    });

    it('removes secondary entries on post-processing negation prompt "i have not done a-levels"', () => {
      const consolidated = consolidateSecondaryTier(initialCv.education, 'i have not done a-levels');
      expect(consolidated.length).toBe(1);
      expect(consolidated[0].institution).toBe('Indus University');
      expect(consolidated.some(e => e.institution === 'Nixor College')).toBe(false);
    });
  });

  describe('Conversational Date & Tenure Updates', () => {
    function isDateTenureUpdate(msgLower: string): boolean {
      const hasYearNumbers = /\b(19\d\d|20\d\d)\b/.test(msgLower);
      const hasDateKeywords = /\b(dates?|tenure|duration|timeline|period|years?)\b/i.test(msgLower);
      const hasStartEndVerbs = /\b(started|start|began|enrolled|joined|completed|complete|ended|end|finished|graduated|passed)\b/i.test(msgLower);
      const hasRangeHyphen = /\b(19\d\d|20\d\d)\s*(?:-|–|—|to|until)\s*(?:19\d\d|20\d\d|present|current)\b/i.test(msgLower);

      return (hasDateKeywords || hasRangeHyphen || (hasStartEndVerbs && hasYearNumbers));
    }

    function parseDates(message: string): { newStart: string; newEnd: string } {
      let newStart = '';
      let newEnd = '';

      const MONTH_NAME = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
      const DATE_STR = `(?:${MONTH_NAME}\\s+)?\\d{4}`;
      const DATE_END_STR = `(?:${MONTH_NAME}\\s+)?(?:\\d{4}|present|current)`;
      const DATE_RANGE_RE = new RegExp(`\\b(${DATE_STR})\\s*(?:-|–|—|to|until)\\s*(${DATE_END_STR})\\b`, 'i');

      const endStartMatch = message.match(
        new RegExp(`\\b(?:completed|ended|finished|graduated|passed)\\b.*?\\b(?:in|on|at)?\\s*\\b(${DATE_STR})\\b.*?\\b(?:started|began|enrolled|joined)\\b.*?\\b(?:in|on|at)?\\s*\\b(${DATE_STR})\\b`, 'i')
      );
      const startEndMatch = message.match(
        new RegExp(`\\b(?:started|began|enrolled|joined)\\b.*?\\b(?:in|on|at)?\\s*\\b(${DATE_STR})\\b.*?\\b(?:completed|ended|finished|graduated|passed|to|until)\\b.*?\\b(?:in|on|at)?\\s*\\b(${DATE_END_STR})\\b`, 'i')
      );
      const dateRangeMatch = message.match(DATE_RANGE_RE);

      if (endStartMatch) {
        newEnd = endStartMatch[1].trim();
        newStart = endStartMatch[2].trim();
      } else if (startEndMatch) {
        newStart = startEndMatch[1].trim();
        newEnd = startEndMatch[2].trim();
      } else if (dateRangeMatch) {
        newStart = dateRangeMatch[1].trim();
        newEnd = dateRangeMatch[2].trim();
      } else {
        const allYears = Array.from(message.matchAll(/\b(19\d\d|20\d\d)\b/g)).map((m) => m[1]);
        if (allYears.length >= 2) {
          const y1 = parseInt(allYears[0], 10);
          const y2 = parseInt(allYears[1], 10);
          if (y1 < y2) {
            newStart = String(y1);
            newEnd = String(y2);
          } else {
            newStart = String(y2);
            newEnd = String(y1);
          }
        }
      }

      return { newStart, newEnd };
    }

    function applyDateUpdate(education: EduEntry[], message: string): EduEntry[] {
      const { newStart, newEnd } = parseDates(message);
      const currentEdu = [...education];
      const targetIdx = currentEdu.findIndex(e =>
        /\b(college|intermediate|internmediate|school|diploma|a[- ]?level|o[- ]?level|fsc|matric|smi|dj)\b/i.test(`${e.institution} ${e.degree}`)
      );

      if (targetIdx !== -1 && newStart && newEnd) {
        const formatWithExistingMonth = (newVal: string, oldVal?: string): string => {
          if (/^[A-Za-z]{3,9}\s+\d{4}$/i.test(newVal)) return newVal;
          if (/^\d{4}$/.test(newVal) && oldVal) {
            const mMatch = oldVal.match(/^([A-Za-z]{3,9})\s+\d{4}$/);
            if (mMatch) {
              return `${mMatch[1]} ${newVal}`;
            }
          }
          return newVal;
        };

        currentEdu[targetIdx] = {
          ...currentEdu[targetIdx],
          start: formatWithExistingMonth(newStart, currentEdu[targetIdx].start),
          end: formatWithExistingMonth(newEnd, currentEdu[targetIdx].end),
        };
      }
      return currentEdu;
    }

    it('identifies "i completed intermediate on 2022 and started 2020" as date tenure update', () => {
      expect(isDateTenureUpdate('i completed intermediate on 2022 and started 2020')).toBe(true);
    });

    it('parses start and end years when end is mentioned first', () => {
      const { newStart, newEnd } = parseDates('i completed intermediate on 2022 and started 2020');
      expect(newStart).toBe('2020');
      expect(newEnd).toBe('2022');
    });

    it('parses start and end years when start is mentioned first', () => {
      const { newStart, newEnd } = parseDates('started in 2020 and completed 2022');
      expect(newStart).toBe('2020');
      expect(newEnd).toBe('2022');
    });

    it('parses start and end years from hyphen range "2020 - 2022"', () => {
      const { newStart, newEnd } = parseDates('intermediate duration 2020 - 2022');
      expect(newStart).toBe('2020');
      expect(newEnd).toBe('2022');
    });

    it('updates intermediate dates while keeping institution "SMI" completely intact', () => {
      const eduWithSMI: EduEntry[] = [
        { institution: 'Indus University', degree: 'Bachelor of Science in Artificial Intelligence', start: 'Jul 2022', end: 'Jun 2026' },
        { institution: 'SMI', degree: 'Intermediate', start: 'Jun 2018', end: 'Jun 2020' },
      ];

      const result = applyDateUpdate(eduWithSMI, 'i completed intermediate on 2022 and started 2020');
      expect(result.length).toBe(2);
      expect(result[1].institution).toBe('SMI');
      expect(result[1].degree).toBe('Intermediate');
      expect(result[1].start).toBe('Jun 2020');
      expect(result[1].end).toBe('Jun 2022');
      expect(result[1].institution.includes('2022')).toBe(false);
      expect(result[1].institution.includes('Started')).toBe(false);
    });
  });
});
