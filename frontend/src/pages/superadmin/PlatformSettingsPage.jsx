import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/adminService";
import { Button } from "../../components/ui/Button";

export function PlatformSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        const data = await adminService.getSettings();

        setSettings(data);
      } catch (error) {
        console.error("Failed to load platform settings:", error);

        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await adminService.updateSettings(settings);

      toast.success("Platform settings updated successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs theme-subtext">
        Loading settings...
      </div>
    );
  }

  if (!settings) {
    /* Designed unavailable state — the platform-settings surface has no
       backend endpoint yet (PRD §9: no backend changes). The toggle config
       UI below stays intact and activates the moment the API ships. */
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <p className="np-eyebrow">Platform Governance</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            Global Platform Governance Settings
          </h1>

          <p className="text-xs md:text-sm theme-subtext">
            Control system-wide operational parameters, revenue commissions,
            and registration switches.
          </p>
        </div>

        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--np-warning)_12%,transparent)] border border-[var(--np-warning)]/25 flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-[var(--np-warning)]" />
          </div>

          <h3 className="text-sm font-bold theme-text">
            Settings Service Not Connected
          </h3>

          <p className="text-xs theme-subtext max-w-md mx-auto mt-1 leading-relaxed">
            This control panel has no backing API yet. Operational
            kill-switches, commission rates, and escrow durations are managed
            directly in the platform configuration until the settings service
            is connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <p className="np-eyebrow">Platform Governance</p>

        <h1 className="font-display text-2xl font-bold theme-text mt-1">
          Global Platform Governance Settings
        </h1>

        <p className="text-xs md:text-sm theme-subtext">
          Control system-wide operational parameters, revenue commissions, and
          registration switches.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Switches */}
        <div className="theme-card border theme-border rounded-2xl p-6 space-y-4">
          <h2 className="np-eyebrow mb-2">Operational Kill-Switches</h2>

          <div className="flex items-center justify-between p-3.5 rounded-xl border theme-border theme-icon-box">
            <div>
              <p className="font-bold theme-text text-xs">
                Emergency Maintenance Mode
              </p>

              <p className="text-[11px] theme-subtext">
                When enabled, non-admin users see a maintenance screen and
                tournament registrations pause.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("maintenanceMode")}
              className={`btn-press p-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 ${
                settings?.maintenanceMode
                  ? "!bg-[var(--np-danger)] text-white"
                  : "theme-card border theme-border theme-subtext"
              }`}
            >
              {settings?.maintenanceMode ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span>ACTIVE</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span>OFF</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border theme-border theme-icon-box">
            <div>
              <p className="font-bold theme-text text-xs">
                Allow New User Registrations
              </p>

              <p className="text-[11px] theme-subtext">
                Permit new participants and students to create accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("allowRegistrations")}
              className={`btn-press p-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 ${
                settings?.allowRegistrations
                  ? "!bg-[var(--np-success)] text-white"
                  : "theme-card border theme-border theme-subtext"
              }`}
            >
              {settings?.allowRegistrations ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span>OPEN</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span>CLOSED</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border theme-border theme-icon-box">
            <div>
              <p className="font-bold theme-text text-xs">
                Allow Organizer Applications
              </p>

              <p className="text-[11px] theme-subtext">
                Permit third-party clubs to register and submit organizer
                profiles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("allowOrganizerApplications")}
              className={`btn-press p-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 ${
                settings?.allowOrganizerApplications
                  ? "!bg-[var(--np-success)] text-white"
                  : "theme-card border theme-border theme-subtext"
              }`}
            >
              {settings?.allowOrganizerApplications ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span>OPEN</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span>CLOSED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Financial & Fee Rules */}
        <div className="theme-card border theme-border rounded-2xl p-6 space-y-4">
          <h2 className="np-eyebrow mb-2">Financial & Fee Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider theme-subtext mb-1.5">
                Platform Commission Fee (%)
              </label>

              <input
                type="number"
                min="0"
                max="30"
                name="platformCommissionPercent"
                value={settings?.platformCommissionPercent || 5}
                onChange={handleChange}
                className="theme-input w-full p-2.5 text-xs rounded-xl outline-none"
              />

              <p className="text-[11px] theme-subtext mt-1">
                Deducted automatically from tournament entry pools and
                sponsorships.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider theme-subtext mb-1.5">
                Escrow Payout Hold Duration (Days)
              </label>

              <input
                type="number"
                min="1"
                max="30"
                name="payoutHoldDays"
                value={settings?.payoutHoldDays || 3}
                onChange={handleChange}
                className="theme-input w-full p-2.5 text-xs rounded-xl outline-none"
              />

              <p className="text-[11px] theme-subtext mt-1">
                Number of days prize pools are held in escrow after tournament
                finals for dispute resolution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            icon={Save}
          >
            {saving ? "Saving Changes..." : "Save Platform Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PlatformSettingsPage;
