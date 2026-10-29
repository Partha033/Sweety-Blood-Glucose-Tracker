import React, { useState, useEffect, useCallback } from "react";
import { readingsApi } from "../api/readingsApi";
import { TIME_SLOTS, formatDateDisplay } from "../utils/dateUtils";
import ReadingTable from "../components/ReadingTable";
import GlucoseReadingForm from "../components/GlucoseReadingForm";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import {
  Plus,
  Filter,
  RotateCcw,
  CheckCircle2,
  X,
  Activity,
} from "lucide-react";

export default function Readings() {
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete dialog state
  const [deletingReading, setDeletingReading] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (timeSlot) params.timeSlot = timeSlot;

      const res = await readingsApi.getReadings(params);
      setReadings(res.data.readings || []);
      setPagination(
        res.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 10,
        }
      );
    } catch (err) {
      setError(err.message || "Failed to load readings.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, startDate, endDate, timeSlot]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setTimeSlot("");
    setCurrentPage(1);
  };

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
      setIsFormOpen(false);
      setEditingReading(null);
      await fetchReadings();
    } catch (err) {
      setFormError(err.message || "Failed to save reading.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReading) return;
    setIsDeleting(true);
    try {
      await readingsApi.deleteReading(deletingReading.id);
      setSuccessMessage("Reading deleted successfully.");
      setDeletingReading(null);
      await fetchReadings();
    } catch (err) {
      setError(err.message || "Failed to delete reading.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingReading(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (reading) => {
    setEditingReading(reading);
    setFormError(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78816f]">Your health journal</p>
          <h2 className="font-serif text-4xl font-normal tracking-tight text-[#26352d] sm:text-5xl">
            Reading history
          </h2>
          <p className="mt-2 text-sm text-[#68736a]">
            A clear record of your measurements, one day at a time.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center self-start rounded-full bg-[#526b52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405943] focus:outline-none focus:ring-2 focus:ring-[#526b52] focus:ring-offset-2 sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reading
        </button>
      </div>

      {/* Notifications */}
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

      {/* Filter Toolbar */}
      <div className="border-y border-[#e4e0d5] bg-[#f1efe7] px-4 py-5 sm:px-6">
        <div className="mb-1 flex items-center gap-2 font-serif text-lg text-[#26352d]">
          <Filter className="h-4 w-4 text-[#526b52]" />
          <span>Find a reading</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-[#d9d7ca] bg-[#faf9f5] px-3 py-2.5 text-sm text-[#39473e] focus:border-[#71836c] focus:outline-none focus:ring-2 focus:ring-[#71836c]/20"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-[#d9d7ca] bg-[#faf9f5] px-3 py-2.5 text-sm text-[#39473e] focus:border-[#71836c] focus:outline-none focus:ring-2 focus:ring-[#71836c]/20"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Time Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => {
                setTimeSlot(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-[#d9d7ca] bg-[#faf9f5] px-3 py-2.5 text-sm text-[#39473e] focus:border-[#71836c] focus:outline-none focus:ring-2 focus:ring-[#71836c]/20"
            >
              <option value="">All Time Slots</option>
              {TIME_SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full inline-flex items-center justify-center rounded-lg border border-[#d9d7ca] bg-[#faf9f5] px-3 py-2.5 text-sm font-medium text-[#59665d] transition-colors hover:bg-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Retrieving your records..." size="lg" />
        </div>
      ) : readings.length === 0 ? (
        <EmptyState
          title="No readings match your criteria"
          message={
            startDate || endDate || timeSlot
              ? "Try adjusting or resetting your filter criteria to see your readings."
              : "You haven't recorded any blood glucose readings yet. Click below to add one."
          }
          actionLabel={startDate || endDate || timeSlot ? "Clear Filters" : "Record Reading"}
          onAction={startDate || endDate || timeSlot ? handleResetFilters : openAddModal}
          icon={Activity}
        />
      ) : (
        <ReadingTable
          readings={readings}
          onEdit={openEditModal}
          onDelete={(r) => setDeletingReading(r)}
          pagination={pagination}
          onPageChange={(page) => setCurrentPage(page)}
          isLoading={loading}
        />
      )}

      {/* Add / Edit Reading Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-rose-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingReading ? "Edit Blood Glucose Reading" : "Record Blood Glucose Reading"}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
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
                setIsFormOpen(false);
                setEditingReading(null);
              }}
              isSubmitting={formSubmitting}
              serverError={formError}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingReading)}
        title="Delete Blood Glucose Reading"
        message={`Are you sure you want to delete the ${
          deletingReading?.timeSlotLabel || deletingReading?.timeSlot
        } reading (${deletingReading?.glucoseValue} mg/dL) from ${formatDateDisplay(
          deletingReading?.readingDate
        )}? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingReading(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
