// src/components/TargetsPanel.jsx
import { useContext, useState } from "react";
import { HabitContext } from "../context/HabitContext";
import { motion } from "framer-motion";
import { Target, Edit3, Check, X } from "lucide-react";

const DEFAULT_TARGETS = { daily: 80, weekly: 70, monthly: 65 };

export default function TargetsPanel() {
  const { overallStats, weeklyReport, monthMeta, habits } = useContext(HabitContext);
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  // ── Compute actuals ──────────────────────────────────────────────────────
  // Today's completion
  const today = new Date().toISOString().split("T")[0];
  const todayDone = habits.filter((h) => h.progress?.[today]?.completed).length;
  const todayPct = habits.length ? Math.round((todayDone / habits.length) * 100) : 0;

  // This week's completion (last week from weeklyReport)
  const thisWeekPct =
    weeklyReport.length
      ? weeklyReport[weeklyReport.length - 1].percent
      : 0;

  // Monthly completion
  const monthlyPct = overallStats.percent;

  const panels = [
    {
      key: "daily",
      label: "Daily Target",
      period: "Today",
      actual: todayPct,
      done: todayDone,
      total: habits.length,
      color: "#8b5cf6",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "border-violet-100 dark:border-violet-800/30",
    },
    {
      key: "weekly",
      label: "Weekly Target",
      period: "This Week",
      actual: thisWeekPct,
      done: weeklyReport[weeklyReport.length - 1]?.done || 0,
      total: weeklyReport[weeklyReport.length - 1]?.total || 0,
      color: "#06b6d4",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      border: "border-cyan-100 dark:border-cyan-800/30",
    },
    {
      key: "monthly",
      label: "Monthly Target",
      period: "This Month",
      actual: monthlyPct,
      done: overallStats.totalDone,
      total: overallStats.totalPossible,
      color: "#22c55e",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800/30",
    },
  ];

  const startEdit = (key, val) => {
    setEditing(key);
    setEditVal(String(val));
  };

  const saveEdit = () => {
    const v = Math.max(0, Math.min(100, Number(editVal)));
    setTargets((p) => ({ ...p, [editing]: v }));
    setEditing(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
          <Target size={18} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress vs Targets</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Performance Goals</p>
        </div>
        <p className="ml-auto text-[10px] text-slate-400">Click pencil to edit targets</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {panels.map(({ key, label, period, actual, done, total, color, bg, border }, i) => {
          const target = targets[key];
          const met = actual >= target;
          const gap = target - actual;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`${bg} border ${border} rounded-xl p-4`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-[10px] text-slate-400">{period}</p>
                </div>
                {editing === key ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      className="w-12 text-xs rounded-lg border border-slate-300 px-2 py-1 outline-none"
                      min={0} max={100}
                    />
                    <span className="text-xs text-slate-400">%</span>
                    <button onClick={saveEdit} className="p-1 rounded-lg bg-emerald-500 text-white">
                      <Check size={11} />
                    </button>
                    <button onClick={() => setEditing(null)} className="p-1 rounded-lg bg-slate-200 text-slate-600">
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(key, target)}
                    className="p-1.5 rounded-lg hover:bg-white/70 dark:hover:bg-slate-700/50 text-slate-400 transition"
                  >
                    <Edit3 size={13} />
                  </button>
                )}
              </div>

              {/* Big number */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ color }}>{actual}%</span>
                <span className="text-xs text-slate-400">/ {target}% target</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2.5 bg-white/60 dark:bg-slate-700/40 rounded-full overflow-hidden mb-3">
                {/* Target marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
                  style={{ left: `${target}%` }}
                />
                {/* Actual progress */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(actual, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 + 0.2 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{done}/{total} completed</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: met ? "#dcfce7" : "#fef3c7",
                    color: met ? "#16a34a" : "#d97706",
                  }}
                >
                  {met ? "✓ Met" : `${gap}% to go`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}