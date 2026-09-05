// HunarIntern — shared interactivity (no backend; static site)

document.addEventListener('DOMContentLoaded', () => {

  /* Authority badge — inline panel (opens right under the badges, same spot every time) */
const authorityPanel = document.getElementById('authority-panel');
const authorityImg = document.getElementById('authority-panel-img');
const authorityName = document.getElementById('authority-panel-name');
const authorityDesc = document.getElementById('authority-panel-desc');
const authorityRegno = document.getElementById('authority-panel-regno');
const authorityClose = document.getElementById('authority-panel-close');
const authorityChips = document.querySelectorAll('.approve-chip[data-logo]');

authorityChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const alreadyOpenForThis = authorityPanel.classList.contains('open') && chip.classList.contains('active');
    authorityChips.forEach(c => c.classList.remove('active'));

    if (alreadyOpenForThis) {
      authorityPanel.classList.remove('open');
      return;
    }

    authorityImg.src = chip.dataset.logo;
    authorityImg.alt = chip.dataset.name;
    authorityName.textContent = chip.dataset.name;
    authorityDesc.textContent = chip.dataset.desc;
    authorityRegno.textContent = chip.dataset.regno;
    chip.classList.add('active');
    authorityPanel.classList.add('open');
  });
});

if (authorityClose) {
  authorityClose.addEventListener('click', () => {
    authorityPanel.classList.remove('open');
    authorityChips.forEach(c => c.classList.remove('active'));
  });
}

  /* Sticky header blur */
  const header = document.querySelector('.site-header');
  const backToTop = document.getElementById('back-to-top');
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Mobile drawer — locks the page behind it so only the menu scrolls */
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.mobile-drawer .close');
  let scrollPosBeforeDrawer = 0;

  function openDrawer() {
    scrollPosBeforeDrawer = window.scrollY;
    document.body.style.top = `-${scrollPosBeforeDrawer}px`;
    document.body.classList.add('no-scroll');
    drawer.classList.add('open');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosBeforeDrawer);
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', openDrawer);
    closeBtn && closeBtn.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  }

  /* Count-up stats on scroll into view */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = el.dataset.count.includes('.') ? 1 : 0;
        const duration = 3500;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (decimals ? val.toFixed(1) : Math.floor(val).toLocaleString()) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

 /* Contact form -> Google Sheet via Apps Script (no redirect) */
