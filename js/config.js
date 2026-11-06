/* =====================================================================
   TalqinKu - js/config.js
   Semua PENGATURAN & DAFTAR tetap ada di sini. Jika ingin menambah qori
   atau tema, cukup edit file ini (tidak perlu menyentuh file lain).
   ===================================================================== */
'use strict';

/* ===== 1. Kunci penyimpanan di browser (localStorage / sessionStorage) ===== */
const STORAGE_KEYS = {
  theme: 'theme',
  showTranslations: 'show_translations',
  bookmarks: 'saved_ayahs',
  splashSeen: 'tk_splash',                 // sessionStorage: splash sudah tampil di sesi ini
  installDismissed: 'tk_install_dismissed'
};

/* ===== 2. Tema =====
   id         : nama tema (sama dengan [data-theme="..."] di css/themes.css)
   group      : kelompok di jendela "Pilih Tema"
   metaColor  : warna bilah status HP (meta theme-color)
   swatch     : 3 warna contoh [latar, aksen 1, aksen 2] */
const THEMES = [
  { id: 'futuristik-gelap',  group: 'Dewasa', label: 'Futuristik Gelap',  desc: 'Neon cyan & violet di latar malam', metaColor: '#060a16', swatch: ['#060a16', '#22d3ee', '#a78bfa'] },
  { id: 'futuristik-terang', group: 'Dewasa', label: 'Futuristik Terang', desc: 'Biru elektrik di latar es cerah',   metaColor: '#eef3fb', swatch: ['#eef3fb', '#2563eb', '#7c3aed'] },
  { id: 'ceria-hijau',       group: 'Anak',   label: 'Ceria Hijau',       desc: 'Hijau segar, ramah anak',           metaColor: '#10b981', swatch: ['#f0fdf4', '#10b981', '#0ea5e9'] },
  { id: 'ceria-kuning',      group: 'Anak',   label: 'Ceria Kuning',      desc: 'Kuning hangat, ramah anak',         metaColor: '#f59e0b', swatch: ['#fffbeb', '#f59e0b', '#f43f5e'] }
];
const THEME_GROUPS = ['Dewasa', 'Anak'];
const DEFAULT_THEME = 'ceria-hijau';     // ganti ke 'futuristik-gelap' bila ingin tema awal futuristik
/* Nilai tema versi lama ('dark' / 'light') diterjemahkan agar pengguna lama tidak berubah tampilan */
const LEGACY_THEME_MAP = { dark: 'ceria-hijau', light: 'ceria-kuning' };

/* ===== 3. Sumber data teks Al-Qur'an ===== */
const API_URLS = {
  arabic: (surahNum) => `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNum}`,
  indonesian: (surahNum) => `https://api.alquran.cloud/v1/surah/${surahNum}/id.indonesian`
};

/* ===== 4. Pengaturan audio ===== */
const GITHUB_AUDIO_BASE = 'https://raw.githubusercontent.com/Cloudzira/talqin/main/audio-ayat';
const QURANCOM_CDN = 'https://verses.quran.foundation/';       // server cadangan 1
const ISLAMIC_CDN = 'https://cdn.islamic.app/quran/audio/';    // server cadangan 2
const DEFAULT_QARI_ID = 'github_anak';
const FALLBACK_QARI_ID = 'mishary';       // dipakai bila suara qori pilihan gagal dimuat
const AUDIO_STALL_TIMEOUT_MS = 8000;      // audio tidak siap dalam 8 detik -> coba server berikutnya

