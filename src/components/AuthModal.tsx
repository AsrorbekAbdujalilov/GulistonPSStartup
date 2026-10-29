import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { LogIn, UserPlus, X } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { GRADE_OPTIONS, translations } from '../i18n';
import {
  loginWithCredentials,
  registerParticipant,
  syncGoogleLogin,
} from '../services/competitionService';
import type { Language, UserAccount } from '../types';

interface AuthModalProps {
  lang: Language;
  initialMode?: 'login' | 'register';
  isInline?: boolean;
  onClose?: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  lang,
  initialMode = 'register',
  isInline = false,
  onClose,
  onSuccess,
}) => {
  const t = translations[lang];
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [grade, setGrade] = useState(GRADE_OPTIONS[2]); // 10-sinf default
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginWithCredentials(identifier, password);
      onSuccess(user);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await registerParticipant({
        name,
        surname,
        grade,
        email,
        password: regPassword,
      });
      onSuccess(user);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user && cred.user.email) {
        const user = await syncGoogleLogin({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || undefined,
        });
        onSuccess(user);
        onClose?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="w-full max-w-md rounded-2xl border border-indigo-500/30 bg-[#131b33] p-6 text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            {mode === 'register' ? t.registerTitle : t.loginTitle}
          </h2>
          <p className="mt-1 text-xs text-indigo-200/80">
            {mode === 'register' ? t.registerSubtitle : t.loginSubtitle}
          </p>
        </div>
        {onClose && !isInline && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-950 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Mode Switcher: Everyone begins with Registration */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-[#0b1021] p-1 border border-indigo-500/20">
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError('');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
            mode === 'register'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{t.register}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError('');
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
            mode === 'login'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>{t.signIn}</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/60 px-3 py-2 text-xs font-medium text-rose-200">
          {error}
        </div>
      )}

      {mode === 'register' ? (
        <form onSubmit={handleRegister} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-indigo-200">
                {t.nameLabel}
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-200">
                {t.surnameLabel}
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-200">
              {t.gradeLabel}
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-hidden"
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g} className="bg-[#0b1021] text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-200">
              {t.emailLabel}
            </label>
            <input
              type="email"
              required
              maxLength={160}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-200">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              required
              minLength={3}
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••"
              className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50"
          >
            {loading ? '...' : t.submitRegister}
          </button>

          <div className="relative my-3 flex items-center justify-center">
            <div className="w-full border-t border-indigo-500/20" />
            <span className="bg-[#131b33] px-2 text-xs text-slate-400">or</span>
            <div className="w-full border-t border-indigo-500/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-[#0b1021] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-indigo-950/60"
          >
            <span>{t.googleSignIn}</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-indigo-200">
              {t.identifierLabel}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t.identifierPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-200">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50"
          >
            {loading ? '...' : t.submitLogin}
          </button>

          <div className="relative my-3 flex items-center justify-center">
            <div className="w-full border-t border-indigo-500/20" />
            <span className="bg-[#131b33] px-2 text-xs text-slate-400">or</span>
            <div className="w-full border-t border-indigo-500/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-[#0b1021] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-indigo-950/60"
          >
            <span>{t.googleSignIn}</span>
          </button>
        </form>
      )}
    </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      {cardContent}
    </div>
  );
};
