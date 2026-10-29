import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { readingsApi } from "../api/readingsApi";
import { reportsApi } from "../api/reportsApi";
import { getTodayDateString, formatDateDisplay, TIME_SLOTS } from "../utils/dateUtils";
import ReportSummary from "../components/ReportSummary";
import GlucoseUnitConverter from "../components/GlucoseUnitConverter";
import ReadingTable from "../components/ReadingTable";
import GlucoseReadingForm from "../components/GlucoseReadingForm";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  Activity,
  ArrowRight,
  X,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const today = getTodayDateString();

  const [dailyStats, setDailyStats] = useState(null);
  const [todayReadings, setTodayReadings] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete dialog state
  const [deletingReading, setDeletingReading] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch today's daily report
      const dailyReportRes = await reportsApi.getDailyReport(today);
      setDailyStats(dailyReportRes.data.statistics);
      setTodayReadings(dailyReportRes.data.readings || []);

      // 2. Fetch recent readings (limit 5)
      const readingsRes = await readingsApi.getReadings({ limit: 5 });
      setRecentReadings(readingsRes.data.readings || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle create or update submission
  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      if (editingReading) {
        await readingsApi.updateReading(editingReading.id, formData);
        setSuccessMessage("Reading updated successfully.");
      } else {
        await readingsApi.createReading(formData);
        setSuccessMessage("Reading recorded successfully.");
      }
      setIsFormModalOpen(false);
      setEditingReading(null);
      await fetchDashboardData();
    } catch (err) {
      setFormError(err.message || "Failed to save reading.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletingReading) return;
    setIsDeleting(true);
    try {
      await readingsApi.deleteReading(deletingReading.id);
      setSuccessMessage("Reading deleted successfully.");
      setDeletingReading(null);
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to delete reading.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingReading(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (reading) => {
    setEditingReading(reading);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner message="Loading your health dashboard..." size="lg" />
      </div>
    );
  }

  const todayCount = dailyStats?.count || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Daily check-in and primary action */}
      <section className="overflow-hidden border-y border-[#d9d7ca] bg-[#ebece4]">
        <div className="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1fr_340px] lg:items-center lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-[#6d7868]">
              <span className="h-px w-8 bg-[#78866f]" />
              {formatDateDisplay(today)}
            </div>
            <h2 className="font-serif text-[2.7rem] font-normal leading-[1.05] tracking-[-0.04em] text-[#26352d] sm:text-6xl">
              Your health,<br />
              <span className="italic text-[#a65d45]">in your own rhythm.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[#68736a] sm:text-base">
              {todayCount === 4
                ? `You have logged all four readings today, ${user?.name?.split(" ")[0] || "friend"}. Take a moment to review your day.`
                : `Welcome back, ${user?.name?.split(" ")[0] || "friend"}. A simple record today can make tomorrow easier to understand.`}
            </p>
            <button
              onClick={openAddModal}
              className="mt-6 inline-flex min-h-11 items-center rounded-md bg-[#526b52] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#405943] focus:outline-none focus:ring-2 focus:ring-[#526b52] focus:ring-offset-2"
            >
              Record a reading
            </button>
          </div>

          <div className="relative border-l border-[#d2d5c9] py-2 pl-6 sm:pl-8 lg:ml-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78816f]">A note for today</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-serif text-7xl leading-none tracking-tight text-[#526b52]">{todayCount}</span>
              <span className="pb-1 font-serif text-3xl text-[#9da394]">/ 4</span>
            </div>
            <p className="mt-2 text-sm text-[#59665d]">readings recorded today</p>
            <div className="mt-5 flex gap-2" aria-label={`${todayCount} of 4 readings logged`}>
              {[0, 1, 2, 3].map((slot) => (
                <span key={slot} className={`h-1.5 flex-1 rounded-full ${slot < todayCount ? "bg-[#526b52]" : "bg-[#d2d5c9]"}`} />
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#82877d]">
              {todayCount === 4 ? "That’s your full day, recorded." : "No rush. Add readings as your day unfolds."}
            </p>
          </div>
        </div>
      </section>

      {/* Anatomical illustration paired with the actual meal-time log */}
      <section className="grid overflow-hidden border-y border-[#d9d7ca] bg-[#faf9f5] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[#e8e9df] px-8 py-6">
          <div className="absolute left-6 top-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78816f]">A whole-person view</div>
          <div className="absolute bottom-5 left-6 max-w-[170px] text-[11px] leading-4 text-[#737c70]">A gentle reminder: your numbers are one part of your health story.</div>
          <img
            src="/images/glucose-body-map.png"
            alt="Soft 3D anatomical illustration of a human figure, shown as a visual for the health journal"
            className="relative mt-5 h-[300px] max-w-full object-contain drop-shadow-[0_18px_18px_rgba(67,80,62,0.14)] sm:h-[340px]"
          />
          <span aria-hidden="true" className="absolute right-[23%] top-[34%] h-2.5 w-2.5 rounded-full border-2 border-[#faf9f5] bg-[#bd7557] shadow" />
          <span aria-hidden="true" className="absolute left-[28%] top-[46%] h-2.5 w-2.5 rounded-full border-2 border-[#faf9f5] bg-[#71836c] shadow" />
        </div>
        <div className="px-6 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="flex items-end justify-between border-b border-[#e4e0d5] pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78816f]">Today’s log</p>
              <h3 className="mt-1 font-serif text-3xl font-normal tracking-tight text-[#26352d]">Your day, at a glance</h3>
            </div>
            <Link to={`/reports?tab=daily&date=${today}`} className="text-xs font-semibold text-[#526b52] underline decoration-[#b6c0ae] underline-offset-4 hover:text-[#a65d45]">Daily view</Link>
          </div>
          <div className="mt-2 divide-y divide-[#e9e6dc]">
            {TIME_SLOTS.map((slot, index) => {
              const reading = todayReadings.find((item) => item.timeSlot === slot.value);
              return (
                <div key={slot.value} className="flex items-center gap-4 py-4">
                  <span className="w-7 font-serif text-sm italic text-[#a2a396]">0{index + 1}</span>
                  <span className="flex-1 text-sm font-medium text-[#59665d]">{slot.label}</span>
                  {reading ? (
                    <span className="font-serif text-2xl text-[#344b39]">{reading.glucoseValue}<span className="ml-1 font-sans text-[10px] text-[#85877e]">mg/dL</span></span>
                  ) : (
                    <span className="text-xs text-[#a2a396]">Not logged</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 border-l-2 border-[#c98263] pl-3 text-xs leading-5 text-[#85877e]">The illustration is for visual context; readings are organized by time of day.</p>
        </div>
      </section>

      {/* Feedback Messages */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Daily Stats Summary */}
      <ReportSummary statistics={dailyStats} title="Today's Blood Glucose Overview" />
      <GlucoseUnitConverter initialValue={dailyStats?.average} />

      {/* Quick Navigation Cards to Reports */}
      <div className="grid grid-cols-1 gap-0 border-y border-[#d9d7ca] md:grid-cols-3">
        <Link
          to={`/reports?tab=daily&date=${today}`}
          className="group flex items-center justify-between border-b border-[#e4e0d5] bg-transparent p-5 transition-colors hover:bg-[#ebece4] focus:outline-none focus:ring-2 focus:ring-[#526b52] md:border-b-0 md:border-r"
        >
          <div>
            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">
              Daily Report
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">View today&apos;s full chronological slots</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to={`/reports?tab=mtd&date=${today}`}
          className="group flex items-center justify-between border-b border-[#e4e0d5] bg-transparent p-5 transition-colors hover:bg-[#ebece4] focus:outline-none focus:ring-2 focus:ring-[#526b52] md:border-b-0 md:border-r"
        >
          <div>
            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">
              Month-to-Date Report
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Track your progress from the 1st of this month</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to={`/reports?tab=monthly&date=${today}`}
          className="group flex items-center justify-between bg-transparent p-5 transition-colors hover:bg-[#ebece4] focus:outline-none focus:ring-2 focus:ring-[#526b52]"
        >
          <div>
            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">
              Previous Month Report
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Analyze your full 30-day historical trend</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Readings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-normal text-[#26352d]">Recent readings</h3>
            <p className="text-xs text-[#85877e]">Your most recently logged entries</p>
          </div>
          <Link
            to="/readings"
            className="flex items-center text-xs font-semibold text-[#526b52] hover:text-[#a65d45]"
          >
            View All Readings
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {recentReadings.length === 0 ? (
          <EmptyState
            title="No readings recorded yet"
            message="Start monitoring your blood glucose by recording your first reading today."
            actionLabel="Add Your First Reading"
            onAction={openAddModal}
            icon={Activity}
          />
        ) : (
          <ReadingTable
            readings={recentReadings}
            onEdit={openEditModal}
            onDelete={(r) => setDeletingReading(r)}
          />
        )}
      </div>

      {/* Modal for Add / Edit Reading */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 transform transition-all">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-rose-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingReading ? "Edit Blood Glucose Reading" : "Record Blood Glucose Reading"}
              </h3>
              <button
                onClick={() => {
                  setIsFormModalOpen(false);
                  setEditingReading(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <GlucoseReadingForm
              initialData={editingReading}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormModalOpen(false);
                setEditingReading(null);
              }}
              isSubmitting={formSubmitting}
              serverError={formError}
            />
          </div>
        </div>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingReading)}
        title="Delete Glucose Reading"
        message={`Are you sure you want to delete the ${
          deletingReading?.timeSlotLabel || deletingReading?.timeSlot
        } reading (${deletingReading?.glucoseValue} mg/dL) from ${formatDateDisplay(
          deletingReading?.readingDate
        )}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingReading(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
