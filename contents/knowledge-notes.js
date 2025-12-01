const knCategories = [
  {
    id: "relation",
    label: "人間関係ノート",
    icon: "users",
    desc: "信頼・距離感・与える／奪うのバランスを整えるためのノート。",
    notes: [
      {
        tag: "ギバーとテイカー",
        title: "与える人・奪う人・マッチャー",
        bullets: [
          "一時的にはテイカーが得をして見えるが、長期的にはギバー型が信頼資本を貯めやすい。",
          "ただし「自己犠牲型ギバー」は燃え尽きやすいので、境界線を引くことが前提。"
        ]
      },
      {
        tag: "リーダーシップ",
        title: "やってみせ、言って聞かせて…",
        bullets: [
          "まず背中で見せる → 言葉で伝える → やらせてみる → 褒める、という順番が信頼を生みやすい。",
          "指示よりも、「一緒に考えるスタンス」の方が二周目視点では再現性が高い。"
        ]
      },
      {
        tag: "距離感",
        title: "近すぎず・遠すぎずの関係",
        bullets: [
          "何でも共有し合う関係よりも、“共有する範囲をお互いに選べる関係”の方が長続きしやすい。",
          "職場では「信頼＋適度な他人感覚」があると、感情に飲まれにくい。"
        ]
      }
    ]
  },
  {
    id: "psychology",
    label: "心理学ノート",
    icon: "brain",
    desc: "心のクセを知って、感情に振り回されにくくするノート。",
    notes: [
      {
        tag: "プラシーボ効果",
        title: "「効く」と信じることで本当に変わる",
        bullets: [
          "期待や安心感が、脳内のホルモン分泌を通じて本当に身体や行動に影響を与える。",
          "逆に「どうせ無理だ」と思い込むノセボ効果もあるので、自分の内なるナレーションに注意。"
        ]
      },
      {
        tag: "認知不協和",
        title: "自分の行動と信念がズレたとき",
        bullets: [
          "人は、行動と信念が矛盾すると、どちらかを無意識に書き換えて辻褄を合わせようとする。",
          "二周目視点では、「今どの矛盾を解消しようとしているのか？」を観察すると自己理解が深まる。"
        ]
      },
      {
        tag: "承認欲求",
        title: "「見てほしい気持ち」との付き合い方",
        bullets: [
          "承認欲求を消す必要はなく、「誰に・どんな形で認められたいか」を言語化することが大事。",
          "他人からの承認だけでなく、「過去の自分が喜ぶ選択か?」という軸を持つとブレにくい。"
        ]
      }
    ]
  },
  {
    id: "business",
    label: "ビジネスノート",
    icon: "briefcase",
    desc: "どの職種でも通用する“仕事の基本動作”をまとめるノート。",
    notes: [
      {
        tag: "資料作成",
        title: "1枚で伝わるスライドの型",
        bullets: [
          "結論 → 理由 → 具体例 の順に並べるだけで、多くの資料は読みやすくなる。",
          "目的：「何を決めるための資料か？」を書き出してから作り始めると、迷子になりにくい。"
        ]
      },
      {
        tag: "ロジカルシンキング",
        title: "分けて・並べて・つなげる",
        bullets: [
          "問題を「要素に分ける」、要素を「比較して並べる」、最後に「ストーリーでつなげる」。",
          "ロジカルさは“賢さ”ではなく、“分解と整理の筋トレ”に近い。"
        ]
      },
      {
        tag: "報連相",
        title: "上司の頭の中の“地図”を共有する",
        bullets: [
          "事実・解釈・感情をごちゃまぜにせず、「事実ベースの報告」を先に出す。",
          "相談は「選択肢A/B/Cを考えたのですが、どれが良さそうですか？」と、思考の途中まで見せる。"
        ]
      }
    ]
  },
  {
    id: "ai",
    label: "AI活用ノート",
    icon: "cpu",
    desc: "AIを“賢い相棒”として使うための、プロンプト思考とコラボ術。",
    notes: [
      {
        tag: "プロンプト思考",
        title: "AIに聞く前に決めておく3つのこと",
        bullets: [
          "①ゴール（何に使うのか） ②前提（今わかっていること） ③制約（文字数・トーンなど）。",
          "人に頼むのと同じで、「期待値のすり合わせ」をするとアウトプットの質が上がる。"
        ]
      },
      {
        tag: "共同作業",
        title: "AIは“たたき台”担当にする",
        bullets: [
          "最初の案はAIに任せて、人間は“取捨選択と編集”に集中する。",
          "「0→1をAI、1→10を人間」と役割分担すると、思考のスタミナが持ちやすい。"
        ]
      },
      {
        tag: "生活への組み込み",
        title: "毎日のルーティンにAIを埋め込む",
        bullets: [
          "日記の要約・タスク分解・食事案・勉強計画など、既にやっている習慣にAIを混ぜる。",
          "“AIを起動するまでが面倒”にならないように、ショートカットやブックマークを整理しておく。"
        ]
      }
    ]
  }
];

function renderCategoryTabs(activeId) {
  const container = document.getElementById("knCategoryTabs");
  container.innerHTML = "";
  knCategories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-pill" + (cat.id === activeId ? " active" : "");
    btn.dataset.catId = cat.id;
    btn.innerHTML = `
      <span data-feather="${cat.icon}"></span>
      <span>${cat.label}</span>
    `;
    btn.addEventListener("click", () => setActiveCategory(cat.id));
    container.appendChild(btn);
  });
  if (window.feather) feather.replace();
}

function renderCategoryContent(cat) {
  const el = document.getElementById("knCategoryContent");
  el.innerHTML = `
    <h2 class="category-title">${cat.label}</h2>
    <p class="category-desc">${cat.desc}</p>
    <div class="notes-grid">
      ${cat.notes
        .map(
          (n) => `
        <article class="note-card">
          <div class="note-tag">
            <span data-feather="bookmark"></span>
            <span>${n.tag}</span>
          </div>
          <h3 class="note-title">${n.title}</h3>
          <ul class="note-bullets">
            ${n.bullets.map((b) => `<li>${b}</li>`).join("")}
          </ul>
        </article>
      `
        )
        .join("")}
    </div>
  `;
  if (window.feather) feather.replace();
}

function setActiveCategory(id) {
  const cat = knCategories.find((c) => c.id === id) || knCategories[0];
  renderCategoryTabs(cat.id);
  renderCategoryContent(cat);
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveCategory("relation");
});
