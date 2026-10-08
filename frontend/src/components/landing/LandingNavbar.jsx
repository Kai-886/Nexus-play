import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingNavbar() {
  return (
    <header className="hero-in absolute left-0 right-0 top-0 z-50" style={{ "--hero-delay": "700ms" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link
          to="/"
          className="btn-press flex items-center gap-2 transition-transform hover:scale-[1.03]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/30 lg:h-9 lg:w-9">
            <Gamepad2 className="h-4 w-4 text-white lg:h-5 lg:w-5" />
          </div>

          <span className="text-base font-bold sm:text-lg lg:text-xl">
            Nexus<span className="text-indigo-500">Play</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          <a
            href="#tournaments"
            className="link-underline text-xs text-slate-300 transition hover:text-white lg:text-sm"
          >
            Tournaments
          </a>

          <a
            href="#about"
            className="link-underline text-xs text-slate-300 transition hover:text-white lg:text-sm"
          >
            About
          </a>

          <a
            href="#how-it-works"
            className="link-underline text-xs text-slate-300 transition hover:text-white lg:text-sm"
          >
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="btn-press rounded-md border border-indigo-400/70 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-indigo-500/10 sm:px-5 sm:py-2 sm:text-xs lg:px-6 lg:py-2.5 lg:text-sm"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="btn-press rounded-md bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:px-5 sm:py-2 sm:text-xs lg:px-6 lg:py-2.5 lg:text-sm"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
