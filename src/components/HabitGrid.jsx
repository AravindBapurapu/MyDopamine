import { useContext, useMemo } from "react";
import { HabitContext } from "../context/HabitContext";
import { Trash2, Flame } from "lucide-react";
import { calculateHabitStats } from "../utils/trackerUtils";
import HabitRowProgress from "./HabitRowProgress";
import { motion } from "framer-motion";

export default function HabitGrid() {
  const { habits, handleCheckboxClick, askDeleteHabit, monthMeta } = useContext(HabitContext);

  // Streak calculation per habit
  const habitStreaks = useMemo(() => {
    return habits.map((habit) => {
      let currentStreak = 0;
      let longestStreak = 0;
      let temp = 0;
      const sorted = [...monthMeta.days].sort(
        (a, b) => new Date(a.fullDate) - new Date(b.fullDate)
      );
      for (const day of sorted) {
        if (habit.progress?.[day.fullDate]?.completed) {
          temp++;
          longestStreak = Math.max(longestStreak, temp);
        } else {
          temp = 0;
        }
      }
      // current streak = trailing consecutive days from end
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (habit.progress?.[sorted[i].fullDate]?.completed) currentStreak++;
        else break;
      }
      return { current: currentStreak, longest: longestStreak };
    });
  }, [habits, monthMeta.days]);

  // Today's full date for highlighting
  const today = new Date().toISOString().split("T")[0];

  if (habits.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-16 text-center">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="text-base font-semibold text-slate-700 dark:text-white mb-1">No habits yet</h3>
        <p className="text-sm text-slate-400">Add your first habit above to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/*
        FIX #4: Notion-style sticky layout.
        The outer div is the scroll container (horizontal scroll).
        The first column (habit name) is position: sticky left:0 so it never scrolls.
      */}
      <div className="overflow-x-auto">
        <table className="border-collapse" style={{ minWidth: "max-content", width: "100%" }}>
          {/* ── HEADER ── */}
          <thead>
            {/* Week labels row */}
            <tr className="border-b border-slate-100 dark:border-slate-700">
              {/* Sticky habit column header */}
              <th
                className="sticky left-0 z-20 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                style={{ minWidth: 200, width: 200 }}
              >
                Habit
              </th>

              {/* Week spans */}
              {monthMeta.weeks.map((week, wi) => (
                <th
                  key={week.label}
                  colSpan={week.days.length}
                  className="text-center text-[10px] font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 py-2 px-1"
                  style={{ backgroundColor: wi % 2 === 0 ? "rgba(139,92,246,0.04)" : "rgba(99,102,241,0.04)" }}
                >
                  {week.label}
                </th>
              ))}

              {/* Stats cols */}
              <th className="sticky right-0 z-20 bg-white dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center" style={{ minWidth: 90 }}>
                Done
              </th>
              <th className="sticky bg-white dark:bg-slate-800 px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center" style={{ minWidth: 60 }}>
                Ring
              </th>
              <th className="bg-white dark:bg-slate-800 px-2" style={{ minWidth: 40 }} />
            </tr>

            {/* Day numbers row */}
            <tr className="border-b-2 border-slate-200 dark:border-slate-600">
              <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-700/60 border-r border-slate-100 dark:border-slate-700" style={{ minWidth: 200, width: 200 }} />

              {monthMeta.weeks.map((week, wi) =>
                week.days.map((day) => {
                  const isToday = day.fullDate === today;
                  return (
                    <th
                      key={day.fullDate}
                      className="text-center px-0.5 py-1.5"
                      style={{
                        minWidth: 34,
                        width: 34,
                        backgroundColor: isToday
                          ? "rgba(139,92,246,0.12)"
                          : wi % 2 === 0
                          ? "rgba(139,92,246,0.04)"
                          : "rgba(99,102,241,0.04)",
                      }}
                    >
                      <div className={`text-[9px] font-medium ${isToday ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}`}>
                        {day.shortDay}
                      </div>
                      <div
                        className={`text-xs font-bold mt-0.5 ${
                          isToday
                            ? "w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center mx-auto text-[10px]"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {day.dayNumber}
                      </div>
                    </th>
                  );
                })
              )}

              <th className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-700/60 border-l border-slate-100 dark:border-slate-700" colSpan={3} />
            </tr>
          </thead>

          {/* ── BODY ── */}
          <tbody>
            {habits.map((habit, index) => {
              const stats = calculateHabitStats(habit, monthMeta.days);
              const streak = habitStreaks[index];

              return (
                <motion.tr
                  key={habit.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group border-b border-slate-50 dark:border-slate-700/40 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  {/* Sticky habit name */}
                  <td
                    className="sticky left-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-700/40 border-r border-slate-100 dark:border-slate-700 px-4 py-2.5 transition-colors"
                    style={{ minWidth: 200, width: 200 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color || "#8b5cf6" }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{habit.name}</p>
                        {streak.current > 1 && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            <Flame size={10} className="text-orange-400" />
                            <span className="text-[10px] text-orange-500 font-medium">{streak.current}d streak</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Day checkboxes */}
                  {monthMeta.weeks.map((week, wi) =>
                    week.days.map((day) => {
                      const progress = habit.progress?.[day.fullDate];
                      const checked = progress?.completed || false;
                      const hasNote = checked && progress?.note;
                      const perf = progress?.performance;
                      const isToday = day.fullDate === today;

                      /*
                        FIX #5: Color coding
                        - checked + note → performance color (green/yellow/red)
                        - checked + no note → blue
                        - unchecked → empty / light gray
                      */
                      let cellBg = "transparent";
                      let cellTitle = "";
                      if (checked) {
                        if (hasNote) {
                          cellTitle = `${perf === "high" ? "✅" : perf === "medium" ? "⚡" : "😓"} ${progress.note}`;
                          cellBg =
                            perf === "high"
                              ? "#22c55e"
                              : perf === "medium"
                              ? "#f59e0b"
                              : "#ef4444";
                        } else {
                          cellBg = "#6366f1"; // checked but no note → indigo
                        }
                      }

                      return (
                        <td
                          key={day.fullDate}
                          className="p-0.5 text-center"
                          style={{
                            backgroundColor: isToday
                              ? "rgba(139,92,246,0.08)"
                              : wi % 2 === 0
                              ? "rgba(139,92,246,0.02)"
                              : "rgba(99,102,241,0.02)",
                          }}
                        >
                          <button
                            onClick={() => handleCheckboxClick(habit.id, day.fullDate)}
                            title={cellTitle || (checked ? "Click to uncheck" : "Click to mark complete")}
                            className="relative flex items-center justify-center mx-auto transition-all"
                            style={{ width: 22, height: 22 }}
                          >
                            {checked ? (
                              <div
                                className="w-5 h-5 rounded-sm flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: cellBg }}
                              >
                                <svg viewBox="0 0 12 12" width={10} height={10} fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-sm border-2 border-slate-200 dark:border-slate-600 hover:border-violet-400 transition-colors" />
                            )}
                          </button>
                        </td>
                      );
                    })
                  )}

                  {/* Stats */}
                  <td className="sticky right-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-700/40 border-l border-slate-100 dark:border-slate-700 px-3 py-2.5 text-center transition-colors" style={{ minWidth: 90 }}>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{stats.done}</span>
                    <span className="text-xs text-slate-400">/{stats.total}</span>
                    <div className="text-[10px] text-violet-500 font-medium">{stats.percent}%</div>
                  </td>

                  {/* Ring */}
                  <td className="bg-white dark:bg-slate-800 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-700/40 px-2 py-2.5 text-center transition-colors" style={{ minWidth: 60 }}>
                    <HabitRowProgress percent={stats.percent} color={habit.color} />
                  </td>

                  {/* Delete */}
                  <td className="bg-white dark:bg-slate-800 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-700/40 px-2 py-2.5 transition-colors" style={{ minWidth: 40 }}>
                    <button
                      onClick={() => askDeleteHabit(habit.id, habit.name)}
                      className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>

          {/* ── LEGEND ROW ── */}
          <tfoot>
            <tr className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
              <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-700/40 px-4 py-2.5 border-r border-slate-100 dark:border-slate-700" style={{ minWidth: 200 }}>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Legend</span>
              </td>
              <td colSpan={monthMeta.days.length} className="px-4 py-2.5">
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { color: "#22c55e", label: "Crushed it" },
                    { color: "#f59e0b", label: "Moderate" },
                    { color: "#ef4444", label: "Struggled" },
                    { color: "#6366f1", label: "Done (no note)" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td colSpan={3} className="sticky right-0 bg-slate-50 dark:bg-slate-700/40 border-l border-slate-100 dark:border-slate-700" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}