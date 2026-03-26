const reelsEl = document.getElementById("reels");
const reelTemplate = document.getElementById("reel-template");
const symbolTemplate = document.getElementById("symbol-template");
const difficultyModalEl = document.getElementById("difficulty-modal");
const difficultyGridEl = document.getElementById("difficulty-grid");
const difficultyEyebrowEl = document.getElementById("difficulty-eyebrow");
const difficultyTitleEl = document.getElementById("difficulty-title");
const difficultyCopyEl = document.getElementById("difficulty-copy");
const difficultyCloseButtonEl = document.getElementById("difficulty-close-button");

const balanceEl = document.getElementById("balance");
const spinTotalEl = document.getElementById("spin-total");
const difficultyLabelEl = document.getElementById("difficulty-label");
const depositCapEl = document.getElementById("deposit-cap");
const aOddsEl = document.getElementById("a-odds");
const winRatioEl = document.getElementById("win-ratio");
const lastWinEl = document.getElementById("last-win");
const lastNetEl = document.getElementById("last-net");
const winningLinesEl = document.getElementById("winning-lines");
const statusPillEl = document.getElementById("status-pill");

const authTitleEl = document.getElementById("auth-title");
const guestAuthEl = document.getElementById("guest-auth");
const userPanelEl = document.getElementById("user-panel");
const usernameDisplayEl = document.getElementById("username-display");
const modeDisplayEl = document.getElementById("mode-display");
const topTenDisplayEl = document.getElementById("top-ten-display");
const authFormEl = document.getElementById("auth-form");
const authSubmitEl = document.getElementById("auth-submit");
const usernameInputEl = document.getElementById("username-input");
const passwordInputEl = document.getElementById("password-input");
const logoutButtonEl = document.getElementById("logout-button");
const chooseModeButtonEl = document.getElementById("choose-mode-button");
const modeResetHintEl = document.getElementById("mode-reset-hint");

const depositInput = document.getElementById("deposit-input");
const depositButton = document.getElementById("deposit-button");
const spinButton = document.getElementById("spin-button");
const betValueEl = document.getElementById("bet-value");

const symbols = ["A", "B", "C", "D"];

const state = {
  authMode: "login",
  authenticated: false,
  user: null,
  bet: 10,
  reels: [],
  isSpinning: false,
  difficultyOptions: [],
  needsDifficultySelection: false,
  modeChooserOpen: false,
};

function currency(value) {
  return `R${Number(value).toFixed(2).replace(".00", "")}`;
}

function percent(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function createSymbolCard(symbol) {
  const node = symbolTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.symbol = symbol;
  node.querySelector("span").textContent = symbol;
  return node;
}

function setTrackToColumns(track, symbolsForColumn, winningLines = []) {
  track.innerHTML = "";
  const cards = symbolsForColumn.map((symbol, rowIndex) => {
    const card = createSymbolCard(symbol);
    card.classList.toggle("is-winning", winningLines.includes(rowIndex + 1));
    track.appendChild(card);
    return card;
  });
  track.style.transition = "none";
  track.style.transform = "translateY(0)";
  return cards;
}

function createReels() {
  for (let i = 0; i < 3; i += 1) {
    const reel = reelTemplate.content.firstElementChild.cloneNode(true);
    const track = reel.querySelector(".reel__symbols");
    const cards = setTrackToColumns(track, ["A", "A", "A"]);
    reelsEl.appendChild(reel);
    state.reels.push({ reel, track, cards });
  }
}

function renderAuthMode() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.authMode === state.authMode);
  });
  authSubmitEl.textContent = state.authMode === "login" ? "Login" : "Create account";
}

