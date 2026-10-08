import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { AuthRepository } from "@/data/auth/auth-repository";
import type { AuthSession } from "@/data/auth/auth-session";
import type { TokenStore } from "@/data/auth/token-store";
import type { AuthUser } from "@/domain/models";

import { restoreAuthSession, type AuthStatus } from "./auth-session-flow";

export type { AuthStatus };

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retrySession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  repository,
  tokenStore,
  session,
}: {
  children: ReactNode;
  repository: AuthRepository;
  tokenStore: TokenStore;
  session: AuthSession;
}) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearSession = useCallback(async () => {
    session.setAccessToken(null);
    await tokenStore.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, [session, tokenStore]);

  const hydrate = useCallback(async () => {
    setStatus("loading");
    const snapshot = await restoreAuthSession({ tokenStore, session, repository });
    setUser(snapshot.user);
    setStatus(snapshot.status);
  }, [repository, session, tokenStore]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    return session.onUnauthorized(() => {
      void clearSession();
    });
  }, [clearSession, session]);

  const persistSession = useCallback(
    async (accessToken: string, nextUser: AuthUser) => {
      await tokenStore.set(accessToken);
      session.setAccessToken(accessToken);
      setUser(nextUser);
      setStatus("authenticated");
    },
    [session, tokenStore],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await repository.login({ email, password });
      await persistSession(result.accessToken, result.user);
    },
    [persistSession, repository],
  );

  const register = useCallback(
    async (displayName: string, email: string, password: string) => {
      const result = await repository.register({ displayName, email, password });
      await persistSession(result.accessToken, result.user);
    },
    [persistSession, repository],
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      register,
      logout,
      retrySession: hydrate,
    }),
    [hydrate, login, logout, register, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}

export function useAuth(): AuthContextValue {
  const context = useOptionalAuth();

  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider");
  }

  return context;
}
