// tab-animations.js
// 「人生二周目ノート」共通：タブ遷移アニメーション
// ブランドコンセプト：静けさ × 強さ × OS感

document.addEventListener("DOMContentLoaded", () => {
  const TAB_GROUPS = [
    {
      // 処世術ノート
      rootSelector: ".page-knowledge-notes",
      navSelector: ".notes-tabs",
      buttonSelector: ".notes-tab",
      panelSelector: ".tab-panel",
      activeButtonClass: "is-active",
      activePanelClass: "is-active"
    },
    {
      // 人生体験記ノート
      rootSelector: ".page-life-stories",
      navSelector: ".chapter-tabs",
      buttonSelector: ".chapter-tab",
      panelSelector: ".chapter",
      activeButtonClass: "is-active",
      activePanelClass: "is-active"
    },
    {
      // 世代別ノート
      rootSelector: ".generation-main, .page-generations, .generation-body",
      navSelector: ".stage-tabs",
      buttonSelector: ".stage-tab",
      panelSelector: ".generation-section",
      activeButtonClass: "is-active",
      activePanelClass: "is-visible" // 既存クラスをそのまま利用
    }
  ];

  TAB_GROUPS.forEach(setupTabGroup);
});

/**
 * タブグループの初期化
 */
function setupTabGroup(config) {
  const roots = document.querySelectorAll(config.rootSelector);
  if (!roots.length) return;

  roots.forEach(root => {
    const nav = root.querySelector(config.navSelector);
    const buttons = Array.from(root.querySelectorAll(config.buttonSelector));
    const panels = Array.from(root.querySelectorAll(config.panelSelector));

    if (!nav || buttons.length === 0 || panels.length === 0) return;

    // インジケーター要素の準備
    let indicator = nav.querySelector(".tab-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "tab-indicator";
      nav.appendChild(indicator);
    }

    const ANIM_DURATION = 200; // ms

    // 初期状態の設定
    function initState() {
      let activeButton =
        buttons.find(btn => btn.classList.contains(config.activeButtonClass)) || buttons[0];

      if (!activeButton) return;

      buttons.forEach(btn => {
        btn.classList.toggle(config.activeButtonClass, btn === activeButton);
      });

      const targetId =
        activeButton.dataset.target ||
        activeButton.dataset.tabTarget ||
        activeButton.getAttribute("data-tab-target");

      let activePanel = targetId
        ? panels.find(panel => panel.id === targetId)
        : panels[buttons.indexOf(activeButton)];

      if (!activePanel) {
        activePanel = panels[0];
      }

      panels.forEach(panel => {
        const isActive = panel === activePanel;
        panel.classList.toggle(config.activePanelClass, isActive);
        panel.classList.toggle("is-active", isActive); // CSS 共通クラス
        panel.classList.remove("is-leaving");
        if (isActive) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "hidden");
        }
      });

      updateTabIndicator(nav, indicator, activeButton);
    }

    initState();

    // クリックイベント
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains(config.activeButtonClass)) return;
        switchTab(nav, indicator, buttons, panels, btn, config, ANIM_DURATION);
      });
    });

    // リサイズ時にもインジケーター位置を更新
    window.addEventListener("resize", () => {
      const activeButton =
        buttons.find(b => b.classList.contains(config.activeButtonClass)) || buttons[0];
      if (activeButton) {
        updateTabIndicator(nav, indicator, activeButton);
      }
    });
  });
}

/**
 * タブ切り替え
 */
function switchTab(nav, indicator, buttons, panels, nextButton, config, duration) {
  const currentButton = buttons.find(btn => btn.classList.contains(config.activeButtonClass));
  if (currentButton === nextButton) return;

  const targetId =
    nextButton.dataset.target ||
    nextButton.dataset.tabTarget ||
    nextButton.getAttribute("data-tab-target");

  let nextPanel = targetId
    ? panels.find(panel => panel.id === targetId)
    : panels[buttons.indexOf(nextButton)];

  if (!nextPanel) {
    nextPanel = panels[0];
  }

  const currentPanel =
    panels.find(panel => panel.classList.contains(config.activePanelClass)) ||
    panels.find(panel => panel.classList.contains("is-active"));

  // ボタンのアクティブ状態切り替え
  buttons.forEach(btn => {
    btn.classList.toggle(config.activeButtonClass, btn === nextButton);
  });

  // 旧パネルをフェードアウト
  if (currentPanel && currentPanel !== nextPanel) {
    currentPanel.classList.add("is-leaving");
    currentPanel.classList.remove(config.activePanelClass, "is-active");
    setTimeout(() => {
      currentPanel.classList.remove("is-leaving");
      currentPanel.setAttribute("hidden", "hidden");
    }, duration);
  }

  // 新パネルをフェードイン
  if (nextPanel) {
    nextPanel.removeAttribute("hidden");
    nextPanel.classList.add(config.activePanelClass, "is-active");
    nextPanel.classList.remove("is-leaving");
  }

  // インジケーター更新
  updateTabIndicator(nav, indicator, nextButton);
}

/**
 * インジケーターの位置と幅を更新
 */
function updateTabIndicator(nav, indicator, activeButton) {
  if (!nav || !indicator || !activeButton) return;

  const navRect = nav.getBoundingClientRect();
  const btnRect = activeButton.getBoundingClientRect();

  const x = btnRect.left - navRect.left;
  const width = btnRect.width;

  nav.style.setProperty("--tab-indicator-x", `${x}px`);
  nav.style.setProperty("--tab-indicator-width", `${width}px`);
}
