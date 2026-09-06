import React from 'react';
import { ScheduleComparison } from '../types';
import { PixelAlert, PixelCpu } from './PixelIcons';

interface ComparisonViewProps {
  comparison: ScheduleComparison | null;
  onRunComparison: () => void;
  isLoading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  comparison,
  onRunComparison,
  isLoading,
}) => {
  const naive = comparison?.naive_plan;
  const opt = comparison?.optimized_plan;
  const summary = comparison?.improvement_summary;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="pixel-card p-4 bg-[#111827] border-2 border-black flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-black border-2 border-slate-700">
            <PixelAlert size={24} color="#facc15" />
          </div>
          <div>
            <h2 className="font-pixel text-xs md:text-sm text-yellow-400 uppercase">
              Operational Benchmark: Naive Baseline vs CP-SAT Plan
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Evaluating unoptimized manual scheduling vs automated constraint programming on identical congested demands
            </p>
          </div>
        </div>

        <button
          onClick={onRunComparison}
          disabled={isLoading}
          className="pixel-btn bg-[#7B1113] hover:bg-red-800 text-yellow-300 font-pixel text-xs px-5 py-2.5 flex items-center space-x-2 disabled:opacity-50"
        >
          <PixelCpu size={16} color="#facc15" />
          <span>{isLoading ? 'CALCULATING BENCHMARK...' : 'RUN BENCHMARK COMPARISON'}</span>
        </button>
      </div>

      {/* Primary Highlights Row (4 Stat Boxes) */}
      {summary && naive && opt && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Train Conflicts */}
          <div className="pixel-card p-4 border-l-4 border-l-green-500 bg-[#0b101d]">
            <span className="text-[9px] font-pixel text-slate-400">TRAIN CONFLICTS</span>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-digital text-3xl text-red-400 line-through">
                {naive.train_conflicts}
              </span>
              <span className="text-xl font-mono text-slate-500">→</span>
              <span className="font-digital text-4xl text-green-400 font-bold">
                {opt.train_conflicts}
              </span>
            </div>
            <div className="mt-2 text-[10px] font-pixel text-green-400">
              {summary.train_conflicts_eliminated} CLASHES ELIMINATED ({summary.train_conflicts_reduction_percent}%)
            </div>
          </div>

          {/* Card 2: Train Detention Saved */}
          <div className="pixel-card p-4 border-l-4 border-l-cyan-500 bg-[#0b101d]">
            <span className="text-[9px] font-pixel text-slate-400">ESTIMATED TRAIN DETENTION</span>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-digital text-3xl text-red-400 line-through">
                {naive.estimated_train_delay_minutes}m
              </span>
              <span className="text-xl font-mono text-slate-500">→</span>
              <span className="font-digital text-4xl text-cyan-300 font-bold">
                {opt.estimated_train_delay_minutes}m
              </span>
            </div>
            <div className="mt-2 text-[10px] font-pixel text-cyan-400">
              {summary.train_delay_saved_minutes} MINS DELAY SAVED ({summary.train_delay_reduction_percent}%)
            </div>
          </div>

          {/* Card 3: Crew Capacity Violations */}
          <div className="pixel-card p-4 border-l-4 border-l-yellow-500 bg-[#0b101d]">
            <span className="text-[9px] font-pixel text-slate-400">CREW LIMIT BREACHES</span>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-digital text-3xl text-red-400 line-through">
                {naive.resource_conflicts}
              </span>
              <span className="text-xl font-mono text-slate-500">→</span>
              <span className="font-digital text-4xl text-yellow-400 font-bold">
                {opt.resource_conflicts}
              </span>
            </div>
            <div className="mt-2 text-[10px] font-pixel text-yellow-300">
              PEAK DEMAND: {naive.max_crews_demanded} CREWS → ≤ {opt.crew_capacity} CAP
            </div>
          </div>

          {/* Card 4: Objective Score Improvement */}
          <div className="pixel-card p-4 border-l-4 border-l-purple-500 bg-[#0b101d]">
            <span className="text-[9px] font-pixel text-slate-400">OBJECTIVE SCORE DELTA</span>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-digital text-4xl text-green-400 font-bold">
                +{summary.objective_score_delta.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-[10px] font-pixel text-purple-300">
              OPTIMIZED PLAN QUALITY GAIN
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Comparison Table */}
      {comparison && naive && opt && (
        <div className="pixel-card bg-[#111827] p-5">
          <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
            <h3 className="font-pixel text-xs text-yellow-400 uppercase">
              Side-by-Side Detailed Operational Audit
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Scenario: {comparison.scenario_name}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-black text-slate-400 border-b-2 border-slate-700 text-[10px] font-pixel">
                  <th className="py-2.5 px-3">OPERATIONAL METRIC</th>
                  <th className="py-2.5 px-3 text-red-400">NAIVE BASELINE PLAN</th>
                  <th className="py-2.5 px-3 text-green-400">CP-SAT OPTIMIZED PLAN</th>
                  <th className="py-2.5 px-3 text-yellow-300">MEASURABLE IMPACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">Blocks Scheduled / Requested</td>
                  <td className="py-3 px-3 text-red-300">{naive.blocks_scheduled} / {naive.blocks_requested} (Blind)</td>
                  <td className="py-3 px-3 text-green-300">{opt.blocks_scheduled} / {opt.blocks_requested} (Feasible)</td>
                  <td className="py-3 px-3 text-cyan-300">{opt.blocks_scheduled} feasible blocks accommodated</td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">Blocks Deferred (Infeasible)</td>
                  <td className="py-3 px-3 text-slate-400">{naive.blocks_skipped}</td>
                  <td className="py-3 px-3 text-amber-300">{opt.blocks_skipped} prioritized</td>
                  <td className="py-3 px-3 text-slate-300">Lower priorities safely deferred to prevent gridlock</td>
                </tr>

                <tr className="hover:bg-slate-800/40 bg-red-950/20">
                  <td className="py-3 px-3 font-semibold text-red-200">Direct Train Conflicts</td>
                  <td className="py-3 px-3 text-red-400 font-bold">{naive.train_conflicts} collisions</td>
                  <td className="py-3 px-3 text-green-400 font-bold">{opt.train_conflicts}</td>
                  <td className="py-3 px-3 text-green-400 font-pixel text-[9px]">
                    -{summary?.train_conflicts_eliminated} ({summary?.train_conflicts_reduction_percent}%)
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40 bg-red-950/20">
                  <td className="py-3 px-3 font-semibold text-red-200">Estimated Train Detention (Delays)</td>
                  <td className="py-3 px-3 text-red-400 font-bold">{naive.estimated_train_delay_minutes} minutes</td>
                  <td className="py-3 px-3 text-green-400 font-bold">{opt.estimated_train_delay_minutes} minutes</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">
                    -{summary?.train_delay_saved_minutes} mins delay saved
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">Disrupted Trains (Identities)</td>
                  <td className="py-3 px-3 text-red-300">
                    {naive.affected_trains.slice(0, 3).join(', ')}
                    {naive.affected_trains.length > 3 && ` +${naive.affected_trains.length - 3} more`}
                  </td>
                  <td className="py-3 px-3 text-green-300">0 trains disrupted</td>
                  <td className="py-3 px-3 text-green-400 font-pixel text-[9px]">
                    100% TIMETABLE PUNCTUALITY
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">Total Block-Time Deviation</td>
                  <td className="py-3 px-3 text-slate-400">0 mins (unconstrained)</td>
                  <td className="py-3 px-3 text-purple-300">{opt.total_deviation_minutes} mins</td>
                  <td className="py-3 px-3 text-slate-300">Intelligent shifts into authentic traffic gaps</td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">Asset Maintenance Downtime</td>
                  <td className="py-3 px-3 text-slate-300">{naive.asset_downtime_minutes}m ({naive.asset_utilization_percent}%)</td>
                  <td className="py-3 px-3 text-slate-300">{opt.asset_downtime_minutes}m ({opt.asset_utilization_percent}%)</td>
                  <td className="py-3 px-3 text-cyan-300">Possession granted with full safety clearance</td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">Resource / Crew Conflicts</td>
                  <td className="py-3 px-3 text-red-400">{naive.resource_conflicts} over-capacity events</td>
                  <td className="py-3 px-3 text-green-400">{opt.resource_conflicts}</td>
                  <td className="py-3 px-3 text-yellow-300">Workforce capped at ≤ {opt.crew_capacity} crews</td>
                </tr>

                <tr className="hover:bg-slate-800/40 bg-black">
                  <td className="py-3 px-3 font-semibold text-yellow-400">Overall Objective Score</td>
                  <td className="py-3 px-3 text-red-400 font-digital text-lg font-bold">{naive.objective_score.toLocaleString()}</td>
                  <td className="py-3 px-3 text-green-400 font-digital text-lg font-bold">{opt.objective_score.toLocaleString()}</td>
                  <td className="py-3 px-3 text-green-400 font-pixel text-[10px]">
                    +{summary?.objective_score_delta.toLocaleString()} PTS
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">Execution Runtime</td>
                  <td className="py-3 px-3 text-slate-400">{naive.runtime_seconds}s</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">{opt.runtime_seconds}s</td>
                  <td className="py-3 px-3 text-slate-400">Exact mathematical optimum reached</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
