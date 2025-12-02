// life-stories.js
// 「人生体験記ノート」ページ用スクリプト
// - JSONをfetchで読み込み
// - 人生パターン図鑑（カード + アコーディオン）を動的生成
// - 職業図鑑（タグボタン + 詳細カード）を動的生成

document.addEventListener("DOMContentLoaded", () => {
  loadLifePatterns();
  loadJobs();
});

/**
 * ------------- 共通ユーティリティ -------------
 */

function createElement(tagName, options = {}) {
  const el = document.createElement(tagName);
  const { className, text, html, attrs } = options;

  if (className) {
    el.className = className;
  }
  if (text !== undefined) {
    el.textContent = text;
  }
  if (html !== undefined) {
    el.innerHTML = html;
  }
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }
  return el;
}

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") return [value];
  return [];
}

/**
 * ------------- 人生パターン図鑑 -------------
 */

async function loadLifePatterns() {
  const container = document.getElementById("pattern-card-grid");
  if (!container) return;

  const patternFiles = [
    "data/patterns/pattern1.json",
    "data/patterns/pattern2.json",
    "data/patterns/pattern3.json",
    "data/patterns/pattern4.json",
    "data/patterns/pattern5.json",
    "data/patterns/pattern6.json"
  ];

  try {
    const patternDataList = await Promise.all(
      patternFiles.map((path) =>
        fetch(path).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load ${path}`);
          }
          return res.json();
        })
      )
    );

    patternDataList.forEach((patternData) => {
      const card = buildPatternCard(patternData);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("人生パターンJSONの読み込みに失敗しました:", error);
    const errorMsg = createElement("p", {
      className: "pattern-error-message",
      text: "人生パターンの読み込み中にエラーが発生しました。",
    });
    container.appendChild(errorMsg);
  }
}

function buildPatternCard(data) {
  const card = createElement("article", {
    className: "pattern-card",
  });

  // --- ヘッダー部分（クリックで開閉） ---
  const header = createElement("button", {
    className: "pattern-card-header",
  });
  header.type = "button";
  header.setAttribute("aria-expanded", "false");

  const headerMain = createElement("div", {
    className: "pattern-card-header-main",
  });

  const titleEl = createElement("h3", {
    className: "pattern-card-title",
    text: data.title || "",
  });

  const routeLabelEl = createElement("p", {
    className: "pattern-card-route-label",
    text: data.routeLabel || "",
  });

  headerMain.appendChild(titleEl);
  headerMain.appendChild(routeLabelEl);

  const toggleIcon = createElement("div", {
    className: "pattern-card-toggle-icon",
    text: "›",
  });

  header.appendChild(headerMain);
  header.appendChild(toggleIcon);

  // --- 概要（常時表示のサマリー） ---
  const summary = createElement("div", {
    className: "pattern-card-summary",
    text: data.overview || "",
  });

  // --- 詳細アコーディオン部 ---
  const detailsWrapper = createElement("div", {
    className: "pattern-card-details-wrapper",
  });

  const detailsInner = createElement("div", {
    className: "pattern-card-details-inner",
  });

  // 本質ブロック
  if (data.essence) {
    const essenceBlock = createPatternDetailBlock(
      "このルートの「本質」",
      safeArray(data.essence)
    );
    detailsInner.appendChild(essenceBlock);
  }

  // 主な分岐ブロック
  if (data.branches) {
    const branchesBlock = createPatternDetailBlock(
      "よく出てくる分岐",
      safeArray(data.branches)
    );
    detailsInner.appendChild(branchesBlock);
  }

  // つまずきやすいポイント
  if (data.pains) {
    const painsBlock = createPatternDetailBlock(
      "つまずきやすいポイント",
      safeArray(data.pains)
    );
    detailsInner.appendChild(painsBlock);
  }

  // インサイト ブロック（抽象・二周目視点・行動ヒント）
  if (data.insight) {
    const insightBlock = createElement("div", {
      className: "pattern-insight",
    });

    if (data.insight.abstract) {
      insightBlock.appendChild(
        createElement("p", {
          className: "pattern-insight-line",
          text: `抽象化: ${data.insight.abstract}`,
        })
      );
    }

    if (data.insight.twoRoundView) {
      insightBlock.appendChild(
        createElement("p", {
          className: "pattern-insight-line",
          text: `二周目視点: ${data.insight.twoRoundView}`,
        })
      );
    }

    if (data.insight.actionHint) {
      insightBlock.appendChild(
        createElement("p", {
          className: "pattern-insight-line",
          text: `行動ヒント: ${data.insight.actionHint}`,
        })
      );
    }

    detailsInner.appendChild(insightBlock);
  }

  // 最後の一文
  if (data.finalLine) {
    const finalLine = createElement("p", {
      className: "pattern-final-line",
      text: data.finalLine,
    });
    detailsInner.appendChild(finalLine);
  }

  detailsWrapper.appendChild(detailsInner);

  // --- 開閉イベント ---
  header.addEventListener("click", () => {
    const isOpen = card.classList.contains("is-open");
    togglePatternCard(card, detailsWrapper, !isOpen);
  });

  card.appendChild(header);
  card.appendChild(summary);
  card.appendChild(detailsWrapper);

  return card;
}

function createPatternDetailBlock(title, items) {
  const block = createElement("div", {
    className: "pattern-detail-block",
  });

  const titleEl = createElement("h4", {
    className: "pattern-detail-title",
    text: title,
  });

  const listEl = createElement("ul", {
    className: "pattern-detail-list",
  });

  items.forEach((item) => {
    const li = createElement("li", {
      text: item,
    });
    listEl.appendChild(li);
  });

  block.appendChild(titleEl);
  block.appendChild(listEl);

  return block;
}

function togglePatternCard(card, detailsWrapper, open) {
  const headerButton = card.querySelector(".pattern-card-header");
  const allCards = document.querySelectorAll(".pattern-card");

  // 単一開閉にしたい場合はここで他カードを閉じる
  allCards.forEach((c) => {
    if (c !== card && c.classList.contains("is-open")) {
      const wrapper = c.querySelector(".pattern-card-details-wrapper");
      if (wrapper) {
        wrapper.style.maxHeight = "0px";
      }
      c.classList.remove("is-open");
      const header = c.querySelector(".pattern-card-header");
      if (header) header.setAttribute("aria-expanded", "false");
    }
  });

  if (open) {
    card.classList.add("is-open");
    const scrollHeight = detailsWrapper.scrollHeight;
    detailsWrapper.style.maxHeight = scrollHeight + "px";
    if (headerButton) headerButton.setAttribute("aria-expanded", "true");
  } else {
    card.classList.remove("is-open");
    detailsWrapper.style.maxHeight = "0px";
    if (headerButton) headerButton.setAttribute("aria-expanded", "false");
  }
}

/**
 * ------------- 職業図鑑 -------------
 */

let jobDataList = [];
let activeJobId = null;

async function loadJobs() {
  const tagContainer = document.getElementById("job-tag-container");
  const detailContainer = document.getElementById("job-detail-container");
  if (!tagContainer || !detailContainer) return;

  const jobFiles = [
    "data/jobs/job1.json",
    "data/jobs/job2.json",
    "data/jobs/job3.json",
    "data/jobs/job4.json",
    "data/jobs/job5.json",
    "data/jobs/job6.json"
  ];

  try {
    jobDataList = await Promise.all(
      jobFiles.map((path) =>
        fetch(path).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load ${path}`);
          }
          return res.json();
        })
      )
    );

    // タグボタン生成
    jobDataList.forEach((job) => {
      const button = createElement("button", {
        className: "job-tag-button",
        text: job.name || "",
      });
      button.type = "button";
      button.dataset.jobId = job.id || "";

      button.addEventListener("click", () => {
        setActiveJob(job.id);
      });

      tagContainer.appendChild(button);
    });

    // 初期状態: 先頭の職業を表示
    if (jobDataList.length > 0) {
      setActiveJob(jobDataList[0].id);
    }
  } catch (error) {
    console.error("職業JSONの読み込みに失敗しました:", error);
    const errorMsg = createElement("p", {
      className: "job-error-message",
      text: "職業データの読み込み中にエラーが発生しました。",
    });
    detailContainer.appendChild(errorMsg);
  }
}

