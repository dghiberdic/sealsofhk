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
  generateMetrics,
  generateVo2,
  sampleBiomarkers,
} from "./sampleData";
import type { Biomarker, DoctorQuestion, Profile } from "./types";

const KEY = "heartsum.v1";

interface Persisted {
  onboarded: boolean;
  watchConnected: boolean;
  profile: Profile;
  biomarkers: Biomarker[];
  // checklist + custom questions live here
  checkedQ: string[];
  customQ: DoctorQuestion[];
  dark: boolean;
  carerName: string | null;
}

const initial: Persisted = {
  onboarded: false,
  watchConnected: false,
  profile: defaultProfile,
  biomarkers: sampleBiomarkers,
  checkedQ: [],
  customQ: [],
  dark: false,
  carerName: null,
};

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
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
  insights: ReturnType<typeof buildInsights>;
  questions: DoctorQuestion[];
  overall: ReturnType<typeof overallStatus>;
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

  // The watch series is simulated and stable for the demo.
  const metrics = useMemo(() => generateMetrics(), []);
  const vo2 = useMemo(() => generateVo2(), []);

  const insights = useMemo(
    () => buildInsights(metrics, vo2, state.biomarkers, state.profile),
    [metrics, vo2, state.biomarkers, state.profile],
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
    insights,
    questions,
    overall,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
