import React, { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

export default function GlucoseUnitConverter({ initialValue = "" }) {
  const [value, setValue] = useState(initialValue == null ? "" : String(initialValue));
  const [fromUnit, setFromUnit] = useState("mg/dL");
  const numericValue = Number(value);
  const result = useMemo(() => {
    if (value === "" || !Number.isFinite(numericValue) || numericValue <= 0) return null;
    return fromUnit === "mg/dL"
      ? { value: (numericValue / 18).toFixed(1), unit: "mmol/L" }
      : { value: String(Math.round(numericValue * 18)), unit: "mg/dL" };
  }, [fromUnit, numericValue, value]);

  const switchUnits = () => {
    if (result) setValue(result.value);
    setFromUnit((unit) => unit === "mg/dL" ? "mmol/L" : "mg/dL");
  };

  const formula = fromUnit === "mg/dL"
    ? "mg/dL ÷ 18 = mmol/L"
    : "mmol/L × 18 = mg/dL";

  return (
    <section aria-labelledby="unit-converter-title" className="border-y border-[#d9d7ca] bg-[#f1efe7] px-5 py-5 sm:px-6">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#78816f]">Quick reference</p>
          <h3 id="unit-converter-title" className="mt-1 font-serif text-2xl font-normal text-[#26352d]">Glucose unit converter</h3>
          <p className="mt-1 text-xs text-[#85877e]">A unit conversion only; it does not interpret your result.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="glucose-converter-value">Glucose value to convert</label>
          <input
            id="glucose-converter-value"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter value"
            className="w-32 rounded-lg border border-[#d9d7ca] bg-[#faf9f5] px-3 py-2.5 text-sm text-[#34443a] outline-none focus:border-[#71836c] focus:ring-2 focus:ring-[#71836c]/20"
          />
          <span className="min-w-12 text-xs font-medium text-[#68736a]">{fromUnit}</span>
          <button type="button" onClick={switchUnits} aria-label="Switch conversion direction" className="rounded-full border border-[#d9d7ca] p-2 text-[#526b52] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#71836c]/30">
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div aria-live="polite" className="min-w-28 font-serif text-2xl text-[#526b52]">
            {result ? <>{result.value}<span className="ml-1 font-sans text-xs text-[#68736a]">{result.unit}</span></> : <span className="text-[#a2a396]">—</span>}
          </div>
        </div>
      </div>
      <p className="mt-4 border-t border-[#dedbcf] pt-3 font-mono text-xs tracking-wide text-[#68736a]">Formula: {formula}</p>
    </section>
  );
}
