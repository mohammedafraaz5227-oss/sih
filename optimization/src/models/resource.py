from enum import Enum
from pydantic import BaseModel

class ResourceType(str, Enum):
    CREW = "crew"
    EQUIPMENT = "equipment"

class AvailabilityWindow(BaseModel):
    start: int   # Minutes from midnight
    end: int     # Minutes from midnight

class Resource(BaseModel):
    """A maintenance resource (crew team or equipment).
    
    [DEMO DATA MODEL]
    """
    id: str
    name: str
    resource_type: ResourceType
    availability: list[AvailabilityWindow]
    capacity: int = 1            # How many concurrent tasks
    zone: str = "Northern Railway"
