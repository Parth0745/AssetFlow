import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("assetflow_token") || sessionStorage.getItem("assetflow_token");
        if (!token) return;
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("assetflow_token");
        sessionStorage.removeItem("assetflow_token");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    if (payload.rememberMe) {
      localStorage.setItem("assetflow_token", data.token);
      sessionStorage.removeItem("assetflow_token");
    } else {
      sessionStorage.setItem("assetflow_token", data.token);
      localStorage.removeItem("assetflow_token");
    }
    setUser(data.user);
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("assetflow_token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("assetflow_token");
    sessionStorage.removeItem("assetflow_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, signup, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