/* Daftar qori. type 'github' = suara milik sendiri, 'api' = server everyayah.com */
const QARIS = [
  { id: 'github_anak', name: 'Anak (Dalam Pengembangan Kurniapedia)', type: 'github' },
  { id: 'mishary', name: 'Syaikh Misyari Rasyid Alafasy', type: 'api', baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/' },
  { id: 'husary', name: 'Syaikh Mahmud Khalil Al-Husary', type: 'api', baseUrl: 'https://everyayah.com/data/Husary_128kbps/' },
  { id: 'husary_muallim', name: 'Syaikh Al-Husary (Muallim - pelan, untuk belajar)', type: 'api', baseUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/' },
  { id: 'minshawi', name: 'Syaikh Muhammad Siddiq Al-Minshawi', type: 'api', baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/' },
  { id: 'minshawi_teacher', name: 'Syaikh Al-Minshawi (Teacher - bersama anak)', type: 'api', baseUrl: 'https://everyayah.com/data/Minshawy_Teacher_128kbps/' },
  { id: 'minshawi_mujawwad', name: 'Syaikh Al-Minshawi (Mujawwad)', type: 'api', baseUrl: 'https://everyayah.com/data/Minshawy_Mujawwad_192kbps/' },
  { id: 'basit', name: 'Syaikh Abdul Basit Abdus Samad (Murattal)', type: 'api', baseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/' },
  { id: 'basit_mujawwad', name: 'Syaikh Abdul Basit Abdus Samad (Mujawwad)', type: 'api', baseUrl: 'https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/' },
  { id: 'sudais', name: 'Syaikh Abdurrahman As-Sudais', type: 'api', baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/' },
  { id: 'shuraim', name: 'Syaikh Sa\'ud Asy-Syuraim', type: 'api', baseUrl: 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps/' },
  { id: 'maher', name: 'Syaikh Maher Al-Muaiqly', type: 'api', baseUrl: 'https://everyayah.com/data/Maher_AlMuaiqly_64kbps/' },
  { id: 'hudhaify', name: 'Syaikh Ali Al-Hudzaifi', type: 'api', baseUrl: 'https://everyayah.com/data/Hudhaify_128kbps/' },
  { id: 'shatri', name: 'Syaikh Abu Bakr Asy-Syatiri', type: 'api', baseUrl: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/' },
  { id: 'ajamy', name: 'Syaikh Ahmad bin Ali Al-Ajmi', type: 'api', baseUrl: 'https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaab.net/' },
  { id: 'ghamadi', name: 'Syaikh Sa\'ad Al-Ghamidi', type: 'api', baseUrl: 'https://everyayah.com/data/Ghamadi_40kbps/' },
  { id: 'rifai', name: 'Syaikh Hani Ar-Rifa\'i', type: 'api', baseUrl: 'https://everyayah.com/data/Hani_Rifai_192kbps/' },
  { id: 'ayyoub', name: 'Syaikh Muhammad Ayyub', type: 'api', baseUrl: 'https://everyayah.com/data/Muhammad_Ayyoub_128kbps/' },
  { id: 'jibreel', name: 'Syaikh Muhammad Jibril', type: 'api', baseUrl: 'https://everyayah.com/data/Muhammad_Jibreel_128kbps/' },
  { id: 'dussary', name: 'Syaikh Yasser Ad-Dausari', type: 'api', baseUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/' },
  { id: 'qatami', name: 'Syaikh Nasser Al-Qatami', type: 'api', baseUrl: 'https://everyayah.com/data/Nasser_Alqatami_128kbps/' },
  { id: 'bukhatir', name: 'Syaikh Shalah Bukhatir', type: 'api', baseUrl: 'https://everyayah.com/data/Salaah_AbdulRahman_Bukhatir_128kbps/' },
  { id: 'basfar', name: 'Syaikh Abdullah Basfar', type: 'api', baseUrl: 'https://everyayah.com/data/Abdullah_Basfar_192kbps/' }
];

/* Server cadangan untuk tiap qori (qc = quran.com, isl = islamic.app) */
const QARI_MIRRORS = {
  mishary:           { qc: 'Alafasy/mp3',              isl: 'ar.alafasy' },
  husary:            { qc: 'Husary/mp3' },
  husary_muallim:    { qc: 'Husary/Muallim/mp3' },
  minshawi:          { qc: 'Minshawi/Murattal/mp3' },
  minshawi_mujawwad: { qc: 'Minshawi/Mujawwad/mp3' },
  basit:             { qc: 'AbdulBaset/Murattal/mp3' },
  basit_mujawwad:    { qc: 'AbdulBaset/Mujawwad/mp3' },
  sudais:            { qc: 'Sudais/mp3',               isl: 'ar.abdurrahmaansudais' },
  shuraim:           { qc: 'Shuraym/mp3' }
};


/* ===== 5. Splash screen & ajakan pasang aplikasi ===== */
const SPLASH = { minMs: 2000, maxMs: 5000 };
const INSTALL_PROMPT = { dismissDays: 7, firstDelayMs: 2500 };
