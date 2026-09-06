"""
Synthetic demo data for a Delhi-Agra railway corridor.

[DEMO DATA — NOT REAL INDIAN RAILWAYS DATA]

All station names, train numbers, timings, and operational parameters
are synthetic and created for demonstration purposes only. They do not
represent actual Indian Railways schedules, assets, or operations.

The corridor is modeled as 5 sequential track sections with realistic
distances and speed limits. Train timings are designed to avoid
overlapping on the same section (accounting for safety buffers),
which reflects single-line block working.
"""

from src.models import (
    Asset, AssetType, TrainMovement, SectionMovement, TrainType,
    BlockRequest, MaintenanceType, BlockPriority, Resource, ResourceType,
    AvailabilityWindow, OptimizationRequest
)


def generate_demo_assets() -> list[Asset]:
    """Generate 5 track sections on the Delhi-Agra corridor.

    [DEMO DATA — NOT REAL INDIAN RAILWAYS INFRASTRUCTURE]
    """
    return [
        Asset(
            id="SEC_NDLS_GZB", name="New Delhi to Ghaziabad",
            asset_type=AssetType.TRACK_SECTION, line="Delhi-Agra Corridor",
            zone="Northern Railway", division="Delhi Division",
            start_km=0, end_km=30, max_speed_kmph=130,
        ),
        Asset(
            id="SEC_GZB_ALG", name="Ghaziabad to Aligarh",
            asset_type=AssetType.TRACK_SECTION, line="Delhi-Agra Corridor",
            zone="Northern Railway", division="Delhi Division",
            start_km=30, end_km=120, max_speed_kmph=130,
        ),
        Asset(
            id="SEC_ALG_TDK", name="Aligarh to Tundla",
            asset_type=AssetType.TRACK_SECTION, line="Delhi-Agra Corridor",
            zone="North Central Railway", division="Prayagraj Division",
            start_km=120, end_km=170, max_speed_kmph=120,
        ),
        Asset(
            id="SEC_TDK_MTJ", name="Tundla to Mathura",
            asset_type=AssetType.TRACK_SECTION, line="Delhi-Agra Corridor",
            zone="North Central Railway", division="Agra Division",
            start_km=170, end_km=210, max_speed_kmph=110,
        ),
        Asset(
            id="SEC_MTJ_AGC", name="Mathura to Agra Cantt",
            asset_type=AssetType.TRACK_SECTION, line="Delhi-Agra Corridor",
            zone="North Central Railway", division="Agra Division",
            start_km=210, end_km=265, max_speed_kmph=110,
        ),
    ]


def generate_demo_trains() -> list[TrainMovement]:
    """Generate 8 train movements with non-overlapping section occupancy.

    [DEMO DATA — NOT REAL INDIAN RAILWAYS SCHEDULE]

    Timings are designed so that no two trains occupy the same track section
    simultaneously (with sufficient headway for the 15-minute safety buffer).
    This models single-direction block working on each section.
    """
    return [
        # --- Morning Shatabdi (Down: Delhi → Agra), departs 06:00 ---
        TrainMovement(
            id="T1", train_number="12002", name="Bhopal Shatabdi",
            train_type=TrainType.SHATABDI, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=360, exit_time=375),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=395, exit_time=440),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=460, exit_time=490),
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=510, exit_time=535),
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=555, exit_time=590),
            ],
        ),
        # --- Evening Shatabdi (Up: Agra → Delhi), departs 17:30 ---
        TrainMovement(
            id="T2", train_number="12001", name="NDLS Shatabdi",
            train_type=TrainType.SHATABDI, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=1050, exit_time=1085),
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=1105, exit_time=1130),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=1185, exit_time=1215),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=1235, exit_time=1280),
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=1300, exit_time=1315),
            ],
        ),
        # --- Rajdhani (Up: partial route, arrives Delhi afternoon) ---
        TrainMovement(
            id="T3", train_number="12301", name="Howrah Rajdhani",
            train_type=TrainType.RAJDHANI, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=840, exit_time=865),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=885, exit_time=925),
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=945, exit_time=960),
            ],
        ),
        # --- Intercity Express (Down: partial route, afternoon) ---
        TrainMovement(
            id="T4", train_number="14212", name="Intercity Express",
            train_type=TrainType.EXPRESS, priority=3,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=1000, exit_time=1020),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=1040, exit_time=1100),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=1120, exit_time=1150),
            ],
        ),
        # --- Express (Up: partial route, morning) ---
        TrainMovement(
            id="T5", train_number="22413", name="NZM Superfast",
            train_type=TrainType.EXPRESS, priority=3,
            sections=[
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=600, exit_time=630),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=650, exit_time=685),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=705, exit_time=770),
            ],
        ),
        # --- Freight A (Down: night/early morning, slow) ---
        TrainMovement(
            id="T6", train_number="58001", name="Freight BCNA Rake",
            train_type=TrainType.FREIGHT, priority=8,
            sections=[
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=60, exit_time=160),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=180, exit_time=250),
            ],
        ),
        # --- Freight B (Down: early morning, different sections) ---
        TrainMovement(
            id="T7", train_number="58002", name="Freight Container",
            train_type=TrainType.FREIGHT, priority=8,
            sections=[
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=120, exit_time=180),
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=200, exit_time=270),
            ],
        ),
        # --- Freight C (Up: late evening, slow) ---
        TrainMovement(
            id="T8", train_number="58003", name="Freight Tanker",
            train_type=TrainType.FREIGHT, priority=8,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=1350, exit_time=1380),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=1395, exit_time=1435),
            ],
        ),
    ]


