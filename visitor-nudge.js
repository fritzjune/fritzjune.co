/**
 * Social Proof / Visitor Nudge Toast
 * Passively detects user location via privacy-compliant IP Geolocation API (ipapi.co with fallback),
 * displaying a sleek dark glassmorphism notification in the bottom right corner.
 * Fully GDPR/CCPA compliant: IP addresses are never logged or stored.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'fj_visitor_nudge_seen';
  var SHOW_DELAY = 2000; // 2 seconds delay before showing
  var DISPLAY_DURATION = 5000; // Display for 5 seconds
  var API_TIMEOUT = 3000; // 3s timeout for geo fetch

  // Prevent multiple executions or running if already seen in this session
  if (window.__fjVisitorNudgeLoaded) return;
  window.__fjVisitorNudgeLoaded = true;

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      return;
    }
  } catch (e) {
    // SessionStorage disabled or restricted
  }

  /**
   * Fetch user location passively using IP geolocation
   * No HTML5 Geolocation API used - zero permission popups
   */
  function fetchLocation() {
    return new Promise(function (resolve) {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var signal = controller ? controller.signal : null;
      var timer = setTimeout(function () {
        if (controller) controller.abort();
        resolve(null);
      }, API_TIMEOUT);

      fetch('https://ipapi.co/json/', { signal: signal })
        .then(function (res) {
          if (!res.ok) throw new Error('ipapi HTTP error');
          return res.json();
        })
        .then(function (data) {
          clearTimeout(timer);
          if (data && (data.city || data.region || data.country_name)) {
            var city = data.city || '';
            var stateOrCountry = data.region || data.country_name || '';
            resolve({ city: city, state: stateOrCountry });
          } else {
            resolve(null);
          }
        })
        .catch(function () {
          clearTimeout(timer);
          // Secondary fallback to ip-api.com via HTTPS if primary fails
          fetch('https://ip-api.com/json/?fields=status,city,regionName,country', { signal: signal })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              if (d && d.status === 'success') {
                resolve({ city: d.city || '', state: d.regionName || d.country || '' });
              } else {
                resolve(null);
              }
            })
            .catch(function () {
              resolve(null);
            });
        });
    });
  }

  /**
   * Format location into a natural notification message
   */
  function formatLocationMessage(loc) {
    if (!loc) {
      return 'Someone is currently viewing the site.';
    }
    if (loc.city && loc.state) {
      return 'Someone from <strong>' + escapeHtml(loc.city) + ', ' + escapeHtml(loc.state) + '</strong> is viewing the site.';
    }
    if (loc.city) {
      return 'Someone from <strong>' + escapeHtml(loc.city) + '</strong> is viewing the site.';
    }
    if (loc.state) {
      return 'Someone from <strong>' + escapeHtml(loc.state) + '</strong> is viewing the site.';
    }
    return 'Someone is currently viewing the site.';
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Render and trigger the visitor nudge toast
   */
  function showNudge(locationData) {
    var toast = document.createElement('div');
    toast.className = 'nudge-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML =
      '<span class="nudge-toast__indicator" aria-hidden="true">' +
        '<span class="nudge-toast__dot"></span>' +
        '<span class="nudge-toast__pulse"></span>' +
      '</span>' +
      '<div class="nudge-toast__content">' +
        '<p class="nudge-toast__text">' + formatLocationMessage(locationData) + '</p>' +
      '</div>' +
      '<button type="button" class="nudge-toast__close" aria-label="Close notification">' +
        '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M1 1l12 12M13 1L1 13"/>' +
        '</svg>' +
      '</button>';

    document.body.appendChild(toast);

    // Save to sessionStorage so it only shows once per session
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}

    // Trigger enter transition in next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('is-visible');
      });
    });

    var autoDismissTimer = setTimeout(dismiss, DISPLAY_DURATION);

    function dismiss() {
      clearTimeout(autoDismissTimer);
      toast.classList.remove('is-visible');
      toast.classList.add('is-hiding');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }

    var closeBtn = toast.querySelector('.nudge-toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', dismiss);
    }
  }

  // Initialize after specified delay
  setTimeout(function () {
    fetchLocation().then(function (loc) {
      showNudge(loc);
    });
  }, SHOW_DELAY);

})();
