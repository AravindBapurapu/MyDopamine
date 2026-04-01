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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
        {TABS.map(({ view, label, Icon }) => (
          <button
            key={view}
            onClick={() => setReportView(view)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              reportView === view
                ? "bg-violet-500 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Week selector — only shown in weekly view */}
      {reportView === "weekly" && (
        <select
          value={weekIndex}
          onChange={(e) => setWeekIndex(Number(e.target.value))}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm px-3 py-2 outline-none focus:border-violet-400 shadow-sm"
        >
          {monthMeta.weeks.map((w, i) => (
            <option key={i} value={i}>
              {w.label} ({w.days.length} days)
            </option>
          ))}
        </select>
      )}
    </div>
  );
}