/**
 * viridis — scroll animation + slide transitions
 *
 * DATA FILES (edit these to update content — no JS changes needed):
 *   data/articles.json  — journal articles
 *   data/album.json     — photo album slides
 *   data/founders.json  — co-founders info
 *   data/network.json   — network map countries
 */

window.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollToPlugin);

  // ─── elements ───

  const bg             = document.getElementById('bg');
  const mainStage      = document.getElementById('mainStage');
  const slide2El       = document.getElementById('slide2');
  const slide3El       = document.getElementById('slide3');
  const slide4El       = document.getElementById('slide4');
  const slide5El       = document.getElementById('slide5');
  const contentRow     = document.getElementById('contentRow');
  const heroPara       = document.getElementById('heroPara');
  const logoReveal     = document.getElementById('logoReveal');
  const viridisTitle   = document.getElementById('viridisTitle');
  const lineLongLeft   = document.getElementById('lineLongLeft');
  const lineLongRight  = document.getElementById('lineLongRight');
  const lineEdgeLeft   = document.getElementById('lineEdgeLeft');
  const lineEdgeRight  = document.getElementById('lineEdgeRight');
  const navItems       = document.querySelectorAll('.nav-text');
  const navJournal     = document.getElementById('navJournal');
  const navCommunity   = document.getElementById('navCommunity');
  const slide2Para     = document.getElementById('slide2Para');
  const networkContent = document.getElementById('networkContent');
  const s3Hero         = document.getElementById('s3Hero');
  const cornerBtnLeft  = document.getElementById('cornerBtnLeft');

  let journalMode   = false;
  let communityMode = false;

  const isMobile = () => window.innerWidth <= 768;

  // ─── data containers (loaded from JSON) ───

  let journalIssue = { label: '', articles: [] };
  let albumSlides  = [];
  let founders     = [];
  let countryData  = {};

  // ─── load all external data ───

  async function loadData() {
    try {
      const [articlesRes, albumRes, foundersRes, networkRes] = await Promise.all([
        fetch('data/articles.json'),
        fetch('data/album.json'),
        fetch('data/founders.json'),
        fetch('data/network.json')
      ]);
      journalIssue = await articlesRes.json();
      albumSlides  = await albumRes.json();
      founders     = await foundersRes.json();
      countryData  = await networkRes.json();
    } catch (err) {
      console.warn('Data load error:', err);
    }
    buildArticleList();
    buildAlbum();
    buildFounders();
  }

  loadData();


  // ─── mobile burger menu ───

  const burgerBtn          = document.getElementById('burgerBtn');
  const mobileMenu         = document.getElementById('mobileMenu');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  const mobileMenuClose    = document.getElementById('mobileMenuClose');
  const mobileMenuItems    = document.querySelectorAll('.mobile-menu-item');

  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }

  burgerBtn.addEventListener('click', () => {
    if (mobileMenu.classList.contains('is-open')) closeMobileMenu();
    else openMobileMenu();
  });

  mobileMenuClose.addEventListener('click', closeMobileMenu);
  mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

  mobileMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      closeMobileMenu();
      setTimeout(() => {
        if (action === 'faq') {
          if (faqOpen) closeFAQ(); else openFAQ();
          return;
        }
        if (action === 'home') {
          if (journalMode) startReturnTransition();
          else if (communityMode) startReturnFromCommunity();
          else snapTo(0);
          return;
        }
        if (action === 'journal') {
          if (journalMode) return;
          if (communityMode) startDirectTransition('journal');
          else navJournal.click();
          return;
        }
        if (action === 'community') {
          if (communityMode) return;
          if (journalMode) startDirectTransition('community');
          else navCommunity.click();
          return;
        }
      }, 150);
    });
  });


  // ─── faq overlay ───

  const faqOverlay  = document.getElementById('faqOverlay');
  const faqBackdrop = document.getElementById('faqBackdrop');
  const faqClose    = document.getElementById('faqClose');
  const faqPanel    = faqOverlay.querySelector('.faq-panel');
  let faqOpen = false;

  function openFAQ() {
    if (faqOpen) return;
    faqOpen = true;
    faqOverlay.classList.add('is-open');
    faqOverlay.setAttribute('aria-hidden', 'false');
    gsap.fromTo(faqBackdrop, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(faqPanel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.08 });
  }

  function closeFAQ() {
    if (!faqOpen) return;
    const tl = gsap.timeline({
      onComplete: () => {
        faqOpen = false;
        faqOverlay.classList.remove('is-open');
        faqOverlay.setAttribute('aria-hidden', 'true');
      }
    });
    tl.to(faqPanel,    { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' });
    tl.to(faqBackdrop, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.15');
  }

  cornerBtnLeft.addEventListener('click', (e) => {
    e.preventDefault();
    if (faqOpen) closeFAQ(); else openFAQ();
  });

  faqClose.addEventListener('click', closeFAQ);
  faqBackdrop.addEventListener('click', closeFAQ);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && faqOpen) closeFAQ(); });

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(el => {
        el.classList.remove('is-open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // ─── build article list ───

  const jArticlesEl     = document.getElementById('jArticles');
  const jArticleOverlay = document.getElementById('jArticleOverlay');
  const jOverlayContent = document.getElementById('jOverlayContent');
  const jOverlayClose   = document.getElementById('jOverlayClose');

  const pad = n => String(n).padStart(2, '0');

  function buildArticleList() {
    const metaEl = document.getElementById('jArticlesMeta');
    if (metaEl) {
      const n = journalIssue.articles.length;
      const countText = n === 1 ? '1 article published' : `${n} articles published`;
      metaEl.innerHTML = `<span class="j-meta-count">${countText}</span>`;
    }
    jArticlesEl.innerHTML = journalIssue.articles.map((a, i) => `
      <div class="j-article-row" data-index="${i}" tabindex="0" role="button" aria-label="Read: ${a.title}">
        <span class="j-article-index">${pad(i + 1)}</span>
        <div class="j-article-info">
          <div class="j-article-title">${a.title}</div>
          <div class="j-article-byline">${a.author}${a.date ? ' · ' + a.date : ''}</div>
          <div class="j-article-preview-text">${a.preview}</div>
        </div>
        <span class="j-article-arrow">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M10 1L15 6L10 11M15 6H1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
    `).join('');
    jArticlesEl.querySelectorAll('.j-article-row').forEach(row => {
      row.addEventListener('click', () => openArticle(Number(row.dataset.index)));
      row.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openArticle(Number(row.dataset.index)); }
      });
    });
  }

  function buildImageBlock(article) {
    if (article.image) return `<div class="j-ov-image"><img src="${article.image}" alt="${article.title}"></div>`;
    return `<div class="j-ov-img-placeholder"><span>Article Image</span></div>`;
  }

  function openArticle(index) {
    const article = journalIssue.articles[index];
    if (!article) return;
    jOverlayContent.innerHTML = `
      <span class="j-ov-issue-tag">${journalIssue.label}</span>
      <h2 class="j-ov-title">${article.title}</h2>
      <p class="j-ov-byline">${article.author}</p>
      <div class="j-ov-rule"></div>
      ${buildImageBlock(article)}
      <div class="j-ov-body">${article.content}</div>
    `;
    const scrollEl = jArticleOverlay.querySelector('.j-overlay-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;
    jArticleOverlay.setAttribute('aria-hidden', 'false');
    jArticleOverlay.classList.add('is-open');
    const els = jOverlayContent.querySelectorAll(
      '.j-ov-issue-tag, .j-ov-title, .j-ov-byline, .j-ov-rule, .j-ov-img-placeholder, .j-ov-image, .j-ov-body p, .j-ov-body h3, .j-ov-body blockquote'
    );
    gsap.set(els, { opacity: 0, y: 18 });
    gsap.to(els, { opacity: 1, y: 0, duration: 0.55, stagger: 0.04, ease: 'power3.out', delay: 0.22 });
  }

  function closeArticle() {
    jArticleOverlay.classList.remove('is-open');
    jArticleOverlay.setAttribute('aria-hidden', 'true');
  }

  jOverlayClose.addEventListener('click', closeArticle);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && jArticleOverlay.classList.contains('is-open')) closeArticle();
  });


  // ─── community album ───

  const albumTrack   = document.getElementById('albumTrack');
  const albumPrev    = document.getElementById('albumPrev');
  const albumNext    = document.getElementById('albumNext');
  const albumCounter = document.getElementById('albumCounter');
  const albumCaption = document.getElementById('albumCaption');
  let albumIndex = 0;

  function buildAlbum() {
    if (!albumTrack || albumSlides.length === 0) return;
    albumTrack.innerHTML = albumSlides.map((slide, i) => {
      if (slide.image) return `<div class="album-slide" data-index="${i}"><img src="${slide.image}" alt="Photo ${i + 1}"></div>`;
      return `<div class="album-slide" data-index="${i}"><div class="album-slide-placeholder"><span>${i + 1}</span></div></div>`;
    }).join('');
    updateAlbum();
  }

  function updateAlbum() {
    const total = albumSlides.length;
    if (total === 0) return;
    albumTrack.style.transform = `translateX(-${albumIndex * 100}%)`;
    albumCounter.textContent = `${pad(albumIndex + 1)} / ${pad(total)}`;
    albumPrev.classList.toggle('is-disabled', albumIndex === 0);
    albumNext.classList.toggle('is-disabled', albumIndex === total - 1);
    const slide = albumSlides[albumIndex];
    const titleHTML = slide.title ? `<div class="album-caption-title">${slide.title}</div>` : '';
    const captionHTML = `${titleHTML}<div class="album-caption-text">${slide.caption}</div>`;
    gsap.to(albumCaption, {
      opacity: 0, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        albumCaption.innerHTML = captionHTML;
        gsap.to(albumCaption, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
    });
  }

  albumPrev.addEventListener('click', () => { if (albumIndex > 0) { albumIndex--; updateAlbum(); } });
  albumNext.addEventListener('click', () => { if (albumIndex < albumSlides.length - 1) { albumIndex++; updateAlbum(); } });
  document.addEventListener('keydown', e => {
    if (!communityMode) return;
    if (e.key === 'ArrowLeft'  && albumIndex > 0)                      { albumIndex--; updateAlbum(); }
    if (e.key === 'ArrowRight' && albumIndex < albumSlides.length - 1) { albumIndex++; updateAlbum(); }
  });


  // ─── co-founders list ───

  const foundersList = document.getElementById('foundersList');

  function buildFounders() {
    if (!foundersList || founders.length === 0) return;
    foundersList.innerHTML = founders.map(f => `
      <div class="founder-entry">
        <div class="founder-name">${f.name}</div>
        <div class="founder-school">${f.school}</div>
        <div class="founder-bio">${f.bio}</div>
      </div>
    `).join('');
  }


  // ─── slide 3 dropdown ───

  const s3Dropdown    = document.getElementById('s3Dropdown');
  const s3Trigger     = document.getElementById('s3Trigger');
  const s3TriggerText = document.getElementById('s3TriggerText');
  const s3OptionList  = document.getElementById('s3OptionList');
  const s3Options     = document.querySelectorAll('.s3-option');

  let selectedCountry = null;
  let networkRevealed = false;
  let activeTL        = null;

  s3Trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = s3Dropdown.classList.toggle('is-open');
    s3Trigger.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', () => {
    s3Dropdown.classList.remove('is-open');
    s3Trigger.setAttribute('aria-expanded', 'false');
  });

  s3OptionList.addEventListener('click', (e) => e.stopPropagation());

  s3Options.forEach(opt => {
    opt.addEventListener('click', () => {
      const val = opt.dataset.value;
      if (val === selectedCountry) return;
      s3TriggerText.textContent = opt.textContent;
      s3TriggerText.classList.add('is-selected');
      s3Options.forEach(o => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      s3Dropdown.classList.remove('is-open');
      s3Trigger.setAttribute('aria-expanded', 'false');
      selectedCountry = val;
      renderNetwork(val);
    });
  });

  function buildNetworkHTML(data) {
    const colsHTML = data.columns.map(col => `
      <div class="network-col">
        <div class="network-city">${col.city}</div>
        <ul class="network-schools">${col.schools.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>
    `).join('');
    return `<div class="network-row"><div class="network-map-side"><img src="${data.map}" alt="${data.mapAlt}"></div><div class="network-cols-side">${colsHTML}</div></div>`;
  }

  function injectAndReveal(data, tl) {
    networkContent.innerHTML = buildNetworkHTML(data);
    networkContent.classList.add('is-visible');
    const mapImg = networkContent.querySelector('.network-map-side img');
    const cols   = networkContent.querySelectorAll('.network-col');
    gsap.set(mapImg, { opacity: 0, y: 22 });
    gsap.set(cols,   { opacity: 0, y: 18 });
    tl.to(networkContent, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    tl.to(mapImg, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '<');
    tl.to(cols,   { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out', stagger: 0.1 }, '-=0.3');
  }

  function renderNetwork(countryKey) {
    const data = countryData[countryKey];
    if (!data) return;
    if (activeTL) { activeTL.kill(); activeTL = null; }
    if (!networkRevealed) {
      networkRevealed = true;
      gsap.set(networkContent, { opacity: 0 });
      activeTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
      activeTL.to(s3Hero, { top: '14%', yPercent: 0, duration: 0.7, ease: 'power2.inOut' });
      injectAndReveal(data, activeTL);
    } else {
      gsap.set(networkContent, { opacity: 0 });
      activeTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
      injectAndReveal(data, activeTL);
    }
  }


  // ─── split paragraphs into words for animation ───

  const rawWords = slide2Para.textContent.trim().split(/\s+/);
  slide2Para.innerHTML = rawWords.map(w => `<span class="s2word">${w}</span>`).join(' ');
  const wordEls = slide2Para.querySelectorAll('.s2word');
  gsap.set(wordEls, { opacity: 0, y: 14, filter: 'blur(8px)' });

  const heroRawWords = heroPara.textContent.trim().split(/\s+/);
  heroPara.innerHTML = heroRawWords.map(w => `<span class="h1word">${w}</span>`).join(' ');
  const heroWordEls = heroPara.querySelectorAll('.h1word');
  gsap.set(heroWordEls, { opacity: 0, y: 22, filter: 'blur(6px)', rotateX: 14 });


  // ─── gsap initial states ───

  gsap.set(logoReveal,    { opacity: 0, scale: 0.88, filter: 'blur(10px)', transformOrigin: 'center center' });
  gsap.set(viridisTitle,  { y: '115%' });
  gsap.set(lineLongLeft,  { scaleX: 0, transformOrigin: 'right center' });
  gsap.set(lineLongRight, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(lineEdgeLeft,  { scaleX: 0, transformOrigin: 'right center' });
  gsap.set(lineEdgeRight, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(navItems,      { y: '130%', opacity: 0 });
  gsap.set(slide4El,      { opacity: 0, pointerEvents: 'none' });
  gsap.set(slide5El,      { opacity: 0, pointerEvents: 'none' });
  gsap.set(s3Hero,        { xPercent: -50, yPercent: -50 });

  const computeOffset = () => {
    const logo   = document.getElementById('logoSide');
    const logoW  = logo.offsetWidth;
    const gapStr = getComputedStyle(contentRow).gap || getComputedStyle(contentRow).columnGap;
    const gap    = parseFloat(gapStr) || window.innerWidth * 0.07;
    return (logoW + gap) / 2;
  };
  gsap.set(contentRow, { x: computeOffset() });


  // ─── intro timeline ───

  const introTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
  introTL
    .to(heroWordEls, { opacity: 1, y: 0, filter: 'blur(0px)', rotateX: 0, duration: 0.48, stagger: 0.028, ease: 'power2.out' })
    .to(contentRow,   { x: 0, duration: 1.05, ease: 'power2.inOut' }, '+=0.3')
    .to(logoReveal,   { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, '-=0.08')
    .to(viridisTitle, { y: '0%', duration: 0.55 }, '-=0.15')
    .to([lineLongLeft, lineLongRight], { scaleX: 1, duration: 0.78, ease: 'power2.inOut' }, '<')
    .to([lineEdgeLeft, lineEdgeRight], { scaleX: 1, duration: 0.5,  ease: 'power2.out' }, '+=0.05')
    .to(navItems, { y: '0%', opacity: 1, duration: 0.38, stagger: 0.1 }, '+=0.08');


  // ─── colour interpolation ───

  const lerp    = (a, b, t) => a + (b - a) * t;
  const clamp   = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerpRGB = (c1, c2, t) => c1.map((ch, i) => Math.round(lerp(ch, c2[i], t)));
  const rgbStr  = c => `rgb(${c[0]},${c[1]},${c[2]})`;

  const getBigSize   = () => Math.min(Math.max(window.innerWidth * 0.055, 44.8), 88);
  const getSmallSize = () => Math.min(Math.max(window.innerWidth * 0.0135, 15.2), 21.6);

  const C1 = [232, 239, 245];
  const C2 = [218, 192, 155];
  const C3 = [ 19,  30,  25];
  const H_DARK  = [ 26,  26,  26];
  const H_WHITE = [255, 255, 255];

  let slide2Animated = false;


  // ─── visual update ───

  function updateVisuals(scrollY) {
    const vh = window.innerHeight;
    const p1 = clamp(scrollY / vh, 0, 1);
    const p2 = clamp((scrollY - vh) / vh, 0, 1);

    mainStage.style.transform = `translateY(${-p1 * 100}vh)`;
    slide2El.style.transform  = `translateX(${-p2 * 100}vw) translateY(${(1 - p1) * 100}vh)`;
    slide3El.style.transform  = `translateX(${(1 - p2) * 100}vw)`;
    slide3El.style.pointerEvents = p2 > 0.97 ? 'auto' : 'none';

    const bgColor = p1 < 1 ? lerpRGB(C1, C2, p1) : lerpRGB(C2, C3, p2);
    bg.style.backgroundColor = rgbStr(bgColor);

    if (!isMobile()) {
      viridisTitle.style.fontSize = lerp(getBigSize(), getSmallSize(), p1) + 'px';
    }

    const hc = rgbStr(lerpRGB(H_DARK, H_WHITE, p2));
    viridisTitle.style.color = hc;
    navItems.forEach(n => n.style.color = hc);
    [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = hc);
    cornerBtnLeft.style.color = hc;
    burgerBtn.style.color = hc;

    if (p1 > 0.08 && p2 < 0.5 && !slide2Animated) {
      slide2Animated = true;
      gsap.to(wordEls, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, stagger: 0.048, ease: 'power3.out' });
    }
    if (p1 < 0.02 && slide2Animated) {
      slide2Animated = false;
      gsap.set(wordEls, { opacity: 0, y: 14, filter: 'blur(8px)' });
    }
  }


  // ─────────────────────────────────────────────────────
  // snap system
  //
  // the old approach used the scroll event both to update
  // visuals and to detect idle / cancel snaps. problem is
  // gsap scrollTo fires scroll events too, so the handler
  // fought the animation causing jitter.
  //
  // new design:
  //   - a rAF loop continuously syncs visuals with scrollY
  //   - real user input (wheel, touch, keys) is tracked
  //     separately to reset an idle timer
  //   - after 500ms of no real input we snap to nearest
  //   - the snap tween uses autoKill:false so it ignores
  //     scroll events entirely
  //   - new real input during a snap kills it immediately
  // ─────────────────────────────────────────────────────

  let snapTween   = null;
  let idleTimer   = null;
  let lastFrameY  = -1;

  function cancelSnap() {
    if (snapTween) { snapTween.kill(); snapTween = null; }
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (journalMode || communityMode) return;
    idleTimer = setTimeout(performSnap, 500);
  }

  function performSnap() {
    if (journalMode || communityMode) return;
    const sy = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;
    const targets = [0, vh, 2 * vh];
    const dists   = targets.map(t => Math.abs(sy - t));
    const nearest = targets[dists.indexOf(Math.min(...dists))];
    if (Math.abs(sy - nearest) < 2) return;
    cancelSnap();
    snapTween = gsap.to(window, {
      scrollTo: { y: nearest, autoKill: false },
      duration: 0.75, ease: 'power3.inOut',
      onComplete() { snapTween = null; }
    });
  }

  // helper used by nav handlers to scroll to a target then fire a callback
  function snapTo(target, onDone) {
    cancelSnap(); clearTimeout(idleTimer);
    const sy = window.scrollY || window.pageYOffset;
    if (Math.abs(sy - target) < 2) {
      updateVisuals(target);
      if (onDone) onDone();
      return;
    }
    snapTween = gsap.to(window, {
      scrollTo: { y: target, autoKill: false },
      duration: 0.75, ease: 'power2.inOut',
      onComplete() { snapTween = null; updateVisuals(target); if (onDone) onDone(); }
    });
  }

  // rAF loop — the only thing that reads scrollY and calls updateVisuals
  function tick() {
    const sy = window.scrollY || window.pageYOffset;
    if (sy !== lastFrameY) {
      lastFrameY = sy;
      if (!journalMode && !communityMode) updateVisuals(sy);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // real user input listeners
  function onUserInput() {
    if (journalMode || communityMode) return;
    cancelSnap();
    resetIdleTimer();
  }

  window.addEventListener('wheel', onUserInput, { passive: true });
  window.addEventListener('touchmove', onUserInput, { passive: true });

  window.addEventListener('touchstart', () => {
    if (journalMode || communityMode) return;
    cancelSnap();
    clearTimeout(idleTimer);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (journalMode || communityMode) return;
    resetIdleTimer();
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)) onUserInput();
  }, { passive: true });


  // ─── header sync on resize ───

  let lastWasMobile = isMobile();

  function syncHeaderState() {
    const mobile = isMobile();
    if (mobile) viridisTitle.style.fontSize = '';

    if (introTL.isActive()) { lastWasMobile = mobile; return; }

    if (journalMode) {
      viridisTitle.textContent = 'JOURNAL';
      navCommunity.textContent = 'VIRIDIS';
      navJournal.textContent   = 'JOURNAL';
      if (!mobile) {
        viridisTitle.style.fontSize = getBigSize() + 'px';
        gsap.set(viridisTitle, { y: '0%' });
        gsap.set(navCommunity, { y: '0%', opacity: 1 });
        gsap.set(navJournal,   { y: '130%', opacity: 0 });
        gsap.set([lineEdgeLeft, lineLongLeft],   { scaleX: 0 });
        gsap.set([lineLongRight, lineEdgeRight], { scaleX: 1 });
      }
      const dc = rgbStr(H_DARK);
      viridisTitle.style.color = dc; navItems.forEach(n => n.style.color = dc);
      [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = dc);
      cornerBtnLeft.style.color = dc; burgerBtn.style.color = dc;
      bg.style.backgroundColor = rgbStr(C1);

    } else if (communityMode) {
      viridisTitle.textContent = 'COMMUNITY';
      navJournal.textContent   = 'VIRIDIS';
      navCommunity.textContent = 'COMMUNITY';
      if (!mobile) {
        viridisTitle.style.fontSize = getBigSize() + 'px';
        gsap.set(viridisTitle, { y: '0%' });
        gsap.set(navJournal,   { y: '0%', opacity: 1 });
        gsap.set(navCommunity, { y: '130%', opacity: 0 });
        gsap.set([lineEdgeLeft, lineLongLeft],   { scaleX: 1 });
        gsap.set([lineLongRight, lineEdgeRight], { scaleX: 0 });
      }
      const dc = rgbStr(H_DARK);
      viridisTitle.style.color = dc; navItems.forEach(n => n.style.color = dc);
      [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = dc);
      cornerBtnLeft.style.color = dc; burgerBtn.style.color = dc;
      bg.style.backgroundColor = rgbStr(C1);

    } else {
      viridisTitle.textContent = 'VIRIDIS';
      navJournal.textContent   = 'JOURNAL';
      navCommunity.textContent = 'COMMUNITY';
      gsap.set(viridisTitle, { y: '0%' });
      gsap.set(navJournal,   { y: '0%', opacity: 1 });
      gsap.set(navCommunity, { y: '0%', opacity: 1 });
      gsap.set([lineLongLeft, lineLongRight],   { scaleX: 1 });
      gsap.set([lineEdgeLeft, lineEdgeRight],   { scaleX: 1 });
      updateVisuals(window.scrollY || window.pageYOffset);
    }

    lastWasMobile = mobile;
  }

  window.addEventListener('resize', syncHeaderState);
  updateVisuals(window.scrollY || window.pageYOffset);


  // ─── scroll lock ───

  let savedScrollY = 0;

  function lockScroll() {
    savedScrollY = window.scrollY || window.pageYOffset;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add('scroll-locked');
  }

  function unlockScroll() {
    document.body.classList.remove('scroll-locked');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
  }


  // ─── transition helpers ───

  function fadeInSlide1Content(tl) {
    gsap.set(heroWordEls, { opacity: 0, y: 18, filter: 'blur(4px)' });
    gsap.set(logoReveal,  { opacity: 0, scale: 0.94, filter: 'blur(6px)' });
    gsap.set(contentRow,  { opacity: 1, x: 0 });
    tl.to(heroWordEls, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.022, ease: 'power2.out' }, '+=0.08');
    tl.to(logoReveal,  { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, '-=0.25');
  }

  function fadeInJournalContent(tl) {
    const jLeft = slide4El.querySelector('.journal-left'), jDivider = slide4El.querySelector('.journal-divider'), jRight = slide4El.querySelector('.journal-right');
    gsap.set(jLeft, { opacity: 0, y: 22 }); gsap.set(jDivider, { opacity: 0, scaleY: 0 }); gsap.set(jRight, { opacity: 0, y: 22 });
    tl.to(jLeft, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '+=0.06');
    tl.to(jDivider, { opacity: 1, scaleY: 1, duration: 0.45, ease: 'power2.out' }, '-=0.35');
    tl.to(jRight, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.3');
  }

  function fadeOutJournalContent(tl) {
    const jLeft = slide4El.querySelector('.journal-left'), jDivider = slide4El.querySelector('.journal-divider'), jRight = slide4El.querySelector('.journal-right');
    tl.to([jLeft, jDivider, jRight], { opacity: 0, y: -14, duration: 0.4, ease: 'power2.in', stagger: 0.04 });
  }

  function fadeInCommunityContent(tl) {
    const cTop = slide5El.querySelector('.community-top'), cBottom = slide5El.querySelector('.community-bottom');
    gsap.set(cTop, { opacity: 0, y: 22 }); gsap.set(cBottom, { opacity: 0, y: 22 });
    tl.to(cTop, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '+=0.06');
    tl.to(cBottom, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.3');
  }

  function fadeOutCommunityContent(tl) {
    const cTop = slide5El.querySelector('.community-top'), cBottom = slide5El.querySelector('.community-bottom');
    tl.to([cTop, cBottom], { opacity: 0, y: -14, duration: 0.4, ease: 'power2.in', stagger: 0.04 });
  }


  // ─── journal transition ───

  function startJournalTransition() {
    journalMode = true; lockScroll(); closeArticle();
    cancelSnap(); clearTimeout(idleTimer);
    const darkColor = rgbStr(H_DARK);
    viridisTitle.style.color = darkColor; navItems.forEach(n => n.style.color = darkColor);
    [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = darkColor);
    cornerBtnLeft.style.color = darkColor; burgerBtn.style.color = darkColor;
    if (!isMobile()) viridisTitle.style.fontSize = getBigSize() + 'px';

    const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
    tl.to(lineEdgeLeft,  { scaleX: 0, transformOrigin: 'right center', duration: 0.45 });
    tl.to(lineLongLeft,  { scaleX: 0, transformOrigin: 'right center', duration: 0.45 }, '<');
    tl.to(navJournal,    { y: '130%', opacity: 0, duration: 0.45 }, '<');
    tl.to(viridisTitle,  { y: '115%', duration: 0.45 }, '<');
    tl.to(navCommunity,  { y: '130%', opacity: 0, duration: 0.45 }, '<');
    tl.to(contentRow,    { opacity: 0, y: -20, duration: 0.45 }, '<');
    tl.call(() => {
      viridisTitle.textContent = 'JOURNAL'; navCommunity.textContent = 'VIRIDIS'; navCommunity.classList.add('nav-clickable');
      gsap.set([mainStage, slide2El, slide3El], { opacity: 0 });
      gsap.set(slide4El, { opacity: 1, pointerEvents: 'auto' }); gsap.set(contentRow, { y: 0 });
      bg.style.backgroundColor = rgbStr(C1);
    });
    tl.to(viridisTitle, { y: '0%', duration: 0.55, ease: 'power3.out' }, '+=0.12');
    tl.to(navCommunity, { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.22');
    fadeInJournalContent(tl);
  }

  function startReturnTransition() {
    closeArticle();
    const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
    fadeOutJournalContent(tl);
    tl.to(viridisTitle, { y: '115%', duration: 0.45 }, '-=0.15');
    tl.to(navCommunity, { y: '130%', opacity: 0, duration: 0.45 }, '<');
    tl.call(() => {
      viridisTitle.textContent = 'VIRIDIS'; navJournal.textContent = 'JOURNAL'; navCommunity.textContent = 'COMMUNITY'; navCommunity.classList.remove('nav-clickable');
      if (!isMobile()) viridisTitle.style.fontSize = getBigSize() + 'px';
      gsap.set(mainStage, { opacity: 1, clearProps: 'transform' });
      gsap.set(slide2El, { opacity: 1, transform: 'translateX(0vw) translateY(100vh)' });
      gsap.set(slide3El, { opacity: 1, transform: 'translateX(100vw)' });
      gsap.set(slide4El, { opacity: 0, pointerEvents: 'none' });
      bg.style.backgroundColor = rgbStr(C1);
      const dc = rgbStr(H_DARK); viridisTitle.style.color = dc; navItems.forEach(n => n.style.color = dc);
      [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = dc);
      cornerBtnLeft.style.color = dc; burgerBtn.style.color = dc;
      gsap.set([slide4El.querySelector('.journal-left'), slide4El.querySelector('.journal-divider'), slide4El.querySelector('.journal-right')], { clearProps: 'opacity,y,scaleY' });
    });
    tl.call(() => { journalMode = false; unlockScroll(); window.scrollTo(0, 0); updateVisuals(0); });
    tl.to([lineEdgeLeft, lineLongLeft],   { scaleX: 1, duration: 0.62, ease: 'power2.inOut' }, '+=0.1');
    tl.to([lineLongRight, lineEdgeRight], { scaleX: 1, duration: 0.62, ease: 'power2.inOut' }, '<');
    tl.to(viridisTitle, { y: '0%', duration: 0.55, ease: 'power3.out' }, '-=0.18');
    tl.to(navJournal,   { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.2');
    tl.to(navCommunity, { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.28');
    fadeInSlide1Content(tl);
  }


  // ─── community transition ───

  function startCommunityTransition() {
    communityMode = true; lockScroll();
    cancelSnap(); clearTimeout(idleTimer);
    const darkColor = rgbStr(H_DARK);
    viridisTitle.style.color = darkColor; navItems.forEach(n => n.style.color = darkColor);
    [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = darkColor);
    cornerBtnLeft.style.color = darkColor; burgerBtn.style.color = darkColor;
    if (!isMobile()) viridisTitle.style.fontSize = getBigSize() + 'px';

    const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
    tl.to(lineLongRight, { scaleX: 0, transformOrigin: 'left center', duration: 0.45 });
    tl.to(lineEdgeRight, { scaleX: 0, transformOrigin: 'left center', duration: 0.45 }, '<');
    tl.to(navJournal,    { y: '130%', opacity: 0, duration: 0.45 }, '<');
    tl.to(viridisTitle,  { y: '115%', duration: 0.45 }, '<');
    tl.to(navCommunity,  { y: '130%', opacity: 0, duration: 0.45 }, '<');
    tl.to(contentRow,    { opacity: 0, y: -20, duration: 0.45 }, '<');
    tl.call(() => {
      viridisTitle.textContent = 'COMMUNITY'; navJournal.textContent = 'VIRIDIS';
      gsap.set([mainStage, slide2El, slide3El], { opacity: 0 });
      gsap.set(slide5El, { opacity: 1, pointerEvents: 'auto' }); gsap.set(contentRow, { y: 0 });
      bg.style.backgroundColor = rgbStr(C1);
    });
    tl.to(viridisTitle, { y: '0%', duration: 0.55, ease: 'power3.out' }, '+=0.12');
    tl.to(navJournal,   { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.22');
    fadeInCommunityContent(tl);
  }

  function startReturnFromCommunity() {
    const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
    fadeOutCommunityContent(tl);
    tl.to(viridisTitle, { y: '115%', duration: 0.45 }, '-=0.15');
    tl.to(navJournal,   { y: '130%', opacity: 0, duration: 0.45 }, '<');
    tl.call(() => {
      viridisTitle.textContent = 'VIRIDIS'; navJournal.textContent = 'JOURNAL'; navCommunity.textContent = 'COMMUNITY';
      if (!isMobile()) viridisTitle.style.fontSize = getBigSize() + 'px';
      gsap.set(mainStage, { opacity: 1, clearProps: 'transform' });
      gsap.set(slide2El, { opacity: 1, transform: 'translateX(0vw) translateY(100vh)' });
      gsap.set(slide3El, { opacity: 1, transform: 'translateX(100vw)' });
      gsap.set(slide5El, { opacity: 0, pointerEvents: 'none' });
      bg.style.backgroundColor = rgbStr(C1);
      const dc = rgbStr(H_DARK); viridisTitle.style.color = dc; navItems.forEach(n => n.style.color = dc);
      [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = dc);
      cornerBtnLeft.style.color = dc; burgerBtn.style.color = dc;
      gsap.set([slide5El.querySelector('.community-top'), slide5El.querySelector('.community-bottom')], { clearProps: 'opacity,y' });
    });
    tl.call(() => { communityMode = false; unlockScroll(); window.scrollTo(0, 0); updateVisuals(0); });
    tl.to([lineEdgeLeft, lineLongLeft],   { scaleX: 1, duration: 0.62, ease: 'power2.inOut' }, '+=0.1');
    tl.to([lineLongRight, lineEdgeRight], { scaleX: 1, duration: 0.62, ease: 'power2.inOut' }, '<');
    tl.to(viridisTitle, { y: '0%', duration: 0.55, ease: 'power3.out' }, '-=0.18');
    tl.to(navJournal,   { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.2');
    tl.to(navCommunity, { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.28');
    fadeInSlide1Content(tl);
  }


  // ─── direct transition journal ↔ community ───

  function startDirectTransition(targetSlide) {
    const fromJournal = journalMode;
    const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
    tl.to(viridisTitle, { y: '115%', duration: 0.4 });
    if (fromJournal) {
      tl.to(navCommunity, { y: '130%', opacity: 0, duration: 0.4 }, '<');
      fadeOutJournalContent(tl);
    } else {
      tl.to(navJournal, { y: '130%', opacity: 0, duration: 0.4 }, '<');
      fadeOutCommunityContent(tl);
    }
    tl.call(() => {
      if (fromJournal) {
        gsap.set(slide4El, { opacity: 0, pointerEvents: 'none' });
        gsap.set([slide4El.querySelector('.journal-left'), slide4El.querySelector('.journal-divider'), slide4El.querySelector('.journal-right')], { clearProps: 'opacity,y,scaleY' });
        journalMode = false; closeArticle();
      } else {
        gsap.set(slide5El, { opacity: 0, pointerEvents: 'none' });
        gsap.set([slide5El.querySelector('.community-top'), slide5El.querySelector('.community-bottom')], { clearProps: 'opacity,y' });
        communityMode = false;
      }
      bg.style.backgroundColor = rgbStr(C1);
      const dc = rgbStr(H_DARK); viridisTitle.style.color = dc; cornerBtnLeft.style.color = dc; burgerBtn.style.color = dc;
      navItems.forEach(n => n.style.color = dc);
      [lineLongLeft, lineLongRight, lineEdgeLeft, lineEdgeRight].forEach(el => el.style.background = dc);

      if (targetSlide === 'journal') {
        journalMode = true;
        viridisTitle.textContent = 'JOURNAL';
        navJournal.textContent   = 'JOURNAL';
        navCommunity.textContent = 'VIRIDIS';
        navCommunity.classList.add('nav-clickable');
        gsap.set(slide4El, { opacity: 1, pointerEvents: 'auto' });
        gsap.set([lineEdgeLeft, lineLongLeft],   { scaleX: 0 });
        gsap.set([lineLongRight, lineEdgeRight], { scaleX: 1 });
      } else {
        communityMode = true;
        viridisTitle.textContent = 'COMMUNITY';
        navJournal.textContent   = 'VIRIDIS';
        navCommunity.textContent = 'COMMUNITY';
        navCommunity.classList.remove('nav-clickable');
        gsap.set(slide5El, { opacity: 1, pointerEvents: 'auto' });
        gsap.set([lineEdgeLeft, lineLongLeft],   { scaleX: 1 });
        gsap.set([lineLongRight, lineEdgeRight], { scaleX: 0 });
      }
    });
    tl.to(viridisTitle, { y: '0%', duration: 0.55, ease: 'power3.out' }, '+=0.1');
    if (targetSlide === 'journal') {
      tl.to(navCommunity, { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.22');
      fadeInJournalContent(tl);
    } else {
      tl.to(navJournal, { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }, '-=0.22');
      fadeInCommunityContent(tl);
    }
  }


  // ─── nav click handlers ───

  navJournal.addEventListener('click', () => {
    if (communityMode) { startReturnFromCommunity(); return; }
    if (journalMode || introTL.isActive()) return;
    cancelSnap(); clearTimeout(idleTimer);
    const sy = window.scrollY || window.pageYOffset;
    if (sy < 5) { startJournalTransition(); }
    else { snapTo(0, () => gsap.delayedCall(0.18, startJournalTransition)); }
  });

  navCommunity.addEventListener('click', () => {
    if (journalMode) { startReturnTransition(); return; }
    if (communityMode || introTL.isActive()) return;
    cancelSnap(); clearTimeout(idleTimer);
    const sy = window.scrollY || window.pageYOffset;
    if (sy < 5) { startCommunityTransition(); }
    else { snapTo(0, () => gsap.delayedCall(0.18, startCommunityTransition)); }
  });

});
