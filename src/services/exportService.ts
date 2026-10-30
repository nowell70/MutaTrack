import jsPDF from 'jspdf';
import { Analysis, Variant } from '../types';

export function downloadVcf(analysis: Analysis, variants: Variant[]) {
  const dateStr = new Date().toISOString().split('T')[0];
  let vcf = `##fileformat=VCFv4.2
##fileDate=${dateStr}
##source=MutaTrack_Pipeline_v1.0
##reference=${analysis.files.reference || 'genome.fna'}
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

export function downloadPdf(analysis: Analysis, variants: Variant[]) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  const checkPage = (dy: number) => {
    if (y + dy > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('Laporan Analisis MutaTrack', 14, y);
  y += 8;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Platform Bioinformatika untuk Analisis Variant Calling DNA', 14, y);
  y += 10;

  // Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('Helvetica', 'bold');
  doc.text(`Nama Analisis: ${analysis.nama}`, 20, y + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`ID Analisis: ${analysis.id}`, 20, y + 15);
  doc.text(`Waktu Analisis: ${new Date(analysis.created_at).toLocaleString('id-ID')}`, 20, y + 21);
  doc.text(`Status: ${analysis.status.toUpperCase()} | Tahap: ${analysis.stage || '-'}`, 20, y + 27);
  y += 42;

  // Statistics Summary
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Ringkasan Pipeline & Metrik Kualitas', 14, y);
  y += 8;

  const s = analysis.stats || {};
  const tr = s.trimming;
  const al = s.alignment;
  const an = s.annotation;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  if (tr) {
    doc.text(`• Pemrosesan Sekuens (fastp): ${tr.reads_sebelum.toLocaleString()} reads -> ${tr.reads_sesudah.toLocaleString()} reads | Q30: ${tr.q30_sebelum}% -> ${tr.q30_sesudah}%`, 18, y);
    y += 6;
  }
  if (al) {
    doc.text(`• Alignment (BWA-MEM): Total ${al.total_reads.toLocaleString()} reads | Terpetakan: ${al.terpetakan.toLocaleString()} (${al.persen_terpetakan}%)`, 18, y);
    y += 6;
  }
  if (s.variant_calling && s.filtering) {
    doc.text(`• Variant Calling & Filtering: ${s.variant_calling.varian_mentah} kandidat awal -> ${s.filtering.varian_lolos} varian lolos filter (QUAL>=${analysis.config.min_qual}, DP>=${analysis.config.min_depth})`, 18, y);
    y += 6;
  }
  if (an) {
    doc.text(`• Anotasi Fungsional (SnpEff): ${an.total_varian} total varian (${an.snp} SNP, ${an.indel} INDEL), ${an.gen_terdampak} gen terdampak`, 18, y);
    y += 6;
    const impactSummary = Object.entries(an.per_impact || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    doc.text(`  Dampak Fungsional: ${impactSummary}`, 18, y);
    y += 8;
  }

  y += 4;
  checkPage(30);

  // Variant Table
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Daftar Varian Genetik (Maks. 100 varian)`, 14, y);
  y += 6;

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Kromosom', 16, y + 5);
  doc.text('Posisi', 46, y + 5);
  doc.text('Ref>Alt', 72, y + 5);
  doc.text('Tipe', 96, y + 5);
  doc.text('Gen', 114, y + 5);
  doc.text('Efek Fungsional', 134, y + 5);
  doc.text('Dampak', 174, y + 5);
  y += 7;

  // Table rows
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  const sampleRows = variants.slice(0, 100);

  sampleRows.forEach((v, index) => {
    checkPage(6);
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 6, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.text(String(v.chrom).substring(0, 14), 16, y + 4.2);
    doc.text(String(v.posisi), 46, y + 4.2);
    doc.text(`${v.ref}>${v.alt}`, 72, y + 4.2);
    doc.text(v.tipe, 96, y + 4.2);
    doc.text(v.gen || '-', 114, y + 4.2);
    doc.text(String(v.efek || '-').substring(0, 22), 134, y + 4.2);

    // Color code impact
    if (v.impact === 'HIGH') doc.setTextColor(225, 29, 72);
    else if (v.impact === 'MODERATE') doc.setTextColor(217, 119, 6);
    else if (v.impact === 'LOW') doc.setTextColor(37, 99, 235);
    else doc.setTextColor(100, 116, 139);

    doc.text(v.impact || '-', 174, y + 4.2);
    y += 6;
  });

  // Footer on current page
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Dihasilkan secara otomatis oleh MutaTrack - Bioinformatika IPB University', 14, pageHeight - 10);

  doc.save(`${analysis.nama.replace(/\s+/g, '_')}_laporan.pdf`);
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
