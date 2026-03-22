import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, configureApiTokenHandlers } from "../lib/api.js";

const STORAGE_ACCESS = "algoverse_access";
const STORAGE_USER = "algoverse_user";

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadStoredAccess() {
  return localStorage.getItem(STORAGE_ACCESS);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [accessToken, setAccessTokenState] = useState(loadStoredAccess);
  const [bootstrapping, setBootstrapping] = useState(true);

  const setAccessToken = useCallback((token) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem(STORAGE_ACCESS, token);
    } else {
      localStorage.removeItem(STORAGE_ACCESS);
    }
  }, []);

  useEffect(() => {
    configureApiTokenHandlers(
      () => accessToken,
      (t) => setAccessToken(t)
    );
  }, [accessToken, setAccessToken]);

  useEffect(() => {
    const onClear = () => {
      setUser(null);
      localStorage.removeItem(STORAGE_USER);
    };
    window.addEventListener("algoverse:auth-clear", onClear);
    return () => window.removeEventListener("algoverse:auth-clear", onClear);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const storedUser = loadStoredUser();
      if (!storedUser) {
        setBootstrapping(false);
        return;
      }
      try {
        const { data } = await api.post("/api/auth/refresh");
        if (!cancelled) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
        }
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem(STORAGE_USER);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setAccessToken]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
    },
    [setAccessToken]
  );

  const register = useCallback(
    async (email, password, displayName) => {
      const { data } = await api.post("/api/auth/register", {
        email,
        password,
        displayName,
      });
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
    },
    [setAccessToken]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(STORAGE_USER);
  }, [setAccessToken]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      bootstrapping,
      login,
      register,
      logout,
      isAuthenticated: !!user && !!accessToken,
    }),
    [user, accessToken, bootstrapping, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
