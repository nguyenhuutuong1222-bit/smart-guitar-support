(function () {
  const html = document.documentElement;
  const SUPPORT_EMAIL = "nguyenhuutuong1222@gmail.com";

  // 1. Language Initialization (?lang=en|vi -> localStorage -> browser default)
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

    const langLabel = document.getElementById("lang-toggle-label");
    if (langLabel) {
      langLabel.textContent = currentLang === "vi" ? "EN" : "VN";
    }

    const searchInput = document.getElementById("faq-search-input");
    if (searchInput) {
      searchInput.placeholder = currentLang === "en"
        ? "Search help topics (Tuner, Tab .gp, Bluetooth LED, Audio...)"
        : "Tìm nhanh câu hỏi (Tuner, file .gp, Bluetooth LED, Âm thanh...)";
    }
  }

  // 2. Theme Initialization
  const savedTheme = localStorage.getItem("sg_support_theme") || "dark";
  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("sg_support_theme", next);
    const themeLabel = document.getElementById("theme-toggle-label");
    if (themeLabel) {
      themeLabel.textContent = next === "light" ? "🌙" : "☀️";
    }
  }

  applyLang(currentLang);
  applyTheme(savedTheme);

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(currentLang);
    applyTheme(html.getAttribute("data-theme"));

    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        applyLang(currentLang === "vi" ? "en" : "vi");
      });
    }

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        const cur = html.getAttribute("data-theme");
        applyTheme(cur === "light" ? "dark" : "light");
      });
    }

    // 3. Copy Email Button + Toast
    const copyBtn = document.getElementById("copy-email-btn");
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

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(SUPPORT_EMAIL).then(function () {
            showToast(currentLang === "en" ? "Copied support email!" : "Đã sao chép địa chỉ Email!");
          });
        } else {
          window.location.href = "mailto:" + SUPPORT_EMAIL;
        }
      });
    }

    // 4. FAQ Accordion & Live Search
    const faqItems = Array.from(document.querySelectorAll(".faq-item"));
    faqItems.forEach(function (item) {
      const btn = item.querySelector(".faq-q");
      if (btn) {
        btn.addEventListener("click", function () {
          item.classList.toggle("is-open");
        });
      }
    });

    const searchInput = document.getElementById("faq-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const q = searchInput.value.trim().toLowerCase();
        faqItems.forEach(function (item) {
          const text = item.textContent.toLowerCase();
          const match = !q || text.includes(q);
          item.style.display = match ? "" : "none";
          if (q && match) item.classList.add("is-open");
        });
      });
    }

    // 5. Quick Support Request Mailto Composer
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
          (currentLang === "en" ? "Device / OS Version: " : "Thiết bị / Phiên bản hệ điều hành: ") +
          device +
          "\n\n" +
          (currentLang === "en" ? "Details:\n" : "Nội dung cần hỗ trợ:\n") +
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
