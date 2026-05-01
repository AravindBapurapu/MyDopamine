import { useContext } from "react";
import { HabitContext } from "../context/HabitContext";
import { TrendingUp, CheckCircle2, XCircle, Target, Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";

/*
  FIX #7: Notion-style summary cards below the header.
  FIX #8: All values are formula-based from context (no hardcoded or random values).
  
  Cards shown:
  - Progress %      (done / totalPossible × 100)
  - Days Done       (total completed across all habits)
  - Days Missed
  - Best Habit      (highest completion %)
  - Current Streak  (max streak across all habits for current month)
  - Total Possible  (habits × days in month)
*/

export default function SummaryCards() {
  const { overallStats, reportView, weeklyReport, habits, monthMeta } = useContext(HabitContext);

  // ── Formula-based values ─────────────────────────────────────────────────
  const currentWeeklyAvg =
    weeklyReport.length === 0
      ? 0
      : Math.round(weeklyReport.reduce((s, w) => s + w.percent, 0) / weeklyReport.length);

  const percent = reportView === "monthly" ? overallStats.percent : currentWeeklyAvg;
  const done = reportView === "monthly"
    ? overallStats.totalDone
    : weeklyReport.reduce((s, w) => s + w.done, 0);
  const notDone = reportView === "monthly"
    ? overallStats.totalNotDone
    : weeklyReport.reduce((s, w) => s + w.notDone, 0);
  const total = reportView === "monthly"
    ? overallStats.totalPossible
    : weeklyReport.reduce((s, w) => s + w.total, 0);

  // Best habit by completion %
  const habitStats = habits.map((h) => {
    const d = monthMeta.days.filter((day) => h.progress?.[day.fullDate]?.completed).length;
    const pct = monthMeta.days.length === 0 ? 0 : Math.round((d / monthMeta.days.length) * 100);
    return { name: h.name, pct, color: h.color };
  });
  const bestHabit = habitStats.length ? habitStats.reduce((a, b) => (a.pct >= b.pct ? a : b)) : null;

  // Max streak across all habits
  let maxStreak = 0;
  habits.forEach((h) => {
    let s = 0;
    const sorted = [...monthMeta.days].sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    for (const day of sorted) {
      if (h.progress?.[day.fullDate]?.completed) { s++; maxStreak = Math.max(maxStreak, s); }
      else s = 0;
    }
  });

  // ── Card definitions ─────────────────────────────────────────────────────
  const cards = [
    {
      label: "Completion",
      value: `${percent}%`,
      sub: `${reportView === "monthly" ? "This month" : "This week"}`,
      Icon: TrendingUp,
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "border-violet-100 dark:border-violet-800/30",
      iconColor: "text-violet-500",
      valueColor: "text-violet-700 dark:text-violet-300",
      barColor: "#8b5cf6",
      barPct: percent,
    },
    {
      label: "Done",
      value: done,
      sub: `out of ${total} possible`,
      Icon: CheckCircle2,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800/30",
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-700 dark:text-emerald-300",
      barColor: "#22c55e",
      barPct: total ? Math.round((done / total) * 100) : 0,
    },
    {
      label: "Missed",
      value: notDone,
      sub: `${total ? Math.round((notDone / total) * 100) : 0}% of total`,
      Icon: XCircle,
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-100 dark:border-rose-800/30",
      iconColor: "text-rose-400",
      valueColor: "text-rose-600 dark:text-rose-300",
      barColor: "#f87171",
      barPct: total ? Math.round((notDone / total) * 100) : 0,
    },
    {
      label: "Best Habit",
      value: bestHabit ? `${bestHabit.pct}%` : "—",
      sub: bestHabit?.name || "No habits yet",
      Icon: Target,
      bg: "bg-sky-50 dark:bg-sky-900/20",
      border: "border-sky-100 dark:border-sky-800/30",
      iconColor: "text-sky-500",
      valueColor: "text-sky-700 dark:text-sky-300",
      barColor: bestHabit?.color || "#0ea5e9",
      barPct: bestHabit?.pct || 0,
    },
    {
      label: "Top Streak",
      value: `${maxStreak}d`,
      sub: "consecutive days",
      Icon: Flame,
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-100 dark:border-orange-800/30",
      iconColor: "text-orange-400",
      valueColor: "text-orange-600 dark:text-orange-300",
      barColor: "#fb923c",
      barPct: monthMeta.days.length ? Math.min(100, Math.round((maxStreak / monthMeta.days.length) * 100)) : 0,
    },
    {
      label: "Habits",
      value: habits.length,
      sub: `tracking this ${reportView === "monthly" ? "month" : "week"}`,
      Icon: Calendar,
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-100 dark:border-amber-800/30",
      iconColor: "text-amber-500",
      valueColor: "text-amber-700 dark:text-amber-300",
      barColor: "#f59e0b",
      barPct: 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(({ label, value, sub, Icon, bg, border, iconColor, valueColor, barColor, barPct }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className={`${bg} border ${border} rounded-2xl px-4 py-4 flex flex-col gap-2 relative overflow-hidden`}
        >
          {/* Icon */}
          <div className={`${iconColor} flex items-center justify-between`}>
            <Icon size={16} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
          </div>

          {/* Value */}
          <div>
            <p className={`text-2xl font-bold ${valueColor} leading-none`}>{value}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">{sub}</p>
          </div>

          {/* Progress bar — FIX #7 Notion-style inline bar */}
          <div className="h-1 w-full rounded-full bg-white/60 dark:bg-slate-700/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barPct}%` }}
              transition={{ duration: 0.8, delay: i * 0.04 + 0.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}