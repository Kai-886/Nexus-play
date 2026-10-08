import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const participantService = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },

  // Get tournaments
  getTournaments: async () => {
    const response = await api.get("/tournaments");
    return response.data;
  },

  // Register for a tournament
  registerTournament: async (tournamentId, registrationData) => {
    const response = await api.post(
      `/tournaments/${tournamentId}/register`,
      registrationData
    );

    return response.data;
  },

  // Get all registrations of logged-in user
  getMyRegistrations: async () => {
    const response = await api.get("/registrations/me");
    return response.data;
  },

  // Get registration for a specific tournament
  getMyRegistration: async (tournamentId) => {
    const response = await api.get(
      `/tournaments/${tournamentId}/registration`
    );

    return response.data;
  },

  // Cancel registration
  cancelRegistration: async (tournamentId) => {
    const response = await api.delete(
      `/tournaments/${tournamentId}/registration`
    );

    return response.data;
  },

  // Get participant profile
  getProfile: async () => {
    const response = await api.get("/participant/profile");
    return response.data;
  },

  // Update participant profile
  updateProfile: async (data) => {
    const response = await api.put(
      "/participant/profile",
      data
    );

    return response.data;
  },

  // Get participation history
  getHistory: async () => {
    const response = await api.get("/participant/history");
    return response.data;
  },
};