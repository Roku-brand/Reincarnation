// =====================================================
// 人生地図禄（generations.js）
// -----------------------------------------------------
// ・左サイドの .stage-tab をクリックしてチャプター切り替え
// ・≪トップ≫：全体マップ表示（JSONなし）
// ・各チャプター：data/<stage>.json から7部構成で描画
// ・JSON仕様：
//
// {
//   "title": "大学・専門生期",
//   "overview": "自立と選択の幅が一気に広がる時期。",
//   "essence": "本質テキスト",
//   "branches": "分岐ポイントテキスト",
//   "pains": "迷い・不安テキスト",
//   "secondRound": "二周目視点（抽象）",
//   "solutions": "処世術（具体）",
//   "compass": "選択のコンパス（Q&A形式）",
//   "finalLine": "最後の一言"
// }
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  // ----- HERO（チャプター名＋サブコメント） -----
  const heroTitleEl = document.getElementById("chapter-title");
  const heroSubtitleEl = document.getElementById("chapter-subtitle");

  const DEFAULT_TITLE = "人生地図禄";
  const DEFAULT_SUBTITLE =
    "人生を 8 つのチャプターに分けて、二周目視点で「詰まりやすい構造」を見える化します。一歩先の人生フェーズが見えれば、賢い選択ができる。";

  // ----- ビュー切り替え用 -----
  const topView = document.getElementById("top-view");
  const chapterView = document.getElementById("chapter-view");

  // ----- 7部構成 各パネルのDOM -----
  const overviewTextEl = document.getElementById("overviewText");
  const essenceTextEl = document.getElementById("essenceText");
  const branchesTextEl = document.getElementById("branchesText");
  const painsTextEl = document.getElementById("painsText");
  const secondRoundTextEl = document.getElementById("secondRoundText");
  const solutionsTextEl = document.getElementById("solutionsText");
  const compassTextEl = document.getElementById("compassText");
  const finalLineTextEl = document.getElementById("finalLineText");

  // ----- サイドタブ -----
  const stageTabs = Array.from(document.querySelectorAll(".stage-tab"));

  // 利用するステージ一覧（ファイル名もこれに準拠）
  const validStages = [
    "top",
    "elementary",
    "middle",
    "high",
    "university",
    "earlyCareer",
    "midCareer",
    "lateCareer",
    "secondCareer",
  ];

  // URLパラメータから初期ステージを決定
  const initialStageFromQuery = getStageFromQuery();
  let currentStage = validStages.includes(initialStageFromQuery)
    ? initialStageFromQuery
    : "top";

  // アコーディオン初期化（2〜6セクション）
  initAccordions();

  // サイドタブクリック
  stageTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const stage = tab.getAttribute("data-stage");
      if (!stage || stage === currentStage) return;
      setStage(stage, true);
    });
  });

  // 初期表示
  setStage(currentStage, false);

  // =====================================================
  // 関数定義
  // =====================================================

  function getStageFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("stage") || "";
  }

  /**
   * ステージ切り替えメイン
   * @param {string} stage
   * @param {boolean} updateUrl
   */
  function setStage(stage, updateUrl) {
    if (!validStages.includes(stage)) stage = "top";
    currentStage = stage;

    // タブの見た目更新
    highlightStageTab(stage);

    // URLの ?stage= を同期
    if (updateUrl) {
      syncUrl(stage);
    }

    // ≪トップ≫ の場合は JSON を読まず、マップを表示
    if (stage === "top") {
      showTopView();
      return;
    }

    // チャプター表示に切り替え
    showChapterView();

    // JSON 読み込み
    const url = `data/${stage}.json`;

    // 軽いローディング表示（概要だけ）
    if (overviewTextEl) {
      overviewTextEl.textContent = "このチャプターの構造を読み込んでいます…";
    }
    if (essenceTextEl) essenceTextEl.textContent = "";
    if (branchesTextEl) branchesTextEl.textContent = "";
    if (painsTextEl) painsTextEl.textContent = "";
    if (secondRoundTextEl) secondRoundTextEl.textContent = "";
    if (solutionsTextEl) solutionsTextEl.textContent = "";
    if (compassTextEl) compassTextEl.textContent = "";
    if (finalLineTextEl) finalLineTextEl.textContent = "";

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`JSON 読み込みエラー: ${url}`);
        }
        return res.json();
      })
      .then((data) => {
        renderChapter(data);
      })
      .catch((err) => {
        console.error(err);
        renderError(url);
      });
  }

  /**
   * タブのアクティブ状態更新
   */
  function highlightStageTab(stage) {
    stageTabs.forEach((tab) => {
      const key = tab.getAttribute("data-stage");
      const isActive = key === stage;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  /**
   * URL の ?stage= を同期
   */
  function syncUrl(stage) {
    const url = new URL(window.location.href);
    if (stage === "top") {
      url.searchParams.delete("stage");
    } else {
      url.searchParams.set("stage", stage);
    }
    window.history.replaceState({}, "", url.toString());
  }

  /**
   * ≪トップ≫ビュー表示
   */
  function showTopView() {
    // HERO をデフォルトに戻す
    if (heroTitleEl) heroTitleEl.textContent = DEFAULT_TITLE;
    if (heroSubtitleEl) heroSubtitleEl.textContent = DEFAULT_SUBTITLE;

    if (topView) {
      topView.classList.add("is-visible");
      topView.setAttribute("aria-hidden", "false");
    }
    if (chapterView) {
      chapterView.classList.remove("is-visible");
      chapterView.setAttribute("aria-hidden", "true");
    }
  }

  /**
   * チャプター7部構成ビュー表示
   */
  function showChapterView() {
    if (topView) {
      topView.classList.remove("is-visible");
      topView.setAttribute("aria-hidden", "true");
    }
    if (chapterView) {
      chapterView.classList.add("is-visible");
      chapterView.setAttribute("aria-hidden", "false");
    }
  }

  /**
   * JSON から 7部構成ビューを描画
   */
  function renderChapter(data) {
    const title = data.title || DEFAULT_TITLE;
    const overview = data.overview || "";
    const essence = data.essence || "";
    const branches = data.branches || "";
    const pains = data.pains || "";
    const secondRound = data.secondRound || "";
    const solutions = data.solutions || "";
    const compass = data.compass || "";
    const finalLine = data.finalLine || "";

    // HERO（チャプター名＋一行概要）
    if (heroTitleEl) heroTitleEl.textContent = title;
    if (heroSubtitleEl)
      heroSubtitleEl.textContent =
        overview || "このチャプターの概要は順次追加していきます。";

    // ① チャプター概要
    if (overviewTextEl)
      overviewTextEl.textContent =
        overview || "このステージの概要は準備中です。";

    // ② 本質
    if (essenceTextEl)
      essenceTextEl.textContent =
        essence || "このステージの本質は順次追記していきます。";

    // ③ 分岐パターン
    if (branchesTextEl)
      branchesTextEl.textContent =
        branches || "このステージのよくある分岐パターンは準備中です。";

    // ④ 迷い・不安・つまずき
    if (painsTextEl)
      painsTextEl.textContent =
        pains || "このステージで生まれやすい迷い・不安は順次追加します。";

    // ⑤ 二周目視点（抽象）
    if (secondRoundTextEl)
      secondRoundTextEl.textContent =
        secondRound || "二周目視点での抽象的な理解は準備中です。";

    // ⑤ 処世術（具体）
    if (solutionsTextEl)
      solutionsTextEl.textContent =
        solutions || "生活レベルでの処世術は順次追加していきます。";

    // ⑥ 選択のコンパス
    if (compassTextEl)
      compassTextEl.textContent =
        compass || "代表的な二択・迷いに対するコンパスは準備中です。";

    // ⑦ 最後の一言
    if (finalLineTextEl)
      finalLineTextEl.textContent =
        finalLine || "このステージの「最後の一言」はこれから整えていきます。";
  }

  /**
   * 読み込みエラー時
   */
  function renderError(filePath) {
    // HEROはとりあえずデフォルトに近い状態を出しておく
    if (heroTitleEl) heroTitleEl.textContent = "データを読み込めませんでした";
    if (heroSubtitleEl)
      heroSubtitleEl.textContent = `ファイル構成（${filePath}）を確認してください。`;

    if (overviewTextEl)
      overviewTextEl.textContent =
        "このステージの詳細データは、まだ人生地図に反映されていません。";

    if (essenceTextEl) essenceTextEl.textContent = "";
    if (branchesTextEl) branchesTextEl.textContent = "";
    if (painsTextEl) painsTextEl.textContent = "";
    if (secondRoundTextEl) secondRoundTextEl.textContent = "";
    if (solutionsTextEl) solutionsTextEl.textContent = "";
    if (compassTextEl) compassTextEl.textContent = "";
    if (finalLineTextEl) finalLineTextEl.textContent = "";
  }

  /**
   * アコーディオン初期化
   * （DOMは固定なので1回だけ設定すればOK）
   */
  function initAccordions() {
    const accordions = document.querySelectorAll(".chapter-section.accordion");

    accordions.forEach((section) => {
      const header = section.querySelector(".accordion-header");
      const panel = section.querySelector(".accordion-panel");
      if (!header || !panel) return;

      // 初期は閉じる
      panel.style.maxHeight = "0px";

      header.addEventListener("click", () => {
        const isOpen = section.classList.contains("open");
        if (isOpen) {
          section.classList.remove("open");
          panel.style.maxHeight = "0px";
        } else {
          section.classList.add("open");
          const inner = panel.querySelector(".accordion-inner");
          const targetHeight = inner ? inner.scrollHeight : 0;
          panel.style.maxHeight = `${targetHeight}px`;
        }
      });
    });
  }
});
