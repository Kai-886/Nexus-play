import { useState } from "react";
import {
  X,
  Trophy,
  User,
  ShieldAlert,
  Phone,
  Users,
  CheckSquare
} from "lucide-react";
import { toast } from "sonner";

export function RegisterModal({ tournament, isOpen, onClose, onSuccess }) {
  const teamSize = Number(tournament?.teamSize || tournament?.maxTeamSize || 4);

  const buildFormData = (size) => ({
    teamName: "",
    contactNumber: "",
    altContactNumber: "",
    discordHandle: "",
    players: Array.from({ length: size }, () => ({
      name: "",
      uid: "",
      email: "",
      phone: "",
    })),
    // Comprehensive Mandatory Undertakings
    undertakingFairPlay: false,
    undertakingRules: false,
    undertakingCaptainResponsibility: false,
    undertakingIdentityVerify: false,
    undertakingMediaStreamRights: false,
    undertakingPenaltyAcceptance: false,
    undertakingMinorConsent: false,
  });

  const [formData, setFormData] = useState(() => buildFormData(teamSize));

  const [submitting, setSubmitting] = useState(false);
  const [formResetKey, setFormResetKey] = useState(null);

  /* Reset when the target tournament or open-state changes — adjusted
     during render rather than in an effect (react.dev: "adjusting some
     state when a prop changes"). */
  const nextFormKey = tournament
    ? `${tournament._id || tournament.id || tournament.title}:${isOpen}`
    : null;
  if (nextFormKey && nextFormKey !== formResetKey) {
    setFormResetKey(nextFormKey);
    setFormData(
      buildFormData(Number(tournament.teamSize || tournament.maxTeamSize || 4))
    );
  }

  if (!isOpen || !tournament) return null;

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...formData.players];
    updatedPlayers[index][field] = value;
    setFormData((prev) => ({ ...prev, players: updatedPlayers }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Check if all undertakings are currently checked
  const areAllUndertakingsChecked = [
    formData.undertakingFairPlay,
    formData.undertakingRules,
    formData.undertakingCaptainResponsibility,
    formData.undertakingIdentityVerify,
    formData.undertakingMediaStreamRights,
    formData.undertakingPenaltyAcceptance,
    formData.undertakingMinorConsent,
  ].every(Boolean);

  // Toggle all undertakings at once
  const handleSelectAllUndertakings = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      undertakingFairPlay: isChecked,
      undertakingRules: isChecked,
      undertakingCaptainResponsibility: isChecked,
      undertakingIdentityVerify: isChecked,
      undertakingMediaStreamRights: isChecked,
      undertakingPenaltyAcceptance: isChecked,
      undertakingMinorConsent: isChecked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validation for Player Detailed Info
    for (let i = 0; i < teamSize; i++) {
      const p = formData.players[i];
      if (!p.name.trim() || !p.uid.trim()) {
        toast.error(`Please provide Full Name and Game UID for Player ${i + 1}`);
        return;
      }
      if (!p.email.trim()) {
        toast.error(`Please provide a valid Email for Player ${i + 1}`);
        return;
      }
      if (!p.phone.trim()) {
        toast.error(`Please provide a Phone Number for Player ${i + 1}`);
        return;
      }
    }

    // 2. Validation for Mandatory Undertakings
    const mandatoryChecks = [
      formData.undertakingFairPlay,
      formData.undertakingRules,
      formData.undertakingCaptainResponsibility,
      formData.undertakingIdentityVerify,
      formData.undertakingMediaStreamRights,
      formData.undertakingPenaltyAcceptance,
      formData.undertakingMinorConsent,
    ];

    if (mandatoryChecks.some((checked) => !checked)) {
      toast.error("You must accept ALL mandatory compliance & undertakings before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const existingRegs = JSON.parse(localStorage.getItem("my_registrations") || "[]");

      const newRegistration = {
        id: Date.now().toString(),
        tournamentId: tournament._id || tournament.id,
        tournamentTitle: tournament.title || tournament.name,
        game: tournament.game || "Esports",
        registrationDate: new Date().toISOString(),
        teamName: teamSize > 1 ? formData.teamName : formData.players[0].name,
        contactNumber: formData.contactNumber,
        altContactNumber: formData.altContactNumber,
        discordHandle: formData.discordHandle,
        players: formData.players,
        captainName: formData.players[0].name,
        captainInGameId: formData.players[0].uid,
        status: "Confirmed",
      };

      localStorage.setItem("my_registrations", JSON.stringify([...existingRegs, newRegistration]));

      const partRegs = JSON.parse(localStorage.getItem("participant_registrations") || "[]");
      const tournamentKey = String(tournament._id || tournament.id);
      if (!partRegs.includes(tournamentKey)) {
        partRegs.push(tournamentKey);
        localStorage.setItem("participant_registrations", JSON.stringify(partRegs));
      }

      toast.success("Squad registration & official undertakings recorded successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Failed to submit official registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="theme-card border theme-border rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden transition-all my-6">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b theme-border theme-icon-box">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-500">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold theme-text">
                Register for {tournament.title || tournament.name}
              </h2>
              <p className="text-xs theme-subtext mt-0.5">
                Game: <span className="font-semibold text-indigo-500">{tournament.game || "Esports"}</span> • Format: {teamSize > 1 ? `Squad (${teamSize} Mandatory Roster Members)` : "Solo (1v1)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg theme-subtext hover:theme-text theme-hover cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[78vh] overflow-y-auto">
          
          {/* Section 1: Team Information */}
          {teamSize > 1 && (
            <div className="space-y-3">
              <h3 className="font-bold theme-text uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b theme-border pb-2">
                <Users className="w-4 h-4 text-indigo-500" /> Team Information
              </h3>
              <div className="space-y-1">
                <label className="font-bold theme-text">
                  Team / Clan Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="teamName"
                  required
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g. Soul Esports"
                  className="w-full theme-card border theme-border rounded-xl px-3.5 py-2.5 theme-text focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Section 2: Player Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b theme-border pb-2">
              <h3 className="font-bold theme-text uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" /> Player Details ({teamSize} Verified Players Required)
              </h3>
              <span className="text-[10px] theme-subtext font-medium">Player 1 acts as Official Representative</span>
            </div>

            <div className="space-y-4">
              {formData.players.map((player, index) => (
                <div key={index} className="theme-icon-box border theme-border p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b theme-border pb-2">
                    <span className="text-[11px] font-bold text-indigo-500 flex items-center gap-1.5">
                      {index === 0 ? "👑 Player 1 (Team Captain & Point of Contact)" : `🎮 Player ${index + 1}`}
                    </span>
                    <span className="text-[10px] theme-subtext">Verified Slot #{index + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold theme-subtext">Full Legal Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Legal Full Name"
                        value={player.name}
                        onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                        className="w-full theme-card border theme-border rounded-lg px-3 py-2 theme-text focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold theme-subtext">In-Game Character UID / IGN <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Game UID / In-Game Name"
                        value={player.uid}
                        onChange={(e) => handlePlayerChange(index, "uid", e.target.value)}
                        className="w-full theme-card border theme-border rounded-lg px-3 py-2 theme-text focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold theme-subtext">Email Address <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        required
                        placeholder="player@email.com"
                        value={player.email}
                        onChange={(e) => handlePlayerChange(index, "email", e.target.value)}
                        className="w-full theme-card border theme-border rounded-lg px-3 py-2 theme-text focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold theme-subtext">Phone / Contact Number <span className="text-rose-500">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={player.phone}
                        onChange={(e) => handlePlayerChange(index, "phone", e.target.value)}
                        className="w-full theme-card border theme-border rounded-lg px-3 py-2 theme-text focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Communication Contacts */}
          <div className="space-y-3">
            <h3 className="font-bold theme-text uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b theme-border pb-2">
              <Phone className="w-4 h-4 text-indigo-500" /> Captain Contacts & Official Communication
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold theme-text">WhatsApp Contact <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  name="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full theme-card border theme-border rounded-xl px-3.5 py-2 theme-text focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold theme-text">Alternate Contact Number</label>
                <input
                  type="tel"
                  name="altContactNumber"
                  value={formData.altContactNumber}
                  onChange={handleChange}
                  placeholder="Alternate Contact"
                  className="w-full theme-card border theme-border rounded-xl px-3.5 py-2 theme-text focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold theme-text">Captain Discord ID</label>
                <input
                  type="text"
                  name="discordHandle"
                  value={formData.discordHandle}
                  onChange={handleChange}
                  placeholder="username#0000"
                  className="w-full theme-card border theme-border rounded-xl px-3.5 py-2 theme-text focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Mandatory Undertakings & Compliance */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b theme-border pb-2">
              <h4 className="font-bold theme-text text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                <ShieldAlert className="w-4 h-4" /> Extended Mandatory Undertakings & Legal Compliance
              </h4>
              <span className="text-[10px] text-rose-500 font-bold">* All Checkboxes Required</span>
            </div>

            {/* Master "Select All" Option */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30">
              <input
                type="checkbox"
                id="selectAllUndertakings"
                checked={areAllUndertakingsChecked}
                onChange={handleSelectAllUndertakings}
                className="w-4 h-4 rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="selectAllUndertakings" className="font-bold theme-text text-xs cursor-pointer flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                Select / Agree to All Undertakings & Compliance Rules Below
              </label>
            </div>

            <div className="space-y-3 theme-icon-box border theme-border p-4 rounded-xl">
              
              {/* 1. Fair Play */}
              <div className="flex items-start gap-2.5 border-b theme-border pb-2.5">
                <input
                  type="checkbox"
                  id="undertakingFairPlay"
                  name="undertakingFairPlay"
                  checked={formData.undertakingFairPlay}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="undertakingFairPlay" className="theme-subtext text-[11px] leading-relaxed cursor-pointer">
                  <strong className="theme-text">1. Anti-Cheat & Fair Play Certification:</strong> We certify that no player will use emulators, modded APKs, recoil hacks, radar hacks, macro scripts, or 3rd party tools. Any infraction leads to immediate disqualification and permanent ban from Nexus Arena.
                </label>
              </div>

              {/* 2. Official Rules & Punctuality */}
              <div className="flex items-start gap-2.5 border-b theme-border pb-2.5">
                <input
                  type="checkbox"
                  id="undertakingRules"
                  name="undertakingRules"
                  checked={formData.undertakingRules}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="undertakingRules" className="theme-subtext text-[11px] leading-relaxed cursor-pointer">
                  <strong className="theme-text">2. Rulebook Adherence & Punctuality:</strong> We agree to join the designated room 15 minutes prior to the start time. Failure to enter room on schedule will lead to match forfeiture without refund.
                </label>
              </div>

              {/* 3. Identity & UID Authenticity */}
              <div className="flex items-start gap-2.5 border-b theme-border pb-2.5">
                <input
                  type="checkbox"
                  id="undertakingIdentityVerify"
                  name="undertakingIdentityVerify"
                  checked={formData.undertakingIdentityVerify}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="undertakingIdentityVerify" className="theme-subtext text-[11px] leading-relaxed cursor-pointer">
                  <strong className="theme-text">3. Identity Verification & Roster Lock:</strong> All Game UIDs entered above are genuine and match our actual accounts. Ringing (using unlisted substitute players) is forbidden and results in instant disqualification.
                </label>
              </div>

              {/* 4. Streaming & Media Rights */}
              <div className="flex items-start gap-2.5 border-b theme-border pb-2.5">
                <input
                  type="checkbox"
                  id="undertakingMediaStreamRights"
                  name="undertakingMediaStreamRights"
                  checked={formData.undertakingMediaStreamRights}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="undertakingMediaStreamRights" className="theme-subtext text-[11px] leading-relaxed cursor-pointer">
                  <strong className="theme-text">4. Media Rights & Broadcast Consent:</strong> We grant tournament organizers full permission to broadcast live matches, use IGNs, team logos, audio recordings, and clips for promotional/monetization purposes.
                </label>
              </div>

              {/* 5. Anti-Toxicity & Referee Decorum */}
              <div className="flex items-start gap-2.5 border-b theme-border pb-2.5">
                <input
                  type="checkbox"
                  id="undertakingPenaltyAcceptance"
                  name="undertakingPenaltyAcceptance"
                  checked={formData.undertakingPenaltyAcceptance}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="undertakingPenaltyAcceptance" className="theme-subtext text-[11px] leading-relaxed cursor-pointer">
                  <strong className="theme-text">5. Professional Decorum & Zero-Toxicity:</strong> Abusive language towards match referees, opponent teams, or admins on Discord/In-Game chat will trigger point penalties, prize pool forfeitures, or disqualification.
                </label>
              </div>

              {/* 6. Guardian Consent (For Minors) */}
              <div className="flex items-start gap-2.5 border-b theme-border pb-2.5">
                <input
                  type="checkbox"
                  id="undertakingMinorConsent"
                  name="undertakingMinorConsent"
                  checked={formData.undertakingMinorConsent}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="undertakingMinorConsent" className="theme-subtext text-[11px] leading-relaxed cursor-pointer">
                  <strong className="theme-text">6. Guardian Consent (For Minors):</strong> Players under 18 years of age confirm that they have acquired parental/guardian authorization to participate in this competitive tournament.
                </label>
              </div>

              {/* 7. Captain Responsibility */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="undertakingCaptainResponsibility"
                  name="undertakingCaptainResponsibility"
                  checked={formData.undertakingCaptainResponsibility}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="undertakingCaptainResponsibility" className="theme-subtext text-[11px] leading-relaxed cursor-pointer">
                  <strong className="theme-text">7. Captain Full Responsibility & Final Binding Decision:</strong> As Captain/Representative, I accept full legal and administrative responsibility for all roster members. Decisions made by match referees are final.
                </label>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 theme-border border rounded-xl theme-subtext font-bold text-xs theme-hover cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Submitting Registration..." : "Accept Undertakings & Register Squad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}