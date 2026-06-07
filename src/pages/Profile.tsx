import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LangToggle } from "../components/ui";
import { useT, type StrKey } from "../lib/i18n";
import { useStore } from "../lib/store";

export function ProfileSetup() {
  const nav = useNavigate();
  const { profile, set } = useStore();
  const { t } = useT();
  const [p, setP] = useState(profile);

  const update = (patch: Partial<typeof p>) => setP({ ...p, ...patch });

  const healthQs: [keyof typeof p, StrKey][] = [
    ["onBpMeds", "profile.q.onBpMeds"],
    ["diabetes", "profile.q.diabetes"],
    ["priorStroke", "profile.q.priorStroke"],
    ["priorHeartFailure", "profile.q.priorHeartFailure"],
    ["knownVascularDisease", "profile.q.knownVascularDisease"],
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-readable px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-clay-deep">{t("profile.step")}</p>
          <LangToggle />
        </div>
        <h1 className="mt-1 text-3xl">{t("profile.h1")}</h1>
        <p className="mt-2 text-muted">{t("profile.intro")}</p>

        <div className="mt-8 space-y-6">
          <div className="card p-5">
            <label className="field-label">{t("profile.name")}</label>
            <input
              className="field"
              value={p.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder={t("profile.namePlaceholder")}
            />
          </div>

          <div className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="field-label">{t("profile.age")}</label>
              <input
                className="field"
                type="number"
                value={p.age}
                onChange={(e) => update({ age: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="field-label">{t("profile.sex")}</label>
              <select
                className="field"
                value={p.sex}
                onChange={(e) => update({ sex: e.target.value as never })}
              >
                <option value="female">{t("profile.sex.female")}</option>
                <option value="male">{t("profile.sex.male")}</option>
                <option value="other">{t("profile.sex.other")}</option>
              </select>
            </div>
            <div>
              <label className="field-label">{t("profile.height")}</label>
              <input
                className="field"
                type="number"
                value={p.heightCm}
                onChange={(e) => update({ heightCm: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="field-label">{t("profile.weight")}</label>
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
              {t("profile.conditions")}{" "}
              <span className="text-faint">{t("profile.commaHint")}</span>
            </label>
            <input
              className="field"
              value={p.conditions.join(", ")}
              onChange={(e) =>
                update({
                  conditions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder={t("profile.conditionsPlaceholder")}
            />
            <p className="mt-2 text-sm text-faint">{t("profile.conditionsHint")}</p>
          </div>

          <div className="card p-5">
            <label className="field-label">{t("profile.meds")}</label>
            <input
              className="field"
              value={p.medications.join(", ")}
              onChange={(e) =>
                update({
                  medications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder={t("profile.medsPlaceholder")}
            />
            <p className="mt-2 text-sm text-faint">{t("profile.medsHint")}</p>
          </div>

          <div className="card p-5">
            <label className="field-label">
              {t("profile.family")}{" "}
              <span className="text-faint">{t("profile.familySub")}</span>
            </label>
            <input
              className="field"
              value={p.familyHistory.join(", ")}
              onChange={(e) =>
                update({
                  familyHistory: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder={t("profile.familyPlaceholder")}
            />
            <p className="mt-2 text-sm text-faint">{t("profile.familyHint")}</p>
          </div>

          <div className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="field-label">{t("profile.smoking")}</label>
              <select
                className="field"
                value={p.smoker}
                onChange={(e) => update({ smoker: e.target.value as never })}
              >
                <option value="never">{t("profile.smoking.never")}</option>
                <option value="former">{t("profile.smoking.former")}</option>
                <option value="current">{t("profile.smoking.current")}</option>
              </select>
            </div>
            <div>
              <label className="field-label">{t("profile.activity")}</label>
              <select
                className="field"
                value={p.activity}
                onChange={(e) => update({ activity: e.target.value as never })}
              >
                <option value="low">{t("profile.activity.low")}</option>
                <option value="moderate">{t("profile.activity.moderate")}</option>
                <option value="high">{t("profile.activity.high")}</option>
              </select>
            </div>
          </div>

          <div className="card p-5">
            <label className="field-label">
              {t("profile.allergies")}{" "}
              <span className="text-faint">{t("profile.commaHint")}</span>
            </label>
            <input
              className="field"
              value={p.allergies.join(", ")}
              onChange={(e) =>
                update({
                  allergies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder={t("profile.allergiesPlaceholder")}
            />
            <p className="mt-2 text-sm text-faint">{t("profile.allergiesHint")}</p>
          </div>

          <div className="card p-5">
            <p className="field-label">{t("profile.health")}</p>
            <p className="mb-3 text-sm text-faint">{t("profile.healthHint")}</p>
            <div className="space-y-2.5">
              {healthQs.map(([key, labelKey]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-clay"
                    checked={p[key] as boolean}
                    onChange={(e) => update({ [key]: e.target.checked } as never)}
                  />
                  <span className="text-ink">{t(labelKey)}</span>
                </label>
              ))}
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
            {t("profile.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
