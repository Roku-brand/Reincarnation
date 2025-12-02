// knowledge-notes.js
// モード分離：
//  - ≪トップ≫(activeCategory === "all") → #top-mode + OS構造カードを表示
//  - その他OSタブ → #os-mode だけ表示（カード一覧）

(function () {
  // ============================================================
  // 状態管理
  // ============================================================
  const state = {
    loaded: false,
    topics: [],         // { title, summary, tags, essence, traps, actionTips, _category }
    activeCategory: "all",
    search: ""
  };

  // カテゴリ設定
  const categoryConfigs = {
    mind: {
      jsonPath: "data/shoseijutsu/mind.json",
      label: "心の扱い方（内部OS）"
    },
    relation: {
      jsonPath: "data/shoseijutsu/relation.json",
      label: "人との関わり方（対人OS）"
    },
    work: {
      jsonPath: "data/shoseijutsu/work.json",
      label: "社会での立ち回り（社会OS）"
    },
    habit: {
      jsonPath: "data/shoseijutsu/habit.json",
      label: "行動・習慣の技術（行動OS）"
    },
    future: {
      jsonPath: "data/shoseijutsu/future.json",
      label: "キャッチアップの極意（未来OS）"
    }
  };

  // DOM参照
  const sidebarEl        = document.getElementById("kn-sidebar");
  const sidebarToggleBtn = document.querySelector(".kn-sidebar-toggle");
  const osTabButtons     = sidebarEl ? sidebarEl.querySelectorAll(".kn-os-tab") : [];

  const searchInput      = document.getElementById("kn-search-input");

  const topModeSection   = document.getElementById("top-mode");
  const osModeSection    = document.getElementById("os-mode");
  const osStructureSection = document.querySelector(".kn-os-structure-section");

  const todayCardContainer = document.getElementById("kn-today-card");
  const todayRefreshBtn    = document.getElementById("kn-today-refresh");

  const shortcutButtons    = document.querySelectorAll(".kn-shortcut");

  const resultsContainer   = document.getElementById("kn-results-container");
  const resultsMetaEl      = document.getElementById("kn-results-meta");

  // ============================================================
  // 初期化
  // ============================================================
  function init() {
    setupSidebarToggle();
    setupOsTabs();
    setupSearchInput();
    setupShortcuts();
    setupTodayRefresh();

    loadAllCategories()
      .then(() => {
        state.loaded = true;
        renderTodayCard();   // トップモード用
        renderResults();     // OSモード用（トップでは一覧非表示）
        updateModeVisibility();
      })
      .catch((err) => {
        console.error(err);
        if (todayCardContainer) {
          todayCardContainer.innerHTML =
            '<p class="kn-loading-text">データの読み込み中にエラーが発生しました。</p>';
        }
        if (resultsMetaEl) {
          resultsMetaEl.textContent =
            "データの読み込み中にエラーが発生しました。";
        }
      });

    // 初期状態：≪トップ≫
    updateModeVisibility();
  }

  // ============================================================
  // データロード
  // ============================================================
  function loadAllCategories() {
    const entries = Object.entries(categoryConfigs);
    const promises = entries.map(([categoryId, config]) => {
      return fetch(config.jsonPath)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`failed to load ${config.jsonPath} (${res.status})`);
          }
          return res.json();
        })
        .then((json) => {
          const topics = Array.isArray(json.topics) ? json.topics : [];
          topics.forEach((topic) => {
            const cloned = Object.assign({}, topic, {
              _category: categoryId
            });
            state.topics.push(cloned);
          });
        });
    });

    return Promise.all(promises);
  }

  // ============================================================
  // サイドバー（OSタブ）
  // ============================================================
  function setupSidebarToggle() {
    if (!sidebarToggleBtn || !sidebarEl) return;

    sidebarToggleBtn.addEventListener("click", () => {
      const isOpen = sidebarEl.classList.toggle("is-open");
      sidebarToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function setupOsTabs() {
    if (!osTabButtons || osTabButtons.length === 0) return;

    osTabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const categoryId = btn.getAttribute("data-category") || "all";
        setActiveCategory(categoryId);

        // スマホ時：タブ選択後はサイドバーを閉じる
        if (sidebarEl && sidebarEl.classList.contains("is-open")) {
          sidebarEl.classList.remove("is-open");
          if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
  }

  function setActiveCategory(categoryId) {
    state.activeCategory = categoryId;

    // タブの見た目更新
    if (osTabButtons && osTabButtons.length > 0) {
      osTabButtons.forEach((btn) => {
        const target = btn.getAttribute("data-category");
        btn.classList.toggle("is-active", target === categoryId);
      });
    }

    // モード切り替え
    updateModeVisibility();

    // OSモードのときだけ一覧を再描画
    renderResults();
  }

  // トップモード / OSモード切り替え
  function updateModeVisibility() {
    const isTop = state.activeCategory === "all";

    if (topModeSection) {
      topModeSection.hidden = !isTop;
      topModeSection.style.display = isTop ? "" : "none"; // 確実に消す
    }
    if (osModeSection) {
      osModeSection.hidden = isTop;
      osModeSection.style.display = isTop ? "none" : ""; // 確実に出す
    }
    if (osStructureSection) {
      osStructureSection.hidden = !isTop;
      osStructureSection.style.display = isTop ? "" : "none";
    }
  }

  // ============================================================
  // 検索入力
  // ============================================================
  function setupSearchInput() {
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
      state.search = searchInput.value || "";
      renderResults();
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        state.search = searchInput.value || "";
        renderResults();
      }
    });
  }

  // ============================================================
  // ショートカット（シチュエーション別）
  // ============================================================
  function setupShortcuts() {
    if (!shortcutButtons || shortcutButtons.length === 0) return;

    shortcutButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const keyword = btn.getAttribute("data-keyword") || "";
        if (!searchInput) return;

        searchInput.value = keyword;
        state.search = keyword;

        renderResults();

        // OSモードが表示されている場合はそこまでスクロール
        if (osModeSection && !osModeSection.hidden) {
          osModeSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ============================================================
  // 今日の処世術（ランダムカード）＋更新ボタン
  // ============================================================
  function setupTodayRefresh() {
    if (!todayRefreshBtn) return;

    todayRefreshBtn.addEventListener("click", () => {
      if (!state.loaded) return;
      renderTodayCard();
    });
  }

  function renderTodayCard() {
    if (!todayCardContainer) return;

    todayCardContainer.innerHTML = "";

    if (!state.loaded || !Array.isArray(state.topics) || state.topics.length === 0) {
      const p = document.createElement("p");
      p.className = "kn-loading-text";
      p.textContent = "利用可能な処世術カードがまだありません。";
      todayCardContainer.appendChild(p);
      return;
    }

    const randomIndex = Math.floor(Math.random() * state.topics.length);
    const topic = state.topics[randomIndex];

    const card = createShoseiCard(topic);
    card.classList.add("is-today");

    // カテゴリラベル
    const catLabel = document.createElement("span");
    catLabel.className = "tag-chip tag-chip-category";
    const categoryLabel = categoryConfigs[topic._category]
      ? categoryConfigs[topic._category].label
      : "不明カテゴリ";
    catLabel.textContent = categoryLabel;

    const tagsWrap = card.querySelector(".shosei-tags");
    if (tagsWrap) {
      tagsWrap.insertBefore(catLabel, tagsWrap.firstChild);
    }

    todayCardContainer.appendChild(card);
  }

  // ============================================================
  // 検索結果のレンダリング（OSモード専用）
  // ============================================================
  function renderResults() {
    if (!resultsContainer || !resultsMetaEl) return;

    // ≪トップ≫モードのときは一覧不要
    if (state.activeCategory === "all") {
      resultsContainer.innerHTML = "";
      resultsMetaEl.textContent =
        "≪トップ≫では処世術カード一覧は表示していません。OSタブを選ぶと、そのOSのカードが一覧できます。";
      return;
    }

    resultsContainer.innerHTML = "";

    if (!state.loaded) {
      resultsMetaEl.textContent = "データを読み込み中です…";
      return;
    }

    const allTopics = Array.isArray(state.topics) ? state.topics : [];
    if (allTopics.length === 0) {
      resultsMetaEl.textContent =
        "まだ処世術カードが登録されていません。";
      return;
    }

    const keyword   = (state.search || "").trim().toLowerCase();
    const activeCat = state.activeCategory;

    let filtered = allTopics;

    // カテゴリフィルタ（all 以外しかここには来ない）
    if (activeCat && activeCat !== "all") {
      filtered = filtered.filter((t) => t._category === activeCat);
    }

    // キーワードフィルタ
    if (keyword) {
      filtered = filtered.filter((topic) => {
        const title   = (topic.title   || "").toLowerCase();
        const summary = (topic.summary || "").toLowerCase();
        return title.includes(keyword) || summary.includes(keyword);
      });
    }

    const totalCount = filtered.length;

    const catLabelText =
      activeCat && categoryConfigs[activeCat]
        ? categoryConfigs[activeCat].label
        : "不明カテゴリ";

    if (!keyword) {
      resultsMetaEl.textContent = `${catLabelText} から ${totalCount}件を表示中。`;
    } else {
      resultsMetaEl.textContent = `${catLabelText} × 「${keyword}」で ${totalCount}件ヒットしました。`;
    }

    if (filtered.length === 0) {
      const p = document.createElement("p");
      p.className = "kn-loading-text";
      p.textContent = "条件に合う処世術カードがありませんでした。";
      resultsContainer.appendChild(p);
      return;
    }

    filtered.forEach((topic) => {
      const card = createShoseiCard(topic);

      const catLabel = document.createElement("span");
      catLabel.className = "tag-chip tag-chip-category";
      const categoryLabel = categoryConfigs[topic._category]
        ? categoryConfigs[topic._category].label
        : "不明カテゴリ";
      catLabel.textContent = categoryLabel;

      const tagsWrap = card.querySelector(".shosei-tags");
      if (tagsWrap) {
        tagsWrap.insertBefore(catLabel, tagsWrap.firstChild);
      }

      resultsContainer.appendChild(card);
    });
  }

  // ============================================================
  // カード生成
  // ============================================================
  function createShoseiCard(topic) {
    const card = document.createElement("article");
    card.className = "shosei-card";

    const titleEl = document.createElement("h3");
    titleEl.className = "shosei-title";
    titleEl.textContent = topic.title || "タイトル未設定";

    const summaryEl = document.createElement("p");
    summaryEl.className = "shosei-summary";
    summaryEl.textContent = topic.summary || "";

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "shosei-tags";
    if (Array.isArray(topic.tags)) {
      topic.tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.textContent = tag;
        tagsWrap.appendChild(chip);
      });
    }

    const detailWrapper = document.createElement("div");
    detailWrapper.className = "shosei-detail";

    const detailInner = document.createElement("div");
    detailInner.className = "shosei-detail-inner";

    if (Array.isArray(topic.essence) && topic.essence.length > 0) {
      detailInner.appendChild(
        createDetailBlock("本質ポイント", topic.essence)
      );
    }

    if (Array.isArray(topic.traps) && topic.traps.length > 0) {
      detailInner.appendChild(
        createDetailBlock("よくある罠", topic.traps)
      );
    }

    if (Array.isArray(topic.actionTips) && topic.actionTips.length > 0) {
      detailInner.appendChild(
        createDetailBlock("行動ヒント", topic.actionTips)
      );
    }

    if (detailInner.children.length > 0) {
      detailWrapper.appendChild(detailInner);
    }

    // クリックで詳細開閉
    let isOpen = false;
    card.addEventListener("click", () => {
      isOpen = !isOpen;
      if (isOpen) {
        card.classList.add("is-open");
        detailWrapper.style.maxHeight = detailInner.scrollHeight + "px";
      } else {
        card.classList.remove("is-open");
        detailWrapper.style.maxHeight = "0";
      }
    });

    card.appendChild(titleEl);
    card.appendChild(summaryEl);
    card.appendChild(tagsWrap);
    card.appendChild(detailWrapper);

    return card;
  }

  function createDetailBlock(title, items) {
    const block = document.createElement("div");
    block.className = "detail-block";

    const titleEl = document.createElement("h4");
    titleEl.className = "detail-title";
    titleEl.textContent = title;

    const ul = document.createElement("ul");
    ul.className = "detail-list";

    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });

    block.appendChild(titleEl);
    block.appendChild(ul);
    return block;
  }

  // ============================================================
  // 実行
  // ============================================================
  init();
})();
