import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('uji@example.com');
  const [password, setPassword] = useState('password123');
  const [nama, setNama] = useState('Uji Coba Bioinformatika');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginTab) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login gagal.');
          setLoading(false);
          return;
        }
      } else {
        const res = await register(email, password, nama);
        if (!res.success) {
          setError(res.error || 'Pendaftaran gagal.');
          setLoading(false);
          return;
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isLoginTab ? 'Masuk ke MutaTrack' : 'Daftar Akun Peneliti'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              isLoginTab
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              !isLoginTab
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registrasi Baru
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLoginTab && (
            <div>
              <label className="block font-medium text-slate-300 mb-1">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nama Peneliti atau Pengguna"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-300 mb-1">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="nama@institusi.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Preset hint */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Akun Pengujian Bawaan:</span>
            <br />
            Email: <code className="text-emerald-400 font-mono">uji@example.com</code> | Kata sandi:{' '}
            <code className="text-emerald-400 font-mono">password123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memproses...' : isLoginTab ? 'Masuk Sekarang' : 'Daftar Akun'}
          </button>
        </form>
      </div>
    </div>
  );
};
