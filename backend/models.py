from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class PipelineConfigModel(BaseModel):
    trim_quality: int = Field(20, description="fastp -q")
    min_length: int = Field(50, description="fastp -l")
    min_mapq: int = Field(20, description="bcftools mpileup -q")
    min_baseq: int = Field(20, description="bcftools mpileup -Q")
    min_qual: float = Field(30.0, description="bcftools filter QUAL")
    min_depth: int = Field(10, description="bcftools filter DP")
    ploidy: int = Field(1, description="bcftools call ploidy (1 for bacteria/haploid, 2 for diploid)")
    snpeff_db: str = Field("GCF_000005845.2", description="SnpEff database identifier")
    aligner: str = Field("BWA-MEM", description="Aligner name")
    variant_caller: str = Field("BCFtools", description="Variant caller name")
    annotation_tool: str = Field("SnpEff", description="Annotation tool name")

class AnalysisFilesModel(BaseModel):
    r1: Optional[str] = None
    r2: Optional[str] = None
    reference: Optional[str] = None
    r1_name: Optional[str] = None
    r2_name: Optional[str] = None
    reference_name: Optional[str] = None
    r1_size: Optional[int] = 0
    r2_size: Optional[int] = 0
    reference_size: Optional[int] = 0

class AnalysisCreateRequest(BaseModel):
    id: Optional[str] = None
    nama: str
    organisme: Optional[str] = "Escherichia coli str. K-12 substr. MG1655"
    mode: str = "paired"
    config: Optional[PipelineConfigModel] = None
    files: Optional[AnalysisFilesModel] = None

class AnalysisValidateRequest(BaseModel):
    r1_path: str
    r2_path: Optional[str] = None
    reference_path: str
    mode: str = "paired"

class AnalysisSummaryResponse(BaseModel):
    id: str
    nama: str
    status: str
    stage: Optional[str] = None
    progress: int = 0
    mode: str
    config: Dict[str, Any]
    files: Dict[str, Any]
    stats: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str
    updated_at: str
    log_tail: Optional[str] = None
