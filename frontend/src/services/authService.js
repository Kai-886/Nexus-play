import api from "./api";

// Login
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/password/forgot", { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token, password, confirmPassword) => {
  const response = await api.put(`/auth/password/reset/${token}`, {
    password,
    confirmPassword,
  });
  return response.data;
};

// Register user
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Get currently authenticated user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Register organizer account
export const registerOrganizer = async (userData) => {
  const response = await api.post("/auth/organizer/register", userData);
  return response.data;
};

// Register corporate sponsor account
export const registerSponsor = async (userData) => {
  const response = await api.post("/auth/sponsor/register", userData);
  return response.data;
};



// Update User Profile
export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};

// Update Settings
export const updateSettings = async (settingsData) => {
  const response = await api.put("/auth/settings", settingsData);
  return response.data;
};

// Logout
export const logoutUser = async () => {
  const response = await api.get("/auth/logout");
  return response.data;
};

// -------------------------------------------------------------
// Bundled Object Export for components using `authService.method()`
// -------------------------------------------------------------
export const authService = {
  loginUser,
  forgotPassword,
  resetPassword,
  registerUser,
  getCurrentUser,
  registerOrganizer,
  registerSponsor,
  updateProfile,
  updateSettings,
  logoutUser,
};