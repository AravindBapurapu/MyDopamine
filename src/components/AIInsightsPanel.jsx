// src/components/AIInsightsPanel.jsx
import { useContext, useMemo } from "react";
import { HabitContext } from "../context/HabitContext";
import { generateAIInsights } from "../utils/aiInsights";
import aiSuggestionsService from "../services/aiSuggestionsService";
import { motion } from "framer-motion";
import { Brain, Lightbulb, TrendingUp, Zap, Target } from "lucide-react";

export default function AIInsightsPanel() {
  const { habits, monthMeta } = useContext(HabitContext);

  const aiData = useMemo(
    () => generateAIInsights(habits, monthMeta.days),
    [habits, monthMeta.days]
  );

  const aiSuggestions = useMemo(
    () => aiSuggestionsService.generateSuggestions(habits, monthMeta),
    [habits, monthMeta]
  );

  const dailyRecs = useMemo(
    () => aiSuggestionsService.generateDailyRecommendations(habits, monthMeta),
    [habits, monthMeta]
  );

  const trend = useMemo(
    () => aiSuggestionsService.predictTrend(habits, monthMeta),
    [habits, monthMeta]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* ── Daily Recommendations ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl border border-violet-200 dark:border-violet-800/30 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Target size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Goal</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Daily Progress</p>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center justify-center mb-4">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="8"
              strokeDasharray={`${dailyRecs.completionRate * 2.827} 282.7`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dy="0.3em"
              className="text-2xl font-bold"
              fill="#1e293b"
            >
              {dailyRecs.completionRate}%
            </text>
          </svg>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {dailyRecs.completed} of {dailyRecs.total} completed
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {dailyRecs.nextRecommendation}
          </p>
        </div>

        {/* Motivation */}
        <div className="mt-4 pt-4 border-t border-violet-200 dark:border-violet-800/30">
          <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 text-center">
            <p className="text-2xl mb-1">🎯</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {dailyRecs.completionRate >= 80
                ? "Outstanding! Keep crushing it!"
                : dailyRecs.completionRate >= 50
                ? "Great progress! Almost there!"
                : dailyRecs.completionRate > 0
                ? "You're on the right track!"
                : "Let's get started!"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── AI Insights ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
            <Brain size={18} className="text-violet-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Analysis</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Patterns</p>
          </div>
        </div>

        {aiData.insights.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            <Brain size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Track habits to see insights</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {aiData.insights.slice(0, 5).map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700"
              >
                <span className="text-lg flex-shrink-0">{insight.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{insight.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {insight.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Smart Suggestions & Predictions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="lg:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/30 shadow-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Zap size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Smart Tips</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recommendations</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {aiSuggestions.slice(0, 3).map((suggestion, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-amber-100 dark:border-amber-800/20"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{suggestion.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {suggestion.title}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {suggestion.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trend Prediction */}
        {trend && (
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/30">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              7-Day Trend
            </p>
            <div className="flex items-end gap-1.5">
              <div className="flex-1">
                <div className="h-6 bg-gradient-to-t from-indigo-400 to-indigo-500 rounded-t opacity-70" />
                <p className="text-[9px] text-slate-500 font-medium mt-1 text-center">{trend.recentAverage}%</p>
              </div>
              <TrendingUp size={16} className={trend.trend.includes("↗") ? "text-emerald-500" : trend.trend.includes("→") ? "text-amber-500" : "text-rose-500"} />
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{trend.trend}</p>
                <p className="text-[9px] text-slate-500">Predicted</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}