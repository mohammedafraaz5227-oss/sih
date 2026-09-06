export type AssetType = 'track_section' | 'station' | 'crossing' | 'signal' | 'bridge';

export interface Station {
  id: string;
  code: string;
  name: string;
  km: number;
  platforms: number;
  division: string;
  zone: string;
}

export interface Asset {
  id: string;
  name: string;
  asset_type: AssetType;
  line: string;
  zone: string;
  division: string;
  start_km: number;
  end_km: number;
  max_speed_kmph: number;
  electrified: boolean;
  status: 'operational' | 'under_maintenance' | 'restricted';
}

export type TrainType = 'rajdhani' | 'shatabdi' | 'superfast' | 'express' | 'passenger' | 'freight';

export interface SectionMovement {
  asset_id: string;
  entry_time: number; // Minutes from midnight (0-1440)
  exit_time: number;  // Minutes from midnight
}

export interface TrainMovement {
  id: string;
  train_number: string;
  name: string;
  train_type: TrainType;
  priority: number;
  sections: SectionMovement[];
}

export type MaintenanceType =
  | 'track_renewal'
  | 'rail_grinding'
  | 'ballast_cleaning'
  | 'ohe_maintenance'
  | 'signal_maintenance'
  | 'bridge_inspection'
  | 'routine_inspection'
  | 'emergency_repair';

export type BlockPriority = 1 | 2 | 3 | 4 | 5;

export interface BlockRequest {
  id: string;
  asset_id: string;
  maintenance_type: MaintenanceType;
  priority: BlockPriority;
  duration_minutes: number;
  earliest_start: number; // Minutes from midnight
  latest_end: number;
  preferred_start: number;
  requested_by: string;
  crew_required: number;
  requires_power_block: boolean;
  status?: 'pending' | 'scheduled' | 'rejected' | 'completed';
}

export interface ScheduledBlock {
  block_request_id: string;
  asset_id: string;
  asset_name: string;
  maintenance_type: string;
  priority: number;
  scheduled_start: number;
  scheduled_end: number;
  duration_minutes: number;
  preferred_start: number;
  deviation_minutes: number;
  affected_trains: string[];
  is_scheduled: boolean;
  skip_reason?: string | null;
}

export interface ScheduleMetrics {
  total_blocks_requested: number;
  total_blocks_scheduled: number;
  total_blocks_skipped: number;
  objective_score: number;
  total_affected_trains: number;
  total_deviation_minutes: number;
  average_deviation_minutes: number;
  asset_utilization_percent: number;
  solve_time_seconds: number;
  solver_status: string;
  train_conflicts: number;
  estimated_train_delay_minutes: number;
  resource_conflicts: number;
  total_asset_downtime_minutes: number;
}

export interface OptimizedSchedule {
  id: string;
  name: string;
  planning_horizon_minutes: number;
  created_at: string;
  solver_config: Record<string, any>;
  blocks: ScheduledBlock[];
  metrics: ScheduleMetrics;
  warnings: string[];
  demo_disclaimer: string;
}

export interface ComparisonMetrics {
  scheduler_type: string;
  blocks_requested: number;
  blocks_scheduled: number;
  blocks_skipped: number;
  train_conflicts: number;
  estimated_train_delay_minutes: number;
  affected_trains_count: number;
  affected_trains: string[];
  total_deviation_minutes: number;
  average_deviation_minutes: number;
  asset_downtime_minutes: number;
  asset_utilization_percent: number;
  resource_conflicts: number;
  max_crews_demanded: number;
  crew_capacity: number;
  objective_score: number;
  solver_status: string;
  runtime_seconds: number;
}

export interface ScheduleComparison {
  scenario_name: string;
  planning_horizon_minutes: number;
  naive_plan: ComparisonMetrics;
  optimized_plan: ComparisonMetrics;
  improvement_summary: {
    train_conflicts_eliminated: number;
    train_conflicts_reduction_percent: number;
    train_delay_saved_minutes: number;
    train_delay_reduction_percent: number;
    resource_conflicts_resolved: number;
    objective_score_delta: number;
    safety_compliance: string;
  };
  demo_disclaimer: string;
}
