/**
 * Shared store for real site activity (visits + enquiries) used by the bottom pop-ups.
 * Files starting with "_" in /api are not exposed as endpoints on Vercel.
 *
 * Only real events are stored: approximate city + country from Vercel's geo headers, a type, a timestamp,
 * and a salted one-way hash of the IP (used only to de-duplicate visits and hide a visitor's own activity).
 * No IPs, names or emails are stored.
 *
 * Storage: Upstash Redis REST (Vercel Marketplace "Upstash for Redis" adds KV_REST_API_URL + KV_REST_API_TOKEN).
 * With no store configured the feature is simply off: nothing is recorded and no pop-ups are shown.
 */
const crypto = require("crypto");

const LIST_KEY = "fj:activity";
const MAX_EVENTS = 50;
const VISIT_DEDUPE_S = 30 * 60;               // one visit per visitor per 30 minutes
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;   // only show the last 7 days
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|uptime|curl|wget|python|axios|node-fetch|go-http/i;

const memory = { events: [], seen: new Map() };   // local development only (ACTIVITY_DEV_MEMORY=1)

function backend() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url: url.replace(/\/$/, ""), token };
  if (process.env.ACTIVITY_DEV_MEMORY === "1") return "memory";
  return null;
}

async function redis(b, commands) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch(b.url + "/pipeline", {
      method: "POST",
      headers: { Authorization: `Bearer ${b.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error(`store responded ${r.status}`);
    return (await r.json()).map(x => { if (x.error) throw new Error(x.error); return x.result; });
  } finally { clearTimeout(timer); }
}

function geo(req) {
  const h = req.headers || {};
  let city = "";
  try { city = decodeURIComponent(String(h["x-vercel-ip-city"] || "")).trim().slice(0, 60); } catch (_) {}
  const country = String(h["x-vercel-ip-country"] || "").trim().toUpperCase();
  return {
    city: /^[\p{L}\p{M} .'’-]+$/u.test(city) ? city : "",
    country: /^[A-Z]{2}$/.test(country) ? country : ""
  };
}

function visitorHash(req) {
  const ip = String((req.headers || {})["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "").split(",")[0].trim();
  const salt = process.env.ACTIVITY_SALT || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "fj-local";
  return crypto.createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 24);
}

/** Records a real event. Returns true if stored. Never throws. */
async function record(req, type) {
  try {
    const b = backend();
    if (!b) return false;
    if (BOT_RE.test(String((req.headers || {})["user-agent"] || ""))) return false;
    const { city, country } = geo(req);
    if (!country) return false;                         // no real location → nothing to show
    const vh = visitorHash(req);
    const event = { type, city, country, at: Date.now(), vh };

    if (b === "memory") {
      const k = `${type}:${vh}`;
      if (type === "visit" && memory.seen.has(k) && Date.now() - memory.seen.get(k) < VISIT_DEDUPE_S * 1000) return false;
      memory.seen.set(k, Date.now());
      memory.events.unshift(event);
      memory.events.length = Math.min(memory.events.length, MAX_EVENTS);
      return true;
    }

    if (type === "visit") {
      const [ok] = await redis(b, [["SET", `fj:seen:${vh}`, "1", "EX", VISIT_DEDUPE_S, "NX"]]);
      if (ok !== "OK") return false;                    // already counted recently
    }
    await redis(b, [["LPUSH", LIST_KEY, JSON.stringify(event)], ["LTRIM", LIST_KEY, 0, MAX_EVENTS - 1]]);
    return true;
  } catch (err) {
    console.error("[activity] record failed:", err.message);
    return false;
  }
}

/** Recent real events from other visitors, newest first. Never throws. */
async function recent(req, limit = 12) {
  try {
    const b = backend();
    if (!b) return { enabled: false, events: [] };
    const vh = visitorHash(req);
    let list;
    if (b === "memory") list = memory.events;
    else {
      const [raw] = await redis(b, [["LRANGE", LIST_KEY, 0, MAX_EVENTS - 1]]);
      list = (raw || []).map(s => { try { return JSON.parse(s); } catch (_) { return null; } }).filter(Boolean);
    }
    const now = Date.now();
    const events = list
      .filter(e => e && e.vh !== vh && now - e.at < MAX_AGE_MS && /^(visit|enquiry)$/.test(e.type))
      .slice(0, limit)
      .map(({ type, city, country, at }) => ({ type, city, country, at }));   // never send the hash out
    return { enabled: true, events };
  } catch (err) {
    console.error("[activity] read failed:", err.message);
    return { enabled: false, events: [] };
  }
}

module.exports = { record, recent, _memory: memory, _geo: geo };
