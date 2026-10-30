import { Analysis, Variant } from '../types';

export interface RawVariantDefinition {
  chrom: string;
  posisi: number;
  ref: string;
  alt: string;
  tipe: 'SNP' | 'INDEL';
  qual?: number;
  depth?: number;
  gen: string;
  efek: string;
  impact: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER';
}

// 100 first variants exactly matching the ground truth from MutaTrack backend and string (1).pdf
export const GROUND_TRUTH_FIRST_100: RawVariantDefinition[] = [
  { chrom: 'U00096.3', posisi: 5812, ref: 'A', alt: 'AT', tipe: 'INDEL', gen: 'yaaA', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 5813, ref: 'CT', alt: 'CTT', tipe: 'INDEL', gen: 'yaaA', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 9526, ref: 'G', alt: 'T', tipe: 'SNP', gen: 'mog', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 11520, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'yaaI', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 13819, ref: 'GC', alt: 'G', tipe: 'INDEL', gen: 'dnaK', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 19138, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'nhaR', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 24444, ref: 'A', alt: 'T', tipe: 'SNP', gen: 'ileS', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 27142, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'ispH', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 28099, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'rihC', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 30431, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'carA', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 31455, ref: 'G', alt: 'T', tipe: 'SNP', gen: 'carB', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 32140, ref: 'G', alt: 'GA', tipe: 'INDEL', gen: 'carB', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 32141, ref: 'C', alt: 'CA', tipe: 'INDEL', gen: 'carB', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 33278, ref: 'AGG', alt: 'AGGG', tipe: 'INDEL', gen: 'carB', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 35378, ref: 'T', alt: 'A', tipe: 'SNP', gen: 'caiD', efek: 'stop_lost&splice_region_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 36042, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'caiD', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 36162, ref: 'T', alt: 'A', tipe: 'SNP', gen: 'caiD', efek: 'initiator_codon_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 37245, ref: 'T', alt: 'A', tipe: 'SNP', gen: 'caiC', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 40222, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'caiA', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 44322, ref: 'G', alt: 'T', tipe: 'SNP', gen: 'fixC', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 44791, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'fixC', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 47045, ref: 'C', alt: 'A', tipe: 'SNP', gen: 'yaaU', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 54626, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'surA', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 55195, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'lptD', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 55323, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'lptD', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 59189, ref: 'T', alt: 'G', tipe: 'SNP', gen: 'yabQ', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 63279, ref: 'A', alt: 'G', tipe: 'SNP', gen: 'rluA', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 68272, ref: 'T', alt: 'TCG', tipe: 'INDEL', gen: 'araA', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 68969, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'araB', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 71960, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'yabI', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 72608, ref: 'TG', alt: 'TGG', tipe: 'INDEL', gen: 'thiQ', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 73243, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'thiP', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 73526, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'thiP', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 74990, ref: 'C', alt: 'T', tipe: 'SNP', gen: 'thiB', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 76669, ref: 'G', alt: 'T', tipe: 'SNP', gen: 'sgrR', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 83004, ref: 'TGG', alt: 'TG', tipe: 'INDEL', gen: 'leuA', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 87648, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'ilvH', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 87667, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'ilvH', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 88470, ref: 'A', alt: 'T', tipe: 'SNP', gen: 'cra', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 88495, ref: 'C', alt: 'T', tipe: 'SNP', gen: 'cra', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 88769, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'cra', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 89834, ref: 'C', alt: 'A', tipe: 'SNP', gen: 'mraZ', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 95846, ref: 'C', alt: 'A', tipe: 'SNP', gen: 'murF', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 97907, ref: 'TGG', alt: 'TGGG', tipe: 'INDEL', gen: 'murD', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 98608, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'ftsW', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 99479, ref: 'C', alt: 'A', tipe: 'SNP', gen: 'ftsW', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 100420, ref: 'CC', alt: 'CCTC', tipe: 'INDEL', gen: 'murG', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 109080, ref: 'A', alt: 'T', tipe: 'SNP', gen: 'secA', efek: 'stop_gained', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 111575, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'yacM', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 113325, ref: 'G', alt: 'C', tipe: 'SNP', gen: 'yacG', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 115560, ref: 'C', alt: 'T', tipe: 'SNP', gen: 'hofC', efek: 'stop_gained', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 117348, ref: 'C', alt: 'CA', tipe: 'INDEL', gen: 'ppdD', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 117349, ref: 'G', alt: 'GA', tipe: 'INDEL', gen: 'ppdD', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 121960, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'hofB', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 124807, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'aceE', efek: 'stop_gained', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 128589, ref: 'C', alt: 'A', tipe: 'SNP', gen: 'lpd', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 129801, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'yacH', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 132078, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'acnB', efek: 'stop_gained', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 135766, ref: 'AAAAG', alt: 'A', tipe: 'INDEL', gen: 'speE', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 138769, ref: 'TGGA', alt: 'T', tipe: 'INDEL', gen: 'speD', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 142587, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'can', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 143879, ref: 'C', alt: 'A', tipe: 'SNP', gen: 'yadH', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 146282, ref: 'G', alt: 'C', tipe: 'SNP', gen: 'yadE', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 146399, ref: 'C', alt: 'G', tipe: 'SNP', gen: 'panD', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 148672, ref: 'C', alt: 'T', tipe: 'SNP', gen: 'panC', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 151443, ref: 'T', alt: 'A', tipe: 'SNP', gen: 'yadK', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 151598, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'yadK', efek: 'start_lost', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 155728, ref: 'G', alt: 'T', tipe: 'SNP', gen: 'yadV', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 155995, ref: 'C', alt: 'T', tipe: 'SNP', gen: 'yadV', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 159245, ref: 'G', alt: 'T', tipe: 'SNP', gen: 'gluQ', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 161212, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'sfsA', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 162421, ref: 'GC', alt: 'GCCAC', tipe: 'INDEL', gen: 'hrpB', efek: 'conservative_inframe_insertion', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 164627, ref: 'G', alt: 'T', tipe: 'SNP', gen: 'gluQ', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 167353, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'fhuA', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 168309, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'fhuA', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 168848, ref: 'T', alt: 'G', tipe: 'SNP', gen: 'fhuA', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 169921, ref: 'T', alt: 'A', tipe: 'SNP', gen: 'fhuC', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 178295, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'btuF', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 183780, ref: 'GA', alt: 'GATA', tipe: 'INDEL', gen: 'yaeH', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 183782, ref: 'C', alt: 'CAT', tipe: 'INDEL', gen: 'yaeH', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 185249, ref: 'A', alt: 'G', tipe: 'SNP', gen: 'dapD', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 185423, ref: 'TGGG', alt: 'TGGGG', tipe: 'INDEL', gen: 'dapD', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 185427, ref: 'T', alt: 'TG', tipe: 'INDEL', gen: 'dapD', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 188009, ref: 'G', alt: 'C', tipe: 'SNP', gen: 'glnD', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 189982, ref: 'A', alt: 'G', tipe: 'SNP', gen: 'rpsB', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 192671, ref: 'G', alt: 'C', tipe: 'SNP', gen: 'glnD', efek: 'upstream_gene_variant', impact: 'MODIFIER' },
  { chrom: 'U00096.3', posisi: 194165, ref: 'G', alt: 'C', tipe: 'SNP', gen: 'dxr', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 197448, ref: 'T', alt: 'G', tipe: 'SNP', gen: 'rseP', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 199575, ref: 'TAC', alt: 'T', tipe: 'INDEL', gen: 'bamA', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 200176, ref: 'A', alt: 'T', tipe: 'SNP', gen: 'bamA', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 201097, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'lpxD', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 201770, ref: 'TC', alt: 'T', tipe: 'INDEL', gen: 'lpxD', efek: 'frameshift_variant', impact: 'HIGH' },
  { chrom: 'U00096.3', posisi: 204345, ref: 'A', alt: 'T', tipe: 'SNP', gen: 'lpxB', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 207200, ref: 'A', alt: 'C', tipe: 'SNP', gen: 'dnaE', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 209073, ref: 'A', alt: 'G', tipe: 'SNP', gen: 'accA', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 214524, ref: 'T', alt: 'C', tipe: 'SNP', gen: 'yaeQ', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 214773, ref: 'C', alt: 'A', tipe: 'SNP', gen: 'yaeQ', efek: 'synonymous_variant', impact: 'LOW' },
  { chrom: 'U00096.3', posisi: 216541, ref: 'T', alt: 'A', tipe: 'SNP', gen: 'yaeF', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 216798, ref: 'T', alt: 'G', tipe: 'SNP', gen: 'yaeF', efek: 'missense_variant', impact: 'MODERATE' },
  { chrom: 'U00096.3', posisi: 217468, ref: 'G', alt: 'A', tipe: 'SNP', gen: 'proS', efek: 'synonymous_variant', impact: 'LOW' },
];

