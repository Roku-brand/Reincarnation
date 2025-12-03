// life-stories.js
// 人生体験禄ページ用スクリプト
// - 左タスクバーで ≪トップ≫ / 人生パターン図鑑 / 職業図鑑 を切り替え
// - 人生パターン図鑑：JSON → カード + アコーディオン
// - 職業図鑑：JSON → 検索 + 3分類（会社員系／専門職系／その他）＋詳細カード

document.addEventListener("DOMContentLoaded", () => {
  initSidebarNavigation();
  initJobSearch();
  loadLifePatterns();
  loadJobs();
});

/**
 * ------------- 左サイドバー（タブ切替） -------------
 */
function initSidebarNavigation() {
  const sidebar = document.getElementById("ls-sidebar");
  const toggleBtn = document.querySelector(".ls-sidebar-toggle");
  const navTabs = sidebar ? sidebar.querySelectorAll(".ls-nav-tab") : [];
  const sections = document.querySelectorAll(".ls-section");

  if (navTabs.length === 0 || !sections.length) return;

  navTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-section");
      if (!targetId) return;

      // タブの見た目更新
      navTabs.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });

      // セクション切り替え
      sections.forEach((sec) => {
        const match = sec.id === targetId;
        sec.hidden = !match;
        sec.classList.toggle("is-active", match);
      });

      // スマホ時：選択後にサイドバーを閉じる
      if (sidebar && sidebar.classList.contains("is-open")) {
        sidebar.classList.remove("is-open");
        if (toggleBtn) {
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      }

    });
  });

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("is-open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
}

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

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

  // --- 概要（常時表示） ---
  const summary = createElement("div", {
    className: "pattern-card-summary",
    text: data.overview || "",
  });

  // --- 詳細アコーディオン ---
  const detailsWrapper = createElement("div", {
    className: "pattern-card-details-wrapper",
  });

  const detailsInner = createElement("div", {
    className: "pattern-card-details-inner",
  });

  // 本質
  if (data.essence) {
    const essenceBlock = createPatternDetailBlock(
      "このルートの「本質」",
      safeArray(data.essence)
    );
    detailsInner.appendChild(essenceBlock);
  }

  // 分岐
  if (data.branches) {
    const branchesBlock = createPatternDetailBlock(
      "よく出てくる分岐",
      safeArray(data.branches)
    );
    detailsInner.appendChild(branchesBlock);
  }

  // つまずき
  if (data.pains) {
    const painsBlock = createPatternDetailBlock(
      "つまずきやすいポイント",
      safeArray(data.pains)
    );
    detailsInner.appendChild(painsBlock);
  }

  // インサイト
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

  // 単一開閉（他カードは閉じる）
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
let jobSearchKeyword = "";

// 検索入力の初期化
function initJobSearch() {
  const input = document.getElementById("job-search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    jobSearchKeyword = (input.value || "").trim().toLowerCase();
    renderJobGroupsAndTags();
  });
}

async function loadJobs() {
  const groupsContainer = document.getElementById("job-groups");
  const detailContainer = document.getElementById("job-detail-container");
  if (!groupsContainer || !detailContainer) return;

  // ★ここを修正：job1〜job30 までを読み込む
  const jobFiles = [
    "data/jobs/job1.json",
    "data/jobs/job2.json",
    "data/jobs/job3.json",
    "data/jobs/job4.json",
    "data/jobs/job5.json",
    "data/jobs/job6.json",
    "data/jobs/job7.json",
    "data/jobs/job8.json",
    "data/jobs/job9.json",
    "data/jobs/job10.json",
    "data/jobs/job11.json",
    "data/jobs/job12.json",
    "data/jobs/job13.json",
    "data/jobs/job14.json",
    "data/jobs/job15.json",
    "data/jobs/job16.json",
    "data/jobs/job17.json",
    "data/jobs/job18.json",
    "data/jobs/job19.json",
    "data/jobs/job20.json",
    "data/jobs/job21.json",
    "data/jobs/job22.json",
    "data/jobs/job23.json",
    "data/jobs/job24.json",
    "data/jobs/job25.json",
    "data/jobs/job26.json",
    "data/jobs/job27.json",
    "data/jobs/job28.json",
    "data/jobs/job29.json",
    "data/jobs/job30.json"
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

    // 初回描画
    renderJobGroupsAndTags();
  } catch (error) {
    console.error("職業JSONの読み込みに失敗しました:", error);
    const errorMsg = createElement("p", {
      className: "job-error-message",
      text: "職業データの読み込み中にエラーが発生しました。",
    });
    detailContainer.appendChild(errorMsg);
  }
}

