// ---- 名言ストック（localStorage / 日付付き） ----
const STORAGE_KEY_QUOTES = "jn_user_quotes_v2"; // v2として別キーに

function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveQuotes(quotes) {
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function renderQuotes() {
  const container = document.getElementById("quoteList");
  const quotes = loadQuotes();
  if (!quotes.length) {
    container.innerHTML =
      '<p style="font-size:12px;color:#9ca3af;margin:0;">まだ登録されていません。刺さった一文をメモしてみてください。</p>';
    return;
  }
  container.innerHTML = "";
  quotes.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "quote-item";
    div.innerHTML = `
      <div class="quote-main">
        <div class="quote-text">${q.text}</div>
        <div class="quote-date">${formatDate(q.createdAt)} のメモ</div>
      </div>
      <button class="quote-delete" data-index="${index}">削除</button>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".quote-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const current = loadQuotes();
      current.splice(idx, 1);
      saveQuotes(current);
      renderQuotes();
    });
  });
}

function initQuoteSection() {
  const input = document.getElementById("quoteInput");
  const addBtn = document.getElementById("quoteAddBtn");
  if (!input || !addBtn) return;

  const addQuote = () => {
    const text = input.value.trim();
    if (!text) return;
    const current = loadQuotes();
    current.push({
      text,
      createdAt: new Date().toISOString()
    });
    saveQuotes(current);
    input.value = "";
    renderQuotes();
  };

  addBtn.addEventListener("click", addQuote);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addQuote();
    }
  });

  renderQuotes();
}

// ---- 悩み相談チャット（localStorageでログも保存） ----
const STORAGE_KEY_CHAT = "jn_user_chat_log_v1";

const demoReplies = [
  "いまの気持ちを言葉にできているだけで、大きな一歩です。",
  "すぐに答えを出さなくても大丈夫です。少しずつ整理していきましょう。",
  "一周目の自分にとっては重たいテーマでも、二周目視点では“素材”になります。",
  "誰かと比較するより、「昨日の自分」と比べてみてもいいかもしれません。"
];

function loadChatLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveChatLog(messages) {
  localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
}

function appendChatMessageDOM(msg) {
  const win = document.getElementById("chatWindow");
  if (!win) return;
  const wrap = document.createElement("div");

  const bubble = document.createElement("div");
  bubble.className = "chat-message " + msg.role;
  bubble.textContent = msg.text;

  const meta = document.createElement("div");
  meta.className = "chat-meta";
  meta.textContent = formatDate(msg.createdAt) || "";

  wrap.appendChild(bubble);
  wrap.appendChild(meta);

  win.appendChild(wrap);
  win.scrollTop = win.scrollHeight;
}

function renderChatLog() {
  const win = document.getElementById("chatWindow");
  if (!win) return;
  win.innerHTML = "";
  const log = loadChatLog();
  log.forEach((m) => appendChatMessageDOM(m));
}

function initChat() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  if (!form || !input) return;

  renderChatLog();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const nowISO = new Date().toISOString();
    const current = loadChatLog();

    const userMsg = { role: "user", text, createdAt: nowISO };
    current.push(userMsg);
    saveChatLog(current);
    appendChatMessageDOM(userMsg);
    input.value = "";

    const reply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
    const aiMsg = {
      role: "ai",
      text: reply,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      const cur = loadChatLog();
      cur.push(aiMsg);
      saveChatLog(cur);
      appendChatMessageDOM(aiMsg);
    }, 400);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initQuoteSection();
  initChat();
  initItemBox();
  initSkills();
  initMoney();
  initNetwork();
});

// ---- アイテムボックス ----
const STORAGE_KEY_ITEMS = "jn_user_items_v1";

const itemIcons = {
  power: "💪",
  heal: "💚",
  shield: "🛡️",
  star: "⭐"
};

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
}

function renderItems() {
  const container = document.getElementById("itemBoxGrid");
  if (!container) return;
  
  const items = loadItems();
  if (!items.length) {
    container.innerHTML = '<p style="font-size:12px;color:#9ca3af;margin:0;grid-column:1/-1;">まだアイテムがありません。自分を元気にしてくれるものを追加しましょう。</p>';
    return;
  }
  
  container.innerHTML = "";
  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `item-card ${item.type}`;
    div.innerHTML = `
      <button class="item-delete" data-index="${index}">✕</button>
      <span class="item-icon">${itemIcons[item.type] || "🎁"}</span>
      <span class="item-name">${item.name}</span>
    `;
    container.appendChild(div);
  });
  
  container.querySelectorAll(".item-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.index);
      const current = loadItems();
      current.splice(idx, 1);
      saveItems(current);
      renderItems();
    });
  });
}

function initItemBox() {
  const input = document.getElementById("itemNameInput");
  const select = document.getElementById("itemTypeSelect");
  const addBtn = document.getElementById("itemAddBtn");
  if (!input || !select || !addBtn) return;
  
  const addItem = () => {
    const name = input.value.trim();
    if (!name) return;
    const current = loadItems();
    current.push({
      name,
      type: select.value,
      createdAt: new Date().toISOString()
    });
    saveItems(current);
    input.value = "";
    renderItems();
  };
  
  addBtn.addEventListener("click", addItem);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  });
  
  renderItems();
}

// ---- 技コレクション ----
const STORAGE_KEY_SKILLS = "jn_user_skills_v1";

function loadSkills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SKILLS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSkills(skills) {
  localStorage.setItem(STORAGE_KEY_SKILLS, JSON.stringify(skills));
}

function renderSkills() {
  const container = document.getElementById("skillList");
  if (!container) return;
  
  const skills = loadSkills();
  if (!skills.length) {
    container.innerHTML = '<p style="font-size:12px;color:#9ca3af;margin:0;">まだ技がありません。身につけたスキルを追加しましょう。</p>';
    return;
  }
  
  container.innerHTML = "";
  skills.forEach((skill, index) => {
    const div = document.createElement("div");
    div.className = `skill-item lv${skill.level}`;
    div.innerHTML = `
      <span class="skill-level">Lv.${skill.level}</span>
      <span class="skill-name">${skill.name}</span>
      <button class="skill-delete" data-index="${index}">削除</button>
    `;
    container.appendChild(div);
  });
  
  container.querySelectorAll(".skill-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const current = loadSkills();
      current.splice(idx, 1);
      saveSkills(current);
      renderSkills();
    });
  });
}

function initSkills() {
  const input = document.getElementById("skillNameInput");
  const select = document.getElementById("skillLevelSelect");
  const addBtn = document.getElementById("skillAddBtn");
  if (!input || !select || !addBtn) return;
  
  const addSkill = () => {
    const name = input.value.trim();
    if (!name) return;
    const current = loadSkills();
    current.push({
      name,
      level: Number(select.value),
      createdAt: new Date().toISOString()
    });
    saveSkills(current);
    input.value = "";
    renderSkills();
  };
  
  addBtn.addEventListener("click", addSkill);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  });
  
  renderSkills();
}

// ---- お金集めトラッカー ----
const STORAGE_KEY_MONEY = "jn_user_money_v1";

const moneyIcons = {
  income: "📈",
  saving: "💡",
  invest: "📚"
};

function loadMoney() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MONEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMoney(money) {
  localStorage.setItem(STORAGE_KEY_MONEY, JSON.stringify(money));
}

function updateMoneyStats() {
  const money = loadMoney();
  const incomeCount = document.getElementById("incomeCount");
  const savingCount = document.getElementById("savingCount");
  const investCount = document.getElementById("investCount");
  
  if (incomeCount) incomeCount.textContent = money.filter(m => m.type === "income").length;
  if (savingCount) savingCount.textContent = money.filter(m => m.type === "saving").length;
  if (investCount) investCount.textContent = money.filter(m => m.type === "invest").length;
}

function renderMoney() {
  const container = document.getElementById("moneyList");
  if (!container) return;
  
  const money = loadMoney();
  updateMoneyStats();
  
  if (!money.length) {
    container.innerHTML = '<p style="font-size:12px;color:#9ca3af;margin:0;">まだ記録がありません。お金に関する知恵を追加しましょう。</p>';
    return;
  }
  
  container.innerHTML = "";
  money.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `money-item ${item.type}`;
    div.innerHTML = `
      <span class="money-type">${moneyIcons[item.type] || "💰"}</span>
      <span class="money-text">${item.text}</span>
      <button class="money-delete" data-index="${index}">削除</button>
    `;
    container.appendChild(div);
  });
  
  container.querySelectorAll(".money-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const current = loadMoney();
      current.splice(idx, 1);
      saveMoney(current);
      renderMoney();
    });
  });
}

function initMoney() {
  const input = document.getElementById("moneyTipInput");
  const select = document.getElementById("moneyTypeSelect");
  const addBtn = document.getElementById("moneyAddBtn");
  if (!input || !select || !addBtn) return;
  
  const addMoney = () => {
    const text = input.value.trim();
    if (!text) return;
    const current = loadMoney();
    current.push({
      text,
      type: select.value,
      createdAt: new Date().toISOString()
    });
    saveMoney(current);
    input.value = "";
    renderMoney();
  };
  
  addBtn.addEventListener("click", addMoney);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMoney();
    }
  });
  
  renderMoney();
}

// ---- 人脈マップ ----
const STORAGE_KEY_NETWORK = "jn_user_network_v1";

const networkIcons = {
  mentor: "👥",
  peer: "🤝",
  support: "🌱"
};

function loadNetwork() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NETWORK);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNetwork(network) {
  localStorage.setItem(STORAGE_KEY_NETWORK, JSON.stringify(network));
}

function updateNetworkStats() {
  const network = loadNetwork();
  const mentorCount = document.getElementById("mentorCount");
  const peerCount = document.getElementById("peerCount");
  const supportCount = document.getElementById("supportCount");
  
  if (mentorCount) mentorCount.textContent = network.filter(n => n.type === "mentor").length;
  if (peerCount) peerCount.textContent = network.filter(n => n.type === "peer").length;
  if (supportCount) supportCount.textContent = network.filter(n => n.type === "support").length;
}

function renderNetwork() {
  const container = document.getElementById("networkList");
  if (!container) return;
  
  const network = loadNetwork();
  updateNetworkStats();
  
  if (!network.length) {
    container.innerHTML = '<p style="font-size:12px;color:#9ca3af;margin:0;">まだ記録がありません。大切なつながりを追加しましょう。</p>';
    return;
  }
  
  container.innerHTML = "";
  network.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `network-item ${item.type}`;
    div.innerHTML = `
      <span class="network-type">${networkIcons[item.type] || "👤"}</span>
      <span class="network-name">${item.name}</span>
      ${item.note ? `<span class="network-note">${item.note}</span>` : ""}
      <button class="network-delete" data-index="${index}">削除</button>
    `;
    container.appendChild(div);
  });
  
  container.querySelectorAll(".network-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const current = loadNetwork();
      current.splice(idx, 1);
      saveNetwork(current);
      renderNetwork();
    });
  });
}

function initNetwork() {
  const nameInput = document.getElementById("networkNameInput");
  const noteInput = document.getElementById("networkNoteInput");
  const select = document.getElementById("networkTypeSelect");
  const addBtn = document.getElementById("networkAddBtn");
  if (!nameInput || !select || !addBtn) return;
  
  const addNetwork = () => {
    const name = nameInput.value.trim();
    if (!name) return;
    const current = loadNetwork();
    current.push({
      name,
      note: noteInput ? noteInput.value.trim() : "",
      type: select.value,
      createdAt: new Date().toISOString()
    });
    saveNetwork(current);
    nameInput.value = "";
    if (noteInput) noteInput.value = "";
    renderNetwork();
  };
  
  addBtn.addEventListener("click", addNetwork);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNetwork();
    }
  });
  if (noteInput) {
    noteInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addNetwork();
      }
    });
  }
  
  renderNetwork();
}
