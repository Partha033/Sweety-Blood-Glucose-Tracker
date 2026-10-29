import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Please provide a valid email address.";
      }
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Begin tracking your blood glucose with Sweety
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start space-x-2.5 p-3.5 mb-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm"
        >
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label
            htmlFor="register-name"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4 text-rose-400" />
            </div>
            <input
              id="register-name"
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: null }));
              }}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/60 border ${
                fieldErrors.name ? "border-rose-400" : "border-slate-200"
              } rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors`}
            />
          </div>
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4 text-rose-400" />
            </div>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
              }}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/60 border ${
                fieldErrors.email ? "border-rose-400" : "border-slate-200"
              } rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Password (Min 8 Characters)
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }));
              }}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border ${
                fieldErrors.password ? "border-rose-400" : "border-slate-200"
              } rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: null }));
              }}
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2.5 bg-slate-50/60 border ${
                fieldErrors.confirmPassword ? "border-rose-400" : "border-slate-200"
              } rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors`}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-rose-200 hover:shadow-md transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-rose-600 hover:text-rose-700 underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