function setActiveJob(jobId) {
  activeJobId = jobId;
  const tagButtons = document.querySelectorAll(".job-tag-button");
  tagButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.jobId === jobId);
  });

  const job = jobDataList.find((j) => j.id === jobId);
  const detailContainer = document.getElementById("job-detail-container");
  if (!job || !detailContainer) return;

  // 既存の内容をクリア
  detailContainer.innerHTML = "";
  const card = buildJobCard(job);
  detailContainer.appendChild(card);
}

function buildJobCard(job) {
  const card = createElement("article", {
    className: "job-card",
  });

  const header = createElement("div", {
    className: "job-card-header",
  });

  const title = createElement("h3", {
    className: "job-card-title",
    text: job.name || "",
  });

  const category = createElement("p", {
    className: "job-card-category",
    text: job.category ? `カテゴリ: ${job.category}` : "",
  });

  const examples = createElement("p", {
    className: "job-card-examples",
    html: job.examples
      ? `<span>具体例：</span>${escapeHtml(job.examples)}`
      : "",
  });

  header.appendChild(title);
  header.appendChild(category);
  header.appendChild(examples);

  card.appendChild(header);

  // 概要
  if (job.overview) {
    const overviewBlock = createElement("div", {
      className: "job-detail-block",
    });

    const overviewTitle = createElement("h4", {
      className: "job-detail-title",
      text: "概要",
    });

    const overviewText = createElement("p", {
      className: "job-detail-text",
      text: job.overview,
    });

    overviewBlock.appendChild(overviewTitle);
    overviewBlock.appendChild(overviewText);
    card.appendChild(overviewBlock);
  }

  // なり方
  if (job.howToEnter) {
    const block = createJobListBlock("なり方", safeArray(job.howToEnter));
    card.appendChild(block);
  }

  // 1日の流れ
  if (job.routine) {
    const block = createJobListBlock("1日の流れ", safeArray(job.routine));
    card.appendChild(block);
  }

  // よくある悩み
  if (job.pains) {
    const block = createJobListBlock("よくある悩み", safeArray(job.pains));
    card.appendChild(block);
  }

  // この仕事ならではの喜び
  if (job.joys) {
    const block = createJobListBlock("喜び・やりがい", safeArray(job.joys));
    card.appendChild(block);
  }

  // 二周目視点
  if (job.twoRoundView) {
    const twoRound = createElement("div", {
      className: "job-two-round-view",
      text: job.twoRoundView,
    });
    card.appendChild(twoRound);
  }

  return card;
}

function createJobListBlock(title, items) {
  const block = createElement("div", {
    className: "job-detail-block",
  });

  const titleEl = createElement("h4", {
    className: "job-detail-title",
    text: title,
  });

  const list = createElement("ul", {
    className: "job-detail-list",
  });

  items.forEach((item) => {
    const li = createElement("li", {
      text: item,
    });
    list.appendChild(li);
  });

  block.appendChild(titleEl);
  block.appendChild(list);

  return block;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
