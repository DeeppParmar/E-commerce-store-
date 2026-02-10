import * as React from "react";
import { User, Session } from "@supabase/supabase-js";
import { apiClient } from "@/lib/api";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check active session via API
    apiClient.getSession().then(({ session, user }) => {
      setSession(session as any); // API returns simplified session
      setUser(user);
      setLoading(false);
    }).catch(() => {
      setSession(null);
      setUser(null);
      setLoading(false);
    });
  }, []);

  const signOut = React.useCallback(async () => {
    await apiClient.logout();
    setSession(null);
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isAuthenticated: !!session,
      signOut,
    }),
    [session, user, signOut]
  );

  if (loading) {
    // You might want a loading spinner here
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

