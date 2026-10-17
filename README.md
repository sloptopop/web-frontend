# sloptopop.dev (frontend)

The public website, served as static files by Vercel (owner's infrastructure
plan, 2026-10-16). The dynamic parts (waitlist, sign-in, dashboard) call the
website backend at `https://api.sloptopop.dev`, which lives in the `web`
repository and runs as a Docker service on Render.

- `public/`: everything Vercel serves; no build step, no JavaScript framework.
  **Generated, never edited by hand:** the `web` repository renders every
  page from its Askama templates and `web/scripts/export-frontend.sh
  <this repo>` replaces `public/` with the result. htmx (vendored and
  hash-pinned, `public/assets/htmx-2.0.11.min.js`) is the only script, and
  only on the Pricing page, which sends the waitlist form to the backend.
- `vercel.json`: strict CSP (no inline script or style; fetches and form
  posts only to `https://api.sloptopop.dev`), HSTS, no framing, the same
  Permissions-Policy as the backend, and one day of caching for `/assets/`
  (the backend's value; the asset names are not content-hashed, so longer
  caching would keep old styles on returning visitors).
  Clean URLs serve `/coverage` from `coverage.html` and a language tab
  from `/lang/<id>`; `404.html` is the not-found page.

## Password gate (until the owner opens the site)

`middleware.js` is Vercel Routing Middleware: server-side code Vercel runs
at the edge before serving any file (the browser never runs it, so the
site still ships no JavaScript of its own except htmx on Pricing). It
requires HTTP Basic auth on every path with the password in the Vercel
environment variable `SITE_PASSWORD` (any user name, or `SITE_USER` if
set). If `SITE_PASSWORD` is unset it answers `503` for everything (fail
closed); `SITE_ACCESS=open` turns the gate off. It compares SHA-256 digests
in constant time and has no dependencies. Vercel's own password protection
is a paid feature; this needs none.

While the site is protected, `vercel.json` sends `X-Robots-Tag: noindex,
nofollow` on every response and `public/robots.txt` disallows everything.
To open the site: set `SITE_ACCESS=open` (Vercel and Render), remove that
header from `vercel.json`, and change `robots.txt` in the `web` repository
(`src/robots.rs`) before the next export.

## Deploy (owner)

1. Create the GitHub repository and push this one.
2. In Vercel, import it with framework preset "Other": no build command,
   output directory `public` (also set in `vercel.json`).
3. Add the domain `sloptopop.dev`; `api.sloptopop.dev` points at Render.
4. Set the environment variable `SITE_PASSWORD` (Production and Preview)
   to the password you choose; it is never stored in this repository.
   Check: https://sloptopop.dev asks for a password, and answers with the
   site once it is given.

The Vercel Hobby plan is for non-commercial use only: a commercial launch
needs the Pro plan.

## Pages

Landing ("Slop → Pop", with the real-results codebase explorer and one
copy per language tab under `lang/`), Transformations (A to Z), Results,
Compliance, Coverage, Pricing (waitlist), and the draft Privacy, Terms
and Imprint pages.
