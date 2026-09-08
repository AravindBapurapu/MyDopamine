export const THEME_STORAGE_KEY = "mydopamine_theme";
export const THEME_PRESET_KEY = "mydopamine_theme_preset";

const PRESET_STYLES = {
  aurora: { primary: "#8b5cf6", secondary: "#22d3ee", accent: "#c084fc", glow: "rgba(34, 211, 238, 0.22)" },
  sunset: { primary: "#f97316", secondary: "#fb7185", accent: "#fbbf24", glow: "rgba(251, 146, 60, 0.24)" },
  forest: { primary: "#10b981", secondary: "#2dd4bf", accent: "#34d399", glow: "rgba(16, 185, 129, 0.2)" },
  midnight: { primary: "#6366f1", secondary: "#38bdf8", accent: "#a78bfa", glow: "rgba(99, 102, 241, 0.2)" },
};

export function getStoredTheme() {
  return "dark";
}

export function getStoredThemePreset() {
  if (typeof window === "undefined") return "aurora";
  const saved = localStorage.getItem(THEME_PRESET_KEY);
  return PRESET_STYLES[saved] ? saved : "aurora";
}

export function applyTheme(theme, preset = getStoredThemePreset()) {
  const nextTheme = "dark";
  const nextPreset = PRESET_STYLES[preset] ? preset : "aurora";
  const style = PRESET_STYLES[nextPreset];
  const root = document.documentElement;

  root.dataset.theme = nextTheme;
  root.dataset.themePreset = nextPreset;
  root.classList.remove("light");
  root.classList.add("dark");
  root.style.colorScheme = nextTheme;

  root.style.setProperty("--primary", style.primary);
  root.style.setProperty("--secondary", style.secondary);
  root.style.setProperty("--accent", style.accent);
  root.style.setProperty("--glow", style.glow);

  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  localStorage.setItem(THEME_PRESET_KEY, nextPreset);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("themechange", {
      detail: { theme: nextTheme, preset: nextPreset },
    }));
  }
}
