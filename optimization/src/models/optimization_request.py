from pydantic import BaseModel
from .asset import Asset
from .train import TrainMovement
from .block_request import BlockRequest
from .resource import Resource

class OptimizationRequest(BaseModel):
    """Bundle of all inputs for the optimizer."""
    assets: list[Asset]
    trains: list[TrainMovement]
    block_requests: list[BlockRequest]
    resources: list[Resource] = []
    config: dict = {}  # Override solver config
