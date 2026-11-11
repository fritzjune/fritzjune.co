/**
 * Local preview: serves the static site and runs api/lead.js at POST /api/lead,
 * the same way Vercel will. Reads MAKE_WEBHOOK_URL from .env.local.
 *   node scripts/dev-server.js        (default port 5510)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 5510;

// Minimal .env.local loader (KEY=value lines)
const envFile = path.join(ROOT, ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// Without a real store, keep visitor activity in memory so the pop-ups can be tried locally.
if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) process.env.ACTIVITY_DEV_MEMORY = "1";
const lead = require(path.join(ROOT, "api", "lead.js"));
const activity = require(path.join(ROOT, "api", "activity.js"));
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/lead") return lead(req, res);
  if (url.pathname === "/api/activity") return activity(req, res);

  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT) || /[\\/](\.env|scripts|api|tests)/.test(file.slice(ROOT.length))) { res.statusCode = 404; return res.end("Not found"); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html";
  if (!fs.existsSync(file)) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-cache");
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Fritz June site on http://localhost:${PORT}  (webhook ${process.env.MAKE_WEBHOOK_URL ? "configured" : "NOT configured"})`);
});