def generate_demo_blocks() -> list[BlockRequest]:
    """Generate 8 maintenance block requests with varying priorities.

    [DEMO DATA — NOT REAL INDIAN RAILWAYS MAINTENANCE REQUESTS]

    Blocks are designed to create interesting optimization scenarios:
    - Some have tight windows that conflict with trains
    - Some have wide windows with flexibility
    - Priorities range from Emergency to Low
    - Multiple blocks on the same section test no-overlap constraints
    """
    return [
        # CRITICAL: Emergency track repair on GZB-ALG, early morning
        # Tight window, conflicts with Freight A
        BlockRequest(
            id="BR_001", asset_id="SEC_GZB_ALG",
            maintenance_type=MaintenanceType.EMERGENCY_REPAIR,
            priority=BlockPriority.CRITICAL,
            duration_minutes=90, earliest_start=60, latest_end=350,
            preferred_start=180, crew_required=2,
        ),
        # HIGH: Track renewal on ALG-TDK, daytime
        # Wide window, needs to work around multiple trains
        BlockRequest(
            id="BR_002", asset_id="SEC_ALG_TDK",
            maintenance_type=MaintenanceType.TRACK_RENEWAL,
            priority=BlockPriority.HIGH,
            duration_minutes=120, earliest_start=270, latest_end=830,
            preferred_start=500, crew_required=2,
        ),
        # HIGH: OHE maintenance on NDLS-GZB, early morning
        # Needs power block, tight window before Shatabdi
        BlockRequest(
            id="BR_003", asset_id="SEC_NDLS_GZB",
            maintenance_type=MaintenanceType.OHE_MAINTENANCE,
            priority=BlockPriority.HIGH,
            duration_minutes=120, earliest_start=60, latest_end=340,
            preferred_start=120, requires_power_block=True,
        ),
        # MEDIUM: Routine inspection on TDK-MTJ
        # Flexible window
        BlockRequest(
            id="BR_004", asset_id="SEC_TDK_MTJ",
            maintenance_type=MaintenanceType.ROUTINE_INSPECTION,
            priority=BlockPriority.MEDIUM,
            duration_minutes=90, earliest_start=240, latest_end=580,
            preferred_start=400,
        ),
        # MEDIUM: Rail grinding on MTJ-AGC
        # Wide window, long duration
        BlockRequest(
            id="BR_005", asset_id="SEC_MTJ_AGC",
            maintenance_type=MaintenanceType.RAIL_GRINDING,
            priority=BlockPriority.MEDIUM,
            duration_minutes=180, earliest_start=300, latest_end=1040,
            preferred_start=600,
        ),
        # LOW: Bridge inspection on GZB-ALG (same section as BR_001)
        # Flexible, but competes with BR_001 for section time
        BlockRequest(
            id="BR_006", asset_id="SEC_GZB_ALG",
            maintenance_type=MaintenanceType.BRIDGE_INSPECTION,
            priority=BlockPriority.LOW,
            duration_minutes=60, earliest_start=780, latest_end=1190,
            preferred_start=880,
        ),
        # EMERGENCY: Signal fault on ALG-TDK
        # Highest priority, short duration, urgent
        BlockRequest(
            id="BR_007", asset_id="SEC_ALG_TDK",
            maintenance_type=MaintenanceType.SIGNAL_MAINTENANCE,
            priority=BlockPriority.EMERGENCY,
            duration_minutes=45, earliest_start=700, latest_end=835,
            preferred_start=720,
        ),
        # LOW: Ballast cleaning on NDLS-GZB
        # Flexible window, can be deferred
        BlockRequest(
            id="BR_008", asset_id="SEC_NDLS_GZB",
            maintenance_type=MaintenanceType.BALLAST_CLEANING,
            priority=BlockPriority.LOW,
            duration_minutes=90, earliest_start=400, latest_end=940,
            preferred_start=500,
        ),
    ]


def generate_demo_resources() -> list[Resource]:
    """Generate 3 maintenance crew teams.

    [DEMO DATA — NOT REAL INDIAN RAILWAYS RESOURCE DATA]
    """
    return [
        Resource(
            id="CREW_ALPHA", name="Crew Alpha (Day Shift)",
            resource_type=ResourceType.CREW,
            availability=[AvailabilityWindow(start=360, end=1200)],  # 06:00-20:00
            zone="Northern Railway",
        ),
        Resource(
            id="CREW_BETA", name="Crew Beta (Night/Early Shift)",
            resource_type=ResourceType.CREW,
            availability=[AvailabilityWindow(start=0, end=720)],  # 00:00-12:00
            zone="Northern Railway",
        ),
        Resource(
            id="CREW_GAMMA", name="Crew Gamma (Full Day)",
            resource_type=ResourceType.CREW,
            availability=[AvailabilityWindow(start=0, end=1440)],  # 00:00-24:00
            zone="North Central Railway",
        ),
    ]


def generate_demo_data() -> OptimizationRequest:
    """Generate a complete synthetic optimization request.

    [DEMO DATA — NOT REAL INDIAN RAILWAYS DATA]

    Returns an OptimizationRequest with:
    - 5 track sections (Delhi-Agra corridor)
    - 8 trains (2 Shatabdi, 1 Rajdhani, 2 Express, 3 Freight)
    - 8 block requests (1 Emergency, 1 Critical, 2 High, 2 Medium, 2 Low)
    - 3 maintenance crews
    """
    return OptimizationRequest(
        assets=generate_demo_assets(),
        trains=generate_demo_trains(),
        block_requests=generate_demo_blocks(),
        resources=generate_demo_resources(),
    )


def generate_demo_request() -> dict:
    """Generate demo data as a JSON-serializable dictionary."""
    return generate_demo_data().model_dump()
