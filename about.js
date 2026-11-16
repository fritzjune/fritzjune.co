// About section — Config-driven chapters scroll story, sticky desktop media switcher, and lazy-loaded video
(() => {
  const IK_BASE = 'https://ik.imagekit.io/jnj5x9prn/Public%20Asset/';

  // Config-driven chapters array.
  // Render a chapter's media only if media.src is non-empty.
  const aboutChapters = [
    {
      id: 'about-ch-1',
      step: '01',
      title: 'I started as a teacher.',
      body:
        "More than five years teaching English taught me to explain things clearly, stay patient and meet people where they are. It turns out that's most of the job.",
      media: {
        type: 'image',
        src: `${IK_BASE}About%20Me%20Pictures/IMG_0217.JPG?updatedAt=1794396430518&tr=w-960,q-80`,
        poster: '',
        alt: 'Fritz June sitting at an open-air mountain café table overlooking green hills',
        caption: 'More than five years teaching English — learning to explain things clearly and meet people where they are.'
      },
      gallery: []
    },
    {
      id: 'about-ch-2',
      step: '02',
      title: 'Then I ran my own business.',
      body:
        'I had a printing business and sold products online. I know the "nobody does it as well as I do" feeling because I had it. Handing off design, production and shipping is what finally made the business run. When COVID stopped events and made shipping hard, I paused the physical side and moved to services.',
      media: {
        type: 'image',
        src: `${IK_BASE}About%20Me%20Pictures/IMG_0198.JPG?updatedAt=1794396427427&tr=w-960,q-80`,
        poster: '',
        alt: 'Fritz June standing outdoors with her family beneath a wooden pergola',
        caption: 'With family in the Philippines — running our own business taught me how to build handoffs that work.'
      },
      gallery: [
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0198.JPG?updatedAt=1794396427427&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0198.JPG?updatedAt=1794396427427&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June standing outdoors with her family beneath a wooden pergola',
          caption: 'With family in the Philippines — running our own business taught me how to build handoffs that work.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0216.JPG?updatedAt=1794396432574&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0216.JPG?updatedAt=1794396432574&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June and her extended family gathered around a circular floating dining table over water',
          caption: 'Family lunch together around a floating table.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0215.JPG?updatedAt=1794396428240&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0215.JPG?updatedAt=1794396428240&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June and family wearing life vests in front of a forest waterfall',
          caption: 'Outdoors with family at a waterfall in the Philippines.'
        }
      ]
    },
    {
      id: 'about-ch-3',
      step: '03',
      title: "Now I work like it's mine.",
      body:
        "For about four years I've supported founders, coaches and online business owners across marketing, operations and executive support. I treat the business like my own, which means I don't wait to be handed things.",
      pullQuoteAfter:
        'I think like a founder, work like a founder, and treat every business I support as if it were my own.',
      media: {
        type: 'image',
        src: `${IK_BASE}About%20Me%20Asset.png?updatedAt=1794396438652&tr=w-960,q-80`,
        poster: '',
        alt: "Portrait of Fritz June smiling in a teal blazer with 'a little about me' behind her",
        caption: 'Four years supporting founders across marketing, operations and executive priorities.'
      },
      gallery: []
    },
    {
      id: 'about-ch-4',
      step: '04',
      title: 'Off the clock.',
      body:
        "I'm happiest in the sea. Snorkelling, diving, anywhere the water's clear. Under there, everything goes quiet. It's the feeling I'd like your business to have too.",
      media: {
        type: 'video',
        src: `${IK_BASE}sardines.mp4?updatedAt=1794396494743`,
        poster: `${IK_BASE}About%20Me%20Pictures/IMG_0207.JPG?updatedAt=1794396422046&tr=w-960,q-80`,
        alt: 'Underwater video swimming through a shimmering school of sardines in clear blue sea water',
        caption: 'Under the surface with a school of sardines — where everything goes quiet.',
        captionsTrack: ''
      },
      gallery: [
        {
          type: 'video',
          src: `${IK_BASE}sardines.mp4?updatedAt=1794396494743`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0207.JPG?updatedAt=1794396422046&tr=w-240,q-70`,
          poster: `${IK_BASE}About%20Me%20Pictures/IMG_0207.JPG?updatedAt=1794396422046&tr=w-960,q-80`,
          alt: 'Underwater video swimming through a shimmering school of sardines in clear blue sea water',
          caption: 'Under the surface with a school of sardines — where everything goes quiet.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0207.JPG?updatedAt=1794396422046&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0207.JPG?updatedAt=1794396422046&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June freediving alongside a sea turtle in clear blue ocean water',
          caption: 'Freediving alongside a sea turtle in clear water.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0210.JPG?updatedAt=1794396427198&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0210.JPG?updatedAt=1794396427198&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June snorkelling underwater with a whale shark swimming behind her',
          caption: 'Snorkelling alongside a whale shark.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0211.JPG?updatedAt=1794396429678&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0211.JPG?updatedAt=1794396429678&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June diving over a coral reef surrounded by yellow reef fish',
          caption: 'Diving over a shallow coral reef.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0204.JPG?updatedAt=1794396422232&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0204.JPG?updatedAt=1794396422232&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June freediving beside an underwater mermaid statue on the ocean floor',
          caption: 'Exploring an underwater reef statue.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0203.JPG?updatedAt=1794396437294&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0203.JPG?updatedAt=1794396437294&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June sitting on a wooden swing hanging from a coastal tree on a sandy beach',
          caption: 'By the coast on a quiet afternoon.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0214.JPG?updatedAt=1794396426392&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0214.JPG?updatedAt=1794396426392&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June smiling in a natural lagoon surrounded by dark volcanic rock formations',
          caption: 'Swimming in a natural coastal lagoon.'
        },
        {
          type: 'image',
          src: `${IK_BASE}About%20Me%20Pictures/IMG_0213.JPG?updatedAt=1794396437432&tr=w-960,q-80`,
          thumb: `${IK_BASE}About%20Me%20Pictures/IMG_0213.JPG?updatedAt=1794396437432&tr=w-240,q-70`,
          poster: '',
          alt: 'Fritz June standing in a forest clearing in front of a wide cascading waterfall',
          caption: 'Exploring waterfalls and quiet trails off the clock.'
        }
      ]
    }
  ];

  window.aboutChapters = aboutChapters;

  const chaptersListEl = document.getElementById('aboutChaptersList');
  const stageColEl = document.getElementById('aboutStageCol');
  const stageEl = document.getElementById('aboutStage');
  const storyEl = document.getElementById('aboutStory');

  if (!chaptersListEl || !stageEl || !storyEl) return;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReducedMotion = () => reduceMotionQuery.matches;

  function hasValidMedia(media) {
    return Boolean(media && typeof media.src === 'string' && media.src.trim().length > 0);
  }

  // Build HTML for a media figure (image or video, respecting prefers-reduced-motion)
  function renderMediaElement(media) {
    if (!hasValidMedia(media)) return '';

    if (media.type === 'video') {
      // Under prefers-reduced-motion: show poster image only, no autoplay video
      if (isReducedMotion()) {
        const posterSrc = media.poster || '';
        if (!posterSrc) return '';
        return `
          <img
            class="about-media__img"
            src="${posterSrc}"
            alt="${media.alt || ''}"
            width="960"
            height="720"
            loading="lazy"
            decoding="async">
        `;
      }

      const trackHtml = media.captionsTrack
        ? `<track kind="captions" src="${media.captionsTrack}" srclang="en" label="English">`
        : '';

      return `
        <video
          class="about-media__video"
          muted
          loop
          playsinline
          preload="none"
          ${media.poster ? `poster="${media.poster}"` : ''}
          data-src="${media.src}"
          aria-label="${media.alt || 'Chapter video'}">
          ${trackHtml}
        </video>
      `;
    }

    return `
      <img
        class="about-media__img"
        src="${media.src}"
        alt="${media.alt || ''}"
        width="960"
        height="720"
        loading="lazy"
        decoding="async">
    `;
  }

  function renderGalleryThumbs(chapter, scopePrefix) {
    if (!Array.isArray(chapter.gallery) || chapter.gallery.length <= 1) return '';
    return `
      <div class="about-thumbs" role="group" aria-label="More photos for ${chapter.title}">
        ${chapter.gallery
          .map(
            (item, gIdx) => `
          <button
            type="button"
            class="about-thumb ${gIdx === 0 ? 'is-active' : ''}"
            data-chap-id="${chapter.id}"
            data-gallery-idx="${gIdx}"
            data-scope="${scopePrefix}"
            aria-label="${item.type === 'video' ? 'Video: ' : 'Photo: '}${item.alt || item.caption || `Item ${gIdx + 1}`}"
            aria-pressed="${gIdx === 0 ? 'true' : 'false'}">
            <img src="${item.thumb || item.poster || item.src}" alt="" width="56" height="42" loading="lazy" decoding="async">
            ${item.type === 'video' ? '<span class="about-thumb__badge" aria-hidden="true">▶</span>' : ''}
          </button>
        `
          )
          .join('')}
      </div>
    `;
  }

  // Render chapters + desktop stage cards
  function renderAbout() {
    const anyChapterHasMedia = aboutChapters.some((ch) => hasValidMedia(ch.media));
    storyEl.classList.toggle('about__story--text-only', !anyChapterHasMedia);
    if (stageColEl) {
      stageColEl.hidden = !anyChapterHasMedia;
    }

    // 1. Render scrolling chapters column (includes mobile media above text + pull quote after chapter 3)
    chaptersListEl.innerHTML = aboutChapters
      .map((ch, idx) => {
        const hasMedia = hasValidMedia(ch.media);
        const mobileMediaHtml = hasMedia
          ? `
          <div class="about-chap__mobile-media" data-mobile-media="${ch.id}">
            <figure class="about-media">
              <div class="about-media__frame" data-media-box="${ch.id}">
                ${renderMediaElement(ch.media)}
              </div>
              ${
                ch.media.caption
                  ? `<figcaption class="about-media__cap" data-media-cap="${ch.id}">${ch.media.caption}</figcaption>`
                  : `<figcaption class="about-media__cap" data-media-cap="${ch.id}" hidden></figcaption>`
              }
            </figure>
            ${renderGalleryThumbs(ch, 'mobile')}
          </div>
        `
          : '';

        const pullQuoteHtml = ch.pullQuoteAfter
          ? `
          <blockquote class="about-quote" aria-label="Founder mindset quote">
            <p>“${ch.pullQuoteAfter}”</p>
          </blockquote>
        `
          : '';

        return `
        <article
          class="about-chap ${hasMedia ? '' : 'about-chap--text-only'} ${idx === 0 ? 'is-active' : ''}"
          id="${ch.id}"
          data-chap-index="${idx}"
          tabindex="0">
          ${mobileMediaHtml}
          <div class="about-chap__content">
            <span class="about-chap__step" aria-hidden="true">Chapter ${ch.step}</span>
            <h3 class="about-chap__title">${ch.title}</h3>
            <p class="about-chap__body">${ch.body}</p>
          </div>
        </article>
        ${pullQuoteHtml}
      `;
      })
      .join('');

    // 2. Render sticky desktop media cards (only for chapters with valid media.src)
    if (anyChapterHasMedia) {
      stageEl.innerHTML = aboutChapters
        .map((ch, idx) => {
          if (!hasValidMedia(ch.media)) return '';
          return `
          <div
            class="about-stage__panel ${idx === 0 ? 'is-active' : ''}"
            data-stage-panel="${ch.id}"
            data-stage-index="${idx}">
            <figure class="about-media">
              <div class="about-media__frame" data-stage-box="${ch.id}">
                ${renderMediaElement(ch.media)}
              </div>
              ${
                ch.media.caption
                  ? `<figcaption class="about-media__cap" data-stage-cap="${ch.id}">${ch.media.caption}</figcaption>`
                  : `<figcaption class="about-media__cap" data-stage-cap="${ch.id}" hidden></figcaption>`
              }
            </figure>
            ${renderGalleryThumbs(ch, 'desktop')}
          </div>
        `;
        })
        .join('');
    } else {
      stageEl.innerHTML = '';
    }
  }

  renderAbout();

  // Lazy-load and pause/play videos using IntersectionObserver
  let videoObserver = null;

  function hydrateAndPlayVideo(video) {
    if (!video || isReducedMotion()) return;
    if (!video.getAttribute('src') && video.dataset.src) {
      video.src = video.dataset.src;
      video.load();
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function pauseVideo(video) {
    if (!video) return;
    try {
      video.pause();
    } catch (_) {}
  }

  function observeVideos() {
    if (videoObserver) {
      videoObserver.disconnect();
    }
    if (isReducedMotion() || !('IntersectionObserver' in window)) return;

    videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const panel = video.closest('.about-stage__panel');
          const isPanelActive = !panel || panel.classList.contains('is-active');

          if (entry.isIntersecting && isPanelActive && !isReducedMotion()) {
            hydrateAndPlayVideo(video);
          } else {
            pauseVideo(video);
          }
        });
      },
      { rootMargin: '120px 0px', threshold: 0.15 }
    );

    storyEl.querySelectorAll('video.about-media__video').forEach((v) => {
      videoObserver.observe(v);
    });
  }

  observeVideos();

  // Switch active chapter on desktop sticky stage
  let activeChapIndex = 0;

  function setActiveChapter(index) {
    const ch = aboutChapters[index];
    if (!ch) return;
    activeChapIndex = index;

    const articles = chaptersListEl.querySelectorAll('.about-chap');
    articles.forEach((art, i) => {
      art.classList.toggle('is-active', i === index);
    });

    const panels = stageEl.querySelectorAll('.about-stage__panel');
    const targetHasMedia = hasValidMedia(ch.media);
    stageColEl.classList.toggle('is-empty', !targetHasMedia);

    panels.forEach((panel) => {
      const isMatch = panel.getAttribute('data-stage-panel') === ch.id;
      panel.classList.toggle('is-active', isMatch);
      const vid = panel.querySelector('video.about-media__video');
      if (vid) {
        if (isMatch && !isReducedMotion()) {
          hydrateAndPlayVideo(vid);
        } else {
          pauseVideo(vid);
        }
      }
    });
  }

  // Thumbnail switcher for chapters with gallery items
  storyEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.about-thumb');
    if (!btn) return;

    const chapId = btn.getAttribute('data-chap-id');
    const gIdx = Number(btn.getAttribute('data-gallery-idx'));
    const chapter = aboutChapters.find((c) => c.id === chapId);
    if (!chapter || !Array.isArray(chapter.gallery) || !chapter.gallery[gIdx]) return;

    const chosen = chapter.gallery[gIdx];

    // Update both desktop stage and mobile media box for this chapter so they stay in sync
    const boxes = [
      storyEl.querySelector(`[data-stage-box="${chapId}"]`),
      storyEl.querySelector(`[data-media-box="${chapId}"]`)
    ].filter(Boolean);

    const caps = [
      storyEl.querySelector(`[data-stage-cap="${chapId}"]`),
      storyEl.querySelector(`[data-media-cap="${chapId}"]`)
    ].filter(Boolean);

    boxes.forEach((box) => {
      const existingVid = box.querySelector('video');
      if (existingVid) pauseVideo(existingVid);
      box.innerHTML = renderMediaElement(chosen);
      const newVid = box.querySelector('video.about-media__video');
      if (newVid && !isReducedMotion()) {
        if (videoObserver) videoObserver.observe(newVid);
        hydrateAndPlayVideo(newVid);
      }
    });

    caps.forEach((cap) => {
      if (chosen.caption) {
        cap.textContent = chosen.caption;
        cap.hidden = false;
      } else {
        cap.textContent = '';
        cap.hidden = true;
      }
    });

    // Update active state on thumbs for this chapter
    storyEl.querySelectorAll(`.about-thumb[data-chap-id="${chapId}"]`).forEach((t) => {
      const active = Number(t.getAttribute('data-gallery-idx')) === gIdx;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  });

  // Keyboard focus on a chapter activates its media on desktop
  chaptersListEl.querySelectorAll('.about-chap').forEach((art) => {
    art.addEventListener('focusin', () => {
      const idx = Number(art.getAttribute('data-chap-index'));
      if (!Number.isNaN(idx) && idx !== activeChapIndex) {
        setActiveChapter(idx);
      }
    });
  });

  // Scroll-driven active chapter detection
  if ('IntersectionObserver' in window) {
    const chapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-chap-index'));
            if (!Number.isNaN(idx) && idx !== activeChapIndex) {
              setActiveChapter(idx);
            }
          }
        });
      },
      {
        rootMargin: '-28% 0px -42% 0px',
        threshold: 0.05
      }
    );

    chaptersListEl.querySelectorAll('.about-chap').forEach((art) => {
      chapObserver.observe(art);
    });
  }

  // Re-render if prefers-reduced-motion changes at runtime
  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', () => {
      renderAbout();
      observeVideos();
      setActiveChapter(activeChapIndex);
    });
  }
})();
