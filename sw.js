/* TalqinKu - Service Worker
 * - App shell (halaman + ikon) tersimpan -> bisa dibuka tanpa internet
 * - Teks ayat yang pernah dibuka tersimpan -> bisa dibaca offline
 * - Audio TIDAK disimpan (file besar), jadi audio tetap butuh internet
 * Ganti VERSION setiap kali kamu mengubah file agar cache diperbarui.
 */
const VERSION = 'v1.0.0';
const SHELL_CACHE = `talqinku-shell-${VERSION}`;
const RUNTIME_CACHE = `talqinku-runtime-${VERSION}`;
const API_CACHE = `talqinku-api-${VERSION}`;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

const API_HOSTS = ['api.quran.com', 'api.alquran.cloud'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const MAX_API_ENTRIES = 240;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // add satu-satu: kalau ada 1 file belum ada, instalasi tidak gagal total
      Promise.all(SHELL_FILES.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = [SHELL_CACHE, RUNTIME_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('talqinku-') && !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

// Jaringan dulu, kalau gagal pakai cache
async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
    if (cached) return cached;
    if (fallbackUrl) {
      const shell = await caches.match(fallbackUrl);
      if (shell) return shell;
    }
    throw err;
  }
}

// Cache dulu (cepat), diam-diam diperbarui di belakang layar
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Halaman utama
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, './index.html'));
    return;
  }

  // API teks Qur'an & terjemahan
  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(
      networkFirst(request, API_CACHE).then((res) => { trimCache(API_CACHE, MAX_API_ENTRIES); return res; })
    );
    return;
  }

  // Font Google
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // File statis milik sendiri (ikon, manifest, dll)
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  // Audio & lainnya: biarkan browser menangani sendiri
});
