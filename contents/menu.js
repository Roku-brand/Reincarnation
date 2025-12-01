// 共通オーバーレイメニュー制御
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".menu-overlay");
  const toggle = document.querySelector(".menu-toggle");
  const closeBtn = document.querySelector(".menu-close");

  if (!overlay || !toggle || !closeBtn) return;

  const openMenu = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });
});
