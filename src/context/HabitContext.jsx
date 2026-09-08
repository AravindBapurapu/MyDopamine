import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useContext,
  useRef,
} from "react";
import {
  calculateOverallStats,
  getMonthMeta,
  getMonthlyLineData,
  getWeeklyReport,
  getYearlyReport,
  monthNames,
} from "../utils/trackerUtils";
import dayjs from "dayjs";
import firebaseService from "../services/firebaseService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const currentMonth = monthNames[dayjs().month()];
const currentYear = dayjs().year();

const defaultData = {
  selectedMonth: currentMonth,
  selectedYear: currentYear,
  chartType: "line",
  reportView: "monthly",
  monthsData: {},
};

const defaultHabitContext = {
  deleteModal: { open: false, habitId: null, habitName: "" },
  cancelDeleteHabit: () => {},
  confirmDeleteHabit: () => {},
  isSyncing: false,
  trackerData: defaultData,
  setMonth: () => {},
  setYear: () => {},
  setChartType: () => {},
  setReportView: () => {},
  addHabit: () => null,
  toggleHabitCompletion: () => false,
  openNoteModal: () => {},
  closeNoteModal: () => {},
  saveHabitWithNote: () => {},
  habits: [],
  monthMeta: { days: [], weeks: [] },
  overallStats: { percent: 0, totalDone: 0, totalNotDone: 0, totalPossible: 0 },
  weeklyReport: [],
  monthlyLineData: [],
  yearlyReport: [],
};

export const HabitContext = createContext(defaultHabitContext);
export const useHabits = () => useContext(HabitContext);

