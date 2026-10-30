import React, { useMemo, useState } from 'react';
import { Variant, VariantImpact } from '../types';
import { Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet, FileCode } from 'lucide-react';

interface VariantTableProps {
  variants: Variant[];
  onDownloadVcf: () => void;
  onDownloadCsv: () => void;
  onDownloadPdf: () => void;
}

export const VariantTable: React.FC<VariantTableProps> = ({
  variants,
  onDownloadVcf,
  onDownloadCsv,
  onDownloadPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'posisi' | 'qual' | 'depth' | 'gen'>('posisi');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

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
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderImpactBadge = (impact: VariantImpact | null) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HIGH
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            MODERATE
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            MODIFIER
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari gen, posisi, efek..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Impact Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400">Dampak:</span>
            <select
              aria-label="Filter Berdasarkan Dampak Varian"
              value={selectedImpact}
              onChange={(e) => {
                setSelectedImpact(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Dampak</option>
              <option value="HIGH" className="bg-slate-900">HIGH (Tinggi)</option>
              <option value="MODERATE" className="bg-slate-900">MODERATE (Sedang)</option>
              <option value="LOW" className="bg-slate-900">LOW (Rendah)</option>
              <option value="MODIFIER" className="bg-slate-900">MODIFIER</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400">Tipe:</span>
            <select
              aria-label="Filter Berdasarkan Tipe Varian"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Tipe</option>
              <option value="SNP" className="bg-slate-900">SNP</option>
              <option value="INDEL" className="bg-slate-900">INDEL</option>
            </select>
          </div>

          {/* Exports */}
          <div className="flex items-center gap-1.5 ml-auto md:ml-2">
            <button
              onClick={onDownloadVcf}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Unduh Berkas VCF Teranotasi"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>VCF</span>
            </button>
            <button
              onClick={onDownloadCsv}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Unduh Tabel CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              title="Unduh Laporan PDF"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Kromosom</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('posisi')}>
                <div className="flex items-center gap-1">
                  <span>Posisi</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Ref &gt; Alt</th>
              <th className="py-3 px-4">Tipe</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('gen')}>
                <div className="flex items-center gap-1">
                  <span>Gen Terdampak</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Efek Fungsional</th>
              <th className="py-3 px-4">Dampak</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('qual')}>
                <div className="flex items-center gap-1">
                  <span>QUAL</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('depth')}>
                <div className="flex items-center gap-1">
                  <span>Depth (DP)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedVariants.length > 0 ? (
              paginatedVariants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-slate-300 font-sans">{v.chrom}</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-semibold">{v.posisi.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-slate-200">
                    <span className="text-slate-400">{v.ref}</span>
                    <span className="text-slate-500 mx-1">&gt;</span>
                    <span className="text-cyan-400 font-bold">{v.alt}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold ${
                        v.tipe === 'SNP'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {v.tipe}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-100">
                    {v.gen ? (
                      <span className="text-emerald-300 italic underline decoration-slate-700 underline-offset-2">
                        {v.gen}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-300 text-[11px]">
                    {v.efek || '-'}
                  </td>
                  <td className="py-2.5 px-4 font-sans">{renderImpactBadge(v.impact)}</td>
                  <td className="py-2.5 px-4 text-slate-300">{v.qual ? v.qual.toFixed(1) : '-'}</td>
                  <td className="py-2.5 px-4 text-slate-300">{v.depth ? `${v.depth}x` : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                  Tidak ada varian yang cocok dengan kriteria pencarian atau filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Menampilkan{' '}
          <span className="font-semibold text-slate-200">
            {filteredAndSortedVariants.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          -{' '}
          <span className="font-semibold text-slate-200">
            {Math.min(currentPage * pageSize, filteredAndSortedVariants.length)}
          </span>{' '}
          dari <span className="font-semibold text-slate-200">{filteredAndSortedVariants.length}</span> varian
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-slate-300">
            Halaman {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
