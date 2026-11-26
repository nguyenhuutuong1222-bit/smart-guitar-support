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
          const pos = window.scrollY + 220;
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
          `Smart Guitar hỗ trợ đầy đủ ${store} — Xem tính năng hoặc gửi yêu cầu hỗ trợ bên dưới.`,
          `Smart Guitar supports ${store} — Explore features or contact engineering support below.`
        );
        const target = document.getElementById('how-it-works');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

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
