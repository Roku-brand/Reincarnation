// knowledge-notes.js
// 処世術ノート：タブ切り替え / JSONロード / 検索 / タグフィルタ / カード展開

(function () {
  // ============================================================
  // タブ切り替え（≪トップ≫〜未来OS）
  // ============================================================
  const tabButtons = document.querySelectorAll(".notes-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");

  function switchTab(targetId) {
    tabButtons.forEach((btn) => {
      const target = btn.getAttribute("data-target");
      btn.classList.toggle("is-active", target === targetId);
    });

    tabPanels.forEach((panel) => {
      if (panel.id === targetId) {
        panel.hidden = false;
        panel.classList.add("is-active");
      } else {
        panel.hidden = true;
        panel.classList.remove("is-active");
      }
    });

    // カテゴリタブなら、初回ロードをトリガー
    const categoryIdMap = {
      "tab-mind": "mind",
      "tab-relation": "relation",
      "tab-work": "work",
      "tab-habit": "habit",
      "tab-future": "future"
    };
    const catId = categoryIdMap[targetId];
    if (catId) {
      ensureCategoryLoaded(catId);
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      switchTab(target);
    });
  });

  // 初期表示
  switchTab("tab-top");

  // ============================================================
  // カテゴリごとの設定・状態
  // ============================================================

  const categoryConfigs = {
    mind: {
      jsonPath: "data/shoseijutsu/mind.json",
      cardsContainerId: "cards-mind",
      tagsContainerId: "tags-mind"
    },
    relation: {
      jsonPath: "data/shoseijutsu/relation.json",
      cardsContainerId: "cards-relation",
      tagsContainerId: "tags-relation"
    },
    work: {
      jsonPath: "data/shoseijutsu/work.json",
      cardsContainerId: "cards-work",
      tagsContainerId: "tags-work"
    },
    habit: {
      jsonPath: "data/shoseijutsu/habit.json",
      cardsContainerId: "cards-habit",
      tagsContainerId: "tags-habit"
    },
    future: {
      jsonPath: "data/shoseijutsu/future.json",
      cardsContainerId: "cards-future",
      tagsContainerId: "tags-future"
    }
  };

  const categoryState = {
    mind: { loaded: false, data: null, search: "", activeTag: null },
    relation: { loaded: false, data: null, search: "", activeTag: null },
    work: { loaded: false, data: null, search: "", activeTag: null },
    habit: { loaded: false, data: null, search: "", activeTag: null },
    future: { loaded: false, data: null, search: "", activeTag: null }
  };

  // ============================================================
  // カテゴリ JSON のロード
  // ============================================================

  function ensureCategoryLoaded(categoryId) {
    const state = categoryState[categoryId];
    if (!state || state.loaded) return;

    const config = categoryConfigs[categoryId];
    if (!config) return;

    fetch(config.jsonPath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`failed to load ${config.jsonPath}`);
        }
        return res.json();
      })
      .then((data) => {
        state.loaded = true;
        state.data = data;
        buildTagButtons(categoryId);
        renderCards(categoryId);
        attachSearchListener(categoryId);
      })
      .catch((err) => {
        console.error(err);
        const container = document.getElementById(config.cardsContainerId);
        if (container) {
          container.innerHTML =
            '<p style="font-size:12px;color:#b91c1c;">データの読み込み中にエラーが発生しました。</p>';
        }
      });
  }

  // ============================================================
  // タグボタン生成
  // ============================================================

  function buildTagButtons(categoryId) {
    const state = categoryState[categoryId];
    const config = categoryConfigs[categoryId];
    if (!state || !state.data || !config) return;

    const tagsContainer = document.getElementById(config.tagsContainerId);
    if (!tagsContainer) return;

    const topics = Array.isArray(state.data.topics) ? state.data.topics : [];
    const tagSet = new Set();
    topics.forEach((topic) => {
      if (Array.isArray(topic.tags)) {
        topic.tags.forEach((t) => {
          if (t && typeof t === "string") {
            tagSet.add(t);
          }
        });
      }
    });

    tagsContainer.innerHTML = "";

    if (tagSet.size === 0) {
      return;
    }

    const tags = Array.from(tagSet);
    tags.forEach((tagText) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-button";
      btn.textContent = tagText;
      btn.addEventListener("click", () => {
        // 同じタグを再クリックしたら解除
        if (state.activeTag === tagText) {
          state.activeTag = null;
        } else {
          state.activeTag = tagText;
        }
        updateActiveTagButtons(categoryId);
        renderCards(categoryId);
      });
      tagsContainer.appendChild(btn);
    });
  }

  function updateActiveTagButtons(categoryId) {
    const state = categoryState[categoryId];
    const config = categoryConfigs[categoryId];
    if (!state || !config) return;
    const tagsContainer = document.getElementById(config.tagsContainerId);
    if (!tagsContainer) return;

    const buttons = tagsContainer.querySelectorAll(".tag-button");
    buttons.forEach((btn) => {
      if (btn.textContent === state.activeTag) {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    });
  }

  // ============================================================
  // 検索ボックスのイベント紐付け
  // ============================================================

  function attachSearchListener(categoryId) {
    const selector = `.search-input[data-category="${categoryId}"]`;
    const input = document.querySelector(selector);
    if (!input) return;

    const state = categoryState[categoryId];
    input.value = state.search || "";

    input.addEventListener("input", () => {
      state.search = input.value || "";
      renderCards(categoryId);
    });
  }

  // ============================================================
  // カード描画
  // ============================================================

  function renderCards(categoryId) {
    const state = categoryState[categoryId];
    const config = categoryConfigs[categoryId];
    if (!state || !state.data || !config) return;

    const container = document.getElementById(config.cardsContainerId);
    if (!container) return;

    const topics = Array.isArray(state.data.topics) ? state.data.topics : [];

    const keyword = (state.search || "").trim().toLowerCase();
    const activeTag = state.activeTag;

    const filtered = topics.filter((topic) => {
      // キーワードフィルタ
      if (keyword) {
        const title = (topic.title || "").toLowerCase();
        const summary = (topic.summary || "").toLowerCase();
        if (!title.includes(keyword) && !summary.includes(keyword)) {
          return false;
        }
      }
      // タグフィルタ
      if (activeTag) {
        const tags = Array.isArray(topic.tags) ? topic.tags : [];
        if (!tags.includes(activeTag)) {
          return false;
        }
      }
      return true;
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
      const p = document.createElement("p");
      p.style.fontSize = "12px";
      p.style.color = "#6b7280";
      p.textContent = "条件に合う処世術カードがありません。";
      container.appendChild(p);
      return;
    }

    filtered.forEach((topic) => {
      const card = createShoseiCard(topic);
      container.appendChild(card);
    });
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
      detailInner.appendChild(
        createDetailBlock("よくある罠", topic.traps)
      );
    }

    // actionTips
    if (Array.isArray(topic.actionTips) && topic.actionTips.length > 0) {
      detailInner.appendChild(
        createDetailBlock("行動ヒント", topic.actionTips)
      );
    }

    detailWrapper.appendChild(detailInner);

    // カードクリックで詳細開閉
    let isOpen = false;
    function toggleDetail() {
      isOpen = !isOpen;
      if (isOpen) {
        card.classList.add("is-open");
        // 一旦 maxHeight を計算するために auto にする
        detailWrapper.style.maxHeight = detailInner.scrollHeight + "px";
      } else {
        card.classList.remove("is-open");
        detailWrapper.style.maxHeight = "0";
      }
    }

    card.addEventListener("click", (e) => {
      // テキスト選択中のクリックなどもあるので一応許容
      toggleDetail();
    });

    // 概要部分と詳細部分をカードに追加
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
  // 初期ロード：トップタブはHTMLのみ、カテゴリは初回アクセスでロード
  // ============================================================

  // ここでは特に何もしない（タブ切り替え時に ensureCategoryLoaded が走る）

})();
