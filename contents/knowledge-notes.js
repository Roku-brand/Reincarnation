// knowledge-notes.js
// モード分離：
//  - ≪トップ≫(activeCategory === "all") → top-mode + 構造カードを表示
//  - その他OSタブ → os-mode だけ表示（カード一覧）

(function () {
  // ============================================================
  // 状態管理
  // ============================================================
  const state = {
    loaded: false,
    // topics:
    // { title, summary, tags, essence, traps, actionTips,
    //   _category, _subCategory, _cardId, _globalId }
    topics: [],
    activeCategory: "all",
    search: "",
    // OSごとのサブカテゴリの選択状態
    activeSubCategory: {
      mind: "all",
      relation: "all",
      work: "all",
      habit: "all",
      future: "all"
    }
  };

  // ユーザー別の永続データ（localStorage）
  const STORAGE_KEY = "shoseijutsu_user_v1";

  const userData = {
    favorites: [], // [globalId, ...]
    likes: {},     // { [globalId]: number }
    history: []    // 最近開いたカード [globalId, ...]
  };

  // カテゴリ設定（JSON一元管理前提）
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

  // OSごとのサブカテゴリ定義
  const subCategoryConfigs = {
    mind: [
      { id: "all",       label: "すべて" },
      { id: "emotion",   label: "感情" },
      { id: "cognition", label: "認知" },
      { id: "self",      label: "自己" },
      { id: "resilience",label: "メンタル耐性" },
      { id: "other",     label: "その他" }
    ],
    relation: [
      { id: "all",       label: "すべて" },
      { id: "close",     label: "家族・恋人" },
      { id: "middle",    label: "友人・同僚" },
      { id: "boss",      label: "上司・組織" },
      { id: "boundary",  label: "境界線" },
      { id: "other",     label: "その他" }
    ],
    work: [
      { id: "all",       label: "すべて" },
      { id: "evaluation",label: "評価" },
      { id: "safety",    label: "安全保障" },
      { id: "negotiation",label: "交渉" },
      { id: "context",   label: "環境理解" },
      { id: "other",     label: "その他" }
    ],
    habit: [
      { id: "all",       label: "すべて" },
      { id: "start",     label: "着手" },
      { id: "continue",  label: "継続" },
      { id: "focus",     label: "集中" },
      { id: "decision",  label: "意思決定" },
      { id: "other",     label: "その他" }
    ],
    future: [
      { id: "all",       label: "すべて" },
      { id: "info",      label: "情報収集" },
      { id: "learning",  label: "学習" },
      { id: "ai",        label: "AI活用" },
      { id: "strategy",  label: "キャリア戦略" },
      { id: "other",     label: "その他" }
    ]
  };

  // DOM参照
  const sidebarEl          = document.getElementById("kn-sidebar");
  const sidebarToggleBtn   = document.querySelector(".kn-sidebar-toggle");
  const osTabButtons       = sidebarEl ? sidebarEl.querySelectorAll(".kn-os-tab") : [];

  const searchInput        = document.getElementById("kn-search-input");

  const topModeSection     = document.getElementById("top-mode");
  const osModeSection      = document.getElementById("os-mode");
  const osStructureSection = document.querySelector(".kn-os-structure-section");

  const todayCardContainer = document.getElementById("kn-today-card");
  const todayRefreshBtn    = document.getElementById("kn-today-refresh");

  const shortcutButtons    = document.querySelectorAll(".kn-shortcut");

  const resultsContainer   = document.getElementById("kn-results-container");
  const resultsMetaEl      = document.getElementById("kn-results-meta");
  const subTabsContainer   = document.getElementById("kn-subcategory-tabs");

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
        loadUserData();      // ★ localStorage から favorites / likes / history 復元
        renderTodayCard();   // トップモード用
        renderResults();     // OSモード用（トップでは一覧非表示）
        updateModeVisibility();
        renderSubTabs();
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
  // localStorage：ユーザーデータの読み書き（④の基盤）
  // ============================================================
  function loadUserData() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed.favorites)) {
        userData.favorites = parsed.favorites;
      }
      if (parsed.likes && typeof parsed.likes === "object") {
        userData.likes = parsed.likes;
      }
      if (Array.isArray(parsed.history)) {
        userData.history = parsed.history;
      }
    } catch (e) {
      console.warn("failed to load userData from localStorage", e);
    }
  }

  function saveUserData() {
    try {
      const payload = {
        favorites: userData.favorites,
        likes: userData.likes,
        history: userData.history
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("failed to save userData to localStorage", e);
    }
  }

  function isFavorite(globalId) {
    return userData.favorites.includes(globalId);
  }

  function toggleFavorite(globalId) {
    const idx = userData.favorites.indexOf(globalId);
    if (idx >= 0) {
      userData.favorites.splice(idx, 1);
    } else {
      userData.favorites.push(globalId);
    }
    saveUserData();
  }

  function getLikeCount(globalId) {
    return userData.likes[globalId] || 0;
  }

  function incrementLike(globalId) {
    const current = userData.likes[globalId] || 0;
    userData.likes[globalId] = current + 1;
    saveUserData();
  }

  function recordHistory(globalId) {
    if (!globalId) return;
    const idx = userData.history.indexOf(globalId);
    if (idx >= 0) {
      userData.history.splice(idx, 1);
    }
    userData.history.unshift(globalId);
    if (userData.history.length > 100) {
      userData.history.length = 100;
    }
    saveUserData();
  }

  // ============================================================
  // データロード（② JSON一元管理 ＋ ① 永続ID付与）
  // ============================================================
 function loadAllCategories() {
  const entries = Object.entries(categoryConfigs);

  const promises = entries.map(([categoryId, config]) => {
    return fetch(config.jsonPath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`failed to load ${config.jsonPath} (${res.status})`);
        }
        // いったんテキストとして受け取る
        return res.text();
      })
      .then((text) => {
        try {
          const json = JSON.parse(text);

          const topics = Array.isArray(json.topics) ? json.topics : [];
          topics.forEach((topic) => {
            const rawSub = (topic.subCategory || "").trim();
            const normalizedSub = rawSub || "other";
            const cloned = Object.assign({}, topic, {
              _category: categoryId,
              _subCategory: normalizedSub
            });
            state.topics.push(cloned);
          });
        } catch (error) {
          console.error("JSON パースエラー:", config.jsonPath, error);
          console.error("----- 問題の JSON 末尾 500 文字 -----");
          console.error(text.slice(-500));
          // ここで throw しておけば、どこで落ちたか分かる
          throw error;
        }
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

    // サブカテゴリタブを更新
    renderSubTabs();

    // OSモードのときだけ一覧を再描画
    renderResults();
  }

  // ============================================================
  // モード表示切り替え（③ UI構造の固定）
  // ============================================================
  function updateModeVisibility() {
    const isTop = state.activeCategory === "all";

    if (topModeSection) {
      topModeSection.hidden = !isTop;
      topModeSection.style.display = isTop ? "" : "none";
    }
    if (osModeSection) {
      osModeSection.hidden = isTop;
      osModeSection.style.display = isTop ? "none" : "";
    }
    if (osStructureSection) {
      osStructureSection.hidden = !isTop;
      osStructureSection.style.display = isTop ? "" : "none";
    }
  }

  // ============================================================
  // サブカテゴリタブ
  // ============================================================
  function renderSubTabs() {
    if (!subTabsContainer) return;

    const cat = state.activeCategory;

    // ≪トップ≫や不明カテゴリでは非表示
    if (!cat || cat === "all" || !subCategoryConfigs[cat]) {
      subTabsContainer.innerHTML = "";
      subTabsContainer.style.display = "none";
      return;
    }

    const defs = subCategoryConfigs[cat];
    const currentSub = state.activeSubCategory[cat] || "all";

    subTabsContainer.innerHTML = "";
    subTabsContainer.style.display = "";

    defs.forEach((def) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kn-subtab";
      if (def.id === currentSub) {
        btn.classList.add("is-active");
      }
      btn.textContent = def.label;
      btn.dataset.subcategoryId = def.id;

      btn.addEventListener("click", () => {
        setActiveSubCategory(cat, def.id);
      });

      subTabsContainer.appendChild(btn);
    });
  }

  function setActiveSubCategory(categoryId, subId) {
    if (!state.activeSubCategory[categoryId]) {
      state.activeSubCategory[categoryId] = "all";
    }
    state.activeSubCategory[categoryId] = subId || "all";

    // サブタブの見た目を更新
    renderSubTabs();

    // 結果一覧を再描画
    renderResults();
  }

  function getCategoryLabel(categoryId) {
    const cfg = categoryConfigs[categoryId];
    return cfg ? cfg.label : "不明カテゴリ";
  }

  function getSubCategoryLabel(categoryId, subId) {
    if (!subId || subId === "all") return "すべて";
    const defs = subCategoryConfigs[categoryId];
    if (!defs) return "";
    const found = defs.find((d) => d.id === subId);
    return found ? found.label : "";
  }

  // ============================================================
  // 検索入力（上の1本だけを全タブ共通で使う）
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
        if (searchInput) {
          searchInput.value = keyword;
        }
        state.search = keyword;
        renderResults();
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
    const subId     = (state.activeSubCategory[activeCat] || "all");

    let filtered = allTopics;

    // カテゴリフィルタ（all 以外しかここには来ない）
    if (activeCat && activeCat !== "all") {
      filtered = filtered.filter((t) => t._category === activeCat);
    }

    // サブカテゴリフィルタ
    if (activeCat && activeCat !== "all" && subId && subId !== "all") {
      filtered = filtered.filter((t) => {
        const topicSub = t._subCategory || "other";
        return topicSub === subId;
      });
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

    const catLabelText = getCategoryLabel(activeCat);
    const subLabelText = getSubCategoryLabel(activeCat, subId);

    if (!keyword) {
      if (subId === "all" || !subLabelText) {
        resultsMetaEl.textContent = `${catLabelText} から ${totalCount}件を表示中。`;
      } else {
        resultsMetaEl.textContent = `${catLabelText}｜${subLabelText} から ${totalCount}件を表示中。`;
      }
    } else {
      if (subId === "all" || !subLabelText) {
        resultsMetaEl.textContent = `${catLabelText} × 「${keyword}」で ${totalCount}件ヒットしました。`;
      } else {
        resultsMetaEl.textContent = `${catLabelText}｜${subLabelText} × 「${keyword}」で ${totalCount}件ヒットしました。`;
      }
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
  // カード生成（各カードごとに独立して開閉・高さ揃え無し）
  // ここで ① 永続ID を UI上に表示し、
  // ④ localStorage を使った favorites / likes を紐づける。
  // ============================================================
  function createShoseiCard(topic) {
    const card = document.createElement("article");
    card.className = "shosei-card";
    card.dataset.globalId = topic._globalId || "";

    const titleEl = document.createElement("h3");
    titleEl.className = "shosei-title";
    titleEl.textContent = topic.title || "タイトル未設定";

    const summaryEl = document.createElement("p");
    summaryEl.className = "shosei-summary";
    summaryEl.textContent = topic.summary || "";

    // ▼ ID + お気に入り / いいね 行
    const metaRow = document.createElement("div");
    metaRow.className = "shosei-meta-row";

    const idSpan = document.createElement("span");
    idSpan.className = "shosei-id";
    idSpan.textContent = topic._cardId || topic._globalId || "ID未設定";

    const controls = document.createElement("div");
    controls.className = "shosei-controls";

    // お気に入り（★）
    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "shosei-ctrl-btn shosei-fav-btn";
    favBtn.setAttribute("aria-label", "この処世術をお気に入りに追加");
    favBtn.textContent = "★";

    if (isFavorite(topic._globalId)) {
      favBtn.classList.add("is-active");
    }

    favBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // カードの開閉とは独立
      toggleFavorite(topic._globalId);

      if (isFavorite(topic._globalId)) {
        favBtn.classList.add("is-active");
      } else {
        favBtn.classList.remove("is-active");
      }
    });

    // いいね（♥ + カウント）
    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = "shosei-ctrl-btn shosei-like-btn";
    likeBtn.setAttribute("aria-label", "この処世術にいいね");

    const likeIconSpan = document.createElement("span");
    likeIconSpan.textContent = "♥";

    const likeCountSpan = document.createElement("span");
    likeCountSpan.className = "shosei-like-btn-count";
    likeCountSpan.textContent = String(getLikeCount(topic._globalId));

    likeBtn.appendChild(likeIconSpan);
    likeBtn.appendChild(likeCountSpan);

    likeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      incrementLike(topic._globalId);
      likeCountSpan.textContent = String(getLikeCount(topic._globalId));
    });

    controls.appendChild(favBtn);
    controls.appendChild(likeBtn);

    metaRow.appendChild(idSpan);
    metaRow.appendChild(controls);

    // タグ
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

    // 詳細
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

    // ▼ 各カードごとに独立した開閉状態を持たせる（高さはCSS側に任せる）
    let isOpen = false;

    card.addEventListener("click", (event) => {
      // aタグやボタンが中に入ってきた場合の保険
      if (event.target.closest("a, button")) return;

      isOpen = !isOpen;
      card.classList.toggle("is-open", isOpen);

      // 開かれたカードだけ履歴に記録（history は基盤だけ作っておく）
      if (isOpen) {
        recordHistory(topic._globalId);
      }
    });

    card.appendChild(titleEl);
    card.appendChild(summaryEl);
    card.appendChild(metaRow);
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

