// =====================================================
// 世代別ノート ページ用スクリプト（generations.js）
// -----------------------------------------------------
// ・タブ (.stage-tab) クリックでステージを切り替え
// ・≪トップ≫ タブのときは topView を表示、他は stageView を表示
// ・?stage=elementary などの URL パラメータとも連動
// ・ステージ詳細は data/<stage>.json から読み込み（なければメッセージ表示）
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  // ----- DOM 取得 -----
  const tabs = Array.from(document.querySelectorAll(".stage-tab"));

  // これらの要素は generations.html 側に用意してある前提
  const topView = document.getElementById("top-view");          // トップ用コンテンツ
  const stageView = document.getElementById("stage-view");      // ステージ詳細コンテンツのラッパ
  const stageTitle = document.getElementById("stage-title");    // ステージタイトル
  const stageLead = document.getElementById("stage-lead");      // リード文
  const stageContent = document.getElementById("stage-content");// メインコンテンツ
  const stageMeta = document.getElementById("stage-meta");      // 補足・メタ情報など

  if (!tabs.length) return;

  // ----- 有効なステージ一覧 -----
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

  // ----- URL パラメータから初期ステージ取得 -----
  const params = new URLSearchParams(window.location.search);
  let currentStage = params.get("stage") || "top";
  if (!validStages.includes(currentStage)) {
    currentStage = "top";
  }

  // =====================================================
  //  ステージ切り替えのメイン関数
  // =====================================================
  function setStage(stage, updateUrl) {
    if (!validStages.includes(stage)) stage = "top";
    currentStage = stage;

    // タブの見た目更新
    updateActiveTab(stage);

    // URL 更新（ヒストリーは書き換えのみ）
    if (updateUrl) {
      syncUrl(stage);
    }

    // 表示切り替え
    if (stage === "top") {
      // トップ
      if (topView) topView.hidden = false;
      if (stageView) stageView.hidden = true;
      return;
    } else {
      if (topView) topView.hidden = true;
      if (stageView) stageView.hidden = false;
    }

    // ステージ詳細を読み込み
    loadStageData(stage);
  }

  // =====================================================
  //  タブのアクティブ状態更新
  // =====================================================
  function updateActiveTab(stage) {
    tabs.forEach((tab) => {
      const s = tab.getAttribute("data-stage");
      const isActive = s === stage;
      tab.classList.toggle("is-active", isActive);
      tab.classList.toggle("gen-tab-active", isActive); // CSS側で使っている場合に備えて両方
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  // =====================================================
  //  URL の ?stage= を同期
  // =====================================================
  function syncUrl(stage) {
    const url = new URL(window.location.href);
    if (stage === "top") {
      url.searchParams.delete("stage");
    } else {
      url.searchParams.set("stage", stage);
    }
    window.history.replaceState({}, "", url.toString());
  }

  // =====================================================
  //  メッセージ表示（ステージコンテンツ部）
  // =====================================================
  function showMessage(text) {
    if (!stageContent) return;
    stageContent.innerHTML = `<p class="stage-message">${text}</p>`;
    if (stageMeta) {
      stageMeta.innerHTML = "";
    }
  }

  // =====================================================
  //  JSON 読み込み → UI 描画
  // =====================================================
  function loadStageData(stage) {
    if (!stageContent) return;

    showMessage("このステージの構造を読み込んでいます…");

    // contents/generations.html から見た相対パス
    const url = `data/${stage}.json`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`ステージ JSON が見つかりません: ${url}`);
        }
        return res.json();
      })
      .then((data) => {
        renderStage(data, stage);
      })
      .catch((err) => {
        console.error(err);
        showMessage("まだこのステージの詳細データは整理中です。");
      });
  }

  // =====================================================
  //  ステージ UI 描画
  //  期待する JSON のざっくり構造（例）：
  //
  //  {
  //    "stageLabel": "大学・専門期",
  //    "catch": "自由度が一気に高まり、選択肢が爆発するフェーズ",
  //    "lead": "二周目視点で見ると、ここでの選択がその後の10年を左右する。",
  //    "sections": [
  //      { "title": "どんなフェーズか", "items": ["〜〜", "〜〜"] },
  //      { "title": "詰まりやすいポイント", "items": ["〜〜"] },
  //      ...
  //    ],
  //    "meta": {
  //      "typicalPatterns": ["よくある進路パターンA", "パターンB"],
  //      "risks": ["リスク1", "リスク2"],
  //      "keywords": ["キーワード1", "キーワード2"]
  //    }
  //  }
  // =====================================================
  function renderStage(data, stage) {
    if (!stageContent) return;

    const stageLabel =
      data.stageLabel ||
      (tabs.find((t) => t.getAttribute("data-stage") === stage)?.textContent ??
        "");

    const leadText = data.catch || data.lead || "";

    if (stageTitle) {
      stageTitle.textContent = stageLabel;
    }
    if (stageLead) {
      stageLead.textContent = leadText;
    }

    // メインコンテンツをクリア
    stageContent.innerHTML = "";

    // sections を描画
    const sections = Array.isArray(data.sections) ? data.sections : [];
    if (sections.length === 0) {
      // セクションがない場合は summary 的なフィールドをそのまま表示
      const summary = data.summary || "このステージの詳細は順次追加していきます。";
      const section = document.createElement("section");
      section.className = "stage-section";
      section.innerHTML = `<h3 class="stage-section-title">このステージについて</h3>
        <p class="stage-section-text">${summary}</p>`;
      stageContent.appendChild(section);
    } else {
      sections.forEach((sec) => {
        const section = document.createElement("section");
        section.className = "stage-section";

        if (sec.title) {
          const h3 = document.createElement("h3");
          h3.className = "stage-section-title";
          h3.textContent = sec.title;
          section.appendChild(h3);
        }

        if (Array.isArray(sec.items) && sec.items.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "stage-section-list";
          sec.items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
          });
          section.appendChild(ul);
        } else if (sec.text) {
          const p = document.createElement("p");
          p.className = "stage-section-text";
          p.textContent = sec.text;
          section.appendChild(p);
        }

        stageContent.appendChild(section);
      });
    }

    // メタ情報を描画
    if (stageMeta) {
      stageMeta.innerHTML = "";
      const meta = data.meta || {};

      const blocks = [];

      if (Array.isArray(meta.typicalPatterns) && meta.typicalPatterns.length) {
        blocks.push({
          title: "よくある人生パターン",
          items: meta.typicalPatterns,
        });
      }
      if (Array.isArray(meta.risks) && meta.risks.length) {
        blocks.push({
          title: "このフェーズの落とし穴",
          items: meta.risks,
        });
      }
      if (Array.isArray(meta.keywords) && meta.keywords.length) {
        blocks.push({
          title: "キーワード",
          items: meta.keywords,
        });
      }

      if (!blocks.length) return;

      blocks.forEach((block) => {
        const div = document.createElement("div");
        div.className = "stage-meta-block";

        const h4 = document.createElement("h4");
        h4.className = "stage-meta-title";
        h4.textContent = block.title;
        div.appendChild(h4);

        const ul = document.createElement("ul");
        ul.className = "stage-meta-list";
        block.items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        div.appendChild(ul);

        stageMeta.appendChild(div);
      });
    }
  }

  // =====================================================
  //  タブクリックイベント設定
  // =====================================================
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const stage = tab.getAttribute("data-stage");
      if (!stage || stage === currentStage) return;
      setStage(stage, true);
    });
  });

  // =====================================================
  //  初期表示
  // =====================================================
  setStage(currentStage, false);
});
