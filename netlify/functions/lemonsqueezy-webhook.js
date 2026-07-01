const crypto = require("crypto");
const { registerClient } = require("./lib/clients");

function verifySignature(rawBody, signatureHeader, secret) {
  if (!secret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(signatureHeader, "hex");

  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const signature = event.headers["x-signature"] || event.headers["X-Signature"];
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body || "";

  if (!verifySignature(rawBody, signature, secret)) {
    return { statusCode: 401, body: "Invalid signature" };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return { statusCode: 400, body: "Invalid JSON payload" };
  }

  const eventName = payload.meta && payload.meta.event_name;
  const customer = (payload.data && payload.data.attributes) || {};
  const email = customer.user_email || customer.email;

  if (email) {
    await registerClient({
      email,
      name: customer.user_name || customer.name || "",
      source: `lemonsqueezy:${eventName || "unknown_event"}`,
    });
  }

  return { statusCode: 200, body: "ok" };
};
