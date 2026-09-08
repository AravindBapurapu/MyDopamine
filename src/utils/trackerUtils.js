// src/utils/trackerUtils.js
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isoWeek);
dayjs.extend(isBetween);

export const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ─── Month Meta ───────────────────────────────────────────────────────────
   Returns { days: [...], weeks: [...] } for a given month/year.
   Each day: { dayNumber, fullDate, shortDay, weekIndex }
   Each week: { label, days: [...] }
*/
export function getMonthMeta(monthName, year) {
  const monthIndex = monthNames.indexOf(monthName);
  const monthStart = dayjs(`${year}-${monthIndex + 1}-01`);
  const daysInMonth = monthStart.daysInMonth();
  const startWeekday = monthStart.day();

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const fullDate = dayjs(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`).format("YYYY-MM-DD");
    const weekIndex = Math.floor((d - 1 + startWeekday) / 7);
    days.push({
      dayNumber: d,
      fullDate,
      shortDay: dayjs(fullDate).format("ddd"),
      weekIndex,
    });
  }

  const weeksMap = {};
  days.forEach((day) => {
    const wi = day.weekIndex;
    if (!weeksMap[wi]) weeksMap[wi] = [];
    weeksMap[wi].push(day);
  });

  const weeks = Object.entries(weeksMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([wi, wDays]) => ({
      label: `Week ${Number(wi) + 1}`,
      days: wDays,
    }));

  return { days, weeks };
}

/* ─── Overall Stats ─────────────────────────────────────────────────────── */
export function calculateOverallStats(habits, days) {
  if (!habits.length || !days.length) {
    return { percent: 0, totalDone: 0, totalNotDone: 0, totalPossible: 0 };
  }
  let totalDone = 0;
  const totalPossible = habits.length * days.length;
  habits.forEach((habit) => {
    days.forEach((day) => {
      if (habit.progress?.[day.fullDate]?.completed) totalDone++;
    });
  });
  const totalNotDone = totalPossible - totalDone;
  const percent = totalPossible ? Math.round((totalDone / totalPossible) * 100) : 0;
  return { percent, totalDone, totalNotDone, totalPossible };
}

/* ─── Per-Habit Stats ───────────────────────────────────────────────────── */
export function calculateHabitStats(habit, days) {
  const total = days.length;
  const done = days.filter((d) => habit.progress?.[d.fullDate]?.completed).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

/* ─── Monthly Line Data ─────────────────────────────────────────────────── */
export function getMonthlyLineData(habits, days) {
  return days.map((day) => {
    const done = habits.filter((h) => h.progress?.[day.fullDate]?.completed).length;
    const percent = habits.length ? Math.round((done / habits.length) * 100) : 0;
    return { day: day.dayNumber, percent, done, total: habits.length };
  });
}

/* ─── Weekly Report ─────────────────────────────────────────────────────── */
export function getWeeklyReport(habits, weeks) {
  return weeks.map((week) => {
    const total = habits.length * week.days.length;
    const done = habits.reduce((sum, habit) => {
      return sum + week.days.filter((d) => habit.progress?.[d.fullDate]?.completed).length;
    }, 0);
    const notDone = total - done;
    const percent = total ? Math.round((done / total) * 100) : 0;
    return { name: week.label, done, notDone, total, percent };
  });
}

export function getCurrentISOWeekProgress(habits, days, referenceDate = dayjs()) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeDays = Array.isArray(days) ? days.filter((day) => day && day.fullDate) : [];

  if (!safeDays.length || !safeHabits.length) {
    return { name: "Current week", done: 0, total: 0, percent: 0, weekDays: [] };
  }

  const weekDays = safeDays;
  const total = safeHabits.length * weekDays.length;
  const done = safeHabits.reduce((sum, habit) => {
    return sum + weekDays.filter((day) => habit.progress?.[day.fullDate]?.completed).length;
  }, 0);

  const labelSource = dayjs(referenceDate);

  return {
    name: labelSource.isValid() ? `Week ${labelSource.isoWeek()}` : "Current week",
    done,
    total: Math.max(total, 0),
    percent: total ? Math.round((done / total) * 100) : 0,
    weekDays,
  };
}

/* ─── Yearly Report ─────────────────────────────────────────────────────── */
export function getYearlyReport(monthsData, year) {
  return monthNames.map((month, i) => {
    const key = `${year}-${month}`;
    const habits = monthsData[key] || [];
    const daysInMonth = dayjs(`${year}-${i + 1}-01`).daysInMonth();
    let done = 0, total = 0;
    habits.forEach((habit) => {
      for (let d = 1; d <= daysInMonth; d++) {
        const fullDate = dayjs(`${year}-${String(i + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`).format("YYYY-MM-DD");
        total++;
        if (habit.progress?.[fullDate]?.completed) done++;
      }
    });
    const percent = total ? Math.round((done / total) * 100) : 0;
    return { name: month.slice(0, 3), percent, done, total };
  });
}