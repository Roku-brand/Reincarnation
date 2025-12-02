// knowledge-notes.js
// 処世術禄：
//  - ≪トップ≫：今日の処世術 ＋ ショートカット（カード一覧なし）
//  - その他タブ：検索 ＋ カード一覧（トップ専用機能は非表示）

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
  const todayRefreshBtn = document.getElementById("kn-today-refresh");
  const resultsSection = document.querySelector(".kn-results-section");
  const resultsContainer = document.getElementById("kn-results-container");
  const resultsMetaEl = document.getElementById("kn-results-meta");
  const shortcutButtons = document.querySelectorAll(".kn-shortcut");
  const topOnlySections = document.querySelectorAll(".kn-top-only");

  // ============================================================
  // 初期化
  // ============================================================

  function init() {
    // イベントの紐付け
    setupSidebarToggle();
    setupOsTabs();
    setupSearchInput();
    setupShortcuts();
    setupTodayRefresh();

    // データのロード
    loadAllCategories()
      .then(() => {
        state.loaded = true;
        // 今日の処世術カード
        renderTodayCard();
        // 検索結果（≪トップ≫では出さないが内部状態として用意）
        renderResults();
        // トップ／OSタブ表示の切り替え
        updateTopOnlySections();
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

    // 初期状態（≪トップ≫）の表示制御
    updateTopOnlySections();
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

    // トップモード／OSモードの表示制御
    updateTopOnlySections();

    // 再描画（OSタブのときだけカード一覧を使う）
    renderResults();
  }

  // 「今日の処世術」「今の悩みから探す」を
  // ≪トップ≫（all）のときだけ表示。
  // カード一覧セクションはその逆（OSタブのときのみ表示）。
  function updateTopOnlySections() {
    const isTop = state.activeCategory === "all";

    if (topOnlySections && topOnlySections.length > 0) {
      topOnlySections.forEach((sec) => {
        if (!sec) return;
        sec.hidden = !isTop;
      });
    }

    if (resultsSection) {
      resultsSection.hidden = isTop;
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
        // OSタブの結果エリアにスクロール（≪トップ≫では非表示だが仕様通り）
        const resultsSectionEl = document.querySelector(".kn-results-section");
        if (
          resultsSectionEl &&
          !resultsSectionEl.hidden &&
          typeof resultsSectionEl.scrollIntoView === "function"
        ) {
          resultsSectionEl.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
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

    // カテゴリラベルを追加
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
  // 検索結果のレンダリング（≪トップ≫では一覧を出さない）
  // ============================================================

  function renderResults() {
    if (!resultsContainer || !resultsMetaEl) return;

    // ≪トップ≫モードのときはカード一覧を使わない
    if (state.activeCategory === "all") {
      resultsContainer.innerHTML = "";
      if (resultsMetaEl) {
        resultsMetaEl.textContent =
          "≪トップ≫ではカード一覧は表示していません。OSタブを選ぶと、そのOSの処世術が一覧できます。";
      }
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

    const keyword = (state.search || "").trim().toLowerCase();
    const activeCat = state.activeCategory;

    let filtered = allTopics;

    // カテゴリフィルタ（≪トップ≫以外のみ到達）
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
      activeCat && categoryConfigs[activeCat]
        ? categoryConfigs[activeCat].label
        : "不明カテゴリ";

    if (!keyword) {
      resultsMetaEl.textContent = `${catLabelText} から ${totalCount}件を表示中。`;
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
  // ユーティリティ：配列シャッフル（今は今日の処世術でのみ使用）
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
