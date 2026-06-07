import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, FileText, Icon, Watch } from "../components/icons";
import { LabPhotoUpload } from "../components/LabPhotoUpload";
import { WatchUpload } from "../components/WatchUpload";
import { EHealthUpload } from "../components/EHealthUpload";
import { LangToggle } from "../components/ui";
import { useT } from "../lib/i18n";
import { useStore } from "../lib/store";

export function Connect() {
  const nav = useNavigate();
  const { set } = useStore();
  const { t } = useT();
  const [showLab, setShowLab] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-readable px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-clay-deep">{t("connect.step")}</p>
          <LangToggle />
        </div>
        <h1 className="mt-1 text-3xl">{t("connect.h1")}</h1>
        <p className="mt-2 text-muted">
          {t("connect.intro")}
        </p>

        {/* Apple Health */}
        <div className="card mt-8 p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={Watch} size={22} className="text-clay" />
            {t("connect.watchTitle")}
          </h2>
          <p className="mt-1 text-muted">
            {t("connect.watchBody")}
          </p>
          <WatchUpload />
        </div>

        {/* Blood results */}
        <div className="card mt-5 p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={Droplet} size={22} className="text-clay" />
            {t("connect.bloodTitle")}
          </h2>
          <p className="mt-1 text-muted">
            {t("connect.bloodBody")}
          </p>
          <button
            className="btn-ghost mt-4"
            onClick={() => setShowLab((s) => !s)}
          >
            {t("connect.bloodBtn")}
          </button>
          {showLab && <LabPhotoUpload onClose={() => setShowLab(false)} />}
        </div>

        {/* eHealth / clinical record */}
        <div className="card mt-5 p-6">
          <h2 className="flex items-center gap-2 text-xl">
            <Icon icon={FileText} size={22} className="text-clay" />
            {t("connect.ehealthTitle")}
          </h2>
          <p className="mt-1 text-muted">
            {t("connect.ehealthBody")}
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
            {t("connect.go")}
          </button>
        </div>
      </div>
    </div>
  );
}