function renderAccount() {
  const isAuthenticated = state.authenticated && state.user;
  guestAuthEl.classList.toggle("is-hidden", isAuthenticated);
  userPanelEl.classList.toggle("is-hidden", !isAuthenticated);
  authTitleEl.textContent = isAuthenticated ? "Account ready" : "Sign in to play";

  if (isAuthenticated) {
    usernameDisplayEl.textContent = state.user.displayName || state.user.username;
    modeDisplayEl.textContent = state.user.difficultyLabel;
    topTenDisplayEl.textContent = state.user.isTopTen ? "Unlocked" : "Locked";
    chooseModeButtonEl.textContent = state.user.difficulty ? "Change mode" : "Select mode";
    modeResetHintEl.textContent = state.user.difficulty
      ? "Changing mode wipes your current run history, balance, and leaderboard score."
      : "Pick a mode before you deposit or spin.";
  }
}

function updateControls() {
  const balance = state.user?.balance ?? 0;
  const cap = state.user?.maxDepositLimit ?? 0;
  const maxBetPerLine = Math.max(1, Math.floor(Math.min(balance, cap) / 3));
  state.bet = clamp(state.bet, 1, maxBetPerLine || 1);
  betValueEl.textContent = state.bet;

  balanceEl.textContent = currency(balance);
  spinTotalEl.textContent = currency(state.bet * 3);
  difficultyLabelEl.textContent = state.user?.difficultyLabel ?? "Unset";
  depositCapEl.textContent = currency(cap);
  aOddsEl.textContent = state.user?.aOddsText ?? "Choose mode";
  winRatioEl.textContent = percent(state.user?.hitRate ?? 0);
  depositInput.max = String(cap || 0);

  const canSpin =
    state.authenticated &&
    !state.needsDifficultySelection &&
    !state.isSpinning &&
    balance >= state.bet * 3 &&
    state.bet * 3 <= cap;

  spinButton.disabled = !canSpin;
  depositButton.disabled = !state.authenticated || state.needsDifficultySelection;
  depositInput.disabled = !state.authenticated || state.needsDifficultySelection;
}

function renderResult(data) {
  lastWinEl.textContent = currency(data.lastWin ?? 0);
  lastNetEl.textContent = currency(data.lastNet ?? 0);
  winningLinesEl.textContent = data.winningLines?.length ? data.winningLines.join(", ") : "-";
  statusPillEl.textContent = data.status;
}

function paintFinalGrid(columns, winningLines = []) {
  state.reels.forEach((reelState, columnIndex) => {
    reelState.cards = setTrackToColumns(reelState.track, columns[columnIndex], winningLines);
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
      ...(options.headers || {}),
    },
    credentials: "same-origin",
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Something went wrong.");
  }
  return payload;
}

function renderDifficultyChooser() {
  difficultyGridEl.innerHTML = "";
  const shouldShow = state.authenticated && (state.needsDifficultySelection || state.modeChooserOpen);
  difficultyModalEl.classList.toggle("is-hidden", !shouldShow);
  difficultyCloseButtonEl.classList.toggle("is-hidden", state.needsDifficultySelection);
  if (!shouldShow) {
    return;
  }

  const currentMode = state.user?.difficulty || "";
  const currentModeLabel = state.user?.difficultyLabel || "Unset";
  const isChanging = Boolean(currentMode);
  difficultyEyebrowEl.textContent = isChanging ? "Switch class" : "Choose your class";
  difficultyTitleEl.textContent = isChanging ? "Change your difficulty" : "Pick your difficulty";
  difficultyCopyEl.textContent = isChanging
    ? `Your current class is ${currentModeLabel}. Switching to another mode resets that run's balance, deposit score, and leaderboard history.`
    : "Choose the mode that drives your deposit cap, odds, and leaderboard class.";

  for (const option of state.difficultyOptions) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `difficulty-option ${currentMode === option.id ? "is-active" : ""}`;
    card.innerHTML = `
      <strong>${option.label}</strong>
      <span>Starting cap ${currency(option.startingLimit)}</span>
      <small>${currentMode === option.id ? "Current mode" : `A odds 1 in ${option.aDenominator}`}</small>
    `;
    card.addEventListener("click", async () => {
      if (currentMode === option.id) {
        state.modeChooserOpen = false;
        renderDifficultyChooser();
        statusPillEl.textContent = `${option.label} mode is already active.`;
        return;
      }

      if (
        currentMode &&
        !window.confirm(
          `Switch to ${option.label} mode? This will delete your current ${currentModeLabel} run history, reset your balance to R0, and clear its leaderboard progress.`
        )
      ) {
        return;
      }

      try {
        const payload = await requestJson("/api/select-difficulty", {
          method: "POST",
          body: JSON.stringify({ difficulty: option.id }),
        });
        state.modeChooserOpen = false;
        applySnapshot(payload);
      } catch (error) {
        statusPillEl.textContent = error.message;
      }
    });
    difficultyGridEl.appendChild(card);
  }
}

function applySnapshot(data) {
  state.authenticated = data.authenticated;
  state.user = data.user;
  state.difficultyOptions = data.difficultyOptions || [];
  state.needsDifficultySelection = data.needsDifficultySelection;
  if (!state.needsDifficultySelection) {
    state.modeChooserOpen = false;
  }
  renderResult(data);
  paintFinalGrid(data.lastSpin, data.winningLines);
  renderAccount();
  renderDifficultyChooser();
  updateControls();
}

async function refreshState() {
  const data = await requestJson("/api/state");
  applySnapshot(data);
}

async function deposit() {
  const amount = Number.parseFloat(depositInput.value);
  try {
    const data = await requestJson("/api/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    applySnapshot(data);
    depositInput.value = "";
  } catch (error) {
    statusPillEl.textContent = error.message;
  }
}

async function spin() {
  if (state.isSpinning || !state.authenticated || state.needsDifficultySelection) {
    return;
  }
  statusPillEl.textContent = "Spinning reels...";
  try {
    const data = await requestJson("/api/spin", {
      method: "POST",
      body: JSON.stringify({ bet: state.bet }),
    });
    state.authenticated = data.authenticated;
    state.user = data.user;
    state.difficultyOptions = data.difficultyOptions || [];
    state.needsDifficultySelection = data.needsDifficultySelection;
    renderResult(data);
    renderAccount();
    renderDifficultyChooser();
    animateSpin(data.lastSpin, data.winningLines || []);
  } catch (error) {
    statusPillEl.textContent = error.message;
  }
}

async function submitAuth(event) {
  event.preventDefault();
  try {
    const payload = await requestJson(`/api/${state.authMode}`, {
      method: "POST",
      body: JSON.stringify({
        username: usernameInputEl.value.trim(),
        password: passwordInputEl.value,
      }),
    });
    usernameInputEl.value = "";
    passwordInputEl.value = "";
    applySnapshot(payload);
  } catch (error) {
    statusPillEl.textContent = error.message;
  }
}

async function logout() {
  try {
    await requestJson("/api/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    state.modeChooserOpen = false;
    await refreshState();
  } catch (error) {
    statusPillEl.textContent = error.message;
  }
}

function openModeChooser() {
  if (!state.authenticated) {
    statusPillEl.textContent = "Sign in before choosing a mode.";
    return;
  }
  state.modeChooserOpen = true;
  renderDifficultyChooser();
}

document.querySelectorAll("[data-auth-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.authMode = button.dataset.authMode;
    renderAuthMode();
  });
});

document.querySelectorAll("[data-adjust]").forEach((button) => {
  button.addEventListener("click", () => {
    const delta = Number.parseInt(button.dataset.delta, 10);
    state.bet = Math.max(1, state.bet + delta);
    updateControls();
  });
});

authFormEl.addEventListener("submit", submitAuth);
logoutButtonEl.addEventListener("click", logout);
chooseModeButtonEl.addEventListener("click", openModeChooser);
depositButton.addEventListener("click", deposit);
spinButton.addEventListener("click", spin);
difficultyCloseButtonEl.addEventListener("click", () => {
  state.modeChooserOpen = false;
  renderDifficultyChooser();
});
difficultyModalEl.addEventListener("click", (event) => {
  if (event.target !== difficultyModalEl || state.needsDifficultySelection) {
    return;
  }
  state.modeChooserOpen = false;
  renderDifficultyChooser();
});

createReels();
renderAuthMode();
refreshState().catch((error) => {
  statusPillEl.textContent = error.message;
});
