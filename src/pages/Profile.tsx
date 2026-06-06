import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

export function ProfileSetup() {
  const nav = useNavigate();
  const { profile, set } = useStore();
  const [p, setP] = useState(profile);

  const update = (patch: Partial<typeof p>) => setP({ ...p, ...patch });

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-readable px-6 py-12">
        <p className="text-sm font-medium text-clay-deep">Step 1 of 2</p>
        <h1 className="mt-1 text-3xl">A little about you</h1>
        <p className="mt-2 text-muted">
          This helps us read your numbers the way they apply to <em>you</em>.
          Nothing here is required, and you can change it any time. It's not a
          medical form — just a friendly hello.
        </p>

        <div className="mt-8 space-y-6">
          <div className="card p-5">
            <label className="field-label">What should we call you?</label>
            <input
              className="field"
              value={p.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="field-label">Age</label>
              <input
                className="field"
                type="number"
                value={p.age}
                onChange={(e) => update({ age: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="field-label">Sex</label>
              <select
                className="field"
                value={p.sex}
                onChange={(e) => update({ sex: e.target.value as never })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other / prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="field-label">Height (cm)</label>
              <input
                className="field"
                type="number"
                value={p.heightCm}
                onChange={(e) => update({ heightCm: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="field-label">Weight (kg)</label>
              <input
                className="field"
                type="number"
                value={p.weightKg}
                onChange={(e) => update({ weightKg: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="card p-5">
            <label className="field-label">
              Known conditions{" "}
              <span className="text-faint">— separate with commas</span>
            </label>
            <input
              className="field"
              value={p.conditions.join(", ")}
              onChange={(e) =>
                update({
                  conditions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. borderline high blood pressure"
            />
            <p className="mt-2 text-sm text-faint">
              Helps us know which signals matter most for you.
            </p>
          </div>

          <div className="card p-5">
            <label className="field-label">Current medications</label>
            <input
              className="field"
              value={p.medications.join(", ")}
              onChange={(e) =>
                update({
                  medications: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. none, or list them"
            />
            <p className="mt-2 text-sm text-faint">
              We only use this for your doctor report. We'll never suggest
              changing anything.
            </p>
          </div>

          <div className="card p-5">
            <label className="field-label">
              Family history{" "}
              <span className="text-faint">— especially heart & metabolic</span>
            </label>
            <input
              className="field"
              value={p.familyHistory.join(", ")}
              onChange={(e) =>
                update({
                  familyHistory: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. father — heart disease"
            />
            <p className="mt-2 text-sm text-faint">
              Family heart history helps us know which numbers to watch closely.
            </p>
          </div>

          <div className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="field-label">Smoking</label>
              <select
                className="field"
                value={p.smoker}
                onChange={(e) => update({ smoker: e.target.value as never })}
              >
                <option value="never">Never smoked</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </select>
            </div>
            <div>
              <label className="field-label">Activity level</label>
              <select
                className="field"
                value={p.activity}
                onChange={(e) => update({ activity: e.target.value as never })}
              >
                <option value="low">Mostly resting</option>
                <option value="moderate">Moderately active</option>
                <option value="high">Very active</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              set({ profile: p });
              nav("/connect");
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
