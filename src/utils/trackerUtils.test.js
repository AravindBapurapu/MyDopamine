import test from "node:test";
import assert from "node:assert/strict";

import { getMonthMeta, getWeeklyReport, getSelectedWeekReport } from "./trackerUtils.js";

test("selected week report reflects the chosen week and keeps all weeks in the month live", () => {
  const habits = [
    {
      id: "habit-1",
      name: "Read",
      progress: {
        "2025-03-01": { completed: true },
        "2025-03-02": { completed: true },
        "2025-03-08": { completed: true },
        "2025-03-10": { completed: true },
        "2025-03-15": { completed: true },
      },
    },
    {
      id: "habit-2",
      name: "Workout",
      progress: {
        "2025-03-01": { completed: true },
        "2025-03-03": { completed: true },
        "2025-03-09": { completed: true },
      },
    },
  ];

  const monthMeta = getMonthMeta("March", 2025);
  assert.ok(monthMeta.weeks.length > 1, "month should have more than one week");

  const allWeeks = getWeeklyReport(habits, monthMeta.weeks);
  assert.equal(allWeeks.length, monthMeta.weeks.length, "all weeks should be included in the report");
  assert.ok(allWeeks.every((week) => Number.isFinite(week.percent)), "every week should have a valid percentage");

  const selectedWeek = getSelectedWeekReport(habits, monthMeta.weeks, 1);
  assert.equal(selectedWeek.name, monthMeta.weeks[1].label, "selected week should align with the chosen week index");
  assert.equal(selectedWeek.total, monthMeta.weeks[1].days.length * habits.length, "selected week total should match the chosen week size");
  assert.ok(selectedWeek.percent >= 0 && selectedWeek.percent <= 100, "selected week percentage should stay in range");
});
