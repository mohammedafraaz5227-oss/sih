import React, { useState, useEffect } from 'react';
import { Asset, TrainMovement, ScheduledBlock } from '../../types';
import { BentoCard } from '../ui/BentoGrid';

interface CorridorTimeline24HProps {
  assets: Asset[];
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
}

export const CorridorTimeline24H: React.FC<CorridorTimeline24HProps> = ({
  assets,
  trains,
  scheduledBlocks,
}) => {
  // Live IST Laser Scrubber Line & Time Badge
  const [currentMinute, setCurrentMinute] = useState<number>(755); // ~12:35 PM
  const [istTimeShort, setIstTimeShort] = useState<string>('12:35');
  const [hoveredItem, setHoveredItem] = useState<{ title: string; subtitle: string; time: string } | null>(null);

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
    <BentoCard
      name="24-HOUR CORRIDOR OPERATIONS TIMELINE"
      icon={<span className="text-sm">🕒</span>}
      badge={
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-digital text-sm tracking-wider shadow-xs animate-pulse">
            IST {istTimeShort}
          </span>
        </div>
      }
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
            <span>Scheduled Block</span>
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
      <div className="relative mt-2">
        {/* Hover inspector tooltip bar */}
        {hoveredItem ? (
          <div className="mb-2 p-1.5 px-3 rounded-lg bg-slate-900 text-white font-mono text-xs flex items-center justify-between">
            <span className="font-bold text-yellow-400">{hoveredItem.title}</span>
            <span className="text-slate-300">{hoveredItem.subtitle}</span>
            <span className="font-digital text-cyan-300 text-sm">{hoveredItem.time}</span>
          </div>
        ) : (
          <div className="mb-2 h-6 flex items-center text-[10px] font-mono text-slate-400">
            Hover over any train or maintenance possession bar to inspect timetable and conflict-free allocation
          </div>
        )}

        {/* Timeline Grid Container */}
        <div className="relative border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-[#060a12]/80 p-2 overflow-hidden">
          {/* Vertical Hour Tick Background Guides */}
          <div className="absolute inset-0 left-28 right-4 flex justify-between pointer-events-none">
            {timeTicks.map((_, idx) => (
              <div
                key={idx}
                className="h-full border-r border-slate-200/60 dark:border-slate-800/60"
                style={{ width: `${100 / (timeTicks.length - 1)}%` }}
              />
            ))}
          </div>

          {/* LASER SCRUBBER: Red Vertical Dashed Line Moving with Real Time */}
          <div
            style={{ left: `calc(112px + (100% - 128px) * ${scrubberLeftPct / 100})` }}
            className="absolute top-0 bottom-6 w-0.5 border-l-2 border-dashed border-red-500 z-30 pointer-events-none transition-all duration-1000"
          >
            <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-red-600 rounded-full shadow-[0_0_8px_#ef4444] animate-ping" />
            <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-red-600 rounded-full shadow-[0_0_8px_#ef4444]" />
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
                  {/* Left Section Label */}
                  <div className="w-28 shrink-0 pr-2">
                    <span className="font-pixel text-[7.5px] text-slate-800 dark:text-slate-200 tracking-wide uppercase truncate block">
                      {sec.label}
                    </span>
                  </div>

                  {/* 24-Hour Row Track */}
                  <div className="relative flex-1 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                    {/* Train Movements (Blue / Green Bars) */}
                    {secTrains.map(({ train, movement }, idx) => {
                      const startPct = (movement.entry_time / totalMinutes) * 100;
                      const widthPct = Math.max(
                        0.8,
                        ((movement.exit_time - movement.entry_time) / totalMinutes) * 100
                      );
                      const isFreight = train.train_type === 'freight';
                      const startH = Math.floor(movement.entry_time / 60);
                      const startM = movement.entry_time % 60;
                      const endH = Math.floor(movement.exit_time / 60);
                      const endM = movement.exit_time % 60;
                      const timeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

                      return (
                        <div
                          key={idx}
                          style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                          onMouseEnter={() =>
                            setHoveredItem({
                              title: `${train.train_number} • ${train.name}`,
                              subtitle: `Type: ${train.train_type.toUpperCase()} • Priority: P${train.priority}`,
                              time: timeStr,
                            })
                          }
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`absolute top-1 bottom-1 rounded-xs cursor-pointer transition-all hover:scale-y-125 z-10 ${
                            isFreight ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-blue-600 hover:bg-blue-500'
                          }`}
                        />
                      );
                    })}

                    {/* Scheduled Maintenance Blocks (Amber Bars with Striped Buffers) */}
                    {secBlocks.map((b) => {
                      const startPct = (b.scheduled_start / totalMinutes) * 100;
                      const widthPct = (b.duration_minutes / totalMinutes) * 100;
                      const bufferMins = 15;
                      const bufferStartPct = (Math.max(0, b.scheduled_start - bufferMins) / totalMinutes) * 100;
                      const bufferWidthPct = ((b.duration_minutes + bufferMins * 2) / totalMinutes) * 100;

                      const startH = Math.floor(b.scheduled_start / 60);
                      const startM = b.scheduled_start % 60;
                      const endH = Math.floor(b.scheduled_end / 60);
                      const endM = b.scheduled_end % 60;
                      const timeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')} (${b.duration_minutes}m)`;

                      return (
                        <React.Fragment key={b.block_request_id}>
                          {/* Striped Buffer Zone */}
                          <div
                            style={{ left: `${bufferStartPct}%`, width: `${bufferWidthPct}%` }}
                            className="absolute top-0 bottom-0 hazard-stripes-light opacity-50 pointer-events-none"
                          />
                          {/* Main Block Possession Bar */}
                          <div
                            style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                            onMouseEnter={() =>
                              setHoveredItem({
                                title: `POSSESSION: ${b.block_request_id} (${b.maintenance_type})`,
                                subtitle: `Asset: ${b.asset_name} • Priority: P${b.priority} • Deviation: ${b.deviation_minutes}m`,
                                time: timeStr,
                              })
                            }
                            onMouseLeave={() => setHoveredItem(null)}
                            className="absolute top-0.5 bottom-0.5 bg-amber-500 border border-amber-600 rounded-xs shadow-xs cursor-pointer transition-all hover:scale-y-125 z-20"
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Ticks Header */}
          <div className="relative pl-28 pr-4 pt-2 flex justify-between text-[9px] font-digital text-slate-500 select-none">
            {timeTicks.map((tick, idx) => (
              <span key={idx} className="tracking-wider">
                {tick}
              </span>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
};
