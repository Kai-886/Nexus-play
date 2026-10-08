import { useNavigate } from "react-router-dom";
import { tournamentService } from "../../services/tournamentService";
import { Plus, Trash2, ArrowLeft, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getOrganizerProfile } from "../../services/organizerService";
import { Loader2, ShieldAlert } from "lucide-react";

const MANDATORY_RULES = {
  Online: [
    "Must check in 30 minutes prior to match schedule on official Discord.",
    "Responsible for stable internet connection, device hardware, and ping.",
    "Game recordings/screenshots of end-match results must be uploaded after every round.",
    "Unsportsmanlike behavior, toxicity, or map exploits will lead to instant disqualification.",
  ],
  Offline: [
    "Must check in at the venue registration desk 30 minutes prior to match time.",
    "Responsible for bringing approved personal peripherals (headsets, controller, mice).",
    "Match results must be reported directly to on-site tournament marshals immediately.",
    "Unsportsmanlike behavior, physical misconduct, or equipment abuse leads to instant DQ.",
  ],
};

export function CreateTournamentPage() {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  const navigate = useNavigate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [formData, setFormData] = useState({
    name: "",
    game: "",
    startDate: "",
    startTime: "10:00",
    endDate: "",
    endTime: "18:00",
    venueType: "Online",
    venueDetails: "Official Discord Server",
    city: "Mumbai",
    registrationFee: "",
    registrationDeadline: "",
    registrationDeadlineTime: "23:59",
    maxTeams: 16,
    teamSize: 5,
    description: "",
    prizes: [
      { position: 1, amount: "" },
      { position: 2, amount: "" },
    ],
    customRules: [
      "Players must follow official tournament admin calls at all times.",
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const data = await getOrganizerProfile();

        if (data.success && data.organizer) {
          setVerificationStatus(data.organizer.verificationStatus);
        } else {
          setVerificationStatus(null);
        }
      } catch (error) {
        console.error("Verification check failed:", error);
        setVerificationStatus(null);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleVenueTypeChange = (e) => {
    const newVenueType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      venueType: newVenueType,
      venueDetails:
        newVenueType === "Online"
          ? "Official Discord Server"
          : "Gaming Arena / LAN Center",
    }));
  };

  const addPrize = () => {
    setFormData((prev) => ({
      ...prev,
      prizes: [
        ...prev.prizes,
        { position: prev.prizes.length + 1, amount: "" },
      ],
    }));
    if (errors.prizes) setErrors((prev) => ({ ...prev, prizes: null }));
  };

  const updatePrize = (index, key, val) => {
    const updated = [...formData.prizes];
    updated[index][key] = val === "" ? "" : Number(val);
    setFormData((prev) => ({ ...prev, prizes: updated }));
  };

  const removePrize = (index) => {
    if (formData.prizes.length <= 1) {
      setErrors((prev) => ({
        ...prev,
        prizes: "At least one prize tier is required.",
      }));
      return;
    }
    const updated = formData.prizes
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, position: i + 1 }));
    setFormData((prev) => ({ ...prev, prizes: updated }));
  };

  const addCustomRule = () => {
    setFormData((prev) => ({
      ...prev,
      customRules: [...prev.customRules, ""],
    }));
  };

  const updateCustomRule = (index, val) => {
    const updated = [...formData.customRules];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, customRules: updated }));
  };

  const removeCustomRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      customRules: prev.customRules.filter((_, i) => i !== index),
    }));
  };

  const calculateTotalPrize = () =>
    formData.prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tournament name is required";
    if (!formData.game.trim()) newErrors.game = "Esports game name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (formData.startDate < todayStr) {
      newErrors.startDate = "Start date must be today or a future date";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be on or after start date";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // --- Strict Registration Deadline vs Tournament End Check ---
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = "Registration deadline date is required";
    } else if (!formData.registrationDeadlineTime) {
      newErrors.registrationDeadlineTime =
        "Registration deadline time is required";
    } else if (formData.endDate && formData.endTime) {
      const regDeadlineDateTime = new Date(
        `${formData.registrationDeadline}T${formData.registrationDeadlineTime}`,
      );
      const tournamentEndDateTime = new Date(
        `${formData.endDate}T${formData.endTime}`,
      );

      if (regDeadlineDateTime >= tournamentEndDateTime) {
        newErrors.registrationDeadline =
          "Registration deadline must be before tournament end time";
      }
    }

    if (
      formData.registrationFee !== "" &&
      Number(formData.registrationFee) < 0
    ) {
      newErrors.registrationFee = "Fee cannot be negative";
    }
    if (!formData.maxTeams || Number(formData.maxTeams) <= 1) {
      newErrors.maxTeams = "Must have at least 2 teams/participants";
    }
    if (!formData.teamSize || Number(formData.teamSize) <= 0) {
      newErrors.teamSize = "Team size must be at least 1";
    }

    if (formData.prizes.length === 0) {
      newErrors.prizes = "At least one prize tier is required";
    } else if (
      formData.prizes.some(
        (p) => !p.position || p.amount === "" || Number(p.amount) < 0,
      )
    ) {
      newErrors.prizes =
        "All prizes must have a position and valid positive amount";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix validation errors before submitting.");
    }

    return Object.keys(newErrors).length === 0;
  };

  const convertISTToUTC = (date, time) => {
    // The selected date and time are treated as India time.
    // Example: 2026-09-05 + 10:00 AM → 2026-09-05T04:30:00.000Z

    const [hours, minutes] = time.split(":").map(Number);

    const istDate = new Date(
      `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+05:30`,
    );

    return istDate.toISOString();
  };

  const handleSubmit = async (status = "published") => {
    // Draft functionality is intentionally disabled for now.
    if (status === "draft") return;

    if (!validateForm()) return;

    const currentMandatoryRules = MANDATORY_RULES[formData.venueType] || [];
    const validCustomRules = formData.customRules.filter((rule) => rule.trim());

    const combinedRulesList = [...currentMandatoryRules, ...validCustomRules];

    const payload = {
      title: formData.name.trim(),

      game: formData.game.trim(),

      tournamentType: Number(formData.teamSize) > 1 ? "team" : "solo",

      description: formData.description.trim(),

      rules: combinedRulesList.join("\n"),

      tournamentMode: formData.venueType,

      venue: `${formData.venueDetails.trim()} (${formData.city.trim()})`,

      cityRegion: formData.city.trim(),

      // Convert selected India date/time into UTC ISO dates.
      startDate: convertISTToUTC(formData.startDate, formData.startTime),

      endDate: convertISTToUTC(formData.endDate, formData.endTime),

      registrationDeadline: convertISTToUTC(
        formData.registrationDeadline,
        formData.registrationDeadlineTime,
      ),

      entryFee:
        formData.registrationFee === "" ? 0 : Number(formData.registrationFee),

      prizePool: calculateTotalPrize(),

      prizes: formData.prizes.map((prize) => ({
        position: Number(prize.position),
        amount: Number(prize.amount),
      })),

      maxParticipants: Number(formData.maxTeams),

      teamSize: Number(formData.teamSize),

      // Only Publish is connected right now.
      status: "published",
    };

    try {
      await tournamentService.create(payload);

      toast.success("Tournament published successfully!");

      navigate("/organizer/dashboard");
    } catch (err) {
      console.error("Tournament creation failed:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to publish tournament. Please try again.",
      );
    }
  };

  // Uses custom CSS classes directly mapped to index.css
  const inputStyle =
    "theme-input w-full px-3.5 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[var(--np-accent)] transition-all";
  const boxStyle = "theme-icon-box p-4 rounded-xl border";

  if (checkingVerification) {
    return (
      <div className="flex items-center justify-center py-20 theme-text">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Checking verification status...
      </div>
    );
  }

  if (verificationStatus !== "verified") {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <div className="theme-card border rounded-2xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-[color-mix(in_srgb,var(--np-warning)_10%,transparent)] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-[var(--np-warning)]" />
            </div>
          </div>

          <h2 className="text-xl font-bold theme-text">
            Verification Required
          </h2>

          <p className="text-sm theme-subtext">
            You must be a verified organizer before creating a tournament.
          </p>

          <p className="text-xs font-semibold text-[var(--np-warning)] capitalize">
            Current Status: {verificationStatus || "Profile Incomplete"}
          </p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/organizer/profile")}
              className="[background:var(--np-accent)] hover:[background:var(--np-accent-strong)] text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              View Profile
            </button>

            <button
              type="button"
              onClick={() => navigate("/organizer/dashboard")}
              className="theme-card theme-border theme-text border px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="theme-card theme-border theme-text theme-hover flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border cursor-pointer transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <p className="np-eyebrow">Organizer</p>

          <h1 className="theme-text font-display text-2xl font-bold mt-1">
            Create New Tournament
          </h1>
          <p className="theme-subtext text-sm">
            Configure parameters, venue mode, and rules.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="theme-card border space-y-6 p-6 sm:p-8 rounded-2xl shadow-sm">
        {/* Section 1: Basic Details */}
        <div>
          <h2 className="theme-text theme-border text-base font-bold border-b pb-2 mb-4">
            1. Basic Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="theme-text block text-xs font-bold uppercase mb-1">
                Tournament Name *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${inputStyle} ${errors.name ? "border-[var(--np-danger)]" : ""}`}
                placeholder="e.g. Nexus Invitational Season 1"
              />
              {errors.name && (
                <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="theme-text block text-xs font-bold uppercase mb-1">
                Esports Game *
              </label>
              <input
                type="text"
                name="game"
                value={formData.game}
                onChange={handleInputChange}
                className={`${inputStyle} ${errors.game ? "border-[var(--np-danger)]" : ""}`}
                placeholder="e.g. Valorant, BGMI, Tekken 8"
              />
              {errors.game && (
                <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.game}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="theme-text block text-xs font-bold uppercase mb-1">
                Description *
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className={`${inputStyle} ${errors.description ? "border-[var(--np-danger)]" : ""}`}
                placeholder="Detailed tournament overview..."
              />
              {errors.description && (
                <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Schedule & Venue Mode */}
        <div>
          <h2 className="theme-text theme-border text-base font-bold border-b pb-2 mb-4">
            2. Schedule & Venue Mode
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className={boxStyle}>
                <span className="block text-xs font-bold text-[var(--np-accent-2)] uppercase mb-2">
                  Tournament Start
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="theme-subtext block text-[11px] font-semibold uppercase mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`${inputStyle} ${errors.startDate ? "border-[var(--np-danger)]" : ""}`}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="theme-subtext block text-[11px] font-semibold uppercase mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`${inputStyle} ${errors.startTime ? "border-[var(--np-danger)]" : ""}`}
                    />
                    {errors.startTime && (
                      <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className={boxStyle}>
                <span className="block text-xs font-bold text-[var(--np-accent-2)] uppercase mb-2">
                  Tournament End
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="theme-subtext block text-[11px] font-semibold uppercase mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      min={formData.startDate || todayStr}
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`${inputStyle} ${errors.endDate ? "border-[var(--np-danger)]" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="theme-subtext block text-[11px] font-semibold uppercase mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`${inputStyle} ${errors.endTime ? "border-[var(--np-danger)]" : ""}`}
                    />
                    {errors.endTime && (
                      <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Deadline */}
            <div className={boxStyle}>
              <span className="block text-xs font-bold text-[var(--np-danger)] uppercase mb-2">
                Registration Deadline
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="theme-subtext block text-[11px] font-semibold uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    max={formData.endDate || undefined}
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className={`${inputStyle} ${errors.registrationDeadline ? "border-[var(--np-danger)]" : ""}`}
                  />
                  {errors.registrationDeadline && (
                    <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.registrationDeadline}
                    </p>
                  )}
                </div>
                <div>
                  <label className="theme-subtext block text-[11px] font-semibold uppercase mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="registrationDeadlineTime"
                    value={formData.registrationDeadlineTime}
                    onChange={handleInputChange}
                    className={`${inputStyle} ${errors.registrationDeadlineTime ? "border-[var(--np-danger)]" : ""}`}
                  />
                  {errors.registrationDeadlineTime && (
                    <p className="text-xs text-[var(--np-danger)] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.registrationDeadlineTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="theme-text block text-xs font-bold uppercase mb-1">
                  Tournament Mode *
                </label>
                <select
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleVenueTypeChange}
                  className={`${inputStyle} font-semibold text-[var(--np-accent-2)]`}
                >
                  <option value="Online">Online Tournament</option>
                  <option value="Offline">Offline / LAN Event</option>
                </select>
              </div>

              <div>
                <label className="theme-text block text-xs font-bold uppercase mb-1">
                  Venue Details
                </label>
                <input
                  type="text"
                  name="venueDetails"
                  value={formData.venueDetails}
                  onChange={handleInputChange}
                  className={inputStyle}
                  placeholder={
                    formData.venueType === "Online"
                      ? "e.g. Discord / Room Code"
                      : "e.g. LXG Arena"
                  }
                />
              </div>

              <div>
                <label className="theme-text block text-xs font-bold uppercase mb-1">
                  City / Region
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={inputStyle}
                  placeholder="e.g. Mumbai"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Registration & Slots */}
        <div>
          <h2 className="theme-text theme-border text-base font-bold border-b pb-2 mb-4">
            3. Registration & Slots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="theme-text block text-xs font-bold uppercase mb-1">
                Registration Fee (₹) *
              </label>
              <input
                type="number"
                min="0"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleInputChange}
                placeholder="0"
                className={`${inputStyle} ${errors.registrationFee ? "border-[var(--np-danger)]" : ""}`}
              />
              {errors.registrationFee && (
                <p className="text-xs text-[var(--np-danger)] mt-1">
                  {errors.registrationFee}
                </p>
              )}
            </div>
            <div>
              <label className="theme-text block text-xs font-bold uppercase mb-1">
                Max Slots *
              </label>
              <input
                type="number"
                min="2"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleInputChange}
                className={`${inputStyle} ${errors.maxTeams ? "border-[var(--np-danger)]" : ""}`}
              />
              {errors.maxTeams && (
                <p className="text-xs text-[var(--np-danger)] mt-1">{errors.maxTeams}</p>
              )}
            </div>
            <div>
              <label className="theme-text block text-xs font-bold uppercase mb-1">
                Team Size (Players) *
              </label>
              <input
                type="number"
                min="1"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                className={`${inputStyle} ${errors.teamSize ? "border-[var(--np-danger)]" : ""}`}
              />
              {errors.teamSize && (
                <p className="text-xs text-[var(--np-danger)] mt-1">{errors.teamSize}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Prize Pool Distribution */}
        <div>
          <div className="flex justify-between items-center theme-border border-b pb-2 mb-4">
            <h2 className="theme-text text-base font-bold">
              4. Prize Pool Distribution
            </h2>
            <span className="text-xs font-bold text-[var(--np-accent-2)] theme-icon-box border px-3 py-1 rounded-full">
              Total Prize Pool: ₹{calculateTotalPrize().toLocaleString("en-IN")}
            </span>
          </div>

          {errors.prizes && (
            <p className="text-xs text-[var(--np-danger)] mb-3 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.prizes}
            </p>
          )}

          <div className="space-y-3">
            {formData.prizes.map((p, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="theme-icon-box theme-border theme-text w-32 px-3.5 py-2 text-sm border font-semibold rounded-lg">
                  Rank {p.position}
                </div>
                <input
                  type="number"
                  min="0"
                  value={p.amount}
                  onChange={(e) => updatePrize(idx, "amount", e.target.value)}
                  className={inputStyle}
                  placeholder="Prize Amount (₹)"
                />
                <button
                  type="button"
                  onClick={() => removePrize(idx)}
                  className="p-2 text-[var(--np-danger)] hover:bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPrize}
              className="theme-icon-box theme-border text-[var(--np-accent-2)] hover:bg-[color-mix(in_srgb,var(--np-accent)_10%,transparent)] border flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Prize Tier
            </button>
          </div>
        </div>

        {/* Section 5: Rules & Guidelines */}
        <div>
          <h2 className="theme-text theme-border text-base font-bold border-b pb-2 mb-4">
            5. Rules & Guidelines
          </h2>

          <div className="theme-icon-box theme-border border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--np-accent-2)] uppercase mb-2">
              <Lock className="w-3.5 h-3.5" />
              Mandatory Rules for {formData.venueType} Mode
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs theme-subtext">
              {MANDATORY_RULES[formData.venueType]?.map((mRule, idx) => (
                <li key={idx} className="font-medium">
                  {mRule}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <label className="theme-text block text-xs font-bold uppercase">
              Additional Rules
            </label>
            {formData.customRules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateCustomRule(idx, e.target.value)}
                  className={inputStyle}
                  placeholder="Additional rule clause detail..."
                />
                <button
                  type="button"
                  onClick={() => removeCustomRule(idx)}
                  className="p-2 text-[var(--np-danger)] hover:bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCustomRule}
              className="theme-icon-box theme-border text-[var(--np-accent-2)] hover:bg-[color-mix(in_srgb,var(--np-accent)_10%,transparent)] border flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Rule Clause
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="theme-border flex items-center justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="btn-press np-press theme-card theme-border theme-text theme-hover px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all shadow-sm"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            className="btn-press np-press px-4 py-2 text-xs font-bold text-white [background:var(--np-accent)] hover:[background:var(--np-accent-strong)] rounded-lg cursor-pointer transition-all shadow-sm"
          >
            Publish Tournament
          </button>
        </div>
      </div>
    </div>
  );
}
