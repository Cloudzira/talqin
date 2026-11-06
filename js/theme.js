/* =====================================================================
   TalqinKu - js/theme.js
   Mengatur tema tampilan. Warna tiap tema ada di css/themes.css,
   daftar tema ada di js/config.js (THEMES).
   ===================================================================== */
'use strict';

const Theme = {
  current: DEFAULT_THEME,

  /* Membaca tema tersimpan; nilai lama ('dark'/'light') diterjemahkan, nilai asing -> tema bawaan */
  readSaved() {
    const saved = store.get(STORAGE_KEYS.theme);
    const id = LEGACY_THEME_MAP[saved] || saved;
    return THEMES.some((theme) => theme.id === id) ? id : DEFAULT_THEME;
  },

  /* Memasang tema ke halaman (tanpa menyimpan) */
  apply(id) {
    const theme = THEMES.find((item) => item.id === id) || THEMES.find((item) => item.id === DEFAULT_THEME);
    Theme.current = theme.id;
    document.documentElement.setAttribute('data-theme', theme.id);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.metaColor);   // warna bilah status HP
    Theme.renderPicker();
  },

  /* Dipilih pengguna: pasang + simpan */
  choose(id) {
    Theme.apply(id);
    store.set(STORAGE_KEYS.theme, Theme.current);
  },

  /* Menggambar daftar pilihan tema di jendela "Pilih Tema" */
  renderPicker() {
    dom.themeList.innerHTML = THEME_GROUPS.map((group) => {
      const items = THEMES.filter((theme) => theme.group === group).map((theme) => {
        const selected = theme.id === Theme.current;
        const [bg, color1, color2] = theme.swatch;
        return `
          <button class="theme-option ${selected ? 'selected' : ''}" data-theme-id="${theme.id}" aria-pressed="${selected}">
            <span class="theme-swatch" style="--sw-bg:${bg};--sw-1:${color1};--sw-2:${color2}"></span>
            <span class="theme-info">
              <span class="theme-name">${theme.label}</span>
              <span class="theme-desc">${theme.desc}</span>
            </span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>`;
      }).join('');
      return `<div class="theme-group-title">${group}</div>${items}`;
    }).join('');
  },

  init() {
    Theme.apply(Theme.readSaved());
  }
};
