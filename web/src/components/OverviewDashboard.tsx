import React, { useState } from 'react';
import {
  OptimizedSchedule,
  BlockRequest,
  Asset,
  ScheduleComparison,
  Station,
  TrainMovement,
} from '../types';
import { LiveCorridorVisualizer } from './controlroom/LiveCorridorVisualizer';
import { OptimizationEngineCard } from './controlroom/OptimizationEngineCard';
import { CorridorKPIBento } from './controlroom/CorridorKPIBento';
import { LiveDispatchTicker } from './controlroom/LiveDispatchTicker';
import { CorridorTimeline24H } from './controlroom/CorridorTimeline24H';
import { BentoGrid } from './ui/BentoGrid';

interface OverviewDashboardProps {
  schedule: OptimizedSchedule | null;
  comparison: ScheduleComparison | null;
  blocks: BlockRequest[];
  assets: Asset[];
  stations: Station[];
  trains: TrainMovement[];
  isSolving: boolean;
  onRunOptimization: () => void;
  onNavigateTab: (tab: string) => void;
  scenario: 'congested' | 'demo';
  onToggleScenario?: (scenario: 'congested' | 'demo') => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  schedule,
  comparison,
  blocks,
  assets,
  stations,
  trains,
  isSolving,
  onRunOptimization,
  onNavigateTab,
  scenario,
  onToggleScenario = () => {},
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('NDLS');

  const metrics = schedule?.metrics;

  // Dynamically calculate metrics strictly from repository and solver data
  const scheduledBlocks = schedule?.blocks.filter((b) => b.is_scheduled) || [];
  const scheduledCount = scheduledBlocks.length;
  const requestedCount = blocks.length;

  // Maintenance Occupancy / Utilization Calculation:
  // Formula: (Total Scheduled Block Mins / (1440 * Number of Track Sections)) * 100%
  const numSections = assets.length > 0 ? assets.length : 5;
  const totalCorridorMinutes = 1440 * numSections;
  const totalScheduledBlockMinutes = scheduledBlocks.reduce(
    (acc, b) => acc + b.duration_minutes,
    0
  );
  const maintenanceOccupancyPercent =
    totalCorridorMinutes > 0
      ? (totalScheduledBlockMinutes / totalCorridorMinutes) * 100
      : 8.33;
  const trackAvailabilityPercent = 100 - maintenanceOccupancyPercent;

  const trainDelayMinutes = metrics?.estimated_train_delay_minutes ?? 0;

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* 1. PRIMARY HERO CENTERPIECE: Live Corridor Visualizer & Moving Trains */}
      <section className="w-full">
        <LiveCorridorVisualizer
          stations={stations}
          assets={assets}
          trains={trains}
          scheduledBlocks={scheduledBlocks}
          selectedId={selectedStationId}
          onSelectStation={(code) => setSelectedStationId(code)}
          onSelectTrack={(trackId) => setSelectedStationId(trackId)}
          isSolving={isSolving}
        />
      </section>

      {/* 2. MIDDLE BENTO GRID: Telemetry, CP-SAT Engine & Live Dispatch */}
      <section className="w-full">
        <BentoGrid className="grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Bento Card 1: CP-SAT Solver Engine (Span 4) */}
          <div className="lg:col-span-4">
            <OptimizationEngineCard
              metrics={metrics}
              isSolving={isSolving}
              onRunOptimization={onRunOptimization}
              scheduledCount={scheduledCount}
              totalRequested={requestedCount}
              scenario={scenario}
              onToggleScenario={onToggleScenario}
            />
          </div>

          {/* Bento Card 2: Corridor Telemetry Gauges (Span 5) */}
          <div className="lg:col-span-5">
            <CorridorKPIBento
              occupancyPercent={maintenanceOccupancyPercent}
              trainDelayMinutes={trainDelayMinutes}
              availabilityPercent={trackAvailabilityPercent}
            />
          </div>

          {/* Bento Card 3: Live Dispatch Activity Ticker (Span 3) */}
          <div className="lg:col-span-3">
            <LiveDispatchTicker scenario={scenario} />
          </div>
        </BentoGrid>
      </section>

      {/* 3. BOTTOM HERO: 24-Hour Operations Timeline with Laser Scrubber */}
      <section className="w-full">
        <CorridorTimeline24H
          assets={assets}
          trains={trains}
          scheduledBlocks={scheduledBlocks}
        />
      </section>
    </div>
  );
};
