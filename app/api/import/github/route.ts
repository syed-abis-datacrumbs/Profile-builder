import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/lib/adminAuth';
import { GithubProfileData } from '../../../../types';
import { CvProject } from '../../../../lib/cvTypes';
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiNotFound,
  apiError,
  apiServerError,
} from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return apiUnauthorized('Unauthorized: Please sign in to import.');
  }
  const authorized = await isUserAdmin(user);
  if (!authorized) {
    return apiForbidden(
      'The Import feature is currently in private testing for administrators. Coming soon for all users!'
    );
  }

  const { searchParams } = new URL(req.url);
  const rawUsername = searchParams.get('username')?.trim() || '';

  // Clean full URLs (e.g. https://github.com/username), @mentions, trailing slashes
  const username = rawUsername
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .split('/')[0]
    .split('?')[0]
    .trim();

  if (!username) {
    return apiBadRequest('GitHub username is required.');
  }

  try {
    const headers = {
      'User-Agent': 'Momentum-Profile-Builder-App',
      Accept: 'application/vnd.github.v3+json',
    };

    // 1. Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) {
        return apiNotFound(`GitHub user "${username}" was not found.`);
      }
      return apiError('Failed to fetch GitHub profile. Rate limit may have been reached.', userRes.status);
    }
    const user = await userRes.json();

    // 2. Fetch top public repos sorted by most recently pushed
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=6&type=owner`,
      { headers }
    );
    const repos: any[] = reposRes.ok ? await reposRes.json() : [];

    // Collect languages & tech
    const languageSet = new Set<string>();
    repos.forEach((r) => {
      if (r.language) languageSet.add(r.language);
      if (Array.isArray(r.topics)) {
        r.topics.forEach((t: string) => languageSet.add(t));
      }
    });

    const detectedTech = Array.from(languageSet).slice(0, 12);
    if (detectedTech.length === 0) {
      detectedTech.push('JavaScript', 'TypeScript', 'Git');
    }

    // Build markdown for featured projects in README
    const projectCardsMarkdown = repos
      .slice(0, 4)
      .map((r) => {
        const demoLink = r.homepage ? ` | [Live Demo](${r.homepage})` : '';
        const langBadge = r.language ? `\`${r.language}\`` : '`Open Source`';
        return `### [${r.name}](${r.html_url})\n${r.description || 'High-impact project hosted on GitHub.'}\n- **Stack**: ${langBadge}${demoLink}\n- **Stars**: ⭐ ${r.stargazers_count || 0}\n`;
      })
      .join('\n');

    const githubProfileData: GithubProfileData = {
      username: user.login,
      name: user.name || user.login,
      title: user.bio ? user.bio.split('\n')[0] : 'Software Engineer & Open Source Developer',
      about: user.bio || `Software engineer actively building modern applications. Creator of ${user.public_repos || 0} public repositories.`,
      avatarUrl: user.avatar_url,
      techStack: detectedTech,
      showStatsCard: true,
      showStreakCard: true,
      showTopLangsCard: true,
      theme: 'dark',
      socialLinks: {
        website: user.blog ? (user.blog.startsWith('http') ? user.blog : `https://${user.blog}`) : undefined,
        twitter: user.twitter_username ? `https://twitter.com/${user.twitter_username}` : undefined,
      },
      customSections: [
        {
          title: '🚀 Featured Open Source Projects',
          content: projectCardsMarkdown || 'Check out my repositories on GitHub!',
        },
      ],
    };

    // Format CV projects ready to be injected into ResumeData
    const cvProjects: CvProject[] = repos.slice(0, 4).map((r) => ({
      content: `<strong>${r.name}</strong> (${r.language || 'Open Source'}) – ${r.description || 'Engineered modern open-source tool with automated CI/CD and modular architecture.'}`,
      link: r.html_url,
      linkLabel: '[GitHub]',
    }));

    return apiSuccess({
      success: true,
      githubProfileData,
      cvProjects,
      cvSkills: detectedTech,
      userInfo: {
        name: user.name || user.login,
        login: user.login,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        publicRepos: user.public_repos,
        followers: user.followers,
      },
    });
  } catch (err: any) {
    return apiServerError(err.message || 'Failed to communicate with GitHub API.', err);
  }
}
