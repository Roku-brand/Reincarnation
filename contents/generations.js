// =====================================================
// 世代別ノート ページ用スクリプト
// - ?stage=top / elementary / middle ... に応じて内容を切り替え
// - デフォルトは "top"（≪トップ≫タブ）
// - 各ステージは ./data/<stage>.json から読み込み
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".gen-tab"));
  const contentRoot = document.getElementById("genContentRoot");

  // クエリパラメータから stage を取得
  const params = new URLSearchParams(window.location.search);
  let currentStage = params.get("stage") || "top";

  // 存在しない値対策
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
  if (!validStages.includes(currentStage)) {
    currentStage = "top";
  }

  // 初期レンダリング
  setActiveTab(currentStage);
  renderStage(currentStage);

  // タブクリックイベント
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const stage = tab.dataset.stage;
      if (!stage || !validStages.includes(stage)) return;

      currentStage = stage;
      // URL 更新（履歴を汚しすぎないように replaceState）
      const baseUrl = window.location.pathname;
      const newUrl =
        stage === "top" ? `${baseUrl}` : `${baseUrl}?stage=${stage}`;
      window.history.replaceState(null, "", newUrl);

      setActiveTab(stage);
      renderStage(stage);
    });
  });

  // -----------------------------------------------------
  // タブのアクティブ状態を切り替え
  // -----------------------------------------------------
  function setActiveTab(stage) {
    tabs.forEach((tab) => {
      if (tab.dataset.stage === stage) {
        tab.classList.add("gen-tab-active");
      } else {
        tab.classList.remove("gen-tab-active");
      }
    });
  }

  // -----------------------------------------------------
  // ステージに応じて描画
  // -----------------------------------------------------
  function renderStage(stage) {
    if (!contentRoot) return;
    contentRoot.innerHTML = "";

    if (stage === "top") {
      renderTopView();
      return;
    }

    // 各ステージは JSON から読み込み
    const jsonPath = `data/${stage}.json`;
    fetch(jsonPath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`JSON 読み込みエラー: ${jsonPath}`);
        }
        return res.json();
      })
      .then((data) => {
        renderStageFromJson(data);
      })
      .catch((err) => {
        console.error(err);
        renderError(`データを読み込めませんでした。（${jsonPath}）`);
      });
  }

  // -----------------------------------------------------
  // トップタブ：人生マップ（デモ）
  // -----------------------------------------------------
  function renderTopView() {
    const card = document.createElement("div");
    card.className = "gen-card";

    card.innerHTML = `
      <div class="gen-map-header">
        <h2 class="gen-map-title">人生マップ（デモ）</h2>
        <p class="gen-map-sub">
          小学生〜セカンドキャリアまでの流れを、二周目視点でざっくり俯瞰できるマップです。<br>
          ここから、気になるステージをタブで選んで掘り下げていきます。
        </p>
      </div>

      <div class="gen-map-timeline">
        <div class="gen-map-line"></div>

        <div class="gen-map-stage-row">
          <div class="gen-map-stage">
            <div class="gen-map-dot"></div>
            <div class="gen-map-stage-label">小学生</div>
            <div class="gen-map-stage-note">「世界のルール」を初めて知る時期</div>
          </div>
          <div class="gen-map-stage">
            <div class="gen-map-dot"></div>
            <div class="gen-map-stage-label">中学生</div>
            <div class="gen-map-stage-note">比較と序列が意識に入り込む</div>
          </div>
          <div class="gen-map-stage">
            <div class="gen-map-dot"></div>
            <div class="gen-map-stage-label">高校生</div>
            <div class="gen-map-stage-note">「将来何者になるか」問題が立ち上がる</div>
          </div>
          <div class="gen-map-stage">
            <div class="gen-map-dot gen-map-dot--mid"></div>
            <div class="gen-map-stage-label">大学・専門期</div>
            <div class="gen-map-stage-note">選択の幅が一時的に最大になる</div>
          </div>
        </div>

        <div class="gen-map-stage-row">
          <div class="gen-map-stage">
            <div class="gen-map-dot gen-map-dot--mid"></div>
            <div class="gen-map-stage-label">社会人前期</div>
            <div class="gen-map-stage-note">実戦で「自分のパターン」を知るフェーズ</div>
          </div>
          <div class="gen-map-stage">
            <div class="gen-map-dot gen-map-dot--mid"></div>
            <div class="gen-map-stage-label">社会人中期</div>
            <div class="gen-map-stage-note">責任と自由のバランスが重くなる</div>
          </div>
          <div class="gen-map-stage">
            <div class="gen-map-dot"></div>
            <div class="gen-map-stage-label">社会人後期</div>
            <div class="gen-map-stage-note">守るものと手放すものを選び始める</div>
          </div>
          <div class="gen-map-stage">
            <div class="gen-map-dot gen-map-dot--end"></div>
            <div class="gen-map-stage-label">セカンドキャリア</div>
            <div class="gen-map-stage-note">「何を残すか」のフェーズ</div>
          </div>
        </div>

        <div class="gen-map-phases">
          <div class="gen-phase-card">
            <h3 class="gen-phase-title">① 成長のフェーズ</h3>
            <p class="gen-phase-text">
              小〜高校は、「自分が選べない前提」が多い時期。<br>
              二周目視点では、自分を責めるより「環境の構造」を理解することが大事になります。
            </p>
          </div>
          <div class="gen-phase-card">
            <h3 class="gen-phase-title">② 選択が増えるフェーズ</h3>
            <p class="gen-phase-text">
              大学・専門期〜社会人前期は、選択肢が一気に増える一方で、<br>
              「本当に選び直せる期限」も同時に進んでいきます。
            </p>
          </div>
          <div class="gen-phase-card">
            <h3 class="gen-phase-title">③ 仕事の重みが増すフェーズ</h3>
            <p class="gen-phase-text">
              社会人中期〜後期は、役割と責任が増え、<br>
              自分だけの問題ではなくなることで判断が難しくなります。
            </p>
          </div>
          <div class="gen-phase-card">
            <h3 class="gen-phase-title">④ 自由度が再び高まるフェーズ</h3>
            <p class="gen-phase-text">
              セカンドキャリアは、「もう一度人生を再設計する」タイミング。<br>
              一周目の経験を、二周目の自由さに変換していくステージです。
            </p>
          </div>
        </div>
      </div>
    `;

    contentRoot.appendChild(card);
  }

  // -----------------------------------------------------
  // 各ステージ：JSON から描画（簡易版7部構成）
  // -----------------------------------------------------
  function renderStageFromJson(data) {
    if (!data) {
      renderError("データが見つかりません。");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "gen-stage-wrapper";

    // 1. 概要
    const headerCard = document.createElement("div");
    headerCard.className = "gen-card gen-stage-header";

    headerCard.innerHTML = `
      <h2 class="gen-stage-title">${escapeHtml(data.title || "")}</h2>
      <p class="gen-stage-overview">${escapeHtml(data.overview || "")}</p>
      <div class="gen-tag-row">
        ${(data.essence || [])
          .map(
            (e) =>
              `<span class="gen-tag-pill">${escapeHtml(e)}</span>`
          )
          .join("")}
      </div>
    `;

    // 2. 本質（Essence）＋ 3. 分岐（commonPaths）＋ 4. 迷い（pains）
    const coreCard = document.createElement("div");
    coreCard.className = "gen-card";

    coreCard.innerHTML = `
      <h3 class="gen-section-title">このステージの本質</h3>
      <p class="gen-section-sub">よくある構造・分岐・迷いをざっくり整理しています。</p>

      <h4 class="gen-section-title" style="font-size:0.92rem;margin-top:10px;">よくある分岐パターン</h4>
      <ul class="gen-list">
        ${(data.commonPaths || [])
          .map(
            (p) =>
              `<li><span class="gen-inline-label">${escapeHtml(
                p.label || ""
              )}</span>：${escapeHtml(p.desc || "")}</li>`
          )
          .join("")}
      </ul>

      <h4 class="gen-section-title" style="font-size:0.92rem;margin-top:14px;">よくある迷い・不安</h4>
      <ul class="gen-list">
        ${(data.pains || [])
          .map((p) => `<li>${escapeHtml(p)}</li>`)
          .join("")}
      </ul>
    `;

    // 5. Insights（二周目視点 × 処世術）
    const insightsCard = document.createElement("div");
    insightsCard.className = "gen-card";

    insightsCard.innerHTML = `
      <h3 class="gen-section-title">二周目視点 × 処世術</h3>
      <p class="gen-section-sub">一周目でつまずきやすいポイントを、構造ごと整理したメモです。</p>
    `;

    const insightsList = document.createElement("div");
    (data.insights || []).forEach((ins) => {
      const item = document.createElement("div");
      item.className = "gen-insight-item";
      item.innerHTML = `
        <p class="gen-insight-title">${escapeHtml(ins.title || "")}</p>
        <p class="gen-insight-abstract">${escapeHtml(ins.abstract || "")}</p>
        <p class="gen-insight-action">${escapeHtml(ins.action || "")}</p>
      `;
      insightsList.appendChild(item);
    });
    insightsCard.appendChild(insightsList);

    // 6. Choices（選択のコンパス）
    const choicesCard = document.createElement("div");
    choicesCard.className = "gen-card";

    choicesCard.innerHTML = `
      <h3 class="gen-section-title">選択のコンパス</h3>
      <p class="gen-section-sub">どちらを選んでもいいが、「何を大事にするか」を意識して選ぶためのメモです。</p>
    `;

    const choicesList = document.createElement("div");
    (data.choices || []).forEach((ch) => {
      const item = document.createElement("div");
      item.className = "gen-choice-item";
      item.innerHTML = `
        <p class="gen-choice-title">${escapeHtml(ch.title || "")}</p>
        <p class="gen-choice-text">${escapeHtml(ch.insight || "")}</p>
      `;
      choicesList.appendChild(item);
    });
    choicesCard.appendChild(choicesList);

    // 7. Final Line
    const finalCard = document.createElement("div");
    finalCard.className = "gen-card";
    finalCard.innerHTML = `
      <p class="gen-final-line">${escapeHtml(data.finalLine || "")}</p>
    `;

    wrapper.appendChild(headerCard);
    wrapper.appendChild(coreCard);
    wrapper.appendChild(insightsCard);
    wrapper.appendChild(choicesCard);
    wrapper.appendChild(finalCard);

    contentRoot.appendChild(wrapper);
  }

  // -----------------------------------------------------
  // エラー表示
  // -----------------------------------------------------
  function renderError(msg) {
    const card = document.createElement("div");
    card.className = "gen-card";
    card.innerHTML = `
      <p style="margin:0;font-size:0.9rem;color:var(--text-sub);">
        ${escapeHtml(msg)}
      </p>
    `;
    contentRoot.appendChild(card);
  }

  // -----------------------------------------------------
  // シンプルなエスケープ
  // -----------------------------------------------------
  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
