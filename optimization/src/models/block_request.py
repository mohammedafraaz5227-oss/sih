from enum import Enum
from pydantic import BaseModel, model_validator

class MaintenanceType(str, Enum):
    TRACK_RENEWAL = "track_renewal"
    RAIL_GRINDING = "rail_grinding"
    BALLAST_CLEANING = "ballast_cleaning"
    OHE_MAINTENANCE = "ohe_maintenance"
    SIGNAL_MAINTENANCE = "signal_maintenance"
    BRIDGE_INSPECTION = "bridge_inspection"
    ROUTINE_INSPECTION = "routine_inspection"
    EMERGENCY_REPAIR = "emergency_repair"

class BlockPriority(int, Enum):
    """Priority levels for maintenance blocks. Higher value = more urgent."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5

class BlockRequest(BaseModel):
    """A request for a maintenance block on a track section.
    
    [DEMO DATA MODEL — Simplified for demonstration]
    """
    id: str
    asset_id: str                   # Which track section
    maintenance_type: MaintenanceType
    priority: BlockPriority
    duration_minutes: int           # How long the block is needed
    earliest_start: int             # Earliest start (minutes from midnight)
    latest_end: int                 # Latest end (minutes from midnight)
    preferred_start: int            # Preferred start time
    requested_by: str = "Engineering Dept"
    crew_required: int = 1          # Number of crew teams needed
    requires_power_block: bool = False  # Whether OHE must be de-energized
    
    @model_validator(mode='after')
    def validate_time_window(self) -> 'BlockRequest':
        if self.latest_end <= self.earliest_start:
            raise ValueError('latest_end must be after earliest_start')
        if self.duration_minutes > (self.latest_end - self.earliest_start):
            raise ValueError('duration exceeds available time window')
        if not (self.earliest_start <= self.preferred_start <= self.latest_end - self.duration_minutes):
            raise ValueError('preferred_start must be within feasible window')
        return self
