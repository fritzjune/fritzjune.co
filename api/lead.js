/**
 * POST /api/lead
 * Validates a booking / enquiry submission and forwards it to the Make.com webhook.
 * The webhook URL lives only in the MAKE_WEBHOOK_URL environment variable.
 *
 * Runs as a Vercel Node.js serverless function (CommonJS, Node 18+ for global fetch).
 */
const crypto = require("crypto");
const activity = require("./_activity.js");

const SOURCE = "Website Booking / Inquiry Page";
const WEBHOOK_TIMEOUT_MS = 10000;
const MIN_FILL_MS = 3000;            // humans take longer than 3s to fill this form
const DUP_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };

// Allowed values: keep in sync with the radio/select options in book.html.
const SERVICES = ["Marketing operations", "Operations", "Executive partnership", "Full partnership", "Not sure yet"];
const TIMES = ["", "Morning", "Midday", "Afternoon", "Evening"];
const BUDGETS = ["", "Under $1,500 / month", "$1,500 to $3,000 / month", "$3,000 to $5,000 / month", "$5,000+ / month", "Not sure yet"];
const TEAM_SIZES = ["", "Just me", "2-10", "11-50", "50+"];

// Best-effort, per warm instance. Stops double-clicks and retries; not a hard guarantee across instances.
const recentKeys = new Map();   // submission_key -> { at, result }
const recentIps = new Map();    // ip -> [timestamps]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{7,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clean(v, max) {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}
function cleanMultiline(v, max) {
  return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 50 * 1024) throw new Error("too_large");
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function prune(now) {
  for (const [k, v] of recentKeys) if (now - v.at > DUP_WINDOW_MS) recentKeys.delete(k);
  for (const [ip, list] of recentIps) {
    const kept = list.filter(t => now - t < RATE_LIMIT.windowMs);
    kept.length ? recentIps.set(ip, kept) : recentIps.delete(ip);
  }
}

/** Returns { errors, lead } */
function validate(body) {
  const errors = {};
  const full_name = clean(body.full_name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const phone = clean(body.phone, 30);
  const company = clean(body.company, 160);
  const service = clean(body.service, 60);
  const preferred_date = clean(body.preferred_date, 10);
  const preferred_time = clean(body.preferred_time, 20);
  const timezone = clean(body.timezone, 60);
  const budget = clean(body.budget, 40);
  const team_size = clean(body.team_size, 10);
  const message = cleanMultiline(body.message, 4000);
  const consent = body.consent === true || body.consent === "true" || body.consent === "on";

  if (full_name.length < 2) errors.full_name = "Add your name.";
  if (!email) errors.email = "Add your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "That email address doesn't look right.";
  if (phone && !PHONE_RE.test(phone)) errors.phone = "Use digits, spaces and + only.";
  if (!SERVICES.includes(service)) errors.service = "Pick what you'd like help with.";
  if (preferred_date) {
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const d = new Date(preferred_date + "T00:00:00Z");
    // allow one day of slack for visitors ahead of UTC
    if (!DATE_RE.test(preferred_date) || isNaN(d) || d < new Date(today - 86400000)) errors.preferred_date = "Pick a date from today onwards.";
  }
  if (!TIMES.includes(preferred_time)) errors.preferred_time = "Pick a time from the list.";
  if (!BUDGETS.includes(budget)) errors.budget = "Pick a budget from the list.";
  if (!TEAM_SIZES.includes(team_size)) errors.team_size = "Pick a team size from the list.";
  if (message.length < 10) errors.message = "Tell me a little more (10 characters or more).";
  if (!consent) errors.consent = "Tick the box so I can use these details to reply.";

  return {
    errors,
    lead: { full_name, email, phone, company, service, preferred_date, preferred_time, timezone, budget, team_size, message }
  };
}

/** Builds the Make payload. New schema first; legacy keys keep the earlier Make mapping working. */
function buildPayload(lead, page) {
  const lead_id = "FJ-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const submitted_at = new Date().toISOString();
  const preferred_time = lead.preferred_time && lead.timezone ? `${lead.preferred_time} (${lead.timezone})` : lead.preferred_time;
  return {
    lead_id,
    submitted_at,
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    service: lead.service,
    preferred_date: lead.preferred_date,
    preferred_time,
    budget: lead.budget,
    message: lead.message,
    image_url: "",
    source: SOURCE,
    status: "New",
    // Extra context + legacy field names from the first version of the form (name, business, focus, page).
    team_size: lead.team_size,
    page: page || "",
    name: lead.full_name,
    business: lead.company,
    focus: lead.service
  };
}

async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.setHeader("Allow", "POST"); return res.end(); }
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { ok: false, error: "Use POST." }); }

  const webhook = process.env.MAKE_WEBHOOK_URL;
  if (!webhook) {
    console.error("[lead] MAKE_WEBHOOK_URL is not set");
    return send(res, 500, { ok: false, error: "The form isn't connected right now. Please book on the calendar or try again later." });
  }

  let body;
  try { body = await readBody(req); }
  catch { return send(res, 400, { ok: false, error: "That request couldn't be read. Refresh the page and try again." }); }

  const now = Date.now();
  prune(now);

  // Spam checks: honeypot + minimum fill time. Bots get a quiet 200 and nothing is forwarded.
  const startedAt = Number(body.started_at) || 0;
  if (clean(body.website_url, 200) || (startedAt && now - startedAt < MIN_FILL_MS)) {
    return send(res, 200, { ok: true, lead_id: null });
  }

  // Rate limit per IP (best-effort).
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const hits = recentIps.get(ip) || [];
  if (hits.length >= RATE_LIMIT.max) {
    return send(res, 429, { ok: false, error: "Too many messages in a short time. Please wait a few minutes and try again." });
  }

  const { errors, lead } = validate(body);
  if (Object.keys(errors).length) {
    return send(res, 422, { ok: false, error: "A few fields need a look.", fields: errors });
  }

  // Duplicate prevention: same submission key returns the original result without re-sending.
  const key = clean(body.submission_key, 80);
  if (key && recentKeys.has(key)) {
    const prev = recentKeys.get(key);
    if (prev.result) return send(res, 200, { ok: true, lead_id: prev.result, duplicate: true });
    return send(res, 409, { ok: false, error: "This message is already being sent. Give it a moment." });
  }
  if (key) recentKeys.set(key, { at: now, result: null });

  const payload = buildPayload(lead, clean(body.page, 300));

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), WEBHOOK_TIMEOUT_MS);
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`Make responded ${r.status}: ${(await r.text()).slice(0, 200)}`);
  } catch (err) {
    if (key) recentKeys.delete(key); // allow a genuine retry
    console.error("[lead] webhook failed:", err.message);
    return send(res, 502, { ok: false, error: "Your message didn't send. Please try again in a minute, or book a time on the calendar." });
  }

  if (key) recentKeys.set(key, { at: now, result: payload.lead_id });
  hits.push(now); recentIps.set(ip, hits);
  // Real enquiry → "Someone from <city> sent an enquiry" pop-up. Location only; capped at 1.5s so it never delays the reply.
  await Promise.race([activity.record(req, "enquiry"), new Promise(r => setTimeout(r, 1500))]);
  return send(res, 200, { ok: true, lead_id: payload.lead_id });
}

module.exports = handler;
module.exports._internal = { validate, buildPayload, SERVICES, BUDGETS, TIMES, TEAM_SIZES, reset: () => { recentKeys.clear(); recentIps.clear(); } };
