export type TemplateCategory =
  | 'all'
  | 'data-ai'
  | 'web'
  | 'devops'
  | 'mobile'
  | 'design'
  | 'business';

export interface CategoryTab {
  id: TemplateCategory;
  label: string;
}

export const TEMPLATE_CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All Templates' },
  { id: 'data-ai', label: 'Data Science & AI' },
  { id: 'web', label: 'Web & Full Stack' },
  { id: 'devops', label: 'DevOps & Systems' },
  { id: 'mobile', label: 'Mobile App' },
  { id: 'design', label: 'Design & Creative' },
  { id: 'business', label: 'Product & Business' },
];

/**
 * Maps a LinkedIn Cover template ID to its primary category.
 */
export function getLinkedinCoverCategory(templateId: string): TemplateCategory {
  switch (templateId) {
    case 'ideas-inspire': // AI/ML Engineer
    case 'lets-work-together': // Data Science
    case 'blue-blocks': // Data Analytics
    case 'data-engineer':
    case 'mlops-engineer':
    case 'business-intelligence-analyst':
    case 'computer-vision-engineer':
    case 'database-administrator':
      return 'data-ai';

    case 'helping-businesses': // Full Stack Developer
    case 'stunning-websites': // Frontend Developer
    case 'purple-geometric': // Software Engineer
    case 'backend-developer':
    case 'qa-test-automation':
    case 'game-developer':
    case 'blockchain-web3-developer':
      return 'web';

    case 'yellow-wave': // Cyber Security
    case 'devops-engineer':
    case 'cloud-engineer':
    case 'network-engineer':
    case 'embedded-iot-engineer':
      return 'devops';

    case 'mobile-app-developer':
      return 'mobile';

    case 'ui-ux-designer':
    case 'graphic-designer':
    case 'video-editor':
      return 'design';

    case 'ai-engineer-badge': // Digital Marketing
    case 'hr-talent-acquisition':
    case 'product-manager-tech':
    case 'business-analyst-it':
    case 'technical-writer':
      return 'business';

    default:
      return 'web';
  }
}

/**
 * Maps a Resume sample label to its primary category.
 */
export function getResumeSampleCategory(sampleLabel: string): TemplateCategory {
  const lower = sampleLabel.toLowerCase();

  // Mobile
  if (lower.includes('mobile')) return 'mobile';

  // Design & Creative
  if (lower.includes('ui/ux') || lower.includes('graphic') || lower.includes('video editor')) {
    return 'design';
  }

  // Product & Business
  if (
    lower.includes('product manager') ||
    lower.includes('business analyst') ||
    lower.includes('digital marketing') ||
    lower.includes('technical writer') ||
    lower.includes('hr')
  ) {
    return 'business';
  }

  // DevOps, Cloud & Systems
  if (
    lower.includes('devops') ||
    lower.includes('cloud') ||
    lower.includes('cyber security') ||
    lower.includes('network') ||
    lower.includes('embedded') ||
    lower.includes('iot')
  ) {
    return 'devops';
  }

  // Data Science & AI
  if (
    lower.includes('ai/ml') ||
    lower.includes('data science') ||
    lower.includes('data analytics') ||
    lower.includes('data engineer') ||
    lower.includes('mlops') ||
    lower.includes('business intelligence') ||
    lower.includes('computer vision') ||
    lower.includes('database administrator')
  ) {
    return 'data-ai';
  }

  // Web & Full Stack / Software
  return 'web';
}
