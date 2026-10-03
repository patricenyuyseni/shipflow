import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { login as loginRequest, logoutRequest, type User } from "../api/auth";
import { refreshSession, tokenStore } from "../api/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(tokenStore.hasSessionHint());

  useEffect(() => {
    if (!tokenStore.hasSessionHint()) return;
    refreshSession().then((s) => setUser(s?.user ?? null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await loginRequest(email, password);
    tokenStore.set(token);
    setUser(user);
    return user;
  }, []);
  const logout = useCallback(() => { void logoutRequest(); tokenStore.clear(); setUser(null); }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
