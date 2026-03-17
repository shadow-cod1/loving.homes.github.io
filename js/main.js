/* =========================================================
  ملف JavaScript - مشروع: لوفينج هومز
  - وظائف بسيطة للواجهة:
    1) فتح/إغلاق قائمة الهاتف
    2) نافذة معاينة للمعرض (Lightbox Modal)
    3) أسئلة شائعة قابلة للطي/التوسيع (Accordion)
    4) تحقق من نموذج التواصل (Client-side Validation)
========================================================= */

(function () {
  /* ---------- 0) تفضيلات العرض (الوضع الليلي + اللغة) ---------- */
  const rootEl = document.documentElement;
  const themeBtn = document.querySelector('#theme-toggle');
  const langBtn = document.querySelector('#lang-toggle');

  function isEnglish() {
    const lang = (rootEl.getAttribute('lang') || 'ar').toLowerCase();
    return lang.startsWith('en');
  }

  // دالة مساعدة لاختيار النص حسب اللغة
  function t(ar, en) {
    return isEnglish() ? en : ar;
  }

  // ---- (A) الوضع الليلي / النهاري ----
  function applyTheme(mode) {
    const isDark = mode === 'dark';
    rootEl.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (themeBtn) {
      themeBtn.textContent = isDark ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-pressed', String(isDark));
      themeBtn.setAttribute('aria-label', t('تبديل الوضع', 'Toggle theme'));
    }
  }

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(rootEl.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  // ---- (B) تبديل اللغة عربي/إنجليزي ----
  function getPageFile() {
    const parts = location.pathname.split('/');
    const file = parts.pop() || 'index.html';
    return file.includes('.') ? file : 'index.html';
  }

  function inEnglishFolder() {
    return location.pathname.includes('/en/');
  }

  function redirectToLang(lang) {
    const page = getPageFile();
    if (lang === 'en' && !inEnglishFolder()) {
      location.href = 'en/' + page;
    }
    if (lang === 'ar' && inEnglishFolder()) {
      location.href = '../' + page;
    }
  }

  const savedLang = localStorage.getItem('lang');
  if (savedLang === 'en' || savedLang === 'ar') {
    redirectToLang(savedLang);
  }

  if (langBtn) {
    langBtn.textContent = isEnglish() ? 'AR' : 'EN';
    langBtn.setAttribute('aria-label', t('تغيير اللغة', 'Change language'));
    langBtn.addEventListener('click', () => {
      const next = isEnglish() ? 'ar' : 'en';
      localStorage.setItem('lang', next);
      redirectToLang(next);
    });
  }

  /* ---------- 1) قائمة الهاتف (Hamburger Menu) ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      // تبديل حالة القائمة (مفتوحة/مغلقة)
      const isOpen = nav.classList.toggle('open');
      // تحديث aria-expanded لمساعدة قارئات الشاشة
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // إغلاق القائمة بعد اختيار رابط (لتجربة هاتف أفضل)
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ---------- 2) نافذة معاينة للمعرض (Lightbox Modal) ---------- */
  const modal = document.querySelector('.modal');

  if (modal) {
    const closeBtn = modal.querySelector('.modal-close');
    const titleEl = modal.querySelector('#modal-title');
    const imgEl = modal.querySelector('#modal-image');

    function openModal({ title, src }) {
      if (titleEl) titleEl.textContent = title || t('معاينة الصورة','Image preview');
      if (imgEl) {
        imgEl.src = src;
        imgEl.alt = title || t('صورة من المعرض','Gallery image');
      }
      modal.setAttribute('aria-hidden', 'false');
      closeBtn && closeBtn.focus();
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      // تنظيف مصدر الصورة لتقليل استهلاك الذاكرة
      if (imgEl) {
        imgEl.src = '';
        imgEl.alt = '';
      }
    }

    // فتح المعاينة عند الضغط على صورة من المعرض
    document.querySelectorAll('a[data-gallery]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const title = a.getAttribute('data-title') || 'صورة';
        const src = a.getAttribute('href');
        if (src) openModal({ title, src });
      });
    });

    // إغلاق النافذة
    closeBtn && closeBtn.addEventListener('click', closeModal);

    // إغلاق عند الضغط على الخلفية الداكنة
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // إغلاق بزر Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
    });
  }

  /* ---------- 3) أسئلة شائعة (Accordion) ---------- */
  document.querySelectorAll('[data-faq] .faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-faq]');
      const answer = card ? card.querySelector('.faq-a') : null;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // غلق/فتح
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (card) card.classList.toggle('is-open', !isOpen);
      if (answer) answer.hidden = isOpen;
    });
  });

  /* ---------- 4) التحقق من نموذج التواصل (Client-side) ---------- */
  const form = document.querySelector('#contact-form');

  if (form) {
    const alertBox = document.querySelector('#form-alert');
    const successBox = document.querySelector('#form-success');

    function show(el, msg) {
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
    }

    function hide(el) {
      if (!el) return;
      el.classList.remove('show');
      el.textContent = '';
    }

    function isEmail(v) {
      // تحقق بسيط من صيغة البريد الإلكتروني
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hide(alertBox);
      hide(successBox);

      // قراءة القيم من الحقول
      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const phone = form.querySelector('[name="phone"]').value.trim();
      const service = form.querySelector('[name="service"]').value;
      const message = form.querySelector('[name="message"]').value.trim();

      // قواعد التحقق
      if (!name || name.length < 2) {
        return show(alertBox, t('يرجى إدخال الاسم الكامل (حرفان على الأقل).','Please enter your full name (at least 2 characters).')); 
      }
      if (!isEmail(email)) {
        return show(alertBox, t('يرجى إدخال بريد إلكتروني صحيح.','Please enter a valid email address.')); 
      }

      // يسمح بـ + والمسافات والأرقام؛ ويشترط 8 أرقام على الأقل
      const digits = phone.replace(/[^\d]/g, '');
      if (digits.length < 8) {
        return show(alertBox, t('يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل).','Please enter a valid phone number (at least 8 digits).')); 
      }

      if (!service) {
        return show(alertBox, t('يرجى اختيار الخدمة المطلوبة.','Please select a service.')); 
      }

      if (message.length < 10) {
        return show(alertBox, t('يرجى كتابة رسالة مختصرة (10 أحرف على الأقل).','Please write a short message (at least 10 characters).')); 
      }

      // في مشروع المدرسة: نعرض رسالة نجاح بدل الإرسال للخادم
      form.reset();
      show(successBox, t('تم إرسال استفسارك بنجاح. سنقوم بالرد خلال 24 ساعة.','Your message has been sent successfully. We will reply within 24 hours.')); 
    });
  }
})();
