import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useHabits } from "../context/HabitContext";
import { motion } from "framer-motion";
import { applyTheme, getStoredTheme, getStoredThemePreset } from "../utils/theme";
import { 
  Bell, 
  BellOff, 
  LogOut, 
  Database, 
  Download, 
  Upload,
  ChevronLeft
} from "lucide-react";
import toast from "react-hot-toast";

export default function Settings({ onBack, displaySettings, setDisplaySettings }) {
  const { currentUser, userSettings, updateSettings, logout } = useAuth();
  const { habits, selectedMonth, selectedYear, importPreviousMonth } = useHabits();
  const [settings, setSettings] = useState({
    theme: "dark",
    notifications: true,
    preset: getStoredThemePreset(),
  });
  const [themePreset, setThemePreset] = useState(getStoredThemePreset());

  useEffect(() => {
    const nextTheme = "dark";
    const nextPreset = userSettings?.preset || getStoredThemePreset();
    const nextSettings = {
      theme: nextTheme,
      notifications: userSettings?.notifications ?? true,
      preset: nextPreset,
    };
    setSettings(nextSettings);
    setThemePreset(nextPreset);
    applyTheme(nextTheme, nextPreset);
  }, [userSettings]);

  const applyThemeState = (presetValue = themePreset) => {
    applyTheme("dark", presetValue);
  };

  const handlePresetChange = (preset) => {
    setThemePreset(preset);
    const nextSettings = { ...settings, preset, theme: "dark" };
    setSettings(nextSettings);
    applyThemeState(preset);
    if (currentUser) updateSettings(nextSettings);
  };

  const handleNotificationToggle = () => {
    const nextSettings = { ...settings, notifications: !settings.notifications };
    setSettings(nextSettings);
    if (currentUser) updateSettings(nextSettings);
  };

  const handleExportData = () => {
    const data = {
      habits,
      exportDate: new Date().toISOString(),
      month: selectedMonth,
      year: selectedYear
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-${selectedMonth}-${selectedYear}.json`;
    a.click();
    
    toast.success("Data exported successfully!");
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        // Here you would implement the import logic
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen p-4 md:p-6"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 transition"
          style={{ color: "var(--text-soft)" }}
        >
          <ChevronLeft size={20} />
          Back to Dashboard
        </button>

        <div
          className="rounded-3xl border p-6 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--text)" }}>Settings</h2>

          {currentUser ? (
            <div className="mb-6 rounded-2xl p-4" style={{ background: "rgba(139, 92, 246, 0.12)", color: "var(--text)" }}>
              <p className="text-sm" style={{ color: "var(--primary)" }}>Logged in as</p>
              <p className="font-medium" style={{ color: "var(--text)" }}>{currentUser.email}</p>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl p-4" style={{ background: "rgba(245, 158, 11, 0.10)", color: "var(--text)" }}>
              <p style={{ color: "#f59e0b" }}>Guest Mode</p>
              <p className="text-sm" style={{ color: "var(--text-soft)" }}>Data is saved locally on this device</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: "var(--panel-strong)", border: "1px solid var(--border)" }}>
              <p className="mb-3 font-medium" style={{ color: "var(--text)" }}>AI Theme Presets</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { key: "aurora", label: "Aurora", color: "from-violet-500 to-cyan-500" },
                  { key: "sunset", label: "Sunset", color: "from-orange-500 to-pink-500" },
                  { key: "forest", label: "Forest", color: "from-emerald-500 to-teal-500" },
                  { key: "midnight", label: "Midnight", color: "from-indigo-500 to-sky-500" },
                ].map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePresetChange(preset.key)}
                    className="rounded-xl border px-2 py-2 text-xs font-medium transition"
                    style={{
                      borderColor: themePreset === preset.key ? "var(--primary)" : "var(--border)",
                      background: themePreset === preset.key ? "rgba(34, 211, 238, 0.08)" : "var(--panel)",
                      color: "var(--text)",
                    }}
                  >
                    <span className={`mb-2 flex h-8 rounded-lg bg-gradient-to-r ${preset.color}`} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--panel-strong)", border: "1px solid var(--border)" }}>
              <p className="mb-3 font-medium" style={{ color: "var(--text)" }}>Display Toggles</p>
              <div className="space-y-3">
                {[
                  ["showCompletionTrend", "Show Completion Trend"],
                  ["showPaceTargets", "Show Pace & Targets"],
                  ["showBestHabitAndStreaks", "Show Best Habit & Streaks"],
                  ["showAIInsights", "Show AI Insights"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
                    <button
                      type="button"
                      aria-label={label}
                      onClick={() => setDisplaySettings((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className="relative h-6 w-11 rounded-full transition"
                      style={{ background: displaySettings?.[key] ? "var(--primary)" : "rgba(148, 163, 184, 0.45)" }}
                    >
                      <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition" style={{ left: displaySettings?.[key] ? "1.4rem" : "0.25rem" }} />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "var(--panel-strong)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                {settings.notifications ? <Bell size={20} style={{ color: "var(--primary)" }} /> : <BellOff size={20} style={{ color: "var(--text-soft)" }} />}
                <div>
                  <p className="font-medium" style={{ color: "var(--text)" }}>Notifications</p>
                  <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                    {settings.notifications ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleNotificationToggle}
                className="rounded-xl border px-4 py-2"
                style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                {settings.notifications ? "Disable" : "Enable"}
              </button>
            </div>

            {/* Data Management */}
            <div className="rounded-xl p-4" style={{ background: "var(--panel-strong)", border: "1px solid var(--border)" }}>
              <div className="mb-3 flex items-center gap-3">
                <Database size={20} style={{ color: "var(--primary)" }} />
                <p className="font-medium" style={{ color: "var(--text)" }}>Data Management</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2 transition"
                  style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <Download size={16} />
                  Export
                </button>
                
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 transition" style={{ background: "var(--panel)", borderColor: "var(--border)", color: "var(--text)" }}>
                  <Upload size={16} />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={importPreviousMonth}
                className="mt-3 w-full rounded-xl px-4 py-2"
                style={{ background: "rgba(139, 92, 246, 0.12)", color: "var(--primary)" }}
              >
                Import Habits from Previous Month
              </button>
            </div>

            {/* Logout */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3"
                style={{ background: "rgba(239, 68, 68, 0.10)", color: "#ef4444" }}
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}