import React, { useState } from 'react';
import { Analysis, Variant } from '../types';
import { PipelineProgressBar } from './PipelineProgressBar';
import { OverviewCharts } from './OverviewCharts';
import { VariantTable } from './VariantTable';
import { ConfigFilesTab } from './ConfigFilesTab';
import { LogTerminal } from './LogTerminal';
import {
  Play,
  RotateCw,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Calendar,
  Layers,
  CheckCircle2,
  Sliders,
  Terminal,
  Trash2,
} from 'lucide-react';
import { downloadCsv, downloadLog, downloadPdf, downloadVcf } from '../services/exportService';

interface AnalysisDetailProps {
  analysis: Analysis;
  variants: Variant[];
  onRunPipeline: (analysis: Analysis) => void;
  onUpdateAnalysis: (updated: Analysis) => void;
  onDeleteAnalysis: (id: string) => void;
  isExecuting: boolean;
  liveLog: string;
}

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({
  analysis,
  variants,
  onRunPipeline,
  onUpdateAnalysis,
  onDeleteAnalysis,
  isExecuting,
  liveLog,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'variants' | 'config' | 'logs'>('overview');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getStatusBadge = () => {
    switch (analysis.status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case 'berjalan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            Sedang Berjalan
          </span>
        );
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Valid (Siap Dijalankan)
          </span>
        );
      case 'gagal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Draf
          </span>
        );
    }
  };

  const currentDisplayLog = isExecuting ? liveLog : analysis.full_log || analysis.log_tail || 'Belum ada log.';

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {analysis.nama}
              </h1>
              {getStatusBadge()}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <span className="text-slate-500">ID:</span> {analysis.id}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(analysis.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-slate-500">•</span>
              <span>
                Ref:{' '}
                <span className="text-slate-300 font-mono">
                  {analysis.files.reference || 'E. coli MG1655'}
                </span>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Run / Re-run */}
            <button
              onClick={() => onRunPipeline(analysis)}
              disabled={isExecuting}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-lg transition cursor-pointer ${
                analysis.status === 'selesai'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isExecuting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Berjalan...</span>
                </>
              ) : analysis.status === 'selesai' ? (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>Jalankan Ulang</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Pipeline</span>
                </>
              )}
            </button>

            {/* Export Dropdown */}
            {analysis.status === 'selesai' && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Ekspor Hasil</span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-30 space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        downloadVcf(analysis, variants);
                        setShowExportMenu(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span>Unduh VCF (.vcf)</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadCsv(analysis, variants);
                        setShowExportMenu(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                      <span>Unduh CSV (.csv)</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadPdf(analysis, variants);
                        setShowExportMenu(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>Unduh Laporan PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadLog(analysis);
                        setShowExportMenu(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <Terminal className="w-4 h-4 text-slate-400" />
                      <span>Unduh Log (.log)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Delete button */}
            <button
              onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus analisis "${analysis.nama}"?`)) {
                  onDeleteAnalysis(analysis.id);
                }
              }}
              className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-800 transition cursor-pointer"
              title="Hapus Analisis"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline Progress Stages */}
        <div className="mt-5">
          <PipelineProgressBar currentStage={analysis.stage} status={analysis.status} />
        </div>

        {/* Error notification if failed */}
        {analysis.status === 'gagal' && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-300">Eksekusi Pipeline Mengalami Kegagalan:</div>
              <div className="mt-1 text-rose-200/90 font-mono">{analysis.error || 'Terjadi kesalahan eksekusi.'}</div>
              <button
                onClick={() => setActiveTab('logs')}
                className="mt-2 text-rose-400 underline hover:text-rose-300 cursor-pointer"
              >
                Lihat detail terminal log eksekusi &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition cursor-pointer ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400 font-semibold bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ringkasan Metrik</span>
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition cursor-pointer ${
            activeTab === 'variants'
              ? 'border-emerald-500 text-emerald-400 font-semibold bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daftar Varian ({variants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition cursor-pointer ${
            activeTab === 'config'
              ? 'border-emerald-500 text-emerald-400 font-semibold bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parameter &amp; Berkas</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition cursor-pointer ${
            activeTab === 'logs'
              ? 'border-emerald-500 text-emerald-400 font-semibold bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Log Eksekusi</span>
          {isExecuting && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-1" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          analysis.status === 'selesai' || analysis.stats ? (
            <OverviewCharts analysis={analysis} />
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-200">Analisis Belum Dijalankan</div>
              <p className="mt-1 text-slate-400 max-w-md mx-auto">
                Tekan tombol &quot;Mulai Pipeline&quot; di atas untuk menjalankan FastQC, fastp, BWA-MEM, BCFtools, dan SnpEff.
              </p>
            </div>
          )
        )}

        {activeTab === 'variants' && (
          <VariantTable
            variants={variants}
            onDownloadVcf={() => downloadVcf(analysis, variants)}
            onDownloadCsv={() => downloadCsv(analysis, variants)}
            onDownloadPdf={() => downloadPdf(analysis, variants)}
          />
        )}

        {activeTab === 'config' && (
          <ConfigFilesTab analysis={analysis} onUpdateAnalysis={onUpdateAnalysis} />
        )}

        {activeTab === 'logs' && (
          <LogTerminal
            logs={currentDisplayLog}
            onDownloadLog={() => downloadLog(analysis)}
            isStreaming={isExecuting}
          />
        )}
      </div>
    </div>
  );
};
