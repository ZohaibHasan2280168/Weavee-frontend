"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../../services/authService";
import { requestForToken } from "../../utils/firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(false); // no need to block UI
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const syncFcmToken = useCallback(async () => {
    try {
      const token = await requestForToken();
      if (token) {
        localStorage.setItem("fcmToken", token);
        await authService.updateFcmToken(token);
      }
    } catch (err) {
      console.error("FCM Token sync failed:", err);
    }
  }, []);

  // Sync token on mount if user is already authenticated
  useEffect(() => {
    if (user) {
      syncFcmToken();
    }
  }, [user, syncFcmToken]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      // Trigger FCM token sync post-login
      setTimeout(() => {
        syncFcmToken();
      }, 500);
    }

    return data;
  }, [syncFcmToken]);

  const logout = useCallback(async () => {
    try {
      const fcmToken = localStorage.getItem("fcmToken");
      await authService.logout(fcmToken);
    } catch (err) {
      console.error("Logout API error:", err?.response?.data || err.message || err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("fcmToken");
      setUser(null);
    }
  }, []);

  const updateAvatar = useCallback(({ url, publicId }) => {
    const updatedUser = { ...user, avatar: { url, publicId } };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        mustChangePassword,
        setMustChangePassword,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
