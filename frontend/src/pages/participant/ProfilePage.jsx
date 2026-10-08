import { useEffect, useState } from "react";
import { Mail, User, GraduationCap, Phone, Edit3, Save, X } from "lucide-react";
import { participantService } from "../../services/participantService.js";
import { Button } from "../../components/ui/Button";

export const ParticipantProfilePage = () => {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    mobileNumber: "",
    college: "",
    collegeId: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch participant profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await participantService.getProfile();

      const user = response.user;

      setProfile(user);

      setFormData({
        mobileNumber: user.mobileNumber || "",
        college: user.college || "",
        collegeId: user.collegeId || "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchProfile();
    };
    run();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      mobileNumber: profile?.mobileNumber || "",
      college: profile?.college || "",
      collegeId: profile?.collegeId || "",
    });

    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await participantService.updateProfile(formData);

      setProfile(response.user);

      setFormData({
        mobileNumber: response.user.mobileNumber || "",
        college: response.user.college || "",
        collegeId: response.user.collegeId || "",
      });

      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center">
        <p className="theme-subtext">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6">
        <div className="theme-card rounded-2xl p-6">
          <p className="text-[var(--np-danger)]">{error || "Unable to load profile."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="np-eyebrow">Participant</p>

          <h1 className="font-display text-2xl sm:text-3xl font-bold theme-text mt-1">
            My Profile
          </h1>

          <p className="theme-subtext mt-1">
            Manage your participant information
          </p>
        </div>

        {/* Profile Card */}
        <div className="theme-card rounded-2xl border theme-border overflow-hidden">
          {/* Profile Header */}
          <div className="p-5 sm:p-6 border-b theme-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[var(--np-accent)] to-[var(--np-accent-2)] flex items-center justify-center text-white text-xl sm:text-2xl font-black shrink-0 shadow-md shadow-indigo-600/30">
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <h2 className="theme-text text-xl font-semibold truncate">
                    {profile.name}
                  </h2>

                  <p className="theme-subtext flex items-center gap-2 mt-1 text-sm">
                    <Mail size={15} />
                    <span className="truncate">{profile.email}</span>
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button type="button" onClick={handleEdit} icon={Edit3} className="w-full sm:w-auto">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          {(error || success) && (
            <div className="px-5 sm:px-6 pt-5">
              {error && (
                <div className="rounded-lg border border-[var(--np-danger)]/30 bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] text-[var(--np-danger)] px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-[var(--np-success)]/30 bg-[color-mix(in_srgb,var(--np-success)_10%,transparent)] text-[var(--np-success)] px-4 py-3 text-sm">
                  {success}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="theme-text text-sm font-medium block mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-subtext"
                  />

                  <input
                    type="text"
                    value={profile.name || ""}
                    disabled
                    className="theme-input w-full pl-10 pr-4 py-3 rounded-lg opacity-70 cursor-not-allowed"
                  />
                </div>

                <p className="theme-subtext text-xs mt-1.5">
                  Your account name cannot be changed here.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="theme-text text-sm font-medium block mb-2">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-subtext"
                  />

                  <input
                    type="email"
                    value={profile.email || ""}
                    disabled
                    className="theme-input w-full pl-10 pr-4 py-3 rounded-lg opacity-70 cursor-not-allowed"
                  />
                </div>

                <p className="theme-subtext text-xs mt-1.5">
                  Your registered email address.
                </p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="theme-text text-sm font-medium block mb-2">
                  Mobile Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-subtext"
                  />

                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your mobile number"
                    maxLength="10"
                    className="theme-input w-full pl-10 pr-4 py-3 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <p className="theme-subtext text-xs mt-1.5">
                  This number can be used for tournament communication.
                </p>
              </div>

              {/* College */}
              <div>
                <label className="theme-text text-sm font-medium block mb-2">
                  College
                </label>

                <div className="relative">
                  <GraduationCap
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-subtext"
                  />

                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your college name"
                    className="theme-input w-full pl-10 pr-4 py-3 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* College ID */}
              <div>
                <label className="theme-text text-sm font-medium block mb-2">
                  College ID
                </label>

                <div className="relative">
                  <GraduationCap
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-subtext"
                  />

                  <input
                    type="text"
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your college ID"
                    className="theme-input w-full pl-10 pr-4 py-3 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            {isEditing && (
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-5 border-t theme-border">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border theme-border theme-text hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <Button type="submit" disabled={saving} loading={saving} icon={Save}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParticipantProfilePage;
