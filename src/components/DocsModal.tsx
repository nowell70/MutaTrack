import React from 'react';
import { X, BookOpen, Dna, CheckCircle2, ShieldCheck, Activity, Terminal, ArrowRight } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Panduan Alur &amp; Arsitektur MutaTrack</h3>
              <p className="text-xs text-slate-400">
                Praktikum Pembangunan Perangkat Lunak Bioinformatika IPB University
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Overview */}
          <div>
            <h4 className="text-sm font-bold text-emerald-400 mb-2">1. Gambaran Umum MutaTrack</h4>
            <p>
              MutaTrack adalah platform perangkat lunak bioinformatika untuk mengintegrasikan dan
              mengotomatisasi alur kerja <i>variant calling</i> DNA mikroorganisme (khususnya <i>Escherichia coli</i>),
              mulai dari sekuens mentah FASTQ hingga penentuan efek fungsional varian genetik dengan SnpEff.
            </p>
          </div>

          {/* 6 Stage Pipeline Flow */}
          <div>
            <h4 className="text-sm font-bold text-emerald-400 mb-3">2. Enam Tahapan Pipeline Bioinformatika</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-[10px]">1</span>
                  Kontrol Kualitas (FastQC)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Evaluasi distribusi nilai Phred, GC content, dan kualitas basa per-posisi pada berkas FASTQ.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-[10px]">2</span>
                  Pemrosesan Sekuens (fastp)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Pemotongan adapter sequencing, filtering kualitas Phred (&gt;= Q20), dan pembuangan reads pendek (&lt; 50 bp).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-[10px]">3</span>
                  Alignment (BWA-MEM &amp; SAMtools)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Pemetaan reads terhadap genom referensi, sorting BAM berdasarkan koordinat, dan perhitungan flagstat terpetakan.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-[10px]">4</span>
                  Variant Calling (BCFtools mpileup &amp; call)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Identifikasi kandidat Single Nucleotide Polymorphisms (SNP) dan Indels dengan parameter ploidy 1 (haploid).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-[10px]">5</span>
                  Penyaringan Varian (BCFtools filter)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Eliminasi mutasi palsu dengan ambang batas kualitas QUAL &gt;= 30 dan kedalaman sekuensing DP &gt;= 10x.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-[10px]">6</span>
                  Anotasi Fungsional (SnpEff)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Prediksi dampak fungsional mutasi pada gen dan protein: HIGH (Stop Gained, Frameshift), MODERATE (Missense), LOW (Synonymous), MODIFIER.
                </p>
              </div>
            </div>
          </div>

          {/* Formats and Verification */}
          <div>
            <h4 className="text-sm font-bold text-emerald-400 mb-2">3. Format Berkas Masukan</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-mono text-emerald-400 font-bold">.FASTQ / .FQ:</span> Memuat empat baris per rekaman sekuens (Header @, Sekuens nukleotida, Tanda +, Nilai kualitas Phred).
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-mono text-cyan-400 font-bold">.FASTA / .FNA:</span> Genom referensi acuan yang diawali tanda <code className="text-cyan-300 font-mono">&gt;</code> diikuti identifier unik kromosom.
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h4 className="text-sm font-bold text-emerald-400 mb-2">4. Ekspor dan Unduhan Hasil</h4>
            <p>
              Hasil analisis dapat diunduh langsung dalam tiga format terstandardisasi:
            </p>
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-400 pl-1">
              <li><b className="text-slate-200">VCF (Variant Call Format v4.2):</b> Dilengkapi anotasi SnpEff (field ANN) dan kedalaman sekuens (DP).</li>
              <li><b className="text-slate-200">CSV Spreadsheet:</b> Seluruh tabel varian untuk integrasi spreadsheet dan analisis statistik.</li>
              <li><b className="text-slate-200">Laporan Dokumen PDF:</b> Ringkasan parameter, statistik alignment, dan 100 varian pertama.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-right shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
