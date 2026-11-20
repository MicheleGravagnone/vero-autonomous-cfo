import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import { useCompany } from "../api/queries";
import { useLive } from "../api/live";
import { USE_MOCK } from "../api/client";
import { DemoPanel } from "../features/demo/DemoPanel";
import { formatLongDate } from "../lib/format";
import { useTheme } from "../lib/theme";
import { Icon } from "./Icon";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 text-[15px] font-medium transition-colors ${
    isActive ? "btn-primary" : "text-ink hover:bg-chip"
  }`;

const connectionText = { live: "Connected", connecting: "Connecting…", offline: "Offline" } as const;

function initials(name?: string) {
  if (!name) return "··";
  const words = name.replace(/\s+(GmbH|AG|KG)$/i, "").trim().split(/\s+/);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
}

export function Layout() {
  const { data: company } = useCompany();
  const { connection } = useLive();
  const { theme, toggle } = useTheme();
  const [params] = useSearchParams();
  const showDemo = params.get("demo") === "1";

  const dot = connection === "live" ? "bg-safe" : connection === "connecting" ? "bg-tight" : "bg-short";

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <header className="glass-bar sticky top-0 z-30">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-y-2 px-4 py-3 sm:px-8 lg:min-h-20 lg:grid-cols-[1fr_auto_1fr] lg:py-5">
          <div className="flex items-center gap-2 lg:pr-4">
            <span className="whitespace-nowrap text-[24px] font-semibold tracking-[-0.02em]">Vero</span>
            <span
              title={`Demo mode: actions are simulated, no money moves.${USE_MOCK ? " Mock data." : ""}`}
              className="glass-chip whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-medium text-ink-soft"
            >
              Simulation
            </span>
            {company && (
              <span
                title="The demo replays 2025. Agents only see transactions before this date."
                className="hidden whitespace-nowrap rounded-full bg-cream px-2.5 py-1 text-[12px] font-semibold text-ask sm:inline"
              >
                Demo date: {formatLongDate(company.asOf)}
              </span>
            )}
          </div>

          <nav
            aria-label="Main"
            className="col-span-2 row-start-2 -mx-1 flex gap-1 overflow-x-auto lg:col-span-1 lg:row-start-1 lg:col-start-2 lg:mx-0"
          >
            <NavLink to="/" end className={navClass}>Today</NavLink>
            <NavLink to="/contract" className={navClass}>Contract check</NavLink>
            <NavLink to="/costs" className={navClass}>Cost changes</NavLink>
            <NavLink to="/activity" className={navClass}>Activity</NavLink>
          </nav>

          <div className="flex min-w-0 items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              className="glass-chip flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:text-ink"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
            </button>
            <span className="hidden truncate text-[15px] font-semibold sm:inline">{company?.name ?? "Loading…"}</span>
            <span
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full avatar text-[13px] font-semibold"
              title={`${company?.name ?? ""} · ${connectionText[connection]}`}
            >
              {initials(company?.name)}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${dot}`}
                aria-hidden="true"
              />
              <span className="sr-only">{connectionText[connection]}</span>
            </span>
          </div>
        </div>
        {company && (
          <p className="border-t border-sand/50 bg-cream px-4 py-1.5 text-center text-[11px] font-semibold text-ask sm:hidden">
            Demo date: {formatLongDate(company.asOf)}
          </p>
        )}
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-5 text-xs text-ink-soft sm:px-8">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#ee0000]" aria-hidden="true" />
          Runs fully on Red Hat OpenShift AI with open models. Your data never leaves your environment.
        </p>
      </footer>

      {showDemo && <DemoPanel />}
    </div>
  );
}
