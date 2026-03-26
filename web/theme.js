(function () {
  const storageKey = "pixel-slot-theme";
  const body = document.body;
  const topbarLinks = document.querySelector(".topbar__links");

  // Available themes with metadata
  const THEMES = {
    // Retro/Synth
    synthwave: { name: "Synthwave", category: "Retro/Synth", icon: "🌆", accent: "#ff00ff" },
    synthwave90s: { name: "Synthwave 90s", category: "Retro/Synth", icon: "🌃", accent: "#ff6600" },
    // Developer Favorites
    gruvbox: { name: "Gruvbox", category: "Developer", icon: "🐻", accent: "#fabd2f" },
    "tokyo-night": { name: "Tokyo Night", category: "Developer", icon: "🌃", accent: "#7aa2f7" },
    "catppuccin-frappe": { name: "Catppuccin Frappé", category: "Developer", icon: "🐱", accent: "#8caaee" },
    "catppuccin-latte": { name: "Catppuccin Latte", category: "Developer", icon: "☕", accent: "#7287fd" },
    // Clean/Modern
    "off-white": { name: "Off-White", category: "Clean/Modern", icon: "⬜", accent: "#0066ff" },
    oneui: { name: "One UI", category: "Clean/Modern", icon: "📱", accent: "#3b82f6" },
    "apple-glass": { name: "Apple Glass", category: "Clean/Modern", icon: "🍎", accent: "#0071e3" },
    // Legacy
    apple: { name: "Apple (Default)", category: "Legacy", icon: "🍎", accent: "#1a73e8" },
    dark: { name: "Dark", category: "Legacy", icon: "🌙", accent: "#6c8dff" },
    light: { name: "Light", category: "Legacy", icon: "☀️", accent: "#1a73e8" },
  };

  function applyTheme(theme) {
    const validTheme = THEMES[theme] ? theme : "apple";
    body.setAttribute("data-theme", validTheme);
    localStorage.setItem(storageKey, validTheme);
    updateThemeToggleText(validTheme);
    updateThemeSelectorValue(validTheme);
    dispatchThemeChangeEvent(validTheme);
  }

  function updateThemeToggleText(theme) {
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.textContent = "🎨";
      toggle.title = "Change Theme";
    }
  }

  function updateThemeSelectorValue(theme) {
    const selector = document.getElementById("theme-selector");
    if (selector) {
      selector.value = theme;
    }
  }

  function dispatchThemeChangeEvent(theme) {
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  function createThemeSelector() {
    const container = document.createElement("div");
    container.className = "theme-selector-container";
    container.innerHTML = `
      <select id="theme-selector" class="theme-selector" aria-label="Select theme">
        <optgroup label="Retro/Synth">
          <option value="synthwave">🌆 Synthwave</option>
          <option value="synthwave90s">🌃 Synthwave 90s</option>
        </optgroup>
        <optgroup label="Developer Favorites">
          <option value="gruvbox">🐻 Gruvbox</option>
          <option value="tokyo-night">🌃 Tokyo Night</option>
          <option value="catppuccin-frappe">🐱 Catppuccin Frappé</option>
          <option value="catppuccin-latte">☕ Catppuccin Latte</option>
        </optgroup>
        <optgroup label="Clean/Modern">
          <option value="off-white">⬜ Off-White</option>
          <option value="oneui">📱 One UI</option>
          <option value="apple-glass">🍎 Apple Glass</option>
        </optgroup>
        <optgroup label="Legacy">
          <option value="apple">🍎 Apple (Default)</option>
          <option value="dark">🌙 Dark</option>
          <option value="light">☀️ Light</option>
        </optgroup>
      </select>
    `;

    const selector = container.querySelector("select");
    selector.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });

    return container;
  }

  function ensureToggle() {
    if (!topbarLinks) return;

    // Check if theme selector already exists
    if (document.querySelector(".theme-selector-container")) return;

    const selector = createThemeSelector();
    topbarLinks.appendChild(selector);

    // Update selector value if theme is already set
    const currentTheme = localStorage.getItem(storageKey) || "apple";
    updateThemeSelectorValue(currentTheme);
  }

  function init() {
    ensureToggle();
    const savedTheme = localStorage.getItem(storageKey) || "apple";
    applyTheme(savedTheme);
  }

  // Expose theme API globally
  window.themeEngine = {
    applyTheme,
    getThemes: () => ({ ...THEMES }),
    getCurrentTheme: () => body.getAttribute("data-theme") || "apple",
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
