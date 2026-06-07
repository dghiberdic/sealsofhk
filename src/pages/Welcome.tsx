import { useNavigate } from "react-router-dom";
import { Brandmark, LangToggle } from "../components/ui";
import { useT } from "../lib/i18n";
import { useStore } from "../lib/store";

export function Welcome() {
  const nav = useNavigate();
  const { set, profile } = useStore();
  const { t } = useT();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-readable flex-col px-6 py-12 md:py-20">
        <div className="mb-8 flex items-start justify-between gap-4">
          <Brandmark size={48} tagline />
          <LangToggle />
        </div>

        <h1 className="text-4xl leading-tight md:text-5xl">{t("welcome.h1")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {t("welcome.intro")}
        </p>

        <div className="mt-8 space-y-3">
          <div className="card p-5">
            <h2 className="text-lg">{t("welcome.isTitle")}</h2>
            <p className="mt-1 text-muted">{t("welcome.isBody")}</p>
          </div>
          <div className="card p-5">
            <h2 className="text-lg">{t("welcome.isntTitle")}</h2>
            <p className="mt-1 text-muted">{t("welcome.isntBody")}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button className="btn-primary flex-1" onClick={() => nav("/profile")}>
            {t("welcome.start")}
          </button>
          <button
            className="btn-ghost flex-1"
            onClick={() => {
              set({ profile: { ...profile, setUpByCarer: true } });
              nav("/profile");
            }}
          >
            {t("welcome.carer")}
          </button>
        </div>
      </div>
    </div>
  );
}
