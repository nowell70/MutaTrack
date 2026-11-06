import React from 'react';
import { ArrowRight, GitFork, Dna, ShieldCheck, Zap } from 'lucide-react';

interface LandingViewProps {
  onNewAnalysis: () => void;
  onOpenExample: () => void;
  onSelectRun?: (id: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNewAnalysis,
  onOpenExample,
}) => {
  return (
    <div className="w-full bg-white text-slate-900 pb-16 flex flex-col min-h-[calc(100vh-64px)] justify-between">
      {/* Centered Hero Section */}
      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 pt-12 sm:pt-20 pb-16 flex flex-col items-center text-center">
        {/* Soft atmospheric background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-blue-100/40 via-indigo-50/30 to-amber-50/30 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Ambient 3D Crystal DNA Graphic placed softly in the background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] pointer-events-none select-none -z-10 opacity-20">
          <img
            src="/assets/aistudio/image_890e8dc2.png"
            alt="3D Crystal DNA Structure"
            className="w-full h-auto object-contain filter drop-shadow-xl"
          />
        </div>

        {/* Category Badge - Centered */}
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 mb-6 transition-all duration-300 ease-in-out hover:bg-blue-100/80">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse" />
          <span>INTEGRATED VARIANT CALLING</span>
        </div>

        {/* Headline - Centered */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15] max-w-3xl mb-6">
          Ubah Data Sekuensing Menjadi{' '}
          <span className="text-blue-600 transition-colors duration-300">
            Insight Varian
          </span>
        </h1>

        {/* Subtitle - Centered */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
          MutaTrack menyatukan QC, alignment, variant calling, filtering, dan anotasi dalam satu
          pipeline otomatis, dari file FASTQ mentah hingga laporan varian siap analisis.
        </p>

        {/* CTAs - Centered with smooth icon & button transitions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onNewAnalysis}
            className="group flex items-center gap-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer active:scale-95"
          >
            <span>Mulai Analisis Baru</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
          </button>

          <button
            onClick={onOpenExample}
            className="group flex items-center gap-2.5 border border-blue-300 hover:border-blue-600 text-blue-600 bg-white hover:bg-blue-50 font-semibold text-sm px-5 py-3.5 rounded-xl transition-all duration-300 ease-in-out cursor-pointer shadow-xs hover:shadow-md active:scale-95"
          >
            <GitFork className="w-4 h-4 rotate-180 transition-transform duration-300 ease-in-out group-hover:-rotate-90 text-blue-600" />
            <span>Lihat Contoh Analisis (E. coli)</span>
          </button>
        </div>

        {/* Feature Highlights - Clean, minimalist pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl pt-8 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-lg bg-slate-50/60 border border-slate-200/50 text-slate-700 text-xs font-medium transition-all duration-300 ease-in-out hover:bg-white hover:shadow-xs">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 transition-transform duration-300 hover:scale-110" />
            <span>FastQC &amp; fastp Preprocessing</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-lg bg-slate-50/60 border border-slate-200/50 text-slate-700 text-xs font-medium transition-all duration-300 ease-in-out hover:bg-white hover:shadow-xs">
            <Dna className="w-4 h-4 text-blue-600 shrink-0 transition-transform duration-300 hover:scale-110" />
            <span>BWA-MEM &amp; BCFtools Pipeline</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-lg bg-slate-50/60 border border-slate-200/50 text-slate-700 text-xs font-medium transition-all duration-300 ease-in-out hover:bg-white hover:shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 transition-transform duration-300 hover:scale-110" />
            <span>SnpEff Functional Annotation</span>
          </div>
        </div>
      </div>

      {/* Footer - Centered */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-6 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 transition-all duration-300 hover:opacity-80">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          <span className="font-bold text-slate-900">
            Muta <span className="text-blue-600">Track</span>
          </span>
        </div>
        <div className="text-slate-400">Platform Analisis Bioinformatika Terintegrasi</div>
      </div>
    </div>
  );
};
