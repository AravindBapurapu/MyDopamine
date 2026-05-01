// src/components/HabitControls.jsx
import { useContext, useState } from "react";
import { HabitContext } from "../context/HabitContext";
import { Plus, CalendarDays, Settings as SettingsIcon, Brain } from "lucide-react";
import { MONTH_THEMES } from "../utils/aiInsights";

export default function HabitControls({ showAI, setShowAI, setShowSettings }) {
  const {
    addHabit, selectedMonth, selectedYear,
    monthNames, setMonth, setYear, createFreshMonth,
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
      className="rounded-3xl border shadow-sm p-5"
      style={{ backgroundColor: theme.bg, borderColor: theme.primary + "30" }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {selectedMonth} {selectedYear}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white/80 dark:bg-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 outline-none focus:border-violet-400"
          >
            {monthNames.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-2xl border border-slate-300 bg-white/80 dark:bg-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 outline-none"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            onClick={createFreshMonth}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: theme.primary }}
          >
            <CalendarDays size={18} />
            <span className="hidden sm:inline">New Month</span>
          </button>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>

          <button
            onClick={() => setShowAI(!showAI)}
            title="Toggle AI Insights"
            className={`p-2 rounded-2xl transition shadow-sm ${showAI ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400' : 'bg-white/80 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
          >
            <Brain size={18} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="p-2 rounded-2xl bg-white/80 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition shadow-sm"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* ✅ Enter key enabled input */}
      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a new habit and press Enter..."
          className="flex-1 rounded-2xl border border-slate-300 bg-white/80 dark:bg-slate-700 dark:text-slate-200 px-4 py-3 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-white hover:bg-emerald-600 transition font-semibold shadow-sm"
        >
          <Plus size={18} />
          Add Habit
        </button>
      </div>
    </div>
  );
}