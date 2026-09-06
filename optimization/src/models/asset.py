from enum import Enum
from pydantic import BaseModel

class AssetType(str, Enum):
    TRACK_SECTION = "track_section"
    STATION = "station"
    CROSSING = "crossing"
    SIGNAL = "signal"
    BRIDGE = "bridge"

class Asset(BaseModel):
    """Railway infrastructure asset.
    
    [DEMO DATA MODEL — Simplified for demonstration purposes]
    """
    id: str
    name: str
    asset_type: AssetType
    line: str                    # e.g., "Delhi-Agra Corridor"
    zone: str                    # e.g., "Northern Railway"
    division: str                # e.g., "Agra Division"
    start_km: float              # Kilometer marker start
    end_km: float                # Kilometer marker end
    max_speed_kmph: int = 130    # Max permissible speed
    electrified: bool = True
    status: str = "operational"  # operational | under_maintenance | restricted
