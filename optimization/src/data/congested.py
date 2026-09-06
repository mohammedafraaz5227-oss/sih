"""
Deliberately congested synthetic scenario for railway maintenance block planning.

[DEMO DATA — NOT REAL INDIAN RAILWAYS DATA]

This scenario models a saturated 24-hour corridor where optimization is genuinely
necessary to resolve competing alternatives:
- 11 realistic train movements across 5 track sections (with 15-minute safety buffers)
- 10 maintenance block requests with tight windows, spanning Emergency (P5) to Low (P1)
- Preferred block times deliberately conflict with premium train movements
- Multiple blocks compete for the same track sections
- Only 2 maintenance crew teams available division-wide, creating resource bottlenecks
- Under naive scheduling (blindly granting preferred times), 12 train conflicts,
  over 1,200 minutes of train delay, and severe crew capacity violations occur.
- Under CP-SAT optimization, conflicts and delays are eliminated (0 conflicts) by
  strategically shifting blocks into feasible windows and prioritizing critical work.
"""

from src.models import (
    Asset, AssetType, TrainMovement, SectionMovement, TrainType,
    BlockRequest, MaintenanceType, BlockPriority, Resource, ResourceType,
    AvailabilityWindow, OptimizationRequest
)


def generate_congested_assets() -> list[Asset]:
    """Generate 5 sequential track sections on the Delhi-Agra corridor."""
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


def generate_congested_trains() -> list[TrainMovement]:
    """Generate 11 timetabled train movements.

    [DEMO TIMETABLE — Synthetically verified to have zero intra-train headway conflicts]
    """
    return [
        # T01: Bhopal Shatabdi Express (Down: Delhi -> Agra, Early Morning)
        TrainMovement(
            id="T01", train_number="12002", name="Bhopal Shatabdi",
            train_type=TrainType.SHATABDI, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=360, exit_time=375),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=395, exit_time=440),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=460, exit_time=490),
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=510, exit_time=535),
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=555, exit_time=590),
            ],
        ),
        # T02: NDLS Shatabdi Express (Up: Agra -> Delhi, Evening)
        TrainMovement(
            id="T02", train_number="12001", name="NDLS Shatabdi",
            train_type=TrainType.SHATABDI, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=1050, exit_time=1085),
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=1105, exit_time=1130),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=1185, exit_time=1215),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=1235, exit_time=1280),
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=1300, exit_time=1315),
            ],
        ),
        # T03: Howrah Rajdhani Express (Up: Afternoon)
        TrainMovement(
            id="T03", train_number="12301", name="Howrah Rajdhani",
            train_type=TrainType.RAJDHANI, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=840, exit_time=865),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=885, exit_time=925),
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=945, exit_time=960),
            ],
        ),
        # T04: Intercity Express (Down: Afternoon)
        TrainMovement(
            id="T04", train_number="14212", name="Intercity Express",
            train_type=TrainType.EXPRESS, priority=3,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=1000, exit_time=1020),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=1040, exit_time=1100),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=1120, exit_time=1150),
            ],
        ),
        # T05: NZM Superfast (Up: Mid-Day)
        TrainMovement(
            id="T05", train_number="22413", name="NZM Superfast",
            train_type=TrainType.EXPRESS, priority=3,
            sections=[
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=600, exit_time=630),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=650, exit_time=685),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=705, exit_time=770),
            ],
        ),
        # T06: Freight BCNA Rake (Down: Night / Early Morning)
        TrainMovement(
            id="T06", train_number="58001", name="Freight BCNA Rake",
            train_type=TrainType.FREIGHT, priority=8,
            sections=[
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=60, exit_time=160),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=180, exit_time=250),
            ],
        ),
        # T07: Freight Container Rake (Down: Early Morning)
        TrainMovement(
            id="T07", train_number="58002", name="Freight Container",
            train_type=TrainType.FREIGHT, priority=8,
            sections=[
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=120, exit_time=180),
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=200, exit_time=270),
            ],
        ),
        # T08: Freight Tanker Rake (Up: Late Night)
        TrainMovement(
            id="T08", train_number="58003", name="Freight Tanker",
            train_type=TrainType.FREIGHT, priority=8,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=1350, exit_time=1380),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=1395, exit_time=1435),
            ],
        ),
        # T09: Vande Bharat Express (Down: Morning High-Speed)
        TrainMovement(
            id="T09", train_number="20172", name="Vande Bharat Express",
            train_type=TrainType.SUPERFAST, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=480, exit_time=495),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=515, exit_time=555),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=575, exit_time=605),
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=665, exit_time=690),
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=710, exit_time=745),
            ],
        ),
        # T10: Taj Express (Up: Morning/Mid-day High-Speed)
        TrainMovement(
            id="T10", train_number="12280", name="Taj Express",
            train_type=TrainType.SUPERFAST, priority=2,
            sections=[
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=880, exit_time=915),
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=1010, exit_time=1035),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=1060, exit_time=1090),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=1145, exit_time=1190),
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=1210, exit_time=1225),
            ],
        ),
        # T11: Gatimaan Express (Down: High-Speed Corridor)
        TrainMovement(
            id="T11", train_number="12050", name="Gatimaan Express",
            train_type=TrainType.SUPERFAST, priority=1,
            sections=[
                SectionMovement(asset_id="SEC_NDLS_GZB", entry_time=720, exit_time=735),
                SectionMovement(asset_id="SEC_GZB_ALG", entry_time=810, exit_time=850),
                SectionMovement(asset_id="SEC_ALG_TDK", entry_time=900, exit_time=925),
                SectionMovement(asset_id="SEC_TDK_MTJ", entry_time=945, exit_time=970),
                SectionMovement(asset_id="SEC_MTJ_AGC", entry_time=980, exit_time=1015),
            ],
        ),
    ]


