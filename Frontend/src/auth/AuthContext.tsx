import * as React from "react";

type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN_KEY = "auth_token";
const STORAGE_USER_KEY = "auth_user";

function readStoredAuth() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  const rawUser = localStorage.getItem(STORAGE_USER_KEY);

  let user: AuthUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as AuthUser;
    } catch {
      user = null;
    }
  }

  return {
    token: token || null,
    user,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ token, user }, setAuth] = React.useState(() => readStoredAuth());

  const login = React.useCallback(async ({ email, password }: { email: string; password: string }) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = "Login failed";
      try {
        const data = (await res.json()) as { message?: string };
        if (data?.message) message = data.message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const data = (await res.json()) as {
      token: string;
      user: AuthUser;
    };

    localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));

    setAuth({ token: data.token, user: data.user });
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setAuth({ token: null, user: null });
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
