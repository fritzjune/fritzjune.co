/* Fritz June: scroll-scrubbed film + interactions */
(() => {
  const FRAME_COUNT = 450;       // 15 fps x 30 s, extracted from the HandBrake export
  // The film only moves when the visitor scrolls, so it stays on even with "reduce motion" set.
  // "Reduce motion" still switches off the automatic animations (marquee, scroll hint, magnetic buttons).
  // Add ?static to the URL to see the no-video fallback.
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forceStatic = location.search.includes("static");

  const film = document.querySelector(".film");
  const canvas = document.getElementById("film");
  const ctx = canvas.getContext("2d", { alpha: false });
  const chapters = [...document.querySelectorAll(".chapter")];
  const dots = [...document.querySelectorAll(".film__progress li")];
  const bar = document.getElementById("filmBar");
  const nav = document.getElementById("nav");

  // No loading screen: the poster frame shows straight away and the film fades in once enough frames are ready.
  const hideLoader = () => {};

  // ---------- Static fallback ----------
  if (forceStatic || !ctx) {
    film.classList.add("is-static");
    hideLoader();
  } else {
    initFilm();
  }

  function initFilm() {
    // Pick a frame set: portrait screens get the centre-cropped set.
    const portrait = () => innerWidth / innerHeight < 0.9;
    const set = portrait() ? "m" : "d";
    const src = i => `frames/${set}/f${String(i + 1).padStart(3, "0")}.webp`;

    const frames = new Array(FRAME_COUNT);
    let loaded = 0, failed = 0;

    // Load order: coarse to fine, so the whole timeline is scrubbable early.
    const order = [];
    const seen = new Set();
    for (const step of [32, 16, 8, 4, 2, 1]) {
      for (let i = 0; i < FRAME_COUNT; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    }
    const firstPass = Math.ceil(FRAME_COUNT / 8); // every 8th frame loaded = scrubbable
    let readyFired = false;

    let cursor = 0, inFlight = 0;
    const MAX = 6;
    function pump() {
      while (inFlight < MAX && cursor < order.length) {
        const i = order[cursor++];
        inFlight++;
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => {
            frames[i] = img; loaded++; inFlight--; onProgress(); pump();
          });
        };
        img.onerror = () => { failed++; inFlight--; onProgress(); pump(); };
        img.src = src(i);
      }
    }

    function onProgress() {
      const done = loaded + failed;
      if (!readyFired && done >= firstPass) {
        readyFired = true;
        if (loaded < done * 0.5) { // most frames failing: fall back
          film.classList.add("is-static"); hideLoader(); return;
        }
        film.classList.add("is-ready");
        hideLoader();
        requestDraw(true);
      }
    }
    pump();
    // Never trap a visitor behind the loader.
    setTimeout(() => { if (!readyFired) { readyFired = true; film.classList.add("is-ready"); hideLoader(); requestDraw(true); } }, 8000);

    function nearest(i) {
      if (frames[i]) return frames[i];
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    }

    // ---------- Canvas sizing ----------
    let cw = 0, ch = 0;
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";
      lastDrawn = ""; requestDraw(true);
    }

    let lastDrawn = "";
    function paint(img, alpha) {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s, h = ih * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h); // cover, centred
    }
    // Draws at a fractional frame position: cross-fades the two neighbouring frames,
    // so motion glides between the 15 fps source frames instead of stepping.
    function draw(pos) {
      const i0 = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(pos)));
      const i1 = Math.min(FRAME_COUNT - 1, i0 + 1);
      const f = Math.round((pos - i0) * 32) / 32; // 32 blend steps: skips redundant redraws
      const a = frames[i0], b = frames[i1];
      let key, img;
      if (a && b && f > 0 && i1 !== i0) key = i0 + ":" + f;
      else { img = nearest(Math.round(pos)); if (!img) return; key = "n" + Math.round(pos); }
      if (key === lastDrawn) return;
      lastDrawn = key;
      if (img) { paint(img, 1); }
      else { paint(a, 1); paint(b, f); }
      ctx.globalAlpha = 1;
    }

    // ---------- Scroll → frame, smoothed ----------
    let target = 0, current = 0, progress = 0, raf = 0;
    function readScroll() {
      const r = film.getBoundingClientRect();
      const total = film.offsetHeight - innerHeight;
      progress = Math.min(1, Math.max(0, -r.top / total));
      target = progress * (FRAME_COUNT - 1);
    }

    let lastT = 0;
    function tick(t) {
      raf = 0;
      // Time-based easing: same feel at 30, 60 or 120 fps, and never lags far behind on slow devices.
      const dt = lastT ? Math.min(t - lastT, 250) : 16;
      lastT = t;
      const diff = target - current;
      current += diff * (1 - Math.exp(-dt / 120));
      if (Math.abs(diff) < 0.01) current = target;
      draw(current);
      updateOverlay(current / (FRAME_COUNT - 1));
      if (current !== target) raf = requestAnimationFrame(tick); else lastT = 0;
    }
    function requestDraw(force) {
      if (force) lastDrawn = "";
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function updateOverlay(p) {
      chapters.forEach((el, k) => {
        const a = +el.dataset.start, b = +el.dataset.end, f = 0.025;
        let o;
        if (p < a || p > b) o = 0;
        else if (k === 0 && p < a + f) o = 1;
        else o = Math.min(1, (p - a) / f, (b - p) / f);
        if (k === chapters.length - 1 && p >= b - f) o = 1;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o > 0.01 ? "visible" : "hidden";
        el.style.transform = `translateY(${((1 - o) * 30).toFixed(1)}px)`;
        dots[k] && dots[k].classList.toggle("is-on", p >= a - 0.01);
      });
      bar.style.height = `calc(${(p * 100).toFixed(2)}% - 8px)`;
    }

    addEventListener("scroll", () => { readScroll(); requestDraw(); }, { passive: true });
    addEventListener("resize", () => { readScroll(); resize(); });
    readScroll(); current = target; resize(); updateOverlay(progress);
  }

  // ---------- Nav colour ----------
  // Nav goes light over chalk sections, stays transparent over dark ones.
  const darkZones = [film, document.getElementById("fit"), document.getElementById("work"), document.getElementById("about"), document.getElementById("book")].filter(Boolean);
  const navObserver = () => {
    const y = scrollY + 40;
    const overDark = darkZones.some(z => y >= z.offsetTop && y < z.offsetTop + z.offsetHeight);
    nav.classList.toggle("is-light", !overDark);
  };
  addEventListener("scroll", navObserver, { passive: true });
  navObserver();

  // ---------- Fit checklist ----------
  const boxes = [...document.querySelectorAll("#checks input")];
  const fill = document.getElementById("meterFill");
  const verdict = document.getElementById("verdict");
  const fitCta = document.getElementById("fitCta");
  const lines6 = [
    "Start ticking.",
    "One? Fair. Keep going.",
    "Two. It's starting to sound familiar.",
    "Three. You're doing a lot of connecting yourself.",
    "Four. We should probably talk.",
    "Five. You need a partner, not a pair of hands.",
    "All six. Book the call, I'll bring the plan."
  ];
  boxes.forEach(b => b.addEventListener("change", () => {
    const n = boxes.filter(x => x.checked).length;
    fill.style.width = `${(n / boxes.length) * 100}%`;
    verdict.textContent = lines6[n];
    fitCta.hidden = n < 3;
  }));

  // ---------- Magnetic primary buttons (pointer devices only) ----------
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".btn--laser").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      btn.addEventListener("pointerleave", () => btn.style.transform = "");
    });
  }
})();
