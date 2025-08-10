const CACHE_NAME = 'paintz-v1';
const urlsToCache = [
  '/',
  '/homepage.html',
  '/index.html',
  '/logo.jpg',
  '/slider1.jpg',
  '/slider2.jpg',
  '/slider3.jpg',
  '/slider4.jpg',
  '/slider5.jpg',
  '/sheshbesh.jpg',
  '/matkot.jpg',
  '/vinyl.jpg',
  '/canvas.jpg',
  '/img/canvas1.jpg',
  '/img/canvas2.jpg',
  '/img/canvas3.jpg',
  '/img/canvas4.jpg',
  '/img/canvas5.jpg',
  '/img/Backgammon1.jpg',
  '/img/Backgammon2.jpg',
  '/img/Backgammon3.jpg',
  '/img/Backgammon4.jpg',
  '/img/Backgammon5.jpg',
  '/img/matka1.jpg',
  '/img/matka2.jpg',
  '/img/matka3.jpg',
  '/img/matka4.jpg',
  '/img/matka5.jpg',
  '/img/img-record1.jpg',
  '/img/img-record2.jpg',
  '/img/img-record3.jpg',
  '/img/img-record4.jpg'
];

// התקנת Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// הפעלת Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// יירוט בקשות רשת
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // אם הקובץ נמצא במטמון, החזר אותו
        if (response) {
          return response;
        }

        // אם לא, נסה לטעון מהרשת
        return fetch(event.request).then(response => {
          // בדוק אם התגובה תקינה
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // שמור תמונות במטמון
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
      .catch(() => {
        // אם אין אינטרנט, נסה להחזיר דף בסיסי
        if (event.request.destination === 'document') {
          return caches.match('/homepage.html');
        }
      })
  );
});
