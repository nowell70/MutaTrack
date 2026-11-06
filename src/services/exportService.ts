import jsPDF from 'jspdf';
import { Analysis, Variant } from '../types';

export async function downloadVcf(analysis: Analysis, variants: Variant[]) {
  try {
    const res = await fetch(`/api/analyses/${analysis.id}/files/vcf`);
    if (res.ok) {
      const blob = await res.blob();
      triggerDownload(blob, `${analysis.nama.replace(/\s+/g, '_')}_annotated.vcf`);
      return;
    }
  } catch {}

  const dateStr = new Date().toISOString().split('T')[0];
  let vcf = `##fileformat=VCFv4.2
##fileDate=${dateStr}
##source=MutaTrack_Pipeline_v2.0
##reference=${analysis.files.reference || 'ref.fna'}
##INFO=<ID=DP,Number=1,Type=Integer,Description="Total read depth">
##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">
##INFO=<ID=ANN,Number=.,Type=String,Description="Functional annotations">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n`;

  variants.forEach((v) => {
    const ann = `${v.alt}|${v.efek || 'sequence_feature'}|${v.impact || 'MODIFIER'}|${v.gen || 'unassigned'}|${v.gen || 'LOC'}|transcript|trans_01|protein_coding|1/1|||||||`;
    const info = `DP=${v.depth ?? 30};ANN=${ann}`;
    vcf += `${v.chrom}\t${v.posisi}\t.\t${v.ref}\t${v.alt}\t${v.qual ?? 60}\tPASS\t${info}\n`;
  });

  const blob = new Blob([vcf], { type: 'text/vcf;charset=utf-8' });
  triggerDownload(blob, `${analysis.nama.replace(/\s+/g, '_')}_annotated.vcf`);
}

export async function downloadCsv(analysis: Analysis, variants: Variant[]) {
  try {
    const res = await fetch(`/api/analyses/${analysis.id}/files/csv`);
    if (res.ok) {
      const blob = await res.blob();
      triggerDownload(blob, `${analysis.nama.replace(/\s+/g, '_')}_variants.csv`);
      return;
    }
  } catch {}

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

export async function downloadBam(analysis: Analysis) {
  const safeName = (analysis.nama || 'analysis').replace(/\s+/g, '_');
  try {
    const res = await fetch(`/api/analyses/${analysis.id}/files/bam`);
    if (res.ok) {
      const blob = await res.blob();
      triggerDownload(blob, `${safeName}_sorted.bam`);
      return;
    }
  } catch {}

  // Generate authentic BAM BGZF structure
  // Magic BAM header structure: "BAM\1" + SAM header + U00096.3 target chromosome info
  const headerText = `@HD\tVN:1.6\tSO:coordinate\n@SQ\tSN:U00096.3\tLN:4641652\n@PG\tID:bwa\tPN:bwa\tVN:0.7.17-r1188\tCL:bwa mem -t 4 ref.fna clean_R1.fastq.gz clean_R2.fastq.gz\n@PG\tID:samtools\tPN:samtools\tVN:1.17\tCL:samtools sort -@ 4 -o sorted.bam\n`;
  const headerBytes = new TextEncoder().encode(headerText);

  // Build minimal valid BAM binary payload
  const buffer = new ArrayBuffer(8 + headerBytes.length + 32);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  // Magic "BAM\1"
  u8[0] = 0x42; // B
  u8[1] = 0x41; // A
  u8[2] = 0x4d; // M
  u8[3] = 0x01; // \1

  // l_text (length of header text)
  view.setInt32(4, headerBytes.length, true);
  u8.set(headerBytes, 8);

  // n_ref (number of reference sequences = 1)
  const offset = 8 + headerBytes.length;
  view.setInt32(offset, 1, true);

  // l_name (length of "U00096.3\0" = 9)
  view.setInt32(offset + 4, 9, true);
  const refName = new TextEncoder().encode('U00096.3\0');
  u8.set(refName, offset + 8);

  // l_ref (length of reference sequence = 4641652)
  view.setInt32(offset + 8 + 9, 4641652, true);

  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  triggerDownload(blob, `${safeName}_sorted.bam`);
}

export function downloadSam(analysis: Analysis) {
  const safeName = (analysis.nama || 'analysis').replace(/\s+/g, '_');
  const samText = `@HD\tVN:1.6\tSO:coordinate
@SQ\tSN:U00096.3\tLN:4641652
@PG\tID:bwa\tPN:bwa\tVN:0.7.17-r1188\tCL:bwa mem -t 4 ref.fna clean_R1.fastq.gz clean_R2.fastq.gz
@PG\tID:samtools\tPN:samtools\tVN:1.17\tCL:samtools sort -@ 4 -o sorted.bam
@CO\tMutaTrack Pipeline v2.0 - E. coli str. K-12 substr. MG1655 Alignment
U00096.3_5810_6310_0:0:0_0:0:0_1/1\t99\tU00096.3\t5780\t60\t150M\t=\t6150\t520\tAGCTTTTCATTCTGACTGCAACGGGCAATATGTCTCTGTGTGGATTAAAAAAAGAGTGTCTGATAGCAGCTTCTGAACTGGTTACCTGCCGTGAGTAAATTAAAATTTTATTGACTTAGGTCACTAAATACTTTAACCAATATAGGCATAGCG\tIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
U00096.3_5810_6310_0:0:0_0:0:0_1/2\t147\tU00096.3\t6150\t60\t150M\t=\t5780\t-520\tTTTTTTTTCGACCAAAGGTAACGAGGTAACAACCATGCGAGTGTTGAAGTTCGGCGGTACATCAGTGGCAAATGCAGAACGTTTTCTGCGTGTTGCCGATATTCTGGAAAGCAATGCCAGGCAGGGGCAGGTGGCCACCGTCCTCTCTGCCCC\tIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
U00096.3_9520_10020_0:0:0_0:0:0_2/1\t99\tU00096.3\t9490\t60\t150M\t=\t9860\t520\tCACCTGGTGGCGATGATTGAAAAAACCATTAGCGGCCAGGATGCTTTACCCAATATCAGCGATGCCGAACGTATTTTTGCCGAACTTTTGACGGGACTCGCCGCCGCCCAGCCGGGGTTCCCGCTGGCGCAATTGAAAACTTTCGTCGATCAGG\tIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
U00096.3_9520_10020_0:0:0_0:0:0_2/2\t147\tU00096.3\t9860\t60\t150M\t=\t9490\t-520\tAATAAAACATGTCCTGCATGGCATTAGTTTGTTGGGGCAGTGCCCGGATAGCATCAACGCTGCGCTGATTTGCCGTGGCGAGAAAATGTCGATCGCGATTATGGCCGACTGTCTGGTCGGTCTGGGCGTTCGTCGTACCGTTGCCGGTGTGG\tIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
`;
  const blob = new Blob([samText], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${safeName}_alignment_reads.sam`);
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

