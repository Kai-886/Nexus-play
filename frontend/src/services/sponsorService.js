import api from "./api";

export const sponsorService = {
  // GET /api/v1/sponsors/me
  getProfile: async () => {
    const res = await api.get("/sponsors/me");
    return res.data;
  },

  // PUT /api/v1/sponsors/me
  updateProfile: async (data) => {
    const res = await api.put("/sponsors/me", data);
    return res.data;
  },

  // GET /api/v1/sponsors/sponsorships
  getMySponsorships: async () => {
    const res = await api.get("/sponsors/sponsorships");
    return res.data;
  },

  // POST /api/v1/sponsors/tournaments/:id/sponsors
  sponsorTournament: async (tournamentId, data) => {
    const res = await api.post(
      `/sponsors/tournaments/${tournamentId}/sponsors`,
      data
    );

    return res.data;
  },

  // GET /api/v1/sponsors/organizer/sponsors
  getOrganizerSponsorships: async () => {
    const res = await api.get("/sponsors/organizer/sponsors");
    return res.data;
  },

  // PATCH /api/v1/sponsors/organizer/sponsors/:id/status
  updateSponsorshipStatus: async (id, status, rejectionReason = "") => {
    const res = await api.patch(
      `/sponsors/organizer/sponsors/${id}/status`,
      {
        status,
        rejectionReason,
      }
    );

    return res.data;
  },
};

export default sponsorService;