// =========================
// 世代別ノート：ステージデータ
// =========================
const stages = [
  {
    id: "elementary",
    label: "小学生",
    ageRange: "6〜12歳",
    tagline: "世界のルールを学び始める「原体験の時期」。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "家族・先生からの評価が“世界のすべて”に近い。承認欲求と不安が表裏一体。"
      },
      {
        title: "環境",
        desc: "生活圏は学校と家が9割。住んでいる地域の文化に強く影響される。"
      },
      {
        title: "人生の意味",
        desc: "「自分は大丈夫だ」という基礎的な自己肯定感を育てるフェーズ。"
      }
    ],
    branches: ["学習得意型", "友達ネットワーク型", "ゲーム・趣味没頭型", "不登校・環境ギャップ型"],
    struggles: [
      "友達関係・いじめ・仲間外れへの過敏さ",
      "勉強への苦手意識が早期に固定化される",
      "兄弟・きょうだい間の比較で自信を失う",
      "親の期待と自分の好きのズレ"
    ],
    diagramNote:
      "自己肯定感と周囲からの評価が、ジェットコースターのように上下しやすい。ポジティブ体験が“バッファ”になる。",
    survive: {
      do: [
        "小さな成功体験を可視化して一緒に喜ぶ",
        "好きなことを1つは全力で応援する",
        "失敗を“チャレンジの証拠”として言語化する"
      ],
      avoid: [
        "テスト結果だけで能力を判断する",
        "兄弟や友達との直接比較を口にする",
        "大人の都合で予定を詰め込みすぎる"
      ],
      mindset: [
        "“伸びしろだらけの時期”と捉える",
        "できないことより「楽しそうにしている瞬間」に注目する",
        "完璧よりも「安心のベース」を優先する"
      ],
      secondLoop: [
        "二周目視点では、この時期の体験が“フィルター”になっていると自覚する。",
        "過去を責めるのではなく、「あの時の自分をアップデートするつもり」で今の選択を整える。"
      ]
    },
    wisdom:
      "子どもの頃の“当たり前”は、のちの自分の“世界の前提”になる。前提はいつでも書き換えられる。",
    related: ["心理ノート：自己肯定感の土台", "人間関係術：いじめと境界線", "教養ノート：発達心理学の基礎"]
  },
  {
    id: "junior",
    label: "中学生",
    ageRange: "12〜15歳",
    tagline: "急激な成長と、アイデンティティの揺らぎが重なる“思春期の入口”。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "「子ども扱いされたくない」が強まりつつ、内心は不安定。仲間からの評価が最上位。"
      },
      {
        title: "環境",
        desc: "部活・SNS・塾など、所属コミュニティが増える。情報量が一気に増大。"
      },
      {
        title: "人生の意味",
        desc: "“自分は何者か？”を考え始める準備期間。将来像はまだ曖昧でOK。"
      }
    ],
    branches: ["部活コミット型", "受験モード型", "オタク・趣味深堀り型", "不適応・不登校パターン"],
    struggles: [
      "部活・勉強・友人関係の三つ巴で消耗する",
      "いじりといじめの境目がわからなくなる",
      "進路の話をされると急に現実感が重くなる",
      "親との距離感が難しく、会話が減る"
    ],
    diagramNote:
      "承認欲求の山が同世代の評価に偏りがち。自己否定の谷が深く落ちやすい。",
    survive: {
      do: [
        "“安全基地”となる大人や場所を1つ確保する",
        "得意・不得意より「好き」を語れる時間をつくる",
        "ネットとリアルの両方で安心できるコミュニティを探す"
      ],
      avoid: [
        "将来を“1回の受験で決まるゲーム”として刷り込む",
        "気分の波を人格の問題だと決めつける",
        "SNS上の比較で自己評価を下げすぎる"
      ],
      mindset: [
        "この時期のカオスさは“バグではなく仕様”と知っておく",
        "一生の親友よりも“話せる相手”を増やすイメージで十分",
        "進路は“仮決めでOK”という前提を持つ"
      ],
      secondLoop: [
        "二周目視点では、この時期の“なりたかった自分”を回収するチャンスが大人になってから何度も来る。",
        "15歳の自分に、“今の自分はどう見えるか？”をたまに問いかけてみる。"
      ]
    },
    wisdom: "15歳の決断は、物語のプロローグに過ぎない。本編は、もっとあとから始まる。",
    related: [
      "心理ノート：思春期の承認欲求",
      "人間関係術：スクールカーストの正体",
      "教養ノート：日本の進路選択の歴史"
    ]
  },
  {
    id: "high",
    label: "高校生",
    ageRange: "15〜18歳",
    tagline: "進路選択と青春が同時進行する、負荷の高いチャプター。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "“将来の自分”が具体的にイメージされ始めるが、実感はまだ薄いギャップ期。"
      },
      {
        title: "環境",
        desc: "受験・就職・部活・恋愛など、時間も感情もフル稼働。睡眠不足も構造的に起きやすい。"
      },
      {
        title: "人生の意味",
        desc: "社会のレールを初めて意識する時期。“選ばなかった道”が増え始める。"
      }
    ],
    branches: ["大学進学型", "専門学校・就職型", "ギャップイヤー志向", "燃え尽き・何も決めたくない型"],
    struggles: [
      "偏差値で人生の価値が測られている感覚になる",
      "親や先生の期待と、自分の本音がずれている",
      "「今しかない青春」と「将来のための努力」の板挟みになる",
      "選択肢が多すぎて、どれも決めきれない"
    ],
    diagramNote:
      "時間・体力・感情のリソースが常にフル稼働。負荷の総量が高いほど、20代以降に“反動”が出やすい。",
    survive: {
      do: [
        "“行きたい大学／業界”より“触れていたいテーマ”を言語化する",
        "模試結果を“現状のスナップショット”として扱う",
        "選ばなかった選択肢も、メモに残しておく"
      ],
      avoid: [
        "将来のイメージを偏差値表に丸投げする",
        "1つの進路にすべてを賭けるような思考",
        "失敗＝人生終了という物語を信じ込むこと"
      ],
      mindset: [
        "18歳の選択は“第一ラウンドの初手”に過ぎないと理解する",
        "どの選択肢にも“メリットと失うもの”があるのが普通",
        "迷うこと自体が、ちゃんと考えている証拠だと思う"
      ],
      secondLoop: [
        "二周目視点では、ここで決めた“ラベル”に縛られすぎないことが重要。",
        "後から何度でも軌道修正できるように、“自分の問い”だけは大事に持ち続ける。"
      ]
    },
    wisdom:
      "若い頃に選んだ進路よりも、その後で“どう問い直したか”の方が、人生の差を生みやすい。",
    related: [
      "心理ノート：選択のパラドックス",
      "人間関係術：親との進路の話し方",
      "教養ノート：キャリア理論の基礎"
    ]
  },
  {
    id: "university",
    label: "大学・専門期",
    ageRange: "18〜22歳",
    tagline: "自由度が急に上がり、“自分で自分をマネジメントする”初めてのフェーズ。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "“何者でもない自分”と向き合う時間が増える。比較対象が全国・世界規模に広がる。"
      },
      {
        title: "環境",
        desc: "時間の裁量が大きく、サークル・バイト・留学・インターンなど選択肢が多い。"
      },
      {
        title: "人生の意味",
        desc: "一生続く“学び方”と“働き方”の土台を、自分なりに組み立て始める。"
      }
    ],
    branches: [
      "サークル・コミュニティ充実型",
      "資格・専門スキル特化型",
      "インターン・スタートアップ志向型",
      "なんとなく過ぎる日々型"
    ],
    struggles: [
      "時間はあるはずなのに、何もしていない感覚に焦る",
      "将来像が曖昧なまま、就活だけが迫ってくる",
      "周囲の“キラキラした人”と自分を比較しがち",
      "学びと遊びのバランスが極端になりやすい"
    ],
    diagramNote:
      "自由度の高さゆえに、自己管理力の差が大きく開きやすい。行動量より“どんな問いで動いているか”が重要。",
    survive: {
      do: [
        "“これだけは試した”と言える経験を3〜5個つくる",
        "好き・得意・需要の3つが重なる領域を探索する",
        "バイト以外の“タダ働きでもやりたいこと”を一度やってみる"
      ],
      avoid: [
        "とりあえずの忙しさでスケジュールを埋める",
        "就活サイトのテンプレだけで業界を選ぶ",
        "モラトリアム＝何も決めなくていい期間と勘違いする"
      ],
      mindset: [
        "20代前半は“試作品の自分”でいるくらいでちょうどいい",
        "今決めた専門が、後で別の形で活きることも多い",
        "迷いを書き残しておくと、二周目視点で役立つログになる"
      ],
      secondLoop: [
        "二周目視点では、“あの時の自分が欲しかった情報”を、未来の自分・他人へ渡していく役割を意識してみる。",
        "大学時代の後悔は、後から副業・学び直し・コミュニティで回収できる。"
      ]
    },
    wisdom:
      "大学で得る一番大きな資産は、“学歴”よりも、自分で問いを立てて動いたログであることが多い。",
    related: [
      "心理ノート：モラトリアムの扱い方",
      "人間関係術：コミュニティの選び方",
      "教養ノート：リベラルアーツの意味"
    ]
  },
  {
    id: "work_early",
    label: "社会人前期",
    ageRange: "22〜28歳",
    tagline: "“組織で働く自分”と“本当の自分”のギャップに気づき始める立ち上がり期。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "評価・昇進・給与など“数字で見える評価”に意識が向きやすい。"
      },
      {
        title: "環境",
        desc: "仕事・生活基盤・人間関係すべてが同時に立ち上がるため、余白が少なくなりがち。"
      },
      {
        title: "人生の意味",
        desc: "“働くとは何か？”を身体で学びながら、自分の価値観を再定義していく時期。"
      }
    ],
    branches: ["企業定着型", "専門職スキル特化型", "転職・ジョブホップ型", "大学院・再学習型"],
    struggles: [
      "仕事を覚えるだけで精一杯で、自分の将来像を考える余裕がない",
      "組織の価値観に合わせすぎて、燃え尽きかける",
      "同期や友人との年収・キャリア比較でモヤモヤする",
      "このまま続けるべきか、早めに転職すべきか迷う"
    ],
    diagramNote:
      "20代半ばで“最初のキャリア迷子期”が来やすい。仕事量のピークと、価値観の揺れが同時に来るため。",
    survive: {
      do: [
        "“今の仕事で学べること”を棚卸しし、期限付きでコミットする",
        "上司とは別に、“人生相談できる先輩”を見つける",
        "仕事内容と別枠で、自分の興味分野の学びを続ける"
      ],
      avoid: [
        "不満をすべて“会社のせい”にして視野を止める",
        "逆に、すべてを自己責任と捉えて自分を責め続ける",
        "周囲の転職話に流されて、軸がないまま動く"
      ],
      mindset: [
        "最初の3〜5年は、“社会の言語と仕組み”を学ぶ期間と割り切る",
        "キャリアの方向性は“仮決め→修正”を前提にする",
        "体力への投資（睡眠・健康）は、将来の複利と理解する"
      ],
      secondLoop: [
        "二周目視点では、ここで経験した“働き方の違和感”が、後の転職や独立の種になる。",
        "不満をメモしておくと、“自分が作りたい環境”の設計図になる。"
      ]
    },
    wisdom:
      "20代のキャリアは、“正解の仕事”を当てにいくゲームではなく、“自分の軸を見つける旅”に近い。",
    related: [
      "心理ノート：キャリア迷子のパターン",
      "人間関係術：上司との距離感",
      "教養ノート：働き方の歴史"
    ]
  },
  {
    id: "work_mid",
    label: "社会人中期",
    ageRange: "29〜35歳",
    tagline: "役職・専門性・ライフイベントが交差し、“長期戦”を意識し始めるフェーズ。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "“このままでいいのか？”と“守るものが増える安心感”が同時に存在する。"
      },
      {
        title: "環境",
        desc: "昇進・転職・結婚・子育てなど、人生イベントが重なりがち。時間の自由度が低下。"
      },
      {
        title: "人生の意味",
        desc: "他人ではなく“自分にとっての成功”を定義し直す必要が出てくる時期。"
      }
    ],
    branches: [
      "マネジメント・管理職路線",
      "専門職・プロフェッショナル路線",
      "転職・独立チャレンジ路線",
      "家庭・子育て優先路線"
    ],
    struggles: [
      "仕事と家庭の両立で常にマルチタスク状態になる",
      "昇進・年収・ポジションの比較で精神的に疲弊する",
      "ここで軌道修正していいのか、手遅れ感を抱えがち",
      "自分の時間がほぼ残らず、将来の学び直しを先送りにする"
    ],
    diagramNote:
      "仕事・家庭・健康の3つの曲線が交差する。どれか1つでも大きく落ちると、他に連鎖しやすい。",
    survive: {
      do: [
        "“今後10年で大事にしたいものトップ3”を言語化する",
        "キャリアだけでなく“ライフ全体”を定期的に棚卸しする",
        "小さな学び直し（資格・オンライン講座など）を習慣化する"
      ],
      avoid: [
        "惰性と恐怖だけで同じ環境に留まり続ける",
        "逆に、焦りだけで急な独立・転職に走る",
        "パートナー／家族に本音を共有せず、一人で抱え込む"
      ],
      mindset: [
        "30代は“第二の新卒”としてキャリアを再設計するチャンスでもある",
        "すべてを完璧にこなそうとせず、意図的に“捨てるもの”を決める",
        "長期戦だからこそ、“走り続けられるペース”を優先する"
      ],
      secondLoop: [
        "二周目視点では、この時期に“何を手放したか”が、その後の自由度を決める。",
        "やりたいことだけでなく、“やらないことリスト”を定期的にアップデートする。"
      ]
    },
    wisdom:
      "30代の選択は、“今の自分”よりも“10年後の自分”にとってのリターンで考えるとブレにくい。",
    related: [
      "心理ノート：ミッドライフ・クライシス前夜",
      "人間関係術：家庭と仕事のバランス",
      "教養ノート：人生100年時代のキャリア"
    ]
  },
  {
    id: "work_late",
    label: "社会人後期",
    ageRange: "36〜64歳",
    tagline: "経験と責任が最大化し、“次の世代”を意識し始める成熟期。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "自分の限界と可能性の両方を把握しつつ、“この先どう締めくくるか”を考え始める。"
      },
      {
        title: "環境",
        desc: "役職上の責任に加え、親の介護・子どもの進路など家族イベントも重なりやすい。"
      },
      {
        title: "人生の意味",
        desc: "“何を成し遂げたか”だけでなく、“何を残したか・渡したか”の比重が高まる。"
      }
    ],
    branches: [
      "組織の中核として走り切る型",
      "専門家として独立・兼業型",
      "早期リタイア・セミリタイア型",
      "健康・家族最優先型"
    ],
    struggles: [
      "組織の変化スピードにストレスを感じる",
      "若手との価値観ギャップに戸惑う",
      "健康不安が現実味を帯び、仕事の優先順位が揺らぐ",
      "キャリアの“出口戦略”を考えたいが、時間が取れない"
    ],
    diagramNote:
      "キャリアの山の頂上から、ゆっくりと下り始めるフェーズ。山の下り方で“二周目の生きやすさ”が大きく変わる。",
    survive: {
      do: [
        "自分の経験を“再現性ある言語”にして後輩に渡す",
        "健康への投資を“最優先プロジェクト”に格上げする",
        "セカンドキャリアの仮説をいくつか立てておく"
      ],
      avoid: [
        "ポジションへの執着だけで意思決定をする",
        "若手の価値観を“理解できない”で終わらせる",
        "将来の不安を理由に、今の生活を犠牲にしすぎる"
      ],
      mindset: [
        "“勝ち続ける”より“渡し切る・繋ぐ”スタンスに切り替える",
        "自分の物語を丁寧に振り返る時間をとる",
        "ここから先は、“次の世代と一緒に物語を紡ぐフェーズ”と捉える"
      ],
      secondLoop: [
        "二周目視点では、この時期の選択が“老後の物語の質”を決める。",
        "将来の自分に“どんな顔で振り返られたいか”を基準に、仕事量と家族時間を調整する。"
      ]
    },
    wisdom:
      "キャリアの最後の10〜20年は、“どれだけ役職に就いたか”よりも、“どんな関係性を残したか”で記憶される。",
    related: [
      "心理ノート：エリクソンの発達段階（生成性 vs 停滞）",
      "人間関係術：世代間ギャップの橋渡し",
      "教養ノート：引退とセカンドキャリア"
    ]
  },
  {
    id: "second",
    label: "セカンドキャリア",
    ageRange: "65歳〜",
    tagline: "“稼ぐための仕事”から、“生き方としての仕事”へとシフトする第二幕。",
    coreInsights: [
      {
        title: "心理構造",
        desc: "社会的役割から離れ、“自分は何者として生きたいか”に再び向き合う。"
      },
      {
        title: "環境",
        desc: "時間の自由度は増えるが、健康・お金・孤立感など新しい制約も生まれる。"
      },
      {
        title: "人生の意味",
        desc: "“これまでの物語”と“これからの余白”をつなぐフェーズ。第三の人生をデザインできる。"
      }
    ],
    branches: [
      "地域コミュニティ・ボランティア型",
      "専門性を活かした顧問・講師型",
      "趣味・創作集中型",
      "ゆっくり生活リセット型"
    ],
    struggles: [
      "現役時代の肩書きがなくなり、アイデンティティが揺らぐ",
      "人とのつながりが急に減り、孤立感が出やすい",
      "健康不安と経済不安の両方と向き合う必要がある",
      "「もう遅いのでは」という感覚が、新しい挑戦を止めてしまう"
    ],
    diagramNote:
      "時間の曲線は増える一方、体力と社会的役割の曲線はゆるやかに下る。交差点で“新しい役割”を設計できるかが鍵。",
    survive: {
      do: [
        "週1〜2回の“社会との接点”を意図的につくる",
        "長年の経験を、文章・講話・対話などで言語化して残す",
        "健康・お金・人間関係の3つを定期的にチェックする"
      ],
      avoid: [
        "現役時代の成功体験だけにしがみつく",
        "逆に“もう自分は役に立たない”と決めつけてしまう",
        "一人で問題を抱え込み、相談の回路を閉ざす"
      ],
      mindset: [
        "ここからの時間は、“回収”と“ギフト”の両方を意識する",
        "年齢ではなく、“関わり方”を変えるイメージで社会と接続する",
        "新しい挑戦は、小さく・軽く・楽しく始めればいい"
      ],
      secondLoop: [
        "二周目視点では、ここからの時間こそ“物語のエピローグ”を自分で書ける貴重なフェーズ。",
        "若い頃の“やり残し”を、小さな形で回収していくこともできる。"
      ]
    },
    wisdom:
      "人生の後半は、“何を持っているか”よりも、“何を手渡していけるか”で満足度が決まりやすい。",
    related: [
      "心理ノート：老年的超越",
      "人間関係術：孤立しない高齢期",
      "教養ノート：世界のリタイア文化"
    ]
  }
];

