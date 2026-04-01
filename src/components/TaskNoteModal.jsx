import { useContext, useState, useEffect } from "react";
import { HabitContext } from "../context/HabitContext";

export default function TaskNoteModal() {
  const { noteModal, saveHabitWithNote, closeNoteModal, habits } = useContext(HabitContext);
  
  const [note, setNote] = useState("");
  const [performance, setPerformance] = useState("medium");
  const [loading, setLoading] = useState(false);

  // Load existing note if editing
  useEffect(() => {
    if (noteModal.open && noteModal.habitId && noteModal.date) {
      const habit = habits.find(h => h.id === noteModal.habitId);
      const existingData = habit?.progress?.[noteModal.date];
      if (existingData) {
        setNote(existingData.note || "");
        setPerformance(existingData.performance || "medium");
      } else {
        setNote("");
        setPerformance("medium");
      }
    }
  }, [noteModal.open, noteModal.habitId, noteModal.date, habits]);

  if (!noteModal.open) return null;

  const handleSave = async () => {
    setLoading(true);
    await saveHabitWithNote({
      note: note.trim(),
      performance: performance,
    });
    setLoading(false);
  };

  const getPerformanceColor = (value) => {
    if (value === "high") return "bg-green-100 border-green-400 text-green-700";
    if (value === "medium") return "bg-yellow-100 border-yellow-400 text-yellow-700";
    return "bg-red-100 border-red-400 text-red-700";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Task Reflection
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          How did you do on this task?
        </p>

        <div className="space-y-4">
          {/* Performance Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Performance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "low", label: "😟 Low", color: "bg-red-100 text-red-700" },
                { value: "medium", label: "😐 Medium", color: "bg-yellow-100 text-yellow-700" },
                { value: "high", label: "😊 High", color: "bg-green-100 text-green-700" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPerformance(option.value)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    performance === option.value
                      ? `${option.color} ring-2 ring-offset-2 ring-${option.value === 'high' ? 'green' : option.value === 'medium' ? 'yellow' : 'red'}-400`
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What did you do today?
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your reflections here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={closeNoteModal}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:from-violet-600 hover:to-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}