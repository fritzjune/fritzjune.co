/**
 * /api/activity
 *   POST {type:"visit"}  → records this real visit (approximate city/country from Vercel geo headers)
 *   GET                  → recent real activity from other visitors, for the bottom pop-ups
 * Enquiries are recorded server-side by /api/lead after a successful send, never from the browser.
 */
const activity = require("./_activity.js");

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  if (payload === undefined) return res.end();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    const { enabled, events } = await activity.recent(req);
    return send(res, 200, { enabled, events });
  }
  if (req.method === "POST") {
    await activity.record(req, "visit");   // body is ignored: the only browser-recordable event is a visit
    return send(res, 204);
  }
  res.setHeader("Allow", "GET, POST");
  return send(res, 405, { error: "Use GET or POST." });
};
