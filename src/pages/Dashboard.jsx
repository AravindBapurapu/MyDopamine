// src/pages/Dashboard.jsx
import { useState, useContext } from "react";
import { HabitContext } from "../context/HabitContext";
import { useAuth } from "../context/AuthContext";
import HabitControls from "../components/HabitControls";
import ReportTabs from "../components/ReportTabs";
import SummaryCards from "../components/SummaryCards";
import HabitGrid from "../components/HabitGrid";
import AnalyticsChart from "../components/AnalyticsChart";
import AIInsightsPanel from "../components/AIInsightsPanel";
import TargetsPanel from "../components/TargetsPanel";
import FAB from "../components/FAB";
import ConfirmModal from "../components/ConfirmModal";
import NoteModal from "../components/NoteModal";
import Settings from "./Settings";
import { Settings as SettingsIcon, Loader2, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WeeklyProgressChart from "../components/WeeklyProgressChart";
import ProgressChart from "../components/ProgressChart";

export default function Dashboard() {
  // const { deleteModal, cancelDeleteHabit, confirmDeleteHabit, isSyncing } =
  //   useContext(HabitContext);
  const {
    deleteModal,
    cancelDeleteHabit,
    confirmDeleteHabit,
    isSyncing,
    reportView,
    habits,
    monthMeta,
  } = useContext(HabitContext);
  const { currentUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(true);

  if (showSettings) return <Settings onBack={() => setShowSettings(false)} />;

  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-slate-900 p-4 md:p-6 pb-24">
      <div className="mx-auto max-w-[1800px] space-y-5">

        <div className="flex justify-end items-center gap-3">
          {isSyncing && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={13} className="animate-spin" />
              Syncing…
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-5"
          >
            {/* Premium Animated Header */}
            {/* <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center md:text-left pb-2"
            >
              
              <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight inline-block">
                <img src="/logo.png" alt="logo" width="32" height="32" />Discipline Dashboard
              </h1>
            </motion.div> */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center md:text-left pb-2"
            >
              <div className="flex items-center justify-center md:justify-start gap-2">
                <img
                  src="/logo1.png"
                  alt="Discipline Dashboard logo"
                  width={105}
                  height={32}
                  className="shrink-0"
                />

                {/* <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight">
      <u>Dashboard</u>
    </h1> */}
                <motion.div className="relative inline-flex">
                  <motion.h1
                    className="text-2xl md:text-3xl font-extrabold tracking-tight"
                  >
                    {"Dashboard".split("").map((letter, index) => (
                      <motion.span
                        key={index}
                        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"
                        whileHover={{
                          y: -10,
                          scale: 1.2,
                          rotate: index % 2 ? 5 : -5,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 10,
                        }}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </motion.h1>

                  <motion.div
                    className="absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  />
                </motion.div>

              </div>
            </motion.div>

            {/* Month header + add habit */}
            <HabitControls
              showAI={showAI}
              setShowAI={setShowAI}
              setShowSettings={setShowSettings}
            />

            {/* Charts at top */}
            <AnalyticsChart />


            {/* Main habit grid */}
            <HabitGrid />

            {/* Report view tabs and Weekly/Monthly/Yearly reports - MOVED BELOW */}
            <ReportTabs />
{/* {reportView === "monthly" && (
  <ProgressChart
    habits={habits}
    days={monthMeta.days}
  />
)}

{reportView === "weekly" && (
  <WeeklyProgressChart
    habits={habits}
    weeks={monthMeta.weeks}
  />
)} */}
{/* {reportView === "yearly" && (
  <YearlyProgressChart
    monthsData={monthsData}
    year={year}
  />
)} */}

            {/* Summary stat cards */}
            <SummaryCards />

            {/* Targets vs actual
            <TargetsPanel /> */}

            {/* AI Insights Panel — toggle-able */}
            <AnimatePresence>
              {showAI && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                >
                  <AIInsightsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Modals */}
        <NoteModal />
        <ConfirmModal
          open={deleteModal.open}
          title="Delete habit?"
          message={`Are you sure you want to remove "${deleteModal.habitName}"? This action cannot be undone.`}
          onCancel={cancelDeleteHabit}
          onConfirm={confirmDeleteHabit}
        />
      </div>

      {/* ✅ Floating Action Button */}
      <FAB />
    </div>
  );
}