import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { getWeeklyReport } from "../utils/trackerUtils";

export default function WeeklyProgressChart({
  habits = [],
  weeks = [],
}) {
  const data = getWeeklyReport(habits, weeks);

  return (
    <div className="bg-gray-900 p-4 rounded-lg w-full">
      <h2 className="text-white text-lg font-semibold mb-4">
        Weekly Progress
      </h2>

      {data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No weekly data available
        </div>
      ) : (
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />

              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
              />

              <YAxis
                domain={[0, 100]}
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  `${value}%`,
                  "Progress",
                ]}
              />

              <Line
                type="monotone"
                dataKey="percent"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}