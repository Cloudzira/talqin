/* =====================================================================
   TalqinKu - js/app.js
   Titik awal aplikasi: menyambungkan tombol ke fungsinya, lalu
   menyalakan semua bagian. File ini dimuat PALING AKHIR.
   ===================================================================== */
'use strict';

/* Menyambungkan setiap elemen ke fungsi yang dijalankan saat dipakai */
function bindEvents() {
  /* Navbar */
  dom.bookmarkBtn.addEventListener('click', Bookmarks.openList);
  dom.translationBtn.addEventListener('click', Reader.toggleTranslations);
  dom.themeBtn.addEventListener('click', () => Modal.open('themeModal'));

  /* Jendela pilih tema: pilih salah satu kartu tema */
  dom.themeList.addEventListener('click', (event) => {
    const option = event.target.closest('[data-theme-id]');
    if (option) Theme.choose(option.dataset.themeId);
  });

  /* Pilih surah & qori */
  dom.surahSelect.addEventListener('change', () => Reader.selectSurah(parseInt(dom.surahSelect.value, 10)));
  dom.qariSelect.addEventListener('change', Reader.changeQari);

  /* Pemutar bawah */
  dom.repeatMode.addEventListener('change', Reader.handleRepeatModeChange);
  dom.masterPlayBtn.addEventListener('click', Player.toggleMaster);

  /* Bagian yang punya cara pasang sendiri */
  Modal.init();
  Bookmarks.bindList();
  Reader.bindRangeSelectors();
  Reader.bindAyahActions();
  Player.bindAudioEvents();
}

function init() {
  Theme.init();
  Reader.populateDropdowns();
  Reader.updateTranslationButton();
  bindEvents();

  Splash.init();
  Install.init();
  NavHeight.init();
  ServiceWorker.register();

  Reader.loadSurah();
}

init();
