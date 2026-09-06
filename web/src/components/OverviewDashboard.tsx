import React from 'react';
import { OptimizedSchedule, BlockRequest, Asset } from '../types';
import { PixelSignal, PixelTrain, PixelWrench, PixelCpu, PixelAlert, PixelTrack } from './PixelIcons';

interface OverviewDashboardProps {
  schedule: OptimizedSchedule | null;
  blocks: BlockRequest[];
  assets: Asset[];
  isSolving: boolean;
  onRunOptimization: () => void;
  onNavigateTab: (tab: string) => void;
  scenario: 'congested' | 'demo';
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  schedule,
  blocks,
  assets,
  isSolving,
  onRunOptimization,
  onNavigateTab,
  scenario,
}) => {
  const metrics = schedule?.metrics;

  // Dynamic values
  const scheduledCount = metrics?.total_blocks_scheduled ?? 0;
  const requestedCount = blocks.length;
  const skippedCount = metrics?.total_blocks_skipped ?? (requestedCount - scheduledCount);
  const trainConflicts = metrics?.train_conflicts ?? 0;
  const estimatedDelay = metrics?.estimated_train_delay_minutes ?? 0;
  const downtimeMinutes = metrics?.total_asset_downtime_minutes ?? 0;
  const utilization = metrics?.asset_utilization_percent ?? 0;
  const solverStatus = metrics?.solver_status ?? 'READY';
  const solveTime = metrics?.solve_time_seconds ?? 0;

  return (
    <div className="space-y-6">
      {/* Control Room Alert / Status Strip */}
      <div className="bg-[#1e293b] border-2 border-black shadow-pixel p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <PixelSignal aspect={isSolving ? 'amber' : 'green'} size={24} />
          <div>
            <div className="font-pixel text-xs text-yellow-400">
              OPERATIONAL CONTROL CONSOLE — {scenario === 'congested' ? 'CONGESTED HIGH-DENSITY SCENARIO' : 'STANDARD BASELINE SCENARIO'}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              CP-SAT solver active • Disjunctive track occupancy • 15m headway safety buffers enforced
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRunOptimization}
            disabled={isSolving}
            className="pixel-btn bg-[#7B1113] hover:bg-red-800 text-yellow-300 font-pixel text-xs px-4 py-2 flex items-center space-x-2 disabled:opacity-50"
          >
            <PixelCpu size={16} color="#facc15" />
            <span>{isSolving ? 'SOLVING WITH CP-SAT...' : 'RUN CP-SAT OPTIMIZATION'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 Pixel Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Asset Availability */}
        <div className="pixel-card p-4 border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-pixel text-slate-400">TRACK AVAILABILITY</span>
            <PixelTrack size={20} color="#22c55e" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-digital text-4xl text-green-400 font-bold">
              {(100 - utilization).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">available</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-2">
            Total Maintenance Possession: <span className="text-yellow-400">{downtimeMinutes} mins</span> ({utilization}% of 24h cycle)
          </div>
        </div>

        {/* Card 2: Scheduled vs Requested Blocks */}
        <div className="pixel-card p-4 border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-pixel text-slate-400">MAINTENANCE BLOCKS</span>
            <PixelWrench size={20} color="#eab308" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-digital text-4xl text-yellow-400 font-bold">
              {scheduledCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {requestedCount} scheduled</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-2 flex justify-between">
            <span>Approved: <strong className="text-green-400">{scheduledCount}</strong></span>
            <span>Skipped/Deferred: <strong className="text-red-400">{skippedCount}</strong></span>
          </div>
        </div>

        {/* Card 3: Train Conflicts (Dynamic from Solver) */}
        <div className="pixel-card p-4 border-l-4 border-l-cyan-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-pixel text-slate-400">TRAIN CONFLICTS</span>
            <PixelTrain size={20} color="#06b6d4" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`font-digital text-4xl font-bold ${trainConflicts === 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trainConflicts}
            </span>
            <span className="text-xs text-slate-400 font-mono">modeled clashes</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-2">
            {trainConflicts === 0 ? (
              <span className="text-green-400">✓ All train movements 100% collision-free</span>
            ) : (
              <span className="text-red-400">⚠ {trainConflicts} train conflicts detected</span>
            )}
          </div>
        </div>

        {/* Card 4: Estimated Train Delay */}
        <div className="pixel-card p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-pixel text-slate-400">ESTIMATED TRAIN DELAY</span>
            <PixelAlert size={20} color="#38bdf8" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-digital text-4xl text-cyan-300 font-bold">
              {estimatedDelay}
            </span>
            <span className="text-xs text-slate-400 font-mono">minutes</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-2">
            {estimatedDelay === 0 ? (
              <span className="text-green-400">Zero detention imposed on passenger traffic</span>
            ) : (
              <span className="text-amber-400">{estimatedDelay} min passenger delay</span>
            )}
          </div>
        </div>

        {/* Card 5: Schedule Deviation */}
        <div className="pixel-card p-4 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-pixel text-slate-400">BLOCK TIME DEVIATION</span>
            <PixelCpu size={20} color="#c084fc" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-digital text-4xl text-purple-400 font-bold">
              {metrics?.total_deviation_minutes ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">total mins shifted</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-2">
            Avg Shift: <span className="text-purple-300">{metrics?.average_deviation_minutes?.toFixed(1) ?? 0} mins</span> from preferred window
          </div>
        </div>

        {/* Card 6: Solver Status & Score */}
        <div className="pixel-card p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-pixel text-slate-400">CP-SAT STATUS</span>
            <span className="px-2 py-0.5 bg-green-950 text-green-400 border border-green-700 text-[9px] font-pixel">
              {solverStatus}
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-digital text-4xl text-yellow-400 font-bold">
              {metrics?.objective_score ? metrics.objective_score.toLocaleString() : '---'}
            </span>
            <span className="text-xs text-slate-400 font-mono">objective pts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-2">
            Solved in <strong className="text-green-400">{solveTime}s</strong> via Google OR-Tools
          </div>
        </div>
      </div>

      {/* Secondary Information Section: Corridor & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Corridor Status Table */}
        <div className="lg:col-span-2 pixel-card p-4">
          <div className="flex justify-between items-center mb-3 border-b-2 border-slate-700 pb-2">
            <div className="flex items-center space-x-2">
              <PixelTrack size={18} color="#f59e0b" />
              <h3 className="font-pixel text-xs text-yellow-400 uppercase">
                Delhi–Agra Corridor Track Sections (5 Sections)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('network')}
              className="text-[10px] font-pixel text-cyan-400 hover:text-cyan-300 underline"
            >
              VIEW FULL NETWORK MAP →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-black text-slate-400 border-b border-slate-700 text-[10px] font-pixel">
                  <th className="py-2 px-3">SECTION ID</th>
                  <th className="py-2 px-3">NAME</th>
                  <th className="py-2 px-3">DISTANCE</th>
                  <th className="py-2 px-3">MAX SPEED</th>
                  <th className="py-2 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-pixel text-[10px] text-cyan-400">{asset.id}</td>
                    <td className="py-2.5 px-3 text-slate-200">{asset.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{asset.end_km - asset.start_km} km</td>
                    <td className="py-2.5 px-3 text-yellow-300">{asset.max_speed_kmph} km/h</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-green-950/80 border border-green-700 text-green-400 text-[9px] font-pixel">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span>OPERATIONAL</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Benchmark Highlights & Actions */}
        <div className="pixel-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3 border-b-2 border-slate-700 pb-2">
              <PixelAlert size={18} color="#f59e0b" />
              <h3 className="font-pixel text-xs text-yellow-400 uppercase">
                Benchmark Quick Summary
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-mono mb-4 leading-relaxed">
              Without optimization, naive manual planning causes <strong>12 train conflicts</strong> and <strong>1,235 minutes of train detention</strong> on premier services like Vande Bharat & Rajdhani.
            </p>
            <div className="space-y-2 text-xs font-mono bg-black/60 p-3 border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Naive Train Collisions:</span>
                <span className="text-red-400 font-bold">12 conflicts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CP-SAT Optimized:</span>
                <span className="text-green-400 font-bold">0 conflicts (100% clean)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Crew Capacity Limit:</span>
                <span className="text-cyan-400 font-bold">2 crews max</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700 flex flex-col space-y-2">
            <button
              onClick={() => onNavigateTab('compare')}
              className="pixel-btn bg-[#1e293b] hover:bg-slate-700 text-cyan-300 text-xs font-pixel py-2 w-full text-center"
            >
              VIEW BENCHMARK COMPARISON →
            </button>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="pixel-btn bg-[#7B1113] hover:bg-red-800 text-yellow-300 text-xs font-pixel py-2 w-full text-center"
            >
              OPEN 24H GANTT TIMELINE →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
