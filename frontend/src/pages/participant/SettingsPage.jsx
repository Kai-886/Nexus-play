import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit3, Save, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { participantService } from "../../services/participantService";

export const ParticipantSettingsPage = () => {
  const { theme, setThemeMode } = useTheme();

  const [upiId, setUpiId] = useState("");
  const [originalUpiId, setOriginalUpiId] = useState("");

  const [editingUpi, setEditingUpi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);

      const response = await participantService.getProfile();

      const savedUpi = response?.user?.upiId || "";

      setUpiId(savedUpi);
      setOriginalUpiId(savedUpi);
    } catch (err) {
      console.error("Failed to load settings:", err);

      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchUserSettings();
    };
    run();
  }, []);

  // Check whether UPI has actually changed
  const hasChanges = upiId !== originalUpiId;

  const handleEditUpi = () => {
    setEditingUpi(true);
  };

  const handleCancelUpi = () => {
    setUpiId(originalUpiId);
    setEditingUpi(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!hasChanges) {
      return;
    }

    try {
      setSaving(true);

      await participantService.updateProfile({
        upiId,
      });

      setOriginalUpiId(upiId);
      setEditingUpi(false);

      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs theme-subtext">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold theme-text">Account Settings</h2>

        <p className="text-xs theme-subtext mt-1">
          Manage your theme preferences, payment details, and notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ================================================= */}
        {/* APPEARANCE & THEME */}
        {/* ================================================= */}

        <div className="theme-card border theme-border p-6 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold theme-text border-b theme-border pb-3">
            Appearance & Theme
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                theme === "dark"
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "theme-border hover:border-indigo-500/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🌙</span>

                {theme === "dark" && (
                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold theme-text">Dark Mode</p>

                <p className="text-[10px] theme-subtext mt-0.5">
                  Esports arena style layout with high contrast dark tones.
                </p>
              </div>
            </button>

            {/* Light Mode */}
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                theme === "light"
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "theme-border hover:border-indigo-500/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">☀️</span>

                {theme === "light" && (
                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold theme-text">Light Mode</p>

                <p className="text-[10px] theme-subtext mt-0.5">
                  Clean light theme for bright environment readability.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* PAYMENTS & WALLET */}
        {/* ================================================= */}

        <div className="theme-card border theme-border p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b theme-border pb-3">
            <h3 className="text-sm font-bold theme-text">Payments & Wallet</h3>

            {!editingUpi && (
              <button
                type="button"
                onClick={handleEditUpi}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition"
              >
                <Edit3 size={14} />
                Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold theme-text mb-1">
              Default UPI ID
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={!editingUpi}
                className="flex-1 w-full theme-card border theme-border rounded-xl p-2.5 text-xs theme-text focus:outline-none focus:border-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="e.g. username@upi"
              />

              {editingUpi && (
                <button
                  type="button"
                  onClick={handleCancelUpi}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border theme-border theme-text text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <X size={14} />
                  Cancel
                </button>
              )}
            </div>

            <p className="text-[10px] theme-subtext mt-2">
              Enter your correct UPI ID. NexusPlay does not verify UPI
              ownership, so make sure this UPI ID belongs to you.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* NOTIFICATIONS */}
        {/* ================================================= */}

        <div className="theme-card border theme-border p-6 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold theme-text border-b theme-border pb-3">
            Notifications
          </h3>

          {/* Match Reminders */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold theme-text">Match Reminders</p>

              <p className="text-[10px] theme-subtext">
                Get notified before your registered tournament match begins.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-indigo-600 rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Tournament Updates */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-xs font-bold theme-text">Tournament Updates</p>

              <p className="text-[10px] theme-subtext">
                Receive email announcements from organizers.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-indigo-600 rounded cursor-pointer shrink-0"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* SAVE */}
        {/* ================================================= */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition shadow-md ${
              hasChanges && !saving
                ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                : "bg-indigo-600/40 text-white/50 cursor-not-allowed"
            }`}
          >
            <Save size={15} />

            {saving ? "Saving..." : "Save Preference Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParticipantSettingsPage;
