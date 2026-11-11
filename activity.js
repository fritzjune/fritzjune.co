/* Visitor pop-ups: small notices at the bottom of the screen showing REAL recent activity
   ("Someone from Austin, United States visited the site · 12 minutes ago").
   Data comes from /api/activity. If the store isn't set up or there's no activity, nothing is shown. */
(() => {
  const API = "/api/activity";
  const MAX_PER_SESSION = 4;    // never more than this per browsing session
  const FIRST_DELAY = 7000;     // wait before the first one
  const SHOW_FOR = 6500;        // how long each stays up
  const GAP = 16000;            // pause between pop-ups

  const store = {
    get(k, d) { try { const v = sessionStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };

  // 1. Count this visit (real location is read on the server from Vercel's geo headers)
  if (!store.get("fj-act-counted", false)) {
    fetch(API, { method: "POST", keepalive: true }).catch(() => {});
    store.set("fj-act-counted", true);
  }

  if (store.get("fj-act-off", false)) return;     // visitor closed them this session
  const shown = new Set(store.get("fj-act-shown", []));
  if (shown.size >= MAX_PER_SESSION) return;

  // ---------- Formatting ----------
  let regionName = c => c;
  try { const dn = new Intl.DisplayNames(["en"], { type: "region" }); regionName = c => dn.of(c) || c; } catch (_) {}
  const place = e => [e.city, e.country && regionName(e.country)].filter(Boolean).join(", ");
  const ago = at => {
    const s = Math.max(1, Math.round((Date.now() - at) / 1000));
    let rtf; try { rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" }); } catch (_) { return ""; }
    if (s < 60) return "just now";
    if (s < 3600) return rtf.format(-Math.round(s / 60), "minute");
    if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
    return rtf.format(-Math.round(s / 86400), "day");
  };
  const message = e => e.type === "enquiry"
    ? `Someone from ${place(e)} sent an enquiry`
    : `Someone from ${place(e)} visited the site`;
  const idOf = e => `${e.type}|${e.at}|${e.country}|${e.city}`;

  // ---------- The pop-up element (one, reused) ----------
  const el = document.createElement("div");
  el.className = "act";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.hidden = true;
  el.innerHTML = `<span class="act__dot" aria-hidden="true"></span>
    <p class="act__text"><span class="act__msg"></span><span class="act__time"></span></p>
    <button class="act__close" type="button" aria-label="Hide visitor notifications">&times;</button>`;
  const msgEl = el.querySelector(".act__msg"), timeEl = el.querySelector(".act__time");
  let hideTimer = 0, stopped = false;

  el.querySelector(".act__close").addEventListener("click", () => {
    stopped = true; store.set("fj-act-off", true); hide();
  });
  el.addEventListener("pointerenter", () => clearTimeout(hideTimer));          // hovering keeps it up
  el.addEventListener("pointerleave", () => { hideTimer = setTimeout(hide, 2500); });

  function hide() { el.classList.remove("is-in"); setTimeout(() => { if (!el.classList.contains("is-in")) el.hidden = true; }, 400); }
  function show(e) {
    msgEl.textContent = message(e);
    timeEl.textContent = ago(e.at);
    el.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, SHOW_FOR);
  }

  // Don't interrupt: skip while the tab is hidden, a dialog is open, someone is typing,
  // or (on phones) while the intro video's copy is on screen.
  function okToShow() {
    if (document.hidden || document.querySelector("dialog[open]")) return false;
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false;
    const film = document.querySelector(".film:not(.is-static)");
    if (film && innerWidth <= 820) {
      const r = film.getBoundingClientRect();
      if (r.bottom > innerHeight * 0.6) return false;
    }
    return true;
  }

  async function run() {
    let data;
    try {
      const r = await fetch(API, { cache: "no-store" });
      if (!r.ok) return;
      data = await r.json();
    } catch (_) { return; }
    const queue = (data.events || []).filter(e => e && e.country && !shown.has(idOf(e))).slice(0, MAX_PER_SESSION - shown.size);
    if (!queue.length) return;
    document.body.appendChild(el);

    for (const e of queue) {
      while (!okToShow()) { if (stopped) return; await wait(1500); }
      if (stopped) return;
      show(e);
      shown.add(idOf(e)); store.set("fj-act-shown", [...shown]);
      await wait(SHOW_FOR + GAP);
    }
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  setTimeout(run, FIRST_DELAY);
})();
