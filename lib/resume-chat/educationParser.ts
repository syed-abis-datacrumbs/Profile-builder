export interface ParsedEducationResult {
  oldTargetName: string;
  newTargetName: string;
  extractedDegree: string;
  isCollegeType: boolean;
}

/**
 * Strips conversational filler, trailing action phrases, quotes, and section references
 * from a raw institution string.
 * e.g. '"DJ" not "SMI" please change it' -> 'DJ'
 * e.g. 'DJ change it' -> 'DJ'
 */
export function cleanInstitutionString(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    // Strip surrounding quotes
    .replace(/^["'“”`\s]+|["'“”`\s]+$/g, '')
    // Strip trailing conversational action commands (e.g. "change it", "please change it", "please update")
    .replace(
      /\b(?:please\s+)?(?:change|update|replace|fix|set|make|switch|put)\s+(?:it|this|that|now|for\s+me)\b/gi,
      ''
    )
    .replace(/\b(?:please\s+)?(?:change|update|replace|fix|set|make|switch|put)\b/gi, '')
    .replace(/\b(?:please|pls|plz)\b/gi, '')
    // Strip section references
    .replace(/\b(?:in|from|to|into|for)\s+(?:the\s+)?(?:education|resume|cv)\s*(?:section)?\s*/gi, '')
    .replace(/\b(?:education|resume|cv)\s+section\s*/gi, '')
    // Strip remaining punctuation and quotes
    .replace(/^["'“”`\s,.:;]+|["'“”`\s,.:;]+$/g, '')
    .trim();
}

/**
 * Formats institution capitalization and preserves/uppercases common educational acronyms.
 */
export function formatInstitutionName(raw: string): string {
  if (!raw) return '';
  const acronyms: Record<string, string> = {
    dj: 'DJ',
    smi: 'SMI',
    ned: 'NED',
    iba: 'IBA',
    fast: 'FAST',
    nust: 'NUST',
    giki: 'GIKI',
    szabist: 'SZABIST',
    mit: 'MIT',
    lums: 'LUMS',
    ucla: 'UCLA',
    uc: 'UC',
    nyu: 'NYU',
    fsc: 'FSc',
  };

  return raw
    .split(/\s+/)
    .map((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (acronyms[clean]) {
        return acronyms[clean];
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/**
 * Parses user input for education institution updates and replacements.
 * Handles patterns like:
 * - "my college name is DJ not SMI change it"
 * - 'my college name is "DJ" not "SMI" please change it'
 * - "change SMI to DJ"
 * - "replace SMI with DJ"
 * - "not SMI but DJ"
 * - "DJ instead of SMI"
 * - "i have done intermediate from DJ Science"
 */
export function parseEducationMessage(message: string): ParsedEducationResult {
  const msgTrimmed = message.trim();
  const lastMsgLower = msgTrimmed.toLowerCase();

  let oldTargetName = '';
  let newTargetName = '';

  // 1. Extract degree if specified
  let extractedDegree = '';
  const degreeInMatch = msgTrimmed.match(
    /\b(intermediate|internmediate|fsc|a[- ]?levels?|o[- ]?levels?|hsc|matric|bachelor|master|bscs|bs|be)\s+(?:in|of)\s+([^,.:;]+?)(?:\s+(?:from|at|in)\s+|$)/i
  );
  if (degreeInMatch) {
    const degType = degreeInMatch[1]
      .replace(/internmediate/i, 'Intermediate')
      .replace(/intermediate/i, 'Intermediate');
    const degField = degreeInMatch[2]
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    extractedDegree = `${degType} in ${degField}`;
  } else {
    const simpleDegMatch = msgTrimmed.match(
      /\b(intermediate|internmediate|fsc|a[- ]?levels?|o[- ]?levels?|matric|bachelor|master|bscs)\b/i
    );
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

  // 2. Pattern Matching for Institution Names

  // Pattern A: "<NEW> not/instead of/rather than <OLD>"
  // e.g. "my college name is DJ not SMI change it"
  // e.g. 'my college name is "DJ" not "SMI" please change it'
  // e.g. "DJ not SMI"
  // e.g. "DJ instead of SMI"
  const newNotOldMatch = msgTrimmed.match(
    /(?:(?:my\s+)?(?:college|collage|university|uni|school|institution)\s*(?:name)?\s*(?:is|was|to|:|=)\s*)?["'“`]?([^"'“”`\n]+?)["'”`]?\s+\b(?:not|instead\s+of|rather\s+than)\b\s+["'“`]?([^"'“”`\n]+?)["'”`]?(?:\s+(?:please\s+)?(?:change|update|replace|fix|set)(?:\s+it|\s+this)?)?$/i
  );

  // Pattern B: "not <OLD> but/it's <NEW>"
  // e.g. "not SMI but DJ", "not SMI, it is DJ", "not SMI, college is DJ"
  const notOldButNewMatch = msgTrimmed.match(
    /\bnot\s+["'“`]?([^"'“”`\n,]+?)["'”`]?(?:,\s*|\s+)(?:but|it'?s|it\s+is|(?:my\s+)?(?:college|collage|university|school)\s+(?:name\s+)?(?:is|was|=))\s+["'“`]?([^"'“”`\n]+?)["'”`]?(?:\s+(?:please\s+)?(?:change|update|replace|fix|set)(?:\s+it|\s+this)?)?$/i
  );

  // Pattern C: "change/replace/update [college] [from] <OLD> to/with <NEW>"
  // e.g. "change SMI to DJ", "replace SMI with DJ", "change college from SMI to DJ"
  const changeOldToNewMatch = msgTrimmed.match(
    /\b(?:change|replace|update|switch)\s+(?:(?:my\s+)?(?:college|collage|university|uni|school)\s+(?:name\s+)?)?(?:from\s+)?["'“`]?([^"'“”`\n]+?)["'”`]?\s+\b(?:to|with|into)\b\s+["'“`]?([^"'“”`\n]+?)["'”`]?(?:\s+(?:in\s+education|\s+section)?)?(?:\s+(?:please\s+)?(?:change|update|replace|fix|set)(?:\s+it|\s+this)?)?$/i
  );

  // Pattern D: "from <OLD> to <NEW>"
  const fromToMatch = msgTrimmed.match(
    /\bfrom\s+(.+?)\s+(?:to|with|into)\s+(.+?)(?:\s+in\s+education|\s+section)?$/i
  );

  // Pattern E: "from/at <NEW>" e.g. "intermediate from Beaconhouse", "studied at SMI"
  const fromAtMatch = msgTrimmed.match(
    /\b(?:from|at)\s+([^,.:;]+?)(?:\s+(?:in|for|into)\s+(?:the\s+)?(?:education|resume|cv)(?:\s+section)?)?$/i
  );

  // Pattern F: "college is/was/to/: <NEW>" e.g. "my college name is DJ", "college: DJ Science"
  const sepMatch = msgTrimmed.match(
    /\b(?:as|to|is|was|called|named|:|;|=)\s+([^,.:;]+?)(?:\s+(?:in|for|to|into)\s+(?:the\s+)?(?:education|resume|cv)(?:\s+section)?)?$/i
  );

  if (newNotOldMatch) {
    newTargetName = cleanInstitutionString(newNotOldMatch[1]);
    oldTargetName = cleanInstitutionString(newNotOldMatch[2]);
  } else if (notOldButNewMatch) {
    oldTargetName = cleanInstitutionString(notOldButNewMatch[1]);
    newTargetName = cleanInstitutionString(notOldButNewMatch[2]);
  } else if (changeOldToNewMatch) {
    oldTargetName = cleanInstitutionString(changeOldToNewMatch[1]);
    newTargetName = cleanInstitutionString(changeOldToNewMatch[2]);
  } else if (fromToMatch) {
    oldTargetName = cleanInstitutionString(fromToMatch[1]);
    newTargetName = cleanInstitutionString(fromToMatch[2]);
  } else if (fromAtMatch && fromAtMatch[1]) {
    newTargetName = cleanInstitutionString(fromAtMatch[1]);
  } else if (
    sepMatch &&
    sepMatch[1] &&
    !/^(?:a|an|the|my|our|another|new|extra)?\s*(?:college|collage|university|uni|intermediate|school|education|degree)$/i.test(
      sepMatch[1].trim()
    )
  ) {
    newTargetName = cleanInstitutionString(sepMatch[1]);
  } else {
    newTargetName = cleanInstitutionString(
      msgTrimmed
        .replace(
          /\b(?:please\s+)?(?:add|insert|push|change|update|set|replace|put|rename|switch|i\s+have\s+done|i\s+haev\s+done|i\s+did|completed|studied|attended)\s+/i,
          ''
        )
        .replace(
          /\b(?:a|an|the|my|our|another|new|extra)\s+(?:college|collage|university|uni|intermediate|internmediate|school|education|degree)\s*(?:entry|item)?\s*/gi,
          ''
        )
        .replace(
          /\b(?:in|from|to|into|for)\s+(?:the\s+)?(?:education|resume|cv)\s*(?:section)?\s*/gi,
          ''
        )
        .replace(/\b(?:education|resume|cv)\s+section\s*/gi, '')
        .replace(
          /^(?:a|an|the|my|our|another|new|extra)?\s*(?:college|collage|university|uni|intermediate|internmediate|school)\s*(?:name)?\s*(?:as|to|is|was|called|named|:|;|=)\s*/i,
          ''
        )
        .replace(
          /\s+(?:as|in|to|into|for)\s+(?:a|an|the|my)?\s*(?:college|collage|university|uni|intermediate|internmediate|school)(?:\s+section)?$/i,
          ''
        )
        .replace(
          /^(?:a|an|the|my|our|another|new|extra)?\s*(?:college|collage|university|uni|intermediate|internmediate|school)\s+/i,
          ''
        )
        .replace(/\b(?:as|to|in|into|for)\s+(?:education|resume|section)\b/gi, '')
    );
  }

  // Format capitalization and abbreviations
  if (newTargetName) {
    newTargetName = formatInstitutionName(newTargetName);
  }
  if (oldTargetName) {
    oldTargetName = formatInstitutionName(oldTargetName);
  }

  const isCollegeType =
    /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|a[- ]?levels?|o[- ]?levels?|fsc|matric)\b/i.test(
      lastMsgLower
    ) ||
    /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|a[- ]?levels?|o[- ]?levels?|fsc|matric)\b/i.test(
      newTargetName
    ) ||
    /\b(college|collage|intermediate|internmediate|preparatory|school|diploma|a[- ]?levels?|o[- ]?levels?|fsc|matric)\b/i.test(
      oldTargetName
    );

  return { oldTargetName, newTargetName, extractedDegree, isCollegeType };
}

/**
 * Checks whether an education entry represents a College / Secondary tier
 * (Intermediate, High School, A-Levels, Pre-University, etc.)
 */
export function isSecondaryEducationEntry(e: { institution?: string; degree?: string }): boolean {
  const inst = (e.institution || '').trim().toLowerCase();
  const deg = (e.degree || '').trim().toLowerCase();
  const combined = `${inst} ${deg}`;

  // 1. Explicit secondary markers
  if (
    /\b(your college|intermediate|internmediate|fsc|hsc|a[- ]?levels?|o[- ]?levels?|matric|high\s+school|pre[- ]?engineering|pre[- ]?medical|secondary|diploma|pre[- ]university|nixor|beaconhouse|cedar|karachi grammar|dj science|adamjee|smi)\b/i.test(combined)
  ) {
    return true;
  }

  // 2. If it contains university / graduate school / bachelor / master markers, it is NOT secondary
  if (
    /\b(bachelor|master|phd|b\.?s\.?|b\.?e\.?|m\.?s\.?|mba|bba|degree\s+program|undergraduate|postgraduate)\b/i.test(deg) ||
    /\b(graduate\s+school|your university)\b/i.test(inst) ||
    (/(?<!pre[- ])\buniversity\b/i.test(inst) && !inst.includes('college'))
  ) {
    return false;
  }

  // 3. College / preparatory / high school keywords (excluding graduate/law/medical school)
  if (/\b(college|collage|preparatory)\b/i.test(combined)) return true;
  if (/\bschool\b/i.test(combined) && !/\b(graduate|business|law|medical)\s+school\b/i.test(combined)) return true;

  return false;
}

/**
 * Checks whether an education entry represents a University / Higher Education tier
 * (Bachelors, Masters, PhD, University, Graduate School)
 */
export function isHigherEducationEntry(e: { institution?: string; degree?: string }): boolean {
  const inst = (e.institution || '').trim().toLowerCase();
  const deg = (e.degree || '').trim().toLowerCase();

  if (isSecondaryEducationEntry(e)) return false;

  if (
    /\b(bachelor|master|phd|b\.?s\.?|b\.?e\.?|m\.?s\.?|mba|bba|degree\s+program|undergraduate|postgraduate)\b/i.test(deg) ||
    /\b(graduate\s+school|your university)\b/i.test(inst) ||
    /(?<!pre[- ])\buniversity\b/i.test(inst) ||
    /\b(szabist|berkeley|harvard|stanford|mit|indus|fast|ned|nust|giki|iba|lums)\b/i.test(inst)
  ) {
    return true;
  }

  return false;
}

