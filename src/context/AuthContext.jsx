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

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

function readStoredSession() {
  try {
    const storage = getStorage();
    if (!storage) return null;

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  const storage = getStorage();
  if (!storage) return;

  if (!session) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [isInitializing, setIsInitializing] = useState(true);
  const sessionRef = useRef(session);
  const refreshPromiseRef = useRef(null);

  const clearSession = useCallback(() => {
    sessionRef.current = null;
    writeStoredSession(null);
    setSession(null);
  }, []);

  const saveSession = useCallback(nextSession => {
    sessionRef.current = nextSession;
    writeStoredSession(nextSession);
    setSession(nextSession);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      const currentSession = sessionRef.current;
      if (!currentSession?.refreshToken) {
        clearSession();
        return null;
      }

      try {
        const response = await authService.refreshToken(currentSession.refreshToken);
        const tokens = response?.data || response;
        const nextSession = {
          ...currentSession,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || currentSession.refreshToken,
        };
        saveSession(nextSession);
        return tokens.accessToken;
      } catch (error) {
        clearSession();
        throw error;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [clearSession, saveSession]);

  useEffect(() => {
    configureApiClient({
      getToken: () => sessionRef.current?.accessToken || null,
      handleUnauthorized: clearSession,
      refreshToken: refreshAccessToken,
    });
  }, [clearSession, refreshAccessToken]);

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
          const currentSession = sessionRef.current;
          if (currentSession) saveSession({ ...currentSession, user });
        }
      } catch {
        try {
          await refreshAccessToken();
          const meResponse = await authService.getCurrentUser();
          const user = meResponse?.data?.user || meResponse?.user;
          if (isMounted && user) {
            const currentSession = sessionRef.current;
            if (currentSession) saveSession({ ...currentSession, user });
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
  }, [refreshAccessToken, clearSession, saveSession]);

  const login = useCallback(async credentials => {
    const response = await authService.login(credentials);
    const data = response?.data || response;
    const nextSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    saveSession(nextSession);
    return data.user;
  }, [saveSession]);

  const register = useCallback(async payload => {
    const response = await authService.register(payload);
    const data = response?.data || response;
    if (data.requiresEmailVerification) {
      return data;
    }
    const nextSession = {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    saveSession(nextSession);
    return data;
  }, [saveSession]);

  const logout = useCallback(async () => {
    const refreshToken = sessionRef.current?.refreshToken;
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } finally {
      clearSession();
    }
  }, [clearSession]);

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