export const HabitProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [trackerData, setTrackerData] = useState(defaultData);
  const [weekIndex, setWeekIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  const resolveMonthHabits = (monthData = {}, key = monthKey) =>
    Array.isArray(monthData?.[key]) ? monthData[key] : [];

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    habitId: null,
    habitName: "",
  });

  // noteModal stores { open, habitId, date } for the pop-up
  const [noteModal, setNoteModal] = useState({
    open: false,
    habitId: null,
    date: null,
  });

  const { selectedMonth, selectedYear, chartType, reportView, monthsData } = trackerData;
  const monthKey = `${selectedYear}-${selectedMonth}`;
  const habits = Array.isArray(monthsData?.[monthKey]) ? monthsData[monthKey] : [];

  // ── LOAD DATA ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        const result = await firebaseService.loadHabits(currentUser.uid, monthKey);
        const normalized = Array.isArray(result?.data)
          ? result.data.filter((habit, index, array) => {
              const key = String(habit?.name || "").trim().toLowerCase();
              return key && array.findIndex((entry) => String(entry?.name || "").trim().toLowerCase() === key) === index;
            })
          : [];

        if (result.success && result.data) {
          setTrackerData((prev) => ({
            ...prev,
            monthsData: { ...prev.monthsData, [monthKey]: normalized },
          }));
        } else if (!monthsData[monthKey]) {
          setTrackerData((prev) => ({
            ...prev,
            monthsData: { ...prev.monthsData, [monthKey]: [] },
          }));
        }
      } else {
        const saved = localStorage.getItem("discipline_tracker_guest");
        if (saved) {
          const parsed = JSON.parse(saved);
          const normalizedMonths = Object.fromEntries(
            Object.entries(parsed.monthsData || {}).map(([key, value]) => [
              key,
              Array.isArray(value)
                ? value.filter((habit, index, array) => {
                    const name = String(habit?.name || "").trim().toLowerCase();
                    return name && array.findIndex((entry) => String(entry?.name || "").trim().toLowerCase() === name) === index;
                  })
                : [],
            ])
          );
          setTrackerData({ ...parsed, monthsData: normalizedMonths });
        }
      }
    };
    loadData();
  }, [currentUser, selectedMonth, selectedYear]);

  // ── SAVE DATA ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saveData = async () => {
      if (syncingRef.current || !trackerData?.monthsData) return;
      syncingRef.current = true;
      setIsSyncing(true);

      try {
        if (currentUser?.uid) {
          const h = Array.isArray(trackerData.monthsData[monthKey])
            ? trackerData.monthsData[monthKey].filter(Boolean).map((habit) => ({
                ...habit,
                progress: habit?.progress || {},
              }))
            : [];

          const result = await firebaseService.saveHabits(currentUser.uid, monthKey, h);
          if (!result.success) {
            toast.error(result.offline ? "Sync failed — saved locally" : "Failed to sync data");
          }
        } else {
          localStorage.setItem("discipline_tracker_guest", JSON.stringify(trackerData));
        }
      } finally {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    };

    const timeout = setTimeout(saveData, 800);
    return () => clearTimeout(timeout);
  }, [trackerData.monthsData, currentUser, monthKey]);

  // ── MEMOS ──────────────────────────────────────────────────────────────────
  const monthMeta = useMemo(() => getMonthMeta(selectedMonth, selectedYear), [selectedMonth, selectedYear]);
  const overallStats = useMemo(() => calculateOverallStats(habits, monthMeta.days), [habits, monthMeta.days]);
  const weeklyReport = useMemo(() => getWeeklyReport(habits, monthMeta.weeks), [habits, monthMeta.weeks]);
  const monthlyLineData = useMemo(() => getMonthlyLineData(habits, monthMeta.days), [habits, monthMeta.days]);
  const yearlyReport = useMemo(() => getYearlyReport(monthsData, selectedYear), [monthsData, selectedYear]);

  // ── SETTERS ────────────────────────────────────────────────────────────────
  const setMonth = (m) => setTrackerData((p) => ({ ...p, selectedMonth: m }));
  const setYear = (y) => setTrackerData((p) => ({ ...p, selectedYear: y }));
  const setChartType = (t) => setTrackerData((p) => ({ ...p, chartType: t }));
  const setReportView = (v) => setTrackerData((p) => ({ ...p, reportView: v }));

  // ── HABITS ─────────────────────────────────────────────────────────────────
  const addHabit = (nameOrConfig, options = {}) => {
    const input = typeof nameOrConfig === "string" ? { title: nameOrConfig, ...options } : (nameOrConfig || {});
    const trimmed = (input.title || "").trim();
    if (!trimmed) return;

    const normalizedName = trimmed.toLowerCase();
    const currentMonthHabits = Array.isArray(monthsData?.[monthKey]) ? monthsData[monthKey] : [];
    const alreadyExists = currentMonthHabits.some((habit) => String(habit?.name || "").trim().toLowerCase() === normalizedName);

    if (alreadyExists) {
      toast.error("Habit already exists this month");
      return null;
    }

    const newHabit = {
      id: crypto.randomUUID(),
      name: trimmed,
      icon: input.icon || "✨",
      category: input.category || "general",
      progress: {},
      createdAt: new Date().toISOString(),
      color: input.color || `hsl(${Math.random() * 360}, 65%, 55%)`,
    };

    setTrackerData((prev) => {
      const nextMonthHabits = Array.isArray(prev.monthsData?.[monthKey]) ? prev.monthsData[monthKey] : [];
      return {
        ...prev,
        monthsData: {
          ...(prev.monthsData || {}),
          [monthKey]: [...nextMonthHabits, newHabit],
        },
      };
    });

    toast.success("Habit added!");
    return newHabit;
  };

  // FIX #1: toggle properly (check ↔ uncheck)
  const toggleHabit = (habitId, fullDate) => {
    setTrackerData((prev) => ({
      ...prev,
      monthsData: {
        ...prev.monthsData,
        [monthKey]: (prev.monthsData[monthKey] || []).map((habit) => {
          if (habit.id !== habitId) return habit;
          const current = habit.progress?.[fullDate]?.completed || false;
          if (current) {
            // UNCHECK: remove the progress entry
            const newProgress = { ...habit.progress };
            delete newProgress[fullDate];
            return { ...habit, progress: newProgress };
          }
          // CHECK: open note modal instead of directly toggling
          return habit;
        }),
      },
    }));
  };

  // Simple checkbox toggle without notes
  const handleCheckboxClick = (habitId, fullDate) => {
    const habit = (monthsData[monthKey] || []).find((h) => h.id === habitId);
    if (!habit) return;
    const current = habit.progress?.[fullDate]?.completed || false;

    if (current) {
      setTrackerData((prev) => ({
        ...prev,
        monthsData: {
          ...prev.monthsData,
          [monthKey]: (prev.monthsData[monthKey] || []).map((h) => {
            if (h.id !== habitId) return h;
            const newProgress = { ...h.progress };
            delete newProgress[fullDate];
            return { ...h, progress: newProgress };
          }),
        },
      }));
    } else {
      setTrackerData((prev) => ({
        ...prev,
        monthsData: {
          ...prev.monthsData,
          [monthKey]: (prev.monthsData[monthKey] || []).map((h) => {
            if (h.id !== habitId) return h;
            return {
              ...h,
              progress: {
                ...h.progress,
                [fullDate]: { completed: true },
              },
            };
          }),
        },
      }));
    }
    return !current;
  };

  const toggleHabitCompletion = ({ habitId, date }) => {
    if (!habitId || !date) return false;
    return handleCheckboxClick(habitId, date);
  };

  // ── NOTE MODAL ─────────────────────────────────────────────────────────────
  const openNoteModal = (habitId, date) => setNoteModal({ open: true, habitId, date });

  const closeNoteModal = () => setNoteModal({ open: false, habitId: null, date: null });

  const saveHabitWithNote = ({ note, performance }) => {
    const { habitId, date } = noteModal;
    setTrackerData((prev) => ({
      ...prev,
      monthsData: {
        ...prev.monthsData,
        [monthKey]: (prev.monthsData[monthKey] || []).map((habit) => {
          if (habit.id !== habitId) return habit;
          return {
            ...habit,
            progress: {
              ...habit.progress,
              [date]: { completed: true, note, performance },
            },
          };
        }),
      },
    }));
    closeNoteModal();
    toast.success("Progress saved!");
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const askDeleteHabit = (habitId, habitName) => setDeleteModal({ open: true, habitId, habitName });
  const cancelDeleteHabit = () => setDeleteModal({ open: false, habitId: null, habitName: "" });
  const deleteHabit = ({ habitId }) => {
    if (!habitId) return;
    setTrackerData((prev) => ({
      ...prev,
      monthsData: {
        ...prev.monthsData,
        [monthKey]: (prev.monthsData[monthKey] || []).filter((h) => h.id !== habitId),
      },
    }));
    toast.success("Habit deleted");
    return true;
  };

  const confirmDeleteHabit = () => {
    const deleted = deleteHabit({ habitId: deleteModal.habitId });
    cancelDeleteHabit();
    if (deleted) toast.success("Habit deleted");
  };

  // ── MONTH ACTIONS ──────────────────────────────────────────────────────────
  const createFreshMonth = () => {
    const next = dayjs(`${selectedYear}-${monthNames.indexOf(selectedMonth) + 1}-01`).add(1, "month");
    setTrackerData((prev) => ({
      ...prev,
      selectedMonth: monthNames[next.month()],
      selectedYear: next.year(),
    }));
    toast.success("New month started");
  };

  const importPreviousMonth = () => {
    const prev = dayjs(`${selectedYear}-${monthNames.indexOf(selectedMonth) + 1}-01`).subtract(1, "month");
    const prevKey = `${prev.year()}-${monthNames[prev.month()]}`;
    const prevHabits = monthsData[prevKey];
    if (!prevHabits?.length) { toast.error("No previous habits found"); return; }
    const newHabits = prevHabits.map((h) => ({ ...h, id: crypto.randomUUID(), progress: {} }));
    setTrackerData((prev) => ({
      ...prev,
      monthsData: { ...prev.monthsData, [monthKey]: newHabits },
    }));
    toast.success("Imported previous habits!");
  };

  const cloneHabitsToNextMonth = ({ sourceMonth, targetMonth } = {}) => {
    const sourceKey = sourceMonth || monthKey;
    const activeHabits = resolveMonthHabits(monthsData, sourceKey);
    if (!activeHabits.length) {
      toast.error("No habits available to clone.");
      return false;
    }

    const targetDate = targetMonth ? dayjs(`${selectedYear}-${monthNames.indexOf(selectedMonth) + 1}-01`).add(1, "month") : dayjs(`${selectedYear}-${monthNames.indexOf(selectedMonth) + 1}-01`).add(1, "month");
    const next = targetMonth ? dayjs(`${selectedYear}-${monthNames.indexOf(selectedMonth) + 1}-01`).add(1, "month") : dayjs(`${selectedYear}-${monthNames.indexOf(selectedMonth) + 1}-01`).add(1, "month");
    const nextMonth = monthNames[next.month()];
    const nextYear = next.year();
    const nextKey = `${nextYear}-${nextMonth}`;

    const clonedHabits = activeHabits.map((habit) => ({
      ...habit,
      id: crypto.randomUUID(),
      progress: {},
      createdAt: new Date().toISOString(),
    }));

    setTrackerData((prev) => ({
      ...prev,
      selectedMonth: nextMonth,
      selectedYear: nextYear,
      monthsData: {
        ...prev.monthsData,
        [nextKey]: clonedHabits,
      },
    }));

    toast.success(`Cloned ${activeHabits.length} habits to ${nextMonth} ${nextYear}`);
    return true;
  };

  const editHabit = ({ habitId, newTitle }) => {
    if (!habitId || !newTitle) return false;
    const trimmed = newTitle.trim();
    if (!trimmed) return false;

    setTrackerData((prev) => ({
      ...prev,
      monthsData: {
        ...prev.monthsData,
        [monthKey]: (prev.monthsData[monthKey] || []).map((habit) =>
          habit.id === habitId ? { ...habit, name: trimmed } : habit
        ),
      },
    }));
    toast.success("Habit updated");
    return true;
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        monthMeta,
        selectedMonth,
        selectedYear,
        monthNames,
        chartType,
        reportView,
        overallStats,
        weeklyReport,
        monthlyLineData,
        yearlyReport,
        monthsData,
        deleteModal,
        noteModal,
        weekIndex,
        isSyncing,
        setWeekIndex,
        setMonth,
        setYear,
        setChartType,
        setReportView,
        addHabit,
        handleCheckboxClick,
        toggleHabitCompletion,
        editHabit,
        deleteHabit,
        askDeleteHabit,
        cancelDeleteHabit,
        confirmDeleteHabit,
        createFreshMonth,
        importPreviousMonth,
        cloneHabitsToNextMonth,
        openNoteModal,
        closeNoteModal,
        saveHabitWithNote,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};