import { useContext, useMemo, useState } from "react";
import { HabitContext } from "../context/HabitContext";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, ReferenceLine,
  BarChart, Bar, LineChart, Line,
} from "recharts";
import { motion } from "framer-motion";
import { calculateHabitStats } from "../utils/trackerUtils";
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from "lucide-react";

const PERF_COLORS = {
  high: "#22c55e",
  medium: "#f59e0b",
  low: "#ef4444",
  default: "#6366f1",
};

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
    chartType, setChartType, overallStats, monthlyLineData,
    habits, monthMeta, reportView, weeklyReport, yearlyReport,
  } = useContext(HabitContext);

  const [activeHabitId, setActiveHabitId] = useState(null);

  /* Pie data */
  const pieData = [
    { name: "Completed", value: overallStats.totalDone, color: "#22c55e" },
    { name: "Missed", value: overallStats.totalNotDone, color: "#f87171" },
  ];

  /* Per-habit completion ranking */
  const habitRanking = useMemo(() => {
    return habits
      .map((h) => {
        const s = calculateHabitStats(h, monthMeta.days);
        return { id: h.id, name: h.name, completion: s.percent, done: s.done, total: s.total, color: h.color };
      })
      .sort((a, b) => b.completion - a.completion);
  }, [habits, monthMeta.days]);

  const avgCompletion = useMemo(() => {
    if (!habitRanking.length) return 0;
    return Math.round(habitRanking.reduce((s, h) => s + h.completion, 0) / habitRanking.length);
  }, [habitRanking]);

  /* Chart data for the main left panel */
  const getLeftChartData = () => {
    if (reportView === "weekly") return weeklyReport.map((w) => ({ name: w.name, percent: w.percent }));
    if (reportView === "yearly") return yearlyReport;
    return monthlyLineData.map((d) => ({ name: `Day ${d.day}`, percent: d.percent }));
  };

  const leftData = getLeftChartData();
  const leftAvg = leftData.length
    ? Math.round(leftData.reduce((s, d) => s + d.percent, 0) / leftData.length)
    : 0;

  /* ── Render left chart ── */
  const renderLeftChart = () => {
    if (chartType === "pie" || chartType === "donut") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <radialGradient id="greenGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </radialGradient>
              <radialGradient id="redGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="100%" stopColor="#dc2626" />
              </radialGradient>
            </defs>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartType === "donut" ? 50 : 0}
              outerRadius={80}
              paddingAngle={3}
              animationDuration={900}
            >
              <Cell fill="url(#greenGrad)" stroke="none" />
              <Cell fill="url(#redGrad)" stroke="none" />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    /* Line / area chart */
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={leftData} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
          <defs>
            {/* FIX #3: Proper gradient fill below the line */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-700" opacity={0.6} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={leftAvg}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: "avg", position: "right", fontSize: 9, fill: "#94a3b8" }}
          />
          {/* Area gives the gradient fill from line down to axis */}
          <Area
            type="monotone"
            dataKey="percent"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#areaGradient)"
            dot={{ fill: "#8b5cf6", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  /* ── Render right chart: habit ranking bar chart ── */
  const renderRightChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={habitRanking}
        margin={{ top: 12, right: 16, left: -20, bottom: 0 }}
        onMouseMove={(e) => {
          if (e.activePayload) setActiveHabitId(e.activePayload[0]?.payload?.id);
        }}
        onMouseLeave={() => setActiveHabitId(null)}
      >
        <defs>
          {habitRanking.map((h) => (
            <linearGradient key={h.id} id={`barGrad-${h.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={h.color || "#8b5cf6"} stopOpacity={1} />
              <stop offset="100%" stopColor={h.color || "#8b5cf6"} stopOpacity={0.6} />
            </linearGradient>
          ))}
          {/* Gradient for missed portion */}
          <linearGradient id="missedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" stopOpacity={1} />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-700"
          opacity={0.6}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={40}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-3 py-2.5 text-sm min-w-[140px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{d.name}</span>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-semibold text-emerald-600">{d.completion}%</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Days done</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{d.done}/{d.total}</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.completion}%`, backgroundColor: d.color }} />
                </div>
              </div>
            );
          }}
        />
        <ReferenceLine y={avgCompletion} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "avg", position: "right", fontSize: 9, fill: "#94a3b8" }} />
        <Bar dataKey="completion" radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={900}>
          {habitRanking.map((h) => (
            <Cell
              key={h.id}
              fill={`url(#barGrad-${h.id})`}
              opacity={activeHabitId && activeHabitId !== h.id ? 0.5 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      {/* ── Left panel: overall progress ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
      >
        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-0.5">{overallStats.percent}<span className="text-lg text-slate-400 font-normal">%</span></p>
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            {[
              { type: "line", Icon: Activity, title: "Area Chart" },
              { type: "donut", Icon: PieIcon, title: "Donut" },
              { type: "pie", Icon: BarChart3, title: "Pie" },
            ].map(({ type, Icon, title }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                title={title}
                className={`p-1.5 rounded-lg transition-all ${
                  chartType === type
                    ? "bg-white dark:bg-slate-600 shadow-sm text-violet-500"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">{renderLeftChart()}</div>

        {/* Mini stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2.5 border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{overallStats.totalDone}</p>
          </div>
          <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 px-3 py-2.5 border border-rose-100 dark:border-rose-800/30">
            <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider">Missed</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-300 mt-0.5">{overallStats.totalNotDone}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Right panel: habit ranking bar chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Habit Ranking</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Completion rate · highest to lowest</p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Avg <span className="font-bold text-violet-500">{avgCompletion}%</span>
          </div>
        </div>

        <div className="h-56">{renderRightChart()}</div>

        {/* Ranking pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {habitRanking.slice(0, 6).map((h, i) => (
            <div
              key={h.id}
              className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg px-2.5 py-1"
            >
              <span className="text-[10px] font-bold text-slate-400">#{i + 1}</span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
              <span className="text-xs text-slate-600 dark:text-slate-300 max-w-[80px] truncate">{h.name}</span>
              <span className="text-xs font-semibold" style={{ color: h.color }}>{h.completion}%</span>
            </div>
          ))}
          {habitRanking.length > 6 && (
            <div className="text-xs text-slate-400 dark:text-slate-500 px-2 py-1">+{habitRanking.length - 6} more</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}