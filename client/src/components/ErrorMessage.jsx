import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function ErrorMessage({ message, onDismiss, onRetry }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start justify-between p-4 my-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl shadow-sm text-sm"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-semibold text-rose-600 underline hover:text-rose-700"
            >
              Try again
            </button>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-600 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
