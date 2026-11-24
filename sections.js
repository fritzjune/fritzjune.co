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

  // ---------- 1. VA vs Fritz: a laser scan travels down the list; every row it passes upgrades ----------
  const cmp = document.getElementById("cmp");
  const cmpScan = cmp.querySelector(".cmp__scan");
  const cmpRows = [...cmp.querySelectorAll(".cmp__row")];
  function runCompare() {
    const scanY = cmpScan.getBoundingClientRect().top;
    cmpRows.forEach((li, i) => {
      const r = li.getBoundingClientRect();
      const q = clamp((scanY - r.top) / (r.height * 0.9));           // 0 = scan not here yet, 1 = scan has passed
      const q1 = ease(clamp(q * 2.2));                                 // old line struck out
      const q2 = ease(clamp((q - 0.25) / 0.75));                       // new line wipes in
      li.style.setProperty("--strike", q1.toFixed(3));
      li.style.setProperty("--q2", q2.toFixed(3));
      const enter = ease(prog(li, 1.0, 0.72 - i * 0.01));              // rows tilt up into place
      li.style.opacity = (0.15 + 0.85 * enter).toFixed(3);
      li.style.transform = `translateY(${((1 - enter) * 26).toFixed(1)}px)`;
    });
  }

  // ---------- 2. Three jobs: a pinned progression ----------
  // The section stays pinned while you scroll. Each situation takes its turn, the 3D orbit turns so the matching
  // area comes to the front, and a ring fills as each one is connected, until all three run through Fritz.
  const whatH = document.querySelector("#what .h2");
  const whatWords = splitWords(whatH);
  const pgo = document.getElementById("pgo");
  const pSteps = [...pgo.querySelectorAll(".pstep")];
  const pNums = pSteps.map(el => el.querySelector(".pstep__num"));
  const pSats = [...pgo.querySelectorAll(".sat")];
  const pBeams = [...pgo.querySelectorAll(".beam")];
  const pRail = [...pgo.querySelectorAll(".pgo__rail li")];
  const pCue = pgo.querySelector(".pgo__cue");
  const pScene = pgo.querySelector(".pgo__scene");
  const setV = (el, k, v) => el.style.setProperty(k, v);
  const win = (x, a, b) => ease(clamp((x - a) / (b - a)));      // eased 0 to 1 across [a, b]
  function sizePgo() {
    const k = mobile() ? 1 : 1.04;
    setV(pgo, "--S", Math.max(230, Math.min(pScene.clientWidth * k, 720)) + "px");
  }
  sizePgo();
  addEventListener("resize", sizePgo);

  function runWhat() {
    // headline: words start spread out and slide into one sentence
    const hp = ease(prog(whatH, 0.95, 0.45));
    const mid = (whatWords.length - 1) / 2;
    whatWords.forEach((w, i) => {
      w.style.transform = `translateX(${((i - mid) * 28 * (1 - hp)).toFixed(1)}px) translateY(${(Math.sin(i * 1.7) * 18 * (1 - hp)).toFixed(1)}px)`;
      w.style.opacity = (0.2 + 0.8 * hp).toFixed(3);
    });

    const r = pgo.getBoundingClientRect();
    const total = pgo.offsetHeight - innerHeight;
    const p = clamp(-r.top / total);                 // 0 to 1 while pinned
    const s = clamp(p / 0.82) * 3;                   // 0 to 3: one unit per situation
    const e = clamp((p - 0.82) / 0.18);              // last stretch: the loop closes
    const idx = win(s, 0.72, 1.28) + win(s, 1.72, 2.28);   // which area faces front (eased between steps)
    const enter = ease(clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.5)));

    setV(pgo, "--in", enter.toFixed(3));
    setV(pgo, "--rz", (90 - 120 * idx).toFixed(2) + "deg");
    setV(pgo, "--c", (idx / 3 + e / 3).toFixed(4));
    pgo.classList.toggle("is-live", e >= 0.999);

    pSteps.forEach((el, k) => {
      const inn = k === 0 ? 1 : win(s, k - 0.1, k + 0.2);
      const out = k === 2 ? 0 : win(s, k + 0.7, k + 1);
      const vis = inn * (1 - out);
      const y = inn < 1 ? (1 - inn) * 46 : -out * 46;
      el.style.opacity = vis.toFixed(3);
      el.style.transform = `translateY(${y.toFixed(1)}px)`;
      el.style.filter = vis > 0.99 ? "" : `blur(${((1 - vis) * 8).toFixed(1)}px)`;
      el.style.pointerEvents = vis > 0.5 ? "" : "none";
      pNums[k].style.transform = `translateY(${((k + 0.5 - s) * 34).toFixed(1)}px)`;
    });
    pSats.forEach((el, k) => setV(el, "--w", clamp(1 - Math.abs(idx - k) * 1.4).toFixed(3)));
    pBeams.forEach((el, k) => {
      setV(el, "--d", (k === 0 ? enter : win(idx, k - 0.9, k)).toFixed(3));
      setV(el, "--w", clamp(1 - Math.abs(idx - k) * 1.4).toFixed(3));
    });
    pRail.forEach((el, k) => {
      el.classList.toggle("is-on", idx >= k - 0.35);
      setV(el, "--f", clamp(idx - k).toFixed(3));
    });
    pCue.style.opacity = (1 - clamp(s / 0.25)).toFixed(3);
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
    [document.getElementById("about"), () => reveals.filter(r => r.h.closest("#about")).forEach(runReveal)],
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
})();
