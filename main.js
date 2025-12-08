// main.js
// 全ページ共通：.scroll-panel に巻物風の開閉アニメーションを付与

document.addEventListener("DOMContentLoaded", () => {
  const panels = document.querySelectorAll(".scroll-panel");
  if (!panels.length) return;

  panels.forEach((panel) => {
    // 初期状態：CSS側で max-height: 0 / opacity: 0
    // レイアウト確定後に is-open を付けることで、巻物がスッと開く
    requestAnimationFrame(() => {
      panel.classList.add("is-open");
    });
  });
});

// Service Worker登録（PWA対応）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // ルートディレクトリからの相対パスを計算
    const path = window.location.pathname;
    const swPath = path.includes('/contents/') ? '../sw.js' : './sw.js';
    
    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}
