// SI ↔ US conversions for blood biomarkers.
// HK labs report SI (mmol/L); the Framingham formula expects mg/dL.
// Rule: store in SI, convert only for calculation/display.

// Conversion factor (multiply SI value to get the US value) by biomarker key.
const SI_TO_US: Record<string, { factor: number; usUnit: string }> = {
  totalChol: { factor: 38.67, usUnit: "mg/dL" },
  hdl: { factor: 38.67, usUnit: "mg/dL" },
  ldl: { factor: 38.67, usUnit: "mg/dL" },
  trig: { factor: 88.57, usUnit: "mg/dL" },
  glucose: { factor: 18.02, usUnit: "mg/dL" },
};

export function toUS(key: string, siValue: number): { value: number; unit: string } | null {
  const c = SI_TO_US[key];
  if (!c) return null;
  return { value: Math.round(siValue * c.factor), unit: c.usUnit };
}

// "5.9 mmol/L (228 mg/dL)" style label, when a US equivalent exists.
export function dualUnit(key: string, siValue: number, siUnit: string): string {
  const us = toUS(key, siValue);
  return us ? `${siValue} ${siUnit} (${us.value} ${us.unit})` : `${siValue} ${siUnit}`;
}
