import { useContext, useState } from "react";
import { HabitContext } from "../context/HabitContext";
import DayCheckbox from "./DayCheckbox";

export default function HabitList() {
  const { habits, addHabit, monthMeta } = useContext(HabitContext);

  const [input, setInput] = useState("");

  // ✅ dynamic days based on month
  const days = Array.from({ length: monthMeta.days }, (_, i) => i + 1);

  return (
    <div>
      {/* ✅ Add Habit Input */}
      <input
        type="text"
        placeholder="Add new habit..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // 🔥 important
    if (input.trim()) {
      addHabit(input);
      setInput("");
    }
  }
}}
      />

      {/* ✅ Habit List */}
      {habits.map((habit) => (
        <div key={habit.id}>
          <h3>{habit.name}</h3>

          <div style={{ display: "flex", gap: "5px" }}>
            {days.map((day) => (
              <DayCheckbox
                key={day}
                habitId={habit.id}
                day={day}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

