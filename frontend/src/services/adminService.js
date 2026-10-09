import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const adminService = {
  getProfile: async () => {
    const response = await api.get("/superadmin/profile");
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get("/superadmin/dashboard");
    return response.data;
  },

  getPlayers: async () => {
    const response = await api.get("/superadmin/players");
    return response.data;
  },

  getPlayer: async (id) => {
    const response = await api.get(
      `/superadmin/players/${id}`
    );
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(
      `/superadmin/users/${id}/role`,
      { role }
    );
    return response.data;
  },

  getOrganizers: async () => {
    const response = await api.get("/superadmin/organizers");
    return response.data;
  },

  getOrganizer: async (id) => {
    const response = await api.get(`/superadmin/organizers/${id}`);
    return response.data;
  },

  verifyOrganizer: async (id) => {
    const response = await api.put(
      `/superadmin/organizers/${id}/verify`
    );
    return response.data;
  },

  rejectOrganizer: async (id) => {
    const response = await api.put(
      `/superadmin/organizers/${id}/reject`
    );
    return response.data;
  },

  suspendOrganizer: async (id) => {
    const response = await api.put(
      `/superadmin/organizers/${id}/suspend`
    );
    return response.data;
  },

  getSponsors: async () => {
    const response = await api.get("/superadmin/sponsors");
    return response.data;
  },

  getSponsor: async (id) => {
    const response = await api.get(`/superadmin/sponsors/${id}`);
    return response.data;
  },

  verifySponsor: async (id) => {
    const response = await api.put(
      `/superadmin/sponsors/${id}/verify`
    );
    return response.data;
  },

  rejectSponsor: async (id) => {
    const response = await api.put(
      `/superadmin/sponsors/${id}/reject`
    );
    return response.data;
  },

  suspendSponsor: async (id) => {
    const response = await api.put(
      `/superadmin/sponsors/${id}/suspend`
    );
    return response.data;
  },

  getTournaments: async () => {
    const response = await api.get("/superadmin/tournaments");
    return response.data;
  },

  getTournament: async (id) => {
    const response = await api.get(
      `/superadmin/tournaments/${id}`
    );
    return response.data;
  },

  updateTournamentStatus: async (id, status) => {
    const response = await api.put(
      `/superadmin/tournaments/${id}/status`,
      { status }
    );
    return response.data;
  },

  deleteTournament: async (id) => {
    const response = await api.delete(
      `/superadmin/tournaments/${id}`
    );
    return response.data;
  },

  // GET /api/v1/admin/reports — strategic reports live on the admin router
  // (guarded for admin + superadmin); no /superadmin/reports route exists.
  getReports: async () => {
    const response = await api.get("/admin/reports");
    return response.data;
  },

  getSponsorships: async () => {
    const response = await api.get("/superadmin/sponsorships");
    return response.data;
  },

  getSponsorship: async (id) => {
    const response = await api.get(
      `/superadmin/sponsorships/${id}`
    );
    return response.data;
  },
};

export default adminService;