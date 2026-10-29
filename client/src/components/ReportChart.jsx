import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { formatDateDisplay } from "../utils/dateUtils";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-rose-100 rounded-xl shadow-lg text-xs space-y-1">
        <p className="font-semibold text-slate-800">{formatDateDisplay(data.readingDate)}</p>
        <p className="text-slate-500">
          Slot: <span className="font-medium text-slate-700">{data.timeSlotLabel || data.timeSlot}</span>
        </p>
        <p className="text-rose-600 font-bold text-sm">
          {data.glucoseValue} <span className="text-xs font-normal text-slate-400">mg/dL</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportChart({
  readings = [],
  title = "Glucose Trend (mg/dL)",
}) {
  if (!readings || readings.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-sm">
        <p className="text-sm text-slate-400">No chart data available for this range.</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = readings.map((r) => ({
    ...r,
    formattedDate: r.readingDate ? r.readingDate.slice(5) : "", // MM-DD
  }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" />
            Reading
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-0.5 bg-emerald-400 mr-1.5" />
            Target (70–140)
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              stroke="#cbd5e1"
            />
            <YAxis
              domain={[40, "auto"]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              stroke="#cbd5e1"
              unit=" "
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Target glucose reference lines */}
            <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" opacity={0.6} />
            <ReferenceLine y={140} stroke="#10b981" strokeDasharray="3 3" opacity={0.6} />
            <Line
              type="monotone"
              dataKey="glucoseValue"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#e11d48", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
