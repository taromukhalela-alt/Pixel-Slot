const statusEl = document.getElementById("store-status");
const ppBalanceEl = document.getElementById("pp-balance");
const ppTotalEl = document.getElementById("pp-total");
const boostersGridEl = document.getElementById("boosters-grid");
const themesGridEl = document.getElementById("themes-grid");

const state = {
  items: [],
  userPP: 0,
  totalPP: 0,
};

function requestJson(url, options = {}) {
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "same-origin",
    ...options,
  }).then(async (response) => {
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Something went wrong.");
    }
    return payload;
  });
}

function createBoosterCard(item, owned) {
  const card = document.createElement("article");
  card.className = "store-card store-card--booster";
  const canAfford = state.userPP >= item.pp_cost;
  
  card.innerHTML = `
    <div class="store-card__icon store-card__icon--booster">
      <span>${getBoosterIcon(item.id)}</span>
    </div>
    <div class="store-card__content">
      <strong>${item.name}</strong>
      <p>${item.description}</p>
      <div class="store-card__meta">
        <span class="pp-cost">◆ ${item.pp_cost} PP</span>
        ${item.sacrifice > 0 ? `<span class="sacrifice-cost">⧖ R${item.sacrifice.toLocaleString()}</span>` : ""}
      </div>
      ${owned > 0 ? `<small class="owned-badge">Owned: ${owned}</small>` : ""}
    </div>
    <button 
      class="button button--primary store-card__button" 
      type="button"
      ${!canAfford ? "disabled" : ""}
      data-item-id="${item.id}"
      data-item-type="booster"
    >
      ${canAfford ? "Purchase" : "Not enough PP"}
    </button>
  `;
  
  return card;
}

function createThemeCard(item, owned) {
  const card = document.createElement("article");
  card.className = `store-card store-card--theme store-card--${item.rarity}`;
  const canAfford = state.userPP >= item.pp_cost;
  
  card.innerHTML = `
    <div class="store-card__badge store-card__badge--${item.rarity}">${item.rarity}</div>
    <div class="store-card__preview store-card__preview--${item.id}">
      <span>${getThemeIcon(item.id)}</span>
    </div>
    <div class="store-card__content">
      <strong>${item.name}</strong>
      <div class="store-card__meta">
        <span class="pp-cost">◆ ${item.pp_cost} PP</span>
        ${item.sacrifice > 0 ? `<span class="sacrifice-cost">⧖ R${item.sacrifice.toLocaleString()}</span>` : ""}
      </div>
      ${owned ? `<small class="owned-badge">Owned</small>` : ""}
    </div>
    <button 
      class="button button--primary store-card__button" 
      type="button"
      ${!canAfford || owned ? "disabled" : ""}
      data-item-id="${item.id}"
      data-item-type="theme"
    >
      ${owned ? "Owned" : canAfford ? "Purchase" : "Not enough PP"}
    </button>
  `;
  
  return card;
}

function getBoosterIcon(id) {
  const icons = {
    shield_basic: "🛡",
    shield_advanced: "🔰",
    magnet_small: "🧲",
    magnet_large: "⚡",
    streak_preserver: "💫",
  };
  return icons[id] || "✨";
}

function getThemeIcon(id) {
  const icons = {
    cyber_neon: "🌃",
    crystal_ice: "❄",
    phoenix_fire: "🔥",
    void_shadow: "🌑",
    galaxy_dust: "✨",
    golden_age: "👑",
  };
  return icons[id] || "🎨";
}

function renderStore() {
  boostersGridEl.innerHTML = "";
  themesGridEl.innerHTML = "";
  
  const boosters = state.items.filter(item => item.type === "booster");
  const themes = state.items.filter(item => item.type === "theme");
  
  for (const item of boosters) {
    const owned = state.inventory?.boosters?.[item.id] || 0;
    boostersGridEl.appendChild(createBoosterCard(item, owned));
  }
  
  for (const item of themes) {
    const owned = state.inventory?.themes?.includes(item.id) || false;
    themesGridEl.appendChild(createThemeCard(item, owned));
  }
  
  // Add click handlers to purchase buttons
  document.querySelectorAll(".store-card__button").forEach(button => {
    button.addEventListener("click", async () => {
      const itemId = button.dataset.itemId;
      const itemType = button.dataset.itemType;
      await purchaseItem(itemId, itemType, button);
    });
  });
}

async function purchaseItem(itemId, itemType, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Processing...";
  
  try {
    const result = await requestJson("/api/store/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId, itemType }),
    });
    
    state.userPP = result.remaining_pp;
    ppBalanceEl.textContent = state.userPP.toFixed(1);
    statusEl.textContent = `Purchased ${result.item.name}!`;
    
    // Refresh store data
    await loadStore();
  } catch (error) {
    statusEl.textContent = error.message;
    button.textContent = originalText;
    button.disabled = false;
  }
}

async function loadPP() {
  try {
    const data = await requestJson("/api/pp");
    state.userPP = data.prestigePoints;
    state.totalPP = data.totalPP;
    ppBalanceEl.textContent = data.prestigePoints.toFixed(1);
    ppTotalEl.textContent = `${data.totalPP.toFixed(1)} PP`;
  } catch (error) {
    console.error("Failed to load PP:", error);
  }
}

async function loadInventory() {
  try {
    const data = await requestJson("/api/inventory");
    state.inventory = data.inventory;
  } catch (error) {
    console.error("Failed to load inventory:", error);
    state.inventory = {};
  }
}

async function loadStore() {
  statusEl.textContent = "Loading store...";
  try {
    const data = await requestJson("/api/store");
    state.items = data.items;
    await loadInventory();
    renderStore();
    statusEl.textContent = "Store loaded.";
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

async function init() {
  await loadPP();
  await loadStore();
}

init();
