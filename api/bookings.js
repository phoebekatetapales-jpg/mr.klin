// Online bookings shared by the public website (POST) and the dashboard
// (GET to list, PATCH to change status). Stored in Upstash Redis, connected
// to this Vercel project from Storage -> Upstash for Redis, which sets the
// KV_REST_API_URL / KV_REST_API_TOKEN environment variables.

const HASH_KEY = "mrklin:bookings";
const ALLOWED_ORIGINS = ["https://websitemrklin.vercel.app", "https://mr-klin.vercel.app"];
const STATUSES = ["Booked", "Confirmed", "In progress", "Completed", "Cancelled"];
const TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
const MAX_PER_IP_PER_HOUR = 10;

async function redis(command) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Database is not connected to this Vercel project yet.");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

function text(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validate(body) {
  const b = body || {};
  if (text(b.company, 100)) return { error: "Rejected." }; // honeypot field, left empty by real visitors
  const ownerName = text(b.ownerName, 80);
  const phone = text(b.phone, 30);
  const date = text(b.date, 10);
  const slot = text(b.slot, 10);
  const services = Array.isArray(b.services) ? b.services.slice(0, 12).map((s) => text(s, 60)).filter(Boolean) : [];
  if (!ownerName) return { error: "Name is required." };
  if (phone.replace(/\D/g, "").length < 10) return { error: "A valid mobile number is required." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) return { error: "A valid date is required." };
  if (!TIMES.includes(slot)) return { error: "A valid time is required." };
  if (!services.length) return { error: "Choose at least one service." };
  return {
    booking: {
      ownerName,
      phone,
      date,
      slot,
      services,
      vehicleType: text(b.vehicleType, 40),
      vehicle: text(b.vehicle, 80),
      plate: text(b.plate, 20),
      location: text(b.location, 200),
      estimate: text(b.estimate, 200),
      notes: text(b.notes, 500),
    },
  };
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const values = (await redis(["HVALS", HASH_KEY])) || [];
      const bookings = values.map((v) => JSON.parse(v)).sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json({ bookings });
    }

    if (req.method === "POST") {
      const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
      const rateKey = `mrklin:rate:${ip}`;
      const count = await redis(["INCR", rateKey]);
      if (count === 1) await redis(["EXPIRE", rateKey, 3600]);
      if (count > MAX_PER_IP_PER_HOUR) return res.status(429).json({ error: "Too many bookings from this connection. Please call us instead." });

      const { booking, error } = validate(req.body);
      if (error) return res.status(400).json({ error });
      const now = Date.now();
      booking.id = `web-${now}-${Math.random().toString(36).slice(2, 8)}`;
      booking.createdAt = now;
      booking.status = "Booked";
      await redis(["HSET", HASH_KEY, booking.id, JSON.stringify(booking)]);
      return res.status(201).json({ ok: true, id: booking.id });
    }

    if (req.method === "PATCH") {
      const id = text(req.body && req.body.id, 60);
      const status = text(req.body && req.body.status, 20);
      if (!STATUSES.includes(status)) return res.status(400).json({ error: "Unknown status." });
      const raw = await redis(["HGET", HASH_KEY, id]);
      if (!raw) return res.status(404).json({ error: "Booking not found." });
      const booking = JSON.parse(raw);
      booking.status = status;
      await redis(["HSET", HASH_KEY, id, JSON.stringify(booking)]);
      return res.status(200).json({ ok: true, booking });
    }

    res.setHeader("Allow", "GET, POST, PATCH, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
