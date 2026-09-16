import { describe, expect, it } from 'bun:test';
import { normalizeCvData } from './previewNormalizers';

describe('normalizeCvData summary normalization', () => {
  it('preserves top-level summary string and converts bold markdown to strong', () => {
    const raw = {
      summary: 'Results-driven **MERN stack** developer with expertise in building dynamic web apps.',
      personalInfo: { fullName: 'Zoya Siddiqui' },
    };

    const cv = normalizeCvData(raw);
    expect(cv.summary).toBe('Results-driven <strong>MERN stack</strong> developer with expertise in building dynamic web apps.');
  });

  it('falls back to personalInfo.summary if raw.summary is not at the root', () => {
    const raw = {
      personalInfo: {
        fullName: 'Zoya Siddiqui',
        summary: 'Detail-oriented AI Engineer with hands-on experience.',
      },
    };

    const cv = normalizeCvData(raw);
    expect(cv.summary).toBe('Detail-oriented AI Engineer with hands-on experience.');
  });

  it('handles array-based summary lines gracefully', () => {
    const raw = {
      summary: ['Line 1 of summary.', 'Line 2 of summary.'],
    };

    const cv = normalizeCvData(raw);
    expect(cv.summary).toBe('Line 1 of summary. Line 2 of summary.');
  });

  it('leaves summary undefined when not provided so empty summary does not render', () => {
    const raw = {
      personalInfo: { fullName: 'Jane Doe' },
    };

    const cv = normalizeCvData(raw);
    expect(cv.summary).toBeUndefined();
  });
});
