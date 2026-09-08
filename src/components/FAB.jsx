// src/components/FAB.jsx
import { useState, useContext, useEffect } from "react";
import { HabitContext } from "../context/HabitContext";
import { motion, AnimatePresence } from "framer-motion";

export default function FAB() {
  const { addHabit } = useContext(HabitContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (!transcript) return;
      const lower = transcript.toLowerCase();
      if (/(hey\s*j|^j$|jarvis)/i.test(lower)) {
        setOpen(true);
        const utterance = new SpeechSynthesisUtterance("J.A.R.V.I.S. online, sir.");
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, []);

  const handleAdd = () => {
    if (!name.trim()) return;
    addHabit(name);
    const utterance = new SpeechSynthesisUtterance("Habit added, sir.");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setName("");
    setOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setOpen(false);
  };

  const handleCoreClick = () => {
    setOpen((p) => !p);
    const utterance = new SpeechSynthesisUtterance(open ? "Standing by." : "At your command, sir.");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-4 shadow-[0_0_35px_rgba(6,182,212,0.18)] backdrop-blur-xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Add New Habit</p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKey}
              aria-label="New habit name"
              placeholder="e.g. Morning run, Read 30 min..."
              className="w-full rounded-xl border border-cyan-400/20 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-40"
              >
                Add Habit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleCoreClick}
        aria-label="Open JARVIS habit assistant"
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-slate-950/80 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all"
      >
        <span className={`absolute inset-0 rounded-full ${listening ? "animate-ping bg-cyan-400/20" : "bg-cyan-400/10"}`} />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.4),_rgba(14,165,233,0.1),_transparent_65%)] ring-2 ring-cyan-300/60">
          <span className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </span>
      </motion.button>
    </>
  );
}