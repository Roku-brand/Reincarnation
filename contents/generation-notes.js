// タブ切り替え
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".stage-tab");
  const panels = {
    overview: document.getElementById("stage-overview"),
    elementary: document.getElementById("stage-elementary"),
    junior: document.getElementById("stage-junior"),
    high: document.getElementById("stage-high"),
    college: document.getElementById("stage-college"),
    early: document.getElementById("stage-early"),
    mid: document.getElementById("stage-mid"),
    late: document.getElementById("stage-late"),
    second: document.getElementById("stage-second")
  };

  function activateStage(stageKey) {
    // タブ
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.stage === stageKey);
    });

    // パネル
    Object.entries(panels).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle("active", key === stageKey);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const stage = tab.dataset.stage;
      activateStage(stage);
      // 上部までスクロール（モバイル用）
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // 「トップに戻る」ボタン
  const backBtn = document.querySelector(".back-to-top");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      activateStage("overview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // メニューオーバーレイ
  const menuToggle = document.getElementById("menuToggle");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuClose = document.getElementById("menuClose");

  if (menuToggle && menuOverlay && menuClose) {
    menuToggle.addEventListener("click", () => {
      menuOverlay.classList.add("active");
    });
    menuClose.addEventListener("click", () => {
      menuOverlay.classList.remove("active");
    });
    menuOverlay.addEventListener("click", e => {
      if (e.target === menuOverlay) {
        menuOverlay.classList.remove("active");
      }
    });
  }
});
