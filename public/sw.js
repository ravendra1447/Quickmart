// Service Worker
self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', () => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', () => {
  // Empty fetch handler to satisfy PWA requirements if needed
});
