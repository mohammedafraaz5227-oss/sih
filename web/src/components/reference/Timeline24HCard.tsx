import React, { useState, useEffect } from 'react';
import { Asset, TrainMovement, ScheduledBlock } from '../../types';

interface Timeline24HCardProps {
  assets: Asset[];
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
}

export const Timeline24HCard: React.FC<Timeline24HCardProps> = ({
  assets,
  trains,
  scheduledBlocks,
}) => {
  // Live IST Laser Scrubber Line & Time Badge
  const [currentMinute, setCurrentMinute] = useState<number>(755); // ~12:35 PM
  const [istTimeShort, setIstTimeShort] = useState<string>('12:35');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(now);
      const mStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', minute: '2-digit' }).format(now);
      const h = parseInt(hStr, 10) || 12;
      const m = parseInt(mStr, 10) || 35;
      setCurrentMinute(h * 60 + m);
      setIstTimeShort(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalMinutes = 1440;
  const scrubberLeftPct = (currentMinute / totalMinutes) * 100;

  const sectionRows = [
    { id: 'SEC_NDLS_GZB', label: 'NDLS - GZB' },
    { id: 'SEC_GZB_ALG', label: 'GZB - ALG' },
    { id: 'SEC_ALG_TDK', label: 'ALG - TDK' },
    { id: 'SEC_TDK_MTJ', label: 'TDK - MTJ' },
    { id: 'SEC_MTJ_AGC', label: 'MTJ - AGC' },
  ];

  const timeTicks = [
    '00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm">
      {/* 1. Header: Title + Red Time Pill + Legend */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2 text-xs font-black text-slate-800 tracking-wide uppercase">
          <span className="text-blue-600 text-sm">🚆</span>
          <span>24-HOUR TIMELINE (IST)</span>
          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold shadow-xs">
            {istTimeShort}
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 font-medium">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block"></span>
            <span>Passenger Train</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block"></span>
            <span>Freight Train</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block"></span>
            <span>Maintenance Block</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-amber-200 border border-amber-500 hazard-stripes-light inline-block"></span>
            <span>Safety Buffer</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 border-t border-dashed border-red-500 inline-block"></span>
            <span>Current Time</span>
          </div>
        </div>
      </div>

      {/* 2. Timeline Canvas */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[620px] relative">
          {/* RED CURRENT TIME VERTICAL DASHED LASER SCRUBBER */}
          <div
            style={{ left: `calc(90px + (100% - 90px) * ${scrubberLeftPct / 100})` }}
            className="absolute top-0 bottom-0 w-[2px] border-l-2 border-dashed border-red-500 z-30 pointer-events-none"
          >
            {/* Red Current Time Badge on Top of Line */}
            <div className="absolute -top-3.5 -left-4 bg-red-500 text-white px-1.5 py-0.2 rounded-xs text-[8px] font-bold font-mono shadow-xs whitespace-nowrap">
              {istTimeShort}
            </div>
          </div>

          {/* Time Marks Header */}
          <div className="flex border-b border-slate-200/80 pb-1 mb-1.5 text-[9px] font-mono text-slate-400">
            <div className="w-[90px] flex-shrink-0"></div>
            <div className="flex-1 flex justify-between px-1">
              {timeTicks.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* 5 Track Section Rows */}
          <div className="space-y-1.5">
            {sectionRows.map((sec) => {
              // Find trains on this section
              const secTrains: { entry: number; exit: number; train: TrainMovement }[] = [];
              trains.forEach((t) => {
                t.sections.forEach((s) => {
                  if (s.asset_id === sec.id) {
                    secTrains.push({ entry: s.entry_time, exit: s.exit_time, train: t });
                  }
                });
              });

              // Scheduled blocks on this section
              const secBlocks = scheduledBlocks.filter((b) => b.asset_id === sec.id);

              return (
                <div key={sec.id} className="flex items-center">
                  {/* Left Section Label */}
                  <div className="w-[90px] flex-shrink-0 text-[10px] font-mono font-bold text-slate-700">
                    {sec.label}
                  </div>

                  {/* 24-Hour Row Track */}
                  <div className="flex-1 h-5 bg-slate-50 border border-slate-200/80 relative rounded-sm overflow-hidden">
                    {/* Background Grid Lines for 3h increments */}
                    <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="border-r border-slate-200/40 h-full"></div>
                      ))}
                    </div>

                    {/* Render Train Intervals */}
                    {secTrains.map(({ entry, exit, train }, i) => {
                      const isFreight = train.train_type === 'freight';
                      const leftPct = (entry / totalMinutes) * 100;
                      const widthPct = ((exit - entry) / totalMinutes) * 100;

                      return (
                        <div
                          key={`tr-${train.id}-${i}`}
                          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1.2)}%` }}
                          title={`${train.train_number} ${train.name}`}
                          className={`absolute top-0.5 bottom-0.5 rounded-xs z-10 ${
                            isFreight ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                        />
                      );
                    })}

                    {/* Render Maintenance Blocks & Safety Buffers */}
                    {secBlocks.map((b) => {
                      const leftPct = (b.scheduled_start / totalMinutes) * 100;
                      const widthPct = (b.duration_minutes / totalMinutes) * 100;

                      return (
                        <React.Fragment key={`bk-${b.block_request_id}`}>
                          {/* Safety Buffer (Striped yellow) */}
                          <div
                            style={{
                              left: `${Math.max(0, leftPct - 1.5)}%`,
                              width: `${widthPct + 3.0}%`,
                            }}
                            className="absolute top-0 bottom-0 bg-amber-100 border-x border-amber-300 hazard-stripes-light z-0 opacity-80"
                          />

                          {/* Nominal Block (Amber) */}
                          <div
                            style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
                            title={`Block ${b.block_request_id}: ${b.duration_minutes}m`}
                            className="absolute top-0.5 bottom-0.5 bg-amber-500 rounded-xs z-20 shadow-xs"
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
