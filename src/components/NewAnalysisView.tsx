import React, { useState } from 'react';
import { Upload, ArrowRight, CheckCircle2, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { Analysis, DEFAULT_CONFIG } from '../types';
import { saveAnalysis } from '../services/storage';
import { SAMPLE_FASTA_SNIPPET, SAMPLE_FASTQ_SNIPPET } from '../services/sampleData';

interface NewAnalysisViewProps {
  onStartAnalysis: (analysis: Analysis) => void;
}

export const NewAnalysisView: React.FC<NewAnalysisViewProps> = ({ onStartAnalysis }) => {
  const [nama, setNama] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [mode, setMode] = useState<'paired' | 'single'>('paired');

  const [r1Name, setR1Name] = useState('');
  const [r2Name, setR2Name] = useState('');
  const [refName, setRefName] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleLoadSample = () => {
    setNama('string');
    setOrganisme('Escherichia coli str. K-12 substr. MG1655');
    setMode('paired');
    setR1Name('test_R1.fastq.gz');
    setR2Name('test_R2.fastq.gz');
    setRefName('ref.fna');
    setError(null);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'r1' | 'r2' | 'ref'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'r1') setR1Name(file.name);
    else if (target === 'r2') setR2Name(file.name);
    else setRefName(file.name);
    setError(null);
  };

  const isComplete = Boolean(
    nama.trim() &&
    r1Name &&
    (mode === 'single' || r2Name) &&
    refName
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Harap masukkan nama analisis.');
      return;
    }
    if (!r1Name) {
      setError('Harap unggah berkas FASTQ R1.');
      return;
    }
    if (mode === 'paired' && !r2Name) {
      setError('Harap unggah berkas FASTQ R2 untuk sekuensing Paired-end.');
      return;
    }
    if (!refName) {
      setError('Harap unggah berkas genom referensi FASTA.');
      return;
    }

    const newAnalysis: Analysis = {
      id: 'run_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      user_id: 'user-default-1',
      nama: nama.trim(),
      organisme: organisme.trim() || 'Escherichia coli',
      mode,
      status: 'valid',
      stage: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      config: { ...DEFAULT_CONFIG },
      files: {
        r1: r1Name,
        r2: mode === 'paired' ? r2Name : undefined,
        reference: refName,
        r1_size: 4800000,
        r2_size: mode === 'paired' ? 4700000 : undefined,
        reference_size: 4640000,
      },
      error: null,
      log_tail: '[info] Masukan sekuens tervalidasi. Siap menjalankan pipeline.',
    };

    saveAnalysis(newAnalysis);
    onStartAnalysis(newAnalysis);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-8 space-y-8 bg-white">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
              <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
              <span>LANGKAH 01</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Analisis Baru
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Unggah file FASTQ dan reference genome untuk memulai pipeline variant calling.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 border border-blue-400 hover:border-blue-500 text-blue-600 bg-white hover:bg-blue-50 font-semibold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Muat Dataset Uji "string" (ref.fna, test_R1/R2)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Nama Analisis & Organisme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              NAMA ANALISIS
            </label>
            <input
              type="text"
              placeholder="cth. E. coli K-12 MG1655"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              ORGANISME
            </label>
            <input
              type="text"
              placeholder="cth. Escherichia coli"
              value={organisme}
              onChange={(e) => setOrganisme(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Mode Sekuensing */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-3">
            <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
            <span>MODE SEKUENSIING</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode('paired')}
              className={`p-4 rounded-lg border text-left transition cursor-pointer ${
                mode === 'paired'
                  ? 'bg-blue-50/80 border-blue-400 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-bold">
                Paired-end <span className="text-xs font-normal text-slate-500">R1 + R2</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('single')}
              className={`p-4 rounded-lg border text-left transition cursor-pointer ${
                mode === 'single'
                  ? 'bg-blue-50/80 border-blue-400 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-bold">
                Single-end <span className="text-xs font-normal text-slate-500">R1 saja</span>
              </div>
            </button>
          </div>
        </div>

        {/* 3 Upload Boxes */}
        <div className="space-y-4">
          {/* FASTQ R1 */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              <span>FASTQ R1</span>
              <span className="text-blue-600">*wajib</span>
            </div>
            <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition bg-slate-50/40 hover:bg-blue-50/20">
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                {r1Name ? (
                  <span className="text-blue-600 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {r1Name}
                  </span>
                ) : (
                  'Klik untuk unggah'
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Format: .fastq / .fastq.gz</div>
              <input
                type="file"
                accept=".fastq,.fq,.gz,.fastq.gz"
                onChange={(e) => handleFileUpload(e, 'r1')}
                className="hidden"
              />
            </label>
          </div>

          {/* FASTQ R2 */}
          {mode === 'paired' && (
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                <span>FASTQ R2</span>
                <span className="text-blue-600">*wajib</span>
              </div>
              <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition bg-slate-50/40 hover:bg-blue-50/20">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-800">
                  {r2Name ? (
                    <span className="text-blue-600 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {r2Name}
                    </span>
                  ) : (
                    'Klik untuk unggah'
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Format: .fastq / .fastq.gz</div>
                <input
                  type="file"
                  accept=".fastq,.fq,.gz,.fastq.gz"
                  onChange={(e) => handleFileUpload(e, 'r2')}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* REFERENCE GENOME (FASTA) */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              <span>REFERENCE GENOME (FASTA)</span>
              <span className="text-blue-600">*wajib</span>
            </div>
            <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition bg-slate-50/40 hover:bg-blue-50/20">
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                {refName ? (
                  <span className="text-blue-600 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {refName}
                  </span>
                ) : (
                  'Klik untuk unggah'
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Format: .fasta / .fa</div>
              <input
                type="file"
                accept=".fa,.fasta,.fna"
                onChange={(e) => handleFileUpload(e, 'ref')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isComplete ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Seluruh berkas wajib telah siap untuk diproses.
              </span>
            ) : (
              <span className="text-blue-600 font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Lengkapi file wajib untuk melanjutkan
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!isComplete}
            className={`flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-lg transition-all cursor-pointer ${
              isComplete
                ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 shadow-sm active:scale-95'
                : 'bg-white border border-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
