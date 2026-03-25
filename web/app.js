const reelsEl = document.getElementById("reels");
const reelTemplate = document.getElementById("reel-template");
const symbolTemplate = document.getElementById("symbol-template");

const balanceEl = document.getElementById("balance");
const spinTotalEl = document.getElementById("spin-total");
const lastWinEl = document.getElementById("last-win");
const lastNetEl = document.getElementById("last-net");
const winningLinesEl = document.getElementById("winning-lines");
const statusPillEl = document.getElementById("status-pill");

const depositInput = document.getElementById("deposit-input");
const depositButton = document.getElementById("deposit-button");
const spinButton = document.getElementById("spin-button");
const linesValueEl = document.getElementById("lines-value");
const betValueEl = document.getElementById("bet-value");

const symbols = ["A", "B", "C", "D"];

const state = {
  balance: 0,
  lines: 3,
  bet: 10,
  limits: {
    minBet: 1,
    maxBet: 100,
    maxLines: 3,
  },
  reels: [],
  isSpinning: false,
};

function randSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function currency(value) {
  return `R${value}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createSymbolCard(symbol) {
  const node = symbolTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.symbol = symbol;
  node.querySelector("span").textContent = symbol;
  return node;
}

function createReels() {
  for (let i = 0; i < 3; i += 1) {
    const reel = reelTemplate.content.firstElementChild.cloneNode(true);
    const track = reel.querySelector(".reel__symbols");
    const cards = [];

    for (let row = 0; row < 3; row += 1) {
      const card = createSymbolCard("A");
      cards.push(card);
      track.appendChild(card);
    }

    reelsEl.appendChild(reel);
    state.reels.push({ reel, track, cards });
  }
}

function updateControls() {
  const maxBetForRound = state.balance > 0 ? Math.min(state.limits.maxBet, Math.floor(state.balance / state.lines)) : 0;
  state.bet = maxBetForRound <= 0 ? state.limits.minBet : clamp(state.bet, state.limits.minBet, maxBetForRound);

  linesValueEl.textContent = state.lines;
  betValueEl.textContent = state.bet;
  balanceEl.textContent = currency(state.balance);
  spinTotalEl.textContent = currency(state.lines * state.bet);

  const canSpin =
    !state.isSpinning &&
    state.balance >= state.lines * state.limits.minBet &&
    state.lines * state.bet <= state.balance;

  spinButton.disabled = !canSpin;
}

function renderResult(data) {
  lastWinEl.textContent = currency(data.lastWin ?? 0);
  lastNetEl.textContent = currency(data.lastNet ?? 0);
  winningLinesEl.textContent = data.winningLines?.length ? data.winningLines.join(", ") : "-";
  statusPillEl.textContent = data.status;
}

function paintFinalGrid(columns, winningLines = []) {
  state.reels.forEach((reelState, columnIndex) => {
    reelState.track.style.transform = "translateY(0)";
    reelState.cards.forEach((card, rowIndex) => {
      const symbol = columns[columnIndex][rowIndex];
      card.dataset.symbol = symbol;
      card.querySelector("span").textContent = symbol;
      card.classList.toggle("is-winning", winningLines.includes(rowIndex + 1));
    });
  });
}

function animateSpin(finalColumns, winningLines) {
  state.isSpinning = true;
  updateControls();

  state.reels.forEach((reelState, columnIndex) => {
    const previewSymbols = [];
    for (let i = 0; i < 12; i += 1) {
      previewSymbols.push(randSymbol());
    }
    previewSymbols.push(...finalColumns[columnIndex]);

    reelState.track.innerHTML = "";
    const animatedCards = previewSymbols.map((symbol) => {
      const card = createSymbolCard(symbol);
      reelState.track.appendChild(card);
      return card;
    });

    reelState.cards = animatedCards.slice(-3);
    reelState.track.style.transition = "none";
    reelState.track.style.transform = "translateY(0)";

    requestAnimationFrame(() => {
      const cardHeight = animatedCards[0].getBoundingClientRect().height + 14;
      const distance = (previewSymbols.length - 3) * cardHeight;
      reelState.track.style.transition = `transform ${820 + columnIndex * 180}ms cubic-bezier(0.2, 0.82, 0.2, 1)`;
      reelState.track.style.transform = `translateY(-${distance}px)`;
    });
  });

  window.setTimeout(() => {
    paintFinalGrid(finalColumns, winningLines);
    state.isSpinning = false;
    updateControls();
  }, 1280);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Something went wrong.");
  }
  return payload;
}

async function refreshState() {
  const data = await requestJson("/api/state");
  state.balance = data.balance;
  state.limits = data.limits;
  renderResult(data);
  paintFinalGrid(data.lastSpin, data.winningLines);
  updateControls();
}

async function deposit() {
  const amount = Number.parseInt(depositInput.value, 10);
  try {
    const data = await requestJson("/api/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    state.balance = data.balance;
    renderResult(data);
    updateControls();
    depositInput.value = "";
  } catch (error) {
    statusPillEl.textContent = error.message;
  }
}

async function spin() {
  if (state.isSpinning) {
    return;
  }

  statusPillEl.textContent = "Spinning reels...";
  try {
    const data = await requestJson("/api/spin", {
      method: "POST",
      body: JSON.stringify({
        lines: state.lines,
        bet: state.bet,
      }),
    });
    state.balance = data.balance;
    renderResult(data);
    animateSpin(data.lastSpin, data.winningLines || []);
  } catch (error) {
    statusPillEl.textContent = error.message;
  }
}

document.querySelectorAll("[data-adjust]").forEach((button) => {
  button.addEventListener("click", () => {
    const kind = button.dataset.adjust;
    const delta = Number.parseInt(button.dataset.delta, 10);

    if (kind === "lines") {
      state.lines = clamp(state.lines + delta, 1, state.limits.maxLines);
    } else {
      state.bet = clamp(state.bet + delta, state.limits.minBet, state.limits.maxBet);
    }

    updateControls();
  });
});

depositButton.addEventListener("click", deposit);
spinButton.addEventListener("click", spin);

createReels();
refreshState().catch((error) => {
  statusPillEl.textContent = error.message;
});
