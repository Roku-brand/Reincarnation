//----------------------------------
// タブナビゲーション
//----------------------------------
document.querySelectorAll(".tabbar button").forEach(btn => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;

    // ページの表示切替
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(page).classList.add("active");

    // タブの見た目切替
    document.querySelectorAll(".tabbar button").forEach(b => b.classList.remove("active"));
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

let currentGen = "小学生";

const genTitle = document.getElementById("gen-title");
const genList  = document.getElementById("gen-list");

function renderGeneration(gen) {
  currentGen = gen;
  genTitle.textContent = `${gen}のテーマ`;
  genList.innerHTML = "";

  (generationData[gen] || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    genList.appendChild(li);
  });
}

// 初期状態
renderGeneration("小学生");

// タブクリック処理
document.querySelectorAll(".generation-tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    const gen = btn.dataset.gen;

    document.querySelectorAll(".generation-tabs button").forEach(b => b.classList.remove("gen-active"));
    btn.classList.add("gen-active");

    renderGeneration(gen);
  });
});
