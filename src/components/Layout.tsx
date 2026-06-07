import { type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useStore } from "../lib/store";
import { useT, type StrKey } from "../lib/i18n";
import { Brandmark, LangToggle, Reassure, statusMeta } from "./ui";
import {
  Activity,
  BarChart3,
  FileText,
  Icon,
  MessagesSquare,
  Settings,
  Sun,
} from "./icons";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

const nav: {
  to: string;
  key: StrKey;
  icon: ComponentType<LucideProps>;
}[] = [
  { to: "/today", key: "nav.today", icon: Sun },
  { to: "/signals", key: "nav.signals", icon: Activity },
  { to: "/more", key: "nav.more", icon: BarChart3 },
  { to: "/ask", key: "nav.ask", icon: MessagesSquare },
  { to: "/report", key: "nav.report", icon: FileText },
  { to: "/settings", key: "nav.settings", icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const { questions, overall, profile } = useStore();
  const { t, lang } = useT();
  const loc = useLocation();
  const initial = profile.name.trim().charAt(0).toUpperCase() || "M";

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-hair bg-surface-soft px-4 py-6 md:flex">
        <NavLink to="/today" className="mb-6 block px-3">
          <Brandmark />
        </NavLink>
        <div className="mb-3 px-3">
          <LangToggle />
        </div>
        <nav className="flex flex-col gap-0.5">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-input px-3 py-2.5 text-base font-medium transition ${
                  isActive
                    ? "bg-clay-tint font-semibold text-clay"
                    : "text-muted hover:bg-sand hover:text-ink"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon icon={n.icon} size={20} />
                {t(n.key)}
              </span>
              {n.to === "/ask" && questions.length > 0 && (
                <span className="rounded-full bg-clay px-2 py-0.5 text-xs font-semibold text-paper">
                  {questions.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Foot: reassurance + profile chip */}
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Reassure className="text-xs" />
          <div className="flex items-center gap-3 px-1">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-clay-soft font-serif font-semibold text-paper">
              {initial}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-ink">
                {profile.name}
              </div>
              <div className="text-xs text-faint">
                {lang === "zh" ? `年齡 ${profile.age} · 個人檔案` : `Age ${profile.age} · Profile`}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-hair bg-cream/85 px-4 py-3 backdrop-blur md:hidden">
        <Brandmark size={30} />
        <div className="flex items-center gap-3">
          <LangToggle />
          <span
            className={`h-2.5 w-2.5 rounded-full ${statusMeta[overall.level].dot}`}
            aria-label={`Overall status: ${statusMeta[overall.level].label}`}
          />
        </div>
      </header>

      {/* Main */}
      <main className="min-w-0 flex-1">
        <div
          className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-10"
          key={loc.pathname}
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-hair bg-cream/95 px-1 py-1.5 backdrop-blur md:hidden">
        {nav.slice(0, 5).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 rounded-chip px-1 py-1.5 text-[10px] ${
                isActive ? "text-clay" : "text-muted"
              }`
            }
          >
            <Icon icon={n.icon} size={20} />
            <span className="text-center leading-tight">
              {lang === "en" ? t(n.key).split(" ")[0] : t(n.key)}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}
