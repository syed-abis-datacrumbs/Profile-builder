import { describe, it, expect } from 'bun:test';

interface EduEntry {
  institution: string;
  degree: string;
  start?: string;
  end?: string;
}

// ── Helpers mirroring route.ts logic for isolated unit testing ───────────────

function isConversationalEdu(msgLower: string): boolean {
  return (
    /\b(?:i\s+)?(?:have\s+|haev\s+|had\s+|did\s+)?(?:done|completed|studied|attended)?\s*(?:my\s+)?(?:intermediate|internmediate|fsc|a[- ]?levels?|o[- ]?levels?|college|collage|matric|high\s*school)\b/i.test(msgLower) ||
    /\b(?:intermediate|internmediate|fsc|a[- ]?levels?|college|collage)\s+(?:in\s+[^,]+?\s+)?(?:from|at|in)\s+/i.test(msgLower)
  );
}

function isNegationReq(msgLower: string): boolean {
  return /\b(?:i\s+(?:have\s+not|haven'?t|did\s+not|didn'?t|do\s+not|don'?t|never)\s+(?:done|had|taken|got|have|completed)|no|without)\b/i.test(msgLower);
}

function parseEducationMessage(message: string): { newTargetName: string; extractedDegree: string; isCollegeType: boolean } {
  const lastMsgLower = message.toLowerCase();

  let extractedDegree = '';
  const degreeInMatch = message.match(/\b(intermediate|internmediate|fsc|a[- ]?levels?|o[- ]?levels?|hsc|matric|bachelor|master|bscs|bs|be)\s+(?:in|of)\s+([^,.:;]+?)(?:\s+(?:from|at|in)\s+|$)/i);
  if (degreeInMatch) {
    const degType = degreeInMatch[1].replace(/internmediate/i, 'Intermediate').replace(/intermediate/i, 'Intermediate');
    const degField = degreeInMatch[2].trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    extractedDegree = `${degType} in ${degField}`;
  } else {
    const simpleDegMatch = message.match(/\b(intermediate|internmediate|fsc|a[- ]?levels?|o[- ]?levels?|matric|bachelor|master|bscs)\b/i);
    if (simpleDegMatch) {
      const rawDeg = simpleDegMatch[1].toLowerCase();
      if (rawDeg.includes('intermediate') || rawDeg.includes('internmediate')) extractedDegree = 'Intermediate';
      else if (rawDeg.includes('fsc')) extractedDegree = 'FSc';
      else if (rawDeg.includes('a-level') || rawDeg.includes('a level')) extractedDegree = 'A-Levels';
      else if (rawDeg.includes('o-level') || rawDeg.includes('o level')) extractedDegree = 'O-Levels';
      else if (rawDeg.includes('matric')) extractedDegree = 'Matriculation';
      else if (rawDeg.includes('bscs')) extractedDegree = 'Bachelor of Science in Computer Science';
      else if (rawDeg.includes('bachelor')) extractedDegree = 'Bachelor of Science';
      else if (rawDeg.includes('master')) extractedDegree = 'Master of Science';
    }
  }

  const fromToMatch = message.match(/\bfrom\s+(.+?)\s+(?:to|with|into)\s+(.+?)(?:\s+in\s+education|\s+section)?$/i);
  const fromAtMatch = message.match(/\b(?:from|at)\s+([^,.:;]+?)(?:\s+(?:in|for|into)\s+(?:the\s+)?(?:education|resume|cv)(?:\s+section)?)?$/i);
  const sepMatch = message.match(/\b(?:as|to|is|was|called|named|:|;|=)\s+([^,.:;]+?)(?:\s+(?:in|for|to|into)\s+(?:the\s+)?(?:education|resume|cv)(?:\s+section)?)?$/i);

  let newTargetName = '';
  if (fromToMatch) {
    newTargetName = fromToMatch[2].replace(/\b(?:a|an|the|my|our|another|new|extra)?\s*(?:college|collage|university|uni|intermediate|school|education|name)\b/gi, '').trim();
  } else if (fromAtMatch && fromAtMatch[1]) {
    newTargetName = fromAtMatch[1].trim();
  } else if (sepMatch && sepMatch[1] && !/^(?:a|an|the|my|our|another|new|extra)?\s*(?:college|collage|university|uni|intermediate|school|education|degree)$/i.test(sepMatch[1].trim())) {
    newTargetName = sepMatch[1].trim();
  } else {
    newTargetName = message
      .replace(/\b(?:please\s+)?(?:add|insert|push|change|update|set|replace|put|rename|switch|i\s+have\s+done|i\s+haev\s+done|i\s+did|completed|studied|attended)\s+/i, '')
      .replace(/\b(?:a|an|the|my|our|another|new|extra)\s+(?:college|collage|university|uni|intermediate|internmediate|school|education|degree)\s*(?:entry|item)?\s*/gi, '')
      .replace(/\b(?:in|from|to|into|for)\s+(?:the\s+)?(?:education|resume|cv)\s*(?:section)?\s*/gi, '')
      .replace(/\b(?:education|resume|cv)\s+section\s*/gi, '')
      .replace(/^(?:a|an|the|my|our|another|new|extra)?\s*(?:college|collage|university|uni|intermediate|internmediate|school)\s*(?:name)?\s*(?:as|to|is|was|called|named|:|;|=)\s*/i, '')
      .replace(/\s+(?:as|in|to|into|for)\s+(?:a|an|the|my)?\s*(?:college|collage|university|uni|intermediate|internmediate|school)(?:\s+section)?$/i, '')
      .replace(/^(?:a|an|the|my|our|another|new|extra)?\s*(?:college|collage|university|uni|intermediate|internmediate|school)\s+/i, '')
      .replace(/\b(?:as|to|in|into|for)\s+(?:education|resume|section)\b/gi, '')
      .trim();
  }

  if (newTargetName) {
    newTargetName = newTargetName
      .replace(/\b(?:in|from|to|into|for)\s+(?:the\s+)?(?:education|resume|cv)\s*(?:section)?\s*/gi, '')
      .replace(/\b(?:education|resume|cv)\s+section\s*/gi, '')
      .trim();
    newTargetName = newTargetName
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bDj\b/g, 'DJ');
  }

  const isCollegeType =
    /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|a[- ]?levels?|o[- ]?levels?|fsc|matric)\b/i.test(lastMsgLower) ||
    /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|a[- ]?levels?|o[- ]?levels?|fsc|matric)\b/i.test(newTargetName);

  return { newTargetName, extractedDegree, isCollegeType };
}

