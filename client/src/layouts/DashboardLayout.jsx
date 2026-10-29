import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import BloodCellBackdrop from "../components/BloodCellBackdrop";

export default function DashboardLayout() {
  return (
    <div className="relative isolate min-h-screen flex flex-col bg-[#f6f4ee]">
      <BloodCellBackdrop />
      <Navbar />
      <main className="relative z-10 flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-7 lg:px-10 py-8 lg:py-10">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-[#e4e0d5] bg-[#f6f4ee]/90 py-6 text-center text-xs text-[#7b8178]">
        <div className="max-w-[1360px] mx-auto px-4">
          <p>© {new Date().getFullYear()} Sweety – Blood Glucose Tracker. For personal tracking and wellness monitoring.</p>
        </div>
      </footer>
    </div>
  );
}
