// knowledge-notes.js
// 処世術禄：トップモード / OSモード / 検索 / 今日の処世術 / お気に入り / いいね

(function () {
  "use strict";

  // ============================================================
  // カテゴリ設定（JSON一元管理前提）
  // ============================================================
  const categoryConfigs = {
    mind: {
      id: "mind",
      jsonPath: "data/shoseijutsu/mind.json",
      label: "心の扱い方（内部OS）",
      icon: "🧠"
    },
    relation: {
      id: "relation",
      jsonPath: "data/shoseijutsu/relation.json",
      label: "人との関わり方（対人OS）",
      icon: "🤝"
    },
    work: {
      id: "work",
      jsonPath: "data/shoseijutsu/work.json",
      label: "社会での立ち回り（社会OS）",
      icon: "🏢"
    },
    habit: {
      id: "habit",
      jsonPath: "data/shoseijutsu/habit.json",
      label: "行動・習慣の技術（行動OS）",
      icon: "⚙️"
    },
    future: {
      id: "future",
      jsonPath: "data/shoseijutsu/future.json",
      label: "キャッチアップの極意（未来OS）",
      icon: "📡"
    }
  };

  // OSごとのサブカテゴリ（UI表示用）
  const subCategoryOptions = {
    mind: [
      { id: "all", label: "すべて" },
      { id: "emotion", label: "感情" },
      { id: "thought", label: "思考" },
      { id: "self", label: "自己イメージ" },
      { id: "stress", label: "ストレス" },
      { id: "other", label: "その他" }
    ],
    relation: [
      { id: "all", label: "すべて" },
      { id: "close", label: "家族・恋人" },
      { id: "middle", label: "友人・同僚" },
      { id: "boss", label: "上司・組織" },
      { id: "boundary", label: "境界線" },
      { id: "other", label: "その他" }
    ],
    work: [
      { id: "all", label: "すべて" },
      { id: "evaluation", label: "評価" },
      { id: "safety", label: "安全保障" },
      { id: "negotiation", label: "交渉" },
      { id: "context", label: "環境理解" },
      { id: "other", label: "その他" }
    ],
    habit: [
      { id: "all", label: "すべて" },
      { id: "routine", label: "ルーティン" },
      { id: "productivity", label: "生産性" },
      { id: "health", label: "健康" },
      { id: "mindset", label: "マインドセット" },
      { id: "other", label: "その他" }
    ],
    future: [
      { id: "all", label: "すべて" },
      { id: "info", label: "情報収集" },
      { id: "learning", label: "学習" },
      { id: "ai", label: "AI活用" },
      { id: "strategy", label: "キャリア戦略" },
      { id: "other", label: "その他" }
    ]
  };

  // ============================================================
  // 状態管理
  // ============================================================
  const state = {
    loaded: false,
    // トピック:
    // { title, summary, tags, essence, traps, actionTips,
    //   _category, _subCategory, _cardId, _globalId }
    topics: [],
    activeCategory: "all",
    search: "",
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

  let userData = {
    favorites: [], // [globalId, ...]
    likes: {},     // { [globalId]: number }
    history: []    // 最近開いたカード [globalId, ...]
  };

  function loadUserData() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        userData = {
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
          likes: parsed.likes && typeof parsed.likes === "object" ? parsed.likes : {},
          history: Array.isArray(parsed.history) ? parsed.history : []
        };
      }
    } catch (e) {
      console.warn("Failed to load user data", e);
    }
  }

  function saveUserData() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.warn("Failed to save user data", e);
    }
  }

  function isFavorite(globalId) {
    return userData.favorites.includes(globalId);
  }

  function toggleFavorite(globalId) {
    if (!globalId) return;
    if (isFavorite(globalId)) {
      userData.favorites = userData.favorites.filter((id) => id !== globalId);
    } else {
      userData.favorites.push(globalId);
    }
    saveUserData();
  }

  function getLikeCount(globalId) {
    if (!globalId) return 0;
    return userData.likes[globalId] || 0;
  }

  function incrementLike(globalId) {
    if (!globalId) return;
    const current = userData.likes[globalId] || 0;
    userData.likes[globalId] = current + 1;
    saveUserData();
  }

  function pushHistory(globalId) {
    if (!globalId) return;
    userData.history = [globalId]
      .concat(userData.history.filter((id) => id !== globalId))
      .slice(0, 30);
    saveUserData();
  }

  // ============================================================
  // DOM参照
  // ============================================================
  const sidebarEl = document.getElementById("kn-sidebar");
  const sidebarToggleBtn = document.querySelector(".kn-sidebar-toggle");
  const osTabButtons = sidebarEl ? sidebarEl.querySelectorAll(".kn-os-tab") : [];

  const searchInput = document.getElementById("kn-search-input");

  const topModeSection = document.getElementById("top-mode");
  const osModeSection = document.getElementById("os-mode");
  const osStructureSection = document.querySelector(".kn-os-structure-section");

  const todayCardContainer = document.getElementById("kn-today-card");
  const todayRefreshBtn = document.getElementById("kn-today-refresh");

  const shortcutButtons = document.querySelectorAll(".kn-shortcut");

  const resultsContainer = document.getElementById("kn-results-container");
  const resultsMetaEl = document.getElementById("kn-results-meta");
  const resultsTitleEl = document.getElementById("kn-results-title");
  const subTabsContainer = document.getElementById("kn-subcategory-tabs");

  // ============================================================
  // 初期化
  // ============================================================
  function init() {
    loadUserData();
    attachEventListeners();
    fetchAllTopics()
      .then(() => {
        state.loaded = true;
        renderInitialView();
      })
      .catch((err) => {
        console.error("処世術カードの読み込みに失敗しました", err);
        if (todayCardContainer) {
          todayCardContainer.innerHTML =
            '<p class="kn-loading-text">カードの読み込みに失敗しました。</p>';
        }
      });
  }

  function attachEventListeners() {
    // サイドバータブ
    osTabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.getAttribute("data-category") || "all";
        setActiveCategory(category);
      });
    });

    // サイドバー（スマホ）トグル
    if (sidebarToggleBtn && sidebarEl) {
      sidebarToggleBtn.addEventListener("click", () => {
        const expanded = sidebarToggleBtn.getAttribute("aria-expanded") === "true";
        const newState = !expanded;
        sidebarToggleBtn.setAttribute("aria-expanded", String(newState));
        sidebarEl.classList.toggle("is-open", newState);
      });
    }

    // 検索バー
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.search = searchInput.value.trim();
        refreshCurrentView();
      });
    }

    // ショートカット
    shortcutButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const keyword = btn.getAttribute("data-keyword") || "";
        if (searchInput) {
          searchInput.value = keyword;
          state.search = keyword;
        }
        // ショートカットはトップモードのままキーワード検索
        refreshCurrentView();
      });
    });

    // 今日の処世術 更新
    if (todayRefreshBtn) {
      todayRefreshBtn.addEventListener("click", () => {
        renderTodayCard(true);
      });
    }
  }

  // ============================================================
  // データ読み込み
  // ============================================================

  // JSON からカード配列を取り出すためのユーティリティ
  function extractTopicArray(json, cfg) {
    // そのまま配列ならOK
    if (Array.isArray(json)) {
      return json;
    }

    // オブジェクトの場合、よくありそうなキーから取り出す
    if (json && typeof json === "object") {
      const candidateKeys = ["cards", "items", "data", "list", "topics"];
      for (const key of candidateKeys) {
        if (Array.isArray(json[key])) {
          return json[key];
        }
      }
    }

    console.warn("JSON format unexpected for", cfg.jsonPath, json);
    return [];
  }

  function fetchAllTopics() {
    const entries = Object.entries(categoryConfigs);
    const promises = entries.map(([categoryId, cfg]) =>
      fetch(cfg.jsonPath)
        .then((res) => {
          if (!res.ok) throw new Error(`${cfg.jsonPath} 読み込みエラー`);
          return res.json();
        })
        .then((json) => {
          const list = extractTopicArray(json, cfg);
          return list.map((item, index) => normalizeTopic(item, categoryId, index));
        })
        .catch((err) => {
          console.warn("カテゴリ読み込み失敗:", categoryId, err);
          return [];
        })
    );

    return Promise.all(promises).then((results) => {
      const merged = [];
      results.forEach((arr) => merged.push(...arr));
      state.topics = merged;
    });
  }

  function normalizeTopic(raw, categoryId, index) {
    const cfg = categoryConfigs[categoryId];
    const safeTitle = raw.title || raw.name || "タイトル未設定";
    const safeSummary = raw.summary || raw.description || "";
    const tags = Array.isArray(raw.tags) ? raw.tags : raw.tags ? [raw.tags] : [];
    const essence = raw.essence || raw.core || "";
    const traps = raw.traps || raw.troubles || raw.pitfalls || "";
    const actionTips = raw.actionTips || raw.actions || raw.howto || "";

    const subCatRaw = raw.subCategory || raw.subcategory || raw.area || "other";

    const globalId = `${categoryId}-${index + 1}`;

    return {
      title: safeTitle,
      summary: safeSummary,
      tags,
      essence,
      traps,
      actionTips,
      _category: categoryId,
      _subCategory: subCatRaw,
      _cardId: index + 1,
      _globalId: globalId
    };
  }

  // ============================================================
  // 表示切り替え
  // ============================================================
  function setActiveCategory(category) {
    state.activeCategory = category || "all";

    // OSタブの見た目
    osTabButtons.forEach((btn) => {
      const cat = btn.getAttribute("data-category") || "";
      btn.classList.toggle("is-active", cat === state.activeCategory);
    });

    refreshCurrentView();
  }

  function renderInitialView() {
    // 初期はトップモード
    setActiveCategory("all");
    renderTodayCard(false);
  }

  function refreshCurrentView() {
    if (state.activeCategory === "all") {
      showTopMode();
      renderTodayCard(false);
    } else {
      showOsMode();
      renderResults();
    }
  }

  function showTopMode() {
    if (topModeSection) topModeSection.hidden = false;
    if (osModeSection) osModeSection.hidden = true;
    if (osStructureSection) osStructureSection.style.display = "";
  }

  function showOsMode() {
    if (topModeSection) topModeSection.hidden = true;
    if (osModeSection) osModeSection.hidden = false;
    if (osStructureSection) osStructureSection.style.display = "none";
  }

  // ============================================================
  // 今日の処世術
  // ============================================================
  function renderTodayCard(forceRefresh) {
    if (!todayCardContainer || !state.topics.length) return;

    todayCardContainer.innerHTML = "";

    const candidates = state.topics;
    if (!candidates.length) {
      todayCardContainer.innerHTML =
        '<p class="kn-loading-text">カードがまだ登録されていません。</p>';
      return;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const topic = candidates[randomIndex];

    const card = createShoseiCard(topic, { compact: true });
    card.classList.add("is-today");

    // カテゴリラベル（OS名）をタグ先頭に
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
    if (!resultsContainer || !state.topics.length) return;

    const catId = state.activeCategory;
    const cfg = categoryConfigs[catId];

    // タイトル
    if (resultsTitleEl) {
      resultsTitleEl.textContent = cfg
        ? `${cfg.label} の処世術一覧`
        : "処世術カード一覧";
    }

    // サブカテゴリタブ
    renderSubCategoryTabs(catId);

    // フィルタリング
    const subActive = state.activeSubCategory[catId] || "all";
    const keyword = (state.search || "").toLowerCase();

    let filtered = state.topics.filter((t) => t._category === catId);

    if (subActive !== "all") {
      filtered = filtered.filter((t) => {
        const sc = (t._subCategory || "").toString().toLowerCase();
        return sc === subActive.toLowerCase();
      });
    }

    if (keyword) {
      filtered = filtered.filter((t) => {
        const joined = [
          t.title,
          t.summary,
          t.essence,
          t.traps,
          t.actionTips,
          (t.tags || []).join(" ")
        ]
          .join(" ")
          .toLowerCase();
        return joined.includes(keyword);
      });
    }

    // メタ
    if (resultsMetaEl) {
      const count = filtered.length;
      const keywordPart = keyword ? `「${state.search}」で絞り込み中 / ` : "";
      const subPart =
        subActive !== "all" && subCategoryOptions[catId]
          ? `サブカテゴリ：${
              (subCategoryOptions[catId].find((o) => o.id === subActive) || {}).label ||
              "その他"
            } / `
          : "";
      resultsMetaEl.textContent = `${keywordPart}${subPart}件数：${count} 件`;
    }

    // 表示
    resultsContainer.innerHTML = "";
    if (!filtered.length) {
      const p = document.createElement("p");
      p.className = "kn-loading-text";
      p.textContent = "条件に合う処世術カードが見つかりませんでした。";
      resultsContainer.appendChild(p);
      return;
    }

    filtered.forEach((topic) => {
      const card = createShoseiCard(topic);
      card.classList.add("fade-up");
      resultsContainer.appendChild(card);
    });
  }

  function renderSubCategoryTabs(catId) {
    if (!subTabsContainer) return;
    subTabsContainer.innerHTML = "";

    const options = subCategoryOptions[catId];
    if (!options || !options.length) return;

    const activeId = state.activeSubCategory[catId] || "all";

    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kn-subtab";
      if (opt.id === activeId) {
        btn.classList.add("is-active");
      }
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        state.activeSubCategory[catId] = opt.id;
        renderResults();
      });
      subTabsContainer.appendChild(btn);
    });
  }

  // ============================================================
  // カード生成
  // ============================================================
  function createShoseiCard(topic, options) {
    const opts = options || {};
    const catId = topic._category || "other";
    const cfg = categoryConfigs[catId];

    const card = document.createElement("article");
    card.className = "shosei-card";
    card.dataset.globalId = topic._globalId || "";

    // OSクラス
    card.classList.add(`os-${catId}`);
    if (opts.compact) {
      card.classList.add("shosei-card--compact");
    }

    // OS帯
    const band = document.createElement("div");
    band.className = "shosei-os-band";
    card.appendChild(band);

    // タイトル
    const titleEl = document.createElement("h3");
    titleEl.className = "shosei-title";

    if (cfg && cfg.icon) {
      const iconSpan = document.createElement("span");
      iconSpan.className = "shosei-title-icon";
      iconSpan.textContent = cfg.icon;
      titleEl.appendChild(iconSpan);
    }

    const titleTextNode = document.createElement("span");
    titleTextNode.textContent = topic.title || "タイトル未設定";
    titleEl.appendChild(titleTextNode);

    card.appendChild(titleEl);

    // サマリー
    if (topic.summary) {
      const summaryEl = document.createElement("p");
      summaryEl.className = "shosei-summary";
      summaryEl.textContent = topic.summary;
      card.appendChild(summaryEl);
    }

    // ▼ ID + お気に入り / いいね 行
    const metaRow = document.createElement("div");
    metaRow.className = "shosei-meta-row";

    const idSpan = document.createElement("span");
    idSpan.className = "shosei-id";
    idSpan.textContent = topic._globalId || "";

    const controls = document.createElement("div");
    controls.className = "shosei-controls";

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
    card.appendChild(metaRow);

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
    card.appendChild(tagsWrap);

    // 詳細部分
    const detail = document.createElement("div");
    detail.className = "shosei-detail";

    const detailInner = document.createElement("div");
    detailInner.className = "shosei-detail-inner";

    if (topic.essence) {
      detailInner.appendChild(createDetailBlock("本質・要点", topic.essence));
    }
    if (topic.traps) {
      detailInner.appendChild(createDetailBlock("やりがちな落とし穴", topic.traps));
    }
    if (topic.actionTips) {
      detailInner.appendChild(createDetailBlock("具体的な一手", topic.actionTips));
    }

    detail.appendChild(detailInner);
    card.appendChild(detail);

    // カードクリックで詳細開閉
    card.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      if (isOpen) {
        pushHistory(topic._globalId);
      }
    });

    return card;
  }

  function createDetailBlock(title, content) {
    const block = document.createElement("div");
    block.className = "detail-block";

    const titleEl = document.createElement("h4");
    titleEl.className = "detail-title";
    titleEl.textContent = title;

    const list = document.createElement("ul");
    list.className = "detail-list";

    if (Array.isArray(content)) {
      content.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
    } else if (typeof content === "string") {
      // 改行で分割して箇条書き風に
      const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length > 1) {
        lines.forEach((line) => {
          const li = document.createElement("li");
          li.textContent = line;
          list.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = content;
        list.appendChild(li);
      }
    }

    block.appendChild(titleEl);
    block.appendChild(list);
    return block;
  }

  // ============================================================
  // 実行
  // ============================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
