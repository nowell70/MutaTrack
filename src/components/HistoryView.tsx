import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Analysis } from '../types';

interface HistoryViewProps {
  analyses: Analysis[];
  onSelectAnalysis: (analysis: Analysis) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ analyses, onSelectAnalysis }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-8 space-y-6 bg-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
          <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
          <span>RIWAYAT</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          Riwayat Analisis
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Semua analisis yang pernah dijalankan. Buka hasil atau lanjutkan pipeline yang tertunda.
        </p>
      </div>

      {/* List */}
      <div className="border-t border-b border-slate-200 divide-y divide-slate-100">
        {analyses.map((a) => {
          const isSuccess = a.status === 'selesai';
          const isFailed = a.status === 'gagal';
          const isRunning = a.status === 'berjalan';
          const variantCount =
            a.stats?.annotation?.total_varian ?? a.stats?.filtering?.varian_lolos ?? 0;

          return (
            <div
              key={a.id}
              onClick={() => onSelectAnalysis(a)}
              className="flex items-center justify-between py-4 hover:bg-slate-50/80 transition cursor-pointer px-1 text-xs"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    isFailed
                      ? 'bg-rose-500'
                      : isRunning
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-yellow-400'
                  }`}
                />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{a.nama}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {a.organisme || 'Escherichia coli'} &middot;{' '}
                    {new Date(a.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-slate-500 font-mono text-[11px]">
                  {isFailed ? '&mdash;' : `${variantCount} varian`}
                </span>
                <span
                  className={`font-semibold ${
                    isFailed
                      ? 'text-rose-600'
                      : isRunning
                      ? 'text-amber-500'
                      : 'text-blue-600'
                  }`}
                >
                  {isFailed ? 'Gagal' : isRunning ? 'Berjalan' : 'Berhasil'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
