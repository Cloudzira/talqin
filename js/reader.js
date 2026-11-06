/* =====================================================================
   TalqinKu - js/reader.js
   Memuat teks ayat dari internet dan menampilkannya sebagai kartu.
   Berisi juga: isi menu dropdown, pemilih rentang ayat, tombol terjemahan.
   ===================================================================== */
'use strict';

/* Teks tetap untuk kartu Ta'awudz (hanya Al-Fatihah) dan Bismillah */
const TAAWUDZ_TEXT = 'أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَٰنِ ٱلرَّجِيمِ';
const TAAWUDZ_TRANSLATION = 'Aku berlindung kepada Allah dari godaan syaitan yang terkutuk.';
const BISMILLAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const BISMILLAH_TRANSLATION = 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.';
/* Pada data API, Bismillah ikut menempel di awal ayat 1 setiap surah -> dibuang (sudah punya kartu sendiri) */
const BISMILLAH_PREFIX = new RegExp('^' + BISMILLAH_TEXT + '\\s*');

const Reader = {
  /* ---------- A. Isi menu & pemilih ---------- */
  populateDropdowns() {
    dom.surahSelect.innerHTML = ALL_SURAHS
      .map((surah) => `<option value="${surah.num}">${surah.num}. ${escapeHtml(surah.name)}</option>`)
      .join('');
    dom.surahSelect.value = state.surahNum;

    dom.qariSelect.innerHTML = QARIS
      .map((qari) => `<option value="${qari.id}">${escapeHtml(qari.name)}</option>`)
      .join('');
    dom.qariSelect.value = state.qariId;
  },

  /* Pilihan "ayat awal s/d ayat akhir" untuk mode Pilih ayat */
  setupRangeSelector() {
    const options = Array.from({ length: state.totalAyahs }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    dom.startAyahSelect.innerHTML = options;
    dom.endAyahSelect.innerHTML = options;
    dom.startAyahSelect.value = 1;
    dom.endAyahSelect.value = state.totalAyahs;
  },

  /* Menjaga agar ayat awal tidak melebihi ayat akhir (dan sebaliknya). Dipanggil sekali saat start. */
  bindRangeSelectors() {
    dom.startAyahSelect.addEventListener('change', () => {
      if (parseInt(dom.startAyahSelect.value, 10) > parseInt(dom.endAyahSelect.value, 10)) {
        dom.endAyahSelect.value = dom.startAyahSelect.value;
      }
    });
    dom.endAyahSelect.addEventListener('change', () => {
      if (parseInt(dom.endAyahSelect.value, 10) < parseInt(dom.startAyahSelect.value, 10)) {
        dom.startAyahSelect.value = dom.endAyahSelect.value;
      }
    });
  },

  handleRepeatModeChange() {
    dom.rangePicker.classList.toggle('is-visible', dom.repeatMode.value === 'range');
  },

  /* ---------- B. Ganti surah / qori ---------- */
  selectSurah(surahNum) {
    state.surahNum = surahNum;
    state.totalAyahs = findSurah(surahNum).ayahs;
    dom.surahSelect.value = surahNum;
    Player.stop();
    return Reader.loadSurah();
  },

  changeQari() {
    state.qariId = dom.qariSelect.value;
    if (state.isPlaying && state.currentAyah !== null) Player.start(state.currentAyah);
  },

  /* ---------- C. Terjemahan ---------- */
  updateTranslationButton() {
    dom.translationBtn.classList.toggle('active', state.showTranslations);
    dom.translationBtn.title = state.showTranslations ? 'Sembunyikan Semua Terjemahan' : 'Tampilkan Semua Terjemahan';
  },

  toggleTranslations() {
    state.showTranslations = !state.showTranslations;
    store.set(STORAGE_KEYS.showTranslations, String(state.showTranslations));
    Reader.updateTranslationButton();
    $$('.ayah-translation').forEach((el) => el.classList.toggle('hidden', !state.showTranslations));
  },

  /* ---------- D. Membuat tampilan kartu ---------- */
  /* Satu kartu ayat. ayahNum 0 = kartu Ta'awudz / Bismillah. */
  buildCard({ ayahNum, arabicHtml, translationHtml }) {
    const isSpecial = ayahNum === 0;
    const keyLabel = isSpecial ? `0 (${ayahLabel(state.surahNum, 0)})` : ayahNum;
    const saved = Bookmarks.has(state.surahNum, ayahNum);
    const hidden = state.showTranslations ? '' : 'hidden';
    return `
      <div class="ayah-card ${isSpecial ? 'bismillah-card' : ''}" id="ayah-card-${ayahNum}">
        <div class="ayah-top-bar">
          <div class="ayah-key">${state.surahNum} : ${keyLabel}</div>
          <div class="ayah-actions">
            <button class="glass-btn ${saved ? 'saved' : ''}" id="btn-bookmark-${ayahNum}" data-action="bookmark" data-ayah="${ayahNum}" aria-label="Bookmark ayat"><svg><use href="#icon-bookmark"></use></svg></button>
            <button class="glass-btn round" id="btn-play-${ayahNum}" data-action="play" data-ayah="${ayahNum}" aria-label="Putar ayat"><svg id="icon-play-${ayahNum}"><use href="#icon-play"></use></svg></button>
          </div>
        </div>
        <div class="ayah-arabic ${isSpecial ? 'bismillah-text' : ''}">${arabicHtml}</div>
        <div class="ayah-translation ${hidden}" id="translation-${ayahNum}">${translationHtml}</div>
      </div>`;
  },

  /* Seluruh kartu satu surah */
  buildSurahHtml(versesArab, versesIndo) {
    const surahNum = state.surahNum;
    const cards = [];

    if (surahNum === 1) {
      cards.push(Reader.buildCard({
        ayahNum: 0,
        arabicHtml: applyIndonesianQuranStandards(TAAWUDZ_TEXT),
        translationHtml: TAAWUDZ_TRANSLATION
      }));
    } else if (surahNum !== 9) {
      cards.push(Reader.buildCard({
        ayahNum: 0,
        arabicHtml: applyIndonesianQuranStandards(BISMILLAH_TEXT),
        translationHtml: BISMILLAH_TRANSLATION
      }));
    }

    versesArab.forEach((verse, index) => {
      const ayahNum = index + 1;
      let text = verse.text_uthmani;
      if (surahNum !== 1 && surahNum !== 9 && index === 0) text = text.replace(BISMILLAH_PREFIX, '');

      const endMark = `\u06DD${toArabicDigits(ayahNum)}`;               // simbol akhir ayat
      const indo = versesIndo[index] ? versesIndo[index].text : '';
      cards.push(Reader.buildCard({
        ayahNum,
        arabicHtml: `${applyIndonesianQuranStandards(text)} <span class="ayah-number-icon">${endMark}</span>`,
        translationHtml: `${ayahNum}. ${escapeHtml(indo)}`
      }));
    });
    return cards.join('');
  },

  /* ---------- E. Memuat surah dari internet ---------- */
  showMessage(text, isError = false) {
    dom.ayahs.innerHTML = `<p class="status-message ${isError ? 'error' : ''}">${text}</p>`;
  },

  async loadSurah() {
    const requestId = ++state.loadRequestId;
    const surah = findSurah(state.surahNum);
    dom.surahTitleAr.textContent = surah.ar;
    dom.surahSubtitle.textContent = `${surah.name} • Surah ${surah.num} • ${surah.ayahs} Ayat`;
    Reader.setupRangeSelector();
    Reader.showMessage('Memuat ayat...');

    try {
      const [resArab, resIndo] = await Promise.all([
        fetch(API_URLS.arabic(state.surahNum)),
        fetch(API_URLS.indonesian(state.surahNum))
      ]);
      if (!resArab.ok || !resIndo.ok) throw new Error('Server menjawab dengan galat');

      await lamAlifReady;                    // pengukuran posisi lam selesai sebelum teks Arab dibentuk
      const dataArab = await resArab.json();
      const dataIndo = await resIndo.json();
      if (requestId !== state.loadRequestId) return;   // pengguna sudah pindah surah, hasil ini dibuang

      dom.ayahs.innerHTML = Reader.buildSurahHtml(dataArab.verses, dataIndo.data.ayahs);
    } catch (error) {
      if (requestId !== state.loadRequestId) return;
      console.warn('Gagal memuat surah:', error);
      Reader.showMessage('Gagal memuat ayat. Periksa koneksi internet Anda.', true);
    }
  },

  /* Tombol-tombol di dalam kartu (bookmark / putar) ditangani oleh satu pendengar klik */
  bindAyahActions() {
    dom.ayahs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const ayahNum = Number(button.dataset.ayah);
      if (button.dataset.action === 'bookmark') Bookmarks.toggle(ayahNum);
      else if (button.dataset.action === 'play') Player.play(ayahNum);
    });
  }
};
