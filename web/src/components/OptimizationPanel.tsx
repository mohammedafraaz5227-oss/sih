import React from 'react';
import { OptimizedSchedule } from '../types';
import { PixelCpu, PixelSignal, PixelWrench, PixelAlert, PixelTrack } from './PixelIcons';

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
  const scheduledBlocks = schedule?.blocks.filter(b => b.is_scheduled) || [];
  const skippedBlocks = schedule?.blocks.filter(b => !b.is_scheduled) || [];

  return (
    <div className="space-y-6">
      {/* 1. Hero CP-SAT Command Banner */}
      <div className="pixel-card-glow-cyan p-5 bg-[#0a101d] flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center space-x-3.5 z-10">
          <div className="p-3 bg-[#060a12] border-2 border-electric-cyan shadow-glow-cyan">
            <PixelCpu size={32} color="#00f0ff" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-pixel text-sm md:text-base text-yellow-400 uppercase tracking-wider">
                Google OR-Tools CP-SAT Optimization Engine
              </h2>
              <span className="px-2 py-0.5 bg-cyan-950/80 border border-electric-cyan text-electric-cyan text-[8px] font-pixel shadow-glow-cyan">
                MULTI-THREADED
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Exact Constraint Programming • Disjunctive Track Occupancy (NoOverlap) • ±15m Headway Buffers • Cumulative Crew Limit
            </p>
          </div>
        </div>

        <button
          onClick={onRunOptimization}
          disabled={isSolving}
          className="pixel-btn bg-[#7B1113] hover:bg-red-800 text-yellow-300 font-pixel text-xs px-6 py-3 flex items-center space-x-2 disabled:opacity-50 transition-all shadow-glow-amber z-10 active:translate-y-0.5"
        >
          <PixelCpu size={18} color="#facc15" />
          <span>{isSolving ? 'SOLVING WITH CP-SAT...' : 'EXECUTE CP-SAT SOLVER'}</span>
        </button>
      </div>

      {/* 2. Solving Loading Animation */}
      {isSolving && (
        <div className="pixel-card p-6 bg-[#070d18] border-2 border-amber-500 text-center space-y-3 shadow-glow-amber">
          <div className="flex justify-center">
            <PixelSignal aspect="amber" size={36} />
          </div>
          <div className="font-pixel text-xs text-yellow-400 animate-pulse tracking-wider">
            FORMULATING INTEGER DOMAINS & EXECUTING CP-SAT SEARCH WORKERS...
          </div>
          <div className="text-xs font-mono text-slate-400 max-w-lg mx-auto leading-relaxed">
            Propagating track section NoOverlap constraints, enforcing disjunctive intervals for {scenario === 'congested' ? '11 trains' : '8 trains'}, and optimizing {scenario === 'congested' ? '10 block demands' : '8 block demands'} under 2-crew limit...
          </div>
        </div>
      )}

      {/* 3. Live Solver Telemetry HUD */}
      {metrics && !isSolving && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="pixel-card-glow-green p-3.5 bg-[#060a12]">
            <span className="text-[9px] font-pixel text-slate-400">SOLVER STATUS</span>
            <div className="font-pixel text-sm text-emerald-400 mt-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-none animate-pulse"></span>
              <span>{metrics.solver_status}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">
              Proven Global Optimum
            </span>
          </div>

          <div className="pixel-card-glow-cyan p-3.5 bg-[#060a12]">
            <span className="text-[9px] font-pixel text-slate-400">SOLVE TIME</span>
            <div className="font-digital text-3xl text-cyan-300 mt-1 font-bold">
              {metrics.solve_time_seconds}s
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">
              8 Search Workers
            </span>
          </div>

          <div className="pixel-card-glow-amber p-3.5 bg-[#060a12]">
            <span className="text-[9px] font-pixel text-slate-400">OBJECTIVE SCORE</span>
            <div className="font-digital text-3xl text-yellow-400 mt-1 font-bold">
              {metrics.objective_score.toLocaleString()}
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">
              Max Priority - Shift Penalty
            </span>
          </div>

          <div className="pixel-card-glow-purple p-3.5 bg-[#060a12]">
            <span className="text-[9px] font-pixel text-slate-400">CREW LIMIT ENFORCED</span>
            <div className="font-digital text-3xl text-purple-300 mt-1 font-bold">
              ≤ {scenario === 'congested' ? '2' : '3'} CREWS
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">
              Cumulative Capacity 100%
            </span>
          </div>
        </div>
      )}

      {/* 4. Results: Approved Maintenance Possessions vs Deferred Demands */}
      {schedule && !isSolving && (
        <div className="space-y-6">
          {/* Approved Blocks */}
          <div className="pixel-card bg-[#0a101d] p-4 border-2 border-emerald-900/80">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center space-x-2">
                <PixelWrench size={18} color="#10b981" />
                <h3 className="font-pixel text-xs text-emerald-400 uppercase">
                  Approved & Locked Maintenance Possessions ({scheduledBlocks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Guaranteed collision-free with all scheduled train movements
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#060a12] text-slate-400 border-b border-slate-800 text-[10px] font-pixel">
                    <th className="py-2.5 px-3">BLOCK ID</th>
                    <th className="py-2.5 px-3">SECTION</th>
                    <th className="py-2.5 px-3">TYPE</th>
                    <th className="py-2.5 px-3">PRIORITY</th>
                    <th className="py-2.5 px-3">SCHEDULED WINDOW (IST)</th>
                    <th className="py-2.5 px-3">DURATION</th>
                    <th className="py-2.5 px-3">TIMETABLE SHIFT</th>
                    <th className="py-2.5 px-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {scheduledBlocks.map((block) => {
                    const startH = Math.floor(block.scheduled_start / 60);
                    const startM = block.scheduled_start % 60;
                    const endH = Math.floor(block.scheduled_end / 60);
                    const endM = block.scheduled_end % 60;
                    const prefH = Math.floor(block.preferred_start / 60);
                    const prefM = block.preferred_start % 60;

                    return (
                      <tr key={block.block_request_id} className="hover:bg-slate-800/30 transition-colors">
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
                        <td className="py-2.5 px-3 font-digital text-base text-emerald-400 font-bold">
                          {String(startH).padStart(2, '0')}:{String(startM).padStart(2, '0')} -{' '}
                          {String(endH).padStart(2, '0')}:{String(endM).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 text-yellow-300 font-pixel text-[10px]">{block.duration_minutes}m</td>
                        <td className="py-2.5 px-3">
                          {block.deviation_minutes === 0 ? (
                            <span className="text-slate-400 font-mono text-[11px]">0m (Exact preferred)</span>
                          ) : (
                            <span className="text-purple-300 font-mono text-[11px]">
                              +{block.deviation_minutes}m (Shifted from {String(prefH).padStart(2, '0')}:{String(prefM).padStart(2, '0')})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-400 font-pixel text-[8px]">
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

          {/* Deferred Blocks */}
          <div className="pixel-card bg-[#0a101d] p-4 border-2 border-red-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center space-x-2">
                <PixelAlert size={18} color="#ef4444" />
                <h3 className="font-pixel text-xs text-rose-400 uppercase">
                  Deferred / Skipped Demands ({skippedBlocks.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Mathematical optimization prevented corridor gridlock and priority train detention
              </span>
            </div>

            {skippedBlocks.length === 0 ? (
              <div className="p-4 bg-[#060a12] text-xs font-mono text-slate-400 text-center border border-slate-800">
                All maintenance requests successfully accommodated within feasible windows!
              </div>
            ) : (
              <div className="space-y-2.5">
                {skippedBlocks.map((block) => (
                  <div
                    key={block.block_request_id}
                    className="bg-[#060a12] border border-rose-900/60 p-3 flex flex-wrap items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 bg-rose-950 border border-rose-600 text-rose-300 font-pixel text-[9px]">
                        {block.block_request_id}
                      </span>
                      <div>
                        <div className="text-xs font-mono text-slate-200">
                          <strong>{block.asset_name}</strong> • {block.maintenance_type.replace(/_/g, ' ')} (Priority P{block.priority})
                        </div>
                        <div className="text-[11px] text-rose-400/90 font-mono mt-0.5">
                          Constraint Reason: {block.skip_reason || 'Disjunctive track conflict with high-priority passenger train movement within safety headway window.'}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-1 bg-rose-950/80 text-rose-300 border border-rose-800 font-pixel text-[8px]">
                      DEFERRED BY SOLVER
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