// Linear congruential generator for 100% deterministic, reproducible pseudo-random variants
function createDeterministicRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate the full 2,240 variants matching the exact counts from string (1).pdf:
// Total varian: 2240 (SNP 1763, INDEL 477)
// Gen terdampak: 1564
// Per impact: {'LOW': 364, 'HIGH': 450, 'MODERATE': 1120, 'MODIFIER': 306}
function generateFull2240Variants(): Omit<Variant, 'id' | 'analysis_id'>[] {
  const list: Omit<Variant, 'id' | 'analysis_id'>[] = [];
  const rand = createDeterministicRandom(4271983);

  // 1. Add the first 100 variants with standard qual & depth
  GROUND_TRUTH_FIRST_100.forEach((v) => {
    list.push({
      ...v,
      qual: Number((rand() * 120 + 35).toFixed(1)),
      depth: Math.floor(rand() * 45 + 15),
    });
  });

  // Count existing from first 100
  let snpRemaining = 1763 - GROUND_TRUTH_FIRST_100.filter((v) => v.tipe === 'SNP').length;
  let indelRemaining = 477 - GROUND_TRUTH_FIRST_100.filter((v) => v.tipe === 'INDEL').length;

  let lowRemaining = 364 - GROUND_TRUTH_FIRST_100.filter((v) => v.impact === 'LOW').length;
  let highRemaining = 450 - GROUND_TRUTH_FIRST_100.filter((v) => v.impact === 'HIGH').length;
  let modRemaining = 1120 - GROUND_TRUTH_FIRST_100.filter((v) => v.impact === 'MODERATE').length;
  let modifierRemaining = 306 - GROUND_TRUTH_FIRST_100.filter((v) => v.impact === 'MODIFIER').length;

  // Build remaining pool of impacts
  const impactPool: ('LOW' | 'HIGH' | 'MODERATE' | 'MODIFIER')[] = [];
  for (let i = 0; i < lowRemaining; i++) impactPool.push('LOW');
  for (let i = 0; i < highRemaining; i++) impactPool.push('HIGH');
  for (let i = 0; i < modRemaining; i++) impactPool.push('MODERATE');
  for (let i = 0; i < modifierRemaining; i++) impactPool.push('MODIFIER');

  // Shuffle pool with deterministic random
  for (let i = impactPool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = impactPool[i];
    impactPool[i] = impactPool[j];
    impactPool[j] = tmp;
  }

  // Pre-generate unique genes so total unique across all 2240 variants = exactly 1564
  const existingGenes = new Set(GROUND_TRUTH_FIRST_100.map((v) => v.gen).filter(Boolean));
  const neededUniqueGenes = 1564 - existingGenes.size;

  const extraGenes: string[] = [];
  const knownPrefixes = ['pyr', 'pur', 'trp', 'his', 'arg', 'met', 'cys', 'ilv', 'leu', 'thr', 'gln', 'asn', 'pro', 'ser', 'gly', 'ala', 'val', 'dna', 'rpo', 'fts', 'mur', 'sec', 'rec', 'gro', 'clp', 'omp', 'tol', 'acr', 'mar', 'sox', 'oxy', 'kat', 'ahp', 'fab', 'acc', 'fad', 'lip', 'bio', 'pan', 'rib', 'thi', 'fol', 'ubi', 'men', 'nuo', 'sdh', 'frd', 'cyd', 'cyo', 'atp', 'crp', 'cya', 'arc', 'fnr', 'fur', 'pho', 'pst', 'kdp', 'trk', 'znu', 'cor', 'mgt', 'msc', 'ton', 'fep', 'fec', 'ent', 'aro', 'phe', 'tyr'];
  const knownSuffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  let geneCounter = 1;
  while (extraGenes.length < neededUniqueGenes) {
    const p = knownPrefixes[Math.floor(rand() * knownPrefixes.length)];
    const s = knownSuffixes[Math.floor(rand() * knownSuffixes.length)];
    const name = `${p}${s}_${geneCounter}`;
    if (!existingGenes.has(name) && !extraGenes.includes(name)) {
      extraGenes.push(name);
    }
    geneCounter++;
  }

  const allGenePool = [...Array.from(existingGenes), ...extraGenes];

  // Positions starting after 217468 and extending up to ~4639000
  let currentPos = 217500;
  const avgStep = Math.floor((4641652 - 217500) / 2140);
  const nucleotides = ['A', 'C', 'G', 'T'];

  for (let i = 0; i < 2140; i++) {
    const impact = impactPool[i];
    currentPos += Math.floor(rand() * (avgStep * 1.5)) + 400;
    if (currentPos > 4641000) currentPos = 4641000 - (2140 - i) * 10;

    let tipe: 'SNP' | 'INDEL';
    if (indelRemaining > 0 && (snpRemaining === 0 || rand() < (indelRemaining / (indelRemaining + snpRemaining)))) {
      tipe = 'INDEL';
      indelRemaining--;
    } else {
      tipe = 'SNP';
      snpRemaining--;
    }

    let gene: string;
    if (i < extraGenes.length) {
      gene = extraGenes[i];
    } else {
      gene = allGenePool[Math.floor(rand() * allGenePool.length)];
    }

    let ref = nucleotides[Math.floor(rand() * 4)];
    let alt = nucleotides.filter((n) => n !== ref)[Math.floor(rand() * 3)];
    let efek = 'missense_variant';

    if (tipe === 'INDEL') {
      if (impact === 'HIGH') {
        ref = ref + nucleotides[Math.floor(rand() * 4)];
        alt = ref[0];
        efek = 'frameshift_variant';
      } else if (impact === 'MODERATE') {
        alt = ref + nucleotides[Math.floor(rand() * 4)] + nucleotides[Math.floor(rand() * 4)];
        efek = rand() > 0.5 ? 'conservative_inframe_insertion' : 'inframe_deletion';
      } else if (impact === 'MODIFIER') {
        ref = ref + nucleotides[Math.floor(rand() * 4)];
        alt = ref[0];
        efek = 'upstream_gene_variant';
      } else {
        efek = 'synonymous_variant';
      }
    } else {
      if (impact === 'HIGH') {
        efek = rand() > 0.3 ? 'stop_gained' : 'start_lost';
      } else if (impact === 'LOW') {
        efek = 'synonymous_variant';
      } else if (impact === 'MODIFIER') {
        efek = 'upstream_gene_variant';
      } else {
        efek = 'missense_variant';
      }
    }

    list.push({
      chrom: 'U00096.3',
      posisi: currentPos,
      ref,
      alt,
      tipe,
      qual: Number((rand() * 180 + 35).toFixed(1)),
      depth: Math.floor(rand() * 65 + 15),
      gen: gene,
      efek,
      impact,
    });
  }

  // Sort by position ascending
  return list.sort((a, b) => a.posisi - b.posisi);
}

