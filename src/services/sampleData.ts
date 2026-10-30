import { Analysis, Variant } from '../types';

// Generate 128 benchmark variants matching Screenshot 9 (89 SNP, 39 INDEL, 51 gen terpengaruh)
const GENES = [
  'gyrA', 'rpoB', 'katG', 'ampC', 'fabI', 'dnaA', 'lacZ', 'recA', 'rpsL', 'marR',
  'ftsZ', 'aceE', 'gltA', 'sdhA', 'fumA', 'mdh', 'crp', 'cyaA', 'ompF', 'ompC',
  'tolC', 'acrA', 'acrB', 'envZ', 'cpxA', 'cpxR', 'phoA', 'phoB', 'metE', 'cysK',
  'ilvD', 'leuA', 'trpA', 'hisA', 'argA', 'proA', 'purA', 'pyrB', 'thyA', 'folA',
  'dfrA', 'murA', 'pbpA', 'ftsI', 'dnaK', 'groEL', 'clpB', 'lon', 'rpoS', 'relA', 'spoT'
];

const EFFECTS: Record<string, { type: 'SNP' | 'INDEL'; impact: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER' }[]> = {
  HIGH: [
    { type: 'SNP', impact: 'HIGH' }, // stop_gained
    { type: 'INDEL', impact: 'HIGH' }, // frameshift_variant
  ],
  MODERATE: [
    { type: 'SNP', impact: 'MODERATE' }, // missense_variant
    { type: 'INDEL', impact: 'MODERATE' }, // inframe_deletion
    { type: 'INDEL', impact: 'MODERATE' }, // inframe_insertion
  ],
  LOW: [
    { type: 'SNP', impact: 'LOW' }, // synonymous_variant
  ],
  MODIFIER: [
    { type: 'SNP', impact: 'MODIFIER' }, // upstream_gene_variant
    { type: 'INDEL', impact: 'MODIFIER' }, // intergenic_variant
  ],
};

function generate128Variants(): Omit<Variant, 'id' | 'analysis_id'>[] {
  const list: Omit<Variant, 'id' | 'analysis_id'>[] = [];
  let currentPos = 120500;
  
  // We need exactly 89 SNPs and 39 INDELs = 128 total
  const nucleotides = ['A', 'C', 'G', 'T'];

  for (let i = 0; i < 128; i++) {
    const isIndel = i < 39; // 39 INDELs
    const tipe: 'SNP' | 'INDEL' = isIndel ? 'INDEL' : 'SNP';
    
    currentPos += Math.floor(Math.random() * 35000) + 1200;
    const gene = GENES[i % GENES.length];

    let ref = nucleotides[Math.floor(Math.random() * 4)];
    let alt = nucleotides.filter((n) => n !== ref)[Math.floor(Math.random() * 3)];

    let efek = 'missense_variant';
    let impact: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER' = 'MODERATE';

    if (tipe === 'INDEL') {
      if (i % 3 === 0) {
        ref = ref + nucleotides[Math.floor(Math.random() * 4)];
        alt = ref[0];
        efek = 'frameshift_variant';
        impact = 'HIGH';
      } else if (i % 3 === 1) {
        alt = ref + nucleotides[Math.floor(Math.random() * 4)] + nucleotides[Math.floor(Math.random() * 4)];
        efek = 'inframe_insertion';
        impact = 'MODERATE';
      } else {
        ref = ref + nucleotides[Math.floor(Math.random() * 4)] + nucleotides[Math.floor(Math.random() * 4)];
        alt = ref[0];
        efek = 'inframe_deletion';
        impact = 'MODERATE';
      }
    } else {
      // SNP
      if (i % 10 === 0) {
        efek = 'stop_gained';
        impact = 'HIGH';
      } else if (i % 3 === 0) {
        efek = 'synonymous_variant';
        impact = 'LOW';
      } else if (i % 7 === 0) {
        efek = 'upstream_gene_variant';
        impact = 'MODIFIER';
      } else {
        efek = 'missense_variant';
        impact = 'MODERATE';
      }
    }

    const qual = Number((Math.random() * 180 + 35).toFixed(1));
    const depth = Math.floor(Math.random() * 65 + 15);

    list.push({
      chrom: 'NC_000913.3',
      posisi: currentPos,
      ref,
      alt,
      tipe,
      qual,
      depth,
      gen: gene,
      efek,
      impact,
    });
  }

  return list.sort((a, b) => a.posisi - b.posisi);
}

