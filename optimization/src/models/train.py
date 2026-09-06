from enum import Enum
from pydantic import BaseModel, model_validator

class TrainType(str, Enum):
    RAJDHANI = "rajdhani"
    SHATABDI = "shatabdi"
    SUPERFAST = "superfast"
    EXPRESS = "express"
    PASSENGER = "passenger"
    FREIGHT = "freight"

class SectionMovement(BaseModel):
    """A train's movement through a single track section."""
    asset_id: str                # Track section ID
    entry_time: int              # Minutes from midnight (0-1440)
    exit_time: int               # Minutes from midnight
    
    @model_validator(mode='after')
    def validate_times(self) -> 'SectionMovement':
        if self.exit_time <= self.entry_time:
            raise ValueError('exit_time must be after entry_time')
        return self

class TrainMovement(BaseModel):
    """Complete train movement across the network.
    
    [DEMO DATA — NOT REAL INDIAN RAILWAYS SCHEDULE]
    """
    id: str
    train_number: str            # e.g., "12301"
    name: str                    # e.g., "Rajdhani Express"
    train_type: TrainType
    priority: int                # 1 (highest) to 10 (lowest)
    sections: list[SectionMovement]
