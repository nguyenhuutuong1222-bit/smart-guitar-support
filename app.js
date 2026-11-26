(function () {
  const html = document.documentElement;
  const SUPPORT_EMAIL = "nguyenhuutuong1222@gmail.com";

  // 1. Language (?lang=en|vi -> localStorage -> browser default)
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  const savedLang = localStorage.getItem("sg_support_lang");
  const browserEn = navigator.language && !navigator.language.toLowerCase().startsWith("vi");
  let currentLang = urlLang === "en" || urlLang === "vi"
    ? urlLang
    : (savedLang || (browserEn ? "en" : "vi"));

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "vi";
    html.setAttribute("data-lang", currentLang);
    html.setAttribute("lang", currentLang);
    localStorage.setItem("sg_support_lang", currentLang);

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-set-lang") === currentLang);
    });

    const searchInput = document.getElementById("faq-search-input");
    if (searchInput) {
      searchInput.placeholder = currentLang === "en"
        ? "Search help topics (Tuner, .gp files, Bluetooth LED, iOS Audio...)"
        : "Tìm nhanh câu hỏi (Tuner, tệp .gp, Bluetooth LED, Âm thanh iOS...)";
    }
  }

  // 2. Theme
  const savedTheme = localStorage.getItem("sg_support_theme") || "dark";
  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("sg_support_theme", next);
  }

  applyLang(currentLang);
  applyTheme(savedTheme);

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(currentLang);
    applyTheme(html.getAttribute("data-theme"));

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-set-lang"));
      });
    });

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        applyTheme(html.getAttribute("data-theme") === "light" ? "dark" : "light");
      });
    }

    // 3. Copy Email + Toast
    const toast = document.getElementById("toast");
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("is-visible");
      clearTimeout(toast.__timer);
      toast.__timer = setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 2400);
    }

    document.querySelectorAll(".js-copy-email").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(SUPPORT_EMAIL).then(function () {
            showToast(currentLang === "en" ? "Copied: nguyenhuutuong1222@gmail.com" : "Đã sao chép: nguyenhuutuong1222@gmail.com");
          });
        } else {
          window.location.href = "mailto:" + SUPPORT_EMAIL;
        }
      });
    });

    // 4. FAQ Accordion, Category Chips & Instant Search (with '/' shortcut)
    const faqItems = Array.from(document.querySelectorAll(".faq-item"));
    const filterChips = Array.from(document.querySelectorAll(".filter-chip"));
    const searchInput = document.getElementById("faq-search-input");
    let activeCat = "all";

    faqItems.forEach(function (item) {
      const btn = item.querySelector(".faq-q");
      if (btn) {
        btn.addEventListener("click", function () {
          item.classList.toggle("is-open");
        });
      }
    });

    function filterFaq() {
      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      faqItems.forEach(function (item) {
        const cat = item.getAttribute("data-cat") || "all";
        const catMatch = activeCat === "all" || cat === activeCat;
        const textMatch = !q || item.textContent.toLowerCase().includes(q);
        const visible = catMatch && textMatch;
        item.style.display = visible ? "" : "none";
        if (q && visible) item.classList.add("is-open");
      });
    }

    filterChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCat = chip.getAttribute("data-filter") || "all";
        filterChips.forEach(function (c) {
          c.classList.toggle("is-active", c === chip);
        });
        filterFaq();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", filterFaq);
      document.addEventListener("keydown", function (e) {
        if (e.key === "/" && document.activeElement !== searchInput && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    // 5. Support Ticket Composer
    const supportForm = document.getElementById("support-request-form");
    if (supportForm) {
      supportForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const topicEl = document.getElementById("support-topic");
        const deviceEl = document.getElementById("support-device");
        const msgEl = document.getElementById("support-message");

        const topic = topicEl ? topicEl.value : "General Support";
        const device = deviceEl && deviceEl.value.trim() ? deviceEl.value.trim() : "iOS / Android";
        const message = msgEl && msgEl.value.trim() ? msgEl.value.trim() : "";

        const subject = "[Smart Guitar Support] " + topic + " (" + device + ")";
        const body =
          (currentLang === "en" ? "Device & OS Version: " : "Thiết bị & Hệ điều hành: ") +
          device +
          "\n\n" +
          (currentLang === "en" ? "Issue / Question:\n" : "Nội dung cần hỗ trợ:\n") +
          message +
          "\n";

        window.location.href =
          "mailto:" +
          SUPPORT_EMAIL +
          "?subject=" +
          encodeURIComponent(subject) +
          "&body=" +
          encodeURIComponent(body);
      });
    }
  });
})();
