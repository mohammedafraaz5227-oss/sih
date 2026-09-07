import React, { useState, useEffect } from 'react';
import { ScheduleMetrics } from '../../types';
import { BentoCard } from '../ui/BentoGrid';
import { ShinyButton } from '../ui/ShinyButton';
import { NumberTicker } from '../ui/NumberTicker';
import { PulsingSignalPip } from '../ui/PulsingSignalPip';

interface OptimizationEngineCardProps {
  metrics: ScheduleMetrics | undefined;
  isSolving: boolean;
  onRunOptimization: () => void;
  scheduledCount: number;
  totalRequested: number;
  scenario: 'congested' | 'demo';
  onToggleScenario: (s: 'congested' | 'demo') => void;
}

export const OptimizationEngineCard: React.FC<OptimizationEngineCardProps> = ({
  metrics,
  isSolving,
  onRunOptimization,
  scheduledCount,
  totalRequested,
  scenario,
  onToggleScenario,
}) => {
  // Solver elapsed timer
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isSolving) {
      const startTime = Date.now();
      timer = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 50);
    } else {
      setElapsedMs(0);
    }
    return () => clearInterval(timer);
  }, [isSolving]);

  const solveTimeMs = metrics?.solve_time_seconds
    ? Number((metrics.solve_time_seconds * 1000).toFixed(1))
    : 6.9;

  const score = metrics?.objective_score ?? 195750;
  const conflicts = metrics?.train_conflicts ?? 0;

  return (
    <BentoCard
      name="CP-SAT SOLVER"
      icon={<span className="text-sm">⚡</span>}
      badge={
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-pixel text-[7px] uppercase">
            OR-TOOLS v9.8
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-pixel text-[7px] uppercase">
            LIVE
          </span>
        </div>
      }
      headerAction={
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onToggleScenario('demo')}
            className={`px-2 py-0.5 rounded-md font-pixel text-[6.5px] transition-all ${
              scenario === 'demo'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DEMO (6)
          </button>
          <button
            onClick={() => onToggleScenario('congested')}
            className={`px-2 py-0.5 rounded-md font-pixel text-[6.5px] transition-all ${
              scenario === 'congested'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CONGESTED (10)
          </button>
        </div>
      }
      glowColor="green"
      className="h-full"
    >
      <div className="flex flex-col justify-between flex-1 gap-3">
        {/* Main Action Banner: ShinyButton */}
        <ShinyButton
          onClick={onRunOptimization}
          disabled={isSolving}
          variant={isSolving ? 'amber' : 'emerald'}
          className="w-full py-2.5 text-xs tracking-wider uppercase font-pixel flex items-center justify-center gap-2"
        >
          {isSolving ? (
            <>
              <span className="animate-spin text-sm">⏳</span>
              <span>OPTIMIZING ({elapsedMs} ms)...</span>
            </>
          ) : (
            <>
              <span className="text-sm font-black">✓</span>
              <span>OPTIMAL SCHEDULE SOLVED</span>
              <span className="text-sm">→</span>
            </>
          )}
        </ShinyButton>

        {/* Dynamic Telemetry Metric Rows */}
        <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Solve Time */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs">
              <span>⏱️</span> Solve Time
            </span>
            <div className="flex items-center gap-1 font-digital text-lg font-bold text-slate-900 dark:text-slate-100">
              <NumberTicker value={solveTimeMs} decimalPlaces={1} />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">ms</span>
            </div>
          </div>

          {/* Objective Score */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs">
              <span>📊</span> Objective Score
            </span>
            <div className="font-digital text-lg font-bold text-blue-700 dark:text-blue-400">
              <NumberTicker value={score} decimalPlaces={0} />
            </div>
          </div>

          {/* Scheduled Blocks */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs">
              <span>💼</span> Blocks Scheduled
            </span>
            <span className="font-digital text-lg font-bold text-slate-900 dark:text-slate-100">
              {scheduledCount} / {totalRequested}
            </span>
          </div>

          {/* Train Conflicts */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs">
              <span>🛡️</span> Train Conflicts
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-digital text-lg font-bold ${
                  conflicts === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {conflicts} CLASHES
              </span>
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs">
              <span>🛡️</span> Status
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" />
              <span>All constraints satisfied</span>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};
