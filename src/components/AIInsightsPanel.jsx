// src/components/AIInsightsPanel.jsx
import { useContext, useMemo } from "react";
import { HabitContext } from "../context/HabitContext";
import { generateAIInsights } from "../utils/aiInsights";
import { motion } from "framer-motion";
import { Brain, Lightbulb, TrendingUp } from "lucide-react";

export default function AIInsightsPanel() {
  const { habits, monthMeta } = useContext(HabitContext);

  const aiData = useMemo(
    () => generateAIInsights(habits, monthMeta.days),
    [habits, monthMeta.days]
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* ── Insights ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
            <Brain size={18} className="text-violet-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Analysis</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pattern Insights</p>
          </div>
          <div
            className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: aiData.consistencyColor + "20", color: aiData.consistencyColor }}
          >
            {aiData.consistencyLabel} · {aiData.consistencyScore}%
          </div>
        </div>

        {aiData.insights.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <Brain size={32} className="mx-auto mb-2 opacity-30" />
            Track habits for a few days to see insights
          </div>
        ) : (
          <div className="space-y-3">
            {aiData.insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  insight.type === "streak" ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30" :
                  insight.type === "best_day" ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30" :
                  insight.type === "trend" ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30" :
                  "bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700"
                }`}
              >
                <span className="text-xl">{insight.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{insight.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{insight.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Day of week breakdown */}
        {aiData.dowBreakdown.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Day-of-Week Breakdown</p>
            <div className="flex gap-1.5">
              {aiData.dowBreakdown.map((d) => (
                <div key={d.day} className="flex-1 text-center">
                  <div className="h-12 bg-slate-100 dark:bg-slate-700 rounded-lg relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-lg transition-all"
                      style={{
                        height: `${d.pct}%`,
                        backgroundColor:
                          d.pct >= 70 ? "#22c55e" : d.pct >= 40 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium">{d.day.slice(0,3)}</p>
                  <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300">{d.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Suggestions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Lightbulb size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Smart Suggestions</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">AI Recommendations</p>
          </div>
        </div>

        <div className="space-y-3">
          {aiData.suggestions.map((suggestion, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-100 dark:border-amber-800/30"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{suggestion}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekday vs Weekend */}
        {(aiData.weekdayPct > 0 || aiData.weekendPct > 0) && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Weekday vs Weekend</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Weekdays", pct: aiData.weekdayPct, color: "#6366f1" },
                { label: "Weekends", pct: aiData.weekendPct, color: "#f59e0b" },
              ].map(({ label, pct, color }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-center">
                  <p
                    className="text-2xl font-bold"
                    style={{ color }}
                  >
                    {pct}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                  <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}