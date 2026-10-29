import React from "react";
import { Activity, Plus } from "lucide-react";

export default function EmptyState({
  title = "No readings found",
  message = "You haven't recorded any blood glucose readings for this period yet.",
  actionLabel,
  onAction,
  icon: Icon = Activity,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-rose-100 rounded-2xl shadow-sm">
      <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
