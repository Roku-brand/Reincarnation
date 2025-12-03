// =====================================================
// 人生地図禄（generations.js）
// -----------------------------------------------------
// ・左サイドの .stage-tab をクリックしてチャプター切り替え
// ・≪トップ≫：全体マップ表示（JSONなし）
// ・各チャプター：data/<stage>.json から7部構成で描画
//
// JSON仕様（既存ファイルに合わせる）
//
// {
//   "id": "university",
//   "title": "大学・専門期（18〜22歳）",
//   "overview": "・・・",
//   "essence": ["...", "..."],
//   "commonPaths": [{ "label": "...", "desc": "..." }],
//   "pains": ["...", "..."],
//   "insights": [
//     { "title": "...", "abstract": "...", "action": "..." }
//   ],
//   "choices": [
//     { "title": "...", "insight": "..." }
//   ],
//   "finalLine": "・・・"
// }
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  // ----- ビュー切り替え用 -----
  const topView = document.getElementById("top-view");
  const chapterView = document.getElementById("chapter-view");

  // ----- 7部構成 各パネルのDOM -----
  const overviewHeadingEl = document.getElementById("overviewHeading");
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

  // ステージマップ（チャプター名をタブのラベルから取る）
  const stageLabelMap = {};
  stageTabs.forEach((tab) => {
    const stage = tab.getAttribute("data-stage");
    if (!stage) return;
    const raw = tab.textContent.trim();
    // 「1. 小学生」「5. 社会人前期（22〜28歳）」 → 数字・カッコを取って本体だけ
    const noNumber = raw.replace(/^\d+\.\s*/, "");
    const label = noNumber.replace(/（.*?）/g, "");
    stageLabelMap[stage] = label;
  });

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
    if (overviewHeadingEl) {
      const label = stageLabelMap[stage] || "チャプター概要";
      overviewHeadingEl.textContent = label;
    }
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
        renderChapter(data, stage);
      })
      .catch((err) => {
        console.error(err);
        renderError(url, stage);
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
   * 既存 JSON の配列・オブジェクトを
   * 「ヘッダーの要点サマリ＋パネル内の詳細」に分けてはめ込む
   */
  function renderChapter(data, stage) {
    const overview = data.overview || "";
    const essenceArr = Array.isArray(data.essence) ? data.essence : [];
    const pathsArr = Array.isArray(data.commonPaths) ? data.commonPaths : [];
    const painsArr = Array.isArray(data.pains) ? data.pains : [];
    const insightsArr = Array.isArray(data.insights) ? data.insights : [];
    const choicesArr = Array.isArray(data.choices) ? data.choices : [];
    const finalLine = data.finalLine || "";

    // ---------- ① チャプター概要 ----------
    if (overviewHeadingEl) {
      const labelFromTab = stageLabelMap[stage];
      const heading =
        labelFromTab ||
        (data.title
          ? String(data.title).replace(/（.*?）/g, "")
          : "チャプター概要");
      overviewHeadingEl.textContent = heading;
    }

    if (overviewTextEl) {
      overviewTextEl.textContent =
        overview || "このステージの概要は準備中です。";
    }

    // ---------- ② 本質 ----------
    // ヘッダーのタイトルにサマリ（例：本質 世界が狭い、承認と安心、興味の芽）
    const essenceSummary = buildSummaryFromArray(essenceArr, 3);
    setAccordionTitleSummary("essence", essenceSummary, "② 本質");

    if (essenceTextEl) {
      if (essenceArr.length === 0) {
        essenceTextEl.textContent =
          "このステージの本質は順次追記していきます。";
      } else {
        essenceTextEl.innerHTML = essenceArr
          .map((t) => "・" + escapeHtml(t))
          .join("<br>");
      }
    }

    // ---------- ③ 分岐パターン ----------
    const branchSummary = buildSummaryFromLabels(pathsArr, 3);
    setAccordionTitleSummary("branches", branchSummary, "③ 分岐パターン");

    if (branchesTextEl) {
      if (pathsArr.length === 0) {
        branchesTextEl.textContent =
          "このステージのよくある分岐パターンは準備中です。";
      } else {
        branchesTextEl.innerHTML = pathsArr
          .map((p) => {
            const label = p.label ? `【${escapeHtml(p.label)}】` : "";
            const desc = p.desc ? escapeHtml(p.desc) : "";
            return "・" + label + (label && desc ? " " : "") + desc;
          })
          .join("<br>");
      }
    }

    // ---------- ④ 迷い・不安・つまずき ----------
    const painsSummary = buildSummaryFromArray(painsArr, 3);
    setAccordionTitleSummary("pains", painsSummary, "④ 迷い・不安・つまずき");

    if (painsTextEl) {
      if (painsArr.length === 0) {
        painsTextEl.textContent =
          "このステージで生まれやすい迷い・不安は順次追加します。";
      } else {
        painsTextEl.innerHTML = painsArr
          .map((t) => "・" + escapeHtml(t))
          .join("<br>");
      }
    }

    // ---------- ⑤ 二周目視点（抽象）＋処世術（具体） ----------
    const insightTitles = insightsArr
      .map((ins) => ins.title)
      .filter((t) => t && String(t).trim() !== "");
    const coreSummary = buildSummaryFromArray(insightTitles, 3);
    setAccordionTitleSummary("secondRound", coreSummary, "⑤ 二周目視点＋処世術");

    if (insightsArr.length === 0) {
      if (secondRoundTextEl) {
        secondRoundTextEl.textContent =
          "二周目視点での抽象的な理解は準備中です。";
      }
      if (solutionsTextEl) {
        solutionsTextEl.textContent =
          "生活レベルでの処世術は順次追加していきます。";
      }
    } else {
      if (secondRoundTextEl) {
        const abstractLines = insightsArr.map((ins) => {
          const title = ins.title ? `【${ins.title}】` : "";
          const abs = ins.abstract || "";
          return (
            title +
            (title && abs ? " " : "") +
            (abs ? escapeHtml(abs) : "")
          );
        });
        secondRoundTextEl.innerHTML = abstractLines
          .filter((s) => s.trim() !== "")
          .map((s) => "・" + s)
          .join("<br>");
      }

      if (solutionsTextEl) {
        const actionLines = insightsArr.map((ins) => {
          const title = ins.title ? `【${ins.title}】` : "";
          const act = ins.action || "";
          return (
            title +
            (title && act ? " " : "") +
            (act ? escapeHtml(act) : "")
          );
        });
        solutionsTextEl.innerHTML = actionLines
          .filter((s) => s.trim() !== "")
          .map((s) => "・" + s)
          .join("<br>");
      }
    }

    // ---------- ⑥ 選択のコンパス ----------
    const choiceTitles = choicesArr
      .map((c) => c.title)
      .filter((t) => t && String(t).trim() !== "");
    const compassSummary = buildSummaryFromArray(choiceTitles, 2);
    setAccordionTitleSummary("compass", compassSummary, "⑥ 選択のコンパス");

    if (compassTextEl) {
      if (choicesArr.length === 0) {
        compassTextEl.textContent =
          "代表的な二択・迷いに対するコンパスは準備中です。";
      } else {
        compassTextEl.innerHTML = choicesArr
          .map((c) => {
            const title = c.title ? `Q. ${escapeHtml(c.title)}` : "";
            const insight = c.insight ? escapeHtml(c.insight) : "";
            if (!title && !insight) return "";
            return (
              "・" +
              title +
              (title && insight ? "<br>　→ " : "") +
              (!title && insight ? "→ " : "") +
              insight
            );
          })
          .filter((s) => s.trim() !== "")
          .join("<br><br>");
      }
    }

    // ---------- ⑦ 最後の一言 ----------
    if (finalLineTextEl) {
      finalLineTextEl.textContent =
        finalLine || "このステージの「最後の一言」はこれから整えていきます。";
    }
  }

  /**
   * 読み込みエラー時
   */
  function renderError(filePath, stage) {
    if (overviewHeadingEl) {
      const labelFromTab = stageLabelMap[stage] || "チャプター概要";
      overviewHeadingEl.textContent = labelFromTab;
    }

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

  /**
   * 指定のセクション（data-key）に対して、
   * タイトル行に「ベースラベル + サマリ」を設定
   * 例：② 本質 世界が狭い、承認と安心、興味の芽
   */
  function setAccordionTitleSummary(sectionKey, summary, fallbackBase) {
    const section = document.querySelector(
      `.chapter-section.accordion[data-key="${sectionKey}"]`
    );
    if (!section) return;
    const titleEl = section.querySelector(".accordion-title");
    if (!titleEl) return;

    const base = titleEl.dataset.base || fallbackBase || titleEl.textContent;
    if (!summary) {
      titleEl.textContent = base;
    } else {
      titleEl.textContent = `${base}　${summary}`;
    }
  }

  /**
   * 配列から、先頭N件を「、」区切りでまとめたサマリを作成
   */
  function buildSummaryFromArray(arr, maxCount) {
    const list = (arr || [])
      .map((t) => String(t || "").trim())
      .filter((t) => t !== "");
    if (!list.length) return "";
    const sliced = list.slice(0, maxCount);
    return sliced.join("、");
  }

  /**
   * commonPaths[] から label だけ取り出してサマリを作成
   */
  function buildSummaryFromLabels(paths, maxCount) {
    const list = (paths || [])
      .map((p) => (p && p.label ? String(p.label).trim() : ""))
      .filter((t) => t !== "");
    if (!list.length) return "";
    const sliced = list.slice(0, maxCount);
    return sliced.join("、");
  }

  /**
   * HTMLエスケープ（ざっくり）
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
