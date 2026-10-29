import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Heart className="w-7 h-7 fill-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Sweety
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Personal Blood Glucose Tracker
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-rose-100/50 rounded-3xl border border-rose-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
