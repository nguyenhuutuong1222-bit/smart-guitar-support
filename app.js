(function () {
  const LANG_KEY = 'sg_support_lang';

  function detectInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('lang');
    if (q === 'en' || q === 'vi') return q;
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
    const nav = (navigator.language || '').toLowerCase();
    return nav.startsWith('vi') ? 'vi' : 'en';
  }

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem(LANG_KEY, lang);
    document.querySelectorAll('[data-set-lang]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-set-lang') === lang);
    });
    const searchInput = document.getElementById('faq-search');
    if (searchInput) {
      searchInput.placeholder =
        lang === 'vi'
          ? 'Tìm nhanh câu hỏi (âm thanh iPhone, file .gp, Bluetooth LED...)'
          : 'Search questions (iOS audio, .gp tabs, Bluetooth LED...)';
    }
    if (typeof window.__syncLightboxCaption === 'function') {
      window.__syncLightboxCaption();
    }
  }

  // Set language immediately before first paint
  applyLang(detectInitialLang());

  function showToast(msgVi, msgEn) {
    const toast = document.getElementById('toast-banner');
    if (!toast) return;
    const lang = document.documentElement.getAttribute('data-lang') || 'vi';
    toast.textContent = lang === 'vi' ? msgVi : msgEn;
    toast.classList.add('is-visible');
    clearTimeout(window.__sgToastTimer);
    window.__sgToastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyLang(document.documentElement.getAttribute('data-lang') || 'vi');

    // Sticky Header Blur on Scroll
    const header = document.querySelector('.site-header');
    const syncHeader = () => {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    // Language Switcher
    document.querySelectorAll('[data-set-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyLang(btn.getAttribute('data-set-lang'));
      });
    });

    // Active Nav Highlight on Scroll (Index Page)
    const sectionLinks = document.querySelectorAll('.nav-link[data-section]');
    if (sectionLinks.length > 0) {
      const sections = Array.from(sectionLinks)
        .map((l) => document.getElementById(l.getAttribute('data-section')))
        .filter(Boolean);

      window.addEventListener(
        'scroll',
        () => {
          const pos = window.scrollY + 240;
          let activeId = sections[0] ? sections[0].id : 'home';
          sections.forEach((sec) => {
            if (sec.offsetTop <= pos) activeId = sec.id;
          });
          sectionLinks.forEach((l) => {
            l.classList.toggle('is-active', l.getAttribute('data-section') === activeId);
          });
        },
        { passive: true }
      );
    }

    // Store Badges Smooth Action
    document.querySelectorAll('[data-store-badge]').forEach((badge) => {
      badge.addEventListener('click', (e) => {
        e.preventDefault();
        const store = badge.getAttribute('data-store-badge');
        showToast(
          `Smart Guitar hỗ trợ đầy đủ ${store} — Khám phá hình ảnh thực tế bên dưới.`,
          `Smart Guitar supports ${store} — Explore real-world LED showcase below.`
        );
        const target = document.getElementById('showcase') || document.getElementById('how-it-works');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // ========================================================================
    // INTERACTIVE SWIPE & DRAG SHOWCASE CAROUSEL + FULLSCREEN LIGHTBOX
    // ========================================================================
    const track = document.getElementById('gallery-track');
    const slides = track ? Array.from(track.querySelectorAll('.gallery-slide')) : [];
    const dots = Array.from(document.querySelectorAll('.gallery-dot'));
    const prevBtn = document.getElementById('gallery-prev-btn');
    const nextBtn = document.getElementById('gallery-next-btn');

    let currentSlideIdx = 0;

    function scrollToSlide(index) {
      if (!track || slides.length === 0) return;
      const clamped = Math.max(0, Math.min(slides.length - 1, index));
      currentSlideIdx = clamped;
      const slide = slides[clamped];
      const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 28;
      const targetLeft = Math.max(0, slide.offsetLeft - padLeft);
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });
      updateGalleryIndicators(clamped);
    }

    function updateGalleryIndicators(activeIdx) {
      currentSlideIdx = activeIdx;
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === activeIdx));
      if (prevBtn) prevBtn.disabled = activeIdx <= 0;
      if (nextBtn) nextBtn.disabled = activeIdx >= slides.length - 1;
    }

    if (track && slides.length > 0) {
      // Sync active dot on native touch/wheel scroll
      let scrollTimer = null;
      track.addEventListener(
        'scroll',
        () => {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 28;
            const scrollRef = track.scrollLeft + padLeft + 80;
            let bestIdx = 0;
            let minDist = Infinity;
            slides.forEach((sl, idx) => {
              const dist = Math.abs(sl.offsetLeft - scrollRef);
              if (dist < minDist) {
                minDist = dist;
                bestIdx = idx;
              }
            });
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 16) {
              bestIdx = slides.length - 1;
            }
            updateGalleryIndicators(bestIdx);
          }, 40);
        },
        { passive: true }
      );

      if (prevBtn) prevBtn.addEventListener('click', () => scrollToSlide(currentSlideIdx - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => scrollToSlide(currentSlideIdx + 1));
      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => scrollToSlide(idx));
      });

      // Desktop Mouse Drag-to-Swipe Physics
      let isMouseDown = false;
      let startX = 0;
      let startScrollLeft = 0;
      let draggedDistance = 0;

      track.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isMouseDown = true;
        draggedDistance = 0;
        startX = e.pageX;
        startScrollLeft = track.scrollLeft;
        track.classList.add('is-dragging');
      });

      window.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const dx = e.pageX - startX;
        draggedDistance = Math.max(draggedDistance, Math.abs(dx));
        track.scrollLeft = startScrollLeft - dx * 1.15;
      });

      window.addEventListener('mouseup', () => {
        if (!isMouseDown) return;
        isMouseDown = false;
        track.classList.remove('is-dragging');
      });

      // Fullscreen Cinema Lightbox
      const lightbox = document.getElementById('gallery-lightbox');
      const lbImg = document.getElementById('lightbox-img');
      const lbTitle = document.getElementById('lightbox-title');
      const lbDesc = document.getElementById('lightbox-desc');
      const lbClose = document.getElementById('lightbox-close');
      const lbPrev = document.getElementById('lightbox-prev');
      const lbNext = document.getElementById('lightbox-next');
      let lbIndex = 0;

      function renderLightboxSlide(idx) {
        if (!lightbox || slides.length === 0) return;
        lbIndex = (idx + slides.length) % slides.length;
        const sl = slides[lbIndex];
        const imgEl = sl.querySelector('img');
        const lang = document.documentElement.getAttribute('data-lang') || 'vi';
        const titleText = sl.getAttribute(lang === 'vi' ? 'data-title-vi' : 'data-title-en') || '';
        const descText = sl.getAttribute(lang === 'vi' ? 'data-desc-vi' : 'data-desc-en') || '';
        if (lbImg && imgEl) {
          lbImg.src = imgEl.getAttribute('src');
          lbImg.alt = titleText;
        }
        if (lbTitle) lbTitle.textContent = `${lbIndex + 1} / ${slides.length} — ${titleText}`;
        if (lbDesc) lbDesc.textContent = descText;
      }
      window.__syncLightboxCaption = () => {
        if (lightbox && lightbox.classList.contains('is-open')) {
          renderLightboxSlide(lbIndex);
        }
      };

      function openLightbox(idx) {
        if (!lightbox) return;
        renderLightboxSlide(idx);
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      slides.forEach((sl, idx) => {
        sl.addEventListener('click', () => {
          if (draggedDistance > 8) return; // Ignore click at end of mouse drag
          openLightbox(idx);
        });
      });

      if (lbClose) lbClose.addEventListener('click', closeLightbox);
      if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); renderLightboxSlide(lbIndex - 1); });
      if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); renderLightboxSlide(lbIndex + 1); });
      if (lightbox) {
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) closeLightbox();
        });
        // Touch swipe left/right inside Lightbox
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
          if (!e.changedTouches || !e.changedTouches[0]) return;
          const diff = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(diff) > 45) {
            renderLightboxSlide(diff < 0 ? lbIndex + 1 : lbIndex - 1);
          }
        }, { passive: true });
      }

      window.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') renderLightboxSlide(lbIndex - 1);
        if (e.key === 'ArrowRight') renderLightboxSlide(lbIndex + 1);
      });

      updateGalleryIndicators(0);
    }

    // Copy Official Support Email
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('nguyenhuutuong1222@gmail.com');
          showToast(
            'Đã sao chép email: nguyenhuutuong1222@gmail.com',
            'Copied support email: nguyenhuutuong1222@gmail.com'
          );
        } catch (_) {
          window.location.href = 'mailto:nguyenhuutuong1222@gmail.com';
        }
      });
    }

    // FAQ Accordion
    const faqCards = document.querySelectorAll('.faq-card');
    faqCards.forEach((card) => {
      const trigger = card.querySelector('.faq-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        const willOpen = !card.classList.contains('is-open');
        faqCards.forEach((c) => c.classList.remove('is-open'));
        if (willOpen) card.classList.add('is-open');
      });
    });

    // FAQ Category Filter + Instant Search
    let currentFilter = 'all';
    const searchInput = document.getElementById('faq-search');
    const filterBtns = document.querySelectorAll('[data-filter]');

    function filterFaq() {
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      faqCards.forEach((card) => {
        const cat = card.getAttribute('data-cat') || 'all';
        const matchCat = currentFilter === 'all' || cat === currentFilter;
        const matchText = !q || card.textContent.toLowerCase().includes(q);
        card.hidden = !(matchCat && matchText);
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-filter') || 'all';
        filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        filterFaq();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', filterFaq);
    }

    // Direct Support Mailto Form
    const form = document.getElementById('support-ticket-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const device = document.getElementById('ticket-device')?.value || 'iOS / Android';
        const topic = document.getElementById('ticket-topic')?.value || 'General Support';
        const msg = document.getElementById('ticket-message')?.value.trim() || '';
        const subject = encodeURIComponent(`[Smart Guitar Support] ${topic} (${device})`);
        const body = encodeURIComponent(
          `Device / OS: ${device}\nTopic: ${topic}\n\nDetails:\n${msg}\n`
        );
        window.location.href = `mailto:nguyenhuutuong1222@gmail.com?subject=${subject}&body=${body}`;
        showToast(
          'Đang mở ứng dụng Email với nội dung hỗ trợ đã điền sẵn...',
          'Opening your mail client with pre-filled support details...'
        );
      });
    }
  });
})();
