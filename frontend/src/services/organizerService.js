
import api from "./api";

// Get logged-in organizer profile
export const getOrganizerProfile = async () => {
  const response = await api.get("/organizer/profile");
  return response.data;
};


// Get logged-in organizer profile
export const getOrganizerDashboard = async () => {
  const response = await api.get("/organizer/dashboard");
  return response.data;
};

// Create organizer profile
export const createOrganizerProfile = async (profileData) => {
  const response = await api.post("/organizer/profile", profileData);
  return response.data;
};

// Update organizer profile
export const updateOrganizerProfile = async (profileData) => {
  const response = await api.put("/organizer/profile", profileData);
  return response.data;
};

// Bundled object export
export const organizerService = {
  getOrganizerProfile,
  createOrganizerProfile,
  updateOrganizerProfile,
  getOrganizerDashboard,
};