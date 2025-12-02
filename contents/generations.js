// 世代別ノートページ用スクリプト
// - ≪トップ≫ タブと 8 ステージの切り替え
// - JSON から 7 部構成 UI を自動描画

document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".stage-tab"));
  const topView = document.getElementById("top-view");
  const stageView = document.getElementById("stage-view");
  const stageContent = document.getElementById("stage-content");

  if (!stageContent) return;

  // URL パラメータから初期ステージを取得
  const params = new URLSearchParams(window.location.search);
  let currentStage = params.get("stage") || "top";

  // タブのアクティブ状態を更新
  function setActiveTab(stage) {
    tabs.forEach((tab) => {
      const s = tab.getAttribute("data-stage");
      if (s === stage) {
        tab.classList.add("is-active");
      } else {
        tab.classList.remove("is-active");
      }
    });
  }

  // ビューの表示・非表示
  function showTopView() {
    topView.classList.add("is-visible");
    topView.setAttribute("aria-hidden", "false");
    stageView.classList.remove("is-visible");
    stageView.setAttribute("aria-hidden", "true");
  }

  function showStageView() {
    topView.classList.remove("is-visible");
    topView.setAttribute("aria-hidden", "true");
    stageView.classList.add("is-visible");
    stageView.setAttribute("aria-hidden", "false");
  }

  // URL の stage パラメータを更新
  function updateUrl(stage) {
    const url = new URL(window.location.href);
    url.searchParams.set("stage", stage);
    window.history.replaceState({}, "", url.toString());
  }

  // ステージを切り替えるメイン関数
  function setStage(stage, shouldUpdateUrl = true) {
    currentStage = stage;
    setActiveTab(stage);

    if (stage === "top") {
      showTopView();
      // JSON は読み込まない
      if (shouldUpdateUrl) updateUrl("top");
      return;
    }

    showStageView();
    if (shouldUpdateUrl) updateUrl(stage);
    loadStageData(stage);
  }

  // ローディングメッセージ表示
  function showMessage(text) {
    stageContent.innerHTML = `<p class="stage-message">${text}</p>`;
  }

  // JSON 読み込み
  function loadStageData(stage) {
    showMessage("このステージの構造を読み込んでいます…");

    // contents/generations.html から見た相対パス
    const url = `data/${stage}.json`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`JSON 読み込みエラー: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        renderStage(data);
      })
      .catch((err) => {
        console.error(err);
        showMessage("データの読み込みに失敗しました。しばらくしてからもう一度試してください。");
      });
  }

  // ステージ UI を描画（7 部構成）
  function renderStage(data) {
    // データが不足していても落ちないようにデフォルトを用意
    const title = data.title || "このステージ";
    const overview = data.overview || "";
    const essence = Array.isArray(data.essence) ? data.essence : [];
    const commonPaths = Array.isArray(data.commonPaths) ? data.commonPaths : [];
    const pains = Array.isArray(data.pains) ? data.pains : [];
    const insights = Array.isArray(data.insights) ? data.insights : [];
    const choices = Array.isArray(data.choices) ? data.choices : [];
    const finalLine = data.finalLine || "";

    // 各配列を HTML に変換
    const essenceHtml = essence
      .map(
        (item) => `
      <div class="essence-item">${escapeHtml(item)}</div>
    `
      )
      .join("");

    const commonPathsHtml = commonPaths
      .map(
        (p) => `
      <div class="common-path-item">
        <div class="common-path-label">${escapeHtml(p.label || "")}</div>
        <p class="common-path-desc">${escapeHtml(p.desc || "")}</p>
      </div>
    `
      )
      .join("");

    const painsHtml = pains
      .map(
        (p) => `
      <div class="pain-item">${escapeHtml(p)}</div>
    `
      )
      .join("");

    const insightsHtml = insights
      .map(
        (it) => `
      <article class="insight-item">
        <h3 class="insight-title">${escapeHtml(it.title || "")}</h3>
        <p class="insight-abstract">${escapeHtml(it.abstract || "")}</p>
        <p class="insight-action">${escapeHtml(it.action || "")}</p>
      </article>
    `
      )
      .join("");

    const choicesHtml = choices
      .map(
        (c) => `
      <article class="choice-item">
        <h3 class="choice-title">${escapeHtml(c.title || "")}</h3>
        <p class="choice-insight">${escapeHtml(c.insight || "")}</p>
      </article>
    `
      )
      .join("");

    // 7 部構成 UI を組み立て
    const html = `
      <header class="generation-hero">
        <h1 class="generation-title">${escapeHtml(title)}</h1>
        <p class="generation-lead">
          このステージで起こりがちな構造を、二周目視点で整理します。
        </p>
      </header>

      <!-- ① 概要 -->
      <section class="stage-overview">
        <p class="stage-overview-label">概要</p>
        <p class="stage-overview-text">${escapeHtml(overview)}</p>
      </section>

      <!-- ② Essence -->
      <section class="stage-section accordion" data-section="essence">
        <button class="accordion-header" type="button">
          <div class="accordion-title-wrap">
            <span class="accordion-title">本質</span>
            <span class="accordion-sub">このステージの内側にある3つの構造</span>
          </div>
          <span class="accordion-icon">›</span>
        </button>
        <div class="accordion-panel">
          <div class="accordion-inner">
            <div class="essence-list">
              ${essenceHtml || "<p>データがまだ登録されていません。</p>"}
            </div>
          </div>
        </div>
      </section>

      <!-- ③ Common Paths -->
      <section class="stage-section accordion" data-section="paths">
        <button class="accordion-header" type="button">
          <div class="accordion-title-wrap">
            <span class="accordion-title">分岐パターン</span>
            <span class="accordion-sub">よくある進み方・キャリアの流れ</span>
          </div>
          <span class="accordion-icon">›</span>
        </button>
        <div class="accordion-panel">
          <div class="accordion-inner">
            <div class="common-paths-list">
              ${commonPathsHtml || "<p>データがまだ登録されていません。</p>"}
            </div>
          </div>
        </div>
      </section>

      <!-- ④ Pains -->
      <section class="stage-section accordion" data-section="pains">
        <button class="accordion-header" type="button">
          <div class="accordion-title-wrap">
            <span class="accordion-title">迷い・不安</span>
            <span class="accordion-sub">この時期に出やすい悩み・行き詰まり</span>
          </div>
          <span class="accordion-icon">›</span>
        </button>
        <div class="accordion-panel">
          <div class="accordion-inner">
            <div class="pains-list">
              ${painsHtml || "<p>データがまだ登録されていません。</p>"}
            </div>
          </div>
        </div>
      </section>

      <!-- ⑤ Insights -->
      <section class="stage-section accordion" data-section="insights">
        <button class="accordion-header" type="button">
          <div class="accordion-title-wrap">
            <span class="accordion-title">二周目視点 × 処世術</span>
            <span class="accordion-sub">抽象と具体をつなぐ「見方」と「動き方」</span>
          </div>
          <span class="accordion-icon">›</span>
        </button>
        <div class="accordion-panel">
          <div class="accordion-inner">
            <div class="insights-list">
              ${insightsHtml || "<p>データがまだ登録されていません。</p>"}
            </div>
          </div>
        </div>
      </section>

      <!-- ⑥ Choices -->
      <section class="stage-section accordion" data-section="choices">
        <button class="accordion-header" type="button">
          <div class="accordion-title-wrap">
            <span class="accordion-title">選択のコンパス</span>
            <span class="accordion-sub">よく迷う分岐に対する「軸」のヒント</span>
          </div>
          <span class="accordion-icon">›</span>
        </button>
        <div class="accordion-panel">
          <div class="accordion-inner">
            <div class="choices-list">
              ${choicesHtml || "<p>データがまだ登録されていません。</p>"}
            </div>
          </div>
        </div>
      </section>

      <!-- ⑦ Final Line -->
      <section class="stage-final">
        <p class="stage-final-label">指針一言</p>
        <p class="stage-final-text">${escapeHtml(finalLine)}</p>
      </section>
    `;

    stageContent.innerHTML = html;
    initAccordions();
  }

  // アコーディオンの初期化
  function initAccordions() {
    const sections = Array.from(stageContent.querySelectorAll(".stage-section"));

    sections.forEach((section) => {
      const header = section.querySelector(".accordion-header");
      const panel = section.querySelector(".accordion-panel");
      if (!header || !panel) return;

      // 初期状態は閉
      panel.style.maxHeight = "0px";

      header.addEventListener("click", () => {
        const isOpen = section.classList.contains("is-open");

        if (isOpen) {
          section.classList.remove("is-open");
          panel.style.maxHeight = "0px";
        } else {
          section.classList.add("is-open");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }

  // シンプルなエスケープ処理
  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // タブクリックイベント
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const stage = tab.getAttribute("data-stage");
      if (!stage || stage === currentStage) return;
      setStage(stage, true);
    });
  });

  // 初期表示ステージを反映
  setStage(currentStage, false);
});
