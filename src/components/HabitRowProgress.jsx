export default function HabitRowProgress({ percent, color = "#8b5cf6" }) {
  // Convert percent to stroke-dasharray values for SVG circle
  // Circle circumference for r=15.5 is 2*π*15.5 ≈ 97.4
  const circumference = 97.4;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-9 h-9">
        <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
          {/* Track */}
          <circle
            cx="18" cy="18" r="15.5"
            fill="none"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-700"
            strokeWidth="3.5"
          />
          {/* Progress */}
          <circle
            cx="18" cy="18" r="15.5"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
          style={{ color }}
        >
          {percent}
        </div>
      </div>
    </div>
  );
}