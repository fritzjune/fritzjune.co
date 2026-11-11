# Fritz June website

Static site (HTML/CSS/JS) plus one Vercel serverless function for the enquiry form.

```
index.html, book.html, style.css, main.js, form.js, frames/   static site
api/lead.js            POST /api/lead → validates → forwards to Make.com
scripts/dev-server.js  local preview that also runs /api/lead
tests/lead.test.js     API tests (mocked webhook)
```

## Environment variable

| Name | Where | Value |
|---|---|---|
| `MAKE_WEBHOOK_URL` | `.env.local` (local) and Vercel → Settings → Environment Variables (Production + Preview) | Your Make Custom webhook address |

The webhook URL is never sent to the browser. `.env.local` is git-ignored and excluded from Vercel uploads.

## Run locally

```bash
npm run dev
```
Then open http://localhost:5510/book.html#message

```bash
npm test
```

## Deploy to Vercel

1. Push this `fritz-june` folder to a Git repo (or run `vercel` from inside it).
2. In Vercel, import the project. Framework preset: **Other**. Leave build command and output directory empty. If the repo contains more than this site, set **Root Directory** to `fritz-june`.
3. Add `MAKE_WEBHOOK_URL` under Settings → Environment Variables, then redeploy.
4. Send one test enquiry from the live site and check the Google Sheet row and Gmail alert.

## Payload sent to Make

`lead_id, submitted_at, full_name, email, phone, company, service, preferred_date, preferred_time, budget, message, image_url, source, status`
plus `team_size`, `page`, and legacy aliases `name`, `business`, `focus` (same values as `full_name`, `company`, `service`) so the first version of the Make mapping keeps working.

Google Sheets column → payload key: Lead ID → `lead_id` · Submission Date → `submitted_at` · Name → `full_name` · Email → `email` · Phone → `phone` · Company → `company` · Service → `service` · Preferred Date → `preferred_date` · Preferred Time → `preferred_time` · Budget → `budget` · Message → `message` · Image URL → `image_url` · Source → `source` · Status → `status`

## Visitor pop-ups (real activity only)

Small notices at the bottom of the screen, e.g. "Someone from Austin, United States visited the site · 12 minutes ago"
or "Someone from Manila, Philippines sent an enquiry". Every pop-up comes from a real event. Nothing is invented.

- `activity.js` (browser) counts the visit once per session, then shows up to 4 recent events from **other** visitors (first after 7s, one every ~22s). Visitors can close them for the session.
- `api/activity.js` records visits (POST) and returns recent events (GET). Location comes from Vercel's geo headers (`x-vercel-ip-city`, `x-vercel-ip-country`).
- `api/lead.js` records an "enquiry" event only after Make accepts the enquiry.
- Stored per event: type, city, country, time, and a salted one-way hash of the IP (for de-duplication and hiding a visitor's own activity). No IPs, names or emails. Last 50 events, shown for 7 days.
- Skipped: bots, requests without a location, repeat visits within 30 minutes.

### Turn it on

1. Vercel → your project → **Storage** (or Marketplace) → add **Upstash for Redis** (free tier is plenty) and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. Optional: add `ACTIVITY_SALT` (any long random string).
3. Redeploy. Pop-ups start once real visits come in.

Without these variables the feature stays off: nothing is recorded and no pop-ups appear.

Locally, `npm run dev` keeps activity in memory. Local requests have no location, so to preview a pop-up, post a test visit with the headers Vercel would add:

```bash
curl -X POST -H "x-vercel-ip-city: Austin" -H "x-vercel-ip-country: US" -H "x-forwarded-for: 10.0.0.1" -A "Mozilla/5.0" http://localhost:5510/api/activity
```
