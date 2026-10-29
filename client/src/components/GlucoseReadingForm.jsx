import React, { useState, useEffect } from "react";
import { TIME_SLOTS, getTodayDateString, isFutureDate } from "../utils/dateUtils";
import { Calendar, Clock, Activity, Save, X, AlertCircle } from "lucide-react";

export default function GlucoseReadingForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
}) {
  const isEdit = Boolean(initialData && initialData.id);

  const [readingDate, setReadingDate] = useState(
    initialData?.readingDate || getTodayDateString()
  );
  const [timeSlot, setTimeSlot] = useState(
    initialData?.timeSlot || "morning_fasting"
  );
  const [glucoseValue, setGlucoseValue] = useState(
    initialData?.glucoseValue !== undefined ? String(initialData.glucoseValue) : ""
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setReadingDate(initialData.readingDate || getTodayDateString());
      setTimeSlot(initialData.timeSlot || "morning_fasting");
      setGlucoseValue(
        initialData.glucoseValue !== undefined ? String(initialData.glucoseValue) : ""
      );
      setErrors({});
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    // 1. Glucose value validation
    if (
      glucoseValue === undefined ||
      glucoseValue === null ||
      glucoseValue.trim() === ""
    ) {
      newErrors.glucoseValue = "Please enter a glucose value.";
    } else {
      const num = Number(glucoseValue);
      if (
        isNaN(num) ||
        !Number.isFinite(num) ||
        !Number.isInteger(num) ||
        num < 40 ||
        num > 600
      ) {
        newErrors.glucoseValue = "Value must be between 40 and 600 mg/dl.";
      }
    }

    // 2. Date validation
    if (!readingDate || readingDate.trim() === "") {
      newErrors.readingDate = "Please select a valid date.";
    } else if (isFutureDate(readingDate)) {
      newErrors.readingDate = "Date cannot be in the future.";
    }

    // 3. Time slot validation
    if (!timeSlot) {
      newErrors.timeSlot = "Please select a time slot.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      readingDate,
      timeSlot,
      glucoseValue: parseInt(glucoseValue, 10),
    });
  };

  const handleReset = () => {
    if (isEdit && onCancel) {
      onCancel();
    } else {
      setReadingDate(getTodayDateString());
      setTimeSlot("morning_fasting");
      setGlucoseValue("");
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {serverError && (
        <div
          role="alert"
          className="flex items-start space-x-2 p-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{serverError}</span>
        </div>
      )}

      {/* Reading Date */}
      <div>
        <label
          htmlFor="readingDate"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Reading Date
        </label>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <input
            id="readingDate"
            type="date"
            max={getTodayDateString()}
            value={readingDate}
            onChange={(e) => {
              setReadingDate(e.target.value);
              if (errors.readingDate) setErrors((prev) => ({ ...prev, readingDate: null }));
            }}
            disabled={isSubmitting}
            className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border ${
              errors.readingDate
                ? "border-rose-400 focus:ring-rose-400"
                : "border-slate-200 focus:border-rose-400 focus:ring-rose-200"
            } rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition-colors`}
          />
        </div>
        {errors.readingDate && (
          <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
            {errors.readingDate}
          </p>
        )}
      </div>

      {/* Time Slot */}
      <div>
        <label
          htmlFor="timeSlot"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Time Slot
        </label>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <select
            id="timeSlot"
            value={timeSlot}
            onChange={(e) => {
              setTimeSlot(e.target.value);
              if (errors.timeSlot) setErrors((prev) => ({ ...prev, timeSlot: null }));
            }}
            disabled={isSubmitting}
            className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border ${
              errors.timeSlot
                ? "border-rose-400 focus:ring-rose-400"
                : "border-slate-200 focus:border-rose-400 focus:ring-rose-200"
            } rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition-colors`}
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
        {errors.timeSlot && (
          <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
            {errors.timeSlot}
          </p>
        )}
      </div>

      {/* Glucose Value */}
      <div>
        <label
          htmlFor="glucoseValue"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Glucose Value (mg/dL)
        </label>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <input
            id="glucoseValue"
            type="number"
            min="40"
            max="600"
            step="1"
            placeholder="e.g. 110"
            value={glucoseValue}
            onChange={(e) => {
              setGlucoseValue(e.target.value);
              if (errors.glucoseValue) setErrors((prev) => ({ ...prev, glucoseValue: null }));
            }}
            disabled={isSubmitting}
            className={`w-full pl-10 pr-14 py-2.5 bg-slate-50/50 border ${
              errors.glucoseValue
                ? "border-rose-400 focus:ring-rose-400"
                : "border-slate-200 focus:border-rose-400 focus:ring-rose-200"
            } rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition-colors`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-400 font-medium">
            mg/dL
          </div>
        </div>
        {errors.glucoseValue && (
          <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
            {errors.glucoseValue}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          {isEdit ? "Cancel" : "Reset"}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 active:bg-rose-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? "Update Reading" : "Save Reading"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
