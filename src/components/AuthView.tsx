import React, { useState } from 'react';
import { Mail, Lock, UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onSuccess: () => void;
  onGoHome: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onGoHome }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('anda@institusi.id');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Login gagal.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await register(email, password, email.split('@')[0]);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Pendaftaran gagal.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  const handleGoogleAuth = () => {
    // Instant Google login simulation
    login('peneliti.ipb@apps.ipb.ac.id', 'google_auth_token');
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative overflow-hidden">
      {/* Top Header */}
      <div className="w-full bg-white border-b border-slate-200 z-10">
        <div className="w-full px-6 sm:px-8 h-14 flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 cursor-pointer text-left focus:outline-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block shadow-sm" />
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Muta <span className="text-blue-600">Track</span>
            </span>
          </button>

          <button
            onClick={onGoHome}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Kembali ke beranda</span>
          </button>
        </div>

        {/* DNA Sequence Ticker */}
        <div className="w-full border-t border-slate-100 bg-slate-50/70 px-6 sm:px-8 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 overflow-hidden select-none">
          <div className="tracking-[0.25em] truncate">
            T A G C T A G C A T C G A T C G A T C G T A G C A T C G A T C G A T C G T A G C A T C G A T C G A T C G T A G C A T C G A T C
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 shrink-0 pl-4 font-sans font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping inline-block" />
            <span className="text-[10px] tracking-wider text-slate-600">PIPELINE ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Container with Background DNA Helix */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Background DNA Structure */}
        <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center">
          <img
            src="/assets/aistudio/Screenshot_2026-10-25_091505_c3016c10.png"
            alt="DNA Helix Background"
            className="w-full h-full object-cover filter blur-[0.5px]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* CARD CONTAINER */}
        <div className="relative z-10 w-full max-w-md">
          {/* ================= MODE 1: LOGIN (Screenshot 2) ================= */}
          {mode === 'login' && (
            <div className="bg-[#1d58d8] text-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-blue-400/30">
              <div className="text-[11px] font-bold text-blue-200 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-yellow-400 inline-block" />
                <span>MASUK</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Masuk ke MutaTrack
              </h2>
              <p className="text-xs text-blue-100 mt-1 mb-6">
                Akses dashboard dan pipeline variant calling Anda.
              </p>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-2 bg-blue-500/50 hover:bg-blue-500/70 border border-blue-300/40 text-white font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Lanjutkan dengan Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-5 text-[11px] text-blue-200">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-400/40" />
                </div>
                <span className="relative bg-[#1d58d8] px-3 font-semibold uppercase tracking-wider text-[10px]">
                  ATAU
                </span>
              </div>

              {error && (
                <div className="mb-4 p-2.5 rounded-lg bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-blue-100 uppercase tracking-wider mb-1.5">
                    EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="anda@institusi.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-blue-500/30 border border-blue-300/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-blue-100 uppercase tracking-wider">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-blue-200 hover:text-white underline cursor-pointer"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-blue-500/30 border border-blue-300/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
                >
                  <span>&rarr; Masuk &rarr;</span>
                </button>
              </form>

              {/* Bottom switch to register */}
              <div className="mt-5 text-center text-xs text-blue-100">
                <span>Belum punya akun? </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-white hover:underline cursor-pointer"
                >
                  Daftar di sini
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 2: REGISTER (Screenshot 3) ================= */}
          {mode === 'register' && (
            <div className="flex flex-col items-center">
              {/* User Plus Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
                Create your account
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 mb-6 text-center">
                Sign up to get started
              </p>

              <div className="w-full bg-[#1d58d8] text-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-blue-400/30">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500/50 hover:bg-blue-500/70 border border-blue-300/40 text-white font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                >
                  <span>G Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4 text-[10px] text-blue-200">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-400/40" />
                  </div>
                  <span className="relative bg-[#1d58d8] px-3 font-semibold uppercase tracking-wider">
                    OR
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-100 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-blue-500/30 border border-blue-300/40 rounded-xl pl-9 pr-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-100 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-blue-500/30 border border-blue-300/40 rounded-xl pl-9 pr-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-100 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-blue-500/30 border border-blue-300/40 rounded-xl pl-9 pr-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer mt-3"
                  >
                    Create account
                  </button>
                </form>
              </div>

              <div className="mt-4 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 3: FORGOT PASSWORD (Screenshots 4 & 5) ================= */}
          {mode === 'forgot' && (
            <div className="flex flex-col items-center">
              {/* Mail Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
                Reset password
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 mb-6 text-center">
                We'll send you a link to reset it
              </p>

              <div className="w-full bg-[#1d58d8] text-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-blue-400/30">
                {resetSent ? (
                  <div className="text-center py-3 space-y-4">
                    <p className="text-xs text-blue-100 leading-relaxed">
                      If an account exists with that email, you'll receive a password reset link shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setMode('login');
                      }}
                      className="text-xs font-semibold text-yellow-300 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to log in</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-100 mb-1.5">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-blue-500/30 border border-blue-300/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer"
                    >
                      Send reset link
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-xs text-blue-200 hover:text-white underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to log in</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
