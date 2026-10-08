import { useEffect, useRef, useState } from "react";
import {
  X,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Badge from "../ui/Badge";

import { useAuth } from "../../context/AuthContext";
import { participantService } from "../../services/participantService";

const TOTAL_TEAM_PLAYERS = 4;

const createPlayer = () => ({
  fullName: "",
  gameUid: "",
  email: "",
  phone: "",
});

const createInitialFormData = (user) => ({
  teamName: "",

  captainName: user?.name || "",
  captainEmail: user?.email || "",
  captainPhone: "",
  captainInGameId: "",
  discordTag: "",

  // Captain is separate.
  // Three additional players make a total team size of four.
  players: Array.from({ length: TOTAL_TEAM_PLAYERS - 1 }, createPlayer),

  agreedToRules: false,
  agreedToAntiCheat: false,
  agreedToConductCode: false,
  agreedToMediaConsent: false,
  agreedToAgeEligibility: false,
  agreedToIdentityVerification: false,
  agreedToGuardianConsent: false,
  agreedToCaptainResponsibility: false,
});

export function ParticipantRegistrationModal({
  tournament,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  /*
   * Exit choreography: set [data-closing] so the CSS exit animations play,
   * then unmount after their 200ms window. Keyboard (Escape) skips the
   * animation — keyboard-initiated actions should be instant.
   */
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef(null);

  const requestClose = (animate) => {
    if (isSubmitting) return;

    if (closeTimerRef.current) return;

    if (!animate) {
      onClose();
      return;
    }

    setClosing(true);

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 200);
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") requestClose(false);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  });

  /*
   * Synchronous re-entry guard. `isSubmitting` only becomes true after a
   * re-render, so two clicks in the same tick both see it as false and fire
   * duplicate POSTs; a ref updates immediately. Release is deferred to the
   * next tick so a same-tick second submit can never re-enter.
   */
  const submitLockRef = useRef(false);

  const isTeamEvent =
    tournament?.tournamentType?.toLowerCase() === "team" ||
    Number(tournament?.teamSize || 1) > 1;

  const createFormData = () => createInitialFormData(user);

  const [formData, setFormData] = useState(createFormData);
  const [formResetKey, setFormResetKey] = useState(null);

  /*
   * Reset form whenever tournament or logged-in user changes — adjusted
   * during render rather than in an effect (react.dev: "adjusting some
   * state when a prop changes").
   */
  const nextFormKey =
    tournament && user
      ? `${tournament._id || tournament.id}:${user._id}`
      : null;
  if (nextFormKey && nextFormKey !== formResetKey) {
    setFormResetKey(nextFormKey);
    setFormData(createInitialFormData(user));
    setErrors({});
  }

  if (!isOpen || !tournament) {
    return null;
  }

  /*
   * Handle captain fields and agreement checkboxes.
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: null,
      }));
    }
  };

  /*
   * Handle teammate fields.
   */
  const handlePlayerChange = (index, field, value) => {
    setFormData((previous) => {
      const updatedPlayers = [...previous.players];

      updatedPlayers[index] = {
        ...updatedPlayers[index],
        [field]: value,
      };

      return {
        ...previous,
        players: updatedPlayers,
      };
    });

    if (errors[`player_${index}`]) {
      setErrors((previous) => ({
        ...previous,
        [`player_${index}`]: null,
      }));
    }
  };

  /*
   * Validate the registration form.
   */
  const validate = () => {
    const newErrors = {};

    if (!user?._id) {
      newErrors.user = "You must be logged in to register.";
    }

    // Team name is required for both solo and team registrations.
    if (!formData.teamName.trim()) {
      newErrors.teamName = isTeamEvent
        ? "Team / Clan name is required."
        : "Player / Clan name is required.";
    }

    if (!formData.captainName.trim()) {
      newErrors.captainName = "Full name is required.";
    }

    if (
      !formData.captainEmail.trim() ||
      !/\S+@\S+\.\S+/.test(formData.captainEmail.trim())
    ) {
      newErrors.captainEmail = "Valid email is required.";
    }

    const cleanedCaptainPhone = formData.captainPhone.replace(/\D/g, "");

    if (cleanedCaptainPhone.length !== 10) {
      newErrors.captainPhone = "Valid 10-digit mobile number is required.";
    }

    if (!formData.captainInGameId.trim()) {
      newErrors.captainInGameId = "In-Game ID / IGN is required.";
    }

    if (!formData.discordTag.trim()) {
      newErrors.discordTag = "Discord handle is required.";
    }

    /*
     * Validate exactly three additional players for team events.
     * Captain + three teammates = four players.
     */
    if (isTeamEvent) {
      formData.players.forEach((player, index) => {
        const isEmailValid = /\S+@\S+\.\S+/.test(player.email.trim());
        const cleanedPhone = player.phone.replace(/\D/g, "");

        if (
          !player.fullName.trim() ||
          !player.gameUid.trim() ||
          !player.email.trim() ||
          !isEmailValid ||
          cleanedPhone.length !== 10
        ) {
          newErrors[`player_${index}`] =
            `Player ${index + 2} must have a valid name, IGN, email and 10-digit phone number.`;
        }
      });
    }

    /*
     * Validate mandatory agreements.
     */
    if (!formData.agreedToRules) {
      newErrors.agreedToRules = "You must accept the tournament rules.";
    }

    if (!formData.agreedToAntiCheat) {
      newErrors.agreedToAntiCheat = "Anti-cheat declaration is mandatory.";
    }

    if (!formData.agreedToConductCode) {
      newErrors.agreedToConductCode = "Code of conduct agreement is mandatory.";
    }

    if (!formData.agreedToMediaConsent) {
      newErrors.agreedToMediaConsent = "Media consent is required.";
    }

    if (!formData.agreedToAgeEligibility) {
      newErrors.agreedToAgeEligibility =
        "Age eligibility declaration is required.";
    }

    if (!formData.agreedToIdentityVerification) {
      newErrors.agreedToIdentityVerification =
        "Identity verification agreement is required.";
    }

    if (!formData.agreedToGuardianConsent) {
      newErrors.agreedToGuardianConsent = "Guardian consent is required.";
    }

    if (!formData.agreedToCaptainResponsibility) {
      newErrors.agreedToCaptainResponsibility =
        "Captain responsibility agreement is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * Submit registration.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const releaseLock = () => {
      setTimeout(() => {
        submitLockRef.current = false;
      }, 0);
    };

    if (!validate()) {
      releaseLock();
      toast.error("Please complete all required fields and agreements.");
      return;
    }

    if (!user?._id) {
      releaseLock();
      toast.error("Please log in before registering.");
      return;
    }

    const tournamentId = tournament._id || tournament.id;

    if (!tournamentId) {
      releaseLock();
      toast.error("Tournament ID is missing.");
      return;
    }

    /*
     * Mirror the backend rule (only published tournaments accept
     * registrations) so the server never has to reject a completed form.
     */
    if ((tournament.status || "").toLowerCase() !== "published") {
      releaseLock();
      toast.error("Registration is closed for this tournament.");
      return;
    }

    try {
      setIsSubmitting(true);

      const registrationType = isTeamEvent ? "team" : "solo";

      /*
       * The captain is always the logged-in NexusPlay user.
       */
      const captainPlayer = {
        user: user._id,
        fullName: formData.captainName.trim(),
        email: formData.captainEmail.trim().toLowerCase(),
        gameUid: formData.captainInGameId.trim(),
        phone: formData.captainPhone.replace(/\D/g, ""),
      };

      let players = [captainPlayer];

      /*
       * Add three teammates for team registration.
       * Teammates do not require NexusPlay accounts.
       */
      if (isTeamEvent) {
        const teammatePlayers = formData.players.map((player) => ({
          fullName: player.fullName.trim(),
          gameUid: player.gameUid.trim(),
          email: player.email.trim().toLowerCase(),
          phone: player.phone.replace(/\D/g, ""),
        }));

        players = [captainPlayer, ...teammatePlayers];
      }

      /*
       * Team name is sent for both solo and team registrations.
       */
      const registrationData = {
        registrationType,

        teamName: formData.teamName.trim(),

        players,

        captainContact: {
          whatsapp: formData.captainPhone.replace(/\D/g, ""),
          discordId: formData.discordTag.trim(),
        },

        agreements: {
          antiCheat: formData.agreedToAntiCheat,
          rulebook: formData.agreedToRules,
          identityVerification: formData.agreedToIdentityVerification,
          mediaConsent: formData.agreedToMediaConsent,
          professionalConduct: formData.agreedToConductCode,
          guardianConsent: formData.agreedToGuardianConsent,
          captainResponsibility: formData.agreedToCaptainResponsibility,
        },
      };

      await participantService.registerTournament(
        tournamentId,
        registrationData,
      );

      toast.success("Registration completed successfully!");

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Tournament registration error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed. Please try again.";

      toast.error(message);
    } finally {
      releaseLock();
      setIsSubmitting(false);
    }
  };

  const tournamentTitle = tournament.title || tournament.name || "Tournament";

  const entryFee = tournament.entryFee || tournament.registrationFee || 0;

  const agreementErrorKeys = [
    "agreedToRules",
    "agreedToAntiCheat",
    "agreedToConductCode",
    "agreedToMediaConsent",
    "agreedToAgeEligibility",
    "agreedToIdentityVerification",
    "agreedToGuardianConsent",
    "agreedToCaptainResponsibility",
  ];

  const agreementFields = [
    "agreedToRules",
    "agreedToAntiCheat",
    "agreedToConductCode",
    "agreedToMediaConsent",
    "agreedToAgeEligibility",
    "agreedToIdentityVerification",
    "agreedToGuardianConsent",
    "agreedToCaptainResponsibility",
  ];

  const allAgreementsChecked = agreementFields.every(
    (field) => formData[field] === true,
  );

  const handleToggleAllAgreements = (e) => {
    const { checked } = e.target;

    setFormData((previous) => {
      const updated = { ...previous };
      agreementFields.forEach((field) => {
        updated[field] = checked;
      });
      return updated;
    });

    // Clear any existing errors on all agreement fields
    setErrors((previous) => {
      const updated = { ...previous };
      agreementFields.forEach((field) => {
        updated[field] = null;
      });
      return updated;
    });
  };

  /*
   * Error entries are cleared by setting them to null (not deleting the key),
   * so only truthy messages count as outstanding agreement errors.
   */
  const hasAgreementErrors = agreementErrorKeys.some((key) =>
    Boolean(errors[key]),
  );

  return (
    <div
      className="np-modal-backdrop fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      data-closing={closing ? "" : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") requestClose(false);
      }}
    >
      <div
        className="np-modal theme-card border theme-border w-full max-w-3xl rounded-2xl shadow-2xl shadow-indigo-950/40 overflow-hidden my-8 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label={`${tournamentTitle} registration`}
      >
        {/* Header */}
        <div className="p-5 border-b theme-border flex items-center justify-between bg-[color-mix(in_srgb,var(--np-accent)_10%,transparent)]">
          <div>
            <p className="np-eyebrow">Official Entry Form</p>

            <h2 className="text-xl font-bold theme-text mt-0.5">{tournamentTitle}</h2>

            <p className="text-xs theme-subtext mt-0.5 flex items-center gap-1.5">
              <Badge tone="accent">{tournament.game}</Badge>

              {isTeamEvent ? "Team (4 Players)" : "Solo Player"} • Fee:{" "}
              <span className="font-bold text-[var(--np-success)]">{entryFee ? `₹${entryFee}` : "Free"}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => requestClose(true)}
            disabled={isSubmitting}
            className="p-2 theme-subtext hover:theme-text rounded-lg theme-hover transition cursor-pointer disabled:opacity-50"
            aria-label="Close registration modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-6 flex-1 text-xs"
        >
          {/* Section 1: Registration Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm theme-text flex items-center gap-2 border-b theme-border pb-2">
              <UserCheck className="w-4 h-4 text-[var(--np-accent-2)]" />
              1. Registration Details
            </h3>

            {/* Team / Clan Name */}
            <div>
              <label className="block font-semibold theme-subtext mb-1">
                {isTeamEvent ? "Team / Clan Name *" : "Player / Clan Name *"}
              </label>

              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleInputChange}
                placeholder={
                  isTeamEvent
                    ? "Enter your team or clan name"
                    : "Enter your player or clan name"
                }
                className={`theme-input w-full px-3 py-2 border rounded-lg outline-none ${
                  errors.teamName ? "border-[var(--np-danger)]" : ""
                }`}
              />

              {errors.teamName && (
                <p className="text-[var(--np-danger)] text-[11px] mt-1">
                  {errors.teamName}
                </p>
              )}
            </div>

            {/* Captain Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Captain Name */}
              <div>
                <label className="block font-semibold theme-subtext mb-1">
                  Full Legal Name *
                </label>

                <input
                  type="text"
                  name="captainName"
                  value={formData.captainName}
                  readOnly
                  className="theme-input w-full px-3 py-2 border rounded-lg outline-none opacity-80 cursor-not-allowed"
                />

                {errors.captainName && (
                  <p className="text-[var(--np-danger)] text-[11px] mt-1">
                    {errors.captainName}
                  </p>
                )}
              </div>

              {/* Captain IGN */}
              <div>
                <label className="block font-semibold theme-subtext mb-1">
                  In-Game ID / IGN *
                </label>

                <input
                  type="text"
                  name="captainInGameId"
                  value={formData.captainInGameId}
                  onChange={handleInputChange}
                  placeholder="e.g. TenZ#NA1"
                className={`theme-input w-full px-3 py-2 border rounded-lg outline-none ${
                  errors.captainInGameId ? "border-[var(--np-danger)]" : ""
                }`}
                />

                {errors.captainInGameId && (
                  <p className="text-[var(--np-danger)] text-[11px] mt-1">
                    {errors.captainInGameId}
                  </p>
                )}
              </div>

              {/* Captain Email */}
              <div>
                <label className="block font-semibold theme-subtext mb-1">
                  Email Address *
                </label>

                <input
                  type="email"
                  name="captainEmail"
                  value={formData.captainEmail}
                  readOnly
                  className="theme-input w-full px-3 py-2 border rounded-lg outline-none opacity-80 cursor-not-allowed"
                />

                {errors.captainEmail && (
                  <p className="text-[var(--np-danger)] text-[11px] mt-1">
                    {errors.captainEmail}
                  </p>
                )}
              </div>

              {/* Captain Phone */}
              <div>
                <label className="block font-semibold theme-subtext mb-1">
                  Phone Number (WhatsApp) *
                </label>

                <input
                  type="tel"
                  name="captainPhone"
                  value={formData.captainPhone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  maxLength={10}
                className={`theme-input w-full px-3 py-2 border rounded-lg outline-none ${
                  errors.captainPhone ? "border-[var(--np-danger)]" : ""
                }`}
                />

                {errors.captainPhone && (
                  <p className="text-[var(--np-danger)] text-[11px] mt-1">
                    {errors.captainPhone}
                  </p>
                )}
              </div>

              {/* Discord */}
              <div className="sm:col-span-2">
                <label className="block font-semibold theme-subtext mb-1">
                  Discord Tag / Username *
                </label>

                <input
                  type="text"
                  name="discordTag"
                  value={formData.discordTag}
                  onChange={handleInputChange}
                  placeholder="username#1234 or gamer_tag"
                className={`theme-input w-full px-3 py-2 border rounded-lg outline-none ${
                  errors.discordTag ? "border-[var(--np-danger)]" : ""
                }`}
                />

                {errors.discordTag && (
                  <p className="text-[var(--np-danger)] text-[11px] mt-1">
                    {errors.discordTag}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Team Members */}
          {isTeamEvent && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm theme-text flex items-center gap-2 border-b theme-border pb-2">
                <UserCheck className="w-4 h-4 text-[var(--np-accent-2)]" />
                2. Team Members (3 Teammates)
              </h3>

              <p className="theme-subtext text-[11px]">
                The captain is already included. Add three teammates to complete
                your four-player team.
              </p>

              {formData.players.map((player, index) => (
                <div
                  key={index}
                  className="p-4 border theme-border rounded-xl space-y-3 bg-black/5 dark:bg-white/5"
                >
                  <p className="font-bold theme-text text-xs">
                    Player #{index + 2}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <input
                      type="text"
                      placeholder="Player Full Name"
                      value={player.fullName}
                      onChange={(e) =>
                        handlePlayerChange(index, "fullName", e.target.value)
                      }
                      className="theme-input px-3 py-2 border rounded-lg outline-none"
                    />

                    {/* Game UID */}
                    <input
                      type="text"
                      placeholder="In-Game ID / IGN"
                      value={player.gameUid}
                      onChange={(e) =>
                        handlePlayerChange(index, "gameUid", e.target.value)
                      }
                      className="theme-input px-3 py-2 border rounded-lg outline-none"
                    />

                    {/* Email */}
                    <input
                      type="email"
                      placeholder="Player Email"
                      value={player.email}
                      onChange={(e) =>
                        handlePlayerChange(index, "email", e.target.value)
                      }
                      className="theme-input px-3 py-2 border rounded-lg outline-none"
                    />

                    {/* Phone */}
                    <input
                      type="tel"
                      placeholder="Player Phone Number"
                      value={player.phone}
                      maxLength={10}
                      onChange={(e) =>
                        handlePlayerChange(index, "phone", e.target.value)
                      }
                      className="theme-input px-3 py-2 border rounded-lg outline-none"
                    />
                  </div>

                  {errors[`player_${index}`] && (
                    <p className="text-[var(--np-danger)] text-[11px]">
                      {errors[`player_${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section 3: Responsibilities */}
          <div className="space-y-3 p-4 bg-[color-mix(in_srgb,var(--np-warning)_10%,transparent)] border border-[var(--np-warning)]/25 rounded-xl">
            <h4 className="font-bold text-[var(--np-warning)] text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Participant Responsibilities
            </h4>

            <ul className="list-disc list-inside space-y-1 text-[var(--np-warning)] text-[11px] opacity-90">
              <li>
                Check in 30 minutes before the match through official Discord.
              </li>

              <li>
                Maintain a stable internet connection and suitable hardware.
              </li>

              <li>
                Unsportsmanlike behavior or cheating can result in
                disqualification.
              </li>
            </ul>
          </div>

          {/* Select All */}
          <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)]">
            <input
              type="checkbox"
              checked={allAgreementsChecked}
              onChange={handleToggleAllAgreements}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />

            <span className="font-bold theme-text leading-relaxed">
              Accept all Terms &amp; Conditions, rules, and consents listed
              below.
            </span>
          </label>

          {/* Section 4: Agreements */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm theme-text flex items-center gap-2 border-b theme-border pb-2">
              <ShieldCheck className="w-4 h-4 text-[var(--np-accent-2)]" />
              4. Mandatory Legal Undertakings &amp; Consent
            </h3>

            <div className="space-y-3">
              {/* Rules */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToRules"
                  checked={formData.agreedToRules}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  I have read and agree to follow all official tournament rules
                  and bracket guidelines.
                </span>
              </label>

              {/* Anti-Cheat */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToAntiCheat"
                  checked={formData.agreedToAntiCheat}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  <strong>Anti-Cheat Undertaking:</strong> I declare that
                  neither I nor my squad will use hacks, aimbots, scripts, or
                  unauthorized modifications.
                </span>
              </label>

              {/* Conduct */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToConductCode"
                  checked={formData.agreedToConductCode}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  <strong>Code of Conduct:</strong> I agree to maintain
                  professional etiquette and avoid harassment, hate speech, and
                  match-fixing.
                </span>
              </label>

              {/* Media Consent */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToMediaConsent"
                  checked={formData.agreedToMediaConsent}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  <strong>Media Consent:</strong> I allow the organizer to
                  record and use my in-game name or avatar for tournament
                  broadcasts and promotion.
                </span>
              </label>

              {/* Age Eligibility */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToAgeEligibility"
                  checked={formData.agreedToAgeEligibility}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  <strong>Age Eligibility:</strong> I confirm that all
                  registered players meet the age requirements for this
                  tournament.
                </span>
              </label>

              {/* Identity Verification */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToIdentityVerification"
                  checked={formData.agreedToIdentityVerification}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  <strong>Identity Verification:</strong> I agree to provide
                  valid identity details if required by the organizer.
                </span>
              </label>

              {/* Guardian Consent */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToGuardianConsent"
                  checked={formData.agreedToGuardianConsent}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  <strong>Guardian Consent:</strong> I confirm that guardian
                  consent has been obtained where required by applicable age
                  eligibility rules.
                </span>
              </label>

              {/* Captain Responsibility */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToCaptainResponsibility"
                  checked={formData.agreedToCaptainResponsibility}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />

                <span className="theme-subtext leading-relaxed">
                  <strong>Captain Responsibility:</strong> I accept
                  responsibility for the accuracy of the registration details
                  and the conduct of my team.
                </span>
              </label>
            </div>

            {hasAgreementErrors && (
              <p className="text-[var(--np-danger)] text-[11px]">
                Please accept all mandatory agreements before submitting.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t theme-border flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] theme-subtext">
                Total Registration Fee
              </p>

              <p className="text-base font-bold theme-text tabular-nums">
                {entryFee ? `₹${entryFee}` : "FREE ENTRY"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => requestClose(true)}
                disabled={isSubmitting}
                className="px-4 py-2 font-bold theme-subtext hover:theme-text rounded-xl border theme-border cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-press np-press px-5 py-2 font-bold text-white [background:var(--np-accent)] hover:[background:var(--np-accent-strong)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}

                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
