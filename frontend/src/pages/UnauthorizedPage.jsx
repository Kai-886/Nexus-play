import { Link, useNavigate } from "react-router-dom";
import { ShieldX, ArrowLeft } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOrganizer = user?.role === "organizer";

  const dashboardPath = isOrganizer
    ? "/organizer/dashboard"
    : "/participant/dashboard";

  const dashboardName = isOrganizer
    ? "Organizer Dashboard"
    : "Participant Dashboard";

  return (
    <main className="min-h-screen bg-[#070B1A] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6">
          <ShieldX className="w-8 h-8 text-rose-400" />
        </div>

        {/* Status */}
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Error 403
        </p>

        {/* Title */}
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Access Denied
        </h1>

        {/* Message */}
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-400">
          You don't have permission to access this page. Please return to your
          dashboard and continue from there.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0D1326] px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-[#121A31] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to={dashboardPath}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-lg shadow-indigo-600/10"
          >
            {dashboardName}
          </Link>
        </div>

        {/* Branding */}
        <p className="mt-10 text-sm text-slate-600">NexusPlay Esports</p>
      </div>
    </main>
  );
}
