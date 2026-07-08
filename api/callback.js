const CLIENT_ID     = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
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
}
