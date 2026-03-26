(function () {
  const storageKey = "pixel-slot-theme";
  const body = document.body;
  const topbarLinks = document.querySelector(".topbar__links");

  function applyTheme(theme) {
    body.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    }
  }

  function ensureToggle() {
    if (!topbarLinks || document.querySelector("[data-theme-toggle]")) {
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "topbar__link theme-toggle";
    button.dataset.themeToggle = "true";
    button.addEventListener("click", () => {
      applyTheme(body.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
    topbarLinks.appendChild(button);
  }

  ensureToggle();
  applyTheme(localStorage.getItem(storageKey) || "light");
})();