export const SAMPLE_VARIANTS = generate128Variants();

export const INITIAL_ANALYSIS: Analysis = {
  id: 'ecoli-k12-benchmark',
  user_id: 'user-default-1',
  nama: 'E. coli K-12 MG1655 — Contoh Analisis',
  organisme: 'Escherichia coli',
  mode: 'paired',
  status: 'selesai',
  stage: 'annotation',
  created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
  updated_at: new Date(Date.now() - 86400000 * 11).toISOString(),
  config: {
    trim_quality: 20,
    min_length: 50,
    min_mapq: 20,
    min_baseq: 20,
    min_qual: 30,
    min_depth: 10,
    aligner: 'BWA-MEM',
    variant_caller: 'GATK HaplotypeCaller',
    annotation_tool: 'SnpEff',
  },
  files: {
    r1: 'ecoli_K12_R1.fastq.gz',
    r2: 'ecoli_K12_R2.fastq.gz',
    reference: 'ecoli_K12_MG1655.fasta',
    r1_size: 4820150,
    r2_size: 4791200,
    reference_size: 4641652,
  },
  stats: {
    trimming: {
      reads_sebelum: 150000,
      reads_sesudah: 147820,
      q30_sebelum: 91.4,
      q30_sesudah: 97.8,
    },
    alignment: {
      total_reads: 295640,
      terpetakan: 293955,
      tidak_terpetakan: 1685,
      persen_terpetakan: 99.43,
    },
    variant_calling: {
      varian_mentah: 162,
    },
    filtering: {
      varian_lolos: 128,
    },
    annotation: {
      total_varian: 128,
      snp: 89,
      indel: 39,
      gen_terdampak: 51,
      per_impact: {
        HIGH: 19,
        MODERATE: 62,
        LOW: 33,
        MODIFIER: 14,
      },
      per_efek: {
        missense_variant: 56,
        synonymous_variant: 33,
        frameshift_variant: 13,
        stop_gained: 6,
        inframe_deletion: 9,
        inframe_insertion: 6,
        upstream_gene_variant: 5,
      },
      tidak_teranotasi: 0,
    },
  },
  error: null,
  log_tail: `[info] Anotasi SnpEff selesai: 128 varian berhasil dianotasi.\n[info] Ringkasan: 89 SNP, 39 INDEL, 51 gen terpengaruh.\n[info] Menulis berkas keluaran VCF dan memperbarui basis data.\nPipeline variant calling selesai secara normal.`,
  full_log: `$ fastqc -t 2 --outdir /data/out/qc "ecoli_K12_R1.fastq.gz" "ecoli_K12_R2.fastq.gz"
Started analysis of ecoli_K12_R1.fastq.gz
Approx 5% complete for ecoli_K12_R1.fastq.gz
Approx 50% complete for ecoli_K12_R1.fastq.gz
Analysis complete for ecoli_K12_R1.fastq.gz
Started analysis of ecoli_K12_R2.fastq.gz
Analysis complete for ecoli_K12_R2.fastq.gz

$ fastp -i "ecoli_K12_R1.fastq.gz" -I "ecoli_K12_R2.fastq.gz" -o out/clean_R1.fastq.gz -O out/clean_R2.fastq.gz -q 20 -l 50 -w 2 -j out/fastp.json -h out/fastp.html
Read1 before filtering: total reads: 150000, total bases: 22500000, Q30 bases: 91.4%
Read2 before filtering: total reads: 150000, total bases: 22500000, Q30 bases: 90.9%
Read1 after filtering: total reads: 147820, total bases: 21980000, Q30 bases: 97.8%
Read2 after filtering: total reads: 147820, total bases: 21980000, Q30 bases: 97.4%
Filtering result: reads passed filter: 295640 (98.5%), reads failed: 4360 (1.5%)

$ bwa index "ecoli_K12_MG1655.fasta"
[bwa_index] Pack FASTA... 0.05 sec
[bwa_index] BWT construct for 4641652 bp... 1.20 sec
[bwa_index] Construct SA from BWT and Occ... 0.45 sec

$ bwa mem -t 2 -R '@RG\\tID:s1\\tSM:s1\\tPL:ILLUMINA' "ecoli_K12_MG1655.fasta" out/clean_R1.fastq.gz out/clean_R2.fastq.gz | samtools sort -@ 2 -o out/sorted.bam -
[M::process] read 295640 sequences (43960000 bp)...
[samtools sort] merging sorted blocks...

$ samtools flagstat out/sorted.bam
295640 + 0 in total (QC-passed reads + QC-failed reads)
293955 + 0 mapped (99.43% : N/A)

$ gatk HaplotypeCaller -R "ecoli_K12_MG1655.fasta" -I out/sorted.bam -O out/raw.vcf --ploidy 1
[gatk] Identified 162 raw candidate variants across reference NC_000913.3.

$ bcftools filter -i 'QUAL>=30 && INFO/DP>=10' -Ov -o out/filtered.vcf out/raw.vcf
Filtering completed: 128 variants passed quality thresholds (QUAL >= 30, DP >= 10). 34 variants discarded.

$ snpEff -Xmx2g -v GCF_000005845.2 out/filtered.vcf > out/annotated.vcf
Done: 128 variants processed, 128 annotated (0 chromosome errors).

[info] Anotasi SnpEff selesai: 128 varian berhasil dianotasi.
[info] Ringkasan: 89 SNP, 39 INDEL, 51 gen terpengaruh.
Pipeline variant calling selesai secara normal.`,
};

