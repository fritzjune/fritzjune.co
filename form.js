/* Enquiry form: validates in the browser, then posts to /api/lead (which forwards to Make.com).
   The Make webhook URL is never in this file; it lives in the MAKE_WEBHOOK_URL env variable on the server. */
(() => {
  const ENDPOINT = "/api/lead";
  const TIMEOUT_MS = 15000;

  const form = document.getElementById("enquiryForm");
  if (!form) return;
  const status = document.getElementById("formStatus");
  const done = document.getElementById("formDone");
  const submit = form.querySelector(".form__submit");
  const submitText = form.querySelector(".form__submit-text");
  const SUBMIT_LABEL = submitText.textContent;

  const startedAt = Date.now();
  const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2));
  let submissionKey = newKey();
  let sending = false;

  // Time zone label + earliest selectable date
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  if (tz) document.getElementById("tzLabel").textContent = ` (${tz.replace(/_/g, " ")})`;
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  form.preferred_date.min = today.toISOString().slice(0, 10);

  // Message counter
  const msg = form.message, counter = document.getElementById("c-message");
  const count = () => { counter.textContent = `${msg.value.length} / ${msg.maxLength}`; };
  msg.addEventListener("input", count);

  // ---------- Validation (mirrors api/lead.js) ----------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^[+()\-.\s\d]{7,20}$/;
  const rules = {
    full_name: () => form.full_name.value.trim().length >= 2 || "Add your name.",
    email: () => {
      const v = form.email.value.trim();
      if (!v) return "Add your email address.";
      return EMAIL_RE.test(v) || "That email address doesn't look right. Check for typos.";
    },
    phone: () => { const v = form.phone.value.trim(); return !v || PHONE_RE.test(v) || "Use digits, spaces and + only."; },
    service: () => !!form.querySelector('input[name="service"]:checked') || "Pick what you'd like help with.",
    preferred_date: () => { const v = form.preferred_date.value; return !v || v >= form.preferred_date.min || "Pick a date from today onwards."; },
    message: () => form.message.value.trim().length >= 10 || "Tell me a little more (10 characters or more).",
    consent: () => form.consent.checked || "Tick the box so I can use these details to reply."
  };
  const fieldEl = name => (form.elements[name] instanceof RadioNodeList ? form.elements[name][0] : form.elements[name]).closest(".field");
  const touched = new Set();

  function setError(name, message) {
    const wrap = fieldEl(name);
    const err = document.getElementById("e-" + name);
    const invalid = typeof message === "string";
    wrap.classList.toggle("is-invalid", invalid);
    wrap.classList.toggle("is-valid", !invalid && touched.has(name));
    if (err) err.textContent = invalid ? message : "";
    const inputs = form.elements[name] instanceof RadioNodeList ? [...form.elements[name]] : [form.elements[name]];
    inputs.forEach(i => i.setAttribute("aria-invalid", String(invalid)));
  }
  const check = name => { const r = rules[name](); setError(name, r); return r === true; };

  Object.keys(rules).forEach(name => {
    const els = form.elements[name] instanceof RadioNodeList ? [...form.elements[name]] : [form.elements[name]];
    els.forEach(el => {
      el.addEventListener("blur", () => { if (el.type !== "radio" && el.type !== "checkbox") { touched.add(name); check(name); } });
      el.addEventListener(el.type === "radio" || el.type === "checkbox" || el.tagName === "SELECT" || el.type === "date" ? "change" : "input", () => {
        if (touched.has(name) || fieldEl(name).classList.contains("is-invalid") || el.type === "radio" || el.type === "checkbox") { touched.add(name); check(name); }
      });
    });
  });

  const setStatus = text => { status.textContent = text || ""; };
  function setSending(on) {
    sending = on;
    submit.disabled = on;
    form.classList.toggle("is-sending", on);
    form.setAttribute("aria-busy", String(on));
    submitText.textContent = on ? "Sending" : SUBMIT_LABEL;
  }

  // ---------- Submit ----------
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (sending) return; // duplicate click guard

    Object.keys(rules).forEach(n => touched.add(n));
    const failed = Object.keys(rules).filter(n => !check(n));
    if (failed.length) {
      setStatus(failed.length === 1 ? "One field needs a look." : `${failed.length} fields need a look.`);
      const first = form.elements[failed[0]];
      (first instanceof RadioNodeList ? first[0] : first).focus();
      return;
    }

    const payload = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      company: form.company.value.trim(),
      service: form.querySelector('input[name="service"]:checked').value,
      team_size: form.team_size.value,
      budget: form.budget.value,
      preferred_date: form.preferred_date.value,
      preferred_time: form.preferred_time.value,
      timezone: tz,
      message: form.message.value.trim(),
      consent: form.consent.checked,
      website_url: form.website_url.value,   // honeypot
      started_at: startedAt,
      submission_key: submissionKey,
      page: location.origin + location.pathname
    };

    setStatus("");
    setSending(true);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.fields) Object.entries(data.fields).forEach(([n, m]) => rules[n] && setError(n, m));
        throw new Error(data.error || "Your message didn't send. Please try again in a minute, or book a time on the calendar.");
      }
      showDone(payload.email, data.lead_id);
    } catch (err) {
      setStatus(err.name === "AbortError"
        ? "This is taking too long. Check your connection and try again."
        : (err.message && !/Failed to fetch|NetworkError|Load failed/i.test(err.message)
            ? err.message
            : "Your message didn't send. Check your connection and try again, or book a time on the calendar."));
    } finally {
      clearTimeout(timer);
      setSending(false);
    }
  });

  function showDone(email, ref) {
    document.getElementById("doneEmail").textContent = email;
    document.getElementById("doneRef").textContent = ref || "sent";
    form.reset();                  // clear only after a confirmed success
    touched.clear();
    form.querySelectorAll(".field").forEach(f => f.classList.remove("is-invalid", "is-valid"));
    count();
    submissionKey = newKey();
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  document.getElementById("sendAnother").addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
    form.full_name.focus();
  });
})();