const form = document.getElementById('contact-form');
if (form) {
  const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwsRxITFpjeUJ8tL_MtCfpiviyq7aTVSydQ6o0C36vVItu7ZpJGHITa38rvdYAwQXB1lw/exec"; // e.g. https://script.google.com/macros/s/XXXXX/exec

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) { valid = false; field.style.borderColor = '#D9534F'; }
      else { field.style.borderColor = ''; }
    });
    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const payload = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      domain: form.domain.value,
      message: form.message.value
    };

    fetch("https://script.google.com/macros/s/AKfycbwsRxITFpjeUJ8tL_MtCfpiviyq7aTVSydQ6o0C36vVItu7ZpJGHITa38rvdYAwQXB1lw/exec", {
      method: 'POST',
      mode: 'no-cors', // Apps Script doesn't return CORS headers; response is opaque but the write still happens
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    })
    .then(() => {
      form.style.display = 'none';
      document.getElementById('contact-success').classList.add('show');
    })
    .catch(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      alert('Something went wrong — please try again or reach us on WhatsApp.');
    });
  });
}

  /* Domain search + filter (internship.html) */
  const domainSearch = document.getElementById('domain-search');
  const domainGrid = document.getElementById('domain-grid');
  const domainEmpty = document.getElementById('domain-empty');
  const filterPills = document.querySelectorAll('#domain-filters .filter-pill');

  if (domainGrid) {
    const cards = [...domainGrid.querySelectorAll('.domain-card')];
    /* View More toggle */
const viewMoreBtn = document.getElementById('view-more-btn');
const limit = parseInt(domainGrid.dataset.limit, 10) || cards.length;
let expanded = false;

function applyViewMoreState() {
  if (!viewMoreBtn) return;
  if (cards.length <= limit) {
    viewMoreBtn.style.display = 'none';
    return;
  }
  cards.forEach((card, i) => {
    if (!expanded && i >= limit) {
      card.classList.add('vm-hidden');
    } else {
      card.classList.remove('vm-hidden');
    }
  });
  viewMoreBtn.textContent = '';
  const label = document.createTextNode(expanded ? 'Show Less' : 'View More Internships');
  const arrow = document.createElement('span');
  arrow.className = 'vm-arrow';
  arrow.textContent = '↓';
  viewMoreBtn.appendChild(label);
  viewMoreBtn.appendChild(arrow);
  viewMoreBtn.classList.toggle('expanded', expanded);
}

if (viewMoreBtn) {
  applyViewMoreState();
  viewMoreBtn.addEventListener('click', () => {
    expanded = !expanded;
    applyViewMoreState();
    if (!expanded) {
      domainGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
    let activeFilter = 'all';

    function applyDomainFilters() {
      const query = (domainSearch ? domainSearch.value : '').trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(card => {
        const name = card.dataset.name || '';
        const category = card.dataset.category || '';
        const matchesSearch = !query || name.includes(query);
        const matchesFilter = activeFilter === 'all' || category === activeFilter;
        const show = matchesSearch && matchesFilter;

        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      if (domainEmpty) domainEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (domainSearch) {
      domainSearch.addEventListener('input', applyDomainFilters);
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.dataset.filter;
        applyDomainFilters();
      });
    });
  }

  /* Reveal-on-scroll for generic elements (preserves any inline transition-delay for staggered groups) */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'none';
          io2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(el => {
      const delay = el.style.transitionDelay || '0s';
      el.style.opacity = 0;
      el.style.transform = 'translateY(16px)';
      el.style.transition = `opacity .6s ease ${delay}, transform .6s ease ${delay}`;
      io2.observe(el);
    });
  }

  /* Video testimonials — play inline, right inside the card, not a popup */
  document.querySelectorAll('.video-card[data-video]').forEach(card => {
    const thumb = card.querySelector('.video-thumb');
    const poster = card.dataset.poster;
    if (poster && thumb) {
      thumb.style.backgroundImage = `url('${poster}')`;
    }

    card.addEventListener('click', () => {
      if (card.classList.contains('is-playing')) return; // already playing here

      // stop any other card currently playing inline
      document.querySelectorAll('.video-card.is-playing').forEach(other => stopInlineVideo(other));

      card.classList.add('is-playing');
      thumb.innerHTML = '';

      const video = document.createElement('video');
      video.src = card.dataset.video;
      video.controls = true;
      video.playsInline = true;
      video.autoplay = true;
      video.className = 'video-inline-player';
      thumb.appendChild(video);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'video-inline-close';
      closeBtn.setAttribute('aria-label', 'Stop video');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopInlineVideo(card);
      });
      thumb.appendChild(closeBtn);

      video.play().catch(() => {});
    });
  });

  function stopInlineVideo(card) {
    const thumb = card.querySelector('.video-thumb');
    const video = thumb.querySelector('video');
    if (video) { video.pause(); video.src = ''; }
    card.classList.remove('is-playing');
    thumb.innerHTML = '<div class="play-btn">▶</div>';
    const poster = card.dataset.poster;
    if (poster) thumb.style.backgroundImage = `url('${poster}')`;
  }

  /* Developer Tools — search + filter (tools.html card grid) */
  const toolSearch = document.getElementById('tool-search');
  const toolSearchBtn = document.getElementById('tool-search-btn');
  const toolGrid = document.getElementById('tool-grid');
  const toolEmpty = document.getElementById('tool-empty');
  const toolFilterPills = document.querySelectorAll('#tool-filters .filter-pill');

  if (toolGrid) {
    const toolCards = [...toolGrid.querySelectorAll('.tool-card')];
    let activeToolFilter = 'all';

    function applyToolFilters() {
      const query = (toolSearch ? toolSearch.value : '').trim().toLowerCase();
      let visibleCount = 0;

      toolCards.forEach(card => {
        const name = card.dataset.name || '';
        const category = card.dataset.category || '';
        const matchesSearch = !query || name.includes(query);
        const matchesFilter = activeToolFilter === 'all' || category === activeToolFilter;
        const show = matchesSearch && matchesFilter;

        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      if (toolEmpty) toolEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (toolSearch) toolSearch.addEventListener('input', applyToolFilters);
    if (toolSearchBtn) toolSearchBtn.addEventListener('click', applyToolFilters);

    toolFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        toolFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeToolFilter = pill.dataset.filter;
        applyToolFilters();
      });
    });
  }
});
