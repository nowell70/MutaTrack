import { Analysis, PipelineStage, STAGES, Variant } from '../types';
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
  const { id, nama, config, files, mode } = analysis;

  let fullLog = '';
  const emit = (text: string) => {
    fullLog += text + '\n';
    callbacks.onLog(text);
  };

  emit(`[MutaTrack Client] Menghubungi mesin bioinformatika lokal...`);

  // 1. Check Backend Connectivity
  let backendAvailable = false;
  try {
    const healthRes = await fetch('/api/health');
    if (healthRes.ok) {
      backendAvailable = true;
    }
  } catch (err) {
    backendAvailable = false;
  }

  if (!backendAvailable) {
    throw new Error(
      'Tidak dapat terhubung ke server bioinformatika MutaTrack di port 8080/3000. Pastikan layanan backend aktif.'
    );
  }

  // 2. Create Analysis on Backend
  emit(`[MutaTrack Backend] Mendaftarkan pipeline untuk "${nama}" (ID: ${id})...`);
  const createRes = await fetch('/api/analyses/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      nama,
      mode: mode || 'paired',
      config,
      files,
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.detail || 'Gagal menginisialisasi analisis pada backend.');
  }

  // 3. Start Execution
  emit(`[MutaTrack Backend] Menjalankan pipeline komputasi bioinformatika nyata...`);
  const startRes = await fetch(`/api/analyses/${id}/start`, {
    method: 'POST',
  });

  if (!startRes.ok) {
    const errData = await startRes.json().catch(() => ({}));
    throw new Error(errData.detail || 'Gagal memulai eksekusi pipeline.');
  }

  let lastLogCount = 0;
  let currentStage: PipelineStage = 'qc';

  // 4. Polling Loop
  while (true) {
    if (abortSignal && abortSignal.aborted) {
      emit(`[MutaTrack Client] Mengirim sinyal pembatalan ke backend...`);
      await fetch(`/api/analyses/${id}/cancel`, { method: 'POST' }).catch(() => {});
      throw new Error('Pipeline dibatalkan oleh pengguna.');
    }

    await sleep(1000);

    // Fetch status
    const statusRes = await fetch(`/api/analyses/${id}`);
    if (!statusRes.ok) continue;

    const data = await statusRes.json();

    // Fetch new logs
    const logsRes = await fetch(`/api/analyses/${id}/logs`);
    if (logsRes.ok) {
      const logsData = await logsRes.json();
      const allLines: string[] = logsData.lines || [];
      if (allLines.length > lastLogCount) {
        const newLines = allLines.slice(lastLogCount);
        for (const line of newLines) {
          emit(line);
        }
        lastLogCount = allLines.length;
      }
    }

    // Update Stage
    if (data.stage && data.stage !== currentStage && STAGES.includes(data.stage as PipelineStage)) {
      currentStage = data.stage as PipelineStage;
      callbacks.onStageChange(currentStage);
    }

    // Update Progress
    if (typeof data.progress === 'number' && callbacks.onProgress) {
      callbacks.onProgress(data.progress);
    }

    // Terminal Statuses
    if (data.status === 'selesai') {
      callbacks.onProgress?.(100);

      // Fetch actual variants from backend
      emit(`[MutaTrack Client] Mengunduh hasil varian genomik aktual dari backend...`);
      const varRes = await fetch(`/api/analyses/${id}/variants?limit=500`);
      let loadedVariants: Variant[] = [];
      if (varRes.ok) {
        const varData = await varRes.json();
        loadedVariants = varData.variants || [];
      }

      saveVariantsForAnalysis(id, loadedVariants);

      const finalAnalysis: Analysis = {
        ...analysis,
        status: 'selesai',
        stage: data.stage || 'annotation',
        stats: data.stats || {},
        error: null,
        full_log: fullLog,
        log_tail: fullLog.split('\n').slice(-30).join('\n'),
        updated_at: new Date().toISOString(),
      };

      saveAnalysis(finalAnalysis);
      return finalAnalysis;
    }

    if (data.status === 'gagal') {
      const errMessage = data.error || 'Eksekusi pipeline gagal.';
      const failedAnalysis: Analysis = {
        ...analysis,
        status: 'gagal',
        error: errMessage,
        full_log: fullLog,
        log_tail: fullLog.split('\n').slice(-30).join('\n'),
        updated_at: new Date().toISOString(),
      };
      saveAnalysis(failedAnalysis);
      throw new Error(errMessage);
    }
  }
}
