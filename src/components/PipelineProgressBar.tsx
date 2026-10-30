import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { AnalysisStatus, PipelineStage, STAGES, STAGE_LABELS } from '../types';

interface PipelineProgressBarProps {
  currentStage?: PipelineStage | null;
  status: AnalysisStatus;
}

const STAGE_SHORT_TITLES: Record<PipelineStage, string> = {
  qc: 'FastQC',
  trimming: 'fastp',
  alignment: 'BWA-MEM',
  variant_calling: 'BCFtools',
  filtering: 'Filter',
  annotation: 'SnpEff',
};

export const PipelineProgressBar: React.FC<PipelineProgressBarProps> = ({ currentStage, status }) => {
  const currentIndex = currentStage ? STAGES.indexOf(currentStage) : -1;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Alur Pipeline Bioinformatika (6 Tahap)
        </h3>
        <div className="flex items-center gap-2">
          {status === 'berjalan' && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sedang Memproses...
            </span>
          )}
          {status === 'selesai' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pipeline Selesai
            </span>
          )}
          {status === 'gagal' && (
            <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Gagal pada {currentStage ? STAGE_SHORT_TITLES[currentStage] : 'Pipeline'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {STAGES.map((stage, idx) => {
          let state: 'completed' | 'active' | 'pending' | 'failed' = 'pending';

          if (status === 'selesai') {
            state = 'completed';
          } else if (status === 'berjalan') {
            if (idx < currentIndex) state = 'completed';
            else if (idx === currentIndex) state = 'active';
            else state = 'pending';
          } else if (status === 'gagal') {
            if (idx < currentIndex) state = 'completed';
            else if (idx === currentIndex) state = 'failed';
            else state = 'pending';
          } else if (status === 'valid') {
            state = 'pending';
          }

          return (
            <div
              key={stage}
              className={`relative flex flex-col p-3 rounded-lg border transition-all ${
                state === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : state === 'active'
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 ring-2 ring-amber-500/20 shadow-lg shadow-amber-900/20'
                  : state === 'failed'
                  ? 'bg-rose-950/30 border-rose-600/60 text-rose-300'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800/60">
                  0{idx + 1}
                </span>
                {state === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {state === 'active' && <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
                {state === 'failed' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {state === 'pending' && <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </div>

              <div className="font-semibold text-xs leading-tight text-slate-200">
                {STAGE_SHORT_TITLES[stage]}
              </div>
              <div className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate" title={STAGE_LABELS[stage]}>
                {STAGE_LABELS[stage].split('(')[0].trim()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
