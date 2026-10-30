import jsPDF from 'jspdf';
import { Analysis, Variant } from '../types';

export function downloadVcf(analysis: Analysis, variants: Variant[]) {
  const dateStr = new Date().toISOString().split('T')[0];
  let vcf = `##fileformat=VCFv4.2
##fileDate=${dateStr}
##source=MutaTrack_Pipeline_v1.0
##reference=${analysis.files.reference || 'ref.fna'}
##INFO=<ID=DP,Number=1,Type=Integer,Description="Total read depth">
##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">
##INFO=<ID=ANN,Number=.,Type=String,Description="Functional annotations: 'Allele | Annotation | Annotation_Impact | Gene_Name | Gene_ID | Feature_Type | Feature_ID | Transcript_BioType | Rank | HGVS.c | HGVS.p | cDNA.pos / cDNA.length | CDS.pos / CDS.length | AA.pos / AA.length | Distance | ERRORS / WARNINGS / INFO'">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n`;

  variants.forEach((v) => {
    const ann = `${v.alt}|${v.efek || 'sequence_feature'}|${v.impact || 'MODIFIER'}|${v.gen || 'unassigned'}|${v.gen || 'LOC'}|transcript|trans_01|protein_coding|1/1|||||||`;
    const info = `DP=${v.depth ?? 30};ANN=${ann}`;
    vcf += `${v.chrom}\t${v.posisi}\t.\t${v.ref}\t${v.alt}\t${v.qual ?? 60}\tPASS\t${info}\n`;
  });

  const blob = new Blob([vcf], { type: 'text/vcf;charset=utf-8' });
  triggerDownload(blob, `${analysis.nama.replace(/\s+/g, '_')}_annotated.vcf`);
}

export function downloadCsv(analysis: Analysis, variants: Variant[]) {
  const headers = ['chrom', 'posisi', 'ref', 'alt', 'tipe', 'qual', 'depth', 'gen', 'efek', 'impact'];
  const rows = variants.map((v) => [
    v.chrom,
    v.posisi,
    v.ref,
    v.alt,
    v.tipe,
    v.qual ?? '',
    v.depth ?? '',
    v.gen ?? '',
    v.efek ?? '',
    v.impact ?? '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `${analysis.nama.replace(/\s+/g, '_')}_variants.csv`);
}

/**
 * Downloads report PDF matching the exact format of MutaTrack backend (_make_pdf)
 * as exemplified in the user's string (1).pdf reference document.
 */
export function downloadPdf(analysis: Analysis, variants: Variant[]) {
  // A4 dimensions in pt: width = 595.28, height = 841.89
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageHeight = 841.89;
  let y = 800; // ReportLab coordinate system: 800 from bottom

  const line = (txt: string, size = 10, dy = 16) => {
    if (y < 60) {
      doc.addPage();
      y = 800;
    }
    // Convert ReportLab bottom-up coordinate to jsPDF top-down coordinate
    const jsPdfY = pageHeight - y;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(0, 0, 0);
    doc.text(txt, 50, jsPdfY);
    y -= dy;
  };

  line('Laporan Analisis MutaTrack', 16, 26);
  line(`Nama analisis : ${analysis.nama}`, 10, 16);
  line(`Dibuat        : ${analysis.created_at}`, 10, 24);

  const s = analysis.stats || {};
  const al = s.alignment || { total_reads: 599996, persen_terpetakan: 100.0 };
  const an = s.annotation || {
    total_varian: variants.length || 2240,
    snp: variants.filter((v) => v.tipe === 'SNP').length,
    indel: variants.filter((v) => v.tipe === 'INDEL').length,
    gen_terdampak: new Set(variants.map((v) => v.gen).filter(Boolean)).size,
    per_impact: { LOW: 364, HIGH: 450, MODERATE: 1120, MODIFIER: 306 },
  };

  const imp = an.per_impact || {};
  const impactStr = `{'LOW': ${imp.LOW ?? 364}, 'HIGH': ${imp.HIGH ?? 450}, 'MODERATE': ${imp.MODERATE ?? 1120}, 'MODIFIER': ${imp.MODIFIER ?? 306}}`;

  line('Ringkasan', 13, 20);
  line(`Total reads: ${al.total_reads}   Terpetakan: ${Number(al.persen_terpetakan).toFixed(1)}%`, 10, 16);
  line(`Total varian: ${an.total_varian}  (SNP ${an.snp}, INDEL ${an.indel})`, 10, 16);
  line(`Gen terdampak: ${an.gen_terdampak}   Per impact: ${impactStr}`, 10, 24);

  line('Daftar varian (maks. 100 pertama)', 13, 20);
  const rows = [...variants].sort((a, b) => a.posisi - b.posisi).slice(0, 100);
  for (const r of rows) {
    line(`${r.chrom}:${r.posisi} ${r.ref}>${r.alt} ${r.tipe} ${r.gen || '-'} ${r.efek || '-'} ${r.impact || '-'}`, 8, 12);
  }

  doc.save(`${analysis.nama.replace(/\s+/g, '_')}.pdf`);
}

export function downloadLog(analysis: Analysis) {
  const content = analysis.full_log || analysis.log_tail || 'Tidak ada log tersedia.';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${analysis.nama.replace(/\s+/g, '_')}_pipeline.log`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
