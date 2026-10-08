import { Link, useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

export function NotFoundPage() {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#070B1A] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mb-6">
          <Gamepad2 className="w-8 h-8 text-indigo-500" />
        </div>

        <p className="text-7xl font-black text-indigo-500 mb-4">
          404
        </p>

        <h1 className="text-2xl font-bold mb-2">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-400 mb-7">
          The page you're looking for doesn't exist or the URL is incorrect.
        </p>

        <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0D1326] px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-[#121A31] hover:text-white"
          >
            Go back
          </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl text-sm font-semibold transition ml-4"
        >
          {/* <ArrowLeft className="w-4 h-4" /> */}
          Login Page
        </Link>

      </div>
    </div>
  );
}