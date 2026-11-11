/* Live world clocks in the closing section. Updates on the minute; pauses while the tab is hidden. */
(() => {
  const times = [...document.querySelectorAll("[data-tz]")];
  if (!times.length) return;
  const days = [...document.querySelectorAll("[data-tz-day]")];
  const names = [...document.querySelectorAll("[data-tz-name]")];

  const fmt = tz => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  const dayFmt = tz => new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long" });
  // "PST"/"PDT", "CST"/"CDT", "EST"/"EDT": follows daylight saving automatically
  const abbr = tz => {
    try { return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date()).find(p => p.type === "timeZoneName").value; }
    catch (_) { return ""; }
  };

  function update() {
    const now = new Date();
    times.forEach(el => {
      el.textContent = fmt(el.dataset.tz).format(now);
    });
    days.forEach(el => { el.textContent = dayFmt(el.dataset.tzDay).format(now); });
    names.forEach(el => {
      const base = el.dataset.base || (el.dataset.base = el.textContent);
      const a = abbr(el.dataset.tzName);
      el.textContent = a && !/^GMT/.test(a) ? `${base} (${a})` : base;
    });
  }

  let timer = 0;
  function schedule() {
    clearTimeout(timer);
    update();
    timer = setTimeout(schedule, 60000 - (Date.now() % 60000) + 50);   // tick right after each minute changes
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(timer); else schedule(); });
  schedule();
})();
