import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, FileText, Sparkles, Sliders, Play } from 'lucide-react';
import { Analysis, DEFAULT_CONFIG, PipelineConfig } from '../types';
import { checkFastaContent, checkFastqContent, saveAnalysis } from '../services/storage';
import { SAMPLE_FASTA_SNIPPET, SAMPLE_FASTQ_SNIPPET } from '../services/sampleData';
import { useAuth } from '../context/AuthContext';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (analysis: Analysis, autoRun?: boolean) => void;
}

export const NewAnalysisModal: React.FC<NewAnalysisModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [nama, setNama] = useState('');
  const [r1FileName, setR1FileName] = useState('');
  const [r1Content, setR1Content] = useState('');
  const [r2FileName, setR2FileName] = useState('');
  const [r2Content, setR2Content] = useState('');
  const [refFileName, setRefFileName] = useState('');
  const [refContent, setRefContent] = useState('');

  const [config, setConfig] = useState<PipelineConfig>({ ...DEFAULT_CONFIG });
  const [showConfig, setShowConfig] = useState(false);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);

  if (!isOpen) return null;

  const handleLoadSampleDataset = () => {
    setNama('Analisis Sekuens E. coli K-12 MG1655');
    setR1FileName('ecoli_simulated_R1.fastq.gz');
    setR1Content(SAMPLE_FASTQ_SNIPPET);
    setR2FileName('ecoli_simulated_R2.fastq.gz');
    setR2Content(SAMPLE_FASTQ_SNIPPET);
    setRefFileName('GCF_000005845.2_ASM584v2_genomic.fna');
    setRefContent(SAMPLE_FASTA_SNIPPET);
    setValidated(true);
    setValidationErrors([]);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'r1' | 'r2' | 'ref'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      if (type === 'r1') {
        setR1FileName(file.name);
        setR1Content(text.slice(0, 5000));
      } else if (type === 'r2') {
        setR2FileName(file.name);
        setR2Content(text.slice(0, 5000));
      } else {
        setRefFileName(file.name);
        setRefContent(text.slice(0, 5000));
      }
      setValidated(false);
    };
    reader.readAsText(file.slice(0, 10000));
  };

  const validateInputs = (): boolean => {
    const errs: string[] = [];

    if (!nama.trim()) {
      errs.push('Nama analisis tidak boleh kosong.');
    }
    if (!r1FileName) {
      errs.push('Berkas FASTQ (R1) belum dipilih.');
    } else {
      const err = checkFastqContent(r1FileName, r1Content);
      if (err) errs.push(`R1 (${r1FileName}): ${err}`);
    }

    if (r2FileName) {
      const err = checkFastqContent(r2FileName, r2Content);
      if (err) errs.push(`R2 (${r2FileName}): ${err}`);
    }

    if (!refFileName) {
      errs.push('Genom referensi FASTA belum dipilih.');
    } else {
      const err = checkFastaContent(refFileName, refContent);
      if (err) errs.push(`Referensi (${refFileName}): ${err}`);
    }

    setValidationErrors(errs);
    setValidated(true);
    return errs.length === 0;
  };

  const handleSubmit = (autoRun = false) => {
    const isValid = validateInputs();
    if (!isValid) return;

    const newAnalysis: Analysis = {
      id: 'analysis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user?.id || 'guest',
      nama: nama.trim(),
      status: 'valid',
      stage: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      config,
      files: {
        r1: r1FileName,
        r2: r2FileName || undefined,
        reference: refFileName,
        r1_size: 4800000,
        r2_size: r2FileName ? 4700000 : undefined,
        reference_size: 4640000,
      },
      error: null,
      log_tail: '[info] Berkas masukan berhasil divalidasi. Siap untuk dieksekusi.',
      full_log: `[info] Berkas masukan berhasil divalidasi.\n- R1: ${r1FileName}\n- R2: ${r2FileName || 'None (Single-end)'}\n- Reference: ${refFileName}\nStatus: Siap dieksekusi.`,
    };

    saveAnalysis(newAnalysis);
    onCreated(newAnalysis, autoRun);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div>
            <h3 className="text-base font-bold text-white">Buat Proyek Analisis Variant Calling</h3>
            <p className="text-xs text-slate-400">
              Unggah data sekuensing FASTQ dan genom referensi untuk memulai alur analisis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick preset banner */}
          <div className="bg-gradient-to-r from-emerald-950/50 via-teal-950/30 to-slate-900 border border-emerald-800/50 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Data Uji Benchmark Cepat (E. coli K-12)
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Isi formulir secara instan menggunakan dataset sekuens genom E. coli K-12 MG1655 (NCBI RefSeq).
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadSampleDataset}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow transition cursor-pointer"
            >
              Muat Data Uji
            </button>
          </div>

          {/* Analysis Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Nama Analisis <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Analisis Mutasi Isolat Lapangan E. coli #01"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-200">
              Unggah Berkas Masukan (FASTQ &amp; FASTA)
            </label>

            {/* R1 Upload */}
            <div className="border border-dashed border-slate-700 bg-slate-950/40 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  R1
                </div>
                <div>
                  <div className="font-medium text-slate-200">
                    {r1FileName || 'Berkas FASTQ Forward Reads (Wajib)'}
                  </div>
                  <div className="text-[10px] text-slate-500">.fastq, .fq, atau .fastq.gz</div>
                </div>
              </div>
              <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Berkas</span>
                <input
                  type="file"
                  accept=".fastq,.fq,.gz,.fastq.gz"
                  onChange={(e) => handleFileUpload(e, 'r1')}
                  className="hidden"
                />
              </label>
            </div>

            {/* R2 Upload */}
            <div className="border border-dashed border-slate-700 bg-slate-950/40 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  R2
                </div>
                <div>
                  <div className="font-medium text-slate-200">
                    {r2FileName || 'Berkas FASTQ Reverse Reads (Opsional / Paired-end)'}
                  </div>
                  <div className="text-[10px] text-slate-500">Kosongkan jika analisis single-end</div>
                </div>
              </div>
              <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Berkas</span>
                <input
                  type="file"
                  accept=".fastq,.fq,.gz,.fastq.gz"
                  onChange={(e) => handleFileUpload(e, 'r2')}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reference Upload */}
            <div className="border border-dashed border-slate-700 bg-slate-950/40 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  REF
                </div>
                <div>
                  <div className="font-medium text-slate-200">
                    {refFileName || 'Genom Referensi FASTA (Wajib)'}
                  </div>
                  <div className="text-[10px] text-slate-500">.fa, .fasta, atau .fna</div>
                </div>
              </div>
              <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Berkas</span>
                <input
                  type="file"
                  accept=".fa,.fasta,.fna"
                  onChange={(e) => handleFileUpload(e, 'ref')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Validation Feedback */}
          {validated && (
            <div
              className={`p-3.5 rounded-xl border ${
                validationErrors.length === 0
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
              }`}
            >
              {validationErrors.length === 0 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Validasi Berhasil: Seluruh berkas memenuhi spesifikasi format bioinformatika.</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Periksa kesalahan masukan berikut:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Pipeline Parameters */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-4">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center justify-between w-full text-slate-300 hover:text-white cursor-pointer font-medium"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Pengaturan Parameter Pipeline (Opsional)</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                {showConfig ? 'Sembunyikan ▲' : 'Tampilkan ▼'}
              </span>
            </button>

            {showConfig && (
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    fastp -q (Trim Quality): <b className="text-emerald-400 font-mono">Q{config.trim_quality}</b>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={config.trim_quality}
                    onChange={(e) => setConfig({ ...config, trim_quality: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    fastp -l (Min Length): <b className="text-emerald-400 font-mono">{config.min_length} bp</b>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={config.min_length}
                    onChange={(e) => setConfig({ ...config, min_length: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    bcftools mpileup -q: <b className="text-cyan-400 font-mono">{config.min_mapq}</b>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={config.min_mapq}
                    onChange={(e) => setConfig({ ...config, min_mapq: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    bcftools filter QUAL &gt;=: <b className="text-indigo-400 font-mono">{config.min_qual}</b>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="5"
                    value={config.min_qual}
                    onChange={(e) => setConfig({ ...config, min_qual: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={validateInputs}
            className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            Uji &amp; Validasi Masukan
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-3.5 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Simpan Draf Analisis
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simpan &amp; Jalankan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
