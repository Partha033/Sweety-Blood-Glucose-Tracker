import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore authenticated session on initial page load
  useEffect(() => {
    let isMounted = true;

    async function checkAuthStatus() {
      try {
        const response = await authApi.getMe();
        if (isMounted && response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Not authenticated or session expired
        if (isMounted) {
          setUser(null);
          sessionStorage.removeItem("sweety_token");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      const { user: loggedInUser, token } = response.data;

      if (token) {
        sessionStorage.setItem("sweety_token", token);
      }
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message || "Invalid email or password.");
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await authApi.register({ name, email, password });
      const { user: registeredUser, token } = response.data;

      if (token) {
        sessionStorage.setItem("sweety_token", token);
      }
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError(err.message || "Registration failed.");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      sessionStorage.removeItem("sweety_token");
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
