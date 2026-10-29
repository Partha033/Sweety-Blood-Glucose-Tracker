import React from "react";

/** Quiet, illustrative red blood cell forms used as a low-contrast page texture. */
export default function BloodCellBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <span className="blood-cell blood-cell-one" />
      <span className="blood-cell blood-cell-two" />
      <span className="blood-cell blood-cell-three" />
      <span className="blood-cell blood-cell-four" />
    </div>
  );
}
