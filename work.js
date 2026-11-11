/* Work section: endless strips that move on their own, speed up with scrolling,
   and reverse briefly when the visitor scrolls back up. Clicking a piece opens it large (optional). */
(() => {
  const section = document.getElementById("work");
  if (!section) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED_SCALE = reduce ? 0.5 : 1;   // slower, but still moving, when "reduce motion" is on
  const SCROLL_PUSH = reduce ? 0.12 : 0.35;

  // ---------- Build each track: rail > [set, clone, clone...] ----------
  const tracks = [...section.querySelectorAll(".wk-track")].map(track => {
    const set = track.querySelector(".wk-set");
    const rail = document.createElement("div");
    rail.className = "wk-rail";
    track.insertBefore(rail, set);
    rail.appendChild(set);
    return {
      track, rail, set,
      dir: Number(track.dataset.dir) || -1,      // -1 = content drifts left, 1 = drifts right
      speed: Number(track.dataset.speed) || 36,   // px per second
      x: Math.random() * 400, width: 0, hover: 0, hoverTarget: 1,
      fling: 0,          // leftover speed after a drag or swipe, fades out
      resume: 1,         // 0 right after the visitor moves a strip, eases back to 1 (auto drift)
      dragging: false, dragEndAt: 0
    };
  });

  function fill(t) {
    t.rail.querySelectorAll(".wk-set[data-clone]").forEach(c => c.remove());
    t.width = t.set.getBoundingClientRect().width;
    if (!t.width) return;
    const needed = Math.ceil((innerWidth * 1.5) / t.width) + 1;
    for (let i = 0; i < needed; i++) {
      const c = t.set.cloneNode(true);
      c.dataset.clone = "";
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("button").forEach(b => b.tabIndex = -1);
      c.querySelectorAll("img").forEach(img => { img.alt = ""; img.loading = "eager"; });
      t.rail.appendChild(c);
    }
    t.rail.querySelectorAll("img").forEach(img => { img.draggable = false; });
  }
  const fillAll = () => tracks.forEach(fill);

  tracks.forEach(t => {
    t.track.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") t.hoverTarget = 0.15; });
    t.track.addEventListener("pointerleave", () => { t.hoverTarget = 1; });
    t.track.addEventListener("focusin", e => {
      t.hoverTarget = 0;
      // keyboard users: bring the focused piece into view
      const r = e.target.getBoundingClientRect(), tr = t.track.getBoundingClientRect();
      if (r.left < tr.left + 24 || r.right > tr.right - 24) { t.x += r.left - tr.left - 48; t.resume = 0; }
    });
    t.track.addEventListener("focusout", () => { t.hoverTarget = 1; });
  });

  // ---------- Motion loop (runs only while the section is on screen) ----------
  let visible = false, raf = 0, last = 0, lastY = scrollY, vel = 0, viewerOpen = false;
  function loop(t) {
    raf = 0;
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016;
    last = t;
    const dy = scrollY - lastY; lastY = scrollY;
    const instant = dt ? dy / dt : 0;                      // px/s, + when scrolling down
    vel += (instant - vel) * Math.min(1, dt * 6);          // smoothed scroll speed
    const push = Math.max(-1600, Math.min(1600, vel)) * SCROLL_PUSH;

    tracks.forEach(tr => {
      if (!tr.width) return;
      tr.hover += (tr.hoverTarget - tr.hover) * Math.min(1, dt * 5);
      if (!tr.dragging) {
        tr.resume += (1 - tr.resume) * Math.min(1, dt * 0.9);   // auto drift fades back in after a drag
        const base = viewerOpen ? 0 : tr.speed * SPEED_SCALE * tr.hover;
        // dir -1 drifts left (x grows). Scrolling down pushes each row its own way; scrolling up reverses it.
        tr.x += -tr.dir * (base + push) * tr.resume * dt;
        tr.x += tr.fling * dt;                                   // glide after a flick
        tr.fling *= Math.exp(-dt * 3.2);
        if (Math.abs(tr.fling) < 2) tr.fling = 0;
      }
      tr.x = ((tr.x % tr.width) + tr.width) % tr.width;
      tr.rail.style.transform = `translate3d(${(-tr.x).toFixed(2)}px,0,0)`;
    });
    if (visible) raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!raf) { last = 0; lastY = scrollY; raf = requestAnimationFrame(loop); } };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    section.classList.toggle("is-live", visible);         // also runs/pauses the in-frame page scrolling
    if (visible) start();
  }, { rootMargin: "200px 0px" }).observe(section);

  // Start loading every strip's images a screen before the section arrives (strips move sideways,
  // so the browser's own lazy loading would pop images in mid-strip).
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    section.querySelectorAll("img[loading=lazy]").forEach(img => { img.loading = "eager"; });
    obs.disconnect();
  }, { rootMargin: "100% 0px" }).observe(section);

  // Re-measure once images have sizes, and on resize
  let resizeT;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(fillAll, 200); });
  fillAll();
  if (document.readyState !== "complete") addEventListener("load", fillAll);

  // ---------- Let visitors move the strips themselves ----------
  // Drag (mouse), swipe (touch) or two-finger scroll sideways (trackpad / Shift + wheel).
  // Vertical page scrolling is left alone: touch-action: pan-y in the CSS.
  tracks.forEach(tr => {
    const el = tr.track;
    let pid = null, sx = 0, sy = 0, lx = 0, lt = 0, v = 0, moved = false;

    el.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      pid = e.pointerId; sx = lx = e.clientX; sy = e.clientY; lt = e.timeStamp; v = 0; moved = false;
    });
    el.addEventListener("pointermove", e => {
      if (e.pointerId !== pid) return;
      const dx = e.clientX - lx;
      if (!tr.dragging) {
        const tx = e.clientX - sx, ty = e.clientY - sy;
        if (Math.abs(tx) < 6 || Math.abs(tx) < Math.abs(ty)) return;   // not a sideways drag (yet)
        tr.dragging = true; moved = true;
        tr.fling = 0;
        el.classList.add("is-dragging");
        try { el.setPointerCapture(pid); } catch (_) {}
      }
      const dt = Math.max(1, e.timeStamp - lt) / 1000;
      tr.x -= dx;                                    // content follows the finger / cursor
      v += ((-dx / dt) - v) * 0.4;                   // smoothed speed, for the glide on release
      lx = e.clientX; lt = e.timeStamp;
      start();
    });
    const end = e => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!tr.dragging) return;
      tr.dragging = false;
      tr.dragEndAt = performance.now();
      // a quick flick glides on; a slow release just stops
      tr.fling = (e.timeStamp - lt < 90) ? Math.max(-3500, Math.min(3500, v)) : 0;
      tr.resume = 0;
      el.classList.remove("is-dragging");
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);

    // A drag should never open the viewer
    el.addEventListener("click", e => {
      if (moved && performance.now() - tr.dragEndAt < 400) { e.preventDefault(); e.stopPropagation(); }
      moved = false;
    }, true);

    el.addEventListener("wheel", e => {
      let dx = e.deltaX;
      if (!dx && e.shiftKey) dx = e.deltaY;
      if (!dx || Math.abs(dx) < Math.abs(e.deltaY) * 0.8 && !e.shiftKey) return;   // vertical: let the page scroll
      e.preventDefault();                                                           // also stops swipe-to-go-back
      tr.x += dx * (e.deltaMode === 1 ? 16 : 1);
      tr.fling = 0;
      tr.resume = 0;
      start();
    }, { passive: false });
  });

  // ---------- Optional viewer ----------
  const viewer = document.getElementById("wkViewer");
  const vImg = viewer.querySelector("img");
  const vScroll = viewer.querySelector(".wk-viewer__scroll");
  section.addEventListener("click", e => {
    const btn = e.target.closest(".wk-open");
    if (!btn || !viewer.showModal) return;
    const thumb = btn.querySelector("img");
    // Show the already-loaded preview at once, then swap in the sharp version when it arrives.
    vImg.src = thumb.currentSrc || thumb.src;
    viewer.classList.add("is-loading");
    const full = new Image();
    const want = btn.dataset.full;
    full.onload = () => { if (viewer.open && vImg.dataset.want === want) { vImg.src = want; viewer.classList.remove("is-loading"); } };
    full.onerror = () => viewer.classList.remove("is-loading");
    vImg.dataset.want = want;
    full.src = want;
    vImg.alt = (btn.getAttribute("aria-label") || "").replace(/^View /, "");
    viewer.classList.toggle("is-tall", btn.dataset.tall === "1");
    vScroll.scrollTop = 0;
    viewer.showModal();
    viewerOpen = true;
  });
  const close = () => viewer.open && viewer.close();
  viewer.querySelector(".wk-viewer__close").addEventListener("click", close);
  viewer.addEventListener("click", e => { if (e.target === viewer) close(); });
  viewer.addEventListener("close", () => { viewerOpen = false; vImg.removeAttribute("src"); });
})();
