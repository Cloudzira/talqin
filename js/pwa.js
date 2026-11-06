/* =====================================================================
   TalqinKu - js/pwa.js
   Hal-hal "aplikasi": splash screen, ajakan pasang aplikasi (install),
   service worker (offline), dan pengukur tinggi navbar.
   ===================================================================== */
'use strict';

/* ===== 1. SPLASH SCREEN: tampil minimal 2 detik, hilang setelah halaman siap ===== */
const Splash = {
  element: $('#splash'),
  startedAt: Date.now(),
  finished: false,        // true = splash sudah hilang / dilewati

  init() {
    const el = Splash.element;
    if (!el) { Splash.finished = true; return; }

    /* Sudah pernah tampil pada sesi ini (ditandai skrip di <head>) -> langsung buang */
    if (document.documentElement.classList.contains('splash-seen')) {
      el.remove();
      Splash.finished = true;
      setTimeout(Install.maybeShow, INSTALL_PROMPT.firstDelayMs);
      return;
    }
    if (document.readyState === 'complete') Splash.scheduleHide();
    else window.addEventListener('load', Splash.scheduleHide);
    setTimeout(Splash.hide, SPLASH.maxMs);       // jaring pengaman: paling lama 5 detik
  },

  scheduleHide() {
    const wait = Math.max(0, SPLASH.minMs - (Date.now() - Splash.startedAt));
    setTimeout(Splash.hide, wait);
  },

  hide() {
    if (Splash.finished) return;
    Splash.finished = true;
    Splash.element.classList.add('hide');
    sessionFlag.set(STORAGE_KEYS.splashSeen);
    setTimeout(() => Splash.element.remove(), 700);
    setTimeout(Install.maybeShow, INSTALL_PROMPT.firstDelayMs);
  }
};

/* ===== 2. PASANG APLIKASI (Android/Chrome otomatis, iPhone lewat panduan) ===== */
const Install = {
  deferredPrompt: null,   // "izin pasang" dari browser (Android/Chrome)
  button: $('#installBtn'),
  card: $('#installCard'),
  title: $('#icTitle'),
  text: $('#icText'),
  confirmButton: $('#icInstall'),

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  },

  isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  },

  recentlyDismissed() {
    const time = parseInt(store.get(STORAGE_KEYS.installDismissed, '0'), 10);
    return !!time && (Date.now() - time) < INSTALL_PROMPT.dismissDays * 86400000;
  },

  /* iPhone/iPad tidak punya tombol pasang otomatis -> tampilkan petunjuk manual */
  setIOSMode() {
    Install.title.textContent = 'Pasang TalqinKu di iPhone / iPad';
    Install.text.innerHTML = 'Ketuk tombol <b>Bagikan</b> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> di Safari, lalu pilih <b>Tambah ke Layar Utama</b>.';
    Install.confirmButton.textContent = 'Mengerti';
  },

  showCard() { Install.card.classList.add('show'); },
  hideCard() { Install.card.classList.remove('show'); },

  /* "Nanti saja": sembunyikan dan jangan tampil lagi selama 7 hari */
  dismiss() {
    Install.hideCard();
    store.set(STORAGE_KEYS.installDismissed, String(Date.now()));
  },

  /* Tombol "Pasang" pada kartu */
  async install() {
    if (!Install.deferredPrompt) { Install.dismiss(); return; }
    Install.hideCard();
    Install.deferredPrompt.prompt();
    try { await Install.deferredPrompt.userChoice; } catch (error) { /* abaikan */ }
    Install.deferredPrompt = null;
    Install.button.hidden = true;
  },

  /* Tombol unduh di navbar */
  handleButtonClick() {
    if (Install.isIOS() && !Install.deferredPrompt) Install.setIOSMode();
    Install.showCard();
  },

  /* Memunculkan kartu otomatis (bila belum terpasang & belum ditolak baru-baru ini) */
  maybeShow() {
    if (Install.isStandalone() || Install.recentlyDismissed()) return;
    if (Install.isIOS() && !Install.deferredPrompt && !Install.button.hidden) {
      Install.setIOSMode();
      Install.showCard();
    } else if (Install.deferredPrompt) {
      Install.showCard();
    }
  },

  init() {
    Install.button.addEventListener('click', Install.handleButtonClick);
    Install.confirmButton.addEventListener('click', Install.install);
    $('#icDismiss').addEventListener('click', Install.dismiss);

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      Install.deferredPrompt = event;
      if (!Install.isStandalone()) Install.button.hidden = false;
      if (Splash.finished) setTimeout(Install.maybeShow, 1500);
    });

    window.addEventListener('appinstalled', () => {
      Install.deferredPrompt = null;
      Install.button.hidden = true;
      Install.hideCard();
    });

    /* iOS Safari tidak punya prompt otomatis -> tampilkan tombol panduan */
    if (Install.isIOS() && !Install.isStandalone()) Install.button.hidden = false;
  }
};

/* ===== 3. SERVICE WORKER: membuat aplikasi bisa dibuka tanpa internet ===== */
const ServiceWorker = {
  register() {
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!('serviceWorker' in navigator) || !isSecure) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((error) => console.warn('SW gagal didaftarkan:', error));
    });
  }
};

/* ===== 4. Ukur tinggi navbar agar bar pilih surah menempel tepat di bawahnya ===== */
const NavHeight = {
  init() {
    const nav = $('.navbar');
    if (!nav) return;
    const update = () => document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    if (window.ResizeObserver) new ResizeObserver(update).observe(nav);
    update();
  }
};
