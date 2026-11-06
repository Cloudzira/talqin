/* =====================================================================
   TalqinKu - sw.js (Service Worker)
   Tugasnya membuat aplikasi tetap bisa dibuka tanpa internet:
     - Kerangka aplikasi (halaman, CSS, JS, ikon) disimpan -> bisa dibuka offline
     - Teks ayat yang pernah dibuka disimpan -> bisa dibaca offline
     - Audio TIDAK disimpan (file besar), jadi suara tetap butuh internet

   PENTING: ganti VERSION setiap kali kamu mengubah file aplikasi
   agar cache lama diganti dengan yang baru.
   ===================================================================== */
'use strict';

/* ===== 1. PENGATURAN ===== */
const VERSION = 'v1.1.0';
const CACHE_PREFIX = 'talqinku-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${VERSION}`;
const API_CACHE = `${CACHE_PREFIX}api-${VERSION}`;
const MAX_API_ENTRIES = 240;               // batas jumlah ayat yang disimpan

/* File yang disimpan saat pertama kali aplikasi dipasang */
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.png',
  './css/themes.css',
  './css/style.css',
  './css/splash-install.css',
  './js/config.js',
  './js/data-surah.js',
  './js/mushaf-style.js',
  './js/utils.js',
  './js/theme.js',
  './js/bookmarks.js',
  './js/audio.js',
  './js/reader.js',
  './js/pwa.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

const API_HOSTS = ['api.quran.com', 'api.alquran.cloud'];            // sumber teks ayat & terjemahan
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];    // font Google

/* ===== 2. STRATEGI PENGAMBILAN DATA ===== */

/* Jaringan dulu; bila gagal (offline) pakai simpanan */
async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
    if (cached) return cached;
    if (fallbackUrl) {
      const shell = await caches.match(fallbackUrl);
      if (shell) return shell;
    }
    throw error;
  }
}

/* Simpanan dulu (cepat), diam-diam diperbarui di belakang layar */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

/* Menjaga simpanan ayat tidak membengkak: yang terlama dibuang */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
  }
}

/* ===== 3. KEJADIAN SERVICE WORKER ===== */

/* Pemasangan: simpan kerangka aplikasi.
   File disimpan satu per satu; bila ada 1 file belum ada, pemasangan tidak gagal total. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.all(
        SHELL_FILES.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

/* Aktivasi: hapus simpanan versi lama */
self.addEventListener('activate', (event) => {
  const keep = [SHELL_CACHE, RUNTIME_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && !keep.includes(key)).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* Setiap permintaan data: tentukan strategi yang cocok */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* Audio / streaming (Range): jangan disentuh, biar browser yang menangani */
  if (request.destination === 'audio' || request.destination === 'video' || request.headers.has('range')) return;

  /* Halaman utama */
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, './index.html'));
    return;
  }

  /* API teks Qur'an & terjemahan */
  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(
      networkFirst(request, API_CACHE).then((response) => {
        trimCache(API_CACHE, MAX_API_ENTRIES);
        return response;
      })
    );
    return;
  }

  /* Font Google */
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  /* File statis milik sendiri (CSS, JS, ikon, manifest, dll) */
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  /* Selain itu: biarkan browser menangani sendiri */
});
