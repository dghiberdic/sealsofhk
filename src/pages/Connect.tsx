import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, FileText, Icon, Watch } from "../components/icons";
import { LabPhotoUpload } from "../components/LabPhotoUpload";
import { WatchUpload } from "../components/WatchUpload";
import { EHealthUpload } from "../components/EHealthUpload";
import { useStore } from "../lib/store";

export function Connect() {
  const nav = useNavigate();
  const { set } = useStore();
  const [showLab, setShowLab] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-readable px-6 py-12">
        <p className="text-sm font-medium text-clay-deep">Step 2 of 2</p>
        <h1 className="mt-1 text-3xl">Bring in your data</h1>
        <p className="mt-2 text-muted">
          Upload what you have — each piece makes the picture richer. It's all
          optional, and you can add more any time.
        </p>

        {/* Apple Health */}
        <div className="card mt-8 p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={Watch} size={22} className="text-clay" />
            Connect your Apple Watch & Health
          </h2>
          <p className="mt-1 text-muted">
            Export your health data and upload the watch CSVs — resting &amp;
            walking heart rate, HRV, blood oxygen, ECG, steps. They're read on
            your device and become your trends and alerts.
          </p>
          <WatchUpload />
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
          <button
            className="btn-ghost mt-4"
            onClick={() => setShowLab((s) => !s)}
          >
            Photograph a lab report
          </button>
          {showLab && <LabPhotoUpload onClose={() => setShowLab(false)} />}
        </div>

        {/* eHealth / clinical record */}
        <div className="card mt-5 p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={FileText} size={22} className="text-clay" />
            Link your eHealth record
          </h2>
          <p className="mt-1 text-muted">
            Your conditions, medications and allergies. In production this comes
            from Hong Kong's eHealth record (eHRSS, Cap. 625) with your consent;
            for now, upload your medical summary and Claude reads it in.
          </p>
          <EHealthUpload />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              set({ onboarded: true });
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
