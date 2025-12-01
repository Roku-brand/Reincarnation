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
});
