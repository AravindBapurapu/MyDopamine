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

export const HabitContext = createContext();
export const useHabits = () => useContext(HabitContext);

const currentMonth = monthNames[dayjs().month()];
const currentYear = dayjs().year();

const defaultData = {
  selectedMonth: currentMonth,
  selectedYear: currentYear,
  chartType: "line",
  reportView: "monthly",
  monthsData: {},
};

export const HabitProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [trackerData, setTrackerData] = useState(defaultData);
  const [weekIndex, setWeekIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

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
  const habits = monthsData[monthKey] || [];

  // ── LOAD DATA ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        const result = await firebaseService.loadHabits(currentUser.uid, monthKey);
        if (result.success && result.data) {
          setTrackerData((prev) => ({
            ...prev,
            monthsData: { ...prev.monthsData, [monthKey]: result.data },
          }));
        } else if (!monthsData[monthKey]) {
          setTrackerData((prev) => ({
            ...prev,
            monthsData: { ...prev.monthsData, [monthKey]: [] },
          }));
        }
      } else {
        const saved = localStorage.getItem("discipline_tracker_guest");
        if (saved) setTrackerData(JSON.parse(saved));
      }
    };
    loadData();
  }, [currentUser, selectedMonth, selectedYear]);

  // ── SAVE DATA ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saveData = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setIsSyncing(true);

      if (currentUser) {
        const h = trackerData.monthsData[monthKey] || [];
        const result = await firebaseService.saveHabits(currentUser.uid, monthKey, h);
        if (!result.success) toast.error("Failed to sync data");
      } else {
        localStorage.setItem("discipline_tracker_guest", JSON.stringify(trackerData));
      }

      syncingRef.current = false;
      setIsSyncing(false);
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
  const addHabit = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newHabit = {
      id: crypto.randomUUID(),
      name: trimmed,
      progress: {},
      createdAt: new Date().toISOString(),
      color: `hsl(${Math.random() * 360}, 65%, 55%)`,
    };
    setTrackerData((prev) => ({
      ...prev,
      monthsData: {
        ...prev.monthsData,
        [monthKey]: [...(prev.monthsData[monthKey] || []), newHabit],
      },
    }));
    toast.success("Habit added!");
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

  // FIX #2: clicking checkbox opens note modal; unchecking works directly
  const handleCheckboxClick = (habitId, fullDate) => {
    const habit = (monthsData[monthKey] || []).find((h) => h.id === habitId);
    if (!habit) return;
    const current = habit.progress?.[fullDate]?.completed || false;
    if (current) {
      // Uncheck → remove entry
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
      // Check → open note modal
      openNoteModal(habitId, fullDate);
    }
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
  const confirmDeleteHabit = () => {
    setTrackerData((prev) => ({
      ...prev,
      monthsData: {
        ...prev.monthsData,
        [monthKey]: (prev.monthsData[monthKey] || []).filter((h) => h.id !== deleteModal.habitId),
      },
    }));
    toast.success("Habit deleted");
    cancelDeleteHabit();
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
        askDeleteHabit,
        cancelDeleteHabit,
        confirmDeleteHabit,
        createFreshMonth,
        importPreviousMonth,
        openNoteModal,
        closeNoteModal,
        saveHabitWithNote,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};