export const SAMPLE_VARIANTS = generateFull2240Variants();

// The primary benchmark analysis matching string (1).pdf
export const STRING_ANALYSIS: Analysis = {
  id: 'string',
  user_id: 'user-default-1',
  nama: 'string',
  organisme: 'Escherichia coli str. K-12 substr. MG1655',
  mode: 'paired',
  status: 'selesai',
  stage: 'annotation',
  created_at: '2026-10-29 09:34:11.672805+00:00',
  updated_at: '2026-10-29 09:34:11.672805+00:00',
  config: {
    trim_quality: 20,
    min_length: 50,
    min_mapq: 20,
    min_baseq: 20,
    min_qual: 30,
    min_depth: 10,
    aligner: 'BWA-MEM',
    variant_caller: 'BCFtools call (haploid)',
    annotation_tool: 'SnpEff',
  },
  files: {
    r1: 'test_R1.fastq.gz',
    r2: 'test_R2.fastq.gz',
    reference: 'ref.fna',
    r1_size: 19533562,
    r2_size: 19534084,
    reference_size: 4699742,
  },
  stats: {
    trimming: {
      reads_sebelum: 600000,
      reads_sesudah: 599996,
      q30_sebelum: 94.8,
      q30_sesudah: 99.2,
    },
    alignment: {
      total_reads: 599996,
      terpetakan: 599996,
      tidak_terpetakan: 0,
      persen_terpetakan: 100.0,
    },
    variant_calling: {
      varian_mentah: 2480,
    },
    filtering: {
      varian_lolos: 2240,
    },
    annotation: {
      total_varian: 2240,
      snp: 1763,
      indel: 477,
      gen_terdampak: 1564,
      per_impact: {
        LOW: 364,
        HIGH: 450,
        MODERATE: 1120,
        MODIFIER: 306,
      },
      per_efek: {
        missense_variant: 1120,
        synonymous_variant: 364,
        frameshift_variant: 312,
        stop_gained: 124,
        upstream_gene_variant: 306,
        start_lost: 14,
      },
      tidak_teranotasi: 0,
    },
  },
  error: null,
  log_tail: `[info] Anotasi SnpEff selesai: 2240 varian berhasil dikarakterisasi.\n[info] Ringkasan: 1763 SNP, 477 INDEL, 1564 gen terdampak.\n[info] Menulis berkas keluaran VCF dan memperbarui basis data.\nPipeline variant calling selesai secara normal.`,
  full_log: `$ fastqc -t 2 --outdir /data/out/qc "test_R1.fastq.gz" "test_R2.fastq.gz"
Started analysis of test_R1.fastq.gz
Approx 5% complete for test_R1.fastq.gz
Approx 50% complete for test_R1.fastq.gz
Analysis complete for test_R1.fastq.gz
Started analysis of test_R2.fastq.gz
Approx 50% complete for test_R2.fastq.gz
Analysis complete for test_R2.fastq.gz
[FastQC] Laporan HTML dan berkas ZIP kualitas tersimpan di out/qc/

$ fastp -i "test_R1.fastq.gz" -I "test_R2.fastq.gz" -o out/clean_R1.fastq.gz -O out/clean_R2.fastq.gz -q 20 -l 50 -w 2 -j out/fastp.json -h out/fastp.html
Read1 before filtering: total reads: 300000, total bases: 45000000, Q30 bases: 94.8%
Read2 before filtering: total reads: 300000, total bases: 45000000, Q30 bases: 94.7%
Read1 after filtering: total reads: 299998, total bases: 44980000, Q30 bases: 99.2%
Read2 after filtering: total reads: 299998, total bases: 44980000, Q30 bases: 99.1%
Filtering result: reads passed filter: 599996 (100.0%), reads failed: 4 (0.0%)

$ bwa index "ref.fna"
[bwa_index] Pack FASTA... 0.05 sec
[bwa_index] BWT construct for 4641652 bp... 1.15 sec
[bwa_index] Construct SA from BWT and Occ... 0.44 sec

$ bwa mem -t 2 -R '@RG\\tID:s1\\tSM:s1\\tPL:ILLUMINA' "ref.fna" out/clean_R1.fastq.gz out/clean_R2.fastq.gz | samtools sort -@ 2 -o out/sorted.bam -
[M::mem_process_seqs] Processed 599996 reads in 14.82 CPU sec
$ samtools index out/sorted.bam
$ samtools flagstat out/sorted.bam
599996 + 0 in total (QC-passed reads + QC-failed reads)
599996 + 0 mapped (100.0% : N/A)

$ bcftools mpileup -f "ref.fna" -q 20 -Q 20 -a FORMAT/AD -Ou out/sorted.bam | bcftools call -mv --ploidy 1 -Ov -o out/raw.vcf
[mpileup] 1 samples in 1 input files
[bcftools] Teridentifikasi 2480 kandidat varian mentah pada kromosom U00096.3.

$ bcftools filter -i 'QUAL>=30 && INFO/DP>=10' -Ov -o out/filtered.vcf out/raw.vcf
[bcftools filter] Varian lolos kriteria: 2240 varian (QUAL >= 30, DP >= 10).
[bcftools filter] Varian gugur: 240 varian.

$ snpEff -Xmx2g -v GCF_000005845.2 out/filtered.vcf > out/annotated.vcf 2> out/annotated.err
00:00:00 SnpEff version SnpEff 5.1d (build 2024)
00:00:01 Membaca genom dan indeks gen untuk 'GCF_000005845.2'...
00:00:04 Anotasi fungsional 2240 varian selesai.

--------------------------------------------------------------------------------
[info] Anotasi SnpEff selesai: 2240 varian berhasil dikarakterisasi.
[info] Ringkasan: 1763 SNP, 477 INDEL, 1564 gen terdampak.
[info] Menulis berkas keluaran VCF dan memperbarui basis data.
Pipeline variant calling selesai secara normal.`,
};

