import { describe, it, expect } from 'bun:test';
import { applyJsonPatches } from './jsonPatch';

describe('applyJsonPatches - Resilient JSON Patch Engine', () => {
  it('preserves existing bullets and appends when op: "add" is applied to /bullets', () => {
    const doc = {
      workExperience: [
        {
          company: 'Creative Media Productions',
          title: 'Senior Video Editor',
          bullets: 'Collaborated with clients to understand their vision and deliver tailored video solutions, resulting in a <strong>25% increase</strong> in client satisfaction.',
        },
      ],
    };

    const patches = [
      {
        op: 'add',
        path: '/workExperience/0/bullets',
        value: 'Produced and edited over 50 promotional videos, enhancing brand storytelling and achieving a <strong>40% increase</strong> in viewer engagement.',
      },
    ];

    const result = applyJsonPatches(doc, patches);
    expect(result.success).toBe(true);

    const lines = result.document.workExperience[0].bullets.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[0]).toContain('Collaborated with clients');
    expect(lines[1]).toContain('Produced and edited over 50 promotional videos');
  });

  it('handles consecutive "add" operations without deleting prior bullets', () => {
    let doc = {
      workExperience: [
        {
          company: 'Acme',
          bullets: 'Bullet 1',
        },
      ],
    };

    // First addition
    let res = applyJsonPatches(doc, [
      { op: 'add', path: '/workExperience/0/bullets', value: 'Bullet 2' },
    ]);
    expect(res.success).toBe(true);
    expect(res.document.workExperience[0].bullets.split('\n')).toEqual(['Bullet 1', 'Bullet 2']);

    // Second addition
    res = applyJsonPatches(res.document, [
      { op: 'add', path: '/workExperience/0/bullets', value: 'Bullet 3' },
    ]);
    expect(res.success).toBe(true);
    expect(res.document.workExperience[0].bullets.split('\n')).toEqual([
      'Bullet 1',
      'Bullet 2',
      'Bullet 3',
    ]);
  });

  it('normalizes array-like paths on string bullets (/workExperience/0/bullets/-)', () => {
    const doc = {
      workExperience: [
        {
          company: 'Acme',
          bullets: 'Bullet 1',
        },
      ],
    };

    const res = applyJsonPatches(doc, [
      { op: 'add', path: '/workExperience/0/bullets/-', value: 'Bullet 2' },
    ]);
    expect(res.success).toBe(true);
    expect(res.document.workExperience[0].bullets.split('\n')).toEqual(['Bullet 1', 'Bullet 2']);
  });

  it('resiliently appends skills and interests on op: "add"', () => {
    const doc = {
      additional: {
        skills: 'JavaScript, TypeScript',
        interests: 'AI, Robotics',
      },
    };

    const patches = [
      { op: 'add', path: '/additional/skills', value: 'Docker' },
      { op: 'add', path: '/additional/interests', value: 'Cloud Computing' },
    ];

    const res = applyJsonPatches(doc, patches);
    expect(res.success).toBe(true);
    expect(res.document.additional.skills).toBe('JavaScript, TypeScript, Docker');
    expect(res.document.additional.interests).toBe('AI, Robotics, Cloud Computing');
  });

  it('does not duplicate existing identical bullets on op: "add"', () => {
    const doc = {
      workExperience: [
        {
          bullets: 'Bullet 1\nBullet 2',
        },
      ],
    };

    const res = applyJsonPatches(doc, [
      { op: 'add', path: '/workExperience/0/bullets', value: 'Bullet 2' },
    ]);
    expect(res.success).toBe(true);
    expect(res.document.workExperience[0].bullets.split('\n')).toEqual(['Bullet 1', 'Bullet 2']);
  });

  it('supports op: "remove" with line-level subtraction without wiping property', () => {
    const doc = {
      workExperience: [
        {
          bullets: 'Bullet 1\nBullet 2\nBullet 3',
        },
      ],
    };

    const res = applyJsonPatches(doc, [
      { op: 'remove', path: '/workExperience/0/bullets', value: 'Bullet 2' },
    ]);
    expect(res.success).toBe(true);
    expect(res.document.workExperience[0].bullets.split('\n')).toEqual(['Bullet 1', 'Bullet 3']);
  });

  it('supports standard RFC 6902 array operations', () => {
    const doc = {
      items: ['a', 'b', 'c'],
    };

    // Add at end
    const resAdd = applyJsonPatches(doc, [{ op: 'add', path: '/items/-', value: 'd' }]);
    expect(resAdd.document.items).toEqual(['a', 'b', 'c', 'd']);

    // Remove index 1
    const resRem = applyJsonPatches(doc, [{ op: 'remove', path: '/items/1' }]);
    expect(resRem.document.items).toEqual(['a', 'c']);

    // Replace index 0
    const resRep = applyJsonPatches(doc, [{ op: 'replace', path: '/items/0', value: 'z' }]);
    expect(resRep.document.items).toEqual(['z', 'b', 'c']);
  });

  it('handles multiple array removals in ascending or descending index order without index shift errors', () => {
    const doc = {
      certifications: ['AWS', 'Azure', 'K8s', 'GCP'],
    };

    // Removing indices 2 and 3 emitted in ascending order
    const patches = [
      { op: 'remove', path: '/certifications/2' },
      { op: 'remove', path: '/certifications/3' },
    ];

    const res = applyJsonPatches(doc, patches, { allowPartial: true });
    expect(res.success).toBe(true);
    expect(res.document.certifications).toEqual(['AWS', 'Azure']);
  });

  it('removes the first project from customSections content without deleting content key when op: "remove" is emitted without value', () => {
    const doc = {
      customSections: [
        {
          title: '🚀 Featured Projects',
          content:
            '### Distributed Task Queue (Go, Redis) – Built a fault-tolerant task queue.\n\n### Real-Time Chat Backend (Node.js, WebSockets, MongoDB) – Engineered a scalable chat service.\n\n',
        },
      ],
    };

    // LLM emitted op: "remove" on /customSections/0/content without value to remove the first project
    const patches = [{ op: 'remove', path: '/customSections/0/content' }];

    const res = applyJsonPatches(doc, patches);
    expect(res.success).toBe(true);
    expect(res.document.customSections[0].content).toBeDefined();
    expect(res.document.customSections[0].content).not.toContain('Distributed Task Queue');
    expect(res.document.customSections[0].content).toContain('Real-Time Chat Backend');
  });

  it('removes project matching value when op: "remove" specifies value string', () => {
    const doc = {
      customSections: [
        {
          title: '🚀 Featured Projects',
          content:
            '### Distributed Task Queue (Go, Redis) – Built a fault-tolerant task queue.\n\n### Real-Time Chat Backend (Node.js, WebSockets, MongoDB) – Engineered a scalable chat service.\n\n### CI/CD Pipeline Automation – Automated build and deploy.',
        },
      ],
    };

    const patches = [
      {
        op: 'remove',
        path: '/customSections/0/content',
        value: '### CI/CD Pipeline Automation – Automated build and deploy.',
      },
    ];

    const res = applyJsonPatches(doc, patches);
    expect(res.success).toBe(true);
    expect(res.document.customSections[0].content).toContain('Distributed Task Queue');
    expect(res.document.customSections[0].content).toContain('Real-Time Chat Backend');
    expect(res.document.customSections[0].content).not.toContain('CI/CD Pipeline Automation');
  });

  it('removes target index when path uses array-like notation on content string (/customSections/0/content/0)', () => {
    const doc = {
      customSections: [
        {
          title: '🚀 Featured Projects',
          content:
            '### Project Alpha – First project.\n\n### Project Beta – Second project.\n\n### Project Gamma – Third project.',
        },
      ],
    };

    const patches = [{ op: 'remove', path: '/customSections/0/content/0' }];

    const res = applyJsonPatches(doc, patches);
    expect(res.success).toBe(true);
    expect(res.document.customSections[0].content).not.toContain('Project Alpha');
    expect(res.document.customSections[0].content).toContain('Project Beta');
    expect(res.document.customSections[0].content).toContain('Project Gamma');
  });
});
