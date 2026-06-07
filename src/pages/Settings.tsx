import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Download, Icon, Trash2 } from "../components/icons";
import { useT } from "../lib/i18n";
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
  const { profile, biomarkers, watchConnected, dark, carerName, lang, set, reset } =
    useStore();
  const { t } = useT();
  const nav = useNavigate();
  const [carer, setCarer] = useState(carerName ?? "");

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, biomarkers }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "heartsum-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-readable">
      <h1 className="text-3xl md:text-4xl">{t("settings.h1")}</h1>
      <p className="mt-2 text-muted">{t("settings.intro")}</p>

      <section className="card mt-8 p-6">
        <h2 className="text-xl">{t("settings.language")}</h2>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-muted">{t("settings.languageBody")}</div>
          <div className="flex gap-2">
            {(["en", "zh"] as const).map((l) => (
              <button
                key={l}
                onClick={() => set({ lang: l })}
                className={`pill border ${
                  lang === l
                    ? "border-clay bg-clay-tint text-clay"
                    : "border-hair bg-paper text-muted hover:text-ink"
                }`}
              >
                {l === "en" ? "English" : "繁體中文"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl">{t("settings.connected")}</h2>
        <div className="mt-3 space-y-2 text-muted">
          <div className="flex items-center justify-between">
            <span>{t("settings.watch")}</span>
            <span
              className={`inline-flex items-center gap-1.5 ${watchConnected ? "text-sage-deep" : "text-faint"}`}
            >
              {watchConnected && <Icon icon={Check} size={16} />}
              {watchConnected ? t("settings.connected.yes") : t("settings.connected.no")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("settings.blood")}</span>
            <span className="inline-flex items-center gap-1.5 text-sage-deep">
              <Icon icon={Check} size={16} />
              {biomarkers.length} {t("settings.onFile")}
            </span>
          </div>
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl">{t("settings.carer")}</h2>
        <p className="mt-1 text-muted">{t("settings.carerBody")}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="field flex-1"
            placeholder={lang === "zh" ? "協助者的姓名或電郵" : "Name or email of your helper"}
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
              {t("settings.remove")}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => set({ carerName: carer.trim() || null })}
            >
              {t("settings.grant")}
            </button>
          )}
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl">{t("settings.appearance")}</h2>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-ink">{t("settings.dark")}</div>
            <div className="text-sm text-muted">{t("settings.darkBody")}</div>
          </div>
          <Toggle on={dark} onChange={(v) => set({ dark: v })} label={t("settings.dark")} />
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-xl">{t("settings.control")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-ghost" onClick={exportData}>
            <Icon icon={Download} size={18} />
            {t("settings.export")}
          </button>
          <button
            className="btn-ghost text-brick"
            onClick={() => {
              if (confirm(t("settings.deleteConfirm"))) {
                reset();
                nav("/welcome");
              }
            }}
          >
            <Icon icon={Trash2} size={18} />
            {t("settings.delete")}
          </button>
        </div>
      </section>

      <p className="mt-8 text-sm text-faint">{t("settings.region")}</p>
    </div>
  );
}
