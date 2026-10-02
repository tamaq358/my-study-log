const STORAGE_KEY = "study-log.entries.v1";
const SUBJECTS = ["英語", "数学", "国語", "理科", "社会", "プログラミング", "読書", "その他"];

const form = document.querySelector("#study-form");
const dateInput = document.querySelector("#entry-date");
const subjectInput = document.querySelector("#entry-subject");
const minutesInput = document.querySelector("#entry-minutes");
const learnedInput = document.querySelector("#entry-learned");
const nextInput = document.querySelector("#entry-next");
const clearButton = document.querySelector("#clear-button");
const entryList = document.querySelector("#entry-list");
const emptyState = document.querySelector("#empty-state");
const saveState = document.querySelector("#save-state");
const editingLabel = document.querySelector("#editing-label");
const entryCount = document.querySelector("#entry-count");
const totalTime = document.querySelector("#total-time");
const weeklyChart = document.querySelector("#weekly-chart");
const searchInput = document.querySelector("#search-input");
const subjectFilter = document.querySelector("#subject-filter");

let entries = loadEntries();

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter(isValidEntry) : [];
  } catch {
    return [];
  }
}

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry.date === "string" &&
    SUBJECTS.includes(entry.subject) &&
    Number.isFinite(entry.minutes) &&
    typeof entry.learned === "string"
  );
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getTodayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseIsoDate(dateText) {
  return new Date(`${dateText}T00:00:00`);
}

function formatDate(dateText, options = { month: "long", day: "numeric", weekday: "short" }) {
  return new Intl.DateTimeFormat("ja-JP", options).format(parseIsoDate(dateText));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFilteredEntries() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedSubject = subjectFilter.value;

  return entries.filter((entry) => {
    const matchesSubject = selectedSubject === "all" || entry.subject === selectedSubject;
    const searchableText = `${entry.subject} ${entry.learned} ${entry.next ?? ""}`.toLowerCase();
    return matchesSubject && (!query || searchableText.includes(query));
  });
}

function renderEntries() {
  const filteredEntries = getFilteredEntries();
  entryList.innerHTML = filteredEntries
    .map(
      (entry) => `
        <li class="entry-card">
          <div class="entry-topline">
            <span class="entry-date">${formatDate(entry.date)}</span>
            <span class="subject-badge">${escapeHtml(entry.subject)}</span>
          </div>
          <p class="entry-duration">${entry.minutes} 分</p>
          <div class="entry-copy">
            <h3>学んだこと</h3>
            <p>${escapeHtml(entry.learned)}</p>
          </div>
          ${entry.next ? `<div class="entry-copy entry-next"><h3>次の一歩</h3><p>${escapeHtml(entry.next)}</p></div>` : ""}
          <div class="entry-actions">
            <button type="button" data-action="edit" data-date="${entry.date}">編集</button>
            <button class="danger-button" type="button" data-action="delete" data-date="${entry.date}">削除</button>
          </div>
        </li>
      `,
    )
    .join("");

  if (entries.length > 0 && filteredEntries.length === 0) {
    emptyState.innerHTML = "<strong>条件に合う記録がありません</strong><span>検索語や分野を変えてみてください。</span>";
  } else {
    emptyState.innerHTML = "<strong>学びの記録を始めましょう</strong><span>学習した分野と内容を保存すると、ここに積み重なります。</span>";
  }

  emptyState.hidden = filteredEntries.length > 0;
  entryList.hidden = filteredEntries.length === 0;
}

function renderStats() {
  const totalMinutes = entries.reduce((total, entry) => total + entry.minutes, 0);
  entryCount.textContent = entries.length;
  totalTime.textContent = formatDuration(totalMinutes);

  const today = parseIsoDate(getTodayIso());
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const date = getDateIso(day);
    const minutes = entries
      .filter((entry) => entry.date === date)
      .reduce((total, entry) => total + entry.minutes, 0);
    return { date, minutes, label: formatDate(date, { weekday: "short" }) };
  });
  const maxMinutes = Math.max(60, ...days.map((day) => day.minutes));

  weeklyChart.innerHTML = days
    .map(
      (day) => `
        <div class="week-day" aria-label="${formatDate(day.date)}、${day.minutes}分">
          <span class="week-bar-wrap"><span class="week-bar${day.minutes ? " has-study" : ""}" style="--bar-height: ${Math.max(5, (day.minutes / maxMinutes) * 100)}%"></span></span>
          <span class="week-minutes">${day.minutes || "·"}</span>
          <span class="week-label">${day.label}</span>
        </div>
      `,
    )
    .join("");
}

function getDateIso(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}分`;
  if (remainingMinutes === 0) return `${hours}時間`;
  return `${hours}時間${remainingMinutes}分`;
}

function render() {
  entries.sort((a, b) => b.date.localeCompare(a.date));
  renderStats();
  renderEntries();
}

function updateSaveState(text) {
  saveState.textContent = text;
}

function resetForm() {
  form.reset();
  dateInput.value = getTodayIso();
  editingLabel.textContent = "今日の学習を記録";
  updateSaveState("未保存");
}

function loadEntryIntoForm(entry) {
  dateInput.value = entry.date;
  subjectInput.value = entry.subject;
  minutesInput.value = entry.minutes;
  learnedInput.value = entry.learned;
  nextInput.value = entry.next ?? "";
  editingLabel.textContent = `${formatDate(entry.date)}の記録を編集中`;
  updateSaveState("編集中");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = dateInput.value;
  const subject = subjectInput.value;
  const minutes = Number(minutesInput.value);
  const learned = learnedInput.value.trim();
  const next = nextInput.value.trim();

  if (!date || !SUBJECTS.includes(subject) || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440 || !learned) {
    updateSaveState("入力を確認");
    return;
  }

  const existingIndex = entries.findIndex((entry) => entry.date === date);
  const now = new Date().toISOString();
  const nextEntry = {
    id: existingIndex >= 0 ? entries[existingIndex].id : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date,
    subject,
    minutes,
    learned,
    next,
    createdAt: existingIndex >= 0 ? entries[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) entries[existingIndex] = nextEntry;
  else entries.push(nextEntry);

  saveEntries();
  render();
  loadEntryIntoForm(nextEntry);
  updateSaveState("保存済み");
});

dateInput.addEventListener("change", () => {
  if (!dateInput.value) return;
  const existingEntry = entries.find((entry) => entry.date === dateInput.value);
  if (existingEntry) {
    loadEntryIntoForm(existingEntry);
    return;
  }
  subjectInput.value = "";
  minutesInput.value = "";
  learnedInput.value = "";
  nextInput.value = "";
  editingLabel.textContent = `${formatDate(dateInput.value)}の学習を記録`;
  updateSaveState("未保存");
});

form.addEventListener("input", () => updateSaveState("編集中"));
clearButton.addEventListener("click", resetForm);

entryList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const entry = entries.find((item) => item.date === button.dataset.date);
  if (!entry) return;

  if (button.dataset.action === "edit") {
    loadEntryIntoForm(entry);
    document.querySelector(".editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (button.dataset.action === "delete" && confirm(`${formatDate(entry.date)}の学習記録を削除しますか？`)) {
    entries = entries.filter((item) => item.date !== entry.date);
    saveEntries();
    render();
    resetForm();
  }
});

searchInput.addEventListener("input", renderEntries);
subjectFilter.addEventListener("change", renderEntries);
dateInput.value = getTodayIso();
render();
