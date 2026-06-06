import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

// Lucide icons, rendered at stroke-width 1.75 for the thin, calm, friendly line
// the HeartSum brand calls for. Use <Icon icon={Sun} /> everywhere — never emoji
// or unicode glyphs as icons.
type IconProps = LucideProps & { icon: ComponentType<LucideProps> };

export function Icon({
  icon: Glyph,
  size = 20,
  strokeWidth = 1.75,
  ...rest
}: IconProps) {
  return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}

// The single icon set the app draws from — re-exported so usage stays tidy.
export {
  HeartPulse,
  Sun,
  Heart,
  Flame,
  MessagesSquare,
  FileText,
  BookOpen,
  Settings,
  ClipboardList,
  Activity,
  Moon,
  Footprints,
  Gauge,
  Wind,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  BarChart3,
  Download,
  Link as LinkIcon,
  FilePlus2,
  FileCheck2,
  Info,
  Sparkles,
  BellOff,
  Watch,
  Droplet,
  UserPlus,
  Trash2,
  Plug,
} from "lucide-react";
