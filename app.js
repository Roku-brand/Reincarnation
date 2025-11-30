// app.js

// すべての処理を DOMContentLoaded の中にまとめる
document.addEventListener("DOMContentLoaded", () => {
  //----------------------------------
  // タブナビゲーション
  //----------------------------------
  const tabButtons = document.querySelectorAll(".tabbar button");
  const pages = document.querySelectorAll(".page");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const pageId = btn.dataset.page;

      // ページ表示切り替え
      pages.forEach(p => p.classList.remove("active"));
      const target = document.getElementById(pageId);
      if (target) {
        target.classList.add("active");
      }

      // タブの見た目切り替え
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  //----------------------------------
  // 世代別ノートのデータ
  //----------------------------------
  const generationData = {
    "小学生": [
      "友だち関係、仲間外れへの不安",
      "怒られる恐怖と承認欲求",
      "勉強より“遊び”の優先順位問題"
    ],
    "中学生": [
      "自分のキャラづくり問題",
      "SNSと比較で自信が揺らぐ",
      "進路への漠然とした不安"
    ],
    "高校生": [
      "進路選択のストレス",
      "模試の結果で自己評価が上下",
      "親の期待とのズレ"
    ],
    "大学生": [
      "就活・キャリア不安",
      "周りがうまくいって見える問題",
      "自分が何者かわからない感覚"
    ],
    "社会人": [
      "仕事量と責任の増加による疲労",
      "キャリアの方向に迷う",
      "同期との比較"
    ],
    "定年後": [
      "役割の喪失とアイデンティティ問題",
      "健康と老後資金への不安",
      "地域・家族の関係変化"
    ]
  };

  const genTitle = document.getElementById("gen-title");
  const genList = document.getElementById("gen-list");
  const genButtons = document.querySelectorAll(".generation-tabs button");

  function renderGeneration(gen) {
    if (!genTitle || !genList) return;

    genTitle.textContent = `${gen}のテーマ`;
    genList.innerHTML = "";

    (generationData[gen] || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      genList.appendChild(li);
    });
  }

  // 初期表示（小学生）
  renderGeneration("小学生");

  // 世代タブのクリック処理
  genButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const gen = btn.dataset.gen;
      genButtons.forEach(b => b.classList.remove("gen-active"));
      btn.classList.add("gen-active");
      renderGeneration(gen);
    });
  });
});
