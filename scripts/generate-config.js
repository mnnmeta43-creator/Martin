// Generates public/js/config.js from environment variables at build time,
// so the Lemon Squeezy checkout URL can be set in the Netlify UI (Site
// settings > Environment variables) instead of hardcoded in the repo.
const fs = require("fs");
const path = require("path");

const checkoutUrl =
  process.env.LEMONSQUEEZY_CHECKOUT_URL ||
  "https://your-store-slug.lemonsqueezy.com/buy/your-variant-id";

const contents = `// Generated at build time by scripts/generate-config.js. Do not edit by hand.
window.VOLTEX_CONFIG = {
  LEMONSQUEEZY_CHECKOUT_URL: ${JSON.stringify(checkoutUrl)},
};
`;

const outPath = path.join(__dirname, "..", "public", "js", "config.js");
fs.writeFileSync(outPath, contents);
console.log(`Wrote ${outPath} with LEMONSQUEEZY_CHECKOUT_URL=${checkoutUrl}`);
