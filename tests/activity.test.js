// Run: npm test   (Upstash is mocked; never calls a real store)
const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");

const STORE = "https://store.example.test";
process.env.KV_REST_API_URL = STORE;
process.env.KV_REST_API_TOKEN = "test-token";
const handler = require("../api/activity.js");

// tiny fake Upstash: supports SET NX EX, LPUSH, LTRIM, LRANGE via /pipeline
let db, calls;
function fakeUpstash() {
  db = { kv: new Map(), list: [] }; calls = [];
  global.fetch = async (url, opts) => {
    assert.equal(url, STORE + "/pipeline");
    assert.equal(opts.headers.Authorization, "Bearer test-token");
    const cmds = JSON.parse(opts.body); calls.push(cmds);
    const out = cmds.map(([op, ...a]) => {
      if (op === "SET") { if (a.includes("NX") && db.kv.has(a[0])) return { result: null }; db.kv.set(a[0], a[1]); return { result: "OK" }; }
      if (op === "LPUSH") { db.list.unshift(a[1]); return { result: db.list.length }; }
      if (op === "LTRIM") { db.list = db.list.slice(a[1], a[2] + 1); return { result: "OK" }; }
      if (op === "LRANGE") return { result: db.list.slice(a[1], a[2] + 1) };
      return { error: "unknown " + op };
    });
    return new Response(JSON.stringify(out), { status: 200 });
  };
}

function call(method, headers = {}) {
  const req = Readable.from([]);
  req.method = method;
  req.headers = { "user-agent": "Mozilla/5.0", "x-forwarded-for": "1.1.1.1", ...headers };
  return new Promise(resolve => {
    const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; },
      end(b) { resolve({ status: this.statusCode, body: b ? JSON.parse(b) : null, headers: this.headers }); } };
    handler(req, res);
  });
}
const geo = (city, country, ip) => ({ "x-vercel-ip-city": encodeURIComponent(city), "x-vercel-ip-country": country, "x-forwarded-for": ip });

test.beforeEach(fakeUpstash);

test("a real visit with Vercel geo headers is stored and shown to other visitors", async () => {
  assert.equal((await call("POST", geo("São Paulo", "BR", "2.2.2.2"))).status, 204);
  const r = await call("GET", { "x-forwarded-for": "3.3.3.3" });
  assert.equal(r.body.enabled, true);
  assert.equal(r.body.events.length, 1);
  const e = r.body.events[0];
  assert.deepEqual(Object.keys(e).sort(), ["at", "city", "country", "type"]);   // no hash / IP leaves the server
  assert.equal(e.city, "São Paulo"); assert.equal(e.country, "BR"); assert.equal(e.type, "visit");
  assert.equal(r.headers["Cache-Control"], "no-store");
});

test("visitors never see their own visit", async () => {
  await call("POST", geo("Austin", "US", "4.4.4.4"));
  assert.equal((await call("GET", { "x-forwarded-for": "4.4.4.4" })).body.events.length, 0);
});

test("repeat visits from the same visitor within 30 minutes count once", async () => {
  await call("POST", geo("Austin", "US", "5.5.5.5"));
  await call("POST", geo("Austin", "US", "5.5.5.5"));
  assert.equal(db.list.length, 1);
});

test("no location, bots and junk headers are not recorded", async () => {
  await call("POST", { "x-forwarded-for": "6.6.6.6" });                                         // no geo (e.g. local)
  await call("POST", { ...geo("Austin", "US", "7.7.7.7"), "user-agent": "Googlebot/2.1" });     // crawler
  await call("POST", geo("<script>", "USA", "8.8.8.8"));                                        // invalid values
  assert.equal(db.list.length, 0);
});

test("city is optional; country alone is enough", async () => {
  await call("POST", geo("", "PH", "9.9.9.9"));
  const e = (await call("GET", { "x-forwarded-for": "1.2.3.4" })).body.events[0];
  assert.equal(e.city, ""); assert.equal(e.country, "PH");
});

test("events older than 7 days are not shown", async () => {
  db.list.push(JSON.stringify({ type: "visit", city: "Oslo", country: "NO", at: Date.now() - 8 * 864e5, vh: "x" }));
  assert.equal((await call("GET", { "x-forwarded-for": "1.2.3.4" })).body.events.length, 0);
});

test("store failures never break the page: GET returns disabled, POST still 204", async () => {
  global.fetch = async () => new Response("down", { status: 500 });
  assert.equal((await call("POST", geo("Austin", "US", "1.1.1.9"))).status, 204);
  const r = await call("GET");
  assert.equal(r.status, 200); assert.equal(r.body.enabled, false); assert.deepEqual(r.body.events, []);
});

test("with no store configured the feature is off and nothing is faked", async () => {
  const url = process.env.KV_REST_API_URL; delete process.env.KV_REST_API_URL;
  let fetched = false; global.fetch = async () => { fetched = true; };
  await call("POST", geo("Austin", "US", "1.1.1.8"));
  const r = await call("GET");
  process.env.KV_REST_API_URL = url;
  assert.equal(fetched, false);
  assert.deepEqual(r.body, { enabled: false, events: [] });
});

test("other methods are rejected", async () => {
  assert.equal((await call("DELETE")).status, 405);
});
