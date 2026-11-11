// Health check for the Developer Tools page: checks every public website
// page, the dashboard, the booking API and the database from the server, so
// the browser's cross-site rules don't hide real status codes.

const TARGETS = [
  { group: "Website", name: "Home", url: "https://websitemrklin.vercel.app/" },
  { group: "Website", name: "About", url: "https://websitemrklin.vercel.app/about.html" },
  { group: "Website", name: "Services", url: "https://websitemrklin.vercel.app/services.html" },
  { group: "Website", name: "Our Work", url: "https://websitemrklin.vercel.app/work.html" },
  { group: "Website", name: "Contact", url: "https://websitemrklin.vercel.app/contact.html" },
  { group: "Website", name: "Booking details", url: "https://websitemrklin.vercel.app/booking.html" },
  { group: "Dashboard", name: "Dashboard", url: "https://mr-klin.vercel.app/" },
  { group: "Dashboard", name: "Booking API", url: "https://mr-klin.vercel.app/api/bookings" },
];
const TIMEOUT_MS = 8000;
const SLOW_MS = 3000;

async function check(target) {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(target.url, { signal: ctrl.signal, cache: "no-store", headers: { "User-Agent": "mrklin-status-check" } });
    const ms = Date.now() - started;
    await res.arrayBuffer().catch(() => null);
    return { ...target, code: res.status, ms, state: !res.ok ? "down" : ms > SLOW_MS ? "slow" : "up" };
  } catch (err) {
    return { ...target, code: 0, ms: Date.now() - started, state: "down", error: err.name === "AbortError" ? "Timed out" : "Unreachable" };
  } finally {
    clearTimeout(timer);
  }
}

async function checkDatabase() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const base = { group: "Dashboard", name: "Database (Upstash Redis)", url: "" };
  if (!url || !token) return { ...base, code: 0, ms: 0, state: "down", error: "Not connected" };
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["PING"]),
    });
    const data = await res.json();
    const ms = Date.now() - started;
    return { ...base, code: res.status, ms, state: data.result === "PONG" ? (ms > SLOW_MS ? "slow" : "up") : "down", error: data.error };
  } catch {
    return { ...base, code: 0, ms: Date.now() - started, state: "down", error: "Unreachable" };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const checks = await Promise.all([...TARGETS.map(check), checkDatabase()]);
  return res.status(200).json({
    checkedAt: Date.now(),
    checks,
    // Set automatically by Vercel for each deployment of this dashboard
    deployment: {
      commit: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7),
      message: (process.env.VERCEL_GIT_COMMIT_MESSAGE || "").split("\n")[0],
      branch: process.env.VERCEL_GIT_COMMIT_REF || "",
      env: process.env.VERCEL_ENV || "",
    },
  });
};
