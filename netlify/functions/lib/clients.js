// Records a client (email + optional name) so nothing is lost, even without
// a database configured. If CLIENTS_WEBHOOK_URL is set, the record is
// forwarded there (e.g. Zapier/Make/Google Sheets/your own API) for durable
// storage. Otherwise it's just logged to the function's console output.
async function registerClient({ email, name, source }) {
  const record = {
    email,
    name: name || "",
    source: source || "unknown",
    registeredAt: new Date().toISOString(),
  };

  console.log("New client registration:", JSON.stringify(record));

  const webhookUrl = process.env.CLIENTS_WEBHOOK_URL;
  if (!webhookUrl) return record;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  } catch (err) {
    console.error("Failed to forward client registration:", err.message);
  }

  return record;
}

module.exports = { registerClient };
