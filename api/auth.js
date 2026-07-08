const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const SITE_URL  = process.env.SITE_URL || 'https://brandbook-rnf.vercel.app';

export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: `${SITE_URL}/api/callback`,
  });
  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
