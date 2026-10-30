import React from 'react';
import { Analysis } from '../types';
import { Activity, BarChart2, CheckSquare, Dna, FileText, Filter, GitCommit, Layers, ShieldCheck } from 'lucide-react';

interface OverviewChartsProps {
  analysis: Analysis;
}

export const OverviewCharts: React.FC<OverviewChartsProps> = ({ analysis }) => {
  const stats = analysis.stats || {};
  const trimming = stats.trimming;
  const alignment = stats.alignment;
  const calling = stats.variant_calling;
  const filtering = stats.filtering;
  const annotation = stats.annotation;

  const impactColors: Record<string, { bg: string; text: string; bar: string }> = {
    HIGH: { bg: 'bg-rose-950/40 border-rose-800/60', text: 'text-rose-400', bar: 'bg-rose-500' },
    MODERATE: { bg: 'bg-amber-950/40 border-amber-800/60', text: 'text-amber-400', bar: 'bg-amber-500' },
    LOW: { bg: 'bg-sky-950/40 border-sky-800/60', text: 'text-sky-400', bar: 'bg-sky-500' },
    MODIFIER: { bg: 'bg-slate-900 border-slate-700/60', text: 'text-slate-400', bar: 'bg-slate-500' },
  };

  const totalVariants = annotation?.total_varian || filtering?.varian_lolos || 0;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Reads */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Reads</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {alignment?.total_reads?.toLocaleString() || '-'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Terpetakan: <span className="text-emerald-400 font-semibold">{alignment?.persen_terpetakan || 0}%</span>
            </div>
          </div>
        </div>

        {/* Trimming Q30 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Kualitas Q30 (fastp)</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {trimming?.q30_sesudah ? `${trimming.q30_sesudah}%` : '-'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Sebelum trim: <span className="text-slate-300">{trimming?.q30_sebelum || 0}%</span>
            </div>
          </div>
        </div>

        {/* Variants Filtered */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Varian Lolos Filter</span>
            <Filter className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {totalVariants}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Dari <span className="text-slate-300">{calling?.varian_mentah || totalVariants}</span> kandidat mentah
            </div>
          </div>
        </div>

        {/* Affected Genes */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Gen Terdampak</span>
            <Dna className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {annotation?.gen_terdampak ?? '-'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              SNP: <span className="text-slate-300 font-medium">{annotation?.snp ?? 0}</span> | INDEL:{' '}
              <span className="text-slate-300 font-medium">{annotation?.indel ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alignment & Trimming Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alignment Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">Statistik Alignment (BWA-MEM)</h4>
            </div>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {alignment?.persen_terpetakan || 0}% Terpetakan
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Reads Terpetakan</span>
                <span className="font-mono font-medium text-emerald-400">
                  {alignment?.terpetakan?.toLocaleString() || 0}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, alignment?.persen_terpetakan || 0)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Reads Tidak Terpetakan</span>
                <span className="font-mono font-medium text-slate-400">
                  {alignment?.tidak_terpetakan?.toLocaleString() || 0}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      0,
                      100 - (alignment?.persen_terpetakan || 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Genom Referensi</div>
                <div className="text-slate-200 font-medium truncate mt-0.5">
                  {analysis.files.reference || 'E. coli K-12 MG1655'}
                </div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">BAM Flagstat</div>
                <div className="text-emerald-400 font-medium truncate mt-0.5">
                  Q20 MapQ Filtered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trimming Quality Progress */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-white">Evaluasi Pemotongan Adapter & Kualitas (fastp)</h4>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-[11px] text-slate-400 mb-1">Reads Sebelum Trim</div>
                <div className="text-lg font-bold text-slate-200">
                  {trimming?.reads_sebelum?.toLocaleString() || '-'}
                </div>
                <div className="text-[11px] text-amber-400 mt-1">
                  Q30: {trimming?.q30_sebelum || 0}%
                </div>
              </div>
              <div className="bg-slate-950/60 border border-emerald-900/30 p-3 rounded-lg">
                <div className="text-[11px] text-slate-400 mb-1">Reads Lolos Trim</div>
                <div className="text-lg font-bold text-emerald-400">
                  {trimming?.reads_sesudah?.toLocaleString() || '-'}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  Q30: {trimming?.q30_sesudah || 0}% (↑ meningkat)
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              Parameter trimming: Phred quality score minimum <code className="text-cyan-400 font-mono">Q{analysis.config.trim_quality}</code>, panjang bacaan minimum <code className="text-cyan-400 font-mono">{analysis.config.min_length} bp</code>.
            </div>
          </div>
        </div>
      </div>

      {/* Impact & Functional Effects Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SnpEff Functional Impact Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-white">Distribusi Dampak Fungsional (SnpEff)</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total {totalVariants} Varian
            </span>
          </div>

          <div className="space-y-3">
            {['HIGH', 'MODERATE', 'LOW', 'MODIFIER'].map((impactKey) => {
              const count = annotation?.per_impact?.[impactKey] || 0;
              const percent = totalVariants > 0 ? ((count / totalVariants) * 100).toFixed(1) : 0;
              const color = impactColors[impactKey] || impactColors.MODIFIER;

              return (
                <div key={impactKey} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold ${color.text} flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${color.bar}`} />
                      {impactKey} IMPACT
                    </span>
                    <span className="font-mono text-slate-300">
                      {count} <span className="text-slate-500">({percent}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>High: Stop Gained, Frameshift</span>
            <span>Moderate: Missense</span>
            <span>Low: Sinomin</span>
          </div>
        </div>

        {/* Top Functional Effects */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-teal-400" />
              <h4 className="text-sm font-semibold text-white">Kategori Efek Molekuler Varian</h4>
            </div>
          </div>

          <div className="space-y-2">
            {annotation?.per_efek && Object.keys(annotation.per_efek).length > 0 ? (
              Object.entries(annotation.per_efek).map(([effect, count]) => {
                const percent = totalVariants > 0 ? ((count / totalVariants) * 100).toFixed(0) : 0;
                return (
                  <div
                    key={effect}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs"
                  >
                    <span className="font-mono text-slate-200 truncate max-w-[240px]">
                      {effect}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400 font-mono">{count}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({percent}%)</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">
                Belum ada data efek molekuler. Jalankan pipeline untuk melihat hasil anotasi SnpEff.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
