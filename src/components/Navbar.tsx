import React from 'react';
import { Dna, PlusCircle, User as UserIcon, LogOut, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Analysis } from '../types';

interface NavbarProps {
  onNewAnalysis: () => void;
  onOpenDocs: () => void;
  onOpenAuth: () => void;
  analyses: Analysis[];
  currentAnalysis: Analysis | null;
  onSelectAnalysis: (a: Analysis) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewAnalysis,
  onOpenDocs,
  onOpenAuth,
  analyses,
  currentAnalysis,
  onSelectAnalysis,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Dna className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">MutaTrack</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0 Bio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Platform Bioinformatika Variant Calling
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-3">
          {analyses.length > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <select
                aria-label="Pilih Proyek Analisis"
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
                value={currentAnalysis?.id || ''}
                onChange={(e) => {
                  const target = analyses.find((a) => a.id === e.target.value);
                  if (target) onSelectAnalysis(target);
                }}
              >
                {analyses.map((a) => (
                  <option key={a.id} value={a.id} className="bg-slate-900 text-slate-200">
                    {a.nama} ({a.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-sm shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analisis Baru</span>
          </button>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-2 rounded-lg transition-colors cursor-pointer"
            title="Alur & Dokumentasi Pipeline"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Panduan</span>
          </button>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="font-medium text-slate-200 leading-none">{user.nama}</div>
                  <div className="text-[10px] text-slate-500">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Keluar"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
