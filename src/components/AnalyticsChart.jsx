import { useContext, useMemo, useState, useEffect } from "react";
import { HabitContext } from "../context/HabitContext";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { motion } from "framer-motion";
import { calculateHabitStats } from "../utils/trackerUtils";

/* ─── Custom Tooltip ───────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-3 py-2.5 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || "#6366f1" }} />
          <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-white">
            {typeof entry.value === "number" ? `${Math.round(entry.value)}%` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};



/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function AnalyticsChart() {
  const {
    overallStats, monthlyLineData, habits, monthMeta, reportView, weeklyReport, yearlyReport,
  } = useContext(HabitContext);

  const habitRanking = useMemo(() => {
    return habits
      .map((h) => {
        const s = calculateHabitStats(h, monthMeta.days);
        return { id: h.id, name: h.name, completion: s.percent, done: s.done, total: s.total, color: h.color || "#8b5cf6" };
      })
      .sort((a, b) => b.completion - a.completion);
  }, [habits, monthMeta.days]);

  const currentWeek = weeklyReport.filter(w => w.total > 0).pop() || weeklyReport[weeklyReport.length - 1] || { name: "This Week", percent: 0, done: 0, total: 0 };
  const yearMonthsWithData = yearlyReport.filter((month) => month.total > 0);
  const yearlyAverage = yearMonthsWithData.length
    ? Math.round(yearMonthsWithData.reduce((sum, month) => sum + month.percent, 0) / yearMonthsWithData.length)
    : 0;

  const targetMetrics = [
    { label: "Weekly Pace", value: currentWeek.percent, detail: currentWeek.name, accent: "from-violet-500 to-indigo-500", color: "#8b5cf6" },
    { label: "Monthly Completion", value: overallStats.percent, detail: `${overallStats.totalDone}/${overallStats.totalPossible} done`, accent: "from-emerald-500 to-teal-500", color: "#10b981" },
    { label: "Yearly Pace", value: yearlyAverage, detail: `${yearMonthsWithData.length || 1} active months`, accent: "from-amber-500 to-orange-500", color: "#f59e0b" },
  ];

  const getLeftChartData = () => {
    if (reportView === "weekly") return weeklyReport.map((w) => ({ name: w.name, percent: w.percent }));
    if (reportView === "yearly") return yearlyReport;
    return monthlyLineData.map((d) => ({ name: `Day ${d.day}`, percent: d.percent }));
  };

  const leftData = getLeftChartData();
  const leftAvg = leftData.length ? Math.round(leftData.reduce((s, d) => s + d.percent, 0) / leftData.length) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid lg:grid-cols-5 gap-4">
        {/* ── Left panel: Vertical Targets ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-center"
        >
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pace & Targets</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Completion across time periods.</p>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {targetMetrics.map((metric, i) => (
              <div key={metric.label}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{metric.label}</p>
                    <p className="text-[10px] text-slate-400">{metric.detail}</p>
                  </div>
                  <span className="text-lg font-bold" style={{ color: metric.color }}>{metric.value}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${metric.accent} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Right panel: Line Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Trend</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Historical progress over time</p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Avg <span className="font-bold text-violet-500">{leftAvg}%</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leftData} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-700" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={leftAvg} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "avg", position: "right", fontSize: 9, fill: "#94a3b8" }} />
                <Area
                  type="monotone"
                  dataKey="percent"
                  name="Completion"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="url(#trendAreaGrad)"
                  dot={{ fill: "#0ea5e9", r: 1.5, strokeWidth: 0 }}
                  activeDot={{ r: 3.5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>


    </div>
  );
}