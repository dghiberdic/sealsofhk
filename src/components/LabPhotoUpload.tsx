import { useRef, useState } from "react";
import { Camera, Check, Icon, Loader2, Sparkles, X } from "./icons";
import {
  applyExtraction,
  extractLabsFromFile,
  type ExtractedLab,
  type SupportedMediaType,
} from "../lib/extractLabs";
import { useStore } from "../lib/store";

const KEY_STORE = "heartsum.anthropicKey";
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

type Phase = "pick" | "ready" | "extracting" | "review" | "saved" | "error";

interface Picked {
  name: string;
  base64: string;
  mediaType: SupportedMediaType;
  previewUrl: string | null; // images only
}

function readFile(file: File): Promise<Picked> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const url = String(reader.result);
      const comma = url.indexOf(",");
      const base64 = url.slice(comma + 1);
      const mediaType = url.slice(5, url.indexOf(";")) as SupportedMediaType;
      resolve({
        name: file.name,
        base64,
        mediaType,
        previewUrl: mediaType.startsWith("image/") ? url : null,
      });
    };
    reader.readAsDataURL(file);
  });
}

export function LabPhotoUpload({ onClose }: { onClose?: () => void }) {
  const { biomarkers, set } = useStore();
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const [apiKey, setApiKey] = useState(
    () => envKey || localStorage.getItem(KEY_STORE) || "",
  );
  const haveEnvKey = Boolean(envKey);

  const [phase, setPhase] = useState<Phase>("pick");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [results, setResults] = useState<ExtractedLab[]>([]);
  const [collectionDate, setCollectionDate] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPicked(await readFile(file));
      setPhase("ready");
      setError("");
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
      const out = await extractLabsFromFile({
        apiKey: apiKey.trim(),
        base64: picked.base64,
        mediaType: picked.mediaType,
        model: import.meta.env.VITE_ANTHROPIC_MODEL,
      });
      setResults(out.results);
      setCollectionDate(out.collectionDate);
      setPhase("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed.");
      setPhase("error");
    }
  };

  const save = () => {
    set({ biomarkers: applyExtraction(biomarkers, results, collectionDate) });
    setPhase("saved");
  };

  const restart = () => {
    setPicked(null);
    setResults([]);
    setCollectionDate(null);
    setError("");
    setPhase("pick");
  };

  return (
    <div className="mt-4 rounded-input border border-clay/30 bg-clay-tint/30 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg">
          <Icon icon={Camera} size={20} className="text-clay" />
          Read a lab report from a photo
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-faint hover:text-ink"
            aria-label="Close"
          >
            <Icon icon={X} size={18} />
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        Snap or upload a photo of a paper report (or a PDF). Claude reads the
        values; you confirm before anything is saved.
      </p>

      {/* API key — only when there isn't one baked into the build */}
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
            Sent directly from your browser to Anthropic to read the image —
            nothing passes through a HeartSum server. Stored only on this device.
          </p>
        </div>
      )}

      {/* File picker */}
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {(phase === "pick" || phase === "error") && (
        <button
          className="btn-ghost mt-4"
          onClick={() => fileInput.current?.click()}
        >
          <Icon icon={Camera} size={18} />
          Choose a photo or PDF
        </button>
      )}

      {picked && phase !== "pick" && (
        <div className="mt-4 flex items-center gap-3">
          {picked.previewUrl ? (
            <img
              src={picked.previewUrl}
              alt="Selected report"
              className="h-20 w-20 rounded-input border border-hair object-cover"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-input border border-hair bg-paper text-xs text-faint">
              PDF
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{picked.name}</p>
            <button
              className="text-xs text-clay-deep hover:underline"
              onClick={() => fileInput.current?.click()}
            >
              Choose a different file
            </button>
          </div>
        </div>
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
          Reading the report…
        </div>
      )}

      {phase === "error" && (
        <p className="mt-3 rounded-input bg-brick-tint/60 p-3 text-sm text-brick">
          {error}
        </p>
      )}

      {phase === "review" && (
        <div className="mt-4">
          {results.length === 0 ? (
            <p className="rounded-input bg-sand p-3 text-sm text-muted">
              Claude couldn't read any values it recognised. Try a clearer,
              well-lit photo of the results table.
            </p>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <Icon icon={Check} size={16} className="text-sage" />
                Found {results.length} value{results.length > 1 ? "s" : ""}
                {collectionDate ? ` · collected ${collectionDate}` : ""}. Please
                check these look right.
              </p>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {results.map((r) => (
                    <tr key={r.key} className="border-t border-hair">
                      <td className="py-1.5 pr-2 text-muted">{r.name}</td>
                      <td className="py-1.5 text-right font-medium text-ink">
                        {r.value} {r.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {results.length > 0 && (
              <button className="btn-primary" onClick={save}>
                <Icon icon={Check} size={18} />
                Save to my results
              </button>
            )}
            <button className="btn-ghost" onClick={restart}>
              Try another photo
            </button>
          </div>
          <p className="mt-3 text-xs text-faint">
            These are self-entered lab results to support — not replace — your
            doctor's review.
          </p>
        </div>
      )}

      {phase === "saved" && (
        <div className="mt-4 rounded-input bg-sage-tint p-4">
          <p className="flex items-center gap-1.5 font-medium text-ink">
            <Icon icon={Check} size={18} className="text-sage" />
            Saved — your results are now in your dashboard and report.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={restart}>
              Read another report
            </button>
            {onClose && (
              <button className="btn-ghost" onClick={onClose}>
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
