// Generates public/js/config.js from environment variables at build time,
// so the Lemon Squeezy checkout URL can be set in the Netlify UI (Site
// settings > Environment variables) instead of hardcoded in the repo.
const fs = require("fs");
const path = require("path");

const checkoutUrl =
  process.env.LEMONSQUEEZY_CHECKOUT_URL ||
  "https://voltex.lemonsqueezy.com/checkout/buy/7246cbb6-0631-428c-a2ba-74b6cec3207b";

const contents = `// Generated at build time by scripts/generate-config.js. Do not edit by hand.
window.VOLTEX_CONFIG = {
  LEMONSQUEEZY_CHECKOUT_URL: ${JSON.stringify(checkoutUrl)},
};
`;

const outPath = path.join(__dirname, "..", "public", "js", "config.js");
fs.writeFileSync(outPath, contents);
console.log(`Wrote ${outPath} with LEMONSQUEEZY_CHECKOUT_URL=${checkoutUrl}`);

// Login/registration app (public/voltex-installueshem/) — Supabase project
// URL and anon public key, used client-side for email/password auth.
const supabaseUrl = process.env.SUPABASE_URL || "PASTE_SUPABASE_PROJECT_URL_HERE";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "PASTE_SUPABASE_ANON_KEY_HERE";

const supabaseContents = `// Generated at build time by scripts/generate-config.js. Do not edit by hand.
// Replace via the SUPABASE_URL and SUPABASE_ANON_KEY environment variables
// (Netlify: Site settings > Environment variables). The anon key is
// designed for browser use — never place a service_role key here.
window.VOLTEX_SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
window.VOLTEX_SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnonKey)};
`;

const supabaseOutPath = path.join(
  __dirname,
  "..",
  "public",
  "voltex-installueshem",
  "supabase-config.js"
);
fs.writeFileSync(supabaseOutPath, supabaseContents);
console.log(`Wrote ${supabaseOutPath} with SUPABASE_URL=${supabaseUrl}`);
