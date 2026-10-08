import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types/client.ts';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, pass: string) => Promise<{ success: boolean; error?: string; verificationToken?: string }>;
  verifyEmail: (token: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email?: string) => Promise<{ success: boolean; verificationToken?: string; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; recoveryToken?: string; error?: string }>;
  resetPassword: (token: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  toggleAdminRole: () => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe response parser that guarantees valid object and never throws JSON syntax errors
async function safeParseResponse(res: Response): Promise<{ ok: boolean; status: number; data: any }> {
  const contentType = res.headers.get('content-type') || '';
  let data: any = {};

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = { error: `Server returned invalid JSON format (HTTP ${res.status})` };
    }
  } else {
    try {
      const rawText = await res.text();
      // Handle known plain-text or HTML errors without throwing
      if (rawText.toLowerCase().includes('rate limit') || res.status === 429) {
        data = { error: 'Too many attempts. Please pause for a moment and try again.' };
      } else if (res.status === 401) {
        data = { error: 'Invalid email or password.' };
      } else if (res.status === 404) {
        data = { error: 'Authentication service endpoint not found.' };
      } else if (res.status >= 500) {
        data = { error: 'Server temporarily unavailable. Please try again in a moment.' };
      } else {
        data = { error: rawText.slice(0, 120) || `Request returned status ${res.status}` };
      }
    } catch {
      data = { error: `Network error (HTTP ${res.status})` };
    }
  }

  return {
    ok: res.ok,
    status: res.status,
    data: data || {},
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('safepicks_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const parsed = await safeParseResponse(res);
      if (parsed.ok && parsed.data?.user) {
        setUser(parsed.data.user);
      } else {
        localStorage.removeItem('safepicks_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // Offline or network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });

      const { ok, data } = await safeParseResponse(res);

      if (!ok) {
        return { success: false, error: data.error || 'Invalid email or password.' };
      }

      if (data.token && data.user) {
        localStorage.setItem('safepicks_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'Login succeeded but session could not be established.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error. Please try again.' };
    }
  };

  const register = async (email: string, username: string, pass: string) => {
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    if (!cleanEmail || !cleanUsername || !pass) {
      return { success: false, error: 'Email, username, and password are all required.' };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          username: cleanUsername,
          password: pass,
        }),
      });

      const { ok, data } = await safeParseResponse(res);

      if (!ok) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      if (data.token && data.user) {
        localStorage.setItem('safepicks_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, verificationToken: data.verificationToken };
      }

      return { success: false, error: 'Account created, please sign in with your credentials.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error. Please try again.' };
    }
  };

  const verifyEmail = async (verifyToken: string, email?: string) => {
    const cleanToken = verifyToken.trim();
    if (!cleanToken) {
      return { success: false, error: 'Verification token is required.' };
    }

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ token: cleanToken, email: email?.trim() }),
      });

      const { ok, data } = await safeParseResponse(res);

      if (!ok) {
        return { success: false, error: data.error || 'Verification failed.' };
      }

      if (token) {
        await fetchCurrentUser(token);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error. Please try again.' };
    }
  };

  const resendVerification = async (email?: string) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: email?.trim() }),
      });

      const { ok, data } = await safeParseResponse(res);

      if (!ok) {
        return { success: false, error: data.error || 'Failed to generate new code.' };
      }

      return { success: true, verificationToken: data.verificationToken };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error.' };
    }
  };

  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const { ok, data } = await safeParseResponse(res);

      if (!ok) {
        return { success: false, error: data.error || 'Request failed.' };
      }

      return { success: true, recoveryToken: data.recoveryToken };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error. Please try again.' };
    }
  };

  const resetPassword = async (resetToken: string, newPass: string) => {
    const cleanToken = resetToken.trim();
    if (!cleanToken || !newPass) {
      return { success: false, error: 'Reset code and new password are required.' };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token: cleanToken, newPassword: newPass }),
      });

      const { ok, data } = await safeParseResponse(res);

      if (!ok) {
        return { success: false, error: data.error || 'Failed to reset password.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error. Please try again.' };
    }
  };

  const toggleAdminRole = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/toggle-admin', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchCurrentUser(token);
      }
    } catch {
      // ignore
    }
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => {});
    }
    localStorage.removeItem('safepicks_token');
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        toggleAdminRole,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
