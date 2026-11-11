/* Background music with a pause/play control at the bottom left.
   Browsers only allow sound after a click, tap or key press (not scrolling), so the track
   starts softly on the visitor's first interaction. If they pause it, that choice is remembered. */
(() => {
  const SRC = "https://ik.imagekit.io/jnj5x9prn/HOLD%20THE%20THREAD.mp3";
  const VOLUME = 0.35;
  const PREF = "fj-music";        // localStorage: "off" once the visitor pauses
  const POS = "fj-music-pos";     // sessionStorage: resume point when moving between pages

  const ls = { get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };
  const ss = { get: k => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} } };

  const audio = new Audio();
  audio.loop = true;
  audio.preload = "none";         // nothing downloads until it's actually needed
  audio.volume = 0;

  // ---------- Control ----------
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "music";
  btn.innerHTML = `<span class="music__icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="music__label"></span>`;
  document.body.appendChild(btn);
  const label = btn.querySelector(".music__label");

  function render(state) {          // "playing" | "paused" | "loading"
    btn.dataset.state = state;
    const playing = state !== "paused";
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
    label.textContent = state === "loading" ? "Loading" : playing ? "Pause music" : "Play music";
  }
  render("paused");

  // ---------- Volume fades ----------
  let fadeRaf = 0;
  function fadeTo(target, ms, done) {
    cancelAnimationFrame(fadeRaf);
    const from = audio.volume, start = performance.now();
    const step = t => {
      const p = Math.min(1, (t - start) / ms);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * p));
      if (p < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
    };
    fadeRaf = requestAnimationFrame(step);
  }

  let started = false, wantPlaying = false;
  async function play() {
    wantPlaying = true;
    if (!audio.src) {
      audio.src = SRC;
      const resume = parseFloat(ss.get(POS));
      if (resume > 0) audio.addEventListener("loadedmetadata", () => { if (resume < audio.duration) audio.currentTime = resume; }, { once: true });
    }
    render("loading");
    try {
      await audio.play();
      started = true;
      render("playing");
      fadeTo(VOLUME, 1800);
    } catch (_) {
      wantPlaying = false;
      render("paused");            // blocked or failed: stay paused, the button still works
    }
  }
  function pause() {
    wantPlaying = false;
    render("paused");
    fadeTo(0, 350, () => audio.pause());
  }

  btn.addEventListener("click", () => {
    if (btn.dataset.state === "paused") { ls.set(PREF, "on"); play(); }
    else { ls.set(PREF, "off"); pause(); }
  });

  // ---------- Start on the first real interaction (unless they turned it off before) ----------
  const firstTouch = e => {
    if (btn.contains(e.target)) return;                   // the button handles itself
    removeFirstTouch();
    if (ls.get(PREF) !== "off" && !started) play();
  };
  const events = ["pointerdown", "keydown", "touchend"];
  const removeFirstTouch = () => events.forEach(ev => removeEventListener(ev, firstTouch, true));
  if (ls.get(PREF) !== "off") events.forEach(ev => addEventListener(ev, firstTouch, true));

  // ---------- Be polite ----------
  document.addEventListener("visibilitychange", () => {   // quiet while the tab is in the background
    if (!started) return;
    if (document.hidden) audio.pause();
    else if (wantPlaying) audio.play().catch(() => render("paused"));
  });
  addEventListener("pagehide", () => { if (audio.currentTime) ss.set(POS, String(audio.currentTime)); });
  audio.addEventListener("waiting", () => { if (wantPlaying) render("loading"); });
  audio.addEventListener("playing", () => { if (wantPlaying) render("playing"); });
  audio.addEventListener("error", () => { wantPlaying = false; render("paused"); });
})();
