import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 rounded-full transition ${
        on ? "bg-clay" : "bg-sand"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-paper shadow transition ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function Settings() {
  const { profile, biomarkers, watchConnected, dark, carerName, set, reset } =
    useStore();
  const nav = useNavigate();
  const [carer, setCarer] = useState(carerName ?? "");

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ profile, biomarkers }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "heartsum-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-readable">
      <h1 className="text-3xl md:text-4xl">Settings & privacy</h1>
      <p className="mt-2 text-muted">
        Your data is yours. You control everything here — sharing, helpers,
        export and deletion.
      </p>

      <section className="card mt-8 p-6">
        <h2 className="text-xl">Connected data</h2>
        <div className="mt-3 space-y-2 text-muted">
          <div className="flex items-center justify-between">
            <span>Apple Watch & Health</span>
            <span className={watchConnected ? "text-sage" : "text-faint"}>
              {watchConnected ? "✓ Connected" : "Not connected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Blood results</span>
            <span className="text-sage">✓ {biomarkers.length} on file</span>
          </div>
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl">Family / carer access</h2>
        <p className="mt-1 text-muted">
          Let someone you trust help out or view your dashboard. You grant this,
          and you can remove it any time.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="field flex-1"
            placeholder="Name or email of your helper"
            value={carer}
            onChange={(e) => setCarer(e.target.value)}
          />
          {carerName ? (
            <button
              className="btn-ghost"
              onClick={() => {
                set({ carerName: null });
                setCarer("");
              }}
            >
              Remove access
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => set({ carerName: carer.trim() || null })}
            >
              Grant access
            </button>
          )}
        </div>
        {carerName && (
          <p className="mt-3 text-sm text-sage">
            ✓ {carerName} can currently view your dashboard.
          </p>
        )}
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl">Appearance</h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-ink">Gentle dark mode</div>
            <div className="text-sm text-muted">
              Warm and dim for evening reading.
            </div>
          </div>
          <Toggle on={dark} onChange={(v) => set({ dark: v })} label="Dark mode" />
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl">Your data, your control</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-ghost" onClick={exportData}>
            Export everything
          </button>
          <button
            className="btn-ghost text-brick"
            onClick={() => {
              if (
                confirm(
                  "This will delete all your HeartSum data on this device and return you to the start. Continue?",
                )
              ) {
                reset();
                nav("/welcome");
              }
            }}
          >
            Delete all my data
          </button>
        </div>
        <p className="mt-3 text-sm text-faint">
          A report is only ever shared when you explicitly choose to. Shared
          links can be revoked.
        </p>
      </section>

      <p className="mt-8 text-sm text-faint">
        Regulatory clearances and feature availability differ by country and
        region, so HeartSum describes signals carefully and avoids over-claiming.
      </p>
    </div>
  );
}
