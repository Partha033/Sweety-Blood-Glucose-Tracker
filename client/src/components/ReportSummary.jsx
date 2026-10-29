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
      color: "text-[#a65d45]",
      bgColor: "bg-[#f4e7df]",
      borderColor: "border-[#e4e0d5]",
      description: highest !== null ? "Peak recorded level" : "No readings recorded",
    },
    {
      label: "Lowest Reading",
      value: lowest !== null && lowest !== undefined ? `${lowest} mg/dL` : "--",
      icon: TrendingDown,
      color: "text-[#526b52]",
      bgColor: "bg-[#e7eadf]",
      borderColor: "border-[#e4e0d5]",
      description: lowest !== null ? "Minimum recorded level" : "No readings recorded",
    },
    {
      label: "Average Reading",
      value: average !== null && average !== undefined ? `${average} mg/dL` : "--",
      icon: Divide,
      color: "text-[#77745e]",
      bgColor: "bg-[#eeecdf]",
      borderColor: "border-[#e4e0d5]",
      description: average !== null ? "Mean glucose value" : "No readings recorded",
    },
    {
      label: "Total Readings",
      value: count !== undefined ? String(count) : "0",
      icon: Activity,
      color: "text-[#526b52]",
      bgColor: "bg-[#e7eadf]",
      borderColor: "border-[#e4e0d5]",
      description: `${count} log${count === 1 ? "" : "s"} in this period`,
    },
  ];

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="font-serif text-xl font-normal tracking-tight text-[#26352d]">
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`border-t-2 ${card.borderColor} bg-transparent px-1 py-4 transition-colors hover:bg-white/40 sm:px-3`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78816f]">
                  {card.label}
                </span>
                <div className={`rounded-full p-2 ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-serif text-3xl font-normal tracking-tight text-[#26352d]">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-[#85877e]">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
