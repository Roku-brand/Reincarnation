// Service Worker for 人生二周目録
// PWA機能を提供するための基本的なService Worker

const CACHE_NAME = 'reincarnation-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.webmanifest',
  './contents/generations.html',
  './contents/knowledge-notes.html',
  './contents/life-stories.html',
  './contents/user-notes.html',
  './contents/concept.html',
  './contents/base.css',
  './contents/generations.css',
  './contents/knowledge-notes.css',
  './contents/life-stories.css',
  './contents/user-notes.css',
  './contents/concept.css',
  './contents/generations.js',
  './contents/knowledge-notes.js',
  './contents/life-stories.js',
  './contents/user-notes.js',
  './contents/concept.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// インストール時にキャッシュを作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache addAll failed:', err);
      })
  );
});

// アクティベーション時に古いキャッシュを削除
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

// フェッチイベント：キャッシュファーストの戦略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }
        
        // キャッシュがなければネットワークから取得
        return fetch(event.request)
          .then(response => {
            // レスポンスが無効な場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // ネットワークエラー時の処理（オフライン対応）
            return new Response('オフラインです', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
