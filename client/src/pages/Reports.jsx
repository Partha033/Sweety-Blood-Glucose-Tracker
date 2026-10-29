import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { reportsApi } from "../api/reportsApi";
import {
  getTodayDateString,
  formatDateDisplay,
  isFutureDate,
  TIME_SLOT_LABELS,
} from "../utils/dateUtils";
import { getGlucoseStatus } from "../utils/glucoseUtils";
import ReportSummary from "../components/ReportSummary";
import ReportChart from "../components/ReportChart";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import {
  Calendar,
  Clock,
  BarChart2,
  CalendarDays,
  History,
  Activity,
} from "lucide-react";

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "daily";
  const initialDate = searchParams.get("date") || getTodayDateString();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [dailyReport, setDailyReport] = useState(null);
  const [mtdReport, setMtdReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!selectedDate || isFutureDate(selectedDate)) {
      setError("Please select a date on or before today.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all three report endpoints concurrently
      const [dailyRes, mtdRes, monthlyRes] = await Promise.all([
        reportsApi.getDailyReport(selectedDate),
        reportsApi.getMonthToDateReport(selectedDate),
        reportsApi.getMonthlyReport(selectedDate),
      ]);

      setDailyReport(dailyRes.data);
      setMtdReport(mtdRes.data);
      setMonthlyReport(monthlyRes.data);
    } catch (err) {
      setError(err.message || "Failed to generate reports.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Sync state changes with URL search params
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSearchParams({ tab: activeTab, date: newDate });
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey, date: selectedDate });
  };

  const tabs = [
    { id: "daily", label: "Daily Report", icon: Clock },
    { id: "mtd", label: "Month-to-Date", icon: CalendarDays },
    { id: "monthly", label: "Previous Month", icon: History },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Glucose Reports & Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Accurate daily, month-to-date, and previous-month clinical calculations
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-2xl border border-rose-100 shadow-sm">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold text-slate-600">Reference Date:</span>
          <input
            type="date"
            max={getTodayDateString()}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="text-xs font-medium text-slate-800 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-rose-100 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner message="Calculating blood glucose statistics..." size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* DAILY REPORT TAB */}
          {activeTab === "daily" && dailyReport && (
            <div className="space-y-6">
              {/* Range badge */}
              <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                <div>
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                    Single Day Scope
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mt-0.5">
                    Readings for {formatDateDisplay(dailyReport.selectedDate)}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-rose-100">
                  {dailyReport.statistics.count} of 4 slots logged
                </span>
              </div>

              {/* Summary Cards */}
              <ReportSummary statistics={dailyReport.statistics} />

              {/* Chronological Slot Readings List */}
              <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Day Schedule (Morning to Dinner)
                  </h4>
                  <span className="text-xs text-slate-400">Standard chronological order</span>
                </div>

                {dailyReport.readings.length === 0 ? (
                  <EmptyState
                    title="No readings on this date"
                    message={`No blood glucose readings were logged on ${formatDateDisplay(
                      dailyReport.selectedDate
                    )}.`}
                    icon={Activity}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {dailyReport.readings.map((reading) => {
                      const status = getGlucoseStatus(
                        reading.glucoseValue,
                        reading.timeSlot
                      );
                      return (
                        <div
                          key={reading.id}
                          className="p-4 bg-rose-50/30 rounded-xl border border-rose-100 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <span className="inline-block px-2.5 py-1 bg-white border border-rose-100 rounded-lg text-xs font-semibold text-slate-700">
                              {reading.timeSlotLabel}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-slate-900">
                              {reading.glucoseValue}{" "}
                              <span className="text-xs font-normal text-slate-400">mg/dL</span>
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${status.badgeClass}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MONTH-TO-DATE TAB */}
          {activeTab === "mtd" && mtdReport && (
            <div className="space-y-6">
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                    Month-to-Date Scope
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mt-0.5">
                    {formatDateDisplay(mtdReport.effectiveRange.startDate)} –{" "}
                    {formatDateDisplay(mtdReport.effectiveRange.endDate)}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-rose-100">
                  {mtdReport.statistics.count} readings recorded
                </span>
              </div>

              {/* Summary Cards */}
              <ReportSummary statistics={mtdReport.statistics} />

              {/* Chart */}
              <ReportChart
                readings={mtdReport.readings}
                title="Month-to-Date Glucose Trend"
              />
            </div>
          )}

          {/* PREVIOUS MONTH TAB */}
          {activeTab === "monthly" && monthlyReport && (
            <div className="space-y-6">
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                    Previous Calendar Month Scope
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mt-0.5">
                    {formatDateDisplay(monthlyReport.effectiveRange.startDate)} –{" "}
                    {formatDateDisplay(monthlyReport.effectiveRange.endDate)}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-rose-100">
                  {monthlyReport.statistics.count} readings recorded
                </span>
              </div>

              {/* Summary Cards */}
              <ReportSummary statistics={monthlyReport.statistics} />

              {/* Chart */}
              <ReportChart
                readings={monthlyReport.readings}
                title="Full Previous Month Glucose Curve"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
