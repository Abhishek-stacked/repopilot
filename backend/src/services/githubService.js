import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth';

// The callback must be byte-identical to the one registered on the GitHub
// OAuth App, so it is derived from the host the visitor actually arrived on
// rather than a baked-in URL that goes stale when the service is renamed.
export function resolveCallbackUrl(req) {
  const proto = req?.headers?.['x-forwarded-proto'] || (req?.secure ? 'https' : 'http');
  // req.hostname drops the port, which produced a callback GitHub rejects for
  // any deployment not on 80/443. The Host header keeps it (localhost:3001 in
  // dev, the Render domain on 443), and GitHub still refuses to authorize a
  // redirect_uri that is not registered on the OAuth App.
  const host = req?.headers?.host || req?.hostname;
  const derived = `${proto}://${host}/api/auth/github/callback`;

  // GITHUB_CALLBACK_URL is only an escape hatch for a proxied custom domain;
  // using it blindly is what pointed every OAuth attempt at a host that no
  // longer exists. If it disagrees with the host serving this request, the
  // request wins, because that is the host GitHub will come back to.
  const configured = process.env.GITHUB_CALLBACK_URL;
  if (configured && configured === derived) return configured;
  if (configured) {
    console.warn(
      `[GitHub OAuth] GITHUB_CALLBACK_URL (${configured}) does not match the request host; using ${derived}. Register that callback URL on the OAuth App.`
    );
  }
  return derived;
}

export function getOAuthUrl(state = '', req) {
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const redirectUri = resolveCallbackUrl(req);
  const scope = 'read:user user:email repo';

  return `${GITHUB_OAUTH_URL}/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
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
