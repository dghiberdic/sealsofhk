import { useRef, useState } from "react";
import { Check, Icon, Watch } from "./icons";
import { importWatchFiles, type WatchImport } from "../lib/importWatch";
import { useStore } from "../lib/store";

type Phase = "pick" | "ready" | "done";

export function WatchUpload() {
  const { set } = useStore();
  const [phase, setPhase] = useState<Phase>("pick");
  const [result, setResult] = useState<WatchImport | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const onFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setError("");
    try {
      const csvs = Array.from(list).filter((f) => f.name.toLowerCase().endsWith(".csv"));
      if (csvs.length === 0) {
        setError("No .csv files found. Pick the watch_data folder or its CSV files.");
        return;
      }
      const files = await Promise.all(
        csvs.map(async (f) => ({ name: f.name, text: await f.text() })),
      );
      const imported = importWatchFiles(files);
      if (imported.metrics.length === 0) {
        setError("Couldn't read any daily values from those files.");
        return;
      }
      setResult(imported);
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read those files.");
    }
  };

  const apply = () => {
    if (!result) return;
    set({
      uploadedMetrics: result.metrics,
      uploadedEcg: result.ecg,
      uploadedRhythm: result.rhythm,
      uploadedVo2: result.vo2,
      watchConnected: true,
    });
    setPhase("done");
  };

  const days = result?.metrics.length ?? 0;
  const range =
    result && days
      ? `${result.metrics[0].date} → ${result.metrics[days - 1].date}`
      : "";

  return (
    <div className="mt-4 rounded-input border border-clay/30 bg-clay-tint/30 p-5">
      <h3 className="flex items-center gap-2 text-lg">
        <Icon icon={Watch} size={20} className="text-clay" />
        Upload your Apple Health export
      </h3>
      <p className="mt-1 text-sm text-muted">
        Choose the <code className="text-clay-deep">watch_data</code> folder (or
        the individual CSV files in it). Everything is parsed on your device —
        nothing is uploaded.
      </p>

      {/* hidden inputs: a whole folder, or individual CSVs */}
      <input
        ref={folderInput}
        type="file"
        className="hidden"
        // webkitdirectory lets the picker select a whole folder
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        onChange={(e) => onFiles(e.target.files)}
      />
      <input
        ref={fileInput}
        type="file"
        accept=".csv"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {phase !== "done" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-ghost" onClick={() => folderInput.current?.click()}>
            Choose a folder
          </button>
          <button className="btn-ghost" onClick={() => fileInput.current?.click()}>
            Choose CSV files
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-input bg-brick-tint/60 p-3 text-sm text-brick">
          {error}
        </p>
      )}

      {phase === "ready" && result && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Icon icon={Check} size={16} className="text-sage" />
            Read {days} days of data ({range}). Please confirm.
          </p>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {result.summary.map((s) => (
                <tr key={s.label} className="border-t border-hair">
                  <td className="py-1.5 pr-2 text-muted">{s.label}</td>
                  <td className="py-1.5 text-right font-medium text-ink">
                    {s.days} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.warnings.length > 0 && (
            <p className="mt-2 text-xs text-faint">
              {result.warnings.join(" · ")}
            </p>
          )}
          <button className="btn-primary mt-4" onClick={apply}>
            <Icon icon={Check} size={18} />
            Use this data
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="mt-4 rounded-input bg-sage-tint p-4">
          <p className="flex items-center gap-1.5 font-medium text-ink">
            <Icon icon={Check} size={18} className="text-sage" />
            Imported {days} days of watch data — your dashboard now reflects it.
          </p>
        </div>
      )}
    </div>
  );
}