// =========================
// DOM取得
// =========================
const stageListEl = document.getElementById("stageList");
const detailEl = document.getElementById("stageDetail");
const summaryEl = document.getElementById("stageSummary");

// =========================
// ステージpill描画
// =========================
function renderStagePills(activeId) {
  stageListEl.innerHTML = "";
  stages.forEach((s) => {
    const button = document.createElement("button");
    button.className = "stage-pill" + (s.id === activeId ? " active" : "");
    button.dataset.stageId = s.id;
    button.innerHTML = `
      <span data-feather="navigation-2"></span>
      <span>${s.label}</span>
      <span class="age">${s.ageRange}</span>
    `;
    button.addEventListener("click", () => setActiveStage(s.id));
    stageListEl.appendChild(button);
  });
  if (window.feather) feather.replace();
}

// =========================
// 詳細ノート描画
// =========================
function renderStageDetail(stage) {
  detailEl.innerHTML = `
    <section class="card stage-header">
      <div class="stage-name">${stage.label}</div>
      <div class="stage-age">${stage.ageRange}</div>
      <p class="stage-tagline">${stage.tagline}</p>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-icon"><span data-feather="triangle"></span></div>
        <div>
          <p class="card-title">本質3つ（Core Insights）</p>
          <p class="card-subtitle">心理構造・環境・人生の意味を、3つのポイントで整理。</p>
        </div>
      </div>
      <div class="core-grid">
        ${stage.coreInsights
          .map(
            (ci) => `
          <div class="core-item">
            <p class="core-item-title">${ci.title}</p>
            <p class="core-item-desc">${ci.desc}</p>
          </div>
        `
          )
          .join("")}
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-icon"><span data-feather="git-branch"></span></div>
        <div>
          <p class="card-title">よくある分岐（人生のパターン）</p>
          <p class="card-subtitle">このステージで分かれやすい“人生のルート”たち。</p>
        </div>
      </div>
      <div class="pill-list">
        ${stage.branches
          .map(
            (b) => `
          <span class="pill-tag">
            <span data-feather="corner-right-down"></span>
            <span>${b}</span>
          </span>
        `
          )
          .join("")}
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-icon"><span data-feather="alert-circle"></span></div>
        <div>
          <p class="card-title">迷い・よくあるつまずき</p>
          <p class="card-subtitle">データや現場感覚から見える“典型的な悩み”たち。</p>
        </div>
      </div>
      <ul class="bullet-list">
        ${stage.struggles.map((s) => `<li>${s}</li>`).join("")}
      </ul>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-icon"><span data-feather="activity"></span></div>
        <div>
          <p class="card-title">構造図（図解セクション）</p>
          <p class="card-subtitle">心理曲線・承認欲求の山谷・迷子パターンなどを図解する予定の枠。</p>
        </div>
      </div>
      <div class="diagram-placeholder">
        <div>
          <div style="font-size:12px; font-weight:600; margin-bottom:4px;">このステージの“見えない構造”</div>
          <div style="font-size:11px;">${stage.diagramNote}</div>
        </div>
        <div class="diagram-mini"></div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-icon"><span data-feather="compass"></span></div>
        <div>
          <p class="card-title">処世術（How to Survive）</p>
          <p class="card-subtitle">やるべきこと・やらない方がいいこと・心の持ち方・二周目視点。</p>
        </div>
      </div>
      <div class="survive-grid">
        <div>
          <div class="survive-col-title">やるべきこと</div>
          <ul class="survive-col-list">
            ${stage.survive.do.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        </div>
        <div>
          <div class="survive-col-title">やらない方がいいこと</div>
          <ul class="survive-col-list">
            ${stage.survive.avoid.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        </div>
        <div>
          <div class="survive-col-title">心の持ち方・二周目視点</div>
          <ul class="survive-col-list">
            ${stage.survive.mindset.map((t) => `<li>${t}</li>`).join("")}
            ${stage.survive.secondLoop.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-icon"><span data-feather="mic"></span></div>
        <div>
          <p class="card-title">先人の一言（Wisdom Band）</p>
          <p class="card-subtitle">映画のナレーションのように、チャプターを俯瞰する一言。</p>
        </div>
      </div>
      <div class="wisdom-band">
        <span class="wisdom-label">WISDOM</span>
        <span>${stage.wisdom}</span>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-icon"><span data-feather="link-2"></span></div>
        <div>
          <p class="card-title">関連ノートへのリンク</p>
          <p class="card-subtitle">このステージをさらに深堀りしたい人向けの入り口。</p>
        </div>
      </div>
      <div class="related-list">
        ${stage.related
          .map(
            (r) => `
          <span class="related-link">
            <span data-feather="external-link"></span>
            <span>${r}</span>
          </span>
        `
          )
          .join("")}
      </div>
    </section>
  `;
  if (window.feather) feather.replace();
}