def generate_congested_blocks() -> list[BlockRequest]:
    """Generate 10 maintenance block requests with deliberate conflicts.

    [DEMO MAINTENANCE DEMANDS — Designed to stress test constraint optimization]

    Key conflict features:
    1. Direct Train Collisions at Preferred Times:
       - BR_C01 (Pref 390) clashes with T01 Bhopal Shatabdi (380-455 buffered)
       - BR_C02 (Pref 480) clashes with T09 Vande Bharat (500-570 buffered)
       - BR_C03 (Pref 480) clashes with T09 Vande Bharat (465-510 buffered)
       - BR_C05 (Pref 840) clashes with T03 Howrah Rajdhani (825-880 buffered)
       - BR_C07 (Pref 660) clashes with T09 Vande Bharat (650-705 buffered)
       - BR_C09 (Pref 550) clashes with T01 Bhopal Shatabdi (540-605 buffered)
       - BR_C10 (Pref 980) clashes with T11 Gatimaan Express (965-1030 buffered)
    2. Same-Section Block Competition:
       - SEC_GZB_ALG: BR_C01 (Emergency) vs BR_C02 (High)
       - SEC_NDLS_GZB: BR_C03 (Critical) vs BR_C04 (High)
       - SEC_ALG_TDK: BR_C05 (Medium) vs BR_C06 (Low)
       - SEC_TDK_MTJ: BR_C07 (High) vs BR_C08 (Medium)
    3. Resource Bottleneck:
       - Available crews: 2. Simultaneous demand at peak exceeds 4 crews.
    """
    return [
        # BR_C01: EMERGENCY rail defect repair on GZB-ALG (Pref 390 clashes with T01 Shatabdi)
        BlockRequest(
            id="BR_C01", asset_id="SEC_GZB_ALG",
            maintenance_type=MaintenanceType.EMERGENCY_REPAIR,
            priority=BlockPriority.EMERGENCY,
            duration_minutes=90, earliest_start=270, latest_end=550,
            preferred_start=390, crew_required=1,
            requested_by="Track Safety Division",
        ),
        # BR_C02: HIGH Track renewal on GZB-ALG (Needs 2 crews, clashes with T09 & BR_C01)
        BlockRequest(
            id="BR_C02", asset_id="SEC_GZB_ALG",
            maintenance_type=MaintenanceType.TRACK_RENEWAL,
            priority=BlockPriority.HIGH,
            duration_minutes=150, earliest_start=450, latest_end=720,
            preferred_start=480, crew_required=2,
            requested_by="Civil Engineering",
        ),
        # BR_C03: CRITICAL Catenary OHE breakdown on NDLS-GZB (Pref 480 clashes with T09 Vande Bharat)
        BlockRequest(
            id="BR_C03", asset_id="SEC_NDLS_GZB",
            maintenance_type=MaintenanceType.OHE_MAINTENANCE,
            priority=BlockPriority.CRITICAL,
            duration_minutes=120, earliest_start=450, latest_end=700,
            preferred_start=480, crew_required=1, requires_power_block=True,
            requested_by="Electrical TRD",
        ),
        # BR_C04: HIGH Turnout replacement on NDLS-GZB (Competes on same section as BR_C03)
        BlockRequest(
            id="BR_C04", asset_id="SEC_NDLS_GZB",
            maintenance_type=MaintenanceType.SIGNAL_MAINTENANCE,
            priority=BlockPriority.HIGH,
            duration_minutes=90, earliest_start=450, latest_end=680,
            preferred_start=500, crew_required=1,
            requested_by="Signaling & Telecom",
        ),
        # BR_C05: MEDIUM Ultrasonic Rail Flaw Detection on ALG-TDK (Pref 840 clashes with T03 Rajdhani)
        BlockRequest(
            id="BR_C05", asset_id="SEC_ALG_TDK",
            maintenance_type=MaintenanceType.ROUTINE_INSPECTION,
            priority=BlockPriority.MEDIUM,
            duration_minutes=90, earliest_start=800, latest_end=1050,
            preferred_start=840, crew_required=1,
            requested_by="Track Inspection Wing",
        ),
        # BR_C06: LOW Ballast shoulder cleaning on ALG-TDK (Tight window, clashes with T11 Gatimaan)
        BlockRequest(
            id="BR_C06", asset_id="SEC_ALG_TDK",
            maintenance_type=MaintenanceType.BALLAST_CLEANING,
            priority=BlockPriority.LOW,
            duration_minutes=90, earliest_start=800, latest_end=1020,
            preferred_start=880, crew_required=1,
            requested_by="Track Machines",
        ),
        # BR_C07: HIGH Relay interlocking overhaul on TDK-MTJ (Pref 660 clashes with T09 Vande Bharat)
        BlockRequest(
            id="BR_C07", asset_id="SEC_TDK_MTJ",
            maintenance_type=MaintenanceType.SIGNAL_MAINTENANCE,
            priority=BlockPriority.HIGH,
            duration_minutes=120, earliest_start=640, latest_end=920,
            preferred_start=660, crew_required=1,
            requested_by="Signaling & Telecom",
        ),
        # BR_C08: MEDIUM Bridge expansion joint overhaul on TDK-MTJ (Competes with BR_C07)
        BlockRequest(
            id="BR_C08", asset_id="SEC_TDK_MTJ",
            maintenance_type=MaintenanceType.BRIDGE_INSPECTION,
            priority=BlockPriority.MEDIUM,
            duration_minutes=90, earliest_start=680, latest_end=930,
            preferred_start=700, crew_required=1,
            requested_by="Bridge Engineering",
        ),
        # BR_C09: CRITICAL Mast alignment on MTJ-AGC (Pref 550 clashes with T01 Bhopal Shatabdi)
        BlockRequest(
            id="BR_C09", asset_id="SEC_MTJ_AGC",
            maintenance_type=MaintenanceType.OHE_MAINTENANCE,
            priority=BlockPriority.CRITICAL,
            duration_minutes=90, earliest_start=500, latest_end=700,
            preferred_start=550, crew_required=1, requires_power_block=True,
            requested_by="Electrical TRD",
        ),
        # BR_C10: LOW Sleeper packing & tamping on MTJ-AGC (Pref 980 clashes with T11 Gatimaan)
        BlockRequest(
            id="BR_C10", asset_id="SEC_MTJ_AGC",
            maintenance_type=MaintenanceType.ROUTINE_INSPECTION,
            priority=BlockPriority.LOW,
            duration_minutes=90, earliest_start=900, latest_end=1150,
            preferred_start=980, crew_required=1,
            requested_by="Permanent Way",
        ),
    ]


def generate_congested_resources() -> list[Resource]:
    """Generate 2 maintenance crew teams, representing tight resource capacity.

    [DEMO RESOURCE LIMIT — Only 2 crews available for 10 competing tasks]
    """
    return [
        Resource(
            id="CREW_NORTH_1", name="Maintenance Gang Alpha (24h)",
            resource_type=ResourceType.CREW,
            availability=[AvailabilityWindow(start=0, end=1440)],
            capacity=1, zone="Northern Railway",
        ),
        Resource(
            id="CREW_NORTH_2", name="Maintenance Gang Beta (24h)",
            resource_type=ResourceType.CREW,
            availability=[AvailabilityWindow(start=0, end=1440)],
            capacity=1, zone="North Central Railway",
        ),
    ]


def generate_congested_data() -> OptimizationRequest:
    """Generate a complete congested scenario OptimizationRequest."""
    return OptimizationRequest(
        assets=generate_congested_assets(),
        trains=generate_congested_trains(),
        block_requests=generate_congested_blocks(),
        resources=generate_congested_resources(),
        config={"crew_capacity": 2},
    )
