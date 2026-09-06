import React from 'react';
import { BentoCard } from '../ui/BentoGrid';
import { AnimatedCircularProgressBar } from '../ui/AnimatedCircularProgressBar';
import { NumberTicker } from '../ui/NumberTicker';

interface CorridorKPIBentoProps {
  occupancyPercent: number;
  trainDelayMinutes: number;
  availabilityPercent: number;
}

export const CorridorKPIBento: React.FC<CorridorKPIBentoProps> = ({
  occupancyPercent,
  trainDelayMinutes,
  availabilityPercent,
}) => {
  return (
    <BentoCard
      name="CORRIDOR TELEMETRY METRICS"
      icon={<span className="text-sm">📈</span>}
      badge={
        <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-pixel text-[7px] uppercase">
          LIVE TELEMETRY
        </span>
      }
      glowColor="cyan"
      className="h-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center justify-between flex-1 py-1">
        {/* Gauge 1: Maintenance Occupancy */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="font-pixel text-[6.5px] text-slate-500 uppercase mb-2 text-center h-4 flex items-center">
            MAINTENANCE OCCUPANCY
          </span>
          <AnimatedCircularProgressBar
            value={occupancyPercent}
            size={96}
            strokeWidth={8}
            gaugePrimaryColor="#0284c7"
            gaugeSecondaryColor="#e2e8f0"
          >
            <div className="flex flex-col items-center">
              <span className="font-digital text-base font-bold text-slate-900 leading-none">
                <NumberTicker value={occupancyPercent} decimalPlaces={1} />%
              </span>
              <span className="text-[8px] font-mono text-slate-400 mt-0.5">Corridor</span>
            </div>
          </AnimatedCircularProgressBar>
          <span className="font-mono text-[10px] text-slate-600 mt-2">
            Target: &lt;15.0%
          </span>
        </div>

        {/* Gauge 2: Train Delay (Minutes) */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="font-pixel text-[6.5px] text-slate-500 uppercase mb-2 text-center h-4 flex items-center">
            TRAIN DELAY
          </span>
          <AnimatedCircularProgressBar
            value={trainDelayMinutes === 0 ? 100 : Math.max(0, 100 - trainDelayMinutes)}
            size={96}
            strokeWidth={8}
            gaugePrimaryColor={trainDelayMinutes === 0 ? '#10b981' : '#f59e0b'}
            gaugeSecondaryColor="#e2e8f0"
          >
            <div className="flex flex-col items-center">
              <span className="font-digital text-base font-bold text-emerald-600 leading-none">
                <NumberTicker value={trainDelayMinutes} decimalPlaces={0} />m
              </span>
              <span className="text-[8px] font-mono text-emerald-700 mt-0.5">Zero Clash</span>
            </div>
          </AnimatedCircularProgressBar>
          <span className="font-mono text-[10px] text-emerald-700 mt-2 font-medium">
            100% Punctuality
          </span>
        </div>

        {/* Gauge 3: Track Availability */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="font-pixel text-[6.5px] text-slate-500 uppercase mb-2 text-center h-4 flex items-center">
            TRACK AVAILABILITY
          </span>
          <AnimatedCircularProgressBar
            value={availabilityPercent}
            size={96}
            strokeWidth={8}
            gaugePrimaryColor="#10b981"
            gaugeSecondaryColor="#e2e8f0"
          >
            <div className="flex flex-col items-center">
              <span className="font-digital text-base font-bold text-slate-900 leading-none">
                <NumberTicker value={availabilityPercent} decimalPlaces={1} />%
              </span>
              <span className="text-[8px] font-mono text-slate-400 mt-0.5">Operational</span>
            </div>
          </AnimatedCircularProgressBar>
          <span className="font-mono text-[10px] text-slate-600 mt-2">
            24h Window
          </span>
        </div>
      </div>
    </BentoCard>
  );
};
