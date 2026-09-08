// src/components/HabitControls.jsx
import { useContext, useState } from "react";
import { HabitContext } from "../context/HabitContext";
import { Plus, CalendarDays, Settings as SettingsIcon, Brain, Copy } from "lucide-react";
import { MONTH_THEMES } from "../utils/aiInsights";

export default function HabitControls({ showAI, setShowAI, setShowSettings }) {
  const {
    addHabit, selectedMonth, selectedYear,
    monthNames, setMonth, setYear, createFreshMonth, cloneHabitsToNextMonth,
  } = useContext(HabitContext);

  const [habitName, setHabitName] = useState("");
  const theme = MONTH_THEMES[selectedMonth] || MONTH_THEMES["January"];

  const handleAdd = () => {
    if (!habitName.trim()) return;
    addHabit(habitName);
    setHabitName("");
  };

  // ✅ Enter key support
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  return (
    <div
      className="rounded-[28px] border p-5 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-6"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.04), var(--panel))`,
        borderColor: "var(--border)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 18px 45px rgba(0,0,0,0.18), 0 0 28px var(--glow)`,
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--text-soft)" }}>AI Command</p>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            {selectedMonth} {selectedYear}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-2xl border px-4 py-2 text-sm shadow-sm outline-none backdrop-blur-md transition"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            {monthNames.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-2xl border px-4 py-2 text-sm shadow-sm outline-none backdrop-blur-md transition"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            onClick={createFreshMonth}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-sm transition hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#f8fafc", boxShadow: `0 0 18px var(--glow)` }}
          >
            <CalendarDays size={18} />
            <span className="hidden sm:inline">New Month</span>
          </button>

          <button
            onClick={cloneHabitsToNextMonth}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 shadow-sm transition"
            style={{ borderColor: "var(--border)", background: "rgba(34, 211, 238, 0.08)", color: "var(--text)" }}
          >
            <Copy size={18} />
            <span className="hidden sm:inline">Copy to Next Month</span>
          </button>

          <div className="mx-1 hidden h-6 w-px sm:block" style={{ background: "var(--border)" }} />

          <button
            onClick={() => setShowAI(!showAI)}
            title="Toggle AI Insights"
            className="rounded-2xl p-2 shadow-sm transition"
            style={{
              background: showAI ? "rgba(139, 92, 246, 0.16)" : "rgba(255,255,255,0.02)",
              color: showAI ? "var(--primary)" : "var(--text-soft)",
              border: "1px solid var(--border)",
              boxShadow: showAI ? `0 0 18px var(--glow)` : "none",
            }}
          >
            <Brain size={18} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="rounded-2xl p-2 shadow-sm transition"
            style={{ background: "rgba(255,255,255,0.02)", color: "var(--text-soft)", border: "1px solid var(--border)", boxShadow: `0 0 12px var(--glow)` }}
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a new habit and press Enter..."
          className="flex-1 rounded-2xl border px-4 py-3 text-sm shadow-sm outline-none backdrop-blur-md transition"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.04), var(--glow))`,
            borderColor: "var(--border)",
            color: "var(--text)",
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.02), 0 0 18px var(--glow)`,
          }}
        />
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(16,185,129,0.3)] transition hover:scale-[1.02]"
        >
          <Plus size={18} />
          Add Habit
        </button>
      </div>
    </div>
  );
}