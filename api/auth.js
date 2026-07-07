const CLIENT_ID     = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const SITE_URL      = process.env.SITE_URL || 'https://brandbook-rnf.vercel.app';

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);

  // /api/auth → inicia o fluxo OAuth redirecionando para o GitHub
  if (url.pathname === '/api/auth') {
    const state = Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo,user',
      state,
      redirect_uri: `${SITE_URL}/api/callback`,
    });
    res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
    return;
  }

  // /api/callback → recebe o code do GitHub e troca pelo token
  if (url.pathname === '/api/callback') {
    const code = url.searchParams.get('code');
    if (!code) {
      res.status(400).send('Código OAuth ausente.');
      return;
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const { access_token, error } = await tokenRes.json();

    if (error || !access_token) {
      res.status(400).send(`Erro ao obter token: ${error}`);
      return;
    }

    // Envia o token para a janela do CMS via postMessage e fecha o popup
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body><script>
      (function() {
        var msg = JSON.stringify({ token: "${access_token}", provider: "github" });
        window.opener && window.opener.postMessage(
          "authorization:github:success:" + msg, "*"
        );
        window.close();
      })();
    </script></body></html>`);
    return;
  }

  res.status(404).send('Not found');
}
