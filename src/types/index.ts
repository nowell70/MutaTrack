export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
  created_at: string;
}

export type AnalysisStatus = 'draf' | 'valid' | 'tidak_valid' | 'berjalan' | 'selesai' | 'gagal';

export type PipelineStage = 
  | 'qc'
  | 'trimming'
  | 'alignment'
  | 'variant_calling'
  | 'filtering'
  | 'annotation';

export const STAGES: PipelineStage[] = [
  'qc',
  'trimming',
  'alignment',
  'variant_calling',
  'filtering',
  'annotation'
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  qc: 'Kontrol Kualitas (FastQC)',
  trimming: 'Pemrosesan Sekuens (fastp)',
  alignment: 'Alignment Genom (BWA-MEM)',
  variant_calling: 'Variant Calling (GATK / BCFtools)',
  filtering: 'Penyaringan Varian (BCFtools)',
  annotation: 'Anotasi Fungsional (SnpEff)',
};

export interface PipelineConfig {
  trim_quality: number; // fastp -q (default: 20)
  min_length: number;   // fastp -l (default: 50)
  min_mapq: number;     // bcftools mpileup -q (default: 20)
  min_baseq: number;    // bcftools mpileup -Q (default: 20)
  min_qual: number;     // filter QUAL (default: 30)
  min_depth: number;    // filter DP (default: 10)
  aligner?: string;     // e.g. BWA-MEM
  variant_caller?: string; // e.g. GATK HaplotypeCaller / BCFtools
  annotation_tool?: string; // SnpEff
}

export const DEFAULT_CONFIG: PipelineConfig = {
  trim_quality: 20,
  min_length: 50,
  min_mapq: 20,
  min_baseq: 20,
  min_qual: 30,
  min_depth: 10,
  aligner: 'BWA-MEM',
  variant_caller: 'GATK HaplotypeCaller',
  annotation_tool: 'SnpEff',
};

export interface AnalysisFiles {
  r1?: string;
  r2?: string;
  reference?: string;
  r1_size?: number;
  r2_size?: number;
  reference_size?: number;
}

export interface TrimmingStats {
  reads_sebelum: number;
  reads_sesudah: number;
  q30_sebelum: number;
  q30_sesudah: number;
}

export interface AlignmentStats {
  total_reads: number;
  terpetakan: number;
  tidak_terpetakan: number;
  persen_terpetakan: number;
}

export interface VariantCallingStats {
  varian_mentah: number;
}

export interface FilteringStats {
  varian_lolos: number;
}

export type VariantImpact = 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER';

export interface AnnotationStats {
  total_varian: number;
  snp: number;
  indel: number;
  gen_terdampak: number;
  per_impact: Record<string, number>;
  per_efek: Record<string, number>;
  tidak_teranotasi?: number;
}

export interface AnalysisStats {
  trimming?: TrimmingStats;
  alignment?: AlignmentStats;
  variant_calling?: VariantCallingStats;
  filtering?: FilteringStats;
  annotation?: AnnotationStats;
}

export interface Analysis {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  nama: string;
  organisme?: string;
  mode?: 'paired' | 'single';
  status: AnalysisStatus;
  stage?: PipelineStage | null;
  config: PipelineConfig;
  files: AnalysisFiles;
  stats?: AnalysisStats;
  error?: string | null;
  log_tail?: string;
  full_log?: string;
}

export interface Variant {
  id: number;
  analysis_id: string;
  chrom: string;
  posisi: number;
  ref: string;
  alt: string;
  tipe: 'SNP' | 'INDEL';
  qual: number | null;
  depth: number | null;
  gen: string | null;
  efek: string | null;
  impact: VariantImpact | null;
}
