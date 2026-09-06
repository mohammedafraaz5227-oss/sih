import React from 'react';

interface CorridorMetricsCardProps {
  occupancyPercent: number;
  trainDelayMinutes: number;
  availabilityPercent: number;
}

export const CorridorMetricsCard: React.FC<CorridorMetricsCardProps> = ({
  occupancyPercent,
  trainDelayMinutes,
  availabilityPercent,
}) => {
  // Compute SVG Donut Stroke Dash
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancyPercent / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm">
      {/* Title */}
      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 tracking-wider uppercase mb-2.5">
        <span className="text-slate-500">⚙️</span>
        <span>CORRIDOR METRICS</span>
      </div>

      {/* 3 Metric Columns */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Metric 1: Maintenance Occupancy (Donut Chart) */}
        <div className="flex flex-col items-center justify-between p-1 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight h-5 flex items-center justify-center">
            MAINTENANCE OCCUPANCY
          </span>
          <div className="relative w-12 h-12 my-1 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-cyan-500 transition-all duration-500"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-black text-slate-700">
                {occupancyPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-slate-800 font-mono">
            {occupancyPercent.toFixed(2)}%
          </span>
        </div>

        {/* Metric 2: Train Delay (Clock Icon & 0 mins) */}
        <div className="flex flex-col items-center justify-between p-1 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight h-5 flex items-center justify-center">
            TRAIN DELAY
          </span>
          <div className="w-10 h-10 my-1 rounded-full bg-blue-50 border-2 border-blue-400 flex items-center justify-center text-blue-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span className={`text-xs font-black font-mono ${trainDelayMinutes === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trainDelayMinutes} mins
          </span>
        </div>

        {/* Metric 3: Track Availability (Signal Bar Chart) */}
        <div className="flex flex-col items-center justify-between p-1 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight h-5 flex items-center justify-center">
            TRACK AVAILABILITY
          </span>
          <div className="w-10 h-10 my-1 flex items-end justify-center space-x-1">
            <div className="w-2 h-4 bg-emerald-500 rounded-xs"></div>
            <div className="w-2 h-7 bg-emerald-500 rounded-xs"></div>
            <div className="w-2 h-9 bg-emerald-500 rounded-xs"></div>
          </div>
          <span className="text-xs font-black text-emerald-600 font-mono">
            {availabilityPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
