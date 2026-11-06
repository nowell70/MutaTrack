import React, { useState } from 'react';
import { ChevronRight, Trash2, AlertCircle } from 'lucide-react';
import { Analysis } from '../types';

interface HistoryViewProps {
  analyses: Analysis[];
  onSelectAnalysis: (analysis: Analysis) => void;
  onDeleteAnalysis?: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  analyses,
  onSelectAnalysis,
  onDeleteAnalysis,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      if (onDeleteAnalysis) {
        onDeleteAnalysis(id);
      }
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

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
          Semua analisis yang pernah dijalankan. Buka hasil, kelola, atau hapus riwayat analisis.
        </p>
      </div>

      {/* List */}
      {analyses.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <p className="text-sm">Belum ada riwayat analisis yang tersimpan.</p>
        </div>
      ) : (
        <div className="border-t border-b border-slate-200 divide-y divide-slate-100">
          {analyses.map((a) => {
            const isSuccess = a.status === 'selesai';
            const isFailed = a.status === 'gagal';
            const isRunning = a.status === 'berjalan';
            const variantCount =
              a.stats?.annotation?.total_varian ?? a.stats?.filtering?.varian_lolos ?? 0;
            const isConfirming = confirmDeleteId === a.id;

            return (
              <div
                key={a.id}
                onClick={() => onSelectAnalysis(a)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between py-4 hover:bg-slate-50/80 transition-all duration-300 ease-in-out cursor-pointer px-2 text-xs rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-125 ${
                      isFailed
                        ? 'bg-rose-500'
                        : isRunning
                        ? 'bg-amber-400 animate-ping'
                        : 'bg-yellow-400'
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
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 mt-3 sm:mt-0 justify-between sm:justify-end">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {isFailed ? '—' : `${variantCount.toLocaleString('id-ID')} varian`}
                  </span>

                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] transition-colors duration-300 ${
                      isFailed
                        ? 'text-rose-700 bg-rose-50'
                        : isRunning
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-blue-700 bg-blue-50'
                    }`}
                  >
                    {isFailed ? 'Gagal' : isRunning ? 'Berjalan' : 'Berhasil'}
                  </span>

                  {/* Inline Delete Confirmation or Delete Trigger Button */}
                  {isConfirming ? (
                    <div
                      className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-rose-700 animate-in fade-in duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="text-[11px] font-semibold">Hapus?</span>
                      <button
                        onClick={(e) => handleDelete(e, a.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2 py-0.5 rounded transition-colors duration-200 cursor-pointer"
                        title="Konfirmasi hapus"
                      >
                        Ya
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="bg-white hover:bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 transition-colors duration-200 cursor-pointer"
                        title="Batal"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, a.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-300 ease-in-out cursor-pointer group/btn"
                      title="Hapus analisis dari riwayat"
                      aria-label="Hapus analisis"
                    >
                      <Trash2 className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover/btn:scale-110" />
                    </button>
                  )}

                  <ChevronRight className="w-4 h-4 text-slate-300 transition-transform duration-300 ease-in-out group-hover:translate-x-1 group-hover:text-blue-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
