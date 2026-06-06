import { useState } from "react";
import { Link } from "react-router-dom";
import { TierBadge } from "../components/ui";
import { useStore } from "../lib/store";
import type { DoctorQuestion } from "../lib/types";

export function AskDoctor() {
  const { questions, checkedQ, customQ, set } = useStore();
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
      <h1 className="text-3xl md:text-4xl">What to ask your doctor</h1>
      <p className="mt-2 text-muted">
        These questions come straight from your own flagged signals and blood
        work — specific, plain, and ready for the room. Tick the ones you want to
        raise, add your own, and they'll all flow into your doctor report.
      </p>

      <div className="mt-8 space-y-3">
        {questions.length === 0 && (
          <div className="card p-6 text-muted">
            Nothing flagged right now — which is good news. You can still add
            your own questions below.
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
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                  on
                    ? "border-clay bg-clay text-paper"
                    : "border-hair bg-paper"
                }`}
              >
                {on && "✓"}
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{q.text}</p>
                <p className="mt-1 text-sm text-muted">{q.why}</p>
                <div className="mt-2 flex items-center gap-2">
                  {!q.custom && <TierBadge tier={q.tier} />}
                  {q.insightId && (
                    <Link
                      to={`/insight/${q.insightId}`}
                      className="link text-sm"
                    >
                      see why →
                    </Link>
                  )}
                  {q.custom && (
                    <button
                      onClick={() => removeCustom(q.id)}
                      className="text-sm text-faint hover:text-brick"
                    >
                      remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-5 p-5">
        <label className="field-label">Add your own question</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="field flex-1"
            placeholder="e.g. Should I worry about my occasional dizziness?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <button className="btn-ghost" onClick={addCustom}>
            Add
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-clay-tint/60 p-5">
        <p className="text-muted">
          {checkedQ.length} of {questions.length} ready for your report.
        </p>
        <Link to="/report" className="btn-primary">
          Build the report →
        </Link>
      </div>
    </div>
  );
}
