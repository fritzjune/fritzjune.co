/* Scroll-driven section animations (runs alongside main.js; never touches the film).
   Everything here is tied to scroll position or to a click, so it moves only when the visitor does. */
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);                 // easeOutCubic
  const mobile = () => innerWidth <= 820;
  // 0 when the element's top reaches `start` (fraction of viewport height), 1 when it reaches `end`.
  const prog = (el, start = 0.95, end = 0.4) => {
    const top = el.getBoundingClientRect().top;
    return clamp((innerHeight * start - top) / (innerHeight * (start - end)));
  };
  const near = el => { const r = el.getBoundingClientRect(); return r.bottom > -200 && r.top < innerHeight + 200; };

  // ---------- Split a headline into word spans, grouped by line (<br>) ----------
  function splitWords(h) {
    const lines = [[]];
    [...h.childNodes].forEach(n => {
      if (n.nodeName === "BR") { lines.push([]); return; }
      (n.textContent.match(/\S+/g) || []).forEach(w => lines[lines.length - 1].push(w));
    });
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    h.innerHTML = lines.map((ws, li) =>
      `<span class="ln ln--${li}" aria-hidden="true">` + ws.map(w => `<span class="w"><span class="w__in">${w}</span></span>`).join(" ") + `</span>`
    ).join("");
    return [...h.querySelectorAll(".w__in")];
  }

  // Word-by-word reveal, scrubbed by scroll
  const reveals = [...document.querySelectorAll("[data-reveal]")].map(h => ({ h, words: splitWords(h) }));
  function runReveal({ h, words }) {
    const p = prog(h, 0.92, 0.45), n = words.length;
    words.forEach((w, i) => {
      const wp = ease(clamp((p * (n + 2) - i) / 2.5));
      w.style.opacity = (0.08 + 0.92 * wp).toFixed(3);
      w.style.transform = `translateY(${((1 - wp) * 0.55).toFixed(3)}em) rotate(${((1 - wp) * 4).toFixed(2)}deg)`;
    });
    h.classList.toggle("is-done", p >= 0.999);
  }

  // ---------- 1. VA vs partner: rows slide in from the left ----------
  const compareRows = [...document.querySelectorAll("#compare li")];
  function runCompare() {
    compareRows.forEach((li, i) => {
      const p = ease(prog(li, 1.0, 0.72 - i * 0.01));
      li.style.opacity = (0.15 + 0.85 * p).toFixed(3);
      li.style.transform = `translateX(${((1 - p) * -60).toFixed(1)}px)`;
    });
  }

  // ---------- 2. Three jobs: words drift together, pieces fly in and connect ----------
  const whatH = document.querySelector("#what .h2");
  const whatWords = splitWords(whatH);
  const web = document.getElementById("web");
  const nodes = [...web.querySelectorAll(".node")];
  const hub = web.querySelector(".hub");
  const lines = () => [...document.querySelectorAll("#webLines line")];
  const SCATTER = { mkt: [-160, 80, -9], ops: [180, -30, 8], exec: [-40, 180, -5] };
  let webSettled = false;
  function runWhat() {
    // headline: words start spread out and slide into one sentence
    const hp = ease(prog(whatH, 0.95, 0.45));
    const mid = (whatWords.length - 1) / 2;
    whatWords.forEach((w, i) => {
      w.style.transform = `translateX(${((i - mid) * 28 * (1 - hp)).toFixed(1)}px) translateY(${(Math.sin(i * 1.7) * 18 * (1 - hp)).toFixed(1)}px)`;
      w.style.opacity = (0.2 + 0.8 * hp).toFixed(3);
    });

    // pieces
    const p = prog(web, 0.98, 0.42);
    const e = ease(clamp(p / 0.8));
    nodes.forEach((n, i) => {
      let [x, y, r] = SCATTER[n.dataset.node];
      if (mobile()) { x = i % 2 ? 70 : -70; y = 0; r = r / 2; }
      if (e >= 1) { n.style.transform = ""; n.style.opacity = ""; return; }   // hand back to :hover styles
      n.style.transform = `translate(${(x * (1 - e)).toFixed(1)}px, ${(y * (1 - e)).toFixed(1)}px) rotate(${(r * (1 - e)).toFixed(2)}deg)`;
      n.style.opacity = (0.25 + 0.75 * e).toFixed(3);
    });
    const hubP = ease(clamp((p - 0.2) / 0.6));
    hub.style.transform = `scale(${(0.3 + 0.7 * hubP).toFixed(3)}) rotate(${((1 - hubP) * -90).toFixed(1)}deg)`;
    hub.classList.toggle("is-live", p >= 0.999);

    // lines draw in once the pieces are close, and follow the pieces while they move
    const lp = ease(clamp((p - 0.45) / 0.55));
    if (window.fjLayoutLines && (!webSettled || p < 1)) window.fjLayoutLines();
    webSettled = p >= 1;
    lines().forEach((l, i) => {
      l.setAttribute("pathLength", "1");
      l.style.strokeDashoffset = (1 - clamp(lp * 1.4 - i * 0.08)).toFixed(3);
    });
  }

  // ---------- 3. Is this you? cards deal in, ticks spark, tally rolls ----------
  const checkItems = [...document.querySelectorAll("#checks li")];
  const qmark = document.querySelector("#fit .qmark");
  function runFit() {
    checkItems.forEach((li, i) => {
      const p = ease(prog(li, 1.02, 0.7));
      li.style.opacity = (0.1 + 0.9 * p).toFixed(3);
      li.style.transform = `translateX(${((1 - p) * 90).toFixed(1)}px) rotate(${((1 - p) * (i % 2 ? 3 : -3)).toFixed(2)}deg)`;
    });
    if (qmark) {
      const p = prog(qmark.closest("h2"), 1, 0);
      qmark.style.transform = `rotate(${(Math.sin(p * Math.PI * 4) * 16).toFixed(2)}deg)`;
    }
  }

  const tallyN = document.getElementById("tallyN");
  const boxes = [...document.querySelectorAll("#checks input")];
  boxes.forEach(b => b.addEventListener("change", () => {
    const n = boxes.filter(x => x.checked).length;
    if (tallyN && tallyN.textContent !== String(n)) {
      const up = n > Number(tallyN.textContent);
      tallyN.textContent = n;
      tallyN.animate && tallyN.animate(
        [{ transform: `translateY(${up ? 60 : -60}%) scale(.6)`, opacity: 0 }, { transform: "translateY(0) scale(1.15)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
    if (b.checked) spark(b);
    document.getElementById("fit").classList.toggle("is-all", n === boxes.length);
  }));

  function spark(el) {
    if (!el.animate) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = cx + "px"; s.style.top = cy + "px";
      document.body.appendChild(s);
      const a = (i / 10) * Math.PI * 2 + Math.random() * 0.4, d = 34 + Math.random() * 30;
      s.animate(
        [{ transform: `translate(-50%,-50%) rotate(${a}rad) scaleX(.2)`, opacity: 1 },
         { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) rotate(${a}rad) scaleX(1)`, opacity: 0 }],
        { duration: 520 + Math.random() * 200, easing: "cubic-bezier(.1,.7,.3,1)" }
      ).onfinish = () => s.remove();
    }
  }

  // ---------- 4. Monday morning: old way gets struck out, new way slides in, clock ticks to 9:00 ----------
  const shiftRows = [...document.querySelectorAll(".shift__row")];
  const shift = document.querySelector(".shift");
  const clock = document.getElementById("clock");
  function runShift() {
    shiftRows.forEach(row => {
      const p = prog(row, 0.9, 0.45);
      const strike = ease(clamp(p * 2));
      const after = ease(clamp((p * 2 - 0.8) / 1.2));
      row.style.setProperty("--strike", strike.toFixed(3));
      row.style.setProperty("--after", after.toFixed(3));
    });
    if (clock) {
      // 0 as the list enters, 1 once the last row has scrolled past the middle of the screen
      const r = shift.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.1));
      const mins = Math.round(41 + 19 * p);       // 8:41 → 9:00
      clock.textContent = mins >= 60 ? "9:00" : `8:${String(mins).padStart(2, "0")}`;
      clock.closest(".shift__clock").classList.toggle("is-nine", mins >= 60);
    }
  }

  // ---------- 5. How we start: a laser rail draws through the steps and lights each one ----------
  const steps = document.querySelector(".steps");
  const stepItems = [...document.querySelectorAll(".steps li")];
  function runSteps() {
    const p = prog(steps, 0.85, mobile() ? 0.1 : 0.45);
    steps.style.setProperty("--rail", p.toFixed(3));
    const len = mobile() ? steps.offsetHeight : steps.offsetWidth;
    stepItems.forEach(li => {
      const at = mobile() ? li.offsetTop + 26 : li.offsetLeft + 26;
      li.classList.toggle("is-lit", p * len >= at - 4);
    });
  }

  // ---------- One loop, scroll-driven ----------
  const jobs = [
    [document.getElementById("different"), () => { reveals.filter(r => r.h.closest("#different")).forEach(runReveal); runCompare(); }],
    [document.getElementById("what"), runWhat],
    [document.getElementById("fit"), runFit],
    [document.getElementById("shift"), () => { reveals.filter(r => r.h.closest("#shift")).forEach(runReveal); runShift(); }],
    [document.getElementById("work"), () => reveals.filter(r => r.h.closest("#work")).forEach(runReveal)],
    [document.getElementById("tools"), () => reveals.filter(r => r.h.closest("#tools")).forEach(runReveal)],
    [document.getElementById("how"), () => { reveals.filter(r => r.h.closest("#how")).forEach(runReveal); runSteps(); }]
  ];
  let queued = false;
  function frame() {
    queued = false;
    jobs.forEach(([sec, fn]) => { if (sec && near(sec)) fn(); });
  }
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  if (document.fonts) document.fonts.ready.then(request);
  // run every job once so off-screen sections start in their "before" state
  jobs.forEach(([sec, fn]) => sec && fn());

  // ---------- Skills: staggered fade + slide up, once, when the list scrolls into view ----------
  const skills = document.querySelector(".skills");
  if (skills && "IntersectionObserver" in window) {
    const r = skills.getBoundingClientRect();
    if (r.top > innerHeight) {                      // only hide it if it's still below the fold
      skills.classList.add("is-armed");
      new IntersectionObserver(([e], obs) => {
        if (!e.isIntersecting) return;
        skills.classList.add("is-in");
        obs.disconnect();
      }, { threshold: 0.15 }).observe(skills.querySelector(".skills__list"));
    }
  }
})();
