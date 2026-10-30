import React, { useMemo, useState } from 'react';
import { Analysis, Variant, VariantImpact } from '../types';
import {
  ArrowLeft,
  RotateCw,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Sliders,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { downloadCsv, downloadLog, downloadPdf, downloadVcf } from '../services/exportService';

interface ResultsDetailViewProps {
  analysis: Analysis;
  variants: Variant[];
  onBack: () => void;
  onRerun: (analysis: Analysis) => void;
  isExecuting: boolean;
  liveLog: string;
}

export const ResultsDetailView: React.FC<ResultsDetailViewProps> = ({
  analysis,
  variants,
  onBack,
  onRerun,
  isExecuting,
  liveLog,
}) => {
  const [activeTab, setActiveTab] = useState<'variants' | 'charts' | 'config' | 'logs'>('variants');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'posisi' | 'qual' | 'depth' | 'gen'>('posisi');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedLog, setCopiedLog] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const pageSize = 15;

  const filteredAndSortedVariants = useMemo(() => {
    let result = [...variants];

    if (selectedImpact !== 'ALL') {
      result = result.filter((v) => v.impact === selectedImpact);
    }
    if (selectedType !== 'ALL') {
      result = result.filter((v) => v.tipe === selectedType);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          (v.gen && v.gen.toLowerCase().includes(q)) ||
          (v.efek && v.efek.toLowerCase().includes(q)) ||
          v.chrom.toLowerCase().includes(q) ||
          String(v.posisi).includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA === null || valA === undefined) return sortAsc ? 1 : -1;
      if (valB === null || valB === undefined) return sortAsc ? -1 : 1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [variants, selectedImpact, selectedType, searchTerm, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedVariants.length / pageSize));
  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedVariants.slice(start, start + pageSize);
  }, [filteredAndSortedVariants, currentPage]);

  const toggleSort = (field: 'posisi' | 'qual' | 'depth' | 'gen') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderImpactBadge = (impact: VariantImpact | null) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
            HIGH
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
            MODERATE
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
            LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
            MODIFIER
          </span>
        );
    }
  };

  const currentDisplayLog = isExecuting ? liveLog : analysis.full_log || analysis.log_tail || 'Tidak ada log tersedia.';

  const handleCopyLog = () => {
    navigator.clipboard.writeText(currentDisplayLog);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-6 bg-white">
      {/* Top Header / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {analysis.nama}
              </h1>
              {analysis.status === 'selesai' && (
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  Berhasil
                </span>
              )}
              {analysis.status === 'berjalan' && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <RotateCw className="w-3 h-3 animate-spin" />
                  Sedang Berjalan
                </span>
              )}
              {analysis.status === 'gagal' && (
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  Gagal
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {analysis.organisme || 'Escherichia coli'} &middot; Ref: {analysis.files.reference || 'ecoli_K12_MG1655.fasta'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onRerun(analysis)}
            disabled={isExecuting}
            className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Memproses...' : 'Jalankan Ulang'}</span>
          </button>

          {/* Direct PDF Download matching string.pdf */}
          <button
            onClick={() => downloadPdf(analysis, variants)}
            className="flex items-center gap-1.5 border border-rose-200 hover:border-rose-400 bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition cursor-pointer"
            title="Unduh laporan PDF dengan format resmi sesuai file string.pdf"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Unduh PDF Resmi</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Hasil</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 text-xs space-y-0.5">
                <button
                  onClick={() => {
                    downloadVcf(analysis, variants);
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Unduh VCF (.vcf)</span>
                </button>
                <button
                  onClick={() => {
                    downloadCsv(analysis, variants);
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Unduh CSV (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    downloadPdf(analysis, variants);
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Unduh Laporan PDF</span>
                </button>
                <button
                  onClick={() => {
                    downloadLog(analysis);
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span>Unduh Log (.log)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('variants')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'variants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Daftar Varian ({variants.length})
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'charts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Statistik &amp; Visualisasi
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'config'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Parameter Pipeline
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Terminal Log</span>
          {isExecuting && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
          )}
        </button>
      </div>

      {/* TAB 1: VARIANTS TABLE */}
      {activeTab === 'variants' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari gen, posisi, efek..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Impact & Type Filter */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-500 font-medium">Dampak:</span>
                <select
                  aria-label="Filter Berdasarkan Dampak"
                  value={selectedImpact}
                  onChange={(e) => {
                    setSelectedImpact(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Dampak</option>
                  <option value="HIGH">HIGH (Tinggi)</option>
                  <option value="MODERATE">MODERATE (Sedang)</option>
                  <option value="LOW">LOW (Rendah)</option>
                  <option value="MODIFIER">MODIFIER</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-500 font-medium">Tipe:</span>
                <select
                  aria-label="Filter Berdasarkan Tipe"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Tipe</option>
                  <option value="SNP">SNP</option>
                  <option value="INDEL">INDEL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Kromosom</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => toggleSort('posisi')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Posisi</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Ref &gt; Alt</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => toggleSort('gen')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Gen Terdampak</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Efek Fungsional</th>
                    <th className="py-3 px-4">Dampak</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => toggleSort('qual')}
                    >
                      <div className="flex items-center gap-1">
                        <span>QUAL</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => toggleSort('depth')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Depth</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {paginatedVariants.map((v) => (
                    <tr key={v.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-2.5 px-4 text-slate-600 font-sans">{v.chrom}</td>
                      <td className="py-2.5 px-4 font-bold text-blue-600">
                        {v.posisi.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        <span className="font-semibold text-slate-500">{v.ref}</span>
                        <span className="text-slate-300 mx-1">&gt;</span>
                        <span className="font-bold text-blue-600">{v.alt}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                            v.tipe === 'SNP'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {v.tipe}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                        {v.gen ? <span className="italic">{v.gen}</span> : '&mdash;'}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-600 text-[11px]">
                        {v.efek || '&mdash;'}
                      </td>
                      <td className="py-2.5 px-4 font-sans">{renderImpactBadge(v.impact)}</td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {v.qual ? v.qual.toFixed(1) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {v.depth ? `${v.depth}x` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <span className="font-semibold text-slate-900">
                  {filteredAndSortedVariants.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </span>{' '}
                -{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * pageSize, filteredAndSortedVariants.length)}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-slate-900">
                  {filteredAndSortedVariants.length}
                </span>{' '}
                varian
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-slate-300 hover:bg-white disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-slate-300 hover:bg-white disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHARTS & STATS */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Top 4 Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                MAPPING RATE
              </div>
              <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
                99.43%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                293,955 reads terpetakan (BWA-MEM)
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Q30 TRIMMING
              </div>
              <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
                97.8%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Meningkat dari 91.4% (fastp)
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                VARIAN LOLOS
              </div>
              <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
                128
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Dari 162 kandidat mentah
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                GEN TERDAMPAK
              </div>
              <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
                51
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                89 SNP &middot; 39 INDEL
              </div>
            </div>
          </div>

          {/* SnpEff Functional Impact Distribution */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Distribusi Dampak Fungsional (SnpEff)</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              {[
                { name: 'HIGH IMPACT', count: 19, pct: '14.8%', color: 'bg-rose-500', text: 'text-rose-600' },
                { name: 'MODERATE IMPACT', count: 62, pct: '48.4%', color: 'bg-amber-400', text: 'text-amber-600' },
                { name: 'LOW IMPACT', count: 33, pct: '25.8%', color: 'bg-blue-600', text: 'text-blue-600' },
                { name: 'MODIFIER', count: 14, pct: '10.9%', color: 'bg-slate-400', text: 'text-slate-600' },
              ].map((imp) => (
                <div key={imp.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${imp.text}`}>{imp.name}</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {imp.count} varian ({imp.pct})
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${imp.color} rounded-full`}
                      style={{ width: imp.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIG & FILES */}
      {activeTab === 'config' && (
        <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Konfigurasi Pipeline Variant Calling</span>
            </h3>
            <p className="text-slate-500">
              Parameter yang digunakan saat eksekusi pipeline bioinformatika.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">ALIGNER</span>
              <div className="text-sm font-bold text-slate-900">BWA-MEM</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">VARIANT CALLER</span>
              <div className="text-sm font-bold text-slate-900">GATK HaplotypeCaller / BCFtools</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">ANNOTATION</span>
              <div className="text-sm font-bold text-slate-900">SnpEff v5.1d</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">MIN QUALITY</span>
              <div className="text-sm font-bold text-slate-900">30 phred</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">MIN DEPTH</span>
              <div className="text-sm font-bold text-slate-900">10x</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">PLOIDY</span>
              <div className="text-sm font-bold text-slate-900">1 (Haploid E. coli)</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TERMINAL LOGS */}
      {activeTab === 'logs' && (
        <div className="border border-slate-200 rounded-xl overflow-hidden font-mono shadow-sm bg-slate-950 text-slate-200">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">Log Eksekusi Terminal MutaTrack</span>
            </div>
            <button
              onClick={handleCopyLog}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition cursor-pointer"
            >
              {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLog ? 'Tersalin' : 'Salin Log'}</span>
            </button>
          </div>
          <div className="p-4 max-h-[480px] overflow-y-auto text-xs space-y-1 leading-relaxed">
            {currentDisplayLog.split('\n').map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith('$ ')
                    ? 'text-yellow-300 font-bold'
                    : line.startsWith('[info]')
                    ? 'text-blue-400'
                    : line.startsWith('[error]')
                    ? 'text-rose-400 font-bold'
                    : 'text-slate-300'
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
