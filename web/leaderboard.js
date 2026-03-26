const statusEl = document.getElementById("leaderboard-status");
const bodyEl = document.getElementById("leaderboard-body");
const emptyStateEl = document.getElementById("empty-state");

const state = {
  board: "all",
  data: null,
};

function currency(value) {
  return `R${Number(value).toFixed(2).replace(".00", "")}`;
}

function percent(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

async function requestJson(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const looksJson =
    contentType.includes("application/json") ||
    rawText.trim().startsWith("{") ||
    rawText.trim().startsWith("[");

  let payload = null;
  if (rawText && looksJson) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const apiError = payload && typeof payload === "object" ? payload.error : null;
    const fallback = rawText?.trim()
      ? `Request failed (${response.status}). ${rawText.trim().slice(0, 180)}`
      : `Request failed (${response.status}).`;
    throw new Error(apiError || fallback);
  }

  if (payload === null) {
    throw new Error("Server returned an invalid response (expected JSON).");
  }

  return payload;
}

function renderRows(rows) {
  bodyEl.innerHTML = "";
  emptyStateEl.classList.toggle("is-hidden", rows.length > 0);
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.rank}</td>
      <td>${row.displayName || row.username}</td>
      <td>${row.difficultyLabel}</td>
      <td>${currency(row.totalDeposit)}</td>
      <td>${percent(row.luckyRatio)}</td>
      <td>${percent(row.unluckyRatio)}</td>
      <td>${row.score.toFixed(2)}</td>
    `;
    bodyEl.appendChild(tr);
  }
}

function renderCurrentBoard() {
  if (!state.data) {
    return;
  }
  const rows = state.data[state.board] || [];
  renderRows(rows);
  statusEl.textContent = `Showing ${rows.length} players on the ${state.board === "all" ? "Global" : state.board[0].toUpperCase() + state.board.slice(1)} board`;
}

async function loadLeaderboard() {
  statusEl.textContent = "Loading leaderboards...";
  try {
    state.data = await requestJson("/api/leaderboard");
    renderCurrentBoard();
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

document.querySelectorAll("[data-board]").forEach((button) => {
  button.addEventListener("click", () => {
    state.board = button.dataset.board;
    document.querySelectorAll("[data-board]").forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === button);
    });
    renderCurrentBoard();
  });
});

loadLeaderboard();
