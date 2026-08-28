import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import { api } from "./lib/api";

function NavBar() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .getStatus()
      .then((s) => setConnected(s.fortyguard_connected))
      .catch(() => setConnected(false));
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-ink" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-base/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-thermal-critical" />
            <span className="font-display font-semibold tracking-tight text-lg">
              HEATWISE
            </span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Analyze</NavLink>
            <NavLink to="/history" className={linkClass}>History</NavLink>
            <a
              href="https://docs-api.fortyguard.com/"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              API Intelligence
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connected === null
                ? "bg-ink-faint"
                : connected
                ? "bg-thermal-low"
                : "bg-thermal-moderate"
            }`}
          />
          <span className="text-ink-muted">
            {connected === null
              ? "Checking API…"
              : connected
              ? "FortyGuard API Connected"
              : "Demo Mode (no API key)"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
      <footer className="border-t border-border py-6 px-6 text-center text-xs text-ink-faint font-mono">
        HeatWise Agent — an operational decision-support prototype. Not a substitute for official
        weather alerts, occupational safety rules, or medical advice.
      </footer>
    </div>
  );
}
