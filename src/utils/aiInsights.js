// src/utils/aiInsights.js
import dayjs from "dayjs";

/*
  Analyzes habit data and returns AI-style insights + suggestions.
  All logic is deterministic (formula-based, not an actual LLM).
  We call it "AI insights" because it mimics intelligent pattern recognition.
*/

// Day names for readable output
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/* ─── Main Analysis Function ─────────────────────────────────────────────── */
export function generateAIInsights(habits, days) {
  if (!habits.length || !days.length) return getEmptyInsights();

  const insights = [];
  const suggestions = [];

  // ── 1. Weekend vs Weekday analysis ──────────────────────────────────────
  const weekdayCompletion = { weekday: { done: 0, total: 0 }, weekend: { done: 0, total: 0 } };
  days.forEach((day) => {
    const dow = dayjs(day.fullDate).day(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const bucket = isWeekend ? "weekend" : "weekday";
    habits.forEach((h) => {
      weekdayCompletion[bucket].total++;
      if (h.progress?.[day.fullDate]?.completed) weekdayCompletion[bucket].done++;
    });
  });

  const weekdayPct = weekdayCompletion.weekday.total
    ? Math.round((weekdayCompletion.weekday.done / weekdayCompletion.weekday.total) * 100)
    : 0;
  const weekendPct = weekdayCompletion.weekend.total
    ? Math.round((weekdayCompletion.weekend.done / weekdayCompletion.weekend.total) * 100)
    : 0;

  if (Math.abs(weekdayPct - weekendPct) > 15) {
    const stronger = weekdayPct > weekendPct ? "weekdays" : "weekends";
    const weaker = stronger === "weekdays" ? "weekends" : "weekdays";
    insights.push({
      type: "pattern",
      icon: "📅",
      title: "Weekly Pattern Detected",
      message: `You perform ${Math.abs(weekdayPct - weekendPct)}% better on ${stronger} (${Math.max(weekdayPct, weekendPct)}%) than ${weaker} (${Math.min(weekdayPct, weekendPct)}%).`,
    });
    suggestions.push(`Prepare a lighter routine for ${weaker} to stay consistent.`);
  }

  // ── 2. Best and worst days of week ──────────────────────────────────────
  const dowStats = Array(7).fill(null).map(() => ({ done: 0, total: 0 }));
  days.forEach((day) => {
    const dow = dayjs(day.fullDate).day();
    habits.forEach((h) => {
      dowStats[dow].total++;
      if (h.progress?.[day.fullDate]?.completed) dowStats[dow].done++;
    });
  });

  const dowPcts = dowStats.map((s, i) => ({
    day: DAY_NAMES[i],
    pct: s.total ? Math.round((s.done / s.total) * 100) : 0,
    total: s.total,
  })).filter((d) => d.total > 0);

  if (dowPcts.length) {
    const best = dowPcts.reduce((a, b) => (a.pct >= b.pct ? a : b));
    const worst = dowPcts.reduce((a, b) => (a.pct <= b.pct ? a : b));
    insights.push({
      type: "best_day",
      icon: "🏆",
      title: "Best Day",
      message: `${best.day} is your strongest day at ${best.pct}% completion.`,
    });
    if (worst.pct < 50) {
      insights.push({
        type: "worst_day",
        icon: "⚠️",
        title: "Needs Improvement",
        message: `${worst.day} is your weakest day at ${worst.pct}% — consider reviewing your schedule.`,
      });
      suggestions.push(`Set a reminder for ${worst.day}s to boost completion.`);
    }
  }

  // ── 3. Streak analysis ───────────────────────────────────────────────────
  let maxStreak = 0, currentStreak = 0, streakDropAfter = null;
  const sortedDays = [...days].sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  habits.forEach((habit) => {
    let streak = 0;
    sortedDays.forEach((day) => {
      if (habit.progress?.[day.fullDate]?.completed) {
        streak++;
        if (streak > maxStreak) maxStreak = streak;
        // Check for drop pattern: completed 3+ days then missed
        if (streak === 3) streakDropAfter = 3;
      } else {
        streak = 0;
      }
    });
  });

  if (maxStreak >= 3) {
    insights.push({
      type: "streak",
      icon: "🔥",
      title: "Streak Achievement",
      message: `Your best streak this month is ${maxStreak} consecutive days!`,
    });
  }

  if (streakDropAfter === 3) {
    suggestions.push("Your productivity tends to drop after 3-day streaks. Push through day 4 to build lasting habits.");
  }

  // ── 4. Consistency score ─────────────────────────────────────────────────
  const completedDays = sortedDays.filter((day) =>
    habits.some((h) => h.progress?.[day.fullDate]?.completed)
  ).length;
  const passedDays = sortedDays.filter((d) => dayjs(d.fullDate).isBefore(dayjs())).length;
  const consistencyScore = passedDays
    ? Math.round((completedDays / passedDays) * 100)
    : 0;

  let consistencyLabel, consistencyColor;
  if (consistencyScore >= 80) { consistencyLabel = "Excellent"; consistencyColor = "#22c55e"; }
  else if (consistencyScore >= 60) { consistencyLabel = "Good"; consistencyColor = "#f59e0b"; }
  else if (consistencyScore >= 40) { consistencyLabel = "Fair"; consistencyColor = "#f97316"; }
  else { consistencyLabel = "Needs Work"; consistencyColor = "#ef4444"; }

  // ── 5. Performance quality analysis ─────────────────────────────────────
  let highCount = 0, mediumCount = 0, lowCount = 0;
  habits.forEach((h) => {
    days.forEach((d) => {
      const perf = h.progress?.[d.fullDate]?.performance;
      if (perf === "high") highCount++;
      else if (perf === "medium") mediumCount++;
      else if (perf === "low") lowCount++;
    });
  });

  const totalRated = highCount + mediumCount + lowCount;
  if (totalRated > 0) {
    const highPct = Math.round((highCount / totalRated) * 100);
    if (highPct >= 60) {
      insights.push({
        type: "quality",
        icon: "⚡",
        title: "High Quality Work",
        message: `${highPct}% of your completed days were rated as excellent performance!`,
      });
    } else if (lowCount > highCount) {
      suggestions.push("Many days are rated 'Struggled'. Consider reducing habit difficulty or breaking them into smaller steps.");
    }
  }

  // ── 6. Habit-specific suggestions ───────────────────────────────────────
  habits.forEach((habit) => {
    const stats = days.filter((d) => habit.progress?.[d.fullDate]?.completed).length;
    const pct = days.length ? Math.round((stats / days.length) * 100) : 0;
    if (pct < 30 && days.length > 7) {
      suggestions.push(`"${habit.name}" is only ${pct}% complete — consider simplifying or adjusting the goal.`);
    }
  });

  // ── 7. Momentum trend ───────────────────────────────────────────────────
  const recentDays = sortedDays.slice(-7); // last 7 days
  const olderDays = sortedDays.slice(-14, -7); // 7 days before that
  const recentDone = recentDays.filter((d) => habits.some((h) => h.progress?.[d.fullDate]?.completed)).length;
  const olderDone = olderDays.filter((d) => habits.some((h) => h.progress?.[d.fullDate]?.completed)).length;

  if (recentDays.length >= 5 && olderDays.length >= 5) {
    if (recentDone > olderDone) {
      insights.push({
        type: "trend",
        icon: "📈",
        title: "Momentum Building",
        message: "Your last 7 days are stronger than the 7 before. Keep the momentum going!",
      });
    } else if (recentDone < olderDone - 2) {
      insights.push({
        type: "trend",
        icon: "📉",
        title: "Slipping Momentum",
        message: "Your completion rate has dipped recently. Time to refocus!",
      });
      suggestions.push("Take 5 minutes tonight to plan tomorrow's habits in advance.");
    }
  }

  return {
    insights: insights.slice(0, 5), // max 5 insights
    suggestions: suggestions.slice(0, 4), // max 4 suggestions
    consistencyScore,
    consistencyLabel,
    consistencyColor,
    weekdayPct,
    weekendPct,
    dowBreakdown: dowPcts,
    maxStreak,
  };
}

function getEmptyInsights() {
  return {
    insights: [],
    suggestions: ["Add habits and start tracking to see personalized insights!"],
    consistencyScore: 0,
    consistencyLabel: "No Data",
    consistencyColor: "#94a3b8",
    weekdayPct: 0,
    weekendPct: 0,
    dowBreakdown: [],
    maxStreak: 0,
  };
}

/* ─── Monthly color theme ───────────────────────────────────────────────── */
export const MONTH_THEMES = {
  January:   { primary: "#3b82f6", secondary: "#1d4ed8", bg: "#eff6ff", name: "Winter Blue" },
  February:  { primary: "#ec4899", secondary: "#be185d", bg: "#fdf2f8", name: "Valentine Pink" },
  March:     { primary: "#22c55e", secondary: "#15803d", bg: "#f0fdf4", name: "Spring Green" },
  April:     { primary: "#a78bfa", secondary: "#7c3aed", bg: "#f5f3ff", name: "Lavender" },
  May:       { primary: "#f59e0b", secondary: "#d97706", bg: "#fffbeb", name: "Golden May" },
  June:      { primary: "#06b6d4", secondary: "#0e7490", bg: "#ecfeff", name: "Ocean Cyan" },
  July:      { primary: "#ef4444", secondary: "#dc2626", bg: "#fef2f2", name: "Summer Red" },
  August:    { primary: "#f97316", secondary: "#ea580c", bg: "#fff7ed", name: "Harvest Orange" },
  September: { primary: "#84cc16", secondary: "#65a30d", bg: "#f7fee7", name: "Olive Green" },
  October:   { primary: "#f59e0b", secondary: "#b45309", bg: "#fef3c7", name: "Autumn Gold" },
  November:  { primary: "#8b5cf6", secondary: "#6d28d9", bg: "#f5f3ff", name: "Deep Purple" },
  December:  { primary: "#14b8a6", secondary: "#0f766e", bg: "#f0fdfa", name: "Teal Winter" },
};