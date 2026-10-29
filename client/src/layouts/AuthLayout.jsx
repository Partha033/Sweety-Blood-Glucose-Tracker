import Logo from "../components/Logo";
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Heart } from "lucide-react";
import BloodCellBackdrop from "../components/BloodCellBackdrop";

export default function AuthLayout() {
  return (
    <div className="relative isolate min-h-screen bg-[#ebece4] px-4 py-8 sm:px-6 lg:px-8">
      <BloodCellBackdrop />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden border border-[#d9d7ca] bg-[#faf9f5] shadow-[0_24px_80px_rgba(43,55,43,0.08)] md:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#526b52] p-10 text-[#f6f4ee] md:flex lg:p-12">
        <div className="absolute -bottom-20 -right-24 h-80 w-80 rounded-full border border-white/15" />
        <div className="absolute -bottom-12 -right-16 h-64 w-64 rounded-full border border-white/15" />
        <div className="relative">
          <Heart className="h-6 w-6" />
          <p className="mt-16 font-serif text-5xl leading-[1.08]">A journal<br />for the days<br /><em>that make you.</em></p>
        </div>
        <p className="relative max-w-xs text-sm leading-6 text-white/70">A quieter place to keep track, notice patterns, and care for yourself at your own pace.</p>
      </aside>
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="flex justify-center mb-2"><Logo size="md" showFormula={true} showText={true} to="/" /></div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="mt-8 border-t border-[#e4e0d5] py-8">
          <Outlet />
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
