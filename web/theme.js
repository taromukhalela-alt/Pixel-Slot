(function () {
  const storageKey = "pixel-slot-theme";
  const body = document.body;
  const topbarLinks = document.querySelector(".topbar__links");

  const THEMES = {
    "dark-glass": { name: "Dark Glass", category: "Default", icon: "💎", accent: "#6366f1" },
    synthwave: { name: "Synthwave", category: "Retro/Synth", icon: "🌆", accent: "#ff00ff" },
    synthwave90s: { name: "Synthwave 90s", category: "Retro/Synth", icon: "🌃", accent: "#ff6600" },
    gruvbox: { name: "Gruvbox", category: "Developer", icon: "🐻", accent: "#fabd2f" },
    "tokyo-night": { name: "Tokyo Night", category: "Developer", icon: "🌃", accent: "#7aa2f7" },
    "catppuccin-frappe": { name: "Catppuccin Frappé", category: "Developer", icon: "🐱", accent: "#8caaee" },
    "catppuccin-latte": { name: "Catppuccin Latte", category: "Developer", icon: "☕", accent: "#7287fd" },
    "off-white": { name: "Off-White", category: "Clean/Modern", icon: "⬜", accent: "#0066ff" },
    oneui: { name: "One UI", category: "Clean/Modern", icon: "📱", accent: "#3b82f6" },
    "apple-glass": { name: "Apple Glass", category: "Clean/Modern", icon: "🍎", accent: "#0071e3" },
    apple: { name: "Apple (Legacy)", category: "Legacy", icon: "🍎", accent: "#1a73e8" },
    dark: { name: "Dark (Legacy)", category: "Legacy", icon: "🌙", accent: "#6c8dff" },
    light: { name: "Light", category: "Legacy", icon: "☀️", accent: "#1a73e8" },
  };

  function applyTheme(theme) {
    const validTheme = THEMES[theme] ? theme : "dark-glass";
    body.setAttribute("data-theme", validTheme);
    localStorage.setItem(storageKey, validTheme);
    updateThemeSelectorValue(validTheme);
    dispatchThemeChangeEvent(validTheme);
  }

  function updateThemeSelectorValue(theme) {
    const selector = document.getElementById("theme-selector");
    if (selector) selector.value = theme;
  }

  function dispatchThemeChangeEvent(theme) {
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  function createThemeSelector() {
    const container = document.createElement("div");
    container.className = "theme-selector-container";
    const groups = {};
    for (const [id, t] of Object.entries(THEMES)) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push({ id, ...t });
    }
    let html = '<select id="theme-selector" class="theme-selector" aria-label="Select theme">';
    for (const [cat, themes] of Object.entries(groups)) {
      html += `<optgroup label="${cat}">`;
      for (const t of themes) html += `<option value="${t.id}">${t.icon} ${t.name}</option>`;
      html += '</optgroup>';
    }
    html += '</select>';
    container.innerHTML = html;
    container.querySelector("select").addEventListener("change", e => applyTheme(e.target.value));
    return container;
  }

  function ensureToggle() {
    if (!topbarLinks) return;
    if (document.querySelector(".theme-selector-container")) return;
    topbarLinks.appendChild(createThemeSelector());
    const currentTheme = localStorage.getItem(storageKey) || "dark-glass";
    updateThemeSelectorValue(currentTheme);
  }

  function init() {
    ensureToggle();
    const savedTheme = localStorage.getItem(storageKey) || "dark-glass";
    applyTheme(savedTheme);
  }

  window.themeEngine = {
    applyTheme,
    getThemes: () => ({ ...THEMES }),
    getCurrentTheme: () => body.getAttribute("data-theme") || "dark-glass",
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
