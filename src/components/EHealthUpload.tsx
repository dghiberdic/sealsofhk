import { useRef, useState } from "react";
import { Check, FileText, Icon, Loader2, Sparkles } from "./icons";
import { extractEHealthFromFile, type EHealthRecord } from "../lib/ehealth";
import { applyExtraction, type SupportedMediaType } from "../lib/extractLabs";
import { parseFhirBundle, type FhirParseResult } from "../lib/fhir";
import { useStore } from "../lib/store";

const KEY_STORE = "heartsum.anthropicKey";
// FHIR JSON is parsed locally; PDF/photo go to Claude.
const ACCEPT = "application/json,.json,image/jpeg,image/png,image/webp,application/pdf";

type Phase =
  | "pick"
  | "docReady"
  | "extracting"
  | "docReview"
  | "fhirReview"
  | "saved"
  | "error";

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

const uniq = (a: string[]) =>
  Array.from(new Set(a.map((s) => s.trim()).filter(Boolean)));
const isJson = (f: File) =>
  f.type === "application/json" || f.name.toLowerCase().endsWith(".json");

export function EHealthUpload() {
  const { profile, biomarkers, set } = useStore();
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const haveEnvKey = Boolean(envKey);
  const [apiKey, setApiKey] = useState(
    () => envKey || localStorage.getItem(KEY_STORE) || "",
  );
  const [phase, setPhase] = useState<Phase>("pick");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [rec, setRec] = useState<EHealthRecord | null>(null);
  const [fhir, setFhir] = useState<FhirParseResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setFileName(file.name);
    try {
      if (isJson(file)) {
        // FHIR bundle — parse on-device, no key needed.
        setFhir(parseFhirBundle(JSON.parse(await file.text())));
        setPhase("fhirReview");
      } else {
        setPicked(await readFile(file));
        setPhase("docReady");
      }
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
      setRec(
        await extractEHealthFromFile({
          apiKey: apiKey.trim(),
          base64: picked.base64,
          mediaType: picked.mediaType,
          model: import.meta.env.VITE_ANTHROPIC_MODEL,
        }),
      );
      setPhase("docReview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed.");
      setPhase("error");
    }
  };

  const saveDoc = () => {
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

  const saveFhir = () => {
    if (!fhir) return;
    const p = fhir.patch;
    set({
      profile: {
        ...profile,
        name: p.name || profile.name,
        sex: p.sex ?? profile.sex,
        conditions: uniq([...profile.conditions, ...p.conditions]),
        medications: uniq([...profile.medications, ...p.medications]),
        allergies: uniq([...profile.allergies, ...p.allergies]),
        diabetes: profile.diabetes || p.diabetes,
        onBpMeds: profile.onBpMeds || p.onBpMeds,
      },
      // A FHIR bundle can also carry lab/vital Observations — merge those in.
      biomarkers: fhir.labs.length
        ? applyExtraction(biomarkers, fhir.labs, fhir.collectionDate)
        : biomarkers,
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
        A <strong>FHIR R4 bundle</strong> (<code className="text-clay-deep">.json</code>,
        e.g. an eHealth / EHR export) is read on your device. A photo or PDF of a
        medical summary is read by Claude. Either way, you confirm before
        anything changes.
      </p>

      {/* Key only matters for the photo/PDF path */}
      {!haveEnvKey && phase !== "fhirReview" && (
        <div className="mt-4">
          <label className="field-label">
            Anthropic API key{" "}
            <span className="font-normal text-faint">(only for photo / PDF)</span>
          </label>
          <input
            className="field font-mono text-sm"
            type="password"
            placeholder="sk-ant-…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
          />
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
          Choose a FHIR bundle, photo, or PDF
        </button>
      )}

      {fileName && phase !== "pick" && phase !== "saved" && (
        <p className="mt-3 text-sm text-muted">
          {fileName} ·{" "}
          <button
            className="text-clay-deep hover:underline"
            onClick={() => fileInput.current?.click()}
          >
            change
          </button>
        </p>
      )}

      {phase === "docReady" && (
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

      {phase === "docReview" && rec && (
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
            <button className="btn-primary" onClick={saveDoc}>
              <Icon icon={Check} size={18} />
              Add to my profile
            </button>
            <button className="btn-ghost" onClick={() => setPhase("docReady")}>
              Try another file
            </button>
          </div>
        </div>
      )}

      {phase === "fhirReview" && fhir && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Icon icon={Check} size={16} className="text-sage" />
            Read a valid FHIR bundle{fhir.patch.name ? ` for ${fhir.patch.name}` : ""}.
          </p>
          <Row label="Conditions" items={fhir.patch.conditions} />
          <Row label="Medications" items={fhir.patch.medications} />
          <Row label="Allergies" items={fhir.patch.allergies} />
          {fhir.labs.length > 0 && (
            <Row
              label="Lab & vital results"
              items={fhir.labs.map((l) => `${l.name}: ${l.value} ${l.unit}`)}
            />
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={saveFhir}>
              <Icon icon={Check} size={18} />
              Add to my profile
            </button>
            <button className="btn-ghost" onClick={() => fileInput.current?.click()}>
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
