import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FA]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-rose-100 bg-white/50 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Sweety – Blood Glucose Tracker. For personal tracking and wellness monitoring.</p>
        </div>
      </footer>
    </div>
  );
}
