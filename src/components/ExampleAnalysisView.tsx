import React from 'react';
import { Dna, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Analysis } from '../types';

interface ExampleAnalysisViewProps {
  analysis: Analysis;
  onOpenResults: (analysis: Analysis) => void;
}

export const ExampleAnalysisView: React.FC<ExampleAnalysisViewProps> = ({
  analysis,
  onOpenResults,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-8 space-y-8 bg-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase mb-2">
          <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
          <span>TEST SAMPLE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          Contoh Analisis &mdash; E. coli K-12 MG1655
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Dataset genom referensi E. coli K-12 MG1655 sebagai sampel uji. Hasil sudah pra-hitung untuk eksplorasi cepat.
        </p>
      </div>

      {/* Substrain Spec Card */}
      <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 sm:p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Dna className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Escherichia coli K-12 substrain MG1655
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Genom referensi ~4.64 Mb &middot; Paired-end Illumina 150bp &middot; TEST SAMPLE
          </p>
        </div>
      </div>

      {/* File Input List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase">
          <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
          <span>FILE INPUT</span>
        </div>

        <div className="border-t border-b border-slate-200 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">FASTQ R1</span>
            </div>
            <span className="font-mono text-slate-500">ecoli_K12_R1.fastq.gz</span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">FASTQ R2</span>
            </div>
            <span className="font-mono text-slate-500">ecoli_K12_R2.fastq.gz</span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Reference</span>
            </div>
            <span className="font-mono text-slate-500">ecoli_K12_MG1655.fasta</span>
          </div>
        </div>
      </div>

      {/* 4 Big Blue Metric Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TOTAL VARIAN
          </div>
          <div className="text-4xl font-extrabold text-blue-600 tracking-tight font-mono mt-1">
            128
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            SNP
          </div>
          <div className="text-4xl font-extrabold text-blue-600 tracking-tight font-mono mt-1">
            89
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            INDEL
          </div>
          <div className="text-4xl font-extrabold text-blue-600 tracking-tight font-mono mt-1">
            39
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            GEN TERPENGARUH
          </div>
          <div className="text-4xl font-extrabold text-blue-600 tracking-tight font-mono mt-1">
            51
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Konfigurasi Pipeline (6 Grid Boxes) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase">
          <span className="w-6 h-0.5 bg-yellow-400 inline-block" />
          <span>KONFIGURASI PIPELINE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* ALIGNER */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ALIGNER
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              BWA-MEM
            </div>
          </div>

          {/* VARIANT CALLER */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              VARIANT CALLER
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              GATK HaplotypeCaller
            </div>
          </div>

          {/* ANNOTATION */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ANNOTATION
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              SnpEff
            </div>
          </div>

          {/* MIN QUALITY */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MIN QUALITY
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              30 phred
            </div>
          </div>

          {/* MIN DEPTH */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MIN DEPTH
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              10x
            </div>
          </div>

          {/* MAPPING RATE */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MAPPING RATE
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              99.43%
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>Hasil sudah siap &mdash; jelajahi tabel varian, grafik, dan detail.</span>
        </div>

        <button
          onClick={() => onOpenResults(analysis)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <span>Buka Hasil Analisis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
