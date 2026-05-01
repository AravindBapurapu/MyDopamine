// src/components/NoteModal.jsx
import { useContext, useState, useEffect } from "react";
import { HabitContext } from "../context/HabitContext";
import { X, Zap, Minus, TrendingUp, BookOpen, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PERFORMANCE_OPTIONS = [
  { value: "low", label: "Struggled", icon: Minus, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-700", activeBg: "bg-rose-500" },
  { value: "medium", label: "Moderate", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-700", activeBg: "bg-amber-500" },
  { value: "high", label: "Crushed it", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-700", activeBg: "bg-emerald-500" },
];

export default function NoteModal() {
  const { noteModal, closeNoteModal, saveHabitWithNote, habits } = useContext(HabitContext);
  const [note, setNote] = useState("");
  const [performance, setPerformance] = useState("medium");

  // ✅ Load existing data when editing a previously saved entry
  useEffect(() => {
    if (noteModal.open) {
      const habit = habits.find((h) => h.id === noteModal.habitId);
      const existing = habit?.progress?.[noteModal.date];
      if (existing) {
        setNote(existing.note || "");
        setPerformance(existing.performance || "medium");
      } else {
        setNote("");
        setPerformance("medium");
      }
    }
  }, [noteModal.open, noteModal.habitId, noteModal.date, habits]);

  const handleSave = () => saveHabitWithNote({ note: note.trim(), performance });
  const handleSkip = () => saveHabitWithNote({ note: "", performance: "medium" });

  return (
    <AnimatePresence>
      {noteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNoteModal}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-violet-500" />
                <h2 className="font-semibold text-slate-800 dark:text-white text-base">Daily Reflection</h2>
              </div>
              <button onClick={closeNoteModal} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Note textarea */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Daily Notes
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ran 5km, meditated for 10 minutes…"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900 resize-none transition"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-2">
              <button
                onClick={handleSkip}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Just check ✓
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-violet-500 hover:bg-violet-600 text-white shadow-sm transition"
              >
                Save reflection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}