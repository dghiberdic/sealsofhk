import { useState } from "react";
import { Link } from "react-router-dom";
import { TierPips } from "../components/ui";
import { ArrowRight, Check, FilePlus2, Icon, Plus } from "../components/icons";
import { useT } from "../lib/i18n";
import { useStore } from "../lib/store";
import type { DoctorQuestion } from "../lib/types";

export function AskDoctor() {
  const { questions, checkedQ, customQ, set } = useStore();
  const { t, lang } = useT();
  const [draft, setDraft] = useState("");

  const toggle = (id: string) => {
    set({
      checkedQ: checkedQ.includes(id)
        ? checkedQ.filter((x) => x !== id)
        : [...checkedQ, id],
    });
  };

  const addCustom = () => {
    const text = draft.trim();
    if (!text) return;
    const q: DoctorQuestion = {
      id: `custom-${Date.now()}`,
      text,
      why: "Added by you.",
      tier: 3,
      source: "watch",
      custom: true,
    };
    // Tick it by default — if you bothered to add it, you mean to raise it.
    set({ customQ: [...customQ, q], checkedQ: [...checkedQ, q.id] });
    setDraft("");
  };

  const removeCustom = (id: string) =>
    set({
      customQ: customQ.filter((q) => q.id !== id),
      checkedQ: checkedQ.filter((x) => x !== id),
    });

  return (
    <div className="max-w-readable">
      <h1 className="text-3xl md:text-4xl">{t("ask.h1")}</h1>
      <p className="mt-2 text-muted">
        {t("ask.intro")}
      </p>

      <div className="mt-8 space-y-3">
        {questions.length === 0 && (
          <div className="card p-6 text-muted">
            {lang === "zh" ? "目前沒有標示任何事——這是好消息。你仍可在下方加入自己的問題。" : "Nothing flagged right now — which is good news. You can still add your own questions below."}
          </div>
        )}
        {questions.map((q) => {
          const on = checkedQ.includes(q.id);
          return (
            <div key={q.id} className="card flex gap-4 p-5">
              <button
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(q.id)}
                aria-label={`Include: ${q.text}`}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-[1.5px] transition ${
                  on
                    ? "border-clay bg-clay text-paper"
                    : "border-hair-strong bg-paper"
                }`}
              >
                {on && <Icon icon={Check} size={15} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium leading-snug text-ink">
                  {lang === "zh" ? q.textZh ?? q.text : q.text}
                </p>
                <p className="mt-1 text-sm text-muted">{q.why}</p>
                <div className="mt-2 flex items-center gap-3">
                  {!q.custom && <TierPips tier={q.tier} />}
                  {q.insightId && (
                    <Link
                      to={`/insight/${q.insightId}`}
                      className="link inline-flex items-center gap-1 text-sm"
                    >
                      {t("ask.seeWhy")} <Icon icon={ArrowRight} size={14} />
                    </Link>
                  )}
                  {q.custom && (
                    <button
                      onClick={() => removeCustom(q.id)}
                      className="text-sm text-faint hover:text-brick"
                    >
                      {lang === "zh" ? "移除" : "remove"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-5 p-5">
        <label className="field-label">{t("ask.add")}</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="field flex-1"
            placeholder={lang === "zh" ? "例如：我偶爾頭暈，需要擔心嗎？" : "e.g. Should I worry about my occasional dizziness?"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <button className="btn-ghost" onClick={addCustom}>
            <Icon icon={Plus} size={18} />
            {t("ask.addBtn")}
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-clay-tint/60 p-5">
        <p className="text-muted">
          {lang === "zh" ? `已選 ${checkedQ.length} / ${questions.length} 項，準備好放入報告。` : `${checkedQ.length} of ${questions.length} ready for your report.`}
        </p>
        <Link to="/report" className="btn-primary">
          <Icon icon={FilePlus2} size={18} />
          {t("ask.build")}
        </Link>
      </div>
    </div>
  );
}
