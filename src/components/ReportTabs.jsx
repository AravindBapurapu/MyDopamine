import { useContext } from "react";
import { HabitContext } from "../context/HabitContext";
import { CalendarDays, Calendar, TrendingUp } from "lucide-react";

/*
  FIX #8: All three report types (monthly, weekly, yearly) are formula-based.
  Yearly uses getYearlyReport() from trackerUtils which computes per-month completion
  across all stored months.
*/

const TABS = [
  { view: "monthly", label: "Monthly", Icon: CalendarDays },
  { view: "weekly", label: "Weekly", Icon: Calendar },
  { view: "yearly", label: "Yearly", Icon: TrendingUp },
];

export default function ReportTabs() {
  const { reportView, setReportView, weekIndex, setWeekIndex, monthMeta } =
    useContext(HabitContext);
  const safeWeeks = Array.isArray(monthMeta?.weeks) ? monthMeta.weeks : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Tab switcher */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full">
        {TABS.map(({ view, label, Icon }) => (
          <button
            key={view}
            onClick={() => setReportView(view)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
              reportView === view
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Week selector — only shown in weekly view */}
      {reportView === "weekly" && safeWeeks.length > 0 && (
        <select
          value={Math.min(Math.max(Number(weekIndex) || 0, 0), safeWeeks.length - 1)}
          onChange={(e) => setWeekIndex(Number(e.target.value))}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm px-3 py-2 outline-none focus:border-violet-400 shadow-sm"
        >
          {safeWeeks.map((w, i) => (
            <option key={i} value={i}>
              {w.label} ({w.days.length} days)
            </option>
          ))}
        </select>
      )}
    </div>
  );
}