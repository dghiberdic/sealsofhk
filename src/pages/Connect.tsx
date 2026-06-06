import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

type Phase = "idle" | "importing" | "done";

export function Connect() {
  const nav = useNavigate();
  const { set, biomarkers } = useStore();
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState("");

  const runImport = () => {
    setPhase("importing");
    const steps = [
      "Connecting to Apple Health…",
      "Reading your last 90 days…",
      "Bringing in heart & circulation…",
      "Bringing in sleep & overnight vitals…",
      "Learning your personal baseline…",
    ];
    let i = 0;
    setStep(steps[0]);
    const timer = setInterval(() => {
      i += 1;
      if (i < steps.length) {
        setStep(steps[i]);
      } else {
        clearInterval(timer);
        set({ watchConnected: true });
        setPhase("done");
      }
    }, 650);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-readable px-6 py-12">
        <p className="text-sm font-medium text-clay-deep">Step 2 of 2</p>
        <h1 className="mt-1 text-3xl">Bring in your data</h1>
        <p className="mt-2 text-muted">
          Add one now and the other whenever you like — your dashboard gets
          richer as you go.
        </p>

        {/* Apple Health */}
        <div className="card mt-8 p-6">
          <h2 className="text-xl"> Connect your Apple Watch & Health</h2>
          <p className="mt-1 text-muted">
            We'll bring in your heart, sleep, activity, mobility and overnight
            vitals.
          </p>

          {phase === "idle" && (
            <button className="btn-primary mt-4" onClick={runImport}>
              Connect Apple Health
            </button>
          )}

          {phase === "importing" && (
            <div className="mt-4 flex items-center gap-3 text-muted">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-clay border-t-transparent" />
              {step}
            </div>
          )}

          {phase === "done" && (
            <div className="mt-4 rounded-xl bg-sage-tint p-4 text-sage">
              <p className="font-medium text-ink">
                ✓ All set — we've brought in your last 90 days.
              </p>
              <p className="mt-1 text-sm text-muted">
                Heart, sleep, activity, mobility and overnight vitals are now in
                your dashboard.
              </p>
            </div>
          )}
          <p className="mt-3 text-xs text-faint">
            In this preview, your watch data is a realistic simulation — the
            experience of connecting is what we're showing.
          </p>
        </div>

        {/* Blood results */}
        <div className="card mt-5 p-6">
          <h2 className="text-xl"> Add your blood results</h2>
          <p className="mt-1 text-muted">
            This is where HeartSum goes beyond the watch — your watch can't
            measure cholesterol, blood sugar or inflammation.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="btn-ghost" onClick={() => {}}>
              Enter results by hand
            </button>
            <button className="btn-ghost" onClick={() => {}}>
              Upload a lab report
            </button>
          </div>
          <div className="mt-4 rounded-xl bg-sand p-4">
            <p className="font-medium text-ink">
              ✓ We found {biomarkers.length} results from a recent lab report.
            </p>
            <p className="mt-1 text-sm text-muted">
              Please check these look right — we'll ask you to confirm before
              saving. (Pre-loaded for this preview.)
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              set({ onboarded: true, watchConnected: true });
              nav("/today");
            }}
          >
            Go to my dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
