import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { readingsApi } from "../api/readingsApi";
import { reportsApi } from "../api/reportsApi";
import { getTodayDateString, formatDateDisplay } from "../utils/dateUtils";
import ReportSummary from "../components/ReportSummary";
import ReadingTable from "../components/ReadingTable";
import GlucoseReadingForm from "../components/GlucoseReadingForm";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import {
  Plus,
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
      {/* Header Greeting & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10 p-6 sm:p-8 rounded-3xl border border-rose-100">
        <div>
          <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-100/70 px-3 py-1 rounded-full mb-2">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            {formatDateDisplay(today)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.name || "Patient"}! 👋
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {todayCount === 4
              ? "Great job! You have logged all 4 readings for today."
              : `You have recorded ${todayCount} of 4 readings today.`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-5 py-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-sm shadow-rose-300 hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Add Reading
          </button>
        </div>
      </div>

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

      {/* Quick Navigation Cards to Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to={`/reports?tab=daily&date=${today}`}
          className="p-5 bg-white rounded-2xl border border-rose-100 shadow-sm hover:border-rose-300 hover:shadow-md transition-all group flex items-center justify-between"
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
          className="p-5 bg-white rounded-2xl border border-rose-100 shadow-sm hover:border-rose-300 hover:shadow-md transition-all group flex items-center justify-between"
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
          className="p-5 bg-white rounded-2xl border border-rose-100 shadow-sm hover:border-rose-300 hover:shadow-md transition-all group flex items-center justify-between"
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
            <h3 className="text-lg font-bold text-slate-800">Recent Readings</h3>
            <p className="text-xs text-slate-500">Your most recently logged entries</p>
          </div>
          <Link
            to="/readings"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center"
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
