import React from "react";
import { Link } from "react-router-dom";
import { Heart, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF9FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <Heart className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        404 – Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-2xl shadow-sm hover:shadow transition-all"
      >
        <Home className="w-4 h-4 mr-2" />
        Return to Dashboard
      </Link>
    </div>
  );
}
