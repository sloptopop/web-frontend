# sloptopop.dev (frontend)

The public website, served as static files by Vercel (owner's infrastructure
plan, 2026-10-16). The dynamic parts (waitlist, sign-in, dashboard) call the
website backend at `https://api.sloptopop.dev`, which lives in the `web`
repository and runs as a Docker service on Render.

- `public/`: everything Vercel serves; no build step, no JavaScript framework.
  htmx (vendored, `public/assets/vendor/`) is the only script, and only on
  pages that talk to the backend.
- `vercel.json`: strict CSP (no inline script or style), HSTS, no framing,
  long-lived caching for `/assets/`.

## Deploy (owner)

1. Create the GitHub repository and push this one.
2. In Vercel, import it with framework preset "Other": no build command,
   output directory `public` (also set in `vercel.json`).
3. Add the domain `sloptopop.dev`; `api.sloptopop.dev` points at Render.

The Vercel Hobby plan is for non-commercial use only: a commercial launch
needs the Pro plan.

## Status

`public/index.html` is a placeholder. The full "Slop → Pop" landing page,
the coverage and transformations pages are being ported here from the
`web` repository's templates (launch work package L6).
