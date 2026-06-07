import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildInsights,
  buildQuestions,
  overallStatus,
} from "./insights";
import {
  defaultProfile,
  generateEcg,
  generateMetrics,
  generateRhythmEvents,
  generateVo2,
  sampleBiomarkers,
} from "./sampleData";
import { framingham } from "./framingham";
import { cha2ds2vasc } from "./cha2ds2vasc";
import { assessWatch } from "./rules";
import { DEFAULT_TG_CHAT_ID, DEFAULT_TG_TOKEN } from "./telegram";
import type {
  Biomarker,
  DayMetric,
  DoctorQuestion,
  EcgReading,
  Lang,
  Profile,
  RhythmEvent,
} from "./types";

const KEY = "heartsum.v1";

interface Persisted {
  onboarded: boolean;
  watchConnected: boolean;
  profile: Profile;
  biomarkers: Biomarker[];
  // Real uploaded Apple Health data. When null, the app falls back to the
  // built-in sample series so screens still render before anything is imported.
  uploadedMetrics: DayMetric[] | null;
  uploadedEcg: EcgReading[] | null;
  uploadedRhythm: RhythmEvent[] | null;
  uploadedVo2: { date: string; value: number }[] | null;
  // checklist + custom questions live here
  checkedQ: string[];
  customQ: DoctorQuestion[];
  dark: boolean;
  carerName: string | null;
  lang: Lang;
  // Telegram carer alerts (browser → Telegram Bot API). Token is a user secret.
  tgToken: string;
  tgChatId: string;
  tgAuto: boolean; // auto-send when status crosses into yellow/red
  tgLastStatus: "green" | "yellow" | "red" | null; // dedupe so we don't re-send
}

const initial: Persisted = {
  onboarded: false,
  watchConnected: false,
  profile: defaultProfile,
  biomarkers: sampleBiomarkers,
  uploadedMetrics: null,
  uploadedEcg: null,
  uploadedRhythm: null,
  uploadedVo2: null,
  checkedQ: [],
  customQ: [],
  dark: false,
  carerName: null,
  lang: "en",
  tgToken: DEFAULT_TG_TOKEN,
  tgChatId: DEFAULT_TG_CHAT_ID,
  tgAuto: false,
  tgLastStatus: null,
};

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    // Deep-merge the profile so older saved state gains any newly-added fields
    // (e.g. allergies, clinical flags) rather than crashing on undefined.
    return {
      ...initial,
      ...parsed,
      profile: { ...defaultProfile, ...(parsed.profile ?? {}) },
      // Hardcoded Telegram defaults win when nothing was saved/entered.
      tgToken: parsed.tgToken || initial.tgToken,
      tgChatId: parsed.tgChatId || initial.tgChatId,
    };
  } catch {
    return initial;
  }
}

interface StoreValue extends Persisted {
  set: (patch: Partial<Persisted>) => void;
  reset: () => void;
  // derived
  metrics: ReturnType<typeof generateMetrics>;
  vo2: ReturnType<typeof generateVo2>;
  ecg: ReturnType<typeof generateEcg>;
  rhythmEvents: ReturnType<typeof generateRhythmEvents>;
  insights: ReturnType<typeof buildInsights>;
  questions: DoctorQuestion[];
  overall: ReturnType<typeof overallStatus>;
  framingham: ReturnType<typeof framingham>;
  cha: ReturnType<typeof cha2ds2vasc>;
  watch: ReturnType<typeof assessWatch>;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.dark);
  }, [state.dark]);

  useEffect(() => {
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
  }, [state.lang]);

  // Use the user's uploaded Apple Health data once it exists; until then, fall
  // back to the built-in sample series so the dashboard still renders.
  const metrics = useMemo(
    () => state.uploadedMetrics ?? generateMetrics(),
    [state.uploadedMetrics],
  );
  const ecg = useMemo(
    () => state.uploadedEcg ?? generateEcg(),
    [state.uploadedEcg],
  );
  const rhythmEvents = useMemo(
    () => state.uploadedRhythm ?? generateRhythmEvents(),
    [state.uploadedRhythm],
  );
  // VO₂ max isn't in the basic export — if watch data was uploaded but no VO₂
  // file came with it, there simply is no cardio-fitness reading (no fake data).
  const vo2 = useMemo(
    () =>
      state.uploadedMetrics ? state.uploadedVo2 ?? [] : generateVo2(),
    [state.uploadedMetrics, state.uploadedVo2],
  );

  // Real, deterministic computations: Framingham CVD risk + watch trend rules.
  const fram = useMemo(
    () => framingham(state.profile, state.biomarkers),
    [state.profile, state.biomarkers],
  );
  const cha = useMemo(
    () => cha2ds2vasc(state.profile, state.biomarkers, ecg),
    [state.profile, state.biomarkers, ecg],
  );
  const watch = useMemo(
    () => assessWatch(metrics, ecg, rhythmEvents, state.profile.name),
    [metrics, ecg, rhythmEvents, state.profile.name],
  );

  const insights = useMemo(
    () => buildInsights(metrics, vo2, state.biomarkers, state.profile, fram),
    [metrics, vo2, state.biomarkers, state.profile, fram],
  );

  const generated = useMemo(() => buildQuestions(insights), [insights]);
  const questions = useMemo(
    () => [...generated, ...state.customQ],
    [generated, state.customQ],
  );

  const overall = useMemo(() => overallStatus(insights), [insights]);

  const value: StoreValue = {
    ...state,
    set: (patch) => setState((s) => ({ ...s, ...patch })),
    reset: () => setState(initial),
    metrics,
    vo2,
    ecg,
    rhythmEvents,
    insights,
    questions,
    overall,
    framingham: fram,
    cha,
    watch,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
