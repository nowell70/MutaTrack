import React, { useState } from 'react';
import { Analysis, PipelineConfig } from '../types';
import { Sliders, FileText, CheckCircle2, AlertCircle, Save, RotateCcw } from 'lucide-react';
import { saveAnalysis } from '../services/storage';

interface ConfigFilesTabProps {
  analysis: Analysis;
  onUpdateAnalysis: (updated: Analysis) => void;
}

export const ConfigFilesTab: React.FC<ConfigFilesTabProps> = ({ analysis, onUpdateAnalysis }) => {
  const [config, setConfig] = useState<PipelineConfig>({ ...analysis.config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: keyof PipelineConfig, val: number) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    const updated: Analysis = {
      ...analysis,
      config,
      updated_at: new Date().toISOString(),
    };
    saveAnalysis(updated);
    onUpdateAnalysis(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults: PipelineConfig = {
      trim_quality: 20,
      min_length: 50,
      min_mapq: 20,
      min_baseq: 20,
      min_qual: 30,
      min_depth: 10,
    };
    setConfig(defaults);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Parameter Pipeline Bioinformatika</h3>
              <p className="text-xs text-slate-400">
                Sesuaikan kriteria ambang batas pemotongan kualitas (fastp), alignment, dan penyaringan varian (BCFtools).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Parameter'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* trim_quality */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Phred Trim Quality (<code className="text-emerald-400 font-mono">fastp -q</code>)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Ambang batas kualitas basa minimum untuk trimming pemotongan ujung bacaan.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="35"
                value={config.trim_quality}
                onChange={(e) => handleChange('trim_quality', Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="font-mono font-bold text-sm text-emerald-400 w-10 text-right">
                Q{config.trim_quality}
              </span>
            </div>
          </div>

          {/* min_length */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Panjang Bacaan Min (<code className="text-emerald-400 font-mono">fastp -l</code>)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Reads dengan panjang setelah trimming lebih pendek dari batas ini akan dieliminasi.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={config.min_length}
                onChange={(e) => handleChange('min_length', Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="font-mono font-bold text-sm text-emerald-400 w-12 text-right">
                {config.min_length} bp
              </span>
            </div>
          </div>

          {/* min_mapq */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Min Mapping Quality (<code className="text-cyan-400 font-mono">bcftools -q</code>)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Kualitas pemetaan (MapQ) alignment minimum saat pembentukan mpileup.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="40"
                value={config.min_mapq}
                onChange={(e) => handleChange('min_mapq', Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="font-mono font-bold text-sm text-cyan-400 w-10 text-right">
                {config.min_mapq}
              </span>
            </div>
          </div>

          {/* min_baseq */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Min Base Quality (<code className="text-cyan-400 font-mono">bcftools -Q</code>)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Kualitas basa Phred minimum yang disertakan dalam variant calling.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="35"
                value={config.min_baseq}
                onChange={(e) => handleChange('min_baseq', Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="font-mono font-bold text-sm text-cyan-400 w-10 text-right">
                Q{config.min_baseq}
              </span>
            </div>
          </div>

          {/* min_qual */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Filter Variant QUAL (<code className="text-indigo-400 font-mono">QUAL &gt;=</code>)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Skor Phred probabilitas varian benar (QUAL 30 = akurasi 99.9%).
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={config.min_qual}
                onChange={(e) => handleChange('min_qual', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="font-mono font-bold text-sm text-indigo-400 w-10 text-right">
                {config.min_qual}
              </span>
            </div>
          </div>

          {/* min_depth */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Filter Read Depth (<code className="text-indigo-400 font-mono">INFO/DP &gt;=</code>)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Kedalaman pembacaan sekuens minimum pada posisi varian.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="30"
                value={config.min_depth}
                onChange={(e) => handleChange('min_depth', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="font-mono font-bold text-sm text-indigo-400 w-10 text-right">
                {config.min_depth}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files Information */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Berkas Masukan Sekuensing & Referensi</h3>
            <p className="text-xs text-slate-400">
              Spesifikasi berkas FASTQ dan genom referensi FASTA yang diasosiasikan dengan analisis ini.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* R1 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                R1
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">{analysis.files.r1 || 'Tidak ada'}</div>
                <div className="text-[11px] text-slate-400">FASTQ Forward Reads (Single / Paired-end)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {analysis.files.r1_size ? `${(analysis.files.r1_size / (1024 * 1024)).toFixed(2)} MB` : '4.82 MB'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* R2 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                R2
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {analysis.files.r2 || 'Tidak dikonfigurasi (Single-end)'}
                </div>
                <div className="text-[11px] text-slate-400">FASTQ Reverse Reads (Opsional)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {analysis.files.r2 && (
                <span className="text-xs text-slate-400 font-mono">
                  {analysis.files.r2_size ? `${(analysis.files.r2_size / (1024 * 1024)).toFixed(2)} MB` : '4.79 MB'}
                </span>
              )}
              {analysis.files.r2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[11px] text-slate-500 italic">Single-End</span>
              )}
            </div>
          </div>

          {/* Reference Genome */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                REF
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {analysis.files.reference || 'Tidak ada'}
                </div>
                <div className="text-[11px] text-slate-400">FASTA Genom Referensi (E. coli K-12 MG1655 / Custom)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {analysis.files.reference_size
                  ? `${(analysis.files.reference_size / (1024 * 1024)).toFixed(2)} MB`
                  : '4.64 MB'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
