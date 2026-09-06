import React from 'react';
import { OptimizedSchedule } from '../types';
import { PixelCpu, PixelSignal, PixelWrench } from './PixelIcons';

interface OptimizationPanelProps {
  schedule: OptimizedSchedule | null;
  isSolving: boolean;
  onRunOptimization: () => void;
  scenario: 'congested' | 'demo';
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  schedule,
  isSolving,
  onRunOptimization,
  scenario,
}) => {
  const metrics = schedule?.metrics;

  return (
    <div className="space-y-6">
      {/* Solver Control Banner */}
      <div className="pixel-card p-5 bg-[#111827] border-2 border-black flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-black border-2 border-slate-700 shadow-pixel-sm">
            <PixelCpu size={28} color="#06b6d4" />
          </div>
          <div>
            <h2 className="font-pixel text-sm text-yellow-400 uppercase">
              Google OR-Tools CP-SAT Optimization Engine
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Constraint Programming • Disjunctive Track Occupancy • 15m Safety Buffer • Multi-Threaded Parallel Search
            </p>
          </div>
        </div>

        <button
          onClick={onRunOptimization}
          disabled={isSolving}
          className="pixel-btn bg-[#7B1113] hover:bg-red-800 text-yellow-300 font-pixel text-xs px-6 py-3 flex items-center space-x-2 disabled:opacity-50"
        >
          <PixelCpu size={16} color="#facc15" />
          <span>{isSolving ? 'SOLVING WITH CP-SAT...' : 'EXECUTE CP-SAT SOLVER'}</span>
        </button>
      </div>

      {/* Solving Loading Indicator */}
      {isSolving && (
        <div className="pixel-card p-6 bg-black/80 border-2 border-yellow-500 text-center space-y-3">
          <div className="flex justify-center">
            <PixelSignal aspect="amber" size={32} />
          </div>
          <div className="font-pixel text-xs text-yellow-400 animate-pulse">
            FORMULATING INTEGER DOMAINS & EXECUTING CP-SAT SEARCH WORKERS...
          </div>
          <div className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Propagating track section NoOverlap constraints and cumulative crew limits across 1,440-minute horizon...
          </div>
        </div>
      )}

      {/* Solver Metrics Bar */}
      {metrics && !isSolving && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="pixel-card p-3 bg-black">
            <span className="text-[9px] font-pixel text-slate-400">SOLVER STATUS</span>
            <div className="font-pixel text-sm text-green-400 mt-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>{metrics.solver_status}</span>
            </div>
          </div>
          <div className="pixel-card p-3 bg-black">
            <span className="text-[9px] font-pixel text-slate-400">SOLVE TIME</span>
            <div className="font-digital text-2xl text-cyan-300 mt-1 font-bold">
              {metrics.solve_time_seconds}s
            </div>
          </div>
          <div className="pixel-card p-3 bg-black">
            <span className="text-[9px] font-pixel text-slate-400">OBJECTIVE SCORE</span>
            <div className="font-digital text-2xl text-yellow-400 mt-1 font-bold">
              {metrics.objective_score.toLocaleString()} pts
            </div>
          </div>
          <div className="pixel-card p-3 bg-black">
            <span className="text-[9px] font-pixel text-slate-400">CREW COMPLIANCE</span>
            <div className="font-pixel text-xs text-green-400 mt-1">
              100% (≤ {scenario === 'congested' ? '2' : '3'} CREWS)
            </div>
          </div>
        </div>
      )}

      {/* Scheduled vs Skipped Results */}
      {schedule && !isSolving && (
        <div className="space-y-6">
          {/* Scheduled Blocks Section */}
          <div className="pixel-card p-4 bg-[#111827]">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <PixelWrench size={18} color="#22c55e" />
                <h3 className="font-pixel text-xs text-green-400 uppercase">
                  Approved & Scheduled Maintenance Blocks ({schedule.blocks.filter(b => b.is_scheduled).length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Guaranteed collision-free with all train movements
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-black text-slate-400 border-b border-slate-700 text-[10px] font-pixel">
                    <th className="py-2 px-3">BLOCK ID</th>
                    <th className="py-2 px-3">SECTION</th>
                    <th className="py-2 px-3">TYPE</th>
                    <th className="py-2 px-3">PRIORITY</th>
                    <th className="py-2 px-3">SCHEDULED WINDOW (IST)</th>
                    <th className="py-2 px-3">DURATION</th>
                    <th className="py-2 px-3">SHIFT (DEVIATION)</th>
                    <th className="py-2 px-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {schedule.blocks
                    .filter(b => b.is_scheduled)
                    .map((block) => {
                      const startH = Math.floor(block.scheduled_start / 60);
                      const startM = block.scheduled_start % 60;
                      const endH = Math.floor(block.scheduled_end / 60);
                      const endM = block.scheduled_end % 60;
                      const prefH = Math.floor(block.preferred_start / 60);
                      const prefM = block.preferred_start % 60;

                      return (
                        <tr key={block.block_request_id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-pixel text-[10px] text-cyan-400">
                            {block.block_request_id}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">{block.asset_name}</td>
                          <td className="py-2.5 px-3 capitalize text-slate-300">
                            {block.maintenance_type.replace(/_/g, ' ')}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 bg-red-950 border border-red-700 text-red-300 font-pixel text-[8px]">
                              P{block.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-digital text-base text-green-400 font-bold">
                            {String(startH).padStart(2, '0')}:{String(startM).padStart(2, '0')} -{' '}
                            {String(endH).padStart(2, '0')}:{String(endM).padStart(2, '0')}
                          </td>
                          <td className="py-2.5 px-3 text-yellow-300">{block.duration_minutes}m</td>
                          <td className="py-2.5 px-3">
                            {block.deviation_minutes === 0 ? (
                              <span className="text-slate-400">0m (Exact preferred)</span>
                            ) : (
                              <span className="text-purple-300 font-mono">
                                +{block.deviation_minutes}m (Shifted from {String(prefH).padStart(2, '0')}:{String(prefM).padStart(2, '0')})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-green-950 border border-green-700 text-green-400 font-pixel text-[8px]">
                              ✓ APPROVED
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skipped / Deferred Blocks Section */}
          <div className="pixel-card p-4 bg-[#111827] border-l-4 border-l-red-500">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <PixelWrench size={18} color="#ef4444" />
                <h3 className="font-pixel text-xs text-red-400 uppercase">
                  Deferred / Skipped Block Demands ({schedule.blocks.filter(b => !b.is_scheduled).length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Mathematical optimization prevented network deadlock
              </span>
            </div>

            {schedule.blocks.filter(b => !b.is_scheduled).length === 0 ? (
              <div className="p-3 bg-black/40 text-xs font-mono text-slate-400 text-center">
                All block requests successfully accommodated!
              </div>
            ) : (
              <div className="space-y-2">
                {schedule.blocks
                  .filter(b => !b.is_scheduled)
                  .map((block) => (
                    <div
                      key={block.block_request_id}
                      className="bg-black/60 border border-red-950 p-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-400 font-pixel text-[9px]">
                          {block.block_request_id}
                        </span>
                        <div>
                          <div className="text-xs font-mono text-slate-200">
                            <strong>{block.asset_name}</strong> • {block.maintenance_type.replace(/_/g, ' ')} (Priority P{block.priority})
                          </div>
                          <div className="text-[11px] text-red-300/80 font-mono mt-0.5">
                            Reason: {block.skip_reason || 'Could not schedule without violating hard headway or crew constraints'}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-950/90 text-red-400 border border-red-700 font-pixel text-[8px]">
                        DEFERRED BY CP-SAT
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
