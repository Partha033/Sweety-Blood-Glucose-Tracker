import React from "react";
import { formatDateDisplay } from "../utils/dateUtils";
import { getGlucoseStatus } from "../utils/glucoseUtils";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function ReadingTable({
  readings = [],
  onEdit,
  onDelete,
  pagination = null,
  onPageChange = null,
  isLoading = false,
}) {
  if (readings.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-rose-50/60 text-xs uppercase font-semibold text-rose-900/70 border-b border-rose-100">
            <tr>
              <th scope="col" className="px-6 py-4">
                Date
              </th>
              <th scope="col" className="px-6 py-4">
                Time Slot
              </th>
              <th scope="col" className="px-6 py-4">
                Glucose Level
              </th>
              <th scope="col" className="px-6 py-4">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50/70">
            {readings.map((reading) => {
              const status = getGlucoseStatus(reading.glucoseValue, reading.timeSlot);
              return (
                <tr
                  key={reading.id}
                  className="hover:bg-rose-50/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                    {formatDateDisplay(reading.readingDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                      {reading.timeSlotLabel || reading.timeSlot}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-base font-semibold text-slate-800">
                      {reading.glucoseValue}
                    </span>{" "}
                    <span className="text-xs text-slate-400">mg/dL</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(reading)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Edit reading"
                        aria-label="Edit reading"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(reading)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete reading"
                        aria-label="Delete reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-rose-100">
        {readings.map((reading) => {
          const status = getGlucoseStatus(reading.glucoseValue, reading.timeSlot);
          return (
            <div key={reading.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDateDisplay(reading.readingDate)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {reading.timeSlotLabel || reading.timeSlot}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-800">
                    {reading.glucoseValue}{" "}
                    <span className="text-xs font-normal text-slate-400">mg/dL</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-xs font-medium border ${status.badgeClass}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-50">
                <button
                  onClick={() => onEdit(reading)}
                  className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-rose-600"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(reading)}
                  className="inline-flex items-center text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-rose-50/40 border-t border-rose-100">
          <div className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-700">{pagination.currentPage}</span> of{" "}
            <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.totalCount} total)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || isLoading}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || isLoading}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
