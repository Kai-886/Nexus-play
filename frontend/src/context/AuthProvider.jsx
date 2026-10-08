import { useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  registerOrganizer,
  registerSponsor,
} from "../services/authService";
import { createOrganizerProfile } from "../services/organizerService";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether user is already authenticated
  const fetchUser = async () => {
    try {
      const data = await getCurrentUser();

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchUser();
    };
    run();
  }, []);

  // Login
  const login = async (credentials) => {
    const data = await loginUser(credentials);

    if (data.success) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
    }

    return data;
  };

  // Register participant
  const register = async (userData) => {
    const data = await registerUser(userData);

    if (data.success) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
    }

    return data;
  };

  // Register organizer
  const registerOrganizerAccount = async (userData) => {
    const data = await registerOrganizer(userData);

    if (data.success) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
    }

    return data;
  };

  // Register corporate sponsor
  const registerSponsorAccount = async (userData) => {
    const data = await registerSponsor(userData);

    if (data.success) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
    }

    return data;
  };

  const createOrganizerProfileData = async (profileData) => {
    const data = await createOrganizerProfile(profileData);
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout error
    }
    localStorage.removeItem("token");
    localStorage.removeItem("nexus_demo_user");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    registerOrganizerAccount,
    registerSponsorAccount,
    createOrganizerProfileData,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
