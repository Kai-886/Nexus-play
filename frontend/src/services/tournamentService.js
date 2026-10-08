import api from './api';

export const tournamentService = {
  // Tournaments lists
  getAll: async () => {
    const res = await api.get('/tournaments');
    return res.data;
  },

  // Public landing-page feed (published/ongoing, trimmed fields)
  getLanding: async () => {
    const res = await api.get('/tournaments', {
      params: { scope: 'landing' },
    });
    return res.data;
  },

  // Organizer List
  getMy: async () => {
    const res = await api.get('/tournaments/me');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/tournaments/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/tournaments', data);
    return res.data;
  },

  getRegisteredTeams: async (tournamentId) => {
    const response = await api.get(
      `/tournaments/${tournamentId}/registrations`
    );

    return response.data;
  },


};