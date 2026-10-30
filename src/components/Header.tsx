import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onNewAnalysis?: () => void;
  onGoHome?: () => void;
  onOpenLogin?: () => void;
  isLanding?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewAnalysis,
  onGoHome,
  onOpenLogin,
  isLanding = false,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      {/* Top Navbar */}
      <div className="w-full px-6 sm:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 cursor-pointer text-left focus:outline-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block shadow-sm" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Muta <span className="text-blue-600">Track</span>
          </span>
        </button>

        {/* Center Subtitle */}
        <div className="hidden md:block text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
          INTEGRATED VARIANT CALLING PLATFORM
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          {isLanding ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold tracking-wide shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
                <span>PIPELINE ACTIVE</span>
              </div>
              <button
                onClick={onOpenLogin}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                Masuk
              </button>
            </>
          ) : (
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Buat Analisis</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-header DNA Sequence Ticker Line */}
      <div className="w-full border-t border-slate-100 bg-slate-50/70 px-6 sm:px-8 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 overflow-hidden select-none">
        <div className="tracking-[0.25em] truncate">
          A G C A T G C A T C G A T G C T A G C T A G C A T C G A T C G A T G C T A G C T A G C A T C G A T C G T A G C A T G C A T C G A T C
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 shrink-0 pl-4 font-sans font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping inline-block" />
          <span className="text-[10px] tracking-wider text-slate-600">PIPELINE ONLINE</span>
        </div>
      </div>
    </div>
  );
};
