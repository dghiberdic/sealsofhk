import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Droplet, FileText, Icon, Watch } from "../components/icons";
import { LabPhotoUpload } from "../components/LabPhotoUpload";
import { useStore } from "../lib/store";

type Phase = "idle" | "importing" | "done";

export function Connect() {
  const nav = useNavigate();
  const { set, biomarkers } = useStore();
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const runImport = () => {
    setPhase("importing");
    const steps = [
      "Connecting to Apple Health…",
      "Reading your last 90 days…",
      "Bringing in heart rate, HRV & walking heart rate…",
      "Reading ECG classifications & rhythm history…",
      "Bringing in blood oxygen, sleep & overnight vitals…",
      "Learning your personal 30-day baseline…",
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
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={Watch} size={22} className="text-clay" />
            Connect your Apple Watch & Health
          </h2>
          <p className="mt-1 text-muted">
            We'll bring in resting & walking heart rate, HRV, blood oxygen, ECG
            classifications, rhythm notifications, steps, sleep and overnight
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
            <div className="mt-4 rounded-input bg-sage-tint p-4 text-sage">
              <p className="flex items-center gap-1.5 font-medium text-ink">
                <Icon icon={Check} size={18} className="text-sage" />
                All set — we've brought in your last 90 days.
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
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={Droplet} size={22} className="text-clay" />
            Add your blood results
          </h2>
          <p className="mt-1 text-muted">
            This is where HeartSum goes beyond the watch — your watch can't
            measure cholesterol, blood sugar or inflammation.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="btn-ghost" onClick={() => {}}>
              Enter results by hand
            </button>
            <button
              className="btn-ghost"
              onClick={() => setShowUpload((s) => !s)}
            >
              Photograph a lab report
            </button>
          </div>

          {showUpload && (
            <LabPhotoUpload onClose={() => setShowUpload(false)} />
          )}
          <div className="mt-4 rounded-input bg-sand p-4">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              <Icon icon={Check} size={18} className="text-sage" />
              We found {biomarkers.length} results from a recent lab report.
            </p>
            <p className="mt-1 text-sm text-muted">
              Please check these look right — we'll ask you to confirm before
              saving. (Pre-loaded for this preview.)
            </p>
          </div>
        </div>

        {/* eHealth / clinical record */}
        <div className="card mt-5 p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={FileText} size={22} className="text-clay" />
            Link your eHealth record
          </h2>
          <p className="mt-1 text-muted">
            Your existing conditions, medications and allergies, pulled from Hong
            Kong's eHealth record — so your report shows what you're already on.
          </p>
          <div className="mt-4 rounded-input bg-sand p-4">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              <Icon icon={Check} size={18} className="text-sage" />
              Linked — conditions, medications & allergies imported.
            </p>
            <p className="mt-1 text-sm text-muted">
              In this preview the eHealth record is mocked as a FHIR R4 bundle.
              In production this needs HCP registration and your sharing consent
              under the eHRSS Ordinance (Cap. 625).
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
