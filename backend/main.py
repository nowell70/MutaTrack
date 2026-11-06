import csv
import io
import json
import os
import shutil
import subprocess
import uuid
from typing import Dict, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from .models import (
    AnalysisCreateRequest,
    AnalysisSummaryResponse,
    AnalysisValidateRequest,
    PipelineConfigModel,
)
from .pipeline.runner import AnalysisJob
from .pipeline.utils import ensure_dir
from .pipeline.validator import validate_pipeline_inputs, ValidationError

DATA_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))
UPLOADS_DIR = ensure_dir(os.path.join(DATA_ROOT, "uploads"))
ANALYSES_DIR = ensure_dir(os.path.join(DATA_ROOT, "analyses"))

# In-memory registry of active analysis jobs
ACTIVE_JOBS: Dict[str, AnalysisJob] = {}

app = FastAPI(
    title="MutaTrack Bioinformatics Backend API",
    description="Production DNA Variant Calling Engine executing FastQC, fastp, BWA-MEM, SAMtools, BCFtools, and SnpEff.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_installed_tool_version(cmd: List[str]) -> str:
    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            errors="replace",
            timeout=5,
        )
        out = (proc.stdout or proc.stderr).strip().splitlines()
        return out[0] if out else "Installed"
    except Exception as e:
        return f"Error: {e}"

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "MutaTrack Real Bioinformatics Pipeline API",
        "version": "2.0.0",
    }

@app.get("/api/server-info")
def server_info():
    tools = {
        "fastqc": get_installed_tool_version(["fastqc", "--version"]),
        "fastp": get_installed_tool_version(["fastp", "--version"]),
        "bwa": get_installed_tool_version(["bwa"]),
        "samtools": get_installed_tool_version(["samtools", "--version"]),
        "bcftools": get_installed_tool_version(["bcftools", "--version"]),
        "snpeff": get_installed_tool_version(["snpEff", "-version"]),
    }
    return {
        "status": "ready",
        "tools": tools,
        "concurrency_limit": 1,
        "uploads_dir": UPLOADS_DIR,
        "analyses_dir": ANALYSES_DIR,
        "max_file_size_bytes": 100 * 1024 * 1024,
        "max_file_size_mb": 100,
    }

MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100 MB

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Form("generic"),  # r1, r2, reference
):
    try:
        file_id = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        dest_path = os.path.join(UPLOADS_DIR, file_id)

        size = 0
        with open(dest_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                size += len(chunk)
                if size > MAX_UPLOAD_SIZE:
                    buffer.close()
                    if os.path.exists(dest_path):
                        os.remove(dest_path)
                    raise HTTPException(
                        status_code=413,
                        detail=f"Ukuran berkas '{file.filename}' melebihi batas maksimal 100 MB (104.857.600 bytes).",
                    )
                buffer.write(chunk)

        return {
            "success": True,
            "filename": file.filename,
            "filepath": dest_path,
            "size": size,
            "file_type": file_type,
            "max_allowed_bytes": MAX_UPLOAD_SIZE,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengunggah file: {str(e)}")

@app.post("/api/analyses/validate")
def validate_inputs(req: AnalysisValidateRequest):
    # Resolve relative workspace paths if provided
    r1 = resolve_path(req.r1_path)
    r2 = resolve_path(req.r2_path) if req.r2_path else None
    ref = resolve_path(req.reference_path)

    try:
        results = validate_pipeline_inputs(r1, r2, ref, req.mode)
        return {
            "valid": True,
            "details": results,
            "message": "Semua berkas masukan valid dan siap diproses oleh pipeline.",
        }
    except ValidationError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kesalahan internal validasi: {str(e)}")

def resolve_path(path_str: Optional[str]) -> str:
    if not path_str:
        return ""
    if os.path.isabs(path_str) and os.path.exists(path_str):
        return path_str
    # Check current workspace root
    ws_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    candidate = os.path.join(ws_root, path_str)
    if os.path.exists(candidate):
        return candidate
    candidate_upload = os.path.join(UPLOADS_DIR, path_str)
    if os.path.exists(candidate_upload):
        return candidate_upload
    return path_str

@app.post("/api/analyses/create")
def create_analysis(req: AnalysisCreateRequest):
    analysis_id = req.id or f"ana_{uuid.uuid4().hex[:8]}"

    config_dict = req.config.dict() if req.config else PipelineConfigModel().dict()
    files_dict = req.files.dict() if req.files else {}

    # Resolve paths
    if files_dict.get("r1"):
        files_dict["r1"] = resolve_path(files_dict["r1"])
    if files_dict.get("r2"):
        files_dict["r2"] = resolve_path(files_dict["r2"])
    if files_dict.get("reference"):
        files_dict["reference"] = resolve_path(files_dict["reference"])

    job = AnalysisJob(
        analysis_id=analysis_id,
        name=req.nama,
        files=files_dict,
        config=config_dict,
        mode=req.mode,
        data_root=DATA_ROOT,
    )
    job.save_metadata()
    ACTIVE_JOBS[analysis_id] = job

    return {
        "success": True,
        "id": analysis_id,
        "status": job.status,
        "message": f"Analisis '{req.nama}' berhasil dibuat.",
    }

@app.post("/api/analyses/{analysis_id}/start")
def start_analysis(analysis_id: str):
    job = get_or_load_job(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Analisis dengan ID {analysis_id} tidak ditemukan.")

    if job.status == "berjalan":
        return {"success": True, "message": "Pipeline sudah sedang berjalan."}

    # Reset logs & stats if re-running
    job.logs = []
    job.stats = {}
    job.variants = []
    job.error = None
    job.runner = job.runner.__class__()

    job.start_async()

    return {
        "success": True,
        "id": analysis_id,
        "status": "berjalan",
        "message": "Pipeline bioinformatika berhasil diluncurkan.",
    }

@app.post("/api/analyses/{analysis_id}/cancel")
def cancel_analysis(analysis_id: str):
    job = get_or_load_job(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail="Analisis tidak ditemukan.")

    job.cancel()
    return {"success": True, "message": "Perintah pembatalan pipeline telah dikirim."}

def get_or_load_job(analysis_id: str) -> Optional[AnalysisJob]:
    if analysis_id in ACTIVE_JOBS:
        return ACTIVE_JOBS[analysis_id]

    meta_file = os.path.join(ANALYSES_DIR, analysis_id, "analysis.json")
    if os.path.isfile(meta_file):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                job = AnalysisJob(
                    analysis_id=data["id"],
                    name=data["nama"],
                    files=data.get("files", {}),
                    config=data.get("config", {}),
                    mode=data.get("mode", "paired"),
                    data_root=DATA_ROOT,
                )
                job.status = data.get("status", "draf")
                job.stage = data.get("stage")
                job.progress = data.get("progress", 0)
                job.stats = data.get("stats", {})
                job.error = data.get("error")
                job.created_at = data.get("created_at", job.created_at)
                job.updated_at = data.get("updated_at", job.updated_at)

                # Load logs if exist
                log_path = os.path.join(ANALYSES_DIR, analysis_id, "pipeline.log")
                if os.path.isfile(log_path):
                    with open(log_path, "r", encoding="utf-8") as lf:
                        job.logs = [line.strip() for line in lf.readlines()]

                # Load variants if exist
                var_path = os.path.join(ANALYSES_DIR, analysis_id, "variants.json")
                if os.path.isfile(var_path):
                    with open(var_path, "r", encoding="utf-8") as vf:
                        job.variants = json.load(vf)

                ACTIVE_JOBS[analysis_id] = job
                return job
        except Exception:
            return None
    return None

@app.get("/api/analyses")
def list_analyses():
    results = []
    # Discover all analysis folders in ANALYSES_DIR
    if os.path.exists(ANALYSES_DIR):
        for aid in os.listdir(ANALYSES_DIR):
            job = get_or_load_job(aid)
            if job:
                results.append({
                    "id": job.analysis_id,
                    "nama": job.name,
                    "status": job.status,
                    "stage": job.stage,
                    "progress": job.progress,
                    "mode": job.mode,
                    "created_at": job.created_at,
                    "updated_at": job.updated_at,
                    "error": job.error,
                    "stats": job.stats,
                })
    # Sort by created_at descending
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return results

@app.get("/api/analyses/{analysis_id}")
def get_analysis_detail(analysis_id: str):
    job = get_or_load_job(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail="Analisis tidak ditemukan.")

    return {
        "id": job.analysis_id,
        "nama": job.name,
        "status": job.status,
        "stage": job.stage,
        "progress": job.progress,
        "mode": job.mode,
        "config": job.config,
        "files": job.files,
        "stats": job.stats,
        "error": job.error,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "log_tail": "\n".join(job.logs[-40:]),
    }

@app.get("/api/analyses/{analysis_id}/logs")
def get_analysis_logs(analysis_id: str, tail: Optional[int] = None):
    job = get_or_load_job(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail="Analisis tidak ditemukan.")

    if tail and tail > 0:
        lines = job.logs[-tail:]
    else:
        lines = job.logs

    return {
        "analysis_id": analysis_id,
        "lines": lines,
        "full_text": "\n".join(lines),
    }

@app.get("/api/analyses/{analysis_id}/variants")
def get_analysis_variants(
    analysis_id: str,
    q: Optional[str] = Query(None, description="Search term for gene, chromosome, or effect"),
    impact: Optional[str] = Query(None, description="Filter by impact: HIGH, MODERATE, LOW, MODIFIER"),
    type: Optional[str] = Query(None, description="Filter by type: SNP, INDEL"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
):
    job = get_or_load_job(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail="Analisis tidak ditemukan.")

    variants = job.variants
    # Apply filters
    filtered = variants
    if q:
        ql = q.lower()
        filtered = [
            v for v in filtered
            if ql in str(v.get("chrom", "")).lower()
            or ql in str(v.get("gen", "")).lower()
            or ql in str(v.get("efek", "")).lower()
            or ql in str(v.get("posisi", ""))
        ]
    if impact:
        imp_upper = impact.upper()
        filtered = [v for v in filtered if (v.get("impact") or "").upper() == imp_upper]
    if type:
        t_upper = type.upper()
        filtered = [v for v in filtered if (v.get("tipe") or "").upper() == t_upper]

    total_count = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = filtered[start_idx:end_idx]

    return {
        "analysis_id": analysis_id,
        "total": total_count,
        "page": page,
        "limit": limit,
        "variants": paginated,
    }

@app.get("/api/analyses/{analysis_id}/files/{file_type}")
def download_analysis_file(analysis_id: str, file_type: str):
    job = get_or_load_job(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail="Analisis tidak ditemukan.")

    out_dir = job.out_dir

    if file_type == "vcf":
        # Prefer annotated.vcf, then filtered.vcf, then raw.vcf
        for candidate in [
            os.path.join(out_dir, "annotation", "annotated.vcf"),
            os.path.join(out_dir, "variants", "filtered.vcf"),
            os.path.join(out_dir, "variants", "raw.vcf"),
        ]:
            if os.path.isfile(candidate):
                return FileResponse(
                    candidate,
                    media_type="text/plain",
                    filename=f"{job.name}_variants.vcf",
                )
        raise HTTPException(status_code=404, detail="Berkas VCF belum tersedia.")

    elif file_type == "csv":
        # Stream CSV directly from variants list
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Kromosom", "Posisi", "Ref", "Alt", "Tipe", "QUAL", "DP", "Gen", "Efek", "Impact"])
        for v in job.variants:
            writer.writerow([
                v.get("id"),
                v.get("chrom"),
                v.get("posisi"),
                v.get("ref"),
                v.get("alt"),
                v.get("tipe"),
                v.get("qual"),
                v.get("depth"),
                v.get("gen"),
                v.get("efek"),
                v.get("impact"),
            ])
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{job.name}_variants.csv"'},
        )

    elif file_type == "bam":
        bam_path = os.path.join(out_dir, "alignment", "sorted.bam")
        if os.path.isfile(bam_path):
            return FileResponse(bam_path, media_type="application/octet-stream", filename=f"{job.name}_sorted.bam")
        raise HTTPException(status_code=404, detail="Berkas BAM belum tersedia.")

    elif file_type == "flagstat":
        stat_path = os.path.join(out_dir, "alignment", "flagstat.txt")
        if os.path.isfile(stat_path):
            return FileResponse(stat_path, media_type="text/plain", filename="flagstat.txt")
        raise HTTPException(status_code=404, detail="Statistik flagstat belum tersedia.")

    elif file_type == "fastp_html":
        fastp_html = os.path.join(out_dir, "trimming", "fastp.html")
        if os.path.isfile(fastp_html):
            return FileResponse(fastp_html, media_type="text/html")
        raise HTTPException(status_code=404, detail="Laporan fastp HTML belum tersedia.")

    elif file_type == "log":
        log_path = os.path.join(job.analysis_dir, "pipeline.log")
        if os.path.isfile(log_path):
            return FileResponse(log_path, media_type="text/plain", filename=f"{job.name}_pipeline.log")
        raise HTTPException(status_code=404, detail="Berkas log belum tersedia.")

    raise HTTPException(status_code=400, detail=f"Jenis file '{file_type}' tidak dikenali.")

@app.get("/api/analyses/{analysis_id}/reports/fastqc/{read_type}")
def get_fastqc_report(analysis_id: str, read_type: str):
    job = get_or_load_job(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail="Analisis tidak ditemukan.")

    qc_dir = os.path.join(job.out_dir, "qc")
    if not os.path.exists(qc_dir):
        raise HTTPException(status_code=404, detail="Direktori FastQC belum dibuat.")

    # Find html file
    html_files = [f for f in os.listdir(qc_dir) if f.endswith(".html")]
    if not html_files:
        raise HTTPException(status_code=404, detail="Laporan HTML FastQC belum dibuat.")

    target_html = None
    if read_type == "r2":
        for f in html_files:
            if "_R2_" in f or "_2_fastqc" in f:
                target_html = f
                break
    if not target_html:
        target_html = html_files[0]

    return FileResponse(os.path.join(qc_dir, target_html), media_type="text/html")

@app.delete("/api/analyses/{analysis_id}")
def delete_analysis(analysis_id: str):
    job = get_or_load_job(analysis_id)
    if job and job.status == "berjalan":
        job.cancel()

    if analysis_id in ACTIVE_JOBS:
        del ACTIVE_JOBS[analysis_id]

    ana_dir = os.path.join(ANALYSES_DIR, analysis_id)
    if os.path.exists(ana_dir):
        shutil.rmtree(ana_dir, ignore_errors=True)

    return {"success": True, "message": f"Analisis {analysis_id} berhasil dihapus."}
