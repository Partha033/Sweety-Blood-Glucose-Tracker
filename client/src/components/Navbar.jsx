import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "./Logo";
import {
  Heart,
  LayoutDashboard,
  Table,
  BarChart2,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/readings", label: "Readings", icon: Table },
    { to: "/reports", label: "Reports", icon: BarChart2 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Logo size="sm" showFormula={true} showText={true} />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-rose-50 text-rose-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${active ? "text-rose-500" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-50/50 rounded-xl border border-rose-100">
              <div className="w-6 h-6 bg-rose-200 text-rose-700 rounded-lg flex items-center justify-center text-xs font-semibold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                {user?.name || "Patient"}
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 mr-1.5 text-slate-400 hover:text-rose-500" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              aria-label="Toggle navigation"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden border-t border-rose-100 bg-white px-4 pt-3 pb-4 space-y-2">
          <div className="px-3 py-2 bg-rose-50/50 rounded-xl flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-medium text-slate-700 truncate">
              Signed in as {user?.name || "Patient"}
            </span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? "bg-rose-50 text-rose-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 mr-2.5 ${active ? "text-rose-500" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
