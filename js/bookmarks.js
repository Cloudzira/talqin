/* =====================================================================
   TalqinKu - js/bookmarks.js
   Penanda (bookmark) ayat: simpan, hapus, tampilkan daftar, loncat ke ayat.
   Data disimpan di localStorage dalam bentuk daftar teks, contoh "2 : 255".
   ===================================================================== */
'use strict';

const Bookmarks = {
  /* "2 : 255" -> { surahNum: 2, ayahNum: 255 } */
  parseKey(key) {
    const [surahNum, ayahNum] = key.split(' : ').map(Number);
    return { surahNum, ayahNum };
  },

  has(surahNum, ayahNum) {
    return state.bookmarks.includes(bookmarkKey(surahNum, ayahNum));
  },

  save() {
    store.setJson(STORAGE_KEYS.bookmarks, state.bookmarks);
  },

  /* Tombol bookmark pada kartu ayat ditekan */
  toggle(ayahNum) {
    const key = bookmarkKey(state.surahNum, ayahNum);
    const index = state.bookmarks.indexOf(key);
    if (index > -1) state.bookmarks.splice(index, 1);
    else state.bookmarks.push(key);
    Bookmarks.save();
    Bookmarks.updateButton(ayahNum);
  },

  remove(key) {
    const index = state.bookmarks.indexOf(key);
    if (index === -1) return;
    state.bookmarks.splice(index, 1);
    Bookmarks.save();
    Bookmarks.renderList();
    const { surahNum, ayahNum } = Bookmarks.parseKey(key);
    if (surahNum === state.surahNum) Bookmarks.updateButton(ayahNum);
  },

  /* Mewarnai / mengosongkan ikon bookmark pada satu kartu */
  updateButton(ayahNum) {
    const button = document.getElementById(`btn-bookmark-${ayahNum}`);
    if (button) button.classList.toggle('saved', Bookmarks.has(state.surahNum, ayahNum));
  },

  openList() {
    Modal.open('bookmarkModal');
    Bookmarks.renderList();
  },

  renderList() {
    if (state.bookmarks.length === 0) {
      dom.bookmarkList.innerHTML = '<p class="modal-empty">Belum ada bookmark</p>';
      return;
    }
    dom.bookmarkList.innerHTML = state.bookmarks.map((key) => {
      const { surahNum, ayahNum } = Bookmarks.parseKey(key);
      const surah = findSurah(surahNum);
      const name = surah ? surah.name : `Surah ${surahNum}`;
      return `
        <div class="bookmark-item" data-action="jump" data-surah="${surahNum}" data-ayah="${ayahNum}" role="button" tabindex="0">
          <div class="bookmark-info">
            <div class="bookmark-title">${escapeHtml(name)} (${surahNum} : ${ayahNum})</div>
            <div class="bookmark-sub">Surah ${escapeHtml(name)} • ${ayahLabel(surahNum, ayahNum)}</div>
          </div>
          <button class="bookmark-delete" data-action="delete" data-key="${key}" title="Hapus" aria-label="Hapus bookmark">
            <svg><use href="#icon-close"></use></svg>
          </button>
        </div>`;
    }).join('');
  },

  /* Membuka surah yang dituju (bila perlu), lalu menggulir ke ayatnya */
  async jumpTo(surahNum, ayahNum) {
    Modal.close('bookmarkModal');
    if (state.surahNum !== surahNum) await Reader.selectSurah(surahNum);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const card = document.getElementById(`ayah-card-${ayahNum}`);
    if (!card) return;
    $$('.ayah-card').forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /* Satu pendengar klik untuk seluruh daftar (lebih rapi daripada onclick di tiap baris) */
  bindList() {
    const handle = (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      if (target.dataset.action === 'delete') {
        event.stopPropagation();
        Bookmarks.remove(target.dataset.key);
      } else if (target.dataset.action === 'jump') {
        Bookmarks.jumpTo(Number(target.dataset.surah), Number(target.dataset.ayah));
      }
    };
    dom.bookmarkList.addEventListener('click', handle);
    dom.bookmarkList.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.matches('[data-action="jump"]')) handle(event);
    });
  }
};
