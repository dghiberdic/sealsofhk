import { useRef, useState } from "react";
import { Check, FileText, Icon, Loader2, Sparkles } from "./icons";
import { extractEHealthFromFile, type EHealthRecord } from "../lib/ehealth";
import type { SupportedMediaType } from "../lib/extractLabs";
import { useStore } from "../lib/store";

const KEY_STORE = "heartsum.anthropicKey";
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

type Phase = "pick" | "ready" | "extracting" | "review" | "saved" | "error";

interface Picked {
  name: string;
  base64: string;
  mediaType: SupportedMediaType;
}

function readFile(file: File): Promise<Picked> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const url = String(reader.result);
      resolve({
        name: file.name,
        base64: url.slice(url.indexOf(",") + 1),
        mediaType: url.slice(5, url.indexOf(";")) as SupportedMediaType,
      });
    };
    reader.readAsDataURL(file);
  });
}

const uniq = (a: string[]) => Array.from(new Set(a.map((s) => s.trim()).filter(Boolean)));

export function EHealthUpload() {
  const { profile, set } = useStore();
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const haveEnvKey = Boolean(envKey);
  const [apiKey, setApiKey] = useState(
    () => envKey || localStorage.getItem(KEY_STORE) || "",
  );
  const [phase, setPhase] = useState<Phase>("pick");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [rec, setRec] = useState<EHealthRecord | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPicked(await readFile(file));
      setError("");
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
      setPhase("error");
    }
  };

  const extract = async () => {
    if (!picked || !apiKey.trim()) return;
    setPhase("extracting");
    setError("");
    try {
      if (!haveEnvKey) localStorage.setItem(KEY_STORE, apiKey.trim());
      const out = await extractEHealthFromFile({
        apiKey: apiKey.trim(),
        base64: picked.base64,
        mediaType: picked.mediaType,
        model: import.meta.env.VITE_ANTHROPIC_MODEL,
      });
      setRec(out);
      setPhase("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed.");
      setPhase("error");
    }
  };

  const save = () => {
    if (!rec) return;
    set({
      profile: {
        ...profile,
        conditions: uniq([...profile.conditions, ...rec.conditions]),
        medications: uniq([...profile.medications, ...rec.medications]),
        allergies: uniq([...profile.allergies, ...rec.allergies]),
        diabetes: profile.diabetes || rec.diabetes,
        onBpMeds: profile.onBpMeds || rec.onBpMeds,
        smoker: rec.smoker ?? profile.smoker,
      },
    });
    setPhase("saved");
  };

  const Row = ({ label, items }: { label: string; items: string[] }) => (
    <div className="border-t border-hair py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </div>
      {items.length ? (
        <ul className="mt-0.5 text-sm text-ink">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-faint">none found</div>
      )}
    </div>
  );

  return (
    <div className="mt-4 rounded-input border border-clay/30 bg-clay-tint/30 p-5">
      <h3 className="flex items-center gap-2 text-lg">
        <Icon icon={FileText} size={20} className="text-clay" />
        Upload your eHealth / clinical record
      </h3>
      <p className="mt-1 text-sm text-muted">
        A photo or PDF of your medical summary (conditions, medications,
        allergies). Claude reads it; you confirm before it updates your profile.
      </p>

      {!haveEnvKey && (
        <div className="mt-4">
          <label className="field-label">Your Anthropic API key</label>
          <input
            className="field font-mono text-sm"
            type="password"
            placeholder="sk-ant-…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
          />
          <p className="mt-1.5 text-xs text-faint">
            Sent directly from your browser to Anthropic. Stored only on this
            device.
          </p>
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {(phase === "pick" || phase === "error") && (
        <button className="btn-ghost mt-4" onClick={() => fileInput.current?.click()}>
          <Icon icon={FileText} size={18} />
          Choose a photo or PDF
        </button>
      )}

      {picked && phase !== "pick" && (
        <p className="mt-3 text-sm text-muted">
          {picked.name} ·{" "}
          <button
            className="text-clay-deep hover:underline"
            onClick={() => fileInput.current?.click()}
          >
            change
          </button>
        </p>
      )}

      {phase === "ready" && (
        <button
          className="btn-primary mt-4 disabled:opacity-50"
          onClick={extract}
          disabled={!apiKey.trim()}
        >
          <Icon icon={Sparkles} size={18} />
          Read it with Claude
        </button>
      )}

      {phase === "extracting" && (
        <div className="mt-4 flex items-center gap-2 text-muted">
          <Icon icon={Loader2} size={18} className="animate-spin text-clay" />
          Reading your record…
        </div>
      )}

      {phase === "error" && (
        <p className="mt-3 rounded-input bg-brick-tint/60 p-3 text-sm text-brick">
          {error}
        </p>
      )}

      {phase === "review" && rec && (
        <div className="mt-4">
          <Row label="Conditions" items={rec.conditions} />
          <Row label="Medications" items={rec.medications} />
          <Row label="Allergies" items={rec.allergies} />
          <p className="mt-2 text-xs text-faint">
            {rec.diabetes ? "Diabetes flagged. " : ""}
            {rec.onBpMeds ? "On blood-pressure medication. " : ""}
            {rec.smoker ? `Smoking: ${rec.smoker}.` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={save}>
              <Icon icon={Check} size={18} />
              Add to my profile
            </button>
            <button className="btn-ghost" onClick={() => setPhase("ready")}>
              Try another file
            </button>
          </div>
        </div>
      )}

      {phase === "saved" && (
        <div className="mt-4 rounded-input bg-sage-tint p-4">
          <p className="flex items-center gap-1.5 font-medium text-ink">
            <Icon icon={Check} size={18} className="text-sage" />
            Added to your profile — it'll appear in your report.
          </p>
        </div>
      )}
    </div>
  );
}
