import { Analysis, DEFAULT_CONFIG, PipelineConfig, User, Variant } from '../types';
import { INITIAL_ANALYSES_LIST, INITIAL_ANALYSIS, SAMPLE_VARIANTS } from './sampleData';

const USERS_KEY = 'mutatrack_users';
const CURRENT_USER_KEY = 'mutatrack_current_user';
const ANALYSES_KEY = 'mutatrack_analyses';
const VARIANTS_KEY = 'mutatrack_variants';

export const INITIAL_USER: User = {
  id: 'user-default-1',
  email: 'anda@institusi.id',
  nama: 'Peneliti Bioinformatika IPB',
  role: 'admin',
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
};

export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify([INITIAL_USER]));
      return [INITIAL_USER];
    }
    return JSON.parse(raw);
  } catch {
    return [INITIAL_USER];
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getStoredAnalyses = (): Analysis[] => {
  try {
    const raw = localStorage.getItem(ANALYSES_KEY);
    if (!raw) {
      localStorage.setItem(ANALYSES_KEY, JSON.stringify(INITIAL_ANALYSES_LIST));
      return INITIAL_ANALYSES_LIST;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ANALYSES_KEY, JSON.stringify(INITIAL_ANALYSES_LIST));
      return INITIAL_ANALYSES_LIST;
    }
    return parsed;
  } catch {
    return INITIAL_ANALYSES_LIST;
  }
};

export const saveAnalyses = (analyses: Analysis[]): void => {
  localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
};

export const getAnalysisById = (id: string): Analysis | null => {
  const all = getStoredAnalyses();
  return all.find((a) => a.id === id) || null;
};

export const saveAnalysis = (analysis: Analysis): void => {
  const all = getStoredAnalyses();
  const idx = all.findIndex((a) => a.id === analysis.id);
  if (idx >= 0) {
    all[idx] = { ...analysis, updated_at: new Date().toISOString() };
  } else {
    all.unshift(analysis);
  }
  saveAnalyses(all);
};

export const deleteAnalysis = (id: string): void => {
  const all = getStoredAnalyses();
  saveAnalyses(all.filter((a) => a.id !== id));
  const variants = getStoredVariants().filter((v) => v.analysis_id !== id);
  localStorage.setItem(VARIANTS_KEY, JSON.stringify(variants));
};

export const getStoredVariants = (): Variant[] => {
  try {
    const raw = localStorage.getItem(VARIANTS_KEY);
    if (!raw) {
      const initialWithIds: Variant[] = SAMPLE_VARIANTS.map((v, i) => ({
        ...v,
        id: i + 1,
        analysis_id: INITIAL_ANALYSIS.id,
      }));
      localStorage.setItem(VARIANTS_KEY, JSON.stringify(initialWithIds));
      return initialWithIds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initialWithIds: Variant[] = SAMPLE_VARIANTS.map((v, i) => ({
        ...v,
        id: i + 1,
        analysis_id: INITIAL_ANALYSIS.id,
      }));
      localStorage.setItem(VARIANTS_KEY, JSON.stringify(initialWithIds));
      return initialWithIds;
    }
    return parsed;
  } catch {
    return [];
  }
};

export const saveVariantsForAnalysis = (analysisId: string, variants: Omit<Variant, 'id' | 'analysis_id'>[]): Variant[] => {
  const all = getStoredVariants().filter((v) => v.analysis_id !== analysisId);
  let nextId = all.reduce((max, v) => Math.max(max, v.id), 0) + 1;
  const newVariants: Variant[] = variants.map((v) => ({
    ...v,
    id: nextId++,
    analysis_id: analysisId,
  }));
  const updated = [...all, ...newVariants];
  localStorage.setItem(VARIANTS_KEY, JSON.stringify(updated));
  return newVariants;
};

export const getVariantsForAnalysis = (
  analysisId: string,
  options?: {
    impact?: string;
    tipe?: string;
    search?: string;
  }
): Variant[] => {
  let list = getStoredVariants().filter((v) => v.analysis_id === analysisId);
  if (list.length === 0 && (analysisId === INITIAL_ANALYSIS.id || analysisId.includes('ecoli'))) {
    // Return sample variants
    list = SAMPLE_VARIANTS.map((v, i) => ({ ...v, id: i + 1, analysis_id: analysisId }));
  }

  if (options?.impact && options.impact !== 'ALL') {
    list = list.filter((v) => v.impact === options.impact);
  }
  if (options?.tipe && options.tipe !== 'ALL') {
    list = list.filter((v) => v.tipe === options.tipe);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter(
      (v) =>
        (v.gen && v.gen.toLowerCase().includes(s)) ||
        (v.efek && v.efek.toLowerCase().includes(s)) ||
        v.chrom.toLowerCase().includes(s) ||
        String(v.posisi).includes(s)
    );
  }
  return list.sort((a, b) => a.posisi - b.posisi);
};

export const checkFastqContent = (filename: string, content?: string): string | null => {
  const cleanName = filename.toLowerCase().replace('.gz', '');
  if (!cleanName.endsWith('.fastq') && !cleanName.endsWith('.fq')) {
    return 'Ekstensi harus .fastq atau .fq (boleh .gz).';
  }
  if (!content) return null;
  const lines = content.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 4) {
    return 'Berkas FASTQ minimal memuat 4 baris rekaman sekuens.';
  }
  if (!lines[0].startsWith('@')) {
    return 'Header FASTQ harus diawali karakter "@".';
  }
  if (!lines[2].startsWith('+')) {
    return 'Baris separator FASTQ harus diawali karakter "+".';
  }
  return null;
};

export const checkFastaContent = (filename: string, content?: string): string | null => {
  const cleanName = filename.toLowerCase();
  if (!cleanName.endsWith('.fa') && !cleanName.endsWith('.fasta') && !cleanName.endsWith('.fna')) {
    return 'Ekstensi genom referensi harus .fa, .fasta, atau .fna.';
  }
  if (!content) return null;
  const lines = content.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0 || !lines[0].startsWith('>')) {
    return 'Format FASTA tidak valid (baris pertama harus diawali ">").';
  }
  return null;
};
