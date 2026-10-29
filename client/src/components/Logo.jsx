import React from "react";
import { Link } from "react-router-dom";

/**
 * Glucose Molecular Icon (C6H12O6 Pyranose Ring + Blood Droplet)
 */
export function GlucoseIcon({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Glucose Molecule C6H12O6 Logo"
    >
      <defs>
        {/* Droplet Background Gradient */}
        <linearGradient id="sweetyGrad" x1="15" y1="10" x2="85" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>

        {/* Bond Line Gradient */}
        <linearGradient id="bondGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0.8" />
        </linearGradient>

        {/* Subtle Inner Glow */}
        <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Stylized Healthcare Blood Droplet with Heart Curve Base */}
      <path
        d="M50 8 C50 8, 84 46, 84 66 C84 83.5 70 94 50 94 C30 94 16 83.5 16 66 C16 46, 50 8 50 8 Z"
        fill="url(#sweetyGrad)"
        filter="drop-shadow(0 6px 12px rgba(244, 63, 94, 0.35))"
      />

      {/* Highlight reflection arc for glossy medical drop effect */}
      <path
        d="M32 36 C40 24, 48 18, 50 16 C46 22, 28 42, 26 58 C25 61, 23 58, 24 54 C26 46, 29 40, 32 36 Z"
        fill="#FFFFFF"
        opacity="0.3"
      />

      {/* --- C6H12O6 Glucopyranose Hexagonal Ring Structure --- */}
      <g filter="url(#softGlow)">
        {/* Hexagonal molecular covalent bonds */}
        <polygon
          points="50,38 71,48 71,70 50,80 29,70 29,48"
          stroke="url(#bondGrad)"
          strokeWidth="3"
          strokeLinejoin="round"
          fill="rgba(255, 255, 255, 0.12)"
        />

        {/* Functional Side Chains (CH2OH & OH branching) */}
        {/* C5 -> CH2OH top branch */}
        <line x1="29" y1="48" x2="20" y2="38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        {/* C1 -> OH right branch */}
        <line x1="71" y1="48" x2="80" y2="42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        {/* C2 -> OH lower right branch */}
        <line x1="71" y1="70" x2="79" y2="76" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        {/* C3 -> OH bottom branch */}
        <line x1="50" y1="80" x2="50" y2="88" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        {/* C4 -> OH lower left branch */}
        <line x1="29" y1="70" x2="21" y2="76" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Oxygen Bridge in the ring (Top vertex C5-O-C1) */}
        <circle cx="50" cy="38" r="4.5" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="1.5" />
        {/* Carbon vertices nodes */}
        <circle cx="71" cy="48" r="3.5" fill="#FFFFFF" />
        <circle cx="71" cy="70" r="3.5" fill="#FFFFFF" />
        <circle cx="50" cy="80" r="3.5" fill="#FFFFFF" />
        <circle cx="29" cy="70" r="3.5" fill="#FFFFFF" />
        <circle cx="29" cy="48" r="3.5" fill="#FFFFFF" />

        {/* Peripheral functional atoms */}
        <circle cx="20" cy="38" r="2.5" fill="#FFE4E6" />
        <circle cx="80" cy="42" r="2.5" fill="#FFE4E6" />
        <circle cx="79" cy="76" r="2.5" fill="#FFE4E6" />
        <circle cx="50" cy="88" r="2.5" fill="#FFE4E6" />
        <circle cx="21" cy="76" r="2.5" fill="#FFE4E6" />
      </g>
    </svg>
  );
}

/**
 * Reusable Sweety Logo Component with Glucose Formula (C₆H₁₂O₆)
 */
export default function Logo({
  size = "md",
  showFormula = true,
  showText = true,
  to = "/dashboard",
  className = "",
}) {
  const iconSizes = {
    sm: 36,
    md: 44,
    lg: 56,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const formulaBadgeSizes = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  const content = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Glucose Droplet + Pyranose Ring Icon */}
      <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
        <GlucoseIcon size={iconSizes[size] || iconSizes.md} />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent ${
                textSizes[size] || textSizes.md
              }`}
            >
              Sweety
            </span>

            {showFormula && (
              <span
                title="Chemical Formula of Glucose: C6H12O6"
                className={`font-mono font-semibold tracking-wide rounded-md bg-rose-50 text-rose-700 border border-rose-200 shadow-sm flex items-center gap-1 ${
                  formulaBadgeSizes[size] || formulaBadgeSizes.md
                }`}
              >
                <span className="text-rose-500 font-bold">C₆H₁₂O₆</span>
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-slate-400 tracking-wide">
            Blood Glucose Tracker
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="group inline-flex items-center focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
