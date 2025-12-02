// knowledge-notes.js
// 処世術禄：サイドOSタブ / 総合検索 / 今日の処世術（ランダムカード） / ショートカット連動

(function () {
  // ============================================================
  // 状態管理
  // ============================================================
  const state = {
    loaded: false,
    topics: [], // { title, summary, tags, essence, ... , _category }
    activeCategory: "all", // all | mind | relation | work | habit | future
    search: ""
  };

  // カテゴリごとのJSON設定
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
  const sidebarEl = document.getElementById("kn-sidebar");
  const sidebarToggleBtn = document.querySelector(".kn-sidebar-toggle");
  const osTabButtons = sidebarEl
    ? sidebarEl.querySelectorAll(".kn-os-tab")
    : [];
  const searchInput = document.getElementById("kn-search-input");
  const todayCardContainer = document.getElementById("kn-today-card");
  const resultsContainer = document.getElementById("kn-results-container");
  const resultsMetaEl = document.getElementById("kn-results-meta");
  const shortcutButtons = document.querySelectorAll(".kn-shortcut");

  // ============================================================
  // 初期化
  // ============================================================

  function init() {
    // イベントの紐付け
    setupSidebarToggle();
    setupOsTabs();
    setupSearchInput();
    setupShortcuts();

    // データのロード
    loadAllCategories()
      .then(() => {
        state.loaded = true;
        // 今日の処世術カード
        renderTodayCard();
        // 検索結果（初期はランダムピックアップ）
        renderResults();
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
            throw new Error(
              `failed to load ${config.jsonPath} (${res.status})`
            );
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
        // スマホ：タブ選択後はサイドバーを閉じる
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

    // ボタンの見た目更新
    if (osTabButtons && osTabButtons.length > 0) {
      osTabButtons.forEach((btn) => {
        const target = btn.getAttribute("data-category");
        btn.classList.toggle("is-active", target === categoryId);
      });
    }

    // 再描画
    renderResults();
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
        // Enterで軽くフォーカスを外してもいいが、とりあえず検索結果更新のみ
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
        // 必要ならスクロール
        const resultsSection = document.querySelector(".kn-results-section");
        if (resultsSection && typeof resultsSection.scrollIntoView === "function") {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ============================================================
  // 今日の処世術（ランダムカード）
  // ============================================================

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

    // カテゴリラベルを追加しても良い
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
  // 検索結果のレンダリング
  // ============================================================

  function renderResults() {
    if (!resultsContainer || !resultsMetaEl) return;

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

    const keyword = (state.search || "").trim().toLowerCase();
    const activeCat = state.activeCategory;

    let filtered = allTopics;

    // カテゴリフィルタ
    if (activeCat && activeCat !== "all") {
      filtered = filtered.filter((t) => t._category === activeCat);
    }

    // キーワードフィルタ
    if (keyword) {
      filtered = filtered.filter((topic) => {
        const title = (topic.title || "").toLowerCase();
        const summary = (topic.summary || "").toLowerCase();
        return title.includes(keyword) || summary.includes(keyword);
      });
    }

    const totalCount = filtered.length;

    // メタ情報表示
    const catLabelText =
      activeCat === "all"
        ? "すべてのOS"
        : categoryConfigs[activeCat]
        ? categoryConfigs[activeCat].label
        : "不明カテゴリ";

    if (!keyword && activeCat === "all") {
      resultsMetaEl.textContent = `全カテゴリからランダムに最大6件をピックアップして表示しています（登録総数：${allTopics.length}件）。`;
    } else if (!keyword && activeCat !== "all") {
      resultsMetaEl.textContent = `${catLabelText} から ${totalCount}件を表示中。`;
    } else if (keyword && activeCat === "all") {
      resultsMetaEl.textContent = `「${keyword}」で全カテゴリから ${totalCount}件ヒットしました。`;
    } else {
      resultsMetaEl.textContent = `${catLabelText} × 「${keyword}」で ${totalCount}件ヒットしました。`;
    }

    // ヒットなし
    if (filtered.length === 0) {
      const p = document.createElement("p");
      p.className = "kn-loading-text";
      p.textContent = "条件に合う処世術カードがありませんでした。";
      resultsContainer.appendChild(p);
      return;
    }

    // 初期表示（キーワードなし・カテゴリall）の場合は上限6件ランダム表示
    if (!keyword && activeCat === "all") {
      const shuffled = shuffleArray(filtered.slice());
      filtered = shuffled.slice(0, 6);
    }

    filtered.forEach((topic) => {
      const card = createShoseiCard(topic);

      // カテゴリラベルチップ
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
  // ユーティリティ：配列シャッフル
  // ============================================================

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  // ============================================================
  // 処世術カード生成（概要＋アコーディオン詳細）
  // ============================================================

  function createShoseiCard(topic) {
    const card = document.createElement("article");
    card.className = "shosei-card";

    // タイトル
    const titleEl = document.createElement("h3");
    titleEl.className = "shosei-title";
    titleEl.textContent = topic.title || "タイトル未設定";

    // サマリー
    const summaryEl = document.createElement("p");
    summaryEl.className = "shosei-summary";
    summaryEl.textContent = topic.summary || "";

    // タグ列
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

    // 詳細（アコーディオン部）
    const detailWrapper = document.createElement("div");
    detailWrapper.className = "shosei-detail";

    const detailInner = document.createElement("div");
    detailInner.className = "shosei-detail-inner";

    // essence
    if (Array.isArray(topic.essence) && topic.essence.length > 0) {
      detailInner.appendChild(
        createDetailBlock("本質ポイント", topic.essence)
      );
    }

    // traps
    if (Array.isArray(topic.traps) && topic.traps.length > 0) {
      detailInner.appendChild(createDetailBlock("よくある罠", topic.traps));
    }

    // actionTips
    if (Array.isArray(topic.actionTips) && topic.actionTips.length > 0) {
      detailInner.appendChild(
        createDetailBlock("行動ヒント", topic.actionTips)
      );
    }

    if (detailInner.children.length > 0) {
      detailWrapper.appendChild(detailInner);
    }

    // カードクリックで詳細開閉
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

    // 構成を組み立て
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

  // defer で読み込まれる前提なので、そのまま init を叩いて問題ない
  init();
})();
