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

---

## Global Business Brain (aplikacion i ri)

Në dosjen [`global-business-brain/`](global-business-brain/) ndodhet aplikacioni **Global Business Brain**
(Next.js + TypeScript + Tailwind + PostgreSQL), i pavarur nga faqja Voltex më sipër. Konfigurimi i
Netlify-t në rrënjë të depos (`netlify.toml`) vazhdon të publikojë vetëm faqen Voltex; aplikacioni i ri
nuk publikohet pa miratim. Shihni [`global-business-brain/README.md`](global-business-brain/README.md).
