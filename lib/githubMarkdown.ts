import { GithubProfileData } from '../types';

// Shields badge slug/color for known techs; unknowns fall back to the tech name
// as the logo slug (matches the editor's behavior).
const BADGES: Record<string, { color: string; logo: string }> = {
  typescript: { color: '3178C6', logo: 'typescript' },
  javascript: { color: 'F7DF1E', logo: 'javascript' },
  react: { color: '61DAFB', logo: 'react' },
  'next.js': { color: '000000', logo: 'next.js' },
  python: { color: '3776AB', logo: 'python' },
  pytorch: { color: 'EE4C2C', logo: 'pytorch' },
  fastapi: { color: '009688', logo: 'fastapi' },
  'node.js': { color: '339933', logo: 'node.js' },
  tailwindcss: { color: '06B6D4', logo: 'tailwindcss' },
  postgresql: { color: '4169E1', logo: 'postgresql' },
  docker: { color: '2496ED', logo: 'docker' },
  git: { color: 'F05032', logo: 'git' },
};

/** Builds the GitHub profile README.md from the profile data (same output as
 *  the classic editor's generator). */
export function generateGithubMarkdown(data: GithubProfileData): string {
  let md = '';

  // Full-width banner at the top of the README (like the LMS GitHub builder).
  if (data.bannerUrl) {
    md += `<img width="100%" src="${data.bannerUrl}" alt="Banner" />\n\n`;
  }

  md += `# ${data.title}\n\n${data.about}\n\n`;

  if (data.techStack.length > 0) {
    md += `### 🛠️ Tech Stack & Skills\n\n`;
    data.techStack.forEach((tech) => {
      const b = BADGES[tech.toLowerCase()] ?? { color: '6366f1', logo: tech.toLowerCase().replace(/\s+/g, '') };
      md += `![${tech}](https://img.shields.io/badge/${encodeURIComponent(tech)}-${b.color}?style=for-the-badge&logo=${encodeURIComponent(b.logo)}&logoColor=white) `;
    });
    md += `\n\n`;
  }

  if (data.showStatsCard || data.showStreakCard || data.showTopLangsCard) {
    md += `### 📊 GitHub Analytics\n\n<p align="center">\n`;
    if (data.showStatsCard)
      md += `  <img src="https://github-readme-stats-ten-kohl-77.vercel.app/api?username=${data.username}&show_icons=true&theme=${data.theme}" alt="GitHub Stats" />\n`;
    if (data.showTopLangsCard)
      md += `  <img src="https://github-readme-stats-ten-kohl-77.vercel.app/api/top-langs/?username=${data.username}&layout=compact&theme=${data.theme}" alt="Top Languages" />\n`;
    if (data.showStreakCard)
      md += `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${data.username}&theme=${data.theme}" alt="GitHub Streak" />\n`;
    md += `</p>\n\n`;
  }

  data.customSections?.forEach((sec) => {
    md += `### ${sec.title}\n${sec.content}\n\n`;
  });

  const s = data.socialLinks;
  if (s.linkedin || s.twitter || s.email || s.website) {
    md += `### 🌐 Connect With Me\n\n`;
    if (s.linkedin) md += `[<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />](${s.linkedin}) `;
    if (s.twitter) md += `[<img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" />](${s.twitter}) `;
    if (s.email) md += `[<img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" />](mailto:${s.email}) `;
    if (s.website) md += `[<img src="https://img.shields.io/badge/Website-4338CA?style=for-the-badge&logo=googlechrome&logoColor=white" />](${s.website}) `;
    md += `\n`;
  }

  return md;
}
