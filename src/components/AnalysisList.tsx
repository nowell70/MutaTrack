import React from 'react';
import { Analysis } from '../types';
import { Dna, CheckCircle2, RotateCw, AlertCircle, Clock, ChevronRight, Trash2 } from 'lucide-react';

interface AnalysisListProps {
  analyses: Analysis[];
  currentId: string | null;
  onSelect: (analysis: Analysis) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const AnalysisList: React.FC<AnalysisListProps> = ({
  analyses,
  currentId,
  onSelect,
  onDelete,
  onNew,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Daftar Proyek Analisis ({analyses.length})
          </h3>
          <p className="text-[11px] text-slate-500">Pilih analisis untuk melihat visualisasi dan hasil.</p>
        </div>
        <button
          onClick={onNew}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
        >
          + Baru
        </button>
      </div>

      <div className="space-y-2">
        {analyses.map((a) => {
          const isSelected = a.id === currentId;
          const variantCount = a.stats?.annotation?.total_varian ?? a.stats?.filtering?.varian_lolos ?? 0;

          return (
            <div
              key={a.id}
              onClick={() => onSelect(a)}
              className={`group flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100 shadow-sm shadow-emerald-950/40'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-750 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Dna className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs truncate group-hover:text-white">
                    {a.nama}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>
                      {new Date(a.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{variantCount} Varian</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {a.status === 'selesai' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Selesai
                  </span>
                )}
                {a.status === 'berjalan' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                    Berjalan
                  </span>
                )}
                {a.status === 'valid' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Valid
                  </span>
                )}
                {a.status === 'gagal' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Gagal
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Hapus analisis "${a.nama}"?`)) {
                      onDelete(a.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