// =========================
// サマリー描画
// =========================
function renderStageSummary(stage, index) {
  const nextStage = stages[index + 1];
  summaryEl.innerHTML = `
    <div class="summary-stage-name">${stage.label}</div>
    <div class="summary-age">${stage.ageRange}</div>
    <div class="summary-meta-row">
      <span class="summary-meta-chip">チャプター ${index + 1} / ${stages.length}</span>
      <span class="summary-meta-chip">人生ステージのハイライトを俯瞰</span>
    </div>
    <p style="font-size:12px; color:var(--text-muted); margin:0 0 8px;">
      ${stage.tagline}
    </p>
    <p style="font-size:12px; margin:0 0 6px;">Core Insights：</p>
    <ul class="bullet-list">
      ${stage.coreInsights
        .map((ci) => `<li>${ci.title}：${ci.desc}</li>`)
        .join("")}
    </ul>
    ${
      nextStage
        ? `<div class="summary-next">
             <strong>次のチャプター：</strong>${nextStage.label}（${nextStage.ageRange}）へ物語が進んでいきます。
           </div>`
        : `<div class="summary-next">
             <strong>次のチャプター：</strong>セカンドキャリア以降は、“二周目の物語”として自由に設計できます。
           </div>`
    }
  `;
}

// =========================
// アクティブステージ切り替え
// =========================
function setActiveStage(id) {
  const stage = stages.find((s) => s.id === id) || stages[0];
  const index = stages.findIndex((s) => s.id === id);
  renderStagePills(stage.id);
  renderStageDetail(stage);
  renderStageSummary(stage, index);
}

// =========================
// 初期化
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // 初期は社会人前期あたりを表示（変更OK）
  setActiveStage("work_early");
});
