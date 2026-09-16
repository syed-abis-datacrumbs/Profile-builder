import { describe, expect, test } from 'bun:test';
import {
  cleanSingleBulletLine,
  cleanBulletText,
  mdBoldToHtml,
  cvMarkdownToHtml,
  CvData,
} from '../cvTypes';

describe('Bullet & Markdown Bold Normalization', () => {
  describe('cleanSingleBulletLine', () => {
    test('removes single leading bullet marker and whitespace', () => {
      expect(cleanSingleBulletLine('• Developed AI models')).toBe('Developed AI models');
      expect(cleanSingleBulletLine('- Built machine learning')).toBe('Built machine learning');
      expect(cleanSingleBulletLine('* Automated pipeline')).toBe('Automated pipeline');
      expect(cleanSingleBulletLine('– Implemented RLHF')).toBe('Implemented RLHF');
    });

    test('removes double bullet markers (• • )', () => {
      expect(
        cleanSingleBulletLine(
          '• • Developed AI models using machine learning algorithms'
        )
      ).toBe('Developed AI models using machine learning algorithms');

      expect(cleanSingleBulletLine('• - Spearheaded migration')).toBe(
        'Spearheaded migration'
      );
    });

    test('preserves negative numbers without space after dash', () => {
      expect(cleanSingleBulletLine('-5% latency reduction')).toBe(
        '-5% latency reduction'
      );
      expect(cleanSingleBulletLine('• -5% cost reduction')).toBe(
        '-5% cost reduction'
      );
    });
  });

  describe('mdBoldToHtml', () => {
    test('converts double asterisks to strong tags', () => {
      expect(
        mdBoldToHtml('achieving a **15% cost reduction** for 3 small businesses')
      ).toBe('achieving a <strong>15% cost reduction</strong> for 3 small businesses');

      expect(mdBoldToHtml('achieving a **92% ROUGE score**')).toBe(
        'achieving a <strong>92% ROUGE score</strong>'
      );
    });

    test('converts double underscores to strong tags', () => {
      expect(mdBoldToHtml('supporting __14 languages__')).toBe(
        'supporting <strong>14 languages</strong>'
      );
    });
  });

  describe('cvMarkdownToHtml', () => {
    test('normalizes an imported resume CV object with double bullets and markdown bold', () => {
      const rawImportedCv: CvData = {
        personalInfo: {
          fullName: 'Test Candidate',
          phone: '1234567890',
          email: 'test@example.com',
          linkedin: '',
          github: '',
          githubLabel: 'GitHub',
          kaggle: '',
          kaggleLabel: 'Kaggle',
        },
        education: [],
        workExperience: [
          {
            company: 'DataCrumbs',
            title: 'AI Engineer (Intern)',
            start: 'Nov 2024',
            end: 'Dec 2024',
            bullets:
              '• • Developed AI models using machine learning algorithms, achieving a **15% cost reduction** for 3 small businesses.\n• • Automated pipelines in Python, cutting manual reporting by **80%**.\n• • Implemented RLHF, enhancing relevance by **30%**.',
          },
        ],
        projects: [
          {
            content:
              '• LegalSummarizeAI (OpenAI GPT, Hugging Face) – Fine-tuned a domain-specific LLM, achieving a **92% ROUGE score**; reduced contract review time by **48%**.',
          },
        ],
        certifications: [],
        additional: {
          skills: 'Python, **Machine Learning**, PyTorch',
          interests: 'Artificial Intelligence',
        },
      };

      const cleaned = cvMarkdownToHtml(rawImportedCv);

      // Work experience assertions
      expect(cleaned.workExperience[0].bullets).toBe(
        'Developed AI models using machine learning algorithms, achieving a <strong>15% cost reduction</strong> for 3 small businesses.\nAutomated pipelines in Python, cutting manual reporting by <strong>80%</strong>.\nImplemented RLHF, enhancing relevance by <strong>30%</strong>.'
      );

      // Project content assertions
      expect(cleaned.projects[0].content).toBe(
        'LegalSummarizeAI (OpenAI GPT, Hugging Face) – Fine-tuned a domain-specific LLM, achieving a <strong>92% ROUGE score</strong>; reduced contract review time by <strong>48%</strong>.'
      );

      // Skills assertions
      expect(cleaned.additional.skills).toBe(
        'Python, <strong>Machine Learning</strong>, PyTorch'
      );
    });
  });
});