// 公務員などを含めたカテゴリ判定
function getJobSegment(job) {
  // JSONに segment が明示されている場合はそれを優先
  if (job.segment === "company" || job.segment === "pro" || job.segment === "other") {
    return job.segment;
  }

  const base = ((job.category || "") + " " + (job.name || "")).toLowerCase();

  // 地方公務員・国家公務員 → 強制的に「会社員系」
  if (base.includes("公務員")) {
    return "company";
  }

  // 一般的な会社員系のキーワード
  if (
    base.includes("会社") ||
    base.includes("商社") ||
    base.includes("銀行") ||
    base.includes("メーカー") ||
    base.includes("省庁") ||
    base.includes("庁") ||
    base.includes("企業")
  ) {
    return "company";
  }

  // 専門職っぽいキーワード
  if (
    base.includes("弁護士") ||
    base.includes("会計士") ||
    base.includes("税理士") ||
    base.includes("医師") ||
    base.includes("看護師") ||
    base.includes("薬剤師") ||
    base.includes("士") ||
    base.includes("師") ||
    base.includes("エンジニア") ||
    base.includes("コンサル")
  ) {
    return "pro";
  }

  return "other";
}

// キーワード一致チェック
function jobMatchesKeyword(job, keyword) {
  if (!keyword) return true;
  const haystack = (
    (job.name || "") +
    " " +
    (job.overview || "") +
    " " +
    (job.examples || "") +
    " " +
    (job.category || "")
  ).toLowerCase();
  return haystack.includes(keyword);
}

// 3分類グループ＋タグの描画
function renderJobGroupsAndTags() {
  const groupsContainer = document.getElementById("job-groups");
  const detailContainer = document.getElementById("job-detail-container");
  if (!groupsContainer || !detailContainer) return;

  groupsContainer.innerHTML = "";

  if (!jobDataList.length) {
    detailContainer.innerHTML =
      '<p class="job-error-message">職業データを読み込み中です…</p>';
    return;
  }

  const groups = {
    company: { label: "会社員系", jobs: [] },
    pro: { label: "専門職系", jobs: [] },
    other: { label: "その他", jobs: [] }
  };

  const keyword = jobSearchKeyword;

  jobDataList.forEach((job) => {
    if (!jobMatchesKeyword(job, keyword)) return;
    const seg = getJobSegment(job);
    (groups[seg] || groups.other).jobs.push(job);
  });

  let firstJobForSelection = null;

  Object.keys(groups).forEach((key) => {
    const group = groups[key];
    if (!group.jobs.length) return;

    const section = createElement("section", {
      className: "ls-job-group",
    });

    const title = createElement("h3", {
      className: "ls-job-group-title",
      text: group.label,
    });

    const row = createElement("div", {
      className: "job-tag-container",
    });

    group.jobs.forEach((job) => {
      const button = createElement("button", {
        className:
          "job-tag-button" + (job.id === activeJobId ? " is-active" : ""),
        text: job.name || "",
      });
      button.type = "button";
      button.dataset.jobId = job.id || "";

      button.addEventListener("click", () => {
        setActiveJob(job.id);
      });

      row.appendChild(button);

      if (!firstJobForSelection) {
        firstJobForSelection = job;
      }
    });

    section.appendChild(title);
    section.appendChild(row);
    groupsContainer.appendChild(section);
  });

  if (!firstJobForSelection) {
    detailContainer.innerHTML =
      '<p class="job-error-message">条件に合う職業がありませんでした。</p>';
    return;
  }

  // すでにアクティブな職業がフィルタ後も存在するならそれを優先
  if (
    activeJobId &&
    jobDataList.some(
      (job) => job.id === activeJobId && jobMatchesKeyword(job, keyword)
    )
  ) {
    setActiveJob(activeJobId);
  } else {
    setActiveJob(firstJobForSelection.id);
  }
}

// アクティブ職業設定 ＋ 詳細カード描画
function setActiveJob(jobId) {
  activeJobId = jobId;

  const tagButtons = document.querySelectorAll(".job-tag-button");
  tagButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.jobId === jobId);
  });

  const job = jobDataList.find((j) => j.id === jobId);
  const detailContainer = document.getElementById("job-detail-container");
  if (!job || !detailContainer) return;

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

  // 喜び・やりがい
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
