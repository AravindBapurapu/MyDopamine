// src/utils/dateUtils.js
import dayjs from "dayjs";

export const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// Returns short day name: "Mon", "Tue", etc.
export const getShortDay = (dateStr) => {
  return dayjs(dateStr).format("ddd");
};

// Returns full date string: "2024-01-15"
export const getFullDate = (year, month, day) => {
  return dayjs(`${year}-${String(monthNames.indexOf(month) + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`).format("YYYY-MM-DD");
};

// Returns number of days in a month
export const getDaysInMonth = (month, year) => {
  return dayjs(`${year}-${String(monthNames.indexOf(month) + 1).padStart(2,"0")}-01`).daysInMonth();
};

// Returns today's date as "YYYY-MM-DD"
export const getToday = () => dayjs().format("YYYY-MM-DD");

// Returns the week number (1-indexed) for a date
export const getWeekOfMonth = (dateStr) => {
  const d = dayjs(dateStr);
  const startOfMonth = d.startOf("month");
  return Math.ceil((d.date() + startOfMonth.day()) / 7);
};