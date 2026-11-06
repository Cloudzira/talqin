/* =====================================================================
   TalqinKu - js/utils.js
   Fungsi bantu + "state" (data yang berubah saat aplikasi dipakai) +
   daftar elemen HTML (dom) + pengatur jendela (Modal).
   File ini dimuat setelah config.js dan data-surah.js.
   ===================================================================== */
'use strict';

/* ===== 1. Pintasan memilih elemen HTML ===== */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* ===== 2. Penyimpanan aman =====
   Beberapa browser (mode privat) menolak localStorage. Pembungkus ini
   memastikan aplikasi tetap jalan walau penyimpanan gagal. */
const store = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (error) { /* abaikan */ }
  },
  getJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) { return fallback; }
  },
  setJson(key, value) {
    store.set(key, JSON.stringify(value));
  }
};

/* Penanda per-sesi (hilang saat tab ditutup) */
const sessionFlag = {
  has(key) { try { return !!sessionStorage.getItem(key); } catch (error) { return false; } },
  set(key) { try { sessionStorage.setItem(key, '1'); } catch (error) { /* abaikan */ } }
};

/* ===== 3. Fungsi kecil serbaguna ===== */
/* Mencegah teks dari internet disisipkan sebagai kode HTML */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* 12 -> ١٢ */
function toArabicDigits(num) {
  return String(num).replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[digit]);
}

/* Ayat pertama yang dibacakan: surah 9 (At-Taubah) tidak memakai Bismillah, jadi mulai dari ayat 1.
   Ayat nomor 0 = kartu Bismillah (atau Ta'awudz pada Al-Fatihah). */
function firstAyahOf(surahNum) {
  return surahNum === 9 ? 1 : 0;
}

/* Nama ayat untuk tampilan: "Ta'awudz", "Bismillah", atau "Ayat 5" */
function ayahLabel(surahNum, ayahNum) {
  if (ayahNum !== 0) return `Ayat ${ayahNum}`;
  return surahNum === 1 ? "Ta'awudz" : 'Bismillah';
}

/* Kunci bookmark, contoh "2 : 255". Format ini jangan diubah agar bookmark lama tetap terbaca. */
function bookmarkKey(surahNum, ayahNum) {
  return `${surahNum} : ${ayahNum}`;
}

/* ===== 4. STATE: semua data yang berubah ada di satu tempat ===== */
const state = {
  surahNum: 1,                 // surah yang sedang dibuka
  totalAyahs: 7,               // jumlah ayat surah tersebut
  qariId: DEFAULT_QARI_ID,     // qori yang dipilih
  currentAyah: null,           // ayat yang sedang diputar (null = tidak ada)
  isPlaying: false,
  showTranslations: store.get(STORAGE_KEYS.showTranslations) !== 'false',
  bookmarks: (() => {
    const saved = store.getJson(STORAGE_KEYS.bookmarks, []);
    return Array.isArray(saved) ? saved : [];
  })(),
  loadRequestId: 0             // penanda agar hasil unduhan lama tidak menimpa surah baru
};

/* ===== 5. DOM: elemen HTML yang sering dipakai (dicari sekali saja) ===== */
const dom = {
  audio: $('#audio-element'),
  playerTitle: $('#player-title'),
  playerStatus: $('#player-status'),
  masterPlayBtn: $('#masterPlayBtn'),
  masterPlaySvg: $('#masterPlaySvg'),
  masterPlayIcon: $('#masterPlayIcon'),
  surahSelect: $('#surahSelect'),
  qariSelect: $('#qariSelect'),
  repeatMode: $('#repeatMode'),
  rangePicker: $('#rangePicker'),
  startAyahSelect: $('#startAyahSelect'),
  endAyahSelect: $('#endAyahSelect'),
  surahTitleAr: $('#surahTitleAr'),
  surahSubtitle: $('#surahSubtitle'),
  ayahs: $('#ayahs-container'),
  translationBtn: $('#translationToggleBtn'),
  bookmarkBtn: $('#bookmarkListBtn'),
  bookmarkList: $('#bookmarkListContainer'),
  themeBtn: $('#themeBtn'),
  themeList: $('#themeListContainer')
};

/* ===== 6. MODAL: buka / tutup jendela ===== */
const Modal = {
  open(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('open');
  },
  close(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('open');
  },
  closeAll() {
    $$('.modal-overlay.open').forEach((overlay) => overlay.classList.remove('open'));
  },
  /* Dipanggil sekali oleh app.js: klik area gelap, tombol X, atau tombol Esc = tutup */
  init() {
    $$('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.closest('[data-close-modal]')) overlay.classList.remove('open');
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') Modal.closeAll();
    });
  }
};
