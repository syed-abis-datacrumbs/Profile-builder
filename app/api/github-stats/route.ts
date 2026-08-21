import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.trim();
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  try {
    const headers: HeadersInit = { 'User-Agent': 'Profile-Builder-App' };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        next: { revalidate: 1800 },
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
        { headers, next: { revalidate: 1800 } }
      ),
    ]);

    if (!userRes.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: userRes.status });
    }

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    let totalStars = 0;
    const langCounts: Record<string, number> = {};

    if (Array.isArray(repos)) {
      for (const r of repos) {
        if (!r.fork) {
          totalStars += r.stargazers_count || 0;
          if (r.language) {
            langCounts[r.language] = (langCounts[r.language] || 0) + 1;
          }
        }
      }
    }

    const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({
        name: lang,
        pct: Math.round((count / totalLangs) * 100),
      }));

    return NextResponse.json({
      name: user.name || username,
      publicRepos: user.public_repos || 0,
      followers: user.followers || 0,
      following: user.following || 0,
      totalStars,
      topLanguages,
      avatarUrl: user.avatar_url,
      bio: user.bio,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch GitHub stats' }, { status: 500 });
  }
}
