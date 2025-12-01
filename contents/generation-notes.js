/* ▼ 8ステージデータ */

const stages = [
  {
    id: "child",
    title: "小学生（6〜12歳）",
    summary: "自己形成の最初期。成功体験・安心感・興味の芽が育つ時期。",
    core: [
      "環境の影響をもっとも強く受ける",
      "承認と安心が行動のベースを作る",
      "興味の芽が方向性の原型になる"
    ],
    forks: [
      "得意・不得意の早期固定化",
      "他者比較の始まり",
      "家庭環境による世界観の形成"
    ],
    troubles: [
      "自己肯定感の揺れ",
      "いじめ・孤立の影響が残りやすい",
      "親との関係で性格が偏りやすい"
    ],
    wisdom:
      "小さな成功体験は、人生の“後半でも効く燃料”になる。"
  },

  {
    id: "junior",
    title: "中学生（12〜15歳）",
    summary: "自我が急激に伸びる時期。自己像の揺れが一番激しい。",
    core: [
      "自意識の拡大と混乱",
      "友人関係の重みが増す",
      "進路選択の最初の分岐"
    ],
    forks: ["学力伸び期 or 停滞期", "部活での成功/挫折", "性格の外向/内向の固定"],
    troubles: [
      "自分が何者か分からない不安",
      "周囲の評価に強く依存する",
      "親との距離が急に変化する"
    ],
    wisdom: "“中二病”は恥ではなく、自我発達の正常なステップ。"
  },

  {
    id: "high",
    title: "高校生（15〜18歳）",
    summary: "選択と分岐が増える。将来像の“雛形”ができる。",
    core: [
      "自己決定の練習が始まる",
      "環境が人間関係と価値観を作る",
      "勉強・部活・友情が三つ巴になる"
    ],
    forks: [
      "進学 or 就職",
      "地元に残る or 出る",
      "部活継続 or 引退後の空白"
    ],
    troubles: [
      "将来選択の迷い",
      "親の価値観と自分の価値観の衝突",
      "友人関係の固定化と同調圧力"
    ],
    wisdom: "選んだ道より、“選んだ後どう育てるか”が将来を決める。"
  },

  {
    id: "college",
    title: "大学・専門期（18〜22歳）",
    summary: "自由度が最大化する一方、アイデンティティが揺れる時期。",
    core: [
      "周囲から自由になる",
      "趣味・友人・学びで人生の軸が見え始める",
      "恋愛・価値観形成の後半戦"
    ],
    forks: ["専攻選択と後悔", "将来像のモヤモヤ", "インターン or バイトでの適性発見"],
    troubles: [
      "何者になりたいか分からない",
      "やりたいことが多すぎる or ない",
      "就活プレッシャー"
    ],
    wisdom: "“迷いの量”はそのまま可能性の量でもある。"
  },

  {
    id: "early",
    title: "社会人前期（22〜28歳）",
    summary: "最初のキャリア形成期。現実と理想のギャップを知る。",
    core: [
      "仕事の型を覚える時期",
      "転職・残留の初分岐",
      "自立と孤独を学ぶ"
    ],
    forks: ["大企業 or ベンチャー", "専門職 or ゼネラリスト", "転職1回目"],
    troubles: [
      "自信の欠如",
      "同年代比較の地獄",
      "仕事の耐性不足"
    ],
    wisdom: "20代は“経験を買う時期”。回り道こそ財産になる。"
  },

  {
    id: "mid",
    title: "社会人中期（29〜35歳）",
    summary: "能力と責任が増し、人生の“大型分岐”が始まる。",
    core: [
      "専門性が固まる",
      "キャリアの軸が明確になる",
      "家庭・仕事の両立フェーズへ"
    ],
    forks: ["管理職 or 専門職", "転職2回目", "結婚・家庭形成"],
    troubles: [
      "キャリア停滞感",
      "未来の見通しが急に現実化する",
      "仕事の重圧"
    ],
    wisdom: "30代は“捨てる技術”が身につく時期。"
  },

  {
    id: "late",
    title: "社会人後期（36〜64歳）",
    summary: "蓄積を活かすフェーズ。衰えとの向き合いも始まる。",
    core: ["経験が最大の武器になる", "健康投資の重要性", "役職の消失に備える"],
    forks: ["管理職続行 or 降格", "専門職転換", "副業・起業挑戦"],
    troubles: [
      "役職定年の恐怖",
      "衰えと比較のストレス",
      "家庭・介護との両立"
    ],
    wisdom: "“第三のキャリア”は40代後半から静かに始まる。"
  },

  {
    id: "second",
    title: "セカンドキャリア（65歳〜）",
    summary: "人生の再編集期。“役職の自分”から“本来の自分”へ。",
    core: ["社会との関係を再構築", "健康と時間の最適化", "本当にやりたかったことへ戻る"],
    forks: ["再就職", "地域活動", "趣味型キャリア"],
    troubles: [
      "孤独感",
      "役割喪失",
      "健康問題による行動制限"
    ],
    wisdom: "晩年ほど、人は“自分の物語”を穏やかに受け入れていく。"
  }
];

/* ▼ タブ描画 */

function renderStageTabs(activeId) {
  const bar = document.getElementById("genStageTabs");
  bar.innerHTML = "";

  stages.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "stage-pill" + (s.id === activeId ? " active" : "");
    btn.textContent = s.title;
    btn.dataset.id = s.id;
    btn.addEventListener("click", () => setStage(s.id));
    bar.appendChild(btn);
  });
}

/* ▼ コンテンツ描画 */

function renderStageContent(stage) {
  const el = document.getElementById("genContent");

  el.innerHTML = `
    <div class="section-block">
      <h2 class="sec-title">${stage.title}</h2>
      <p class="sec-desc">${stage.summary}</p>
    </div>

    <div class="section-block">
      <h3 class="subheading">本質 3つ（Core Insights）</h3>
      <div class="core-grid">
        ${stage.core
          .map(
            (c) => `
          <div class="core-card">${c}</div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="section-block">
      <h3 class="subheading">よくある分岐（人生のパターン）</h3>
      <ul class="bullet-list">
        ${stage.forks.map((f) => `<li>${f}</li>`).join("")}
      </ul>
    </div>

    <div class="section-block">
      <h3 class="subheading">迷い・つまずきやすい点</h3>
      <ul class="bullet-list">
        ${stage.troubles.map((t) => `<li>${t}</li>`).join("")}
      </ul>
    </div>

    <div class="section-block">
      <h3 class="subheading">構造図（デモ）</h3>
      <div class="diagram">図解スペース（後で実装）</div>
    </div>

    <div class="section-block">
      <h3 class="subheading">処世術（How to Survive）</h3>
      <ul class="bullet-list">
        <li>やるべきこと：状況に応じて最適化する</li>
        <li>やらない方がいいこと：短期比較に振り回されること</li>
        <li>心の持ち方：二周目視点で俯瞰する</li>
      </ul>
    </div>

    <div class="section-block">
      <h3 class="subheading">先人の一言（Wisdom）</h3>
      <div class="wisdom-box">${stage.wisdom}</div>
    </div>
  `;
}

/* ▼ ステージ切り替え */

function setStage(id) {
  const stage = stages.find((s) => s.id === id) || stages[0];
  renderStageTabs(stage.id);
  renderStageContent(stage);
  if (window.feather) feather.replace();
}

/* ▼ 初期化 */

document.addEventListener("DOMContentLoaded", () => {
  setStage("child"); // 初期表示：小学生
});
