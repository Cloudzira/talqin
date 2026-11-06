/* =====================================================================
   TalqinKu - js/audio.js
   Pemutar suara. Alur singkatnya:
     1. getSources()  -> menyusun daftar alamat audio (utama dulu, lalu cadangan)
     2. start()       -> mencoba alamat pertama
     3. bila gagal / lambat -> nextSource() mencoba alamat berikutnya
     4. bila semua gagal -> fail() menampilkan pesan
   "token" dipakai agar hasil dari percobaan lama tidak mengganggu
   pemutaran yang baru dimulai.
   ===================================================================== */
'use strict';

const Player = {
  sources: [],            // daftar alamat audio untuk ayat yang diputar
  sourceIndex: 0,         // alamat ke berapa yang sedang dicoba
  ownCount: 0,            // jumlah alamat milik qori pilihan (sisanya cadangan Alafasy)
  token: 0,
  stallTimer: null,
  failedHosts: new Set(), // server yang baru saja gagal (dilewati saat memakai suara pengganti)

  /* ---------- A. Menyusun alamat audio ---------- */
  getSources(surahNum, ayahNum, qariId = state.qariId) {
    const qari = QARIS.find((item) => item.id === qariId);
    if (!qari) return [];
    const S3 = String(surahNum).padStart(3, '0');
    const A3 = String(ayahNum).padStart(3, '0');
    const githubUrl = (file) => `${GITHUB_AUDIO_BASE}/${surahNum}/${file}`;

    /* Suara "Anak" (milik sendiri di GitHub); bila belum diunggah -> pakai suara Alafasy */
    if (qari.type === 'github') {
      const primary = ayahNum === 0
        ? (surahNum === 1 ? githubUrl('000_001.mp3') : githubUrl('0.mp3'))
        : githubUrl(`${S3}_${A3}.mp3`);
      const fallbackQari = QARIS.find((item) => item.id === FALLBACK_QARI_ID);
      const mirror = QARI_MIRRORS[FALLBACK_QARI_ID] || {};
      const list = [primary];
      if (ayahNum === 0 && surahNum === 1) {
        list.push(`${fallbackQari.baseUrl}audhubillah.mp3`);
      } else {
        const s = ayahNum === 0 ? 1 : surahNum;
        const a = ayahNum === 0 ? 1 : ayahNum;
        const SS = String(s).padStart(3, '0');
        const AA = String(a).padStart(3, '0');
        list.push(`${fallbackQari.baseUrl}${SS}${AA}.mp3`);
        list.push(`${QURANCOM_CDN}${mirror.qc}/${SS}${AA}.mp3`);
        list.push(`${ISLAMIC_CDN}${mirror.isl}/${globalAyahNumber(s, a)}.mp3`);
      }
      return list;
    }

    /* Qori lain (everyayah.com) + server cadangan */
    const mirror = QARI_MIRRORS[qari.id] || {};
    const list = [];
    if (ayahNum === 0) {
      if (surahNum === 1) {
        list.push(githubUrl('000_002.mp3'));              // Ta'awudz
        list.push(`${qari.baseUrl}audhubillah.mp3`);
      } else {
        list.push(`${qari.baseUrl}001001.mp3`);           // Bismillah = ayat 1 Al-Fatihah
        if (mirror.qc) list.push(`${QURANCOM_CDN}${mirror.qc}/001001.mp3`);
        if (mirror.isl) list.push(`${ISLAMIC_CDN}${mirror.isl}/1.mp3`);
      }
      return list;
    }
    list.push(`${qari.baseUrl}${S3}${A3}.mp3`);
    if (mirror.qc) list.push(`${QURANCOM_CDN}${mirror.qc}/${S3}${A3}.mp3`);
    if (mirror.isl) list.push(`${ISLAMIC_CDN}${mirror.isl}/${globalAyahNumber(surahNum, ayahNum)}.mp3`);
    return list;
  },

  hostOf(url) {
    try { return new URL(url).hostname; } catch (error) { return ''; }
  },

  /* ---------- B. Ikon tombol ---------- */
  setAyahButtonIcon(ayahNum, isPause) {
    const use = $(`#icon-play-${ayahNum} use`);
    if (use) use.setAttribute('href', isPause ? '#icon-pause' : '#icon-play');
  },

  setMasterIcon(isActive) {
    dom.masterPlayIcon.setAttribute('href', isActive ? '#icon-stop' : '#icon-play');
    dom.masterPlaySvg.classList.toggle('icon-fill-stop', isActive);
  },

  /* ---------- C. Kontrol dari pengguna ---------- */
  /* Tombol putar pada kartu ayat. Menekan ayat yang sedang diputar = berhenti. */
  play(ayahNum) {
    if (state.currentAyah === ayahNum && state.isPlaying) { Player.stop(); return; }
    if (state.currentAyah !== null) Player.setAyahButtonIcon(state.currentAyah, false);

    state.currentAyah = ayahNum;
    $$('.ayah-card').forEach((card) => card.classList.remove('active'));
    const card = document.getElementById(`ayah-card-${ayahNum}`);
    if (card) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    Player.setAyahButtonIcon(ayahNum, true);

    const surah = findSurah(state.surahNum);
    dom.playerTitle.textContent = `${surah.name} : ${ayahLabel(state.surahNum, ayahNum)}`;
    dom.playerStatus.textContent = 'Memutar audio...';
    Player.setMasterIcon(true);
    Player.start(ayahNum);
  },

  /* Tombol utama (bulat besar di pemutar bawah) */
  toggleMaster() {
    if (state.isPlaying) { Player.stop(); return; }
    const firstAyah = dom.repeatMode.value === 'range'
      ? parseInt(dom.startAyahSelect.value, 10)
      : firstAyahOf(state.surahNum);
    Player.play(firstAyah);
  },

  stop() {
    Player.token++;
    clearTimeout(Player.stallTimer);
    dom.audio.pause();
    dom.audio.currentTime = 0;
    state.isPlaying = false;
    Player.setMasterIcon(false);
    if (state.currentAyah !== null) {
      Player.setAyahButtonIcon(state.currentAyah, false);
      const card = document.getElementById(`ayah-card-${state.currentAyah}`);
      if (card) card.classList.remove('active');
    }
    state.currentAyah = null;
    dom.playerTitle.textContent = 'Pilih ayat untuk memutar';
    dom.playerStatus.textContent = 'Dihentikan';
  },

  /* ---------- D. Memutar dengan server cadangan ---------- */
  start(ayahNum) {
    Player.token++;
    clearTimeout(Player.stallTimer);
    const own = Player.getSources(state.surahNum, ayahNum);
    Player.ownCount = own.length;
    Player.failedHosts = new Set();
    Player.sources = own;

    /* Qori syaikh yang gagal -> otomatis pindah ke suara Syaikh Alafasy (punya 3 server) */
    const qari = QARIS.find((item) => item.id === state.qariId);
    if (qari && qari.type === 'api' && qari.id !== FALLBACK_QARI_ID) {
      Player.sources = own.concat(Player.getSources(state.surahNum, ayahNum, FALLBACK_QARI_ID));
    }
    Player.sourceIndex = 0;
    dom.audio.pause();
    dom.playerStatus.textContent = 'Memuat audio...';
    Player.tryCurrentSource(ayahNum, Player.token);
  },

  tryCurrentSource(ayahNum, token) {
    if (token !== Player.token) return;
    clearTimeout(Player.stallTimer);

    if (Player.sourceIndex >= Player.sources.length) {
      Player.fail(ayahNum, navigator.onLine === false
        ? 'Tidak ada koneksi internet'
        : 'Suara gagal dimuat. Coba lagi atau pilih qori lain.');
      return;
    }
    /* Pada suara pengganti, lewati server yang baru saja gagal agar tidak menunggu lagi */
    while (Player.sourceIndex >= Player.ownCount
      && Player.sourceIndex < Player.sources.length
      && Player.failedHosts.has(Player.hostOf(Player.sources[Player.sourceIndex]))) {
      Player.sourceIndex++;
    }
    if (Player.sourceIndex >= Player.sources.length) { Player.tryCurrentSource(ayahNum, token); return; }

    const index = Player.sourceIndex;
    dom.audio.src = Player.sources[index];
    dom.audio.load();

    /* Bila terlalu lama tidak siap -> coba server berikutnya */
    Player.stallTimer = setTimeout(() => {
      if (token === Player.token && index === Player.sourceIndex && dom.audio.readyState < 3) {
        Player.nextSource(ayahNum, token, index);
      }
    }, AUDIO_STALL_TIMEOUT_MS);

    const promise = dom.audio.play();
    if (promise && promise.then) {
      promise
        .then(() => { if (token === Player.token) state.isPlaying = true; })
        .catch((error) => {
          if (token !== Player.token) return;
          if (error && error.name === 'AbortError') return;
          if (error && error.name === 'NotAllowedError') {
            Player.fail(ayahNum, 'Browser menahan suara. Ketuk tombol putar sekali lagi.');
            return;
          }
          console.warn('Audio gagal:', Player.sources[index], error);
          Player.nextSource(ayahNum, token, index);
        });
    }
  },

  nextSource(ayahNum, token, index) {
    if (token !== Player.token || index !== Player.sourceIndex) return;   // sudah ditangani
    Player.failedHosts.add(Player.hostOf(Player.sources[index]));
    Player.sourceIndex++;
    Player.tryCurrentSource(ayahNum, token);
  },

  fail(ayahNum, message) {
    clearTimeout(Player.stallTimer);
    Player.token++;
    try { dom.audio.pause(); } catch (error) { /* abaikan */ }
    state.isPlaying = false;
    Player.setMasterIcon(false);
    Player.setAyahButtonIcon(ayahNum, false);
    dom.playerStatus.textContent = message;
  },

  /* ---------- E. Kejadian dari elemen <audio> ---------- */
  bindAudioEvents() {
    dom.audio.addEventListener('error', () => {
      if (state.currentAyah === null) return;
      Player.nextSource(state.currentAyah, Player.token, Player.sourceIndex);
    });

    dom.audio.addEventListener('waiting', () => {
      if (state.isPlaying || state.currentAyah !== null) dom.playerStatus.textContent = 'Memuat audio...';
    });

    dom.audio.addEventListener('playing', () => {
      clearTimeout(Player.stallTimer);
      state.isPlaying = true;
      const usingOwnFirst = Player.sourceIndex === 0;
      if (usingOwnFirst) {
        dom.playerStatus.textContent = 'Memutar audio...';
      } else if (state.qariId === DEFAULT_QARI_ID && Player.sourceIndex === 1) {
        dom.playerStatus.textContent = 'Suara Anak belum tersedia, memutar suara Syaikh Alafasy';
      } else if (state.qariId !== DEFAULT_QARI_ID && Player.sourceIndex >= Player.ownCount) {
        dom.playerStatus.textContent = 'Qori ini sedang tidak bisa dimuat, memutar suara Syaikh Alafasy';
      } else {
        dom.playerStatus.textContent = 'Memutar audio (server cadangan)';
      }
    });

    dom.audio.addEventListener('ended', Player.onEnded);
  },

  /* Audio selesai -> lanjut sesuai mode ulang (ayat / surat / pilih ayat) */
  onEnded() {
    clearTimeout(Player.stallTimer);
    state.isPlaying = false;
    Player.setMasterIcon(false);
    if (state.currentAyah === null) return;
    Player.setAyahButtonIcon(state.currentAyah, false);

    const mode = dom.repeatMode.value;
    if (mode === 'single') {
      Player.play(state.currentAyah);
    } else if (mode === 'surah') {
      const hasNext = state.currentAyah < state.totalAyahs;
      Player.play(hasNext ? state.currentAyah + 1 : firstAyahOf(state.surahNum));
    } else if (mode === 'range') {
      const start = parseInt(dom.startAyahSelect.value, 10);
      const end = parseInt(dom.endAyahSelect.value, 10);
      Player.play(state.currentAyah < end ? state.currentAyah + 1 : start);
    }
  }
};
