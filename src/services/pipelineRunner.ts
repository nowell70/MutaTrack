import { Analysis, PipelineConfig, PipelineStage, STAGES, Variant } from '../types';
import { SAMPLE_VARIANTS } from './sampleData';
import { saveAnalysis, saveVariantsForAnalysis } from './storage';

export interface PipelineCallbacks {
  onStageChange: (stage: PipelineStage) => void;
  onLog: (line: string) => void;
  onProgress?: (progressPercent: number) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executePipeline(
  analysis: Analysis,
  callbacks: PipelineCallbacks,
  abortSignal?: { aborted: boolean }
): Promise<Analysis> {
  const { config, files, nama, id } = analysis;
  const r1 = files.r1 || 'sample_R1.fastq.gz';
  const r2 = files.r2;
  const ref = files.reference || 'reference_genome.fna';
  let fullLog = '';

  const emit = (text: string) => {
    fullLog += text + '\n';
    callbacks.onLog(text);
  };

  const isAborted = () => abortSignal && abortSignal.aborted;

  emit(`[MutaTrack Pipeline Runner] Inisialisasi pipeline variant calling untuk: "${nama}"`);
  emit(`Direktori kerja: /workspace/analyses/${id}`);
  emit(`Waktu mulai: ${new Date().toLocaleString('id-ID')}`);
  emit(`Konfigurasi: trim_quality=${config.trim_quality}, min_length=${config.min_length}, min_mapq=${config.min_mapq}, min_baseq=${config.min_baseq}, min_qual=${config.min_qual}, min_depth=${config.min_depth}`);
  emit('--------------------------------------------------------------------------------');

  try {
    // 1. QC (FastQC)
    callbacks.onStageChange('qc');
    callbacks.onProgress?.(10);
    emit('\n[Tahap 1/6: Kontrol Kualitas - FastQC]');
    const readsCmd = r2 ? `"${r1}" "${r2}"` : `"${r1}"`;
    emit(`$ fastqc -t 2 --outdir out/qc ${readsCmd}`);
    await sleep(900);
    if (isAborted()) throw new Error('Pipeline dibatalkan oleh pengguna.');
    emit(`Started analysis of ${r1}`);
    emit(`Approx 5% complete for ${r1}`);
    await sleep(700);
    emit(`Approx 50% complete for ${r1}`);
    emit(`Analysis complete for ${r1}`);
    if (r2) {
      await sleep(600);
      emit(`Started analysis of ${r2}`);
      emit(`Approx 50% complete for ${r2}`);
      emit(`Analysis complete for ${r2}`);
    }
    emit(`[FastQC] Laporan HTML dan berkas ZIP kualitas tersimpan di out/qc/`);

    // 2. Trimming (fastp)
    callbacks.onStageChange('trimming');
    callbacks.onProgress?.(28);
    emit('\n[Tahap 2/6: Pemrosesan Sekuens - fastp]');
    const fastpCmd = r2
      ? `fastp -i "${r1}" -I "${r2}" -o out/clean_R1.fastq.gz -O out/clean_R2.fastq.gz -q ${config.trim_quality} -l ${config.min_length} -w 2 -j out/fastp.json -h out/fastp.html`
      : `fastp -i "${r1}" -o out/clean_R1.fastq.gz -q ${config.trim_quality} -l ${config.min_length} -w 2 -j out/fastp.json -h out/fastp.html`;
    emit(`$ ${fastpCmd}`);
    await sleep(1000);
    if (isAborted()) throw new Error('Pipeline dibatalkan oleh pengguna.');

    const initialReads = 150000;
    // Calculate realistic drop based on quality threshold
    const dropFactor = Math.min(0.08, 0.005 + (config.trim_quality - 15) * 0.003);
    const cleanedReads = Math.round(initialReads * (1 - dropFactor));
    const q30Before = 91.2;
    const q30After = Math.min(99.4, 95.0 + (config.trim_quality * 0.15));

    emit(`Read1 before filtering: total reads: ${initialReads}, total bases: ${initialReads * 150}, Q30 bases: ${q30Before}%`);
    if (r2) {
      emit(`Read2 before filtering: total reads: ${initialReads}, total bases: ${initialReads * 150}, Q30 bases: ${(q30Before - 0.5).toFixed(1)}%`);
    }
    emit(`Read1 after filtering: total reads: ${cleanedReads}, total bases: ${cleanedReads * 148}, Q30 bases: ${q30After.toFixed(1)}%`);
    emit(`Filtering result: reads passed filter: ${cleanedReads * (r2 ? 2 : 1)} (${((cleanedReads / initialReads) * 100).toFixed(1)}%), adapter trimmed`);

    const trimmingStats = {
      reads_sebelum: initialReads,
      reads_sesudah: cleanedReads,
      q30_sebelum: q30Before,
      q30_sesudah: Number(q30After.toFixed(2)),
    };

    // 3. Alignment (BWA + SAMtools)
    callbacks.onStageChange('alignment');
    callbacks.onProgress?.(48);
    emit('\n[Tahap 3/6: Alignment Genom - BWA-MEM & SAMtools]');
    emit(`$ bwa index "${ref}"`);
    await sleep(800);
    if (isAborted()) throw new Error('Pipeline dibatalkan oleh pengguna.');
    emit(`[bwa_index] Pack FASTA... 0.04 sec`);
    emit(`[bwa_index] BWT construct for 4641652 bp... 1.12 sec`);
    emit(`[bwa_index] Update BWT... 0.03 sec`);
    emit(`[bwa_index] Construct SA from BWT and Occ... 0.42 sec`);

    emit(`$ bwa mem -t 2 -R '@RG\\tID:s1\\tSM:s1\\tPL:ILLUMINA' "${ref}" out/clean_R1.fastq.gz ${r2 ? 'out/clean_R2.fastq.gz ' : ''}| samtools sort -@ 2 -o out/sorted.bam -`);
    await sleep(1200);
    if (isAborted()) throw new Error('Pipeline dibatalkan oleh pengguna.');
    const totalReadsAligned = cleanedReads * (r2 ? 2 : 1);
    const mappedReads = Math.round(totalReadsAligned * 0.988);
    const unmappedReads = totalReadsAligned - mappedReads;
    const mappedPct = Number(((mappedReads / totalReadsAligned) * 100).toFixed(2));

    emit(`[M::mem_process_seqs] Processed ${totalReadsAligned} reads in 7.824 CPU sec`);
    emit(`$ samtools index out/sorted.bam`);
    emit(`$ samtools flagstat out/sorted.bam > out/flagstat.txt`);
    await sleep(600);
    emit(`${totalReadsAligned} + 0 in total (QC-passed reads + QC-failed reads)`);
    emit(`${mappedReads} + 0 mapped (${mappedPct}% : N/A)`);

    const alignmentStats = {
      total_reads: totalReadsAligned,
      terpetakan: mappedReads,
      tidak_terpetakan: unmappedReads,
      persen_terpetakan: mappedPct,
    };

    // 4. Variant Calling (BCFtools)
    callbacks.onStageChange('variant_calling');
    callbacks.onProgress?.(68);
    emit('\n[Tahap 4/6: Variant Calling - BCFtools mpileup & call (haploid)]');
    emit(`$ bcftools mpileup -f "${ref}" -q ${config.min_mapq} -Q ${config.min_baseq} -a FORMAT/AD -Ou out/sorted.bam | bcftools call -mv --ploidy 1 -Ov -o out/raw.vcf`);
    await sleep(1100);
    if (isAborted()) throw new Error('Pipeline dibatalkan oleh pengguna.');

    const rawVariantsCount = Math.max(22, 28 - Math.floor((config.min_mapq - 20) / 2));
    emit(`[mpileup] 1 samples in 1 input files`);
    emit(`[mpileup] maximum number of reads per input file set to -d 250`);
    emit(`[bcftools] Teridentifikasi ${rawVariantsCount} kandidat varian mentah pada kromosom NC_000913.3.`);

    const variantCallingStats = {
      varian_mentah: rawVariantsCount,
    };

    // 5. Filtering (BCFtools filter)
    callbacks.onStageChange('filtering');
    callbacks.onProgress?.(82);
    emit('\n[Tahap 5/6: Penyaringan Kualitas Varian - BCFtools filter]');
    emit(`$ bcftools filter -i 'QUAL>=${config.min_qual} && INFO/DP>=${config.min_depth}' -Ov -o out/filtered.vcf out/raw.vcf`);
    await sleep(900);
    if (isAborted()) throw new Error('Pipeline dibatalkan oleh pengguna.');

    // Filtered variants from SAMPLE_VARIANTS based on config thresholds
    const filteredVariants = SAMPLE_VARIANTS.filter(
      (v) => (v.qual === null || v.qual >= config.min_qual) && (v.depth === null || v.depth >= config.min_depth)
    );
    const passedCount = filteredVariants.length;
    emit(`[bcftools filter] Varian lolos kriteria: ${passedCount} varian (QUAL >= ${config.min_qual}, DP >= ${config.min_depth}).`);
    emit(`[bcftools filter] Varian gugur: ${rawVariantsCount - passedCount} varian.`);

    const filteringStats = {
      varian_lolos: passedCount,
    };

    // 6. Annotation (SnpEff)
    callbacks.onStageChange('annotation');
    callbacks.onProgress?.(95);
    emit('\n[Tahap 6/6: Anotasi Fungsional Varian - SnpEff]');
    emit(`$ snpEff -Xmx2g -v GCF_000005845.2 out/filtered.vcf > out/annotated.vcf 2> out/annotated.err`);
    await sleep(1200);
    if (isAborted()) throw new Error('Pipeline dibatalkan oleh pengguna.');

    emit(`00:00:00 SnpEff version SnpEff 5.1d (build 2024)`);
    emit(`00:00:01 Membaca genom dan indeks gen untuk 'GCF_000005845.2'...`);
    emit(`00:00:03 Anotasi fungsional ${passedCount} varian selesai.`);

    const snpCount = filteredVariants.filter((v) => v.tipe === 'SNP').length;
    const indelCount = filteredVariants.filter((v) => v.tipe === 'INDEL').length;
    const affectedGenesSet = new Set(filteredVariants.map((v) => v.gen).filter(Boolean));

    const impactCounts: Record<string, number> = {
      HIGH: 0,
      MODERATE: 0,
      LOW: 0,
      MODIFIER: 0,
    };
    const effectCounts: Record<string, number> = {};

    filteredVariants.forEach((v) => {
      if (v.impact) impactCounts[v.impact] = (impactCounts[v.impact] || 0) + 1;
      if (v.efek) effectCounts[v.efek] = (effectCounts[v.efek] || 0) + 1;
    });

    const annotationStats = {
      total_varian: passedCount,
      snp: snpCount,
      indel: indelCount,
      gen_terdampak: affectedGenesSet.size,
      per_impact: impactCounts,
      per_efek: effectCounts,
      tidak_teranotasi: 0,
    };

    const finalStats = {
      trimming: trimmingStats,
      alignment: alignmentStats,
      variant_calling: variantCallingStats,
      filtering: filteringStats,
      annotation: annotationStats,
    };

    emit('\n--------------------------------------------------------------------------------');
    emit(`[info] Anotasi SnpEff selesai: ${passedCount} varian berhasil dikarakterisasi.`);
    emit(`[info] Ringkasan: ${snpCount} SNP, ${indelCount} INDEL, ${affectedGenesSet.size} gen terdampak.`);
    emit(`[info] Menulis berkas keluaran VCF dan memperbarui basis data.`);
    emit('Pipeline variant calling selesai secara normal.');

    callbacks.onProgress?.(100);

    // Save variants
    saveVariantsForAnalysis(id, filteredVariants);

    const updatedAnalysis: Analysis = {
      ...analysis,
      status: 'selesai',
      stage: 'annotation',
      stats: finalStats,
      error: null,
      full_log: fullLog,
      log_tail: fullLog.split('\n').slice(-30).join('\n'),
      updated_at: new Date().toISOString(),
    };

    saveAnalysis(updatedAnalysis);
    return updatedAnalysis;
  } catch (err: any) {
    const errorMsg = err.message || 'Kesalahan dalam eksekusi pipeline.';
    emit(`\n[FATAL ERROR] ${errorMsg}`);
    const failedAnalysis: Analysis = {
      ...analysis,
      status: 'gagal',
      error: errorMsg,
      full_log: fullLog,
      log_tail: fullLog.split('\n').slice(-30).join('\n'),
      updated_at: new Date().toISOString(),
    };
    saveAnalysis(failedAnalysis);
    throw err;
  }
}
