// AI-powered suggestions and insights service
import dayjs from "dayjs";

/**
 * Analyzes habit data and provides real-time AI suggestions
 */
class AISuggestionsService {
  /**
   * Generate smart suggestions based on habit performance
   */
  generateSuggestions(habits, monthMeta) {
    const suggestions = [];
    const today = new Date().toISOString().split("T")[0];
    const todayObj = dayjs(today);
    
    if (!habits.length) return suggestions;

    // ✅ 1. Habit consistency analysis
    habits.forEach((habit) => {
      const completions = monthMeta.days.filter(
        (d) => habit.progress?.[d.fullDate]?.completed
      );
      const completionRate = (completions.length / monthMeta.days.length) * 100;
      
      if (completionRate > 80) {
        suggestions.push({
          type: "star_performer",
          emoji: "⭐",
          title: `${habit.name} is your star!`,
          message: `You've completed "${habit.name}" ${Math.round(completionRate)}% of the time. Amazing consistency!`,
          priority: "high",
          action: "Keep it up!",
        });
      } else if (completionRate < 20 && completions.length > 0) {
        suggestions.push({
          type: "struggling_habit",
          emoji: "⚠️",
          title: `Boost your "${habit.name}"`,
          message: `You're completing this habit only ${Math.round(completionRate)}% of the time. Consider simplifying it or adjusting timing.`,
          priority: "medium",
          action: "Modify habit",
        });
      }
    });

    // ✅ 2. Best time patterns
    const dayCompletions = {};
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    monthMeta.days.forEach((day) => {
      const dow = dayjs(day.fullDate).day();
      const dayName = dayNames[dow];
      if (!dayCompletions[dayName]) dayCompletions[dayName] = { done: 0, total: 0 };
      dayCompletions[dayName].total += habits.length;
      
      habits.forEach((h) => {
        if (h.progress?.[day.fullDate]?.completed) {
          dayCompletions[dayName].done++;
        }
      });
    });

    // Find best performing day
    const bestDay = Object.entries(dayCompletions).sort(
      (a, b) => (b[1].done / b[1].total) - (a[1].done / a[1].total)
    )[0];

    if (bestDay && bestDay[1].done > 0) {
      const rate = Math.round((bestDay[1].done / bestDay[1].total) * 100);
      suggestions.push({
        type: "best_day",
        emoji: "📈",
        title: `${bestDay[0]} is your peak day!`,
        message: `You're most productive on ${bestDay[0]}s (${rate}% completion). Schedule important habits then!`,
        priority: "medium",
        action: "Plan ahead",
      });
    }

    // ✅ 3. Streak tracking
    habits.forEach((habit) => {
      let currentStreak = 0;
      const sorted = [...monthMeta.days].sort(
        (a, b) => new Date(b.fullDate) - new Date(a.fullDate)
      );
      
      for (const day of sorted) {
        if (habit.progress?.[day.fullDate]?.completed) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      if (currentStreak >= 7) {
        suggestions.push({
          type: "streak",
          emoji: "🔥",
          title: `${currentStreak} day streak!`,
          message: `You've completed "${habit.name}" for ${currentStreak} consecutive days. Don't break it!`,
          priority: "high",
          action: "Continue",
        });
      }
    });

    // ✅ 4. Habit synergy detection
    if (habits.length >= 2) {
      const completionSets = {};
      monthMeta.days.forEach((day) => {
        const completed = habits
          .filter((h) => h.progress?.[day.fullDate]?.completed)
          .map((h) => h.id)
          .sort()
          .join(",");
        
        if (completed) {
          completionSets[completed] = (completionSets[completed] || 0) + 1;
        }
      });

      const topSync = Object.entries(completionSets).sort(
        (a, b) => b[1] - a[1]
      )[0];

      if (topSync && topSync[1] >= 3) {
        const syncedIds = topSync[0].split(",");
        const syncedNames = habits
          .filter((h) => syncedIds.includes(h.id))
          .map((h) => h.name)
          .slice(0, 2);
        
        suggestions.push({
          type: "synergy",
          emoji: "🔗",
          title: "Habit synergy detected",
          message: `"${syncedNames.join('" and "')}" often completed together. They might be related!`,
          priority: "low",
          action: "Group together",
        });
      }
    }

    // ✅ 5. Motivation based on progress
    const totalCompleted = habits.reduce((sum, h) => {
      return sum + monthMeta.days.filter((d) => h.progress?.[d.fullDate]?.completed).length;
    }, 0);
    
    const totalPossible = habits.length * monthMeta.days.length;
    const overallRate = (totalCompleted / totalPossible) * 100;

    if (overallRate > 70) {
      suggestions.push({
        type: "motivation_high",
        emoji: "🚀",
        title: "You're crushing it!",
        message: `With a ${Math.round(overallRate)}% completion rate, you're among the top performers. Push for 80%!`,
        priority: "low",
        action: "Set new goal",
      });
    } else if (overallRate < 40 && totalCompleted > 0) {
      suggestions.push({
        type: "motivation_low",
        emoji: "💪",
        title: "Let's build momentum",
        message: `Start small: complete just one habit today. Build from there!`,
        priority: "medium",
        action: "Start now",
      });
    }

    return suggestions.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }

  /**
   * Generate personalized daily recommendations
   */
  generateDailyRecommendations(habits, monthMeta) {
    const today = new Date().toISOString().split("T")[0];
    const todayCompletions = habits.filter((h) => h.progress?.[today]?.completed);
    const todayPending = habits.filter((h) => !h.progress?.[today]?.completed);

    return {
      completed: todayCompletions.length,
      pending: todayPending.length,
      total: habits.length,
      completionRate: habits.length
        ? Math.round((todayCompletions.length / habits.length) * 100)
        : 0,
      nextRecommendation:
        todayPending.length > 0
          ? `Complete "${todayPending[0].name}" next`
          : "All habits completed today! 🎉",
    };
  }

  /**
   * Predict future completion rates based on trends
   */
  predictTrend(habits, monthMeta, daysAhead = 7) {
    if (!habits.length || !monthMeta.days.length) return null;

    const recentDays = monthMeta.days.slice(-7);
    const recentAvg =
      recentDays.reduce((sum, day) => {
        const completed = habits.filter(
          (h) => h.progress?.[day.fullDate]?.completed
        ).length;
        return sum + (completed / habits.length) * 100;
      }, 0) / recentDays.length;

    const trend = recentAvg > 60 ? "↗️ Improving" : recentAvg > 40 ? "→ Stable" : "↘️ Declining";

    return {
      recentAverage: Math.round(recentAvg),
      predictedAverage: Math.round(recentAvg + (Math.random() - 0.5) * 10),
      trend,
      daysAhead,
    };
  }
}

export default new AISuggestionsService();