function applyEduReplacement(education: EduEntry[], message: string): EduEntry[] {
  const { newTargetName, extractedDegree, isCollegeType } = parseEducationMessage(message);
  const currentEdu = [...education];

  if (isCollegeType) {
    let targetIdx = currentEdu.findIndex(e =>
      /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|your college|nixor|premier|state college|a[- ]?level|o[- ]?level|fsc|matric)\b/i.test(`${e.institution || ''} ${e.degree || ''}`)
    );
    if (targetIdx === -1 && currentEdu.length > 1) {
      targetIdx = 1;
    }

    if (targetIdx !== -1) {
      currentEdu[targetIdx] = {
        ...currentEdu[targetIdx],
        institution: newTargetName,
        degree: extractedDegree || currentEdu[targetIdx].degree || 'Intermediate',
      };
    } else {
      currentEdu.push({
        institution: newTargetName,
        degree: extractedDegree || 'Intermediate',
        start: 'Jun 2018',
        end: 'Jun 2020',
      });
    }
  }
  return currentEdu;
}

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

describe('Resume Chat - Education & College Replacement', () => {
  const initialEducation: EduEntry[] = [
    { institution: 'Indus University', degree: 'Bachelor of Science in Artificial Intelligence', start: 'Jul 2022', end: 'Jun 2026' },
    { institution: 'Nixor College', degree: 'A-Levels', start: 'Jun 2020', end: 'Jun 2022' },
  ];

  describe('Conversational & Typo Intent Matching', () => {
    it('recognizes "i haev done intermediate in engineering from DJ Science"', () => {
      expect(isConversationalEdu('i haev done intermediate in engineering from dj science')).toBe(true);
    });

    it('recognizes "i have done intermediate from Beaconhouse"', () => {
      expect(isConversationalEdu('i have done intermediate from beaconhouse')).toBe(true);
    });

    it('recognizes "i have done intermediate from askari college"', () => {
      expect(isConversationalEdu('i have done intermediate from askari college')).toBe(true);
    });

    it('recognizes "i have done internmediate from DJ Science"', () => {
      expect(isConversationalEdu('i have done internmediate from dj science')).toBe(true);
    });

    it('recognizes negation "i have not done a-levels"', () => {
      expect(isNegationReq('i have not done a-levels')).toBe(true);
    });

    it('recognizes negation "i haven\'t done a levels"', () => {
      expect(isNegationReq("i haven't done a levels")).toBe(true);
    });

    it('recognizes negation "no a-levels"', () => {
      expect(isNegationReq('no a-levels')).toBe(true);
    });
  });

  describe('Parsing & Secondary Tier Replacement', () => {
    it('parses institution and degree from "i haev done intermediate in engineering from DJ Science"', () => {
      const parsed = parseEducationMessage('i haev done intermediate in engineering from DJ Science');
      expect(parsed.newTargetName).toBe('DJ Science');
      expect(parsed.extractedDegree).toBe('Intermediate in Engineering');
      expect(parsed.isCollegeType).toBe(true);
    });

    it('parses institution and degree from "i have done intermediate from Beaconhouse"', () => {
      const parsed = parseEducationMessage('i have done intermediate from Beaconhouse');
      expect(parsed.newTargetName).toBe('Beaconhouse');
      expect(parsed.extractedDegree).toBe('Intermediate');
      expect(parsed.isCollegeType).toBe(true);
    });

    it('parses institution and degree from "i have done intermediate from askari college"', () => {
      const parsed = parseEducationMessage('i have done intermediate from askari college');
      expect(parsed.newTargetName).toBe('Askari College');
      expect(parsed.extractedDegree).toBe('Intermediate');
      expect(parsed.isCollegeType).toBe(true);
    });

    it('replaces Nixor College with DJ Science without adding extra entry', () => {
      const result = applyEduReplacement(initialEducation, 'i haev done intermediate in engineering from DJ Science');
      expect(result.length).toBe(2);
      expect(result[0].institution).toBe('Indus University');
      expect(result[0].degree).toBe('Bachelor of Science in Artificial Intelligence');
      expect(result[1].institution).toBe('DJ Science');
      expect(result[1].degree).toBe('Intermediate in Engineering');
      expect(result.some(e => e.institution === 'Nixor College')).toBe(false);
    });

    it('replaces Nixor College with Beaconhouse without adding extra entry', () => {
      const result = applyEduReplacement(initialEducation, 'i have done intermediate from Beaconhouse');
      expect(result.length).toBe(2);
      expect(result[0].institution).toBe('Indus University');
      expect(result[1].institution).toBe('Beaconhouse');
      expect(result[1].degree).toBe('Intermediate');
      expect(result.some(e => e.institution === 'Nixor College')).toBe(false);
    });

    it('replaces Nixor College with Askari College without adding extra entry', () => {
      const result = applyEduReplacement(initialEducation, 'i have done intermediate from askari college');
      expect(result.length).toBe(2);
      expect(result[0].institution).toBe('Indus University');
      expect(result[1].institution).toBe('Askari College');
      expect(result[1].degree).toBe('Intermediate');
      expect(result.some(e => e.institution === 'Nixor College')).toBe(false);
    });
  });

  describe('Negation & Removal Handling', () => {
    it('removes Nixor College when user says "i have not done a-levels"', () => {
      const result = applyNegationRemoval(initialEducation, 'i have not done a-levels');
      expect(result.length).toBe(1);
      expect(result[0].institution).toBe('Indus University');
      expect(result.some(e => e.institution === 'Nixor College')).toBe(false);
    });

    it('removes Nixor College when user says "no a-levels"', () => {
      const result = applyNegationRemoval(initialEducation, 'no a-levels');
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
      const consolidated = consolidateSecondaryTier(initialEducation, 'i have not done a-levels');
      expect(consolidated.length).toBe(1);
      expect(consolidated[0].institution).toBe('Indus University');
      expect(consolidated.some(e => e.institution === 'Nixor College')).toBe(false);
    });
  });
});