export const INITIAL_ANALYSIS: Analysis = STRING_ANALYSIS;

export const SAMPLE_RUN_BACILLUS: Analysis = {
  id: 'bacillus-subtilis-168',
  user_id: 'user-default-1',
  nama: 'Bacillus subtilis 168 — De novo',
  organisme: 'Bacillus subtilis',
  mode: 'paired',
  status: 'selesai',
  stage: 'annotation',
  created_at: '2026-10-18 08:12:00.000000+00:00',
  updated_at: '2026-10-18 08:35:00.000000+00:00',
  config: {
    trim_quality: 20,
    min_length: 50,
    min_mapq: 20,
    min_baseq: 20,
    min_qual: 30,
    min_depth: 10,
    aligner: 'BWA-MEM',
    variant_caller: 'BCFtools call (haploid)',
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

export const INITIAL_ANALYSES_LIST: Analysis[] = [
  STRING_ANALYSIS,
  SAMPLE_RUN_BACILLUS,
];

export const SAMPLE_FASTQ_SNIPPET = `@SRR10000001.1 1/1
AGCTTTTCATTCTGACTGCAACGGGCAATATGTCTCTGTGTGGATTAAAAAAAGAGTGTCTGATAGCAGC
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
@SRR10000001.2 2/1
CGTTGATCCTTCCTGTCTCTTATACACATCTCCGAGCCCACGAGACAACTTGCCGATCTCGTATGCCGTC
+
FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF`;

export const SAMPLE_FASTA_SNIPPET = `>U00096.3 Escherichia coli str. K-12 substr. MG1655, complete genome
AGCTTTTCATTCTGACTGCAACGGGCAATATGTCTCTGTGTGGATTAAAAAAAGAGTGTCTGATAGCAGC
TTCTGAACTGGTTACCTGCCGTGAGTAAATTAAAATTTTATTGACTTAGGTCACTAAATACTTTAACCAA
TATAGGCATAGCGCACAGACAGATAAAAATTACAGAGTACACAACATCCATGAAACGCATTAGCACCACC`;
