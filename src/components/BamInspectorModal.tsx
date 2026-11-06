import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Info,
  BookOpen,
  Terminal,
  Activity,
  Table as TableIcon,
} from 'lucide-react';
import {
  BAM_HEADER,
  FLAGSTAT_OUTPUT,
  SAMPLE_SAM_RECORDS,
  SamRecord,
} from '../services/reportData';

interface BamInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  analysisName: string;
  onDownloadBam: () => void;
}

type TabType = 'guide' | 'header' | 'flagstat' | 'records';

export const BamInspectorModal: React.FC<BamInspectorModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  analysisName,
  onDownloadBam,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadSamText = () => {
    const samContent = `${BAM_HEADER}\n${SAMPLE_SAM_RECORDS.map(
      (r) =>
        `${r.qname}\t${r.flag}\t${r.rname}\t${r.pos}\t${r.mapq}\t${r.cigar}\t${r.rnext}\t${r.pnext}\t${r.tlen}\t${r.seq}\t${r.qual}`
    ).join('\n')}`;

    const blob = new Blob([samContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MutaTrack_${analysisId}_alignment_readable.sam`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredRecords = SAMPLE_SAM_RECORDS.filter(
    (r) =>
      r.qname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.seq.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pos.toString().includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Inspeksi & Visualisasi Berkas Alignment BAM / SAM
                </h2>
                <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  BWA-MEM + SAMtools
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Analisis: <span className="font-semibold text-slate-700">{analysisName}</span> (ID: {analysisId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadBam}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              title="Unduh berkas biner BAM (.bam) untuk IGV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas BAM</span>
            </button>

            <button
              onClick={handleDownloadSamText}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              title="Unduh format teks SAM (.sam) yang dapat dibaca di editor teks biasa"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh Teks SAM</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              title="Tutup (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EXPLANATION CALLOUT: WHY BAM CANNOT BE DOUBLE CLICKED */}
        <div className="px-5 py-3 bg-blue-50/80 border-b border-blue-100 flex items-start gap-3 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Mengapa berkas BAM (.bam) tidak bisa dibuka langsung di komputer?</strong>
            <p className="mt-0.5 text-blue-800">
              Berkas BAM adalah berkas <strong>biner terkompresi BGZF</strong> (representasi biner efisien dari SAM) yang dirancang untuk mesin genomik. Sistem operasi Windows atau Mac tidak memiliki aplikasi bawaan untuk membukanya seperti PDF atau gambar. Anda dapat menginspeksi isi perataan di bawah ini, mengunduh format teks SAM, atau memvisualisasikannya di <strong>IGV (Integrative Genomics Viewer)</strong>.
            </p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panduan & Visualisasi IGV</span>
          </button>

          <button
            onClick={() => setActiveTab('flagstat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'flagstat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Statistik Flagstat (100% Mapped)</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'header'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Header BAM (@HD, @SQ, @PG)</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'records'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Pratinjau Read Perataan (SAM View)</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
          {/* TAB 1: GUIDE & IGV */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>Visualisasi Interaktif dengan IGV (Integrative Genomics Viewer)</span>
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  IGV adalah standar emas dalam dunia bioinformatika untuk melihat read DNA bertumpuk di atas kromosom referensi, melihat varian SNP/INDEL secara visual, serta memeriksa kedalaman (depth of coverage).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-2">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Unduh BAM & Indeks</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Klik tombol <strong>"Unduh Berkas BAM"</strong> di pojok kanan atas untuk menyimpan berkas <code className="bg-slate-200 px-1 rounded">sorted.bam</code>.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-2">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Buka IGV Web</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Buka aplikasi web gratis IGV di peramban tanpa perlu instalasi aplikasi desktop.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-2">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Muat Berkas Genom & BAM</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pilih menu <em>Genome &gt; Local File</em> (masukkan <code className="bg-slate-200 px-1 rounded">ref.fna</code>), lalu <em>Tracks &gt; Local File</em> (masukkan <code className="bg-slate-200 px-1 rounded">sorted.bam</code>).
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://igv.org/app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition"
                  >
                    <span>Luncurkan IGV Web App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={handleDownloadSamText}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition cursor-pointer"
                  >
                    <span>Unduh Versi Teks SAM (.sam) untuk Dibaca di Notepad</span>
                  </button>
                </div>
              </div>

              {/* FORMAT COMPARISON */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900">Format Biner: BAM (.bam)</h4>
                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                      Biner / BGZF
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Ukuran berkas 70% lebih kecil dibanding teks SAM.</li>
                    <li>Mendukung pengindeksan cepat (<code className="text-slate-800">.bai</code>) untuk pencarian posisi acak.</li>
                    <li>Format standar yang diterima oleh BCFtools, GATK, dan IGV.</li>
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900">Format Teks: SAM (.sam)</h4>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                      Teks ASCII (Tab-separated)
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Dapat langsung dibuka dan dibaca di text editor (VS Code, Notepad, Vim).</li>
                    <li>Berisi 11 kolom wajib perataan sekuens dan string CIGAR.</li>
                    <li>Sangat berguna untuk inspeksi cepat dan debugging perataan.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLAGSTAT */}
          {activeTab === 'flagstat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">TOTAL READS</span>
                  <div className="text-lg font-bold text-slate-900">599,996</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">QC Passed Reads</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">TERPETAKAN (MAPPED)</span>
                  <div className="text-lg font-bold text-emerald-600">100.00%</div>
                  <span className="text-[10px] text-slate-500">599,996 / 599,996</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PROPERLY PAIRED</span>
                  <div className="text-lg font-bold text-blue-600">99.82%</div>
                  <span className="text-[10px] text-slate-500">598,920 reads</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DUPLICATES</span>
                  <div className="text-lg font-bold text-slate-900">0</div>
                  <span className="text-[10px] text-slate-500">0.00% duplikasi</span>
                </div>
              </div>

              <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-slate-400 text-[11px] font-semibold">$ samtools flagstat sorted.bam</span>
                  <button
                    onClick={() => handleCopy(FLAGSTAT_OUTPUT, 'flagstat')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  >
                    {copiedText === 'flagstat' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'flagstat' ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-300">
                  {FLAGSTAT_OUTPUT}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: HEADER */}
          {activeTab === 'header' && (
            <div className="space-y-4">
              <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-semibold">$ samtools view -H sorted.bam</span>
                    <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded">SAM/BAM Header</span>
                  </div>
                  <button
                    onClick={() => handleCopy(BAM_HEADER, 'header')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  >
                    {copiedText === 'header' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'header' ? 'Tersalin!' : 'Salin Header'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-300">
                  {BAM_HEADER}
                </pre>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Penjelasan Komponen Header:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                    <span className="font-mono font-bold text-indigo-600">@HD VN:1.6 SO:coordinate</span>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      Versi spesifikasi format SAM 1.6 dan berkas telah diurutkan berdasarkan koordinat kromosom (<code className="text-slate-800">coordinate sorted</code>).
                    </p>
                  </div>
                  <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                    <span className="font-mono font-bold text-indigo-600">@SQ SN:U00096.3 LN:4641652</span>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      Urutan sekuens referensi: genom lengkap <em>E. coli K-12 MG1655</em> dengan panjang total <strong>4.641.652 basa</strong>.
                    </p>
                  </div>
                  <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                    <span className="font-mono font-bold text-indigo-600">@PG ID:bwa VN:0.7.17</span>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      Program perataan yang digunakan adalah BWA-MEM v0.7.17 dengan opsi multi-threading.
                    </p>
                  </div>
                  <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50">
                    <span className="font-mono font-bold text-indigo-600">@PG ID:samtools VN:1.17</span>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      Pengurutan dan kompresi indeks diproses melalui SAMtools v1.17.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAM RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Cari berdasarkan ID read, sekuens, atau posisi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 font-mono">
                  Menampilkan {filteredRecords.length} record SAM
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">QNAME (Read ID)</th>
                        <th className="py-2.5 px-3 font-semibold">FLAG</th>
                        <th className="py-2.5 px-3 font-semibold">POS</th>
                        <th className="py-2.5 px-3 font-semibold">MAPQ</th>
                        <th className="py-2.5 px-3 font-semibold">CIGAR</th>
                        <th className="py-2.5 px-3 font-semibold">TLEN</th>
                        <th className="py-2.5 px-3 font-semibold">SEKUENS (150 bp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-bold text-slate-900 truncate max-w-[180px]">
                            {r.qname}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700"
                              title={r.flagMeaning}
                            >
                              {r.flag}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-blue-600">
                            {r.pos.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">
                            {r.mapq}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-700">
                            {r.cigar}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {r.tlen} bp
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-[240px]">
                            {r.seq}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            Format berkas: <strong>BAM (BGZF binary)</strong> &amp; <strong>SAM (Tab-delimited text)</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSamText}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Unduh Versi Teks .SAM
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={onDownloadBam}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Unduh Versi Biner .BAM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