export const SAMPLE_RUN_BACILLUS: Analysis = {
  id: 'bacillus-subtilis-168',
  user_id: 'user-default-1',
  nama: 'Bacillus subtilis 168 — De novo',
  organisme: 'Bacillus subtilis',
  mode: 'paired',
  status: 'selesai',
  stage: 'annotation',
  created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  updated_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  config: {
    trim_quality: 20,
    min_length: 50,
    min_mapq: 20,
    min_baseq: 20,
    min_qual: 30,
    min_depth: 10,
    aligner: 'BWA-MEM',
    variant_caller: 'GATK HaplotypeCaller',
    annotation_tool: 'SnpEff',
  },
  files: {
    r1: 'bsubtilis_168_R1.fastq.gz',
    r2: 'bsubtilis_168_R2.fastq.gz',
    reference: 'bsubtilis_168.fasta',
    r1_size: 4200000,
    r2_size: 4150000,
    reference_size: 4215000,
  },
  stats: {
    alignment: {
      total_reads: 245000,
      terpetakan: 241570,
      tidak_terpetakan: 3430,
      persen_terpetakan: 98.6,
    },
    variant_calling: { varian_mentah: 112 },
    filtering: { varian_lolos: 96 },
    annotation: {
      total_varian: 96,
      snp: 72,
      indel: 24,
      gen_terdampak: 42,
      per_impact: { HIGH: 12, MODERATE: 48, LOW: 26, MODIFIER: 10 },
      per_efek: { missense_variant: 45, synonymous_variant: 26, frameshift_variant: 8 },
    },
  },
  error: null,
};

export const SAMPLE_RUN_MYCOBACTERIUM: Analysis = {
  id: 'mycobacterium-h37rv',
  user_id: 'user-default-1',
  nama: 'Mycobacterium tuberculosis H37Rv',
  organisme: 'Mycobacterium tuberculosis',
  mode: 'paired',
  status: 'gagal',
  stage: 'alignment',
  created_at: new Date(Date.now() - 86400000 * 17).toISOString(),
  updated_at: new Date(Date.now() - 86400000 * 17).toISOString(),
  config: {
    trim_quality: 20,
    min_length: 50,
    min_mapq: 20,
    min_baseq: 20,
    min_qual: 30,
    min_depth: 10,
    aligner: 'BWA-MEM',
    variant_caller: 'GATK HaplotypeCaller',
    annotation_tool: 'SnpEff',
  },
  files: {
    r1: 'mtb_H37Rv_R1.fastq.gz',
    r2: 'mtb_H37Rv_R2.fastq.gz',
    reference: 'mtb_H37Rv.fasta',
    r1_size: 3800000,
    r2_size: 3750000,
    reference_size: 4411532,
  },
  error: 'Alignment terhenti: Header referensi FASTA korup pada contig NC_000962.3',
  log_tail: `[error] bwa index gagal: format FASTA tidak valid pada baris 412.`,
};

