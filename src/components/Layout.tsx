import { type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useStore } from "../lib/store";

const nav = [
  { to: "/today", label: "Today", glyph: "☕" },
  { to: "/health", label: "Health", glyph: "❤" },
  { to: "/trends", label: "Trends", glyph: "📈" },
  { to: "/ask", label: "Ask your doctor", glyph: "✎" },
  { to: "/report", label: "Doctor report", glyph: "🧾" },
  { to: "/learn", label: "Learn", glyph: "✦" },
  { to: "/settings", label: "Settings", glyph: "⚙" },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full bg-clay text-paper"
        aria-hidden
      >
        <span className="text-lg leading-none">♡</span>
      </span>
      <div className="leading-tight">
        <div className="font-serif text-xl text-ink">HeartSum</div>
        <div className="text-[11px] text-faint">served in small plates</div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { questions, overall } = useStore();
  const loc = useLocation();

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
      <aside className="no-print hidden w-64 shrink-0 border-r border-hair bg-paper/70 p-6 md:flex md:flex-col">
        <NavLink to="/today" className="mb-8 block">
          <Brand />
        </NavLink>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] transition ${
                  isActive
                    ? "bg-clay-tint font-medium text-clay-deep"
                    : "text-muted hover:bg-cream hover:text-ink"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-center opacity-70" aria-hidden>
                  {n.glyph}
                </span>
                {n.label}
              </span>
              {n.to === "/ask" && questions.length > 0 && (
                <span className="rounded-full bg-clay px-2 py-0.5 text-xs text-paper">
                  {questions.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6 text-xs leading-relaxed text-faint">
          Wellness signals, not a diagnosis. A bridge to your doctor — never a
          replacement.
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-hair bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              overall.level === "look"
                ? "#b04a32"
                : overall.level === "watch"
                  ? "#bd9a4e"
                  : "#6f8f6a",
          }}
          aria-label={`Overall status: ${overall.level}`}
        />
      </header>

      {/* Main */}
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-10 md:py-10" key={loc.pathname}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-hair bg-paper/95 px-1 py-1.5 backdrop-blur md:hidden">
        {nav.slice(0, 5).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] ${
                isActive ? "text-clay-deep" : "text-muted"
              }`
            }
          >
            <span className="text-base" aria-hidden>
              {n.glyph}
            </span>
            <span className="text-center leading-tight">{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}
