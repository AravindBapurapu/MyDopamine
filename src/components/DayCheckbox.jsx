

// import { useContext } from "react";
// import { HabitContext } from "../context/HabitContext";
// import toast from "react-hot-toast";

// export default function DayCheckbox({ habitId, day }) {
//   const { habits, toggleHabit, openNoteModal } = useContext(HabitContext);

//   const habit = habits.find((h) => h.id === habitId);
//   if (!habit) return null;

//   // ✅ correct structure
//   const dayData = habit.days?.[day];
//   const checked = habit.progress?.[day]?.completed || false;

//   const handleChange = () => {
//     // prevent clicking again if already filled
//   if (checked) return;

//   openNoteModal(habitId, day);

//   const getColor = () => {
//   if (!dayData) return "bg-gray-300";

//   switch (dayData.performance) {
//     case "low":
//       return "bg-red-400";
//     case "medium":
//       return "bg-yellow-400";
//     case "high":
//       return "bg-green-500";
//     default:
//       return "bg-blue-400";
//   }
// };
//   return (
//     <div
//   onClick={handleChange}
//   className={`w-5 h-5 rounded cursor-pointer ${getColor()}`}
// />
//   );
// }
// }



import { useContext } from "react";
import { HabitContext } from "../context/HabitContext";

export default function DayCheckbox({ habitId, day, fullDate }) {
  const { habits, toggleHabit, openNoteModal } = useContext(HabitContext);

  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return null;

  // Get the progress data for this specific day
  const dayProgress = habit.progress?.[fullDate];
  const checked = dayProgress?.completed || false;
  const hasNote = dayProgress?.note || dayProgress?.performance;

  const getColor = () => {
    if (!dayProgress) return "bg-gray-200 dark:bg-gray-700";
    if (dayProgress.performance === "low") return "bg-red-400";
    if (dayProgress.performance === "medium") return "bg-yellow-400";
    if (dayProgress.performance === "high") return "bg-green-500";
    if (checked) return "bg-emerald-500";
    return "bg-gray-200 dark:bg-gray-700";
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    // If already completed with note, toggle directly
    if (checked) {
      toggleHabit(habitId, fullDate);
    } else {
      // Open modal for adding note
      openNoteModal(habitId, fullDate);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-8 h-8 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 ${getColor()}`}
      title={hasNote ? "Has note - click to edit" : "Click to add note"}
    >
      {checked && (
        <svg className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {hasNote && !checked && (
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
}