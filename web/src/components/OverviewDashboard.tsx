import React, { useState } from 'react';
import { OptimizedSchedule, BlockRequest, Asset, ScheduleComparison, Station, TrainMovement } from '../types';
import { CorridorStepperCard } from './reference/CorridorStepperCard';
import { CorridorMetricsCard } from './reference/CorridorMetricsCard';
import { LiveCorridorMapCard } from './reference/LiveCorridorMapCard';
import { Timeline24HCard } from './reference/Timeline24HCard';
import { OptimizationStatusCard } from './reference/OptimizationStatusCard';
import { RecentActivityCard } from './reference/RecentActivityCard';
import { ControlRoomAnimatedFloor } from './reference/ControlRoomAnimatedFloor';

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
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('NDLS');

  const metrics = schedule?.metrics;

  // Dynamic values calculated directly from current repository & schedule
  const scheduledBlocks = schedule?.blocks.filter(b => b.is_scheduled) || [];
  const scheduledCount = scheduledBlocks.length;
  const requestedCount = blocks.length;

  // Maintenance Occupancy / Utilization Calculation:
  // Formula: (Total Scheduled Block Mins / (1440 * Number of Track Sections)) * 100%
  const numSections = assets.length > 0 ? assets.length : 5;
  const totalCorridorMinutes = 1440 * numSections;
  const totalScheduledBlockMinutes = scheduledBlocks.reduce((acc, b) => acc + b.duration_minutes, 0);
  const maintenanceOccupancyPercent = totalCorridorMinutes > 0
    ? (totalScheduledBlockMinutes / totalCorridorMinutes) * 100
    : 8.33;
  const trackAvailabilityPercent = 100 - maintenanceOccupancyPercent;

  const trainDelayMinutes = metrics?.estimated_train_delay_minutes ?? 0;

  return (
    <div className="space-y-4">
      {/* Upper 3-Column Dashboard Grid Matching Reference Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column (Span 2): Corridor Vertical Stepper & Corridor Metrics */}
        <div className="lg:col-span-2 flex flex-col space-y-3.5">
          <div className="flex-1 min-h-[210px]">
            <CorridorStepperCard
              stations={stations}
              selectedId={selectedStationId}
              onSelectStation={(code) => setSelectedStationId(code)}
            />
          </div>
          <div className="h-auto">
            <CorridorMetricsCard
              occupancyPercent={maintenanceOccupancyPercent}
              trainDelayMinutes={trainDelayMinutes}
              availabilityPercent={trackAvailabilityPercent}
            />
          </div>
        </div>

        {/* Center Column (Span 7): Live Corridor Map & 24-Hour Timeline */}
        <div className="lg:col-span-7 flex flex-col space-y-3.5">
          {/* Centerpiece 1: Live Corridor Map */}
          <div className="flex-1">
            <LiveCorridorMapCard
              stations={stations}
              assets={assets}
              trains={trains}
              scheduledBlocks={scheduledBlocks}
              selectedId={selectedStationId}
              onSelectStation={(code) => setSelectedStationId(code)}
              onSelectTrack={(trackId) => setSelectedStationId(trackId)}
            />
          </div>

          {/* Centerpiece 2: 24-Hour Timeline (IST) */}
          <div className="h-auto">
            <Timeline24HCard
              assets={assets}
              trains={trains}
              scheduledBlocks={scheduledBlocks}
            />
          </div>
        </div>

        {/* Right Column (Span 3): Optimization Status & Recent Activity */}
        <div className="lg:col-span-3 flex flex-col space-y-3.5">
          <div className="flex-1 min-h-[210px]">
            <OptimizationStatusCard
              metrics={metrics}
              isSolving={isSolving}
              onRunOptimization={onRunOptimization}
              scheduledCount={scheduledCount}
              totalRequested={requestedCount}
            />
          </div>
          <div className="h-auto">
            <RecentActivityCard
              scenario={scenario}
            />
          </div>
        </div>
      </div>

      {/* Bottom Area: Full-Width Detailed Pixel-Art Control Room Scene with Animated Characters */}
      <ControlRoomAnimatedFloor
        isSolving={isSolving}
        onTriggerSolve={onRunOptimization}
      />
    </div>
  );
};
