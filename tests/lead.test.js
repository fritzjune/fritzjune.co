// Run: npm test   (uses a mocked Make webhook; never calls the real one)
const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");

const handler = require("../api/lead.js");

function call(body, { method = "POST", ip = "1.1.1.1" } = {}) {
  const req = Readable.from([Buffer.from(typeof body === "string" ? body : JSON.stringify(body || {}))]);
  req.method = method;
  req.headers = { "x-forwarded-for": ip };
  return new Promise(resolve => {
    const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; },
      end(b) { resolve({ status: this.statusCode, body: b ? JSON.parse(b) : null }); } };
    handler(req, res);
  });
}

const valid = (over = {}) => ({
  full_name: "Jordan Rivera", email: "jordan@example.com", phone: "", company: "",
  service: "Operations", team_size: "", budget: "", preferred_date: "", preferred_time: "",
  timezone: "Asia/Manila", message: "Launches keep slipping and I'm the bottleneck.",
  consent: true, website_url: "", started_at: Date.now() - 60000,
  submission_key: "k-" + Math.random(), page: "http://localhost/book", ...over
});

let sent, webhookStatus;
test.beforeEach(() => {
  handler._internal.reset();
  sent = [];
  webhookStatus = 200;
  process.env.MAKE_WEBHOOK_URL = "https://hook.example.test/abc";
  global.fetch = async (url, opts) => { sent.push({ url, body: JSON.parse(opts.body), headers: opts.headers }); return new Response("Accepted", { status: webhookStatus }); };
});

test("1. valid enquiry is forwarded with the agreed JSON structure", async () => {
  const r = await call(valid({ phone: "+63 917 555 0101", company: "Rivera Co", budget: "$3,000 to $5,000 / month", preferred_date: "2099-01-15", preferred_time: "Morning", team_size: "2-10" }));
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.match(r.body.lead_id, /^FJ-\d{8}-[0-9A-F]{6}$/);
  assert.equal(sent.length, 1);
  const p = sent[0].body;
  for (const k of ["lead_id","submitted_at","full_name","email","phone","company","service","preferred_date","preferred_time","budget","message","image_url","source","status"]) assert.ok(k in p, "missing " + k);
  assert.equal(p.lead_id, r.body.lead_id);
  assert.ok(!isNaN(Date.parse(p.submitted_at)));
  assert.equal(p.preferred_time, "Morning (Asia/Manila)");
  assert.equal(p.source, "Website Booking / Inquiry Page");
  assert.equal(p.status, "New");
  assert.equal(p.image_url, "");
  assert.equal(sent[0].headers["Content-Type"], "application/json");
  // legacy keys kept for the earlier Make mapping
  assert.equal(p.name, p.full_name); assert.equal(p.business, p.company); assert.equal(p.focus, p.service);
});

test("2. missing required fields are rejected with field errors and nothing is sent", async () => {
  const r = await call({ consent: false, started_at: Date.now() - 60000 });
  assert.equal(r.status, 422);
  assert.deepEqual(Object.keys(r.body.fields).sort(), ["consent", "email", "full_name", "message", "service"]);
  assert.equal(sent.length, 0);
});

test("3. invalid email is rejected", async () => {
  for (const email of ["jordan@", "jordan.example.com", "a@b", "two@@x.com"]) {
    const r = await call(valid({ email }));
    assert.equal(r.status, 422, email);
    assert.ok(r.body.fields.email);
  }
  assert.equal(sent.length, 0);
});

test("4. optional fields can be left empty", async () => {
  const r = await call(valid());
  assert.equal(r.status, 200);
  const p = sent[0].body;
  assert.equal(p.phone, ""); assert.equal(p.company, ""); assert.equal(p.budget, "");
  assert.equal(p.preferred_date, ""); assert.equal(p.preferred_time, "");
});

test("5. unknown option values and bad phone/date are rejected", async () => {
  const r = await call(valid({ service: "Hacking", budget: "a million", phone: "call me", preferred_date: "2001-01-01" }));
  assert.equal(r.status, 422);
  assert.deepEqual(Object.keys(r.body.fields).sort(), ["budget", "phone", "preferred_date", "service"]);
});

test("6. failed webhook returns an error, never a success", async () => {
  webhookStatus = 500;
  const r = await call(valid());
  assert.equal(r.status, 502);
  assert.equal(r.body.ok, false);
  assert.match(r.body.error, /didn't send/);
});

test("6b. network failure / timeout to Make returns an error", async () => {
  global.fetch = async () => { throw new Error("ECONNRESET"); };
  const r = await call(valid());
  assert.equal(r.status, 502);
});

test("6c. a failed attempt can be retried with the same key", async () => {
  webhookStatus = 500;
  const body = valid();
  assert.equal((await call(body)).status, 502);
  webhookStatus = 200;
  assert.equal((await call(body)).status, 200);
});

test("7. duplicate submission (same key) is not forwarded twice", async () => {
  const body = valid();
  const a = await call(body), b = await call(body);
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  assert.equal(b.body.duplicate, true);
  assert.equal(b.body.lead_id, a.body.lead_id);
  assert.equal(sent.length, 1);
});

test("8. honeypot and too-fast submissions are dropped quietly", async () => {
  assert.equal((await call(valid({ website_url: "http://spam" }))).status, 200);
  assert.equal((await call(valid({ started_at: Date.now() }))).status, 200);
  assert.equal(sent.length, 0);
});

test("9. rate limit kicks in after 5 sends from one IP", async () => {
  for (let i = 0; i < 5; i++) assert.equal((await call(valid(), { ip: "9.9.9.9" })).status, 200);
  assert.equal((await call(valid(), { ip: "9.9.9.9" })).status, 429);
});

test("10. missing env variable and wrong method are handled", async () => {
  delete process.env.MAKE_WEBHOOK_URL;
  assert.equal((await call(valid())).status, 500);
  process.env.MAKE_WEBHOOK_URL = "https://hook.example.test/abc";
  assert.equal((await call(null, { method: "GET" })).status, 405);
  assert.equal((await call("not json")).status, 400);
});
