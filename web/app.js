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
const tdaTotalEl = document.getElementById("tda-total");
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
const betTextInputEl = document.getElementById("bet-text-input");
const turboToggleEl = document.getElementById("turbo-toggle");
const easyCapWarningEl = document.getElementById("easy-cap-warning");
const easyCapAmountEl = document.getElementById("easy-cap-amount");
const vaultTdaEl = document.getElementById("vault-tda");
const vaultPlayBalanceEl = document.getElementById("vault-play-balance");
const vaultClassEl = document.getElementById("vault-class");
const depositToPlayInput = document.getElementById("deposit-to-play-input");
const depositToPlayButton = document.getElementById("deposit-to-play-button");
const depositToPlayHint = document.getElementById("deposit-to-play-hint");
const rechargeSection = document.getElementById("recharge-section");
const rechargeButton = document.getElementById("recharge-button");
const rechargeHint = document.getElementById("recharge-hint");
const sessionWonEl = document.getElementById("session-won");
const luckiestSpinEl = document.getElementById("luckiest-spin");
const sessionSpinsEl = document.getElementById("session-spins");
const autoSpinStartEl = document.getElementById("auto-spin-start");
const autoSpinStopEl = document.getElementById("auto-spin-stop");
const autoThresholdEl = document.getElementById("auto-threshold");
const autoSpinProgressEl = document.getElementById("auto-spin-progress");
const autoSpinFillEl = document.getElementById("auto-spin-fill");
const autoSpinCountdownEl = document.getElementById("auto-spin-countdown");
const autoSpinStatusEl = document.getElementById("auto-spin-status");
const winOverlayEl = document.getElementById("win-overlay");
const winOverlayAmountEl = document.getElementById("win-overlay-amount");
const winOverlayMultiplierEl = document.getElementById("win-overlay-multiplier");
const particleCanvas = document.getElementById("particle-canvas");

const symbols = ["A", "B", "C", "D", "S"];

const state = {
  authMode: "login",
  authenticated: false,
  user: null,
  tda: null,
  bet: 10,
  reels: [],
  isSpinning: false,
  difficultyOptions: [],
  needsDifficultySelection: false,
  modeChooserOpen: false,
  turboMode: false,
  sessionStats: { totalWon: 0, luckiestMultiplier: 0, spins: 0 },
  autoSpin: { enabled: false, count: 0, remaining: 0, threshold: 5, selectedCount: null },
};

// ========================
// PARTICLE SYSTEM
// ========================
let particles = [];
let particleCtx = null;

function initParticles() {
  if (!particleCanvas) return;
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
  particleCtx = particleCanvas.getContext("2d");
  window.addEventListener("resize", () => {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  });
  requestAnimationFrame(renderParticles);
}

function createParticles(x, y, count = 30, color = null) {
  const colors = color ? [color] : ["#fbbf24", "#6366f1", "#a855f7", "#ec4899", "#34d399"];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    });
  }
}

function createWinParticles() {
  const rect = reelsEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  createParticles(cx, cy, 50, null);
  // Add side bursts
  createParticles(rect.left, cy, 20, "#fbbf24");
  createParticles(rect.right, cy, 20, "#6366f1");
}

function renderParticles() {
  if (!particleCtx) { requestAnimationFrame(renderParticles); return; }
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravity
    p.life -= p.decay;
    p.rotation += p.rotSpeed;
    particleCtx.save();
    particleCtx.translate(p.x, p.y);
    particleCtx.rotate(p.rotation);
    particleCtx.globalAlpha = p.life;
    particleCtx.fillStyle = p.color;
    particleCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    particleCtx.restore();
  }
  requestAnimationFrame(renderParticles);
}

initParticles();

