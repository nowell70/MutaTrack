import React, { useState } from 'react';
import {
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Loader2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Analysis, DEFAULT_CONFIG } from '../types';
import { saveAnalysis } from '../services/storage';

interface NewAnalysisViewProps {
  onStartAnalysis: (analysis: Analysis) => void;
}

export const NewAnalysisView: React.FC<NewAnalysisViewProps> = ({ onStartAnalysis }) => {
  const [nama, setNama] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [mode, setMode] = useState<'paired' | 'single'>('paired');

  // File names and actual server paths
  const [r1Name, setR1Name] = useState('');
  const [r1Path, setR1Path] = useState('');
  const [r1Size, setR1Size] = useState<number>(0);

  const [r2Name, setR2Name] = useState('');
  const [r2Path, setR2Path] = useState('');
  const [r2Size, setR2Size] = useState<number>(0);

  const [refName, setRefName] = useState('');
  const [refPath, setRefPath] = useState('');
  const [refSize, setRefSize] = useState<number>(0);

  const [uploadingTarget, setUploadingTarget] = useState<'r1' | 'r2' | 'ref' | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSample = () => {
    setNama('string');
    setOrganisme('Escherichia coli str. K-12 substr. MG1655');
    setMode('paired');

    setR1Name('test_R1.fastq.gz');
    setR1Path('test_R1.fastq.gz');
    setR1Size(19500000);

    setR2Name('test_R2.fastq.gz');
    setR2Path('test_R2.fastq.gz');
    setR2Size(19500000);

    setRefName('ref.fna');
    setRefPath('ref.fna');
    setRefSize(4700000);

    setError(null);
    setValidationSuccess('Dataset uji nyata telah dimuat (300.000 paired reads + E. coli MG1655 ref).');
  };

  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'r1' | 'r2' | 'ref'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setValidationSuccess(null);

    // Client-side 100 MB file size limit verification
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(
        `Ukuran berkas "${file.name}" (${sizeMB} MB) melebihi batas maksimal yang diizinkan (100 MB). Silakan gunakan berkas berukuran maksimal 100 MB.`
      );
      e.target.value = '';
      return;
    }

    setUploadingTarget(target);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', target);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Gagal mengunggah ${file.name}`);
      }

      const data = await res.json();
      if (target === 'r1') {
        setR1Name(file.name);
        setR1Path(data.filepath);
        setR1Size(data.size);
      } else if (target === 'r2') {
        setR2Name(file.name);
        setR2Path(data.filepath);
        setR2Size(data.size);
      } else {
        setRefName(file.name);
        setRefPath(data.filepath);
        setRefSize(data.size);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengunggah berkas.');
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleValidateNow = async () => {
    if (!r1Path && !r1Name) {
      setError('Harap tentukan berkas R1 terlebih dahulu.');
      return;
    }
    if (mode === 'paired' && !r2Path && !r2Name) {
      setError('Mode Paired-End membutuhkan berkas R2.');
      return;
    }
    if (!refPath && !refName) {
      setError('Harap tentukan genom referensi.');
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationSuccess(null);

    try {
      const res = await fetch('/api/analyses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r1_path: r1Path || r1Name,
          r2_path: mode === 'paired' ? r2Path || r2Name : null,
          reference_path: refPath || refName,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Validasi masukan gagal.');
      }

      if (data.valid) {
        const readsInfo = data.details?.paired_reads
          ? `${data.details.paired_reads.r1_reads.toLocaleString()} paired reads`
          : `${data.details?.single_read?.total_reads?.toLocaleString() || 'Valid'} reads`;
        const chromCount = data.details?.reference?.chromosomes?.length || 1;
        setValidationSuccess(
          `Validasi Berhasil: Format FASTQ/FASTA sesuai, ${readsInfo}, ${chromCount} kromosom referensi.`
        );
      }
    } catch (err: any) {
      setError(`Gagal Validasi: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
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
      id: 'ana_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      user_id: 'user-default-1',
      nama: nama.trim(),
      organisme: organisme.trim() || 'Escherichia coli str. K-12 substr. MG1655',
      mode,
      status: 'valid',
      stage: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      config: { ...DEFAULT_CONFIG },
      files: {
        r1: r1Path || r1Name,
        r2: mode === 'paired' ? r2Path || r2Name : undefined,
        reference: refPath || refName,
        r1_size: r1Size || 19500000,
        r2_size: mode === 'paired' ? r2Size || 19500000 : undefined,
        reference_size: refSize || 4700000,
      },
      error: null,
      log_tail: '[info] Masukan sekuens tervalidasi. Siap menjalankan pipeline bioinformatika produksi.',
    };

    saveAnalysis(newAnalysis);
    onStartAnalysis(newAnalysis);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-8 space-y-8 bg-white">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
              <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
              <span>LANGKAH 01</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Analisis Baru
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Unggah file FASTQ dan reference genome untuk memulai pipeline variant calling nyata (FastQC, fastp, BWA-MEM, SAMtools, BCFtools, SnpEff).
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 border border-blue-400 hover:border-blue-500 text-blue-600 bg-white hover:bg-blue-50 font-semibold text-xs px-3.5 py-2.5 rounded-lg transition cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Muat Dataset Uji Nyata (ref.fna, test_R1/R2)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="font-medium">{error}</div>
        </div>
      )}

      {validationSuccess && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div className="font-medium">{validationSuccess}</div>
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
              placeholder="cth. Escherichia coli str. K-12 substr. MG1655"
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
              <div className="text-[11px] text-slate-400 mt-1">Dua berkas berpasangan maju dan mundur</div>
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
              <div className="text-[11px] text-slate-400 mt-1">Satu berkas sekuens tunggal</div>
            </button>
          </div>
        </div>

        {/* 3 Upload Boxes */}
        <div className="space-y-4">
          {/* FASTQ R1 */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-2">
                <span>FASTQ R1</span>
                <span className="text-blue-600">*wajib</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                  Maks. 100 MB
                </span>
              </div>
              {r1Size > 0 && (
                <span className="text-slate-500 font-medium text-[11px]">
                  {formatBytes(r1Size)} / 100 MB
                </span>
              )}
            </div>
            <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/40 hover:bg-blue-50/20">
              {uploadingTarget === 'r1' ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin mb-1.5" />
                  <span className="text-xs font-semibold text-blue-600">Mengunggah R1 ke server (hingga 100 MB)...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-800">
                    {r1Name ? (
                      <span className="text-blue-600 font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {r1Name}
                      </span>
                    ) : (
                      'Klik untuk unggah file FASTQ R1'
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Maksimal 100 MB • Mendukung: .fastq, .fq, .fastq.gz, .fq.gz
                  </div>
                </>
              )}
              <input
                type="file"
                accept=".fastq,.fq,.gz,.fastq.gz,.fq.gz"
                onChange={(e) => handleFileUpload(e, 'r1')}
                className="hidden"
                disabled={uploadingTarget !== null}
              />
            </label>
          </div>

          {/* FASTQ R2 */}
          {mode === 'paired' && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                <div className="flex items-center gap-2">
                  <span>FASTQ R2</span>
                  <span className="text-blue-600">*wajib untuk Paired-End</span>
                  <span className="bg-cyan-50 text-cyan-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-cyan-200">
                    Maks. 100 MB
                  </span>
                </div>
                {r2Size > 0 && (
                  <span className="text-slate-500 font-medium text-[11px]">
                    {formatBytes(r2Size)} / 100 MB
                  </span>
                )}
              </div>
              <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/40 hover:bg-blue-50/20">
                {uploadingTarget === 'r2' ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mb-1.5" />
                    <span className="text-xs font-semibold text-blue-600">Mengunggah R2 ke server (hingga 100 MB)...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-slate-800">
                      {r2Name ? (
                        <span className="text-blue-600 font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {r2Name}
                        </span>
                      ) : (
                        'Klik untuk unggah file FASTQ R2'
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Maksimal 100 MB • Mendukung: .fastq, .fq, .fastq.gz, .fq.gz
                    </div>
                  </>
                )}
                <input
                  type="file"
                  accept=".fastq,.fq,.gz,.fastq.gz,.fq.gz"
                  onChange={(e) => handleFileUpload(e, 'r2')}
                  className="hidden"
                  disabled={uploadingTarget !== null}
                />
              </label>
            </div>
          )}

          {/* REFERENCE GENOME (FASTA) */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-2">
                <span>REFERENCE GENOME (FASTA)</span>
                <span className="text-blue-600">*wajib</span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-200">
                  Maks. 100 MB
                </span>
              </div>
              {refSize > 0 && (
                <span className="text-slate-500 font-medium text-[11px]">
                  {formatBytes(refSize)} / 100 MB
                </span>
              )}
            </div>
            <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/40 hover:bg-blue-50/20">
              {uploadingTarget === 'ref' ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin mb-1.5" />
                  <span className="text-xs font-semibold text-blue-600">Mengunggah Referensi ke server (hingga 100 MB)...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-800">
                    {refName ? (
                      <span className="text-blue-600 font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {refName}
                      </span>
                    ) : (
                      'Klik untuk unggah genom acuan FASTA'
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Maksimal 100 MB • Mendukung: .fasta, .fa, .fna, .fasta.gz, .fa.gz, .fna.gz
                  </div>
                </>
              )}
              <input
                type="file"
                accept=".fa,.fasta,.fna,.gz,.fa.gz,.fasta.gz,.fna.gz"
                onChange={(e) => handleFileUpload(e, 'ref')}
                className="hidden"
                disabled={uploadingTarget !== null}
              />
            </label>
          </div>
        </div>

        {/* Validation & Submit Actions */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleValidateNow}
              disabled={isValidating || !r1Name || !refName}
              className="flex items-center gap-1.5 border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-xs font-semibold px-3.5 py-2.5 rounded-lg transition cursor-pointer disabled:opacity-40"
            >
              {isValidating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>{isValidating ? 'Memvalidasi...' : 'Uji Validasi Berkas'}</span>
            </button>
            <div className="text-[11px] text-slate-400">
              Validasi integritas gzip, 4-line FASTQ, dan kecocokan pasangan reads
            </div>
          </div>

          <button
            type="submit"
            disabled={!isComplete || uploadingTarget !== null}
            className={`flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-lg transition-all cursor-pointer ${
              isComplete && uploadingTarget === null
                ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 shadow-sm active:scale-95'
                : 'bg-white border border-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Jalankan Pipeline Bioinformatika</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
