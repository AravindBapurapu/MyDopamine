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

export default function Dashboard() {
  const { deleteModal, cancelDeleteHabit, confirmDeleteHabit, isSyncing } =
    useContext(HabitContext);
  const { currentUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(true);

  if (showSettings) return <Settings onBack={() => setShowSettings(false)} />;

  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-slate-900 p-4 md:p-6 pb-24">
      <div className="mx-auto max-w-[1800px] space-y-5">

        {/* Top bar */}
        <div className="flex justify-end items-center gap-3">
          {isSyncing && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={13} className="animate-spin" />
              Syncing…
            </div>
          )}
          {/* Toggle AI panel */}
          <button
            onClick={() => setShowAI((p) => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition shadow-sm ${
              showAI
                ? "bg-violet-500 text-white border-violet-500"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50"
            }`}
          >
            <Brain size={14} />
            AI Insights
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <SettingsIcon size={18} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-5"
          >
            {/* Month header + add habit */}
            <HabitControls />

            {/* Report view tabs */}
            <ReportTabs />

            {/* Summary stat cards */}
            <SummaryCards />

            {/* Main habit grid */}
            <HabitGrid />

            {/* Targets vs actual */}
            <TargetsPanel />

            {/* Charts */}
            <AnalyticsChart />

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