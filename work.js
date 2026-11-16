// Work section — Featured case studies, filterable gallery, and accessible lightbox
(() => {
  const BASE = 'https://ik.imagekit.io/jnj5x9prn/Public%20Asset/Work%20Output/';
  const enc = (s) => s.split('/').map(encodeURIComponent).join('/');
  const ik = (path, tr) => `${BASE}${enc(path)}?tr=${tr}`;

  const INITIAL_LIMIT = 8;

  // Unconfirmed case studies stay out or commented with TODO so placeholders never render on the live page.
  const WORK_FEATURED = [
    {
      tag: 'Client work',
      scope: 'Marketing, operations & executive support',
      title: 'Mind Is Medicine',
      siteLabel: 'mindismedicine.com',
      noticed:
        'As the business expanded across new programmes, webinars and site pages, launch pieces and backend updates were waiting on the founder to coordinate.',
      did:
        'Picked up day-to-day execution across the website, webinar sign-up funnels, course enrolment pages and recurring operational handoffs.',
      changed:
        'Launches, page updates and weekly operations kept moving on schedule without waiting for a task list.',
      quote:
        '“She’s become like my second brain, and I genuinely feel confident knowing she has things covered.”',
      quoteAttribution: 'Founder, Mind Is Medicine',
      preview: {
        thumb: ik(
          'Website/ExporttoFigma _ mindismedicine.com _ Mind Is Medicine_ Turn Daily Stress Into Lasting Calm.svg',
          'f-jpg,w-720,q-75'
        ),
        full: ik(
          'Website/ExporttoFigma _ mindismedicine.com _ Mind Is Medicine_ Turn Daily Stress Into Lasting Calm.svg',
          'f-jpg,w-1400,q-80'
        ),
        caption: 'mindismedicine.com: home page',
        alt: 'Home page of the mindismedicine.com website',
        tag: 'Client work',
        tall: true
      }
    }
    // TODO: Add additional featured case studies here once client-approved details are confirmed.
  ];

  const CATEGORY_LINES = {
    all: '',
    websites: 'Brand sites and multi-page builds, from home page to newsroom.',
    funnels: 'Webinar sign-ups, course enrolments and launch pages.',
    social: 'Launch posts, template drops and campaign creative, made in batches.',
    analytics: 'Dashboards that show what’s working.',
    automations: 'Workflows that run without anyone chasing them, and product flows mapped before a line of code.'
  };

  // 26 Social Media items (collapsed into 1 gallery tile that opens a 26-slide swipeable lightbox)
  const SOCIAL_FILES = [
    { path: 'Social Media/June 2.3.jpg', detail: 'Product update post' },
    { path: 'Social Media/June 2.2.jpg', detail: 'Feature highlight post' },
    { path: 'Social Media Content (2).webp', detail: 'Campaign mockup spread', root: true },
    { path: 'Social Media/June 2.5.jpg', detail: 'Template drop announcement' },
    { path: 'Social Media/June 2.jpg', detail: 'Launch announcement graphic' },
    { path: 'Social Media/June 2.7.jpg', detail: 'Workflow tip card' },
    { path: 'Social Media/June 2.4.jpg', detail: 'Feature breakdown card' },
    { path: 'Social Media Content (1).webp', detail: 'Multi-post feed preview', root: true },
    { path: 'Social Media/June 3.jpg', detail: 'Community spotlight post' },
    { path: 'Social Media/19.jpg', detail: 'Campaign quote graphic' },
    { path: 'Social Media/June 2.1.jpg', detail: 'Product launch carousel cover' },
    { path: 'Social Media/June 1.jpg', detail: 'Monthly drop cover graphic' },
    { path: 'Social Media/15.jpg', detail: 'Workshop promo card' },
    { path: 'Social Media/16.jpg', detail: 'Session reminder graphic' },
    { path: 'Social Media Content (3).webp', detail: 'Campaign creative batch overview', root: true },
    { path: 'Social Media/June 7.jpg', detail: 'Feature release post' },
    { path: 'Social Media/23.jpg', detail: 'Template showcase card' },
    { path: 'Social Media/18.jpg', detail: 'Founder tip graphic' },
    { path: 'Social Media/June 2.6.jpg', detail: 'Product walkthrough graphic' },
    { path: 'Social Media/June 5.jpg', detail: 'Facilitator toolkit post' },
    { path: 'Frame 1.jpg', detail: 'Social campaign layout board', root: true },
    { path: 'Social Media/22.jpg', detail: 'Engagement prompt graphic' },
    { path: 'Social Media/June 6.jpg', detail: 'New release announcement' },
    { path: 'Social Media/21.jpg', detail: 'Resource drop graphic' },
    { path: 'Social Media/17.jpg', detail: 'Event announcement post' },
    { path: 'Social Media/20.jpg', detail: 'Series wrap-up graphic' }
  ];

  const SOCIAL_SLIDES = SOCIAL_FILES.map((item, idx) => ({
    thumb: ik(item.path, item.root ? 'w-640,q-75' : 'w-480,q-75'),
    full: ik(item.path, 'w-1400,q-85'),
    caption: `Social content for a SaaS brand — ${item.detail} (${idx + 1} of ${SOCIAL_FILES.length})`,
    alt: `Launch posts, template drops and campaign creative for a SaaS brand (${idx + 1} of ${SOCIAL_FILES.length})`,
    tag: 'Client work',
    tall: false
  }));

  // 9 Analytics dashboard items (collapsed into 1 gallery tile with inspected factual captions)
  const ANALYTICS_SLIDES = [
    {
      path: 'Analytics/Screenshot_7.png',
      caption: 'Social Planner dashboard: shows weekly post volume (37 posts) and impressions (2.19K) by platform',
      alt: 'Screenshot of Social Planner dashboard showing weekly post volume and impressions by platform'
    },
    {
      path: 'Analytics/Screenshot_4.png',
      caption: 'Social Planner overview: shows monthly post output (336 posts) and impressions (29.77K) by week and channel',
      alt: 'Screenshot of Social Planner overview showing monthly post output and impressions by week and channel'
    },
    {
      path: 'Analytics/Screenshot_6.png',
      caption: 'Impressions and reach dashboard: shows total impressions (29.77K) and post reach (21.2K) by social channel',
      alt: 'Screenshot of impressions and reach dashboard across social channels'
    },
    {
      path: 'Analytics/Social media.png',
      caption: 'Daily social performance dashboard: shows daily post output (37 posts) and impression trends across Facebook, Instagram, and LinkedIn',
      alt: 'Screenshot of daily social performance dashboard across Facebook, Instagram, and LinkedIn'
    },
    {
      path: 'Analytics/Screenshot_8.png',
      caption: 'Channel engagement dashboard: shows published posts (37, +640%) and likes, comments, and shares by platform',
      alt: 'Screenshot of channel engagement dashboard showing published posts and interactions by platform'
    },
    {
      path: 'Analytics/Screenshot_5.png',
      caption: 'Monthly channel distribution dashboard: shows 336 published posts (+41.18%) and engagement trends across YouTube, Facebook, Instagram, and TikTok',
      alt: 'Screenshot of monthly channel distribution dashboard across YouTube, Facebook, Instagram, and TikTok'
    },
    {
      path: 'Analytics/Screenshot_2.png',
      caption: 'Weekly social performance dashboard: shows 336 posts, 740 likes, and 29.77K impressions by week',
      alt: 'Screenshot of weekly social performance dashboard showing posts, likes, and impressions'
    },
    {
      path: 'Analytics/Screenshot_3.png',
      caption: 'Platform output and engagement dashboard: shows 336 posts (+41.18%) and likes, comments, and shares by social network',
      alt: 'Screenshot of platform output and engagement dashboard by social network'
    },
    {
      path: 'Analytics/Screenshot_1.png',
      caption: 'Engagement and impressions dashboard: shows likes, comments, shares, and 2.19K impressions (+528.65%) by social channel',
      alt: 'Screenshot of engagement and impressions dashboard by social channel'
    }
  ].map((item) => ({
    thumb: ik(item.path, 'w-640,q-75'),
    full: ik(item.path, 'w-1600,q-85'),
    caption: item.caption,
    alt: item.alt,
    tag: 'Client work',
    tall: false
  }));

  // All gallery tiles. Ordered so the initial 8 in "All" include Websites, Funnels, Social (26), Analytics (9), and Automations & prototypes.
  const GALLERY_ITEMS = [
    // Initial 8 in "All"
    {
      id: 'web-mim-home',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Client work',
      caption: 'mindismedicine.com: home page',
      alt: 'Home page of the mindismedicine.com website',
      thumb: ik('Website/ExporttoFigma _ mindismedicine.com _ Mind Is Medicine_ Turn Daily Stress Into Lasting Calm.svg', 'f-jpg,w-640,q-75'),
      full: ik('Website/ExporttoFigma _ mindismedicine.com _ Mind Is Medicine_ Turn Daily Stress Into Lasting Calm.svg', 'f-jpg,w-1400,q-80'),
      tall: true
    },
    {
      id: 'web-butter',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Client work',
      caption: 'butter.us: product site',
      alt: 'Product website for butter.us',
      thumb: ik('Website/butter.us.png', 'w-640,q-75'),
      full: ik('Website/butter.us.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'fun-mm-assembly',
      category: 'funnels',
      categoryLabel: 'Funnel & landing page',
      tag: 'Client work',
      caption: 'Mister Motivation: assembly landing page',
      alt: 'Landing page for Mister Motivation assemblies',
      thumb: ik('Website/screencapture-lp-mister-motivation-com-assembly-2026-08-27-08_36_10.png', 'w-640,q-75'),
      full: ik('Website/screencapture-lp-mister-motivation-com-assembly-2026-08-27-08_36_10.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'fun-science-safety',
      category: 'funnels',
      categoryLabel: 'Funnel & landing page',
      tag: 'Client work',
      caption: 'Science of Safety: webinar sign-up',
      alt: 'Webinar sign-up page for Science of Safety',
      thumb: ik('Website/screencapture-mindismedicineinstitute-webinar-science-of-safety-2026-08-27-08_29_48.png', 'w-640,q-75'),
      full: ik('Website/screencapture-mindismedicineinstitute-webinar-science-of-safety-2026-08-27-08_29_48.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'soc-bundle',
      category: 'social',
      categoryLabel: 'Social · 26 items',
      tag: 'Client work',
      caption: 'Social content for a SaaS brand',
      alt: 'Launch posts, template drops and campaign creative for a SaaS brand',
      thumb: ik('Social Media Content (2).webp', 'w-640,q-75'),
      full: ik('Social Media Content (2).webp', 'w-1400,q-85'),
      tall: false,
      slides: SOCIAL_SLIDES
    },
    {
      id: 'ana-bundle',
      category: 'analytics',
      categoryLabel: 'Analytics · 9 dashboards',
      tag: 'Client work',
      caption: 'Reporting dashboards',
      alt: 'Screenshots of reporting dashboards',
      thumb: ik('Analytics/Screenshot_7.png', 'w-640,q-75'),
      full: ik('Analytics/Screenshot_7.png', 'w-1600,q-85'),
      tall: false,
      slides: ANALYTICS_SLIDES
    },
    {
      id: 'auto-discovery',
      category: 'automations',
      categoryLabel: 'Automation workflow',
      tag: 'Client work',
      caption: 'Automation workflows — Discovery Call Reminders: shows confirmation, reminder sequence, and appointment status routing',
      alt: 'Screenshot of an automation workflow',
      thumb: ik('Workflow/Screenshot_10.png', 'w-640,q-75'),
      full: ik('Workflow/Screenshot_10.png', 'w-1600,q-85'),
      tall: false
    },
    {
      id: 'auto-prototype',
      category: 'automations',
      categoryLabel: 'Product prototype',
      tag: 'Concept',
      caption: 'App prototype screens',
      alt: 'Screens from an app prototype',
      thumb: ik('Prototype.png', 'w-640,q-75'),
      full: ik('Prototype.png', 'w-1600,q-85'),
      tall: false
    },

    // Remaining items revealed via "Show more" in All view, or immediately in category views
    {
      id: 'web-mim-app',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Client work',
      caption: 'Mind Is Medicine Institute: app page',
      alt: 'App page on the Mind Is Medicine Institute site',
      thumb: ik('Website/screencapture-mindismedicineinstitute-app-page-page-2026-08-27-08_27_03.png', 'w-640,q-75'),
      full: ik('Website/screencapture-mindismedicineinstitute-app-page-page-2026-08-27-08_27_03.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'web-forthewoo',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Client work',
      caption: 'forthewoo.co: listening site',
      alt: 'Listening site for forthewoo.co',
      thumb: ik('Website/screencapture-listen-forthewoo-co-2026-08-27-08_34_53.png', 'w-640,q-75'),
      full: ik('Website/screencapture-listen-forthewoo-co-2026-08-27-08_34_53.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'web-sports-home',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Concept',
      caption: 'Sports club site: home page',
      alt: 'Sports club website home page',
      thumb: ik('Website/screencapture-preview-1780413127033487825-vibepreview-com-2026-08-27-08_38_58.png', 'w-640,q-75'),
      full: ik('Website/screencapture-preview-1780413127033487825-vibepreview-com-2026-08-27-08_38_58.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'web-sports-team',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Concept',
      caption: 'Sports club site: team page',
      alt: 'Sports club website team page',
      thumb: ik('Website/screencapture-preview-1780413127033487825-vibepreview-com-team-2026-08-27-08_38_32.png', 'w-640,q-75'),
      full: ik('Website/screencapture-preview-1780413127033487825-vibepreview-com-team-2026-08-27-08_38_32.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'web-sports-news',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Concept',
      caption: 'Sports club site: news page',
      alt: 'Sports club website news page',
      thumb: ik('Website/screencapture-preview-1780413127033487825-vibepreview-com-news-2026-08-27-08_41_18.png', 'w-640,q-75'),
      full: ik('Website/screencapture-preview-1780413127033487825-vibepreview-com-news-2026-08-27-08_41_18.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'web-mm-calendar',
      category: 'websites',
      categoryLabel: 'Website',
      tag: 'Client work',
      caption: 'Mister Motivation: assembly calendar',
      alt: 'Assembly calendar page for Mister Motivation',
      thumb: ik('Website/screencapture-lp-mister-motivation-com-assembly-calendar-2026-08-27-08_36_28.png', 'w-640,q-75'),
      full: ik('Website/screencapture-lp-mister-motivation-com-assembly-calendar-2026-08-27-08_36_28.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'fun-mim-prog',
      category: 'funnels',
      categoryLabel: 'Funnel & landing page',
      tag: 'Client work',
      caption: 'Mind Is Medicine: programme page',
      alt: 'Programme page for Mind Is Medicine',
      thumb: ik('Website/screencapture-mindismedicineinstitute-mim-page-2026-08-27-08_26_29.png', 'w-640,q-75'),
      full: ik('Website/screencapture-mindismedicineinstitute-mim-page-2026-08-27-08_26_29.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'fun-course-enroll',
      category: 'funnels',
      categoryLabel: 'Funnel & landing page',
      tag: 'Client work',
      caption: 'Course enrolment page',
      alt: 'Course enrolment page',
      thumb: ik('Website/screencapture-mindismedicineinstitute-course-enroll-2026-08-27-08_30_42.png', 'w-640,q-75'),
      full: ik('Website/screencapture-mindismedicineinstitute-course-enroll-2026-08-27-08_30_42.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'fun-relief',
      category: 'funnels',
      categoryLabel: 'Funnel & landing page',
      tag: 'Client work',
      caption: 'Relief offer page',
      alt: 'Relief offer page',
      thumb: ik('Website/screencapture-mindismedicineinstitute-relief-2026-08-27-08_28_02.png', 'w-640,q-75'),
      full: ik('Website/screencapture-mindismedicineinstitute-relief-2026-08-27-08_28_02.png', 'w-1400,q-80'),
      tall: true
    },
    {
      id: 'auto-lead-nurture',
      category: 'automations',
      categoryLabel: 'Automation workflow',
      tag: 'Client work',
      caption: 'Automation workflows — Lead Nurture Email Sequence: shows multi-step email follow-up and conditional branching',
      alt: 'Screenshot of an automation workflow',
      thumb: ik('Workflow/Screenshot_11.png', 'w-640,q-75'),
      full: ik('Workflow/Screenshot_11.png', 'w-1600,q-85'),
      tall: false
    },
    {
      id: 'auto-schools',
      category: 'automations',
      categoryLabel: 'Automation workflow',
      tag: 'Client work',
      caption: 'Automation workflows — Schools Reengagement 6-Email: shows contact routing by booking or reply status and CRM pipeline updates',
      alt: 'Screenshot of an automation workflow',
      thumb: ik('Workflow/Screenshot_9.png', 'w-640,q-75'),
      full: ik('Workflow/Screenshot_9.png', 'w-1600,q-85'),
      tall: false
    }
  ];

  // DOM Elements
  const featuredContainer = document.getElementById('wkFeatured');
  const filterContainer = document.getElementById('wkFilters');
  const catLineEl = document.getElementById('wkCatLine');
  const gridEl = document.getElementById('wkGrid');
  const moreWrapEl = document.getElementById('wkMoreWrap');
  const moreBtnEl = document.getElementById('wkMoreBtn');

  const viewer = document.getElementById('wkViewer');
  const viewerCounter = document.getElementById('wkViewerCounter');
  const viewerFull = document.getElementById('wkViewerFull');
  const viewerClose = document.getElementById('wkViewerClose');
  const viewerPrev = document.getElementById('wkViewerPrev');
  const viewerNext = document.getElementById('wkViewerNext');
  const viewerScroll = document.getElementById('wkViewerScroll');
  const viewerImg = document.getElementById('wkViewerImg');
  const viewerTag = document.getElementById('wkViewerTag');
  const viewerCaption = document.getElementById('wkViewerCaption');
  const viewerStage = document.getElementById('wkViewerStage');

  if (!gridEl || !viewer) return;

  // State
  let activeFilter = 'all';
  let isExpanded = false;
  let currentSlides = [];
  let currentIndex = 0;
  let lastTriggerEl = null;

  // 1. Render Featured Case Studies (only filled-in entries; hide block if none)
  function renderFeatured() {
    if (!featuredContainer) return;
    const validFeatured = WORK_FEATURED.filter(
      (item) => item && item.title && item.noticed && item.did && item.changed
    );

    if (validFeatured.length === 0) {
      featuredContainer.hidden = true;
      featuredContainer.innerHTML = '';
      return;
    }

    featuredContainer.hidden = false;
    featuredContainer.innerHTML = validFeatured
      .map(
        (item, idx) => `
      <article class="wk-feat-card" aria-label="Featured project: ${item.title}">
        <div class="wk-feat-card__body">
          <div class="wk-feat-card__meta">
            <span class="wk-kicker">${item.tag}</span>
            ${item.scope ? `<span class="wk-feat-card__scope">${item.scope}</span>` : ''}
          </div>
          <h3 class="wk-feat-card__title">${item.title}</h3>
          <dl class="wk-feat-card__steps">
            <div class="wk-feat-card__step">
              <dt>What I noticed</dt>
              <dd>${item.noticed}</dd>
            </div>
            <div class="wk-feat-card__step">
              <dt>What I did</dt>
              <dd>${item.did}</dd>
            </div>
            <div class="wk-feat-card__step">
              <dt>What changed</dt>
              <dd>${item.changed}</dd>
            </div>
          </dl>
          ${
            item.quote
              ? `<blockquote class="wk-feat-card__quote">
                  <p>${item.quote}</p>
                  ${item.quoteAttribution ? `<footer>— ${item.quoteAttribution}</footer>` : ''}
                </blockquote>`
              : ''
          }
        </div>
        ${
          item.preview
            ? `<div class="wk-feat-card__media">
                <button class="wk-feat-card__preview" type="button" data-featured-idx="${idx}" aria-label="Open preview of ${item.preview.caption}">
                  <span class="wk-frame">
                    <span class="wk-bar" aria-hidden="true"><i></i><i></i><i></i></span>
                    <span class="wk-feat-card__screen">
                      <img src="${item.preview.thumb}" alt="${item.preview.alt}" loading="lazy" decoding="async">
                    </span>
                  </span>
                  <span class="wk-feat-card__preview-foot">
                    <span>${item.preview.caption}</span>
                    <span class="wk-feat-card__zoom">Inspect receipt →</span>
                  </span>
                </button>
              </div>`
            : ''
        }
      </article>
    `
      )
      .join('');

    featuredContainer.querySelectorAll('[data-featured-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-featured-idx'));
        const feat = validFeatured[idx];
        if (feat && feat.preview) {
          openLightbox([feat.preview], 0, btn);
        }
      });
    });
  }

  // 2. Filter & Render Gallery Grid
  function getFilteredItems() {
    if (activeFilter === 'all') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((item) => item.category === activeFilter);
  }

  function renderGallery() {
    const filtered = getFilteredItems();
    const total = filtered.length;
    const needsPagination = total > INITIAL_LIMIT;
    const visibleItems = needsPagination && !isExpanded ? filtered.slice(0, INITIAL_LIMIT) : filtered;

    // Category line
    const lineText = CATEGORY_LINES[activeFilter] || '';
    if (catLineEl) {
      if (lineText) {
        catLineEl.textContent = lineText;
        catLineEl.hidden = false;
      } else {
        catLineEl.textContent = '';
        catLineEl.hidden = true;
      }
    }

    // Render cards
    gridEl.innerHTML = visibleItems
      .map((item) => {
        const isGroup = Array.isArray(item.slides) && item.slides.length > 1;
        const countBadge = isGroup
          ? `<span class="wk-card__collection-count">${item.slides.length} images · Open gallery →</span>`
          : `<span class="wk-card__collection-count">Open receipt →</span>`;

        return `
        <li class="wk-card ${item.tall ? 'wk-card--tall' : ''} ${isGroup ? 'wk-card--group' : ''}">
          <button class="wk-card__btn" type="button" data-item-id="${item.id}" aria-label="${item.caption}${isGroup ? ` (${item.slides.length} images)` : ''}">
            <span class="wk-card__media">
              <img src="${item.thumb}" alt="${item.alt}" loading="lazy" decoding="async">
            </span>
            <span class="wk-card__body">
              <span class="wk-card__meta">
                <span class="wk-kicker ${item.tag === 'Concept' ? 'wk-kicker--concept' : ''}">${item.tag}</span>
                <span class="wk-card__cat">${item.categoryLabel}</span>
              </span>
              <span class="wk-card__caption">${item.caption}</span>
              ${countBadge}
            </span>
          </button>
        </li>
      `;
      })
      .join('');

    // Bind card clicks
    gridEl.querySelectorAll('.wk-card__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        const clickedItem = filtered.find((it) => it.id === itemId);
        if (!clickedItem) return;

        // If it's a collapsed bundle (Social 26 or Analytics 9), open that bundle's slides
        if (Array.isArray(clickedItem.slides) && clickedItem.slides.length > 0) {
          openLightbox(clickedItem.slides, 0, btn);
          return;
        }

        // Otherwise build a slide deck of all single-image items in the current filter view
        const singleItems = filtered.filter((it) => !Array.isArray(it.slides));
        const startIndex = Math.max(
          0,
          singleItems.findIndex((it) => it.id === itemId)
        );
        const slides = singleItems.map((it) => ({
          thumb: it.thumb,
          full: it.full,
          caption: it.caption,
          alt: it.alt,
          tag: it.tag,
          tall: it.tall
        }));
        openLightbox(slides, startIndex, btn);
      });
    });

    // Show more / Show fewer button
    if (moreWrapEl && moreBtnEl) {
      if (needsPagination) {
        moreWrapEl.hidden = false;
        moreBtnEl.textContent = isExpanded ? 'Show fewer' : 'Show more';
        moreBtnEl.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      } else {
        moreWrapEl.hidden = true;
      }
    }
  }

  // Filter chips interaction (click + keyboard roving/arrow support)
  if (filterContainer) {
    const chips = Array.from(filterContainer.querySelectorAll('.wk-chip'));

    function activateFilter(chip, focusChip = false) {
      const filter = chip.getAttribute('data-filter') || 'all';
      activeFilter = filter;
      isExpanded = false;

      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      if (focusChip) chip.focus();
      renderGallery();
    }

    chips.forEach((chip, idx) => {
      chip.addEventListener('click', () => activateFilter(chip, false));
      chip.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const nextIdx = (idx + dir + chips.length) % chips.length;
          activateFilter(chips[nextIdx], true);
        } else if (e.key === 'Home') {
          e.preventDefault();
          activateFilter(chips[0], true);
        } else if (e.key === 'End') {
          e.preventDefault();
          activateFilter(chips[chips.length - 1], true);
        }
      });
    });
  }

  // Show more / Show fewer button
  if (moreBtnEl) {
    moreBtnEl.addEventListener('click', () => {
      const wasExpanded = isExpanded;
      isExpanded = !isExpanded;
      renderGallery();

      if (!wasExpanded) {
        // Focus the first newly revealed item for keyboard users
        const buttons = gridEl.querySelectorAll('.wk-card__btn');
        if (buttons[INITIAL_LIMIT]) {
          buttons[INITIAL_LIMIT].focus({ preventScroll: true });
        }
      }
    });
  }

  // 3. Lightbox (Modal, Keyboard Navigation, Focus Trap, Touch Swipe, Focus Return)
  function updateLightboxSlide() {
    if (!currentSlides.length) return;
    const slide = currentSlides[currentIndex];
    const total = currentSlides.length;

    viewerCounter.textContent = `Image ${currentIndex + 1} of ${total}`;
    viewerFull.href = slide.full;
    viewerTag.textContent = slide.tag || 'Client work';
    viewerTag.className = `wk-viewer__tag ${slide.tag === 'Concept' ? 'wk-viewer__tag--concept' : ''}`;
    viewerCaption.textContent = slide.caption || '';

    viewer.classList.toggle('is-tall', Boolean(slide.tall));
    viewer.classList.add('is-loading');

    viewerPrev.hidden = total <= 1;
    viewerNext.hidden = total <= 1;

    viewerImg.alt = slide.alt || slide.caption || '';
    viewerImg.src = slide.thumb;
    viewerScroll.scrollTop = 0;

    const fullLoader = new Image();
    const expectedFull = slide.full;
    fullLoader.onload = () => {
      if (currentSlides[currentIndex] && currentSlides[currentIndex].full === expectedFull) {
        viewerImg.src = expectedFull;
        viewer.classList.remove('is-loading');
      }
    };
    fullLoader.onerror = () => {
      viewer.classList.remove('is-loading');
    };
    fullLoader.src = expectedFull;
  }

  function stepSlide(delta) {
    if (currentSlides.length <= 1) return;
    currentIndex = (currentIndex + delta + currentSlides.length) % currentSlides.length;
    updateLightboxSlide();
  }

  function openLightbox(slides, startIndex, triggerEl) {
    if (!slides || !slides.length) return;
    currentSlides = slides;
    currentIndex = Math.max(0, Math.min(startIndex || 0, slides.length - 1));
    lastTriggerEl = triggerEl || document.activeElement;

    updateLightboxSlide();

    if (typeof viewer.showModal === 'function') {
      if (!viewer.open) viewer.showModal();
    } else {
      viewer.setAttribute('open', '');
    }
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      viewerClose.focus();
    });
  }

  function closeLightbox() {
    if (!viewer.open && !viewer.hasAttribute('open')) return;
    if (typeof viewer.close === 'function') {
      viewer.close();
    } else {
      viewer.removeAttribute('open');
    }
    document.body.style.overflow = '';
    viewerImg.removeAttribute('src');

    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
    }
  }

  viewerClose.addEventListener('click', closeLightbox);
  viewerPrev.addEventListener('click', () => stepSlide(-1));
  viewerNext.addEventListener('click', () => stepSlide(1));

  // Backdrop click closes lightbox
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer || e.target === viewerStage) {
      closeLightbox();
    }
  });

  // Restore scroll and focus if closed via native Escape
  viewer.addEventListener('close', () => {
    document.body.style.overflow = '';
    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
    }
  });

  // Keyboard navigation & focus trap inside lightbox
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepSlide(-1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepSlide(1);
      return;
    }
    if (e.key === 'Tab') {
      const focusables = Array.from(
        viewer.querySelectorAll('a[href], button:not([hidden]):not([disabled]), [tabindex="0"]')
      ).filter((el) => !el.hidden && el.offsetParent !== null);

      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Touch swipe support on lightbox stage
  let touchStartX = 0;
  let touchStartY = 0;
  viewerStage.addEventListener(
    'touchstart',
    (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  viewerStage.addEventListener(
    'touchend',
    (e) => {
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        stepSlide(dx < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  // Initialize
  renderFeatured();
  renderGallery();
})();
