// generations.js
// 世代別ノート：JSON を読み込んで 7部構成の UI を動的描画

document.addEventListener("DOMContentLoaded", () => {
  const stageParam = getStageFromQuery() || "university"; // デフォルト：大学・専門期
  const filePath = `data/${stageParam}.json`;

  // タブの active クラス付与
  highlightStageTab(stageParam);

  // JSON を読み込んでレンダリング
  fetch(filePath)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`JSON 読み込みエラー: ${filePath}`);
      }
      return res.json();
    })
    .then((data) => {
      renderGeneration(data);
    })
    .catch((err) => {
      console.error(err);
      showErrorMessage();
    });

  // アコーディオンのイベントは描画後にセットする
});

/**
 * クエリパラメータから stage を取得
 */
function getStageFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("stage");
}

/**
 * ステージタブの active 状態を更新
 */
function highlightStageTab(stage) {
  const tabs = document.querySelectorAll(".stage-tab");
  tabs.forEach((tab) => {
    const key = tab.getAttribute("data-stage");
    if (key === stage) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
}

/**
 * JSON データから UI を構築
 */
function renderGeneration(data) {
  // ① 概要
  const stageTitleEl = document.getElementById("stageTitle");
  const overviewTextEl = document.getElementById("overviewText");

  if (stageTitleEl) stageTitleEl.textContent = data.title || "";
  if (overviewTextEl) overviewTextEl.textContent = data.overview || "";

  // ②〜⑥ アコーディオン描画
  const root = document.getElementById("accordionRoot");
  if (!root) return;

  root.innerHTML = "";

  // ② 本質
  root.appendChild(
    createAccordionSection(
      "本質",
      "このステージの深い構造",
      "essence",
      createEssenceContent(data.essence || [])
    )
  );

  // ③ 分岐パターン
  root.appendChild(
    createAccordionSection(
      "分岐パターン",
      "この時期によく起こる選択の分かれ道",
      "paths",
      createCommonPathsContent(data.commonPaths || [])
    )
  );

  // ④ 迷い・不安
  root.appendChild(
    createAccordionSection(
      "迷い・不安",
      "このステージでよく生まれるモヤモヤ",
      "pains",
      createPainsContent(data.pains || [])
    )
  );

  // ⑤ Insights
  root.appendChild(
    createAccordionSection(
      "二周目視点 × 処世術",
      "抽象と具体で、このステージを軽くする",
      "insights",
      createInsightsContent(data.insights || [])
    )
  );

  // ⑥ Choices
  root.appendChild(
    createAccordionSection(
      "選択のコンパス",
      "どちらを選んでも後悔しないためのヒント",
      "choices",
      createChoicesContent(data.choices || [])
    )
  );

  // ⑦ 指針一言
  const finalEl = document.getElementById("finalLine");
  if (finalEl) finalEl.textContent = data.finalLine || "";

  // アコーディオン動作のセットアップ
  setupAccordions();
}

/**
 * アコーディオンセクション生成
 */
function createAccordionSection(title, subtitle, key, bodyContentEl) {
  const wrapper = document.createElement("article");
  wrapper.className = "accordion";
  wrapper.dataset.section = key;

  const headerBtn = document.createElement("button");
  headerBtn.type = "button";
  headerBtn.className = "accordion-header";

  const main = document.createElement("div");
  main.className = "accordion-header-main";

  const titleEl = document.createElement("div");
  titleEl.className = "accordion-title";
  titleEl.textContent = title;

  const subtitleEl = document.createElement("div");
  subtitleEl.className = "accordion-subtitle";
  subtitleEl.textContent = subtitle;

  main.appendChild(titleEl);
  main.appendChild(subtitleEl);

  const icon = document.createElement("div");
  icon.className = "accordion-icon";
  icon.textContent = "＋";

  headerBtn.appendChild(main);
  headerBtn.appendChild(icon);

  const body = document.createElement("div");
  body.className = "accordion-body";

  const inner = document.createElement("div");
  inner.className = "accordion-inner";

  if (bodyContentEl) {
    inner.appendChild(bodyContentEl);
  } else {
    inner.textContent = "データがありません。";
  }

  body.appendChild(inner);

  wrapper.appendChild(headerBtn);
  wrapper.appendChild(body);

  return wrapper;
}

/**
 * 本質（Essence）コンテンツ生成
 */
function createEssenceContent(essenceArr) {
  const ul = document.createElement("ul");
  ul.className = "essence-list";

  essenceArr.forEach((text) => {
    if (!text) return;
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });

  return ul;
}

/**
 * 分岐パターン（Common Paths）コンテンツ生成
 */
function createCommonPathsContent(paths) {
  const ul = document.createElement("ul");
  ul.className = "paths-list";

  paths.forEach((p) => {
    if (!p || (!p.label && !p.desc)) return;
    const li = document.createElement("li");

    const label = document.createElement("div");
    label.className = "path-item-label";
    label.textContent = p.label || "";

    const desc = document.createElement("p");
    desc.className = "path-item-desc";
    desc.textContent = p.desc || "";

    li.appendChild(label);
    li.appendChild(desc);
    ul.appendChild(li);
  });

  return ul;
}

/**
 * 迷い・不安（Pains）コンテンツ生成
 */
function createPainsContent(pains) {
  const grid = document.createElement("div");
  grid.className = "pains-grid";

  pains.forEach((p) => {
    if (!p) return;
    const card = document.createElement("div");
    card.className = "pain-card";
    card.textContent = p;
    grid.appendChild(card);
  });

  return grid;
}

/**
 * Insights コンテンツ生成
 */
function createInsightsContent(insights) {
  const wrapper = document.createElement("div");
  wrapper.className = "insights-list";

  insights.forEach((ins) => {
    if (!ins || (!ins.title && !ins.abstract && !ins.action)) return;

    const card = document.createElement("article");
    card.className = "insight-card";

    if (ins.title) {
      const t = document.createElement("h3");
      t.className = "insight-title";
      t.textContent = ins.title;
      card.appendChild(t);
    }

    if (ins.abstract) {
      const ab = document.createElement("p");
      ab.className = "insight-abstract";
      ab.textContent = ins.abstract;
      card.appendChild(ab);
    }

    if (ins.action) {
      const ac = document.createElement("p");
      ac.className = "insight-action";
      ac.textContent = ins.action;
      card.appendChild(ac);
    }

    wrapper.appendChild(card);
  });

  return wrapper;
}

/**
 * Choices コンテンツ生成
 */
function createChoicesContent(choices) {
  const wrapper = document.createElement("div");
  wrapper.className = "choices-list";

  choices.forEach((c) => {
    if (!c || (!c.title && !c.insight)) return;

    const card = document.createElement("article");
    card.className = "choice-card";

    if (c.title) {
      const t = document.createElement("h3");
      t.className = "choice-title";
      t.textContent = c.title;
      card.appendChild(t);
    }

    if (c.insight) {
      const ins = document.createElement("p");
      ins.className = "choice-insight";
      ins.textContent = c.insight;
      card.appendChild(ins);
    }

    wrapper.appendChild(card);
  });

  return wrapper;
}

/**
 * アコーディオン動作セットアップ
 */
function setupAccordions() {
  const accordions = document.querySelectorAll(".accordion");

  accordions.forEach((acc) => {
    const header = acc.querySelector(".accordion-header");
    const body = acc.querySelector(".accordion-body");

    if (!header || !body) return;

    // 初期は閉じた状態
    body.style.maxHeight = "0px";

    header.addEventListener("click", () => {
      const isOpen = acc.classList.contains("open");

      if (isOpen) {
        acc.classList.remove("open");
        body.style.maxHeight = "0px";
      } else {
        acc.classList.add("open");
        const inner = body.querySelector(".accordion-inner");
        const targetHeight = inner ? inner.scrollHeight : 0;
        body.style.maxHeight = `${targetHeight}px`;
      }
    });
  });
}

/**
 * エラー表示
 */
function showErrorMessage() {
  const stageTitleEl = document.getElementById("stageTitle");
  const overviewTextEl = document.getElementById("overviewText");
  const root = document.getElementById("accordionRoot");
  const finalEl = document.getElementById("finalLine");

  if (stageTitleEl) stageTitleEl.textContent = "データを読み込めませんでした";
  if (overviewTextEl) overviewTextEl.textContent = "URL やファイル構成を確認してください。";

  if (root) {
    root.innerHTML = "";
  }

  if (finalEl) {
    finalEl.textContent = "";
  }
}
