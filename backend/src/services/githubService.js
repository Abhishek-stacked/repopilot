import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth';

export function getOAuthUrl(state = '') {
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const redirectUri = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback';
  const scope = 'read:user user:email repo';

  return `${GITHUB_OAUTH_URL}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
}

export async function exchangeCodeForToken(code) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured in environment');
  }

  const response = await axios.post(
    `${GITHUB_OAUTH_URL}/access_token`,
    {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    },
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (response.data.error) {
    throw new Error(`GitHub OAuth error: ${response.data.error_description || response.data.error}`);
  }

  return response.data.access_token;
}

export async function fetchUserProfile(accessToken) {
  const [userRes, emailRes] = await Promise.all([
    axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }),
    axios.get(`${GITHUB_API_URL}/user/emails`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }).catch(() => ({ data: [] })),
  ]);

  const primaryEmail = (emailRes.data && emailRes.data.find(e => e.primary && e.verified)?.email) ||
                       userRes.data.email ||
                       `${userRes.data.login}@users.noreply.github.com`;

  return {
    githubId: userRes.data.id,
    githubUsername: userRes.data.login,
    name: userRes.data.name || userRes.data.login,
    email: primaryEmail,
    avatarUrl: userRes.data.avatar_url,
  };
}

export async function fetchUserRepositories(accessToken) {
  const response = await axios.get(`${GITHUB_API_URL}/user/repos?per_page=100&sort=updated`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  return response.data.map((repo) => ({
    githubRepoId: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || '',
    language: repo.language || 'Unknown',
    isPrivate: repo.private,
    defaultBranch: repo.default_branch || 'main',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    sizeKb: repo.size,
    htmlUrl: repo.html_url,
  }));
}

export async function fetchRepositoryTree(accessToken, owner, repo, branch = 'main') {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );

  return response.data.tree
    .filter((node) => node.type === 'blob')
    .map((node) => ({
      path: node.path,
      size: node.size,
      sha: node.sha,
    }));
}

export async function fetchFileContent(accessToken, owner, repo, filePath, branch = 'main') {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );

  if (response.data.encoding === 'base64') {
    return Buffer.from(response.data.content, 'base64').toString('utf8');
  }
  return response.data;
}
