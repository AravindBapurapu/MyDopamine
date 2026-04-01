// src/components/FAB.jsx
import { useState, useContext } from "react";
import { HabitContext } from "../context/HabitContext";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAB() {
  const { addHabit } = useContext(HabitContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addHabit(name);
    setName("");
    setOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Input popup above FAB */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-72"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Add New Habit
            </p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. Morning run, Read 30 min..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="flex-1 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold transition disabled:opacity-40"
              >
                Add Habit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-200 dark:shadow-violet-900/40 flex items-center justify-center transition-all"
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus size={24} />
        </motion.div>
      </motion.button>
    </>
  );
}