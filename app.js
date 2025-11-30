
window.scrollTo({ top: 0, behavior: "smooth" });

  // ページごとのMarkdown読み込み（1回目だけ）
  // ページごとのMarkdown読み込み（1回だけ）
if (pageId in sectionMarkdownMap && !loadedSections.has(pageId)) {
const info = sectionMarkdownMap[pageId];
loadMarkdown(info.path, info.targetId);
@@ -56,30 +56,53 @@ document.querySelectorAll(".back-home").forEach(btn => {
});

/* =========================
   ヘッダーメニュー（アコーディオン）
   オーバーレイメニュー
  ========================= */

const menuToggle = document.getElementById("menu-toggle");
const headerMenu = document.getElementById("header-menu");
const menuOverlay = document.getElementById("menu-overlay");
const menuClose = document.getElementById("menu-close");

function openMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.add("open");
  menuOverlay.setAttribute("aria-hidden", "false");
  if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenuIfOpen() {
  if (!headerMenu) return;
  if (headerMenu.classList.contains("open")) {
    headerMenu.classList.remove("open");
    headerMenu.setAttribute("aria-hidden", "true");
  if (!menuOverlay) return;
  if (menuOverlay.classList.contains("open")) {
    menuOverlay.classList.remove("open");
    menuOverlay.setAttribute("aria-hidden", "true");
if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
}
}

if (menuToggle && headerMenu) {
if (menuToggle && menuOverlay) {
menuToggle.addEventListener("click", () => {
    const isOpen = headerMenu.classList.toggle("open");
    headerMenu.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (menuOverlay.classList.contains("open")) {
      closeMenuIfOpen();
    } else {
      openMenu();
    }
  });
}

if (menuClose) {
  menuClose.addEventListener("click", closeMenuIfOpen);
}

// オーバーレイの暗転部分クリックで閉じる
if (menuOverlay) {
  menuOverlay.addEventListener("click", (e) => {
    if (e.target === menuOverlay) {
      closeMenuIfOpen();
    }
});

  // メニュー内のナビアイテム
  headerMenu.querySelectorAll(".nav-item").forEach(btn => {
  // メニュー内のナビボタン
  menuOverlay.querySelectorAll(".nav-item").forEach(btn => {
btn.addEventListener("click", () => {
const targetPage = btn.dataset.go;
if (targetPage) {
@@ -149,14 +172,13 @@ const sectionMarkdownMap = {
}
};

// 一度読み込んだセクションを記録（無駄な再fetch防止）
// 一度読み込んだセクションを記録
const loadedSections = new Set();

/* =========================
  世代別ノート：ボタン → md読み込み
  ========================= */

// 世代 → ファイルパス マップ
const generationMarkdownMap = {
elementary: "contents/generation/elementary.md",
junior: "contents/generation/junior.md",