// ========================
// UTILITY FUNCTIONS
// ========================
function currency(value) { return `R${Number(value).toFixed(2).replace(".00", "")}`; }
function percent(value) { return `${(Number(value) * 100).toFixed(1)}%`; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function randSymbol() { return symbols[Math.floor(Math.random() * symbols.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ========================
// SYMBOL & REEL FUNCTIONS
// ========================
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
  for (let i = 0; i < 3; i++) {
    const reel = reelTemplate.content.firstElementChild.cloneNode(true);
    const track = reel.querySelector(".reel__symbols");
    const cards = setTrackToColumns(track, ["A", "A", "A"]);
    reelsEl.appendChild(reel);
    state.reels.push({ reel, track, cards });
  }
}

// ========================
// ANIMATED SPIN WITH PHYSICS
// ========================
function animateSpin(finalColumns, winningLines) {
  state.isSpinning = true;
  updateControls();

  state.reels.forEach((reelState, columnIndex) => {
    const previewSymbols = [];
    // More symbols for smoother spin
    for (let i = 0; i < 15; i++) previewSymbols.push(randSymbol());
    previewSymbols.push(...finalColumns[columnIndex]);

    reelState.track.innerHTML = "";
    const animatedCards = previewSymbols.map(symbol => {
      const card = createSymbolCard(symbol);
      reelState.track.appendChild(card);
      return card;
    });

    // Anticipation: pull back slightly before spinning
    reelState.track.style.transition = "none";
    reelState.track.style.transform = "translateY(0)";

    requestAnimationFrame(() => {
      const cardHeight = animatedCards[0].getBoundingClientRect().height + 10;
      const distance = (previewSymbols.length - 3) * cardHeight;
      const duration = state.turboMode ? 180 + columnIndex * 40 : 700 + columnIndex * 150;

      // Anticipation: slight upward nudge before the main spin
      const anticipationOffset = state.turboMode ? 0 : cardHeight * 0.3;

      reelState.track.style.transition = `transform ${duration * 0.1}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      reelState.track.style.transform = `translateY(-${anticipationOffset}px)`;

      setTimeout(() => {
        // Main spin with overshoot
        reelState.track.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        reelState.track.style.transform = `translateY(-${distance}px)`;
      }, state.turboMode ? 20 : 80);
    });
  });

  const delay = state.turboMode ? 300 : 1100;
  window.setTimeout(() => {
    paintFinalGrid(finalColumns, winningLines);
    state.isSpinning = false;
    updateControls();

    // Trigger win effects
    if (winningLines.length > 0) {
      createWinParticles();
      // Check for big win
      if (state.user) {
        const totalBet = state.bet * 3;
        const lastWin = state.user.lastWin || 0;
        if (lastWin > 0 && totalBet > 0) {
          const mult = lastWin / totalBet;
          if (mult >= 5) showBigWin(lastWin, mult);
        }
      }
    }

    // Continue auto-spin
    if (state.autoSpin.enabled && state.autoSpin.remaining > 0) {
      setTimeout(() => executeAutoSpin(), 50);
    }
  }, delay);
}

function paintFinalGrid(columns, winningLines = []) {
  state.reels.forEach((reelState, columnIndex) => {
    reelState.cards = setTrackToColumns(reelState.track, columns[columnIndex], winningLines);
  });
}

// ========================
// BIG WIN OVERLAY
// ========================
function showBigWin(amount, multiplier) {
  if (!winOverlayEl) return;
  winOverlayEl.classList.remove("is-hidden");
  winOverlayAmountEl.textContent = currency(0);
  winOverlayMultiplierEl.textContent = `${multiplier.toFixed(1)}x Total Bet`;

  // Animated counter
  const duration = 1500;
  const start = performance.now();
  const target = amount;

  function counterStep(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(target * eased);
    winOverlayAmountEl.textContent = currency(current);
    if (progress < 1) requestAnimationFrame(counterStep);
  }
  requestAnimationFrame(counterStep);

  // Auto-dismiss
  setTimeout(() => {
    winOverlayEl.classList.add("is-hidden");
  }, 3000);

  // Click to dismiss
  winOverlayEl.onclick = () => {
    winOverlayEl.classList.add("is-hidden");
    winOverlayEl.onclick = null;
  };
}

// ========================
// SESSION STATS
// ========================
function updateSessionStats(result) {
  if (result.lastWin > 0 && result.bet > 0) {
    const multiplier = result.lastWin / (result.bet * 3);
    state.sessionStats.totalWon += result.lastWin;
    sessionWonEl.textContent = currency(state.sessionStats.totalWon);
    sessionWonEl.classList.toggle("positive", state.sessionStats.totalWon > 0);
    sessionWonEl.classList.toggle("negative", state.sessionStats.totalWon < 0);
    if (multiplier > state.sessionStats.luckiestMultiplier) {
      state.sessionStats.luckiestMultiplier = multiplier;
      luckiestSpinEl.textContent = `${multiplier.toFixed(1)}x`;
    }
    state.sessionStats.spins++;
    sessionSpinsEl.textContent = state.sessionStats.spins;
  }
}

function resetSessionStats() {
  state.sessionStats = { totalWon: 0, luckiestMultiplier: 0, spins: 0 };
  sessionWonEl.textContent = "R0";
  sessionWonEl.classList.remove("positive", "negative");
  luckiestSpinEl.textContent = "-";
  sessionSpinsEl.textContent = "0";
}

// ========================
// TURBO MODE
// ========================
function toggleTurboMode() {
  state.turboMode = !state.turboMode;
  turboToggleEl.classList.toggle("is-active", state.turboMode);
  turboToggleEl.setAttribute("aria-pressed", state.turboMode);
  turboToggleEl.querySelector(".turbo-label").textContent = state.turboMode ? "Turbo ON" : "Turbo";
}

// ========================
// AUTO-SPIN
// ========================
function selectAutoSpinCount(count) {
  state.autoSpin.selectedCount = count;
  document.querySelectorAll(".auto-spin-count").forEach(btn => {
    btn.classList.toggle("is-selected", parseInt(btn.dataset.spins, 10) === count);
  });
}

function startAutoSpin() {
  if (!state.authenticated || state.isSpinning) return;
  const count = state.autoSpin.selectedCount || 10;
  let threshold = parseFloat(autoThresholdEl.value);
  if (isNaN(threshold) || threshold < 1) { threshold = 5; autoThresholdEl.value = "5"; }
  state.autoSpin = { enabled: true, count, remaining: count, threshold, selectedCount: count };
  autoSpinStartEl.style.display = "none";
  autoSpinStopEl.style.display = "block";
  autoSpinProgressEl.style.display = "flex";
  updateAutoSpinProgress();
  executeAutoSpin();
}

function stopAutoSpin() {
  state.autoSpin.enabled = false;
  autoSpinStartEl.style.display = "block";
  autoSpinStopEl.style.display = "none";
  autoSpinProgressEl.style.display = "none";
  autoSpinStatusEl.textContent = "Stopped";
}

function updateAutoSpinProgress() {
  const total = state.autoSpin.count;
  const remaining = state.autoSpin.remaining;
  const completed = total - remaining;
  autoSpinFillEl.style.width = `${(completed / total) * 100}%`;
  autoSpinCountdownEl.textContent = `${completed}/${total}`;
}

async function executeAutoSpin() {
  if (!state.autoSpin.enabled || state.autoSpin.remaining <= 0) { stopAutoSpin(); statusPillEl.textContent = "Auto-spin completed!"; return; }
  if (state.isSpinning || !state.authenticated || state.needsDifficultySelection) { await sleep(100); if (state.autoSpin.enabled) executeAutoSpin(); return; }
  const balance = state.user?.balance ?? 0;
  if (balance < state.bet * 3) { stopAutoSpin(); statusPillEl.textContent = "Insufficient balance for auto-spin."; return; }
  state.autoSpin.remaining--;
  updateAutoSpinProgress();
  autoSpinStatusEl.textContent = "Spinning...";
  try {
    const data = await requestJson("/api/spin", { method: "POST", body: JSON.stringify({ bet: state.bet }) });
    state.authenticated = data.authenticated;
    state.user = data.user;
    state.difficultyOptions = data.classOptions || data.difficultyOptions || [];
    state.needsDifficultySelection = data.needsDifficultySelection;
    renderResult(data);
    renderAccount();
    renderDifficultyChooser();
    updateSessionStats(data);
    updateControls();
    animateSpin(data.lastSpin, data.winningLines || []);
    if (data.lastWin > 0 && data.bet > 0) {
      const multiplier = data.lastWin / (data.bet * 3);
      if (multiplier >= state.autoSpin.threshold) { stopAutoSpin(); statusPillEl.textContent = `Auto-spin stopped! Hit ${multiplier.toFixed(1)}x multiplier!`; return; }
    }
    if (!state.autoSpin.enabled || state.autoSpin.remaining <= 0) { stopAutoSpin(); return; }
    const animDuration = state.turboMode ? 400 : 1400;
    setTimeout(() => { if (state.autoSpin.enabled) executeAutoSpin(); }, animDuration);
  } catch (error) { statusPillEl.textContent = error.message; stopAutoSpin(); }
}

// ========================
// VAULT / TDA FUNCTIONS
// ========================
function updateEasyCapWarning() {
  const selectedClass = state.user?.selectedClass || state.user?.difficulty;
  const isEasyMode = selectedClass === "easy";
  const depositCap = state.user?.depositCap;
  if (isEasyMode && depositCap != null) {
    easyCapWarningEl.style.display = "flex";
    easyCapAmountEl.textContent = currency(depositCap);
  } else {
    easyCapWarningEl.style.display = "none";
  }
}

function updateRechargeUI() {
  if (!rechargeSection) return;
  const classConfig = state.user?.classConfig;
  if (!classConfig || !classConfig.bankruptcy_protection) { rechargeSection.style.display = "none"; return; }
  rechargeSection.style.display = "block";
  const rechargeAt = state.tda?.rechargeAvailableAt;
  const tda = state.tda?.total ?? 0;
  const floor = classConfig.min_tda_floor ?? 10;
  if (tda > floor) { rechargeButton.disabled = true; rechargeHint.textContent = "Vault above threshold."; }
  else if (rechargeAt) {
    const rechargeDate = new Date(rechargeAt);
    const now = new Date();
    if (now < rechargeDate) { rechargeButton.disabled = true; const hours = Math.ceil((rechargeDate - now) / 3600000); rechargeHint.textContent = `Recharge in ~${hours}h`; }
    else { rechargeButton.disabled = false; rechargeHint.textContent = "Recharge available!"; }
  } else { rechargeButton.disabled = false; rechargeHint.textContent = "Recharge available."; }
}

async function depositToPlay() {
  if (!state.authenticated || state.needsDifficultySelection) return;
  const amount = Number.parseFloat(depositToPlayInput?.value);
  if (isNaN(amount) || amount <= 0) { statusPillEl.textContent = "Enter a valid amount."; return; }
  const tda = state.tda?.total ?? 0;
  const depositCap = state.user?.depositCap;
  if (amount > tda) { statusPillEl.textContent = `Insufficient Vault. You have ${currency(tda)}.`; return; }
  if (depositCap != null && amount > depositCap) { statusPillEl.textContent = `Deposit cap is ${currency(depositCap)}.`; return; }
  try {
    const data = await requestJson("/api/deposit-to-play", { method: "POST", body: JSON.stringify({ amount }) });
    applySnapshot(data);
    if (depositToPlayInput) depositToPlayInput.value = "";
    statusPillEl.textContent = `Moved ${currency(amount)} to Play Balance.`;
  } catch (error) { statusPillEl.textContent = error.message; }
}

async function recharge() {
  if (!state.authenticated) return;
  try {
    const data = await requestJson("/api/recharge", { method: "POST", body: JSON.stringify({}) });
    applySnapshot(data);
    statusPillEl.textContent = data.rechargeResult ? `Vault recharged to ${currency(data.rechargeResult.new_tda)}!` : "Vault recharged!";
  } catch (error) { statusPillEl.textContent = error.message; }
}

// ========================
// CORE FUNCTIONS
// ========================
function renderAuthMode() {
  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.authMode === state.authMode);
  });
  authSubmitEl.textContent = state.authMode === "login" ? "Login" : "Create account";
}

function renderAccount() {
  const isAuth = state.authenticated && state.user;
  guestAuthEl.classList.toggle("is-hidden", isAuth);
  userPanelEl.classList.toggle("is-hidden", !isAuth);
  authTitleEl.textContent = isAuth ? "Account ready" : "Sign in to play";
  if (isAuth) {
    usernameDisplayEl.textContent = state.user.displayName || state.user.username;
    modeDisplayEl.textContent = state.user.classLabel || state.user.difficultyLabel || "Unset";
    topTenDisplayEl.textContent = state.user.isTopTen ? "Unlocked" : "Locked";
    const hasMode = state.user.selectedClass || state.user.difficulty;
    chooseModeButtonEl.textContent = hasMode ? "Change class" : "Select class";
    modeResetHintEl.textContent = hasMode ? "Changing class resets your Vault, play balance, and history." : "Pick a class before you deposit or spin.";
  }
}

function updateControls() {
  const playBalance = state.user?.balance ?? 0;
  const tda = state.tda?.total ?? 0;
  const depositCap = state.user?.depositCap;
  const maxBetPerLine = Math.max(1, Math.floor(playBalance / 3));
  state.bet = clamp(state.bet, 1, maxBetPerLine || 1);
  betValueEl.textContent = state.bet;
  betTextInputEl.value = state.bet;
  betTextInputEl.max = maxBetPerLine || 1;

  balanceEl.textContent = currency(playBalance);
  spinTotalEl.textContent = currency(state.bet * 3);
  difficultyLabelEl.textContent = state.user?.classLabel ?? state.user?.difficultyLabel ?? "Unset";
  if (tdaTotalEl) tdaTotalEl.textContent = currency(tda);
  aOddsEl.textContent = state.user?.aOddsText ?? "Choose mode";
  winRatioEl.textContent = percent(state.user?.hitRate ?? 0);

  if (vaultTdaEl) vaultTdaEl.textContent = currency(tda);
  if (vaultPlayBalanceEl) vaultPlayBalanceEl.textContent = currency(playBalance);
  if (vaultClassEl) vaultClassEl.textContent = state.user?.classLabel ?? "-";

  if (depositToPlayHint) {
    const maxTransfer = depositCap != null ? Math.min(tda, depositCap) : tda;
    const capText = depositCap != null ? ` (cap: ${currency(depositCap)}/transfer)` : " (no cap)";
    depositToPlayHint.textContent = `Max: ${currency(maxTransfer)}${capText}`;
  }
  if (depositToPlayInput) {
    const maxTransfer = depositCap != null ? Math.min(tda, depositCap) : tda;
    depositToPlayInput.max = String(Math.max(0, Math.floor(maxTransfer)));
  }

  updateRechargeUI();

  const canSpin = state.authenticated && !state.needsDifficultySelection && !state.isSpinning && !state.autoSpin.enabled && playBalance >= state.bet * 3;
  spinButton.disabled = !canSpin;
  depositButton.disabled = !state.authenticated || state.needsDifficultySelection;
  depositInput.disabled = !state.authenticated || state.needsDifficultySelection;
  betTextInputEl.disabled = !state.authenticated || state.needsDifficultySelection;
  if (depositToPlayButton) depositToPlayButton.disabled = !state.authenticated || state.needsDifficultySelection || tda <= 0;
  updateEasyCapWarning();
}

function renderResult(data) {
  lastWinEl.textContent = currency(data.lastWin ?? 0);
  lastNetEl.textContent = currency(data.lastNet ?? 0);
  winningLinesEl.textContent = data.winningLines?.length ? data.winningLines.join(", ") : "-";
  statusPillEl.textContent = data.status;
}

function renderDifficultyChooser() {
  difficultyGridEl.innerHTML = "";
  const shouldShow = state.authenticated && (state.needsDifficultySelection || state.modeChooserOpen);
  difficultyModalEl.classList.toggle("is-hidden", !shouldShow);
  difficultyCloseButtonEl.classList.toggle("is-hidden", state.needsDifficultySelection);
  if (!shouldShow) return;

  const currentMode = state.user?.selectedClass || state.user?.difficulty || "";
  const currentModeLabel = state.user?.classLabel || state.user?.difficultyLabel || "Unset";
  const isChanging = Boolean(currentMode);
  difficultyEyebrowEl.textContent = isChanging ? "Switch class" : "Choose your class";
  difficultyTitleEl.textContent = isChanging ? "Change your class" : "Pick your class";
  difficultyCopyEl.textContent = isChanging ? `Current: ${currentModeLabel}. Switching resets everything.` : "Each class has different odds, deposit caps, and risk/reward profiles.";

  for (const option of state.difficultyOptions) {
    const card = document.createElement("button");
    card.type = "button";
    const isActive = currentMode === option.id;
    card.className = `difficulty-option ${isActive ? "is-active" : ""}`;
    const multiText = option.profitMultiplier > 1.0 ? `+${((option.profitMultiplier - 1.0) * 100).toFixed(0)}% profit` : "1:1 profit";
    const protectText = option.bankruptcyProtection ? "Protected" : "Game Over at R0";
    const capText = option.depositCap != null ? `Cap: ${currency(option.depositCap)}` : "No cap";
    card.innerHTML = `<strong>${option.name}</strong><span>Start: ${currency(option.startingTda)}</span><small>${multiText} · ${protectText}</small><small>${capText}</small>${isActive ? '<small class="is-active-label">Current</small>' : ''}`;
    card.addEventListener("click", async () => {
      if (isActive) { state.modeChooserOpen = false; renderDifficultyChooser(); statusPillEl.textContent = `${option.name} is active.`; return; }
      if (currentMode && !window.confirm(`Switch to ${option.name}? This resets everything.`)) return;
      try {
        const payload = await requestJson("/api/select-class", { method: "POST", body: JSON.stringify({ class: option.id }) });
        state.modeChooserOpen = false;
        applySnapshot(payload);
        resetSessionStats();
      } catch (error) { statusPillEl.textContent = error.message; }
    });
    difficultyGridEl.appendChild(card);
  }
}

function applySnapshot(data) {
  state.authenticated = data.authenticated;
  state.user = data.user;
  state.tda = data.tda || null;
  state.difficultyOptions = data.classOptions || data.difficultyOptions || [];
  state.needsDifficultySelection = data.needsDifficultySelection;
  if (!state.needsDifficultySelection) state.modeChooserOpen = false;
  renderResult(data);
  paintFinalGrid(data.lastSpin, data.winningLines);
  renderAccount();
  renderDifficultyChooser();
  updateControls();
  updateEasyCapWarning();
}

async function refreshState() {
  const data = await requestJson("/api/state");
  applySnapshot(data);
  resetSessionStats();
}

async function deposit() {
  const amount = Number.parseFloat(depositInput.value);
  try {
    const data = await requestJson("/api/deposit", { method: "POST", body: JSON.stringify({ amount }) });
    applySnapshot(data);
    depositInput.value = "";
  } catch (error) { statusPillEl.textContent = error.message; }
}

async function spin() {
  if (state.isSpinning || !state.authenticated || state.needsDifficultySelection || state.autoSpin.enabled) return;
  statusPillEl.textContent = "Spinning reels...";
  try {
    const data = await requestJson("/api/spin", { method: "POST", body: JSON.stringify({ bet: state.bet }) });
    state.authenticated = data.authenticated;
    state.user = data.user;
    state.difficultyOptions = data.classOptions || data.difficultyOptions || [];
    state.needsDifficultySelection = data.needsDifficultySelection;
    renderResult(data);
    renderAccount();
    renderDifficultyChooser();
    updateSessionStats(data);
    updateControls();
    animateSpin(data.lastSpin, data.winningLines || []);
  } catch (error) { statusPillEl.textContent = error.message; }
}

async function submitAuth(event) {
  event.preventDefault();
  try {
    const payload = await requestJson(`/api/${state.authMode}`, { method: "POST", body: JSON.stringify({ username: usernameInputEl.value.trim(), password: passwordInputEl.value }) });
    usernameInputEl.value = "";
    passwordInputEl.value = "";
    applySnapshot(payload);
    resetSessionStats();
  } catch (error) { statusPillEl.textContent = error.message; }
}

async function logout() {
  try {
    await requestJson("/api/logout", { method: "POST", body: JSON.stringify({}) });
    state.modeChooserOpen = false;
    stopAutoSpin();
    await refreshState();
    resetSessionStats();
  } catch (error) { statusPillEl.textContent = error.message; }
}

function openModeChooser() {
  if (!state.authenticated) { statusPillEl.textContent = "Sign in first."; return; }
  state.modeChooserOpen = true;
  renderDifficultyChooser();
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin", ...options,
  });
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const looksJson = contentType.includes("application/json") || rawText.trim().startsWith("{") || rawText.trim().startsWith("[");
  let payload = null;
  if (rawText && looksJson) { try { payload = JSON.parse(rawText); } catch { payload = null; } }
  if (!response.ok) {
    const apiError = payload && typeof payload === "object" ? payload.error : null;
    const fallback = rawText?.trim() ? `Request failed (${response.status}). ${rawText.trim().slice(0, 180)}` : `Request failed (${response.status}).`;
    throw new Error(apiError || fallback);
  }
  if (payload === null) throw new Error("Server returned invalid response.");
  return payload;
}

// ========================
// EVENT LISTENERS
// ========================
document.querySelectorAll("[data-auth-mode]").forEach(button => {
  button.addEventListener("click", () => { state.authMode = button.dataset.authMode; renderAuthMode(); });
});

document.querySelectorAll("[data-adjust]").forEach(button => {
  button.addEventListener("click", () => {
    const delta = Number.parseInt(button.dataset.delta, 10);
    state.bet = Math.max(1, state.bet + delta);
    betTextInputEl.value = state.bet;
    updateControls();
  });
});

betTextInputEl.addEventListener("input", e => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v > 0) { state.bet = v; updateControls(); } });
betTextInputEl.addEventListener("blur", e => { const v = clamp(parseInt(e.target.value, 10) || 1, 1, parseInt(e.target.max, 10) || 1); state.bet = v; e.target.value = v; updateControls(); });
betTextInputEl.addEventListener("keydown", e => { if (e.key === "Enter") { e.target.blur(); spinButton.focus(); } });
turboToggleEl.addEventListener("click", toggleTurboMode);

document.querySelectorAll(".auto-spin-count").forEach(btn => {
  btn.addEventListener("click", () => selectAutoSpinCount(parseInt(btn.dataset.spins, 10)));
});
autoSpinStartEl.addEventListener("click", startAutoSpin);
autoSpinStopEl.addEventListener("click", stopAutoSpin);

window.addEventListener("themechange", e => console.log("Theme:", e.detail.theme));
authFormEl.addEventListener("submit", submitAuth);
logoutButtonEl.addEventListener("click", logout);
chooseModeButtonEl.addEventListener("click", openModeChooser);
depositButton.addEventListener("click", deposit);
spinButton.addEventListener("click", spin);
if (depositToPlayButton) depositToPlayButton.addEventListener("click", depositToPlay);
if (rechargeButton) rechargeButton.addEventListener("click", recharge);

difficultyCloseButtonEl.addEventListener("click", () => { state.modeChooserOpen = false; renderDifficultyChooser(); });
difficultyModalEl.addEventListener("click", event => {
  if (event.target !== difficultyModalEl || state.needsDifficultySelection) return;
  state.modeChooserOpen = false;
  renderDifficultyChooser();
});

// Initialize
createReels();
renderAuthMode();
refreshState().catch(error => { statusPillEl.textContent = error.message; });
selectAutoSpinCount(10);
