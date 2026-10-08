import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register, verifyEmail, resendVerification, forgotPassword, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot' | 'reset'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedVerifyCode, setGeneratedVerifyCode] = useState<string | null>(null);

  // Helper to clear error when user interacts or edits input
  const clearErrors = () => {
    if (errorMessage) setErrorMessage(null);
  };

  const switchMode = (newMode: 'login' | 'register' | 'verify' | 'forgot' | 'reset') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode(newMode);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          setErrorMessage(null);
          onClose();
        } else {
          setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else if (mode === 'register') {
        const res = await register(email, username, password);
        if (res.success) {
          setErrorMessage(null);
          if (res.verificationToken) {
            setGeneratedVerifyCode(res.verificationToken);
            setVerificationToken(res.verificationToken);
          }
          setSuccessMessage('Registration successful! Please confirm your email verification code.');
          setMode('verify');
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      } else if (mode === 'verify') {
        const res = await verifyEmail(verificationToken, email);
        if (res.success) {
          setErrorMessage(null);
          setSuccessMessage('Email verified successfully! Your account is now fully active.');
          setTimeout(() => onClose(), 1500);
        } else {
          setErrorMessage(res.error || 'Invalid verification token. Please check the code.');
        }
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email);
        if (res.success) {
          setErrorMessage(null);
          setResetToken(res.recoveryToken || '');
          setSuccessMessage(`Password recovery initiated. Token generated: ${res.recoveryToken}`);
          setMode('reset');
        } else {
          setErrorMessage(res.error || 'Request failed. Please verify your email.');
        }
      } else if (mode === 'reset') {
        const res = await resetPassword(resetToken, newPassword);
        if (res.success) {
          setErrorMessage(null);
          setSuccessMessage('Password changed successfully! You can now log in.');
          setMode('login');
        } else {
          setErrorMessage(res.error || 'Failed to reset password. Please check your recovery token.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await resendVerification(email);
      if (res.success && res.verificationToken) {
        setGeneratedVerifyCode(res.verificationToken);
        setVerificationToken(res.verificationToken);
        setSuccessMessage('A fresh verification code has been generated and populated.');
      } else {
        setErrorMessage(res.error || 'Could not generate new code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0B0F17] p-6 shadow-2xl text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 font-extrabold text-black text-xs">
              ⚡
            </span>
            <h3 className="font-heading text-lg font-bold text-white">
              {mode === 'login' && 'Sign In to Arena'}
              {mode === 'register' && 'Join Safe Picks Arena'}
              {mode === 'verify' && 'Verify Email Address'}
              {mode === 'forgot' && 'Account Recovery'}
              {mode === 'reset' && 'Create New Password'}
            </h3>
          </div>
          <button
            onClick={() => {
              setErrorMessage(null);
              setSuccessMessage(null);
              onClose();
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Platform Banner */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Real user accounts only. 100% Free platform with zero VIP fees.</span>
        </div>

        {/* Status Alerts with manual dismiss capability */}
        {errorMessage && (
          <div className="mt-3 flex items-start justify-between gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white p-0.5 rounded transition shrink-0"
              title="Dismiss error message"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 flex items-start justify-between gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-white p-0.5 rounded transition shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Verification code helper */}
        {generatedVerifyCode && mode === 'verify' && (
          <div className="mt-3 rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-zinc-400">Generated Verification Code:</span>
              <button
                type="button"
                onClick={() => {
                  setVerificationToken(generatedVerifyCode);
                  clearErrors();
                }}
                className="text-[10px] text-emerald-400 hover:underline font-bold"
              >
                Auto-fill
              </button>
            </div>
            <span className="font-mono font-bold text-emerald-400 select-all block text-sm">{generatedVerifyCode}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          
          {/* USERNAME (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. StrikePredictor"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearErrors();
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* EMAIL (Login, Register, Forgot, Verify) */}
          {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'verify') && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearErrors();
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* PASSWORD (Login, Register) */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearErrors();
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* VERIFY CODE (Verify mode) */}
          {mode === 'verify' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">Email Verification Code</label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Resend code
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Paste verification token..."
                  value={verificationToken}
                  onChange={(e) => {
                    setVerificationToken(e.target.value);
                    clearErrors();
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* RESET PASSWORD FIELDS */}
          {mode === 'reset' && (
            <>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Recovery Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => {
                    setResetToken(e.target.value);
                    clearErrors();
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearErrors();
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition shadow-md shadow-emerald-500/10 disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Processing...' : (
              mode === 'login' ? 'Sign In' :
              mode === 'register' ? 'Create Real Account' :
              mode === 'verify' ? 'Confirm Verification' :
              mode === 'forgot' ? 'Send Recovery Code' : 'Save New Password'
            )}
          </button>
        </form>

        {/* Quick Test Credential Helpers for testing */}
        {mode === 'login' && (
          <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2.5 text-[11px] text-zinc-500">
            <span>Quick fill credentials:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@safepicksarena.com');
                  setPassword('AdminArena2026!');
                  clearErrors();
                }}
                className="text-emerald-400 hover:underline"
              >
                Admin
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('phscspractical@gmail.com');
                  setPassword('AdminArena2026!');
                  clearErrors();
                }}
                className="text-emerald-400 hover:underline"
              >
                Owner
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-bold text-emerald-400 hover:underline"
              >
                Sign Up for Free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-emerald-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
