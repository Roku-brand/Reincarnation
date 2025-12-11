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

// ---- ルーティン時刻表（localStorage保存） ----
const STORAGE_KEY_ROUTINE = "jn_user_routine_v1";
const DEFAULT_ROUTINE = [
  { time: "8:30", task: "起床 / 水分補給・ストレッチ / 身支度" },
  { time: "9:00", task: "朝食" },
  { time: "9:20", task: "英語学習（集中①）" },
  { time: "11:20", task: "休憩（散歩・コーヒー）" },
  { time: "11:40", task: "昼食調理・食事" },
  { time: "12:20", task: "自由休憩（仮眠 OK）" },
  { time: "13:00", task: "軽い家事・雑務" },
  { time: "14:00", task: "AI キャッチアップ" },
  { time: "14:30", task: "フリー枠（買い物・雑務など）" },
  { time: "15:00", task: "就活対策（1 時間）" },
  { time: "16:00", task: "筋トレ（45 分）、ストレッチ、シャワー・水分" },
  { time: "17:30", task: "英語学習（集中②／軽め）" },
  { time: "18:30", task: "夕食調理・食事" },
  { time: "19:30", task: "余暇（読書・動画）" },
  { time: "21:00", task: "日記・家計簿・翌日の ToDo 決め" },
  { time: "22:00", task: "入浴（湯船）" },
  { time: "22:30", task: "瞑想・ライトダウン" },
  { time: "23:00", task: "読書・就寝準備" },
  { time: "24:30", task: "就寝" }
];

function cloneDefaultRoutine() {
  return DEFAULT_ROUTINE.map((item) => ({ ...item }));
}

function loadRoutineTable() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROUTINE);
    if (!raw) return cloneDefaultRoutine();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return cloneDefaultRoutine();
    return parsed.map((item) => ({
      time: typeof item.time === "string" ? item.time : "",
      task: typeof item.task === "string" ? item.task : ""
    }));
  } catch {
    return cloneDefaultRoutine();
  }
}

function saveRoutineTable(list) {
  if (!Array.isArray(list)) return;
  const normalized = list.map((item) => ({
    time: typeof item.time === "string" ? item.time.trim() : "",
    task: typeof item.task === "string" ? item.task.trim() : ""
  }));
  localStorage.setItem(STORAGE_KEY_ROUTINE, JSON.stringify(normalized));
}

function renderRoutineTable() {
  const container = document.getElementById("routineTable");
  if (!container) return;

  const data = loadRoutineTable();
  container.innerHTML = "";

  if (!data.length) {
    const empty = document.createElement("p");
    empty.className = "routine-empty";
    empty.textContent = "まだ項目がありません。行を追加してください。";
    container.appendChild(empty);
    return;
  }

  data.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "routine-row";

    const timeInput = document.createElement("input");
    timeInput.type = "text";
    timeInput.className = "routine-input routine-time";
    timeInput.value = item.time || "";
    timeInput.placeholder = "08:30";
    timeInput.addEventListener("change", () => {
      const current = loadRoutineTable();
      if (!current[index]) return;
      current[index].time = timeInput.value.trim();
      saveRoutineTable(current);
    });

    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.className = "routine-input routine-task";
    taskInput.value = item.task || "";
    taskInput.placeholder = "内容を入力";
    taskInput.addEventListener("change", () => {
      const current = loadRoutineTable();
      if (!current[index]) return;
      current[index].task = taskInput.value.trim();
      saveRoutineTable(current);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "routine-delete-btn";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      const current = loadRoutineTable();
      current.splice(index, 1);
      saveRoutineTable(current);
      renderRoutineTable();
    });

    row.appendChild(timeInput);
    row.appendChild(taskInput);
    row.appendChild(delBtn);
    container.appendChild(row);
  });
}

function addRoutineRow() {
  const current = loadRoutineTable();
  current.push({ time: "", task: "" });
  saveRoutineTable(current);
  renderRoutineTable();
}

function resetRoutine() {
  saveRoutineTable(cloneDefaultRoutine());
  renderRoutineTable();
}

function initRoutineTable() {
  const table = document.getElementById("routineTable");
  if (!table) return;

  renderRoutineTable();

  const addBtn = document.getElementById("routineAddBtn");
  const resetBtn = document.getElementById("routineResetBtn");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addRoutineRow();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetRoutine);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initQuoteSection();
  initChat();
  initRoutineTable();
});
