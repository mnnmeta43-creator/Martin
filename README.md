# Voltex

Landing page + checkout for Voltex, deployed on Netlify. Customers buy through
a Lemon Squeezy checkout, and every client's email is captured — either
through the on-page registration form or automatically from completed Lemon
Squeezy orders via webhook.

## What's here

- `public/` — the static site (`index.html`, styles, client-side JS). This is
  what Netlify serves.
- `netlify/functions/lemonsqueezy-webhook.js` — receives Lemon Squeezy webhook
  events, verifies the signature, and records the buyer's email.
- `netlify/functions/lib/clients.js` — shared helper that logs every new
  client and optionally forwards it to `CLIENTS_WEBHOOK_URL` (Zapier, Make,
  Google Sheets webhook, your own API, etc.) for durable storage.
- `scripts/generate-config.js` — writes `public/js/config.js` at build time
  from the `LEMONSQUEEZY_CHECKOUT_URL` environment variable, so the checkout
  link can be changed from the Netlify dashboard without touching code.
- `netlify.toml` — build/publish/functions configuration for Netlify.

## Setting up Lemon Squeezy

1. Create your product in Lemon Squeezy and copy its checkout URL (Product >
   Share).
2. In Netlify: **Site settings > Environment variables**, set:
   - `LEMONSQUEEZY_CHECKOUT_URL` — the checkout URL from step 1.
   - `LEMONSQUEEZY_WEBHOOK_SECRET` — the signing secret from Lemon Squeezy >
     Settings > Webhooks.
   - `CLIENTS_WEBHOOK_URL` (optional) — where to forward every registered
     client (form signups and completed orders).
3. In Lemon Squeezy: **Settings > Webhooks**, add an endpoint pointing to
   `https://<your-site>.netlify.app/.netlify/functions/lemonsqueezy-webhook`
   and subscribe to at least `order_created`.
4. Redeploy so `scripts/generate-config.js` picks up the new
   `LEMONSQUEEZY_CHECKOUT_URL`.

See `.env.example` for the full list of variables.

## Email registration

The "Regjistrohu me Email" form on the homepage is a native [Netlify
Form](https://docs.netlify.com/manage/forms/setup/) — submissions are stored
and viewable in the Netlify dashboard, and you can enable an email
notification per submission under **Site settings > Forms > Form
notifications**. No database is required.

## Login / account registration app (`public/voltex-installueshem/`)

Alongside the simple email-capture form above, `public/voltex-installueshem/`
is an installable (PWA) version of the app with real account login and
registration — sign up with email + password, confirm the email, log in/out,
and reset a forgotten password. Sessions persist on Android, iPhone and
desktop. It's linked from the homepage nav ("Hyr / Krijo llogari") and from
the registration section, and doesn't change anything else on the site.

Auth is powered by [Supabase](https://supabase.com):

- `public/voltex-installueshem/auth.js` / `auth.css` — the login/signup UI
  that gates the app until the user is signed in.
- `public/voltex-installueshem/supabase-config.js` — generated at build time
  by `scripts/generate-config.js` from the `SUPABASE_URL` and
  `SUPABASE_ANON_KEY` environment variables (same pattern as the Lemon
  Squeezy checkout URL above). Set them in Netlify: **Site settings >
  Environment variables**.
- `public/voltex-installueshem/install.html`, `manifest.webmanifest`,
  `service-worker.js` — PWA install prompt and offline app shell.

Setup:

1. Create a project in Supabase and, under **Project Settings > API**, copy
   the Project URL and the `anon` public key.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Netlify's environment
   variables (see `.env.example`), then redeploy.
3. In Supabase, under **Authentication > URL Configuration**, set:
   - Site URL: `https://<your-site>.netlify.app/voltex-installueshem/`
   - Redirect URLs: `https://<your-site>.netlify.app/voltex-installueshem/**`

The `anon` public key is safe to expose in frontend code. Never put a
`service_role` key, API secret, or Lemon Squeezy API key in these files. This
app registers/authenticates users but doesn't automatically grant Premium
after a Lemon Squeezy purchase — that still requires the webhook +
storage described above.

## Local development

```bash
npm install
npm run build   # generates public/js/config.js from env vars
npm start        # serves the legacy demo app on http://localhost:3000
```

To run the Netlify Functions locally, use the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
netlify dev
```
