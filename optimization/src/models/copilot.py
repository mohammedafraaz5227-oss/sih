from pydantic import BaseModel
from typing import Optional, Any
from .optimization_request import OptimizationRequest
from .schedule import OptimizedSchedule

class DisruptionSimulationRequest(BaseModel):
    """Request to inject an operational rail disruption and re-optimize."""
    scenario: str = "congested"
    disruption_type: str = "train_delay"  # "train_delay" | "emergency_block" | "ohe_failure" | "custom"
    train_id: Optional[str] = "TRN_12301"
    delay_minutes: int = 45
    emergency_asset_id: Optional[str] = "SEC_ALG_TDK"
    emergency_duration: int = 120
    emergency_priority: int = 5
    custom_request: Optional[OptimizationRequest] = None

class DisruptionSimulationResponse(BaseModel):
    """Result of running CP-SAT re-optimization under disruption."""
    status: str = "success"
    disruption_applied: str
    original_conflicts_without_cpsat: int
    cascading_delay_prevented_minutes: int
    trains_saved_from_delay: list[str]
    reoptimized_schedule: OptimizedSchedule
    explanation: str

class NLPParsingRequest(BaseModel):
    """Field requisition text or transcript to parse."""
    text: str

class NLPParsingResponse(BaseModel):
    """Extracted block request fields from natural language."""
    parsed_block: dict[str, Any]
    confidence: float
    extracted_entities: dict[str, Any]
    suggested_action: str
    natural_explanation: str
