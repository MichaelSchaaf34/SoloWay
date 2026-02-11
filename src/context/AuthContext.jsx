import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { configureApiClient } from '../utils/apiClient';
import * as authService from '../utils/authService';

const STORAGE_KEY = 'soloway.auth.session';
export const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [isInitializing, setIsInitializing] = useState(true);
  const sessionRef = useRef(session);

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    writeStoredSession(session);
  }, [session]);

  useEffect(() => {
    configureApiClient({
      getToken: () => session?.accessToken || null,
      handleUnauthorized: clearSession,
    });
  }, [session, clearSession]);

  const refreshAccessToken = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession?.refreshToken) {
      clearSession();
      return null;
    }

    const response = await authService.refreshToken(currentSession.refreshToken);
    const tokens = response?.data || response;

    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || prev.refreshToken,
      };
    });
    configureApiClient({
      getToken: () => tokens.accessToken,
      handleUnauthorized: clearSession,
    });
    return tokens.accessToken;
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      if (!session?.accessToken) {
        if (isMounted) setIsInitializing(false);
        return;
      }

      try {
        const meResponse = await authService.getCurrentUser();
        const user = meResponse?.data?.user || meResponse?.user;
        if (isMounted && user) {
          setSession(prev => (prev ? { ...prev, user } : prev));
        }
      } catch {
        try {
          await refreshAccessToken();
          const meResponse = await authService.getCurrentUser();
          const user = meResponse?.data?.user || meResponse?.user;
          if (isMounted && user) {
            setSession(prev => (prev ? { ...prev, user } : prev));
          }
        } catch {
          if (isMounted) clearSession();
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    bootstrapAuth();
    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, refreshAccessToken, clearSession]);

  const login = useCallback(async credentials => {
    const response = await authService.login(credentials);
    const data = response?.data || response;
    const nextSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    configureApiClient({
      getToken: () => nextSession.accessToken,
      handleUnauthorized: clearSession,
    });
    setSession(nextSession);
    return data.user;
  }, [clearSession]);

  const register = useCallback(async payload => {
    const response = await authService.register(payload);
    const data = response?.data || response;
    const nextSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    configureApiClient({
      getToken: () => nextSession.accessToken,
      handleUnauthorized: clearSession,
    });
    setSession(nextSession);
    return data.user;
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      if (session?.accessToken) await authService.logout();
    } finally {
      clearSession();
    }
  }, [session?.accessToken, clearSession]);

  const value = useMemo(() => ({
    user: session?.user || null,
    accessToken: session?.accessToken || null,
    refreshToken: session?.refreshToken || null,
    isAuthenticated: Boolean(session?.accessToken),
    isInitializing,
    login,
    register,
    logout,
    refreshAccessToken,
  }), [session, isInitializing, login, register, logout, refreshAccessToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
