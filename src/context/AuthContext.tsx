import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { fullName: string };
type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

const TOKEN_KEY = 'prescription_writer_access_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const AuthContext = createContext<AuthContextValue | null>(null);

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || 'Request failed. Please try again.');
  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(readResponse)
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }: LoginInput) => {
    const body = new URLSearchParams({ username: email, password });
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const payload = await readResponse(response);
    localStorage.setItem(TOKEN_KEY, payload.access_token);
    setUser(payload.user);
  };

  const register = async ({ fullName, email, password }: RegisterInput) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    await readResponse(response);
    await login({ email, password });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
