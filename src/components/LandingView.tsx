import React from 'react';
import { ChevronRight, ArrowRight, GitFork, Activity } from 'lucide-react';

interface LandingViewProps {
  onNewAnalysis: () => void;
  onOpenExample: () => void;
  onSelectRun: (id: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNewAnalysis,
  onOpenExample,
  onSelectRun,
}) => {
  const recentRuns = [
    {
      id: 'ecoli-k12-benchmark',
      name: 'E. coli K-12 MG1655',
      variants: '128 varian',
      status: 'Berhasil',
      statusColor: 'text-blue-600',
      dotColor: 'bg-yellow-400',
    },
    {
      id: 'bacillus-subtilis-168',
      name: 'B. subtilis 168',
      variants: '96 varian',
      status: 'Berhasil',
      statusColor: 'text-blue-600',
      dotColor: 'bg-yellow-400',
    },
    {
      id: 'mycobacterium-h37rv',
      name: 'M. tuberculosis H37Rv',
      variants: '0 varian',
      status: 'Gagal',
      statusColor: 'text-rose-600',
      dotColor: 'bg-rose-500',
    },
    {
      id: 'yeast-s288c',
      name: 'S. cerevisiae S288C',
      variants: '214 varian',
      status: 'Berhasil',
      statusColor: 'text-blue-600',
      dotColor: 'bg-yellow-400',
    },
  ];

  return (
    <div className="w-full bg-white text-slate-900 pb-16">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-6 sm:pt-8 pb-12 overflow-hidden min-h-[560px]">
        {/* 3D Crystal DNA Helix Graphic - Anchored to top-right to match screenshot and never drop below content */}
        <div className="absolute top-0 right-0 w-[50%] min-w-[340px] max-w-[660px] pointer-events-none select-none z-0 overflow-visible flex justify-end">
          {/* Soft atmospheric gradient glow behind the helix */}
          <div className="absolute -top-12 -right-8 w-96 h-96 bg-gradient-to-bl from-blue-300/30 via-indigo-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <img
            src="/assets/aistudio/image_890e8dc2.png"
            alt="3D Crystal DNA Helix Structure"
            className="w-full h-auto max-h-[660px] object-contain drop-shadow-xl -mr-6 sm:-mr-12 -mt-4 sm:-mt-8"
          />
        </div>

        {/* Hero Content Column (Category, Headline, Subtitle, CTAs, and Telemetry Card) */}
        <div className="relative z-10 max-w-xl md:max-w-2xl lg:max-w-[62%] space-y-6">
          {/* Category */}
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase">
            <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
            <span>INTEGRATED VARIANT CALLING</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[48px] xl:text-[52px] font-extrabold text-slate-950 tracking-tight leading-[1.12]">
            Ubah Data <br />
            Sekuensing Menjadi <br />
            <span className="text-blue-600">Insight Varian</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
            MutaTrack menyatukan QC, alignment, variant calling, filtering, dan anotasi dalam satu
            pipeline otomatis, dari file FASTQ mentah hingga laporan varian siap analisis.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span>Mulai Analisis Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenExample}
              className="flex items-center gap-2 border border-blue-400 hover:border-blue-500 text-blue-600 bg-white hover:bg-blue-50 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5 rotate-180" />
              <span>Lihat Contoh Analisis (E. coli)</span>
            </button>
          </div>

          {/* Live Pipeline Telemetry Card */}
          <div className="mt-8 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-2xl shadow-blue-900/20 border border-blue-500/30">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-blue-200 uppercase mb-5">
              <Activity className="w-3.5 h-3.5 text-yellow-300" />
              <span>LIVE PIPELINE TELEMETRY</span>
            </div>

            {/* Stepper with connected dots */}
            <div className="relative flex items-center justify-between text-center mb-6">
              <div className="absolute top-2 left-3 right-3 h-0.5 bg-blue-400/50 -z-0" />
              
              {[
                { step: '01', label: 'Input' },
                { step: '02', label: 'QC & Trimming' },
                { step: '', label: 'Alignment' },
                { step: '', label: 'BAM Indexing' },
                { step: '', label: 'Variant Calling' },
                { step: '', label: 'Filtering' },
                { step: '', label: 'Annotation' },
              ].map((s, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center ring-4 ring-blue-600 shadow">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  </span>
                  <span className="text-[10px] text-blue-100 font-medium mt-1.5 whitespace-nowrap">
                    {s.step ? `${s.step} ` : ''}{s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* 3 Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-500/40">
              <div>
                <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
                  READS QC
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5 font-mono">
                  4.8M
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
                  MAPPED
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5 font-mono">
                  99.4%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
                  VARIANTS
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5 font-mono">
                  128
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <hr className="border-slate-200" />
      </div>

      {/* RUN TERBARU Table Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8">
        {/* Dark blue banner title */}
        <div className="w-full bg-[#1b3a82] text-white text-[11px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-t-lg flex items-center gap-2">
          <span className="w-3 h-0.5 bg-yellow-400 inline-block" />
          <span>RUN TERBARU</span>
        </div>

        {/* List of Runs */}
        <div className="border-x border-b border-slate-200 rounded-b-lg divide-y divide-slate-100 bg-white shadow-xs">
          {recentRuns.map((run) => (
            <div
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition cursor-pointer text-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${run.dotColor}`} />
                <span className="font-semibold text-slate-900">{run.name}</span>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-slate-500 font-mono text-[11px]">{run.variants}</span>
                <span className={`font-semibold ${run.statusColor}`}>{run.status}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            <span className="font-bold text-slate-900">
              Muta <span className="text-blue-600">Track</span>
            </span>
          </div>
          <div>MutaTrack - Integrated Variant Calling Platform</div>
        </div>
      </div>
    </div>
  );
};