export const SAMPLE_RUN_YEAST: Analysis = {
  id: 'yeast-s288c',
  user_id: 'user-default-1',
  nama: 'S. cerevisiae S288C',
  organisme: 'Saccharomyces cerevisiae',
  mode: 'paired',
  status: 'selesai',
  stage: 'annotation',
  created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  config: {
    trim_quality: 20,
    min_length: 50,
    min_mapq: 20,
    min_baseq: 20,
    min_qual: 30,
    min_depth: 10,
    aligner: 'BWA-MEM',
    variant_caller: 'GATK HaplotypeCaller',
    annotation_tool: 'SnpEff',
  },
  files: {
    r1: 'yeast_s288c_R1.fastq.gz',
    r2: 'yeast_s288c_R2.fastq.gz',
    reference: 'yeast_s288c.fasta',
  },
  stats: {
    alignment: {
      total_reads: 480000,
      terpetakan: 472800,
      tidak_terpetakan: 7200,
      persen_terpetakan: 98.5,
    },
    variant_calling: { varian_mentah: 260 },
    filtering: { varian_lolos: 214 },
    annotation: {
      total_varian: 214,
      snp: 168,
      indel: 46,
      gen_terdampak: 78,
      per_impact: { HIGH: 28, MODERATE: 110, LOW: 56, MODIFIER: 20 },
      per_efek: { missense_variant: 98, synonymous_variant: 56, frameshift_variant: 20 },
    },
  },
  error: null,
};

export const INITIAL_ANALYSES_LIST: Analysis[] = [
  INITIAL_ANALYSIS,
  SAMPLE_RUN_BACILLUS,
  SAMPLE_RUN_MYCOBACTERIUM,
  SAMPLE_RUN_YEAST,
];

export const SAMPLE_FASTQ_SNIPPET = `@SRR10000001.1 1/1
AGCTTTTCATTCTGACTGCAACGGGCAATATGTCTCTGTGTGGATTAAAAAAAGAGTGTCTGATAGCAGC
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
@SRR10000001.2 2/1
CGTTGATCCTTCCTGTCTCTTATACACATCTCCGAGCCCACGAGACAACTTGCCGATCTCGTATGCCGTC
+
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
@SRR10000001.3 3/1
ATGCTGCATCGGCTTTTGCATCGTGCTTGTTTTGTCGCCGCGGCGGCATACCGTTGATCCCTTTCTTTTC
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
@SRR10000001.4 4/1
GGCGCTTCGTTTGCCGTTTTGTTGCCGCGGCATGCCGTTGATCCTTCCTGTCTCTTATACACATCTCCGA
+
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF`;

export const SAMPLE_FASTA_SNIPPET = `>NC_000913.3 Escherichia coli str. K-12 substr. MG1655, complete genome
AGCTTTTCATTCTGACTGCAACGGGCAATATGTCTCTGTGTGGATTAAAAAAAGAGTGTCTGATAGCAGC
TTCTGAACTGGTTACCTGCCGTGAGTAAATTAAAATTTTATTGACTTAGGTCACTAAATACTTTAACCAA
TATAGGCATAGCGCACAGACAGATAAAAATTACAGAGTACACAACATCCATGAAACGCATTAGCACCACC
ATTACCACCACCATCACCATTACCACAGGTAACGGTGCGGGCTGACGCGTACAGGAAACACAGAAAAAAG
CCCGCACCTGACAGTGCGGGCTTTTTTTTTCGACCAAAGGTAACGAGGTAACAACCATGCGAGTGTTGAA`;
