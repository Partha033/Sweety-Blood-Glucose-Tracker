import React from "react";
import { TrendingUp, TrendingDown, Divide, Activity } from "lucide-react";

export default function ReportSummary({ statistics, title }) {
  const { highest, lowest, average, count } = statistics || {
    highest: null,
    lowest: null,
    average: null,
    count: 0,
  };

  const cards = [
    {
      label: "Highest Reading",
      value: highest !== null && highest !== undefined ? `${highest} mg/dL` : "--",
      icon: TrendingUp,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      description: highest !== null ? "Peak recorded level" : "No readings recorded",
    },
    {
      label: "Lowest Reading",
      value: lowest !== null && lowest !== undefined ? `${lowest} mg/dL` : "--",
      icon: TrendingDown,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      description: lowest !== null ? "Minimum recorded level" : "No readings recorded",
    },
    {
      label: "Average Reading",
      value: average !== null && average !== undefined ? `${average} mg/dL` : "--",
      icon: Divide,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      description: average !== null ? "Mean glucose value" : "No readings recorded",
    },
    {
      label: "Total Readings",
      value: count !== undefined ? String(count) : "0",
      icon: Activity,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100",
      description: `${count} log${count === 1 ? "" : "s"} in this period`,
    },
  ];

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 bg-white rounded-2xl border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-slate-400">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
