import React, { useState, useEffect } from 'react';
import { Asset, TrainMovement, ScheduledBlock } from '../../types';
import { BentoCard } from '../ui/BentoGrid';

interface CorridorTimeline24HProps {
  assets: Asset[];
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
  selectedTrainNumber?: string;
}

export const CorridorTimeline24H: React.FC<CorridorTimeline24HProps> = ({
  assets,
  trains,
  scheduledBlocks,
  selectedTrainNumber = '12031',
}) => {
  // Live IST Laser Scrubber Line & Time Badge
  const [currentMinute, setCurrentMinute] = useState<number>(888); // ~14:48
  const [istTimeShort, setIstTimeShort] = useState<string>('14:48');
  const [hoveredItem, setHoveredItem] = useState<{ title: string; subtitle: string; time: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(now);
      const mStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', minute: '2-digit' }).format(now);
      const h = parseInt(hStr, 10) || 14;
      const m = parseInt(mStr, 10) || 48;
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
    { id: 'SEC_NDLS_GZB', label: 'NDLS - GZB', distance: '30 km' },
    { id: 'SEC_GZB_ALG', label: 'GZB - ALG', distance: '60 km' },
    { id: 'SEC_ALG_TDK', label: 'ALG - TDK', distance: '58 km' },
    { id: 'SEC_TDK_MTJ', label: 'TDK - MTJ', distance: '52 km' },
    { id: 'SEC_MTJ_AGC', label: 'MTJ - AGC', distance: '65 km' },
  ];

  const timeTicks = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'
  ];

  return (
    <BentoCard
      name="24-HOUR CORRIDOR OPERATIONS TIMELINE"
      icon={<span className="text-sm">🕒</span>}
      headerAction={
        <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-600 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block" />
            <span>Passenger Train</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" />
            <span>Freight Train</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block" />
            <span>Maintenance Block</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-amber-200 border border-amber-500 hazard-stripes-light inline-block" />
            <span>15m Safety Buffer</span>
          </div>
        </div>
      }
      glowColor="blue"
      className="w-full"
    >
      <div className="flex flex-col lg:flex-row gap-4 mt-1 items-stretch">
        {/* Left / Center: 24-Hour Timeline Grid (Flex 1) */}
        <div className="flex-1 min-w-0">
          {/* Timeline Grid Container */}
          <div className="relative border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-[#060a12]/80 p-2.5 pb-6 overflow-hidden">
            {/* Top Time Ticks Header */}
            <div className="flex items-center mb-2 pl-36 pr-4 justify-between text-[8px] font-mono text-slate-400">
              {timeTicks.map((tick, idx) => (
                <span key={idx} className="shrink-0">{tick}</span>
              ))}
            </div>

            {/* Vertical Hour Tick Guide Lines */}
            <div className="absolute inset-0 left-36 right-4 flex justify-between pointer-events-none">
              {timeTicks.map((_, idx) => (
                <div
                  key={idx}
                  className="h-full border-r border-slate-200/50 dark:border-slate-800/50"
                  style={{ width: `${100 / (timeTicks.length - 1)}%` }}
                />
              ))}
            </div>

            {/* Red Laser Scrubber Line Moving with Current IST */}
            <div
              style={{ left: `calc(144px + (100% - 160px) * ${scrubberLeftPct / 100})` }}
              className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-red-500 z-30 pointer-events-none transition-all duration-1000"
            >
              {/* Bottom Red IST Time Pill Badge */}
              <div className="absolute -bottom-1 -left-5 px-1.5 py-0.5 rounded-full bg-red-600 text-white font-digital text-[10px] font-bold shadow-md whitespace-nowrap">
                {istTimeShort}
              </div>
            </div>

            {/* Track Section Rows */}
            <div className="space-y-2 relative z-10">
              {sectionRows.map((sec) => {
                const secBlocks = scheduledBlocks.filter(
                  (b) => b.is_scheduled && b.asset_id === sec.id
                );
                const secTrains = trains
                  .map((t) => {
                    const m = t.sections.find((s) => s.asset_id === sec.id);
                    return m ? { train: t, movement: m } : null;
                  })
                  .filter(Boolean) as { train: TrainMovement; movement: any }[];

                return (
                  <div key={sec.id} className="flex items-center h-8">
                    {/* Left Section Label with Distance */}
                    <div className="w-36 shrink-0 pr-2">
                      <span className="font-pixel text-[7.5px] text-slate-800 dark:text-slate-200 tracking-wide uppercase truncate block">
                        {sec.label} <span className="text-slate-400 font-mono text-[9px]">({sec.distance})</span>
                      </span>
                    </div>

                    {/* 24-Hour Row Track Slot */}
                    <div className="relative flex-1 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                      {/* Train Movements (Blue / Green Bars) */}
                      {secTrains.map(({ train, movement }, idx) => {
                        const startPct = (movement.entry_time / totalMinutes) * 100;
                        const widthPct = Math.max(
                          1.2,
                          ((movement.exit_time - movement.entry_time) / totalMinutes) * 100
                        );
                        const isFreight = train.train_type === 'freight';

                        return (
                          <div
                            key={idx}
                            style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                            className={`absolute top-1 bottom-1 rounded-xs flex items-center justify-center cursor-pointer shadow-xs transition-transform hover:scale-y-110 z-10 ${
                              isFreight ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-blue-600 hover:bg-blue-500'
                            }`}
                            title={`${train.train_number} • ${train.name}`}
                          >
                            <span className="text-[7px] text-white font-pixel truncate px-0.5">
                              {train.train_number}
                            </span>
                          </div>
                        );
                      })}

                      {/* Scheduled Maintenance Blocks (Amber Strips) */}
                      {secBlocks.map((block) => {
                        const startPct = (block.scheduled_start / totalMinutes) * 100;
                        const widthPct = Math.max(
                          2.5,
                          (block.duration_minutes / totalMinutes) * 100
                        );

                        return (
                          <div
                            key={block.block_request_id}
                            style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                            className="absolute top-0.5 bottom-0.5 rounded-xs bg-amber-400 border border-amber-600 hazard-stripes-light flex items-center justify-center cursor-pointer shadow-xs z-20 hover:brightness-110"
                            title={`Block ${block.block_request_id} • ${block.maintenance_type}`}
                          >
                            <span className="text-[6.5px] font-pixel text-amber-950 font-bold truncate px-0.5">
                              POSSESSION
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Train Inspector Dock (Matching Reference Image) */}
        <div className="w-full lg:w-72 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 flex flex-col justify-between text-xs font-mono shadow-xs shrink-0">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
              <div className="flex items-center gap-1.5 font-pixel text-[8.5px] text-slate-900 dark:text-slate-100 uppercase">
                <span>🚂</span>
                <span>SELECTED TRAIN</span>
              </div>
              <span className="text-slate-400 cursor-pointer hover:text-slate-600">•••</span>
            </div>

            {/* Train Identity Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-pixel">
                12031 Rajdhani Express
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-pixel text-[6.5px] uppercase">
                ON TIME
              </span>
            </div>

            {/* Route */}
            <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-3">
              NDLS → AGC
            </div>

            {/* Specs Table */}
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Speed</span>
                <span className="font-digital text-sm font-bold text-slate-900 dark:text-slate-100">130 km/h</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Current Location</span>
                <span className="text-slate-800 dark:text-slate-200">Near TDK (142 km)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">ETA at AGC</span>
                <span className="font-digital text-sm font-bold text-blue-700 dark:text-blue-400">16:12 IST</span>
              </div>
            </div>
          </div>

          {/* Footer View Details Link */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1">
              <span>View Details</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};
