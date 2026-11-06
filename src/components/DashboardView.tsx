import React, { useState } from 'react';
import { Plus, ChevronRight, Activity, GitFork, Trash2 } from 'lucide-react';
import { Analysis } from '../types';

interface DashboardViewProps {
  analyses: Analysis[];
  onNewAnalysis: () => void;
  onOpenExample: () => void;
  onViewHistory: () => void;
  onSelectAnalysis: (analysis: Analysis) => void;
  onDeleteAnalysis?: (id: string) => void;
  runningAnalysis?: Analysis | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analyses,
  onNewAnalysis,
  onOpenExample,
  onViewHistory,
  onSelectAnalysis,
  onDeleteAnalysis,
  runningAnalysis,
}) => {
  const totalAnalyses = analyses.length;
  const successfulAnalyses = analyses.filter((a) => a.status === 'selesai').length;
  const totalVariantsFound = analyses.reduce(
    (acc, a) => acc + (a.stats?.annotation?.total_varian || a.stats?.filtering?.varian_lolos || 0),
    0
  );
  const totalGenesAffected = analyses.reduce(
    (acc, a) => acc + (a.stats?.annotation?.gen_terdampak || 0),
    0
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-10 bg-white">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
            <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
            <span>DASHBOARD</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Selamat datang kembali
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan aktivitas pipeline variant calling Anda.
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="self-start flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Buat Analisis</span>
        </button>
      </div>

      {/* 4 Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {/* Total Analisis */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>TOTAL ANALISIS</span>
          </div>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
            {totalAnalyses}
          </div>
        </div>

        {/* Analisis Berhasil */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            <span>ANALISIS BERHASIL</span>
          </div>
          <div className="text-4xl font-extrabold text-blue-600 tracking-tight font-mono">
            {successfulAnalyses}
          </div>
        </div>

        {/* Total Varian Ditemukan */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>TOTAL VARIAN DITEMUKAN</span>
          </div>
          <div className="text-4xl font-extrabold text-blue-600 tracking-tight font-mono">
            {totalVariantsFound}
          </div>
        </div>

        {/* Gen Terpengaruh */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>GEN TERPENGARUH</span>
          </div>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
            {totalGenesAffected}
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Riwayat Terbaru */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
              <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
              <span>RIWAYAT</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Analisis Terbaru
            </h2>
            <p className="text-xs text-slate-500">
              Buka hasil atau lanjutkan pipeline dari analisis sebelumnya.
            </p>
          </div>

          <button
            onClick={onViewHistory}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat semua</span>
            <span>&gt;</span>
          </button>
        </div>

        {/* Table Rows */}
        <div className="border-t border-b border-slate-200 divide-y divide-slate-100">
          {analyses.slice(0, 4).map((a) => {
            const isSuccess = a.status === 'selesai';
            const isFailed = a.status === 'gagal';
            const variantCount =
              a.stats?.annotation?.total_varian ?? a.stats?.filtering?.varian_lolos ?? 0;

            return (
              <div
                key={a.id}
                onClick={() => onSelectAnalysis(a)}
                className="group flex items-center justify-between py-4 hover:bg-slate-50/80 transition-all duration-300 ease-in-out cursor-pointer px-2 text-xs rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-125 ${
                      isFailed ? 'bg-rose-500' : 'bg-yellow-400'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors duration-300">
                      {a.nama}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {a.organisme || 'Escherichia coli'} &middot;{' '}
                      {new Date(a.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {isFailed ? '—' : `${variantCount.toLocaleString('id-ID')} varian`}
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] transition-colors duration-300 ${
                      isFailed ? 'text-rose-600 bg-rose-50' : 'text-blue-600 bg-blue-50'
                    }`}
                  >
                    {isFailed ? 'Gagal' : 'Berhasil'}
                  </span>
                  {onDeleteAnalysis && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Hapus analisis "${a.nama}"?`)) {
                          onDeleteAnalysis(a.id);
                        }
                      }}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all duration-300 ease-in-out cursor-pointer"
                      title="Hapus analisis"
                      aria-label="Hapus analisis"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300 transition-transform duration-300 ease-in-out group-hover:translate-x-1 group-hover:text-blue-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Pipeline Saat Ini */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">
            <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
            <span>STATUS</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Pipeline Saat Ini
          </h2>
          <p className="text-xs text-slate-500">
            Tahapan aktif pada analisis yang sedang berjalan.
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                {runningAnalysis
                  ? `Sedang Berjalan: ${runningAnalysis.nama}`
                  : 'Tidak ada pipeline berjalan'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {runningAnalysis
                  ? `Tahap saat ini: ${runningAnalysis.stage || 'Inisialisasi...'}`
                  : 'Mulai analisis baru untuk mengaktifkan monitoring real-time.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenExample}
            className="flex items-center gap-1.5 border border-blue-400 hover:border-blue-500 text-blue-600 bg-white hover:bg-blue-50 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer shrink-0"
          >
            <GitFork className="w-3.5 h-3.5 rotate-180" />
            <span>Lihat Contoh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
