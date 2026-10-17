// Vercel Routing Middleware (server-side edge code; browsers never run it):
// HTTP Basic auth on the whole static site until the owner opens it.
// SITE_PASSWORD (any user name, or SITE_USER if set); unset fails closed
// with 503; SITE_ACCESS=open turns the gate off. No dependencies.
export const config = { matcher: '/:path*' };

const deny = (status, body, extra = {}) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', ...extra },
  });

// Compares SHA-256 digests byte by byte, so the time taken does not depend
// on the guess or its length.
async function same(a, b) {
  const digest = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  return x.reduce((diff, byte, i) => diff | (byte ^ y[i]), 0) === 0;
}

export default async function middleware(request) {
  if (process.env.SITE_ACCESS === 'open') return undefined;
  const password = process.env.SITE_PASSWORD;
  if (!password) return deny(503, 'this site is not open yet\n');
  const [scheme = '', encoded = ''] = (request.headers.get('authorization') || '').split(' ');
  let pair = '';
  try {
    pair = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
  } catch {
    pair = '';
  }
  const at = pair.indexOf(':');
  const wanted = process.env.SITE_USER;
  const passwordOk = await same(at < 0 ? '' : pair.slice(at + 1), password);
  const userOk = !wanted || (await same(pair.slice(0, Math.max(at, 0)), wanted));
  if (scheme.toLowerCase() === 'basic' && at >= 0 && passwordOk && userOk) return undefined;
  return deny(401, 'authentication required\n', { 'www-authenticate': 'Basic realm="sloptopop", charset="UTF-8"' });
}
