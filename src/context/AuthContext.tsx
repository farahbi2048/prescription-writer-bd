/** Authentication state, API requests and browser token storage. */
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL } from '../config';

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_demo?: boolean;
};

type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { fullName: string };
type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isDemo: boolean;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  enterDemo: () => void;
  logout: () => void;
};

const TOKEN_KEY = 'prescription_writer_access_token';
const AuthContext = createContext<AuthContextValue | null>(null);

/** Parse an API response and turn unsuccessful responses into useful errors. */
async function readResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || 'Request failed. Please try again.');
  return payload;
}

/** Provide the signed-in user and authentication actions to the application. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    setAccessToken(token);
    fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(readResponse)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /** Exchange an email and password for a stored access token. */
  const login = async ({ email, password }: LoginInput) => {
    if (!API_BASE_URL) throw new Error('The live backend is not configured yet. Use the portfolio demo for now.');
    const body = new URLSearchParams({ username: email, password });
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const payload = await readResponse(response);
    localStorage.setItem(TOKEN_KEY, payload.access_token);
    setAccessToken(payload.access_token);
    setUser(payload.user);
  };

  /** Create an account and sign in with the same credentials. */
  const register = async ({ fullName, email, password }: RegisterInput) => {
    if (!API_BASE_URL) throw new Error('The live backend is not configured yet. Use the portfolio demo for now.');
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    await readResponse(response);
    await login({ email, password });
  };

  /** Enter the local portfolio demo without creating an authenticated session. */
  const enterDemo = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
    setUser({
      id: 'portfolio-demo',
      full_name: 'Portfolio Demo Clinician',
      email: 'demo@example.invalid',
      role: 'demo',
      is_demo: true,
    });
  };

  /** Remove the local access token and clear the current user. */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
  };

  const isDemo = user?.is_demo === true;
  const value = useMemo(
    () => ({ user, accessToken, isDemo, loading, login, register, enterDemo, logout }),
    [user, accessToken, isDemo, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Read authentication state from the nearest provider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
