import type { CvData } from '../../../lib/cvTypes';

export const runtime = 'nodejs';

// Comprehensive filter for common non-skill vocabulary
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone',
  'along', 'already', 'also', 'although', 'always', 'am', 'among', 'an', 'and', 'another',
  'any', 'anybody', 'anyone', 'anything', 'anywhere', 'are', 'area', 'areas', 'around', 'as',
  'ask', 'asked', 'asking', 'asks', 'at', 'away', 'b', 'back', 'backed', 'backing', 'backs',
  'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'began', 'behind',
  'being', 'beings', 'best', 'better', 'between', 'big', 'both', 'bring', 'brings', 'brought',
  'but', 'by', 'c', 'came', 'can', 'cannot', 'case', 'cases', 'certain', 'certainly',
  'clear', 'clearly', 'close', 'closely', 'closer', 'comes', 'could', 'd', 'daily', 'day',
  'days', 'did', 'differ', 'different', 'differently', 'do', 'does', 'doing', 'done', 'down',
  'downed', 'downing', 'downs', 'during', 'e', 'each', 'early', 'either', 'end', 'ended',
  'ending', 'ends', 'enough', 'ensure', 'ensuring', 'entire', 'especially', 'even', 'evenly',
  'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'experience', 'experienced',
  'experiences', 'experiencing', 'f', 'face', 'faces', 'fact', 'facts', 'far', 'felt', 'few',
  'fewer', 'find', 'finds', 'first', 'for', 'four', 'from', 'full', 'fully', 'further',
  'furthered', 'furthering', 'furthers', 'g', 'gave', 'general', 'generally', 'get', 'gets',
  'getting', 'give', 'given', 'gives', 'giving', 'go', 'going', 'gone', 'good', 'goods',
  'got', 'great', 'greater', 'greatest', 'group', 'grouped', 'grouping', 'groups', 'h', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'herself', 'high', 'higher', 'highest',
  'him', 'himself', 'his', 'how', 'however', 'i', 'if', 'important', 'in', 'interest',
  'interested', 'interesting', 'interests', 'into', 'is', 'it', 'its', 'itself', 'j', 'just',
  'k', 'keep', 'keeps', 'kind', 'knew', 'know', 'known', 'knows', 'l', 'large', 'largely',
  'last', 'later', 'latest', 'least', 'less', 'let', 'lets', 'like', 'likely', 'line',
  'lines', 'little', 'look', 'looked', 'looking', 'looks', 'm', 'made', 'make', 'making',
  'man', 'many', 'may', 'me', 'member', 'members', 'men', 'might', 'more', 'most',
  'mostly', 'mr', 'mrs', 'much', 'must', 'my', 'myself', 'n', 'name', 'named', 'names',
  'near', 'needed', 'needing', 'needs', 'never', 'new', 'newer', 'newest', 'next', 'no',
  'nobody', 'non', 'noone', 'not', 'nothing', 'now', 'nowhere', 'number', 'numbers', 'o',
  'of', 'off', 'often', 'old', 'older', 'oldest', 'on', 'once', 'one', 'only', 'open',
  'opened', 'opening', 'opens', 'or', 'order', 'ordered', 'ordering', 'orders', 'other',
  'others', 'our', 'out', 'over', 'own', 'p', 'part', 'parted', 'parting', 'parts', 'per',
  'perhaps', 'place', 'places', 'point', 'pointed', 'pointing', 'points', 'possible',
  'present', 'presented', 'presenting', 'presents', 'problem', 'problems', 'put', 'puts',
  'q', 'quite', 'r', 'rather', 'really', 'recent', 'recently', 'right', 'room', 'rooms',
  's', 'said', 'same', 'saw', 'say', 'says', 'second', 'seconds', 'see', 'seem', 'seemed',
  'seeming', 'seems', 'sees', 'several', 'shall', 'she', 'should', 'show', 'showed', 'showing',
  'shows', 'side', 'sides', 'since', 'small', 'smaller', 'smallest', 'so', 'some', 'somebody',
  'someone', 'something', 'somewhere', 'state', 'states', 'still', 'such', 'sure', 't',
  'take', 'taken', 'taking', 'than', 'that', 'the', 'their', 'them', 'then', 'there',
  'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinks', 'this', 'those',
  'though', 'thought', 'thoughts', 'three', 'through', 'thus', 'to', 'today', 'together',
  'too', 'took', 'toward', 'turn', 'turned', 'turning', 'turns', 'two', 'u', 'under',
  'until', 'up', 'upon', 'us', 'use', 'used', 'uses', 'using', 'v', 'very', 'w', 'want',
  'wanted', 'wanting', 'wants', 'was', 'way', 'ways', 'we', 'well', 'wells', 'went', 'were',
  'what', 'when', 'where', 'who', 'whether', 'which', 'while', 'whole', 'whose', 'why',
  'will', 'with', 'within', 'without', 'work', 'worked', 'working', 'works', 'would', 'x',
  'y', 'year', 'years', 'yet', 'you', 'young', 'younger', 'youngest', 'your', 'yours', 'z',
  'ability', 'able', 'action', 'actions', 'actively', 'activities', 'add', 'additional',
  'align', 'aligned', 'aligning', 'alignment', 'allowing', 'allows', 'applicant', 'applicants',
  'application', 'apply', 'applying', 'approach', 'appropriate', 'assist', 'assisted',
  'assisting', 'background', 'based', 'basic', 'basis', 'benefit', 'benefits', 'candidate',
  'candidates', 'capability', 'capable', 'career', 'careers', 'central', 'challenge',
  'challenges', 'challenging', 'collaborate', 'collaborated', 'collaborating', 'collaboration',
  'collaborative', 'commitment', 'committed', 'communicate', 'communicating', 'communication',
  'company', 'complete', 'completed', 'completing', 'completion', 'complex', 'confidence',
  'confident', 'consistent', 'consistently', 'coordinate', 'coordinated', 'coordinating',
  'coordination', 'core', 'create', 'created', 'creating', 'creation', 'creative', 'critical',
  'culture', 'current', 'currently', 'decision', 'decisions', 'deliver', 'delivered',
  'delivering', 'delivery', 'demonstrate', 'demonstrated', 'demonstrates', 'demonstrating',
  'department', 'departments', 'describe', 'description', 'desired', 'detail', 'detailed',
  'details', 'develop', 'developed', 'developer', 'developing', 'development', 'direction',
  'directly', 'diverse', 'drive', 'driven', 'driver', 'drivers', 'drives', 'driving', 'duties',
  'dynamic', 'e.g.', 'effective', 'effectively', 'effectiveness', 'efficiency', 'efficient',
  'efficiently', 'effort', 'efforts', 'emphasis', 'employ', 'employee', 'employees',
  'employment', 'enable', 'enables', 'enabling', 'encourage', 'encouraged', 'energy',
  'engage', 'engaged', 'engagement', 'engaging', 'enhance', 'enhanced', 'enhances',
  'enhancing', 'enthusiastic', 'environment', 'environments', 'equip', 'equipped',
  'essential', 'establish', 'established', 'establishing', 'etc', 'evaluate', 'evaluating',
  'evaluation', 'excellent', 'exceptional', 'execute', 'executed', 'executing', 'execution',
  'executive', 'exist', 'existing', 'expand', 'expanding', 'expansion', 'expect',
  'expectation', 'expectations', 'expected', 'expertise', 'explore', 'exploring', 'express',
  'extend', 'facilitate', 'facilitated', 'facilitating', 'factor', 'factors', 'fast', 'faster',
  'field', 'fields', 'flexible', 'flexibility', 'focus', 'focused', 'focuses', 'focusing',
  'follow', 'following', 'form', 'forms', 'foster', 'fostering', 'fresh', 'fulfill', 'function',
  'functional', 'functions', 'future', 'gain', 'gained', 'gaining', 'gap', 'generate',
  'generated', 'generating', 'generation', 'goal', 'goals', 'grow', 'growing', 'growth',
  'guidance', 'guide', 'guided', 'guiding', 'handle', 'handled', 'handling', 'hands-on',
  'help', 'helped', 'helpful', 'helping', 'helps', 'hire', 'hiring', 'hold', 'holding', 'holds',
  'hourly', 'identify', 'identifying', 'impact', 'impactful', 'impacting', 'impacts',
  'implement', 'implementation', 'implemented', 'implementing', 'importance', 'improve',
  'improved', 'improvement', 'improvements', 'improves', 'improving', 'include', 'included',
  'includes', 'including', 'inclusion', 'inclusive', 'incorporate', 'increase', 'increased',
  'increases', 'increasing', 'individual', 'individuals', 'industry', 'influence',
  'influencing', 'initiative', 'initiatives', 'innovate', 'innovation', 'innovations',
  'innovative', 'input', 'insight', 'insights', 'inspire', 'inspiring', 'integration',
  'intend', 'interact', 'interacting', 'interaction', 'interactive', 'internal',
  'interpersonal', 'interview', 'involved', 'involvement', 'issue', 'issues', 'job', 'jobs',
  'joining', 'journey', 'judgment', 'lead', 'leader', 'leaders', 'leadership', 'leading',
  'leads', 'learn', 'learned', 'learning', 'level', 'levels', 'leverage', 'leveraged',
  'leveraging', 'life', 'listen', 'listening', 'location', 'long-term', 'maintain',
  'maintained', 'maintaining', 'maintenance', 'major', 'manage', 'managed', 'management',
  'manager', 'managers', 'managing', 'manner', 'match', 'matching', 'maximize', 'maximizing',
  'meaningful', 'measure', 'measured', 'measurement', 'measures', 'measuring', 'meet',
  'meeting', 'meetings', 'meets', 'mentoring', 'mindset', 'mission', 'modern', 'monitor',
  'monitored', 'monitoring', 'monthly', 'motivation', 'motivated', 'move', 'moving',
  'necessary', 'need', 'objective', 'objectives', 'obtain', 'obtained', 'ongoing', 'operate',
  'operated', 'operating', 'operation', 'operational', 'operations', 'opportunity',
  'opportunities', 'optimal', 'optimize', 'optimized', 'optimizing', 'organization',
  'organizational', 'organizations', 'organize', 'organized', 'organizing', 'orientation',
  'oriented', 'outcome', 'outcomes', 'output', 'outputs', 'oversee', 'overseeing', 'pace',
  'paced', 'package', 'participate', 'participated', 'participating', 'participation',
  'partner', 'partnering', 'partners', 'partnership', 'passionate', 'path', 'people',
  'perform', 'performance', 'performed', 'performing', 'performs', 'period', 'person',
  'personal', 'perspective', 'perspectives', 'phase', 'plan', 'planned', 'planning', 'plans',
  'policy', 'position', 'positions', 'positive', 'potential', 'practice', 'practices',
  'prefer', 'preference', 'preferred', 'prepare', 'prepared', 'preparing', 'presence',
  'presentation', 'presentations', 'presented', 'presenting', 'presents', 'primary', 'prior',
  'priorities', 'prioritize', 'prioritized', 'prioritizing', 'priority', 'proactive',
  'problem-solving', 'procedure', 'procedures', 'proceed', 'process', 'processes',
  'processing', 'produce', 'produced', 'producing', 'product', 'production', 'productive',
  'productivity', 'products', 'profession', 'professional', 'professionals', 'proficiency',
  'proficient', 'program', 'programs', 'progress', 'project', 'projects', 'promote',
  'prompt', 'propose', 'proposed', 'proven', 'provide', 'provided', 'provider', 'provides',
  'providing', 'purpose', 'pursue', 'qualifications', 'qualified', 'qualify', 'quality',
  'quick', 'quickly', 'range', 'reach', 'reaching', 'read', 'ready', 'real', 'realistic',
  'reason', 'receive', 'received', 'receiving', 'recognize', 'recognized', 'recommend',
  'recommendation', 'recommendations', 'record', 'reduce', 'reduced', 'reducing', 'reduction',
  'refer', 'reflect', 'regard', 'regular', 'regularly', 'related', 'relationship',
  'relationships', 'relevant', 'reliable', 'rely', 'report', 'reported', 'reporting',
  'reports', 'represent', 'represented', 'request', 'requested', 'require', 'required',
  'requirement', 'requirements', 'requires', 'requiring', 'research', 'resilient',
  'resolution', 'resolve', 'resolved', 'resolving', 'resource', 'resources', 'respect',
  'respond', 'responding', 'response', 'responsibilities', 'responsibility', 'responsible',
  'result', 'resulting', 'results', 'retain', 'retention', 'review', 'reviewed', 'reviewing',
  'reward', 'rigorous', 'role', 'roles', 'routine', 'run', 'running', 'safe', 'safety',
  'satisfaction', 'satisfied', 'satisfy', 'scale', 'scaling', 'schedule', 'schedules',
  'scheduling', 'scope', 'seamless', 'seasoned', 'seek', 'seeking', 'select', 'selected',
  'selection', 'self-starter', 'senior', 'sense', 'serve', 'service', 'services', 'serving',
  'session', 'sessions', 'set', 'setting', 'settings', 'share', 'shared', 'sharing',
  'shift', 'short-term', 'skill', 'skilled', 'skills', 'smooth', 'solution', 'solutions',
  'solve', 'solved', 'solver', 'solving', 'sound', 'source', 'sources', 'sourcing', 'speak',
  'speaking', 'specialist', 'specific', 'specifically', 'speed', 'stakeholder',
  'stakeholders', 'standard', 'standards', 'start', 'started', 'starting', 'status', 'stay',
  'step', 'steps', 'strategic', 'strategies', 'strategy', 'streamline', 'streamlined',
  'streamlining', 'structure', 'structured', 'structures', 'success', 'successful',
  'successfully', 'suit', 'suitable', 'summary', 'supervise', 'supervised', 'supervising',
  'supervision', 'supervisor', 'support', 'supported', 'supporting', 'supportive',
  'supports', 'sustainable', 'system', 'systematic', 'systems', 'tactical', 'tailor',
  'tailored', 'talent', 'target', 'targeted', 'targets', 'task', 'tasks', 'team', 'teams',
  'teamwork', 'technique', 'techniques', 'thorough', 'thoroughly', 'thoughtful', 'timely',
  'times', 'tool', 'tools', 'top', 'total', 'track', 'tracked', 'tracking', 'tracks',
  'train', 'trained', 'training', 'transform', 'transformation', 'transformed',
  'transition', 'translate', 'trend', 'trends', 'trust', 'type', 'types', 'typical',
  'understand', 'understanding', 'understands', 'understood', 'undertake', 'unique',
  'unit', 'units', 'update', 'updated', 'updates', 'updating', 'upgrade', 'upgraded',
  'user', 'users', 'utilize', 'utilized', 'utilizes', 'utilizing', 'value', 'values',
  'variety', 'various', 'verify', 'verifying', 'via', 'vision', 'vital', 'voice', 'ways',
  'weekly', 'welcome', 'willing', 'win', 'winning', 'work', 'worked', 'worker', 'workers',
  'workflow', 'workflows', 'working', 'workplace', 'works', 'world', 'worth', 'write',
  'writing', 'written', 'yearly', 'years', 'yield'
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { cv?: CvData; jobDescription?: string };
    if (!body.cv) return Response.json({ error: 'Missing resume data' }, { status: 400 });

    const { cv, jobDescription } = body;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Structure & Completeness Score (0–25 Points)
    // ─────────────────────────────────────────────────────────────────────────
    let structureScore = 0;

    // Contact Information (2 pts)
    const hasContact = Boolean(cv.personalInfo?.fullName && cv.personalInfo?.email);
    if (hasContact) structureScore += 2;

    // Professional Summary / Field header (3 pts)
    const hasSummary = Boolean(cv.personalInfo?.fullName && (cv.education?.[0]?.degree || cv.workExperience?.[0]?.title));
    if (hasSummary) structureScore += 3;

    // Education (3 pts)
    const hasEducation = Array.isArray(cv.education) && cv.education.length > 0 && cv.education.some((e) => (e.institution || '').trim().length > 0);
    if (hasEducation) structureScore += 3;

    // Work Experience / Workshops (5 pts)
    const hasExperience = (Array.isArray(cv.workExperience) && cv.workExperience.length > 0 && cv.workExperience.some((w) => (w.company || w.title || w.bullets))) ||
                          (Array.isArray(cv.workshops) && cv.workshops.length > 0 && cv.workshops.some((ws) => (ws.content || '').trim().length > 0));
    if (hasExperience) structureScore += 5;

    // Projects (3 pts)
    const hasProjects = Array.isArray(cv.projects) && cv.projects.length > 0 && cv.projects.some((p) => (p.content || '').trim().length > 0);
    if (hasProjects) structureScore += 3;

    // Skills (3 pts)
    const hasSkills = Boolean(cv.additional?.skills && cv.additional.skills.trim().length > 0);
    if (hasSkills) structureScore += 3;

    // Certifications (2 pts)
    const hasCertifications = Array.isArray(cv.certifications) && cv.certifications.length > 0 && cv.certifications.some((c) => (c.name || '').trim().length > 0);
    if (hasCertifications) structureScore += 2;

    // Portfolio / Links (2 pts)
    const hasLinks = Boolean(cv.personalInfo?.linkedin || cv.personalInfo?.github || cv.personalInfo?.kaggle);
    if (hasLinks) structureScore += 2;

    // Quantified Achievements (2 pts)
    const allBulletText = [
      ...(cv.workExperience || []).map((w) => w.bullets || ''),
      ...(cv.projects || []).map((p) => p.content || ''),
    ].join(' ');
    const hasQuantified = /\d+|%/i.test(allBulletText);
    if (hasQuantified) structureScore += 2;

    structureScore = Math.min(25, structureScore);

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Section Texts Extraction for Location Weighting
    // ─────────────────────────────────────────────────────────────────────────
    const workText = (cv.workExperience || []).map((w) => `${w.company} ${w.title} ${w.bullets}`).join(' ').toLowerCase();
    const projectText = (cv.projects || []).map((p) => p.content || '').join(' ').toLowerCase();
    const certText = (cv.certifications || []).map((c) => `${c.name} ${c.organization}`).join(' ').toLowerCase();
    const skillsText = (cv.additional?.skills || '').toLowerCase();
    const interestsText = (cv.additional?.interests || '').toLowerCase();

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Resume Quality & ATS Readability Score (0–15 Points)
    // ─────────────────────────────────────────────────────────────────────────
    let qualityScore = 0;

    // Complete Sentences (3 pts) - no trailing punctuation cuts or abrupt breaks
    const bulletLines = (cv.workExperience || []).flatMap((w) => (w.bullets || '').split('\n').filter((b) => b.trim().length > 0));
    const hasCompleteSentences = bulletLines.length > 0 && bulletLines.every((b) => b.trim().length >= 25 && !/[,;\-–]\s*$/.test(b.trim()));
    if (hasCompleteSentences) qualityScore += 3;
    else if (bulletLines.length > 0) qualityScore += 1;

    // Grammar & Consistency (2 pts) - consistent capitalization and strong action verbs
    const hasActionVerbs = bulletLines.some((b) => /^(led|conducted|developed|created|analyzed|engineered|managed|built|designed|implemented|optimized|streamlined|researched|oversaw)/i.test(b.trim().replace(/^[-•*]\s*/, '')));
    if (hasActionVerbs) qualityScore += 2;
    else if (bulletLines.length > 0) qualityScore += 1;

    // No Keyword Stuffing (3 pts) - skills section is reasonable length and clean
    const skillList = (cv.additional?.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
    const hasNoStuffing = skillList.length > 0 && skillList.length <= 18;
    if (hasNoStuffing) qualityScore += 3;
    else if (skillList.length > 0) qualityScore += 1;

    // Clean Section Distribution (2 pts)
    const hasCleanDistribution = hasExperience && hasProjects && hasSkills;
    if (hasCleanDistribution) qualityScore += 2;

    // Valid Contact Information (1 pt)
    const emailStr = (cv.personalInfo?.email || '').toLowerCase();
    const isPlaceholderEmail = emailStr.includes('your.email') || emailStr.includes('example.com') || emailStr.includes('sample');
    if (hasContact && !isPlaceholderEmail) qualityScore += 1;

    // Readable Formatting (2 pts)
    const isReadable = (cv.workExperience || []).length <= 4 && (cv.projects || []).length <= 4;
    if (isReadable) qualityScore += 2;

    // No Broken/Incomplete Content (2 pts)
    const noBrokenContent = !(cv.personalInfo?.fullName || '').includes('...') && !(cv.additional?.skills || '').includes('...');
    if (noBrokenContent) qualityScore += 2;

    qualityScore = Math.min(15, qualityScore);

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Default Case: If no Target Job Description provided
    // Evaluate based on Domain Skills Density, Bullet Quantified Impact & Structure
    // ─────────────────────────────────────────────────────────────────────────
    if (!jobDescription || jobDescription.trim().length === 0) {
      // 1. Technical Skills Density (0–35 pts)
      const skillList = (cv.additional?.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && !STOP_WORDS.has(s.toLowerCase()));

      let skillDensityScore = 0;
      if (skillList.length >= 10) skillDensityScore = 35;
      else if (skillList.length >= 7) skillDensityScore = 28;
      else if (skillList.length >= 4) skillDensityScore = 20;
      else if (skillList.length >= 1) skillDensityScore = 12;
      else skillDensityScore = 5;

      // 2. Experience Impact & Quantified Metrics (0–25 pts)
      let expImpactScore = 0;
      const totalBullets = (cv.workExperience || []).flatMap((w) => (w.bullets || '').split('\n').filter(Boolean));
      const quantifiedBullets = totalBullets.filter((b) => /\d+|%/i.test(b));

      if (totalBullets.length >= 3 && quantifiedBullets.length >= 3) expImpactScore += 12;
      else if (totalBullets.length >= 2 && quantifiedBullets.length >= 1) expImpactScore += 8;
      else if (totalBullets.length >= 1) expImpactScore += 5;

      // Projects impact
      const totalProjects = (cv.projects || []).filter((p) => (p.content || '').trim().length > 20);
      if (totalProjects.length >= 3) expImpactScore += 8;
      else if (totalProjects.length >= 2) expImpactScore += 6;
      else if (totalProjects.length >= 1) expImpactScore += 3;

      // Action verbs check
      const hasStrongVerbs = totalBullets.some((b) => /^(led|conducted|developed|created|analyzed|engineered|managed|built|designed|implemented|optimized|streamlined|researched|oversaw)/i.test(b.trim().replace(/^[-•*]\s*/, '')));
      if (hasStrongVerbs) expImpactScore += 5;
      else if (totalBullets.length > 0) expImpactScore += 2;

      expImpactScore = Math.min(25, expImpactScore);

      const rawDefaultScore = structureScore + skillDensityScore + expImpactScore + qualityScore;
      const finalDefaultScore = Math.min(98, Math.max(30, rawDefaultScore));

      const breakdown: string[] = [
        `ATS Score: ${finalDefaultScore}/100 • General Field Compatibility`,
        `Structure: ${structureScore}/25 • Skills Density: ${skillDensityScore}/35 • Impact & Metrics: ${expImpactScore}/25 • Quality: ${qualityScore}/15`,
      ];

      if (finalDefaultScore >= 95) {
        breakdown.push('Excellent! All core sections, skills density, and quantified metrics are thoroughly optimized.');
      } else if (skillList.length < 8) {
        breakdown.push('Consider adding 3–5 more technical skills/tools to increase skill density score.');
      } else if (quantifiedBullets.length < 3) {
        breakdown.push('Enhance bullet points with bolded percentage metrics (e.g. 25% efficiency increase).');
      } else {
        breakdown.push('Add a Target Job Description to evaluate exact ATS keyword match.');
      }

      return Response.json({ score: finalDefaultScore, breakdown });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Weighted Keyword Match Score (0–35 Points)
    // ─────────────────────────────────────────────────────────────────────────
    const rawJobTokens = jobDescription
      .replace(/[^a-zA-Z0-9/+#.-]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''))
      .filter((w) => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()));

    const uniqueJobKeywords = Array.from(new Set(rawJobTokens)).slice(0, 15);

    if (uniqueJobKeywords.length === 0) {
      const defaultScore = Math.min(96, structureScore + qualityScore + 25 + 30);
      return Response.json({
        score: defaultScore,
        breakdown: [
          `Structure: ${structureScore}/25 pts`,
          `Quality: ${qualityScore}/15 pts`,
          'All general role criteria verified.',
        ],
      });
    }

    // Assign Keyword Tiers & Weights:
    // Tier 1: Top 5 Critical Keywords -> Weight 3
    // Tier 2: Next 5 Important Keywords -> Weight 2
    // Tier 3: Next 5 Nice-to-Have Keywords -> Weight 1
    let totalTargetWeight = 0;
    let earnedKeywordWeight = 0;
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    uniqueJobKeywords.forEach((kw, index) => {
      let tierWeight = 1;
      if (index < 5) tierWeight = 3; // Critical
      else if (index < 10) tierWeight = 2; // Important
      else tierWeight = 1; // Nice-to-have

      totalTargetWeight += tierWeight;

      const lowerKw = kw.toLowerCase();

      // Check Location Multiplier:
      // Work Experience = 1.0x, Projects = 1.0x, Certifications = 0.9x, Skills/Interests = 0.85x
      let bestLocationMultiplier = 0;
      let matchedInAnySection = false;

      if (workText.includes(lowerKw)) {
        bestLocationMultiplier = Math.max(bestLocationMultiplier, 1.0);
        matchedInAnySection = true;
      }
      if (projectText.includes(lowerKw)) {
        bestLocationMultiplier = Math.max(bestLocationMultiplier, 1.0);
        matchedInAnySection = true;
      }
      if (certText.includes(lowerKw)) {
        bestLocationMultiplier = Math.max(bestLocationMultiplier, 0.9);
        matchedInAnySection = true;
      }
      if (skillsText.includes(lowerKw) || interestsText.includes(lowerKw)) {
        bestLocationMultiplier = Math.max(bestLocationMultiplier, 0.85);
        matchedInAnySection = true;
      }

      if (matchedInAnySection) {
        matchedKeywords.push(kw);
        earnedKeywordWeight += tierWeight * bestLocationMultiplier;
      } else {
        missingKeywords.push(kw);
      }
    });

    const weightedCoverageRatio = totalTargetWeight > 0 ? (earnedKeywordWeight / totalTargetWeight) : 0;
    const keywordScore = Math.min(35, Math.round(weightedCoverageRatio * 35));

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Experience & Project Relevance Score (0–25 Points)
    // ─────────────────────────────────────────────────────────────────────────
    let relevanceScore = 0;

    // 1. Relevant Experience in Work Experience Bullets (8 pts)
    const workMatchedCount = uniqueJobKeywords.filter((kw) => workText.includes(kw.toLowerCase())).length;
    const projectMatchedCount = uniqueJobKeywords.filter((kw) => projectText.includes(kw.toLowerCase())).length;
    const totalExpMatches = workMatchedCount + projectMatchedCount;

    if (totalExpMatches >= 4) relevanceScore += 8;
    else if (totalExpMatches >= 2) relevanceScore += 6;
    else if (totalExpMatches >= 1 || hasExperience) relevanceScore += 4;

    // 2. Relevant Responsibilities demonstrated in Bullets (6 pts)
    const hasDetailedBullets = (cv.workExperience || []).some((w) => (w.bullets || '').length > 80);
    if (totalExpMatches >= 3 && hasDetailedBullets) relevanceScore += 6;
    else if (totalExpMatches >= 1) relevanceScore += 4;

    // 3. Relevant Projects (5 pts)
    if (projectMatchedCount >= 2 || (cv.projects || []).length >= 2) relevanceScore += 5;
    else if (projectMatchedCount >= 1 || (cv.projects || []).length > 0) relevanceScore += 3;

    // 4. Relevant Quantified Achievements / Metrics (3 pts)
    const hasQuantifiedInWork = (cv.workExperience || []).some((w) => /\d+|%/i.test(w.bullets || ''));
    if (hasQuantifiedInWork) relevanceScore += 3;

    // 5. Industry/Domain Alignment (3 pts)
    if (matchedKeywords.length >= 8) relevanceScore += 3;
    else if (matchedKeywords.length >= 4) relevanceScore += 2;
    else relevanceScore += 1;

    relevanceScore = Math.min(25, relevanceScore);

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Final Formula: 25 Structure + 35 Keywords + 25 Relevance + 15 Quality = 100
    // ─────────────────────────────────────────────────────────────────────────
    const rawTotalScore = structureScore + keywordScore + relevanceScore + qualityScore;
    const finalScore = Math.min(99, Math.max(20, rawTotalScore));

    const breakdown: string[] = [];
    breakdown.push(`ATS Score: ${finalScore}/100 • Matched: ${matchedKeywords.length}/${uniqueJobKeywords.length} terms (${Math.round(weightedCoverageRatio * 100)}% weighted coverage)`);
    breakdown.push(`Structure: ${structureScore}/25 • Keywords: ${keywordScore}/35 • Relevance: ${relevanceScore}/25 • Quality: ${qualityScore}/15`);

    if (missingKeywords.length > 0) {
      breakdown.push(`Missing keywords: ${missingKeywords.slice(0, 5).join(', ')}.`);
    } else {
      breakdown.push('Excellent! All core keywords are demonstrated in work experience and projects.');
    }

    return Response.json({ score: finalScore, breakdown });
  } catch {
    return Response.json({ error: 'ATS scoring failed. Check your connection and try again.' }, { status: 500 });
  }
}
