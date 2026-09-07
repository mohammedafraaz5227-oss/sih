import React, { useState, useEffect } from 'react';
import { Asset, TrainMovement, OptimizedSchedule, BlockRequest } from '../types';
import { PixelTrain, PixelWrench, PixelTrack, PixelSignal, PixelAlert } from './PixelIcons';

interface TimelineGanttProps {
  assets: Asset[];
  trains: TrainMovement[];
  schedule: OptimizedSchedule | null;
  blocks: BlockRequest[];
}

export const TimelineGantt: React.FC<TimelineGanttProps> = ({
  assets,
  trains,
  schedule,
  blocks,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'trains' | 'blocks'>('all');
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'train' | 'block';
    id: string;
    label: string;
    subLabel: string;
    sectionName: string;
    time: string;
    extra: string;
  } | null>(null);

  // Live IST Laser Scrubber Line (updates every 1s)
  const [scrubberPct, setScrubberPct] = useState<number>(50);
  const [istTimeString, setIstTimeString] = useState<string>('12:00:00');

  useEffect(() => {
    const updateScrubber = () => {
      const now = new Date();
      const hourStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(now);
      const minStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', minute: '2-digit' }).format(now);
      const secStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', second: '2-digit' }).format(now);

      const h = parseInt(hourStr, 10) || 0;
      const m = parseInt(minStr, 10) || 0;
      const s = parseInt(secStr, 10) || 0;

      const totalMins = (h % 24) * 60 + m + s / 60;
      const pct = (totalMins / 1440) * 100;

      setScrubberPct(pct);
      setIstTimeString(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    updateScrubber();
    const interval = setInterval(updateScrubber, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const totalMinutes = 1440;

  // Filter scheduled blocks
  const scheduledBlocks = schedule?.blocks.filter(b => b.is_scheduled) || [];

  // Helper for train category styling
  const getTrainCategoryStyle = (train: TrainMovement) => {
    if (train.train_type === 'rajdhani' || train.train_type === 'shatabdi') {
      return {
        bg: 'bg-[#00f0ff]',
        text: 'text-black',
        border: 'border-white',
        shadow: 'shadow-glow-cyan',
        badge: 'bg-cyan-950 text-cyan-300 border-cyan-500',
      };
    }
    if (train.train_type === 'superfast' || train.train_type === 'express') {
      return {
        bg: 'bg-[#10b981]',
        text: 'text-black',
        border: 'border-emerald-200',
        shadow: 'shadow-glow-emerald',
        badge: 'bg-emerald-950 text-emerald-300 border-emerald-500',
      };
    }
    // Freight / passenger
    return {
      bg: 'bg-[#f59e0b]',
      text: 'text-black',
      border: 'border-amber-200',
      shadow: 'shadow-glow-amber',
      badge: 'bg-amber-950 text-amber-300 border-amber-500',
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Controls & Legend Bar */}
      <div className="bg-white dark:bg-[#121214] border border-slate-200/90 dark:border-[#27272a] rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🕒</span>
            <h2 className="font-pixel text-xs md:text-sm text-slate-900 dark:text-[#f4f4f5] uppercase">
              24-Hour Corridor Gantt Master Timetable
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-[7px] font-pixel uppercase">
              1,440 MIN HORIZON
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            5 Track Sections • Disjunctive NoOverlap Intervals • Live IST Scrubber
          </p>
        </div>

        {/* Filter Buttons & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Mode Selector */}
          <div className="inline-flex border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-[7.5px] font-pixel rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterMode('trains')}
              className={`px-3 py-1 text-[7.5px] font-pixel rounded-lg transition-colors ${
                filterMode === 'trains'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              TRAINS ONLY
            </button>
            <button
              onClick={() => setFilterMode('blocks')}
              className={`px-3 py-1 text-[7.5px] font-pixel rounded-lg transition-colors ${
                filterMode === 'blocks'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              BLOCKS ONLY
            </button>
          </div>

          {/* Visual Legend */}
          <div className="flex items-center space-x-3 text-[8px] font-mono text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0284c7] inline-block" />
              <span>PREMIER</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981] inline-block" />
              <span>EXPRESS</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b] inline-block" />
              <span>FREIGHT</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#7B1113] border border-amber-400 inline-block" />
              <span>BLOCK</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block animate-pulse" />
              <span>IST LASER</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 24-Hour Gantt Timeline Canvas */}
      <div className="bg-white dark:bg-[#121214] border border-slate-200/90 dark:border-[#27272a] rounded-2xl p-5 shadow-sm overflow-x-auto relative transition-colors duration-200">
        <div className="min-w-[1100px] relative">
          {/* LIVE IST LASER SCRUBBER LINE (Spans entire height of Gantt) */}
          <div
            style={{ left: `calc(192px + (100% - 192px) * ${scrubberPct / 100})` }}
            className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none shadow-[0_0_8px_#f43f5e]"
          >
            {/* Scrubber Header Badge */}
            <div className="absolute -top-3.5 -left-10 bg-rose-600 text-white px-1.5 py-0.5 text-[7px] font-pixel whitespace-nowrap shadow-glow-red border border-white">
              NOW: {istTimeString} IST
            </div>
          </div>

          {/* Hour Marks Header */}
          <div className="flex border-b-2 border-slate-200 dark:border-[#27272a] pb-2 mb-4 text-[10px] font-pixel text-slate-500 dark:text-slate-400">
            <div className="w-48 flex-shrink-0 font-pixel text-amber-700 dark:text-amber-400 pl-2">
              TRACK SECTION
            </div>
            <div className="flex-1 grid grid-cols-24 gap-0 relative">
              {hours.map((h) => (
                <div
                  key={h}
                  className="text-center border-l border-slate-200 dark:border-[#27272a]/80 text-[9px] font-digital text-slate-600 dark:text-zinc-400"
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Section Rows */}
          <div className="space-y-4">
            {assets.map((asset) => {
              // Find train sections on this asset
              const assetTrainSections: { train: TrainMovement; entry: number; exit: number }[] = [];
              trains.forEach((t) => {
                t.sections.forEach((s) => {
                  if (s.asset_id === asset.id) {
                    assetTrainSections.push({ train: t, entry: s.entry_time, exit: s.exit_time });
                  }
                });
              });

              // Find scheduled blocks on this asset
              const assetBlocks = scheduledBlocks.filter((b) => b.asset_id === asset.id);

              return (
                <div key={asset.id} className="flex items-center border-b border-slate-100 dark:border-[#27272a]/60 pb-3">
                  {/* Left Label */}
                  <div className="w-48 flex-shrink-0 pr-3">
                    <div className="font-pixel text-[8.5px] text-slate-900 dark:text-slate-100 truncate">
                      {asset.id.replace('SEC_', '')}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                      {asset.name}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                      {asset.max_speed_kmph} km/h • 25kV OHE
                    </div>
                  </div>

                  {/* 24-Hour Timeline Bar */}
                  <div className="flex-1 h-14 bg-slate-50/80 dark:bg-[#09090b]/80 border border-slate-200 dark:border-[#27272a] relative rounded-xl overflow-hidden">
                    {/* Hourly Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                      {hours.map((h) => (
                        <div key={h} className="border-r border-slate-200/50 dark:border-[#27272a]/60 h-full" />
                      ))}
                    </div>

                    {/* Render Train Intervals with Safety Buffers */}
                    {(filterMode === 'all' || filterMode === 'trains') &&
                      assetTrainSections.map(({ train, entry, exit }, idx) => {
                        const style = getTrainCategoryStyle(train);

                        const bufStart = Math.max(0, entry - 15);
                        const bufEnd = Math.min(totalMinutes, exit + 15);

                        const bufLeftPct = (bufStart / totalMinutes) * 100;
                        const bufWidthPct = ((bufEnd - bufStart) / totalMinutes) * 100;

                        const leftPct = (entry / totalMinutes) * 100;
                        const widthPct = ((exit - entry) / totalMinutes) * 100;

                        return (
                          <React.Fragment key={`train-${train.id}-${idx}`}>
                            {/* ±15m Safety Buffer Zone (Dashed Hatched) */}
                            <div
                              style={{ left: `${bufLeftPct}%`, width: `${Math.max(bufWidthPct, 0.6)}%` }}
                              className="absolute top-1 bottom-1 bg-cyan-950/30 border-x border-dashed border-cyan-500/50 z-0 pointer-events-none"
                              title={`Safety Buffer: ${bufStart}m to ${bufEnd}m`}
                            />

                            {/* Nominal Train Movement Bar */}
                            <div
                              style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.45)}%` }}
                              onMouseEnter={() =>
                                setHoveredItem({
                                  type: 'train',
                                  id: train.id,
                                  label: `${train.train_number} • ${train.name}`,
                                  subLabel: `Priority P${train.priority} • Type: ${train.train_type.toUpperCase()}`,
                                  sectionName: asset.name,
                                  time: `${String(Math.floor(entry / 60)).padStart(2, '0')}:${String(entry % 60).padStart(2, '0')} → ${String(Math.floor(exit / 60)).padStart(2, '0')}:${String(exit % 60).padStart(2, '0')}`,
                                  extra: `Transit: ${exit - entry}m (Safety Buffer: ±15m)`,
                                })
                              }
                              onMouseLeave={() => setHoveredItem(null)}
                              className={`absolute top-2 bottom-2 ${style.bg} border ${style.border} ${style.shadow} z-10 cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-y-110`}
                            >
                              <span className={`font-pixel text-[7px] ${style.text} font-bold truncate px-0.5`}>
                                {train.train_number}
                              </span>
                            </div>
                          </React.Fragment>
                        );
                      })}

                    {/* Render Scheduled Maintenance Blocks */}
                    {(filterMode === 'all' || filterMode === 'blocks') &&
                      assetBlocks.map((block) => {
                        const leftPct = (block.scheduled_start / totalMinutes) * 100;
                        const widthPct = (block.duration_minutes / totalMinutes) * 100;

                        return (
                          <div
                            key={block.block_request_id}
                            style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1.2)}%` }}
                            onMouseEnter={() =>
                              setHoveredItem({
                                type: 'block',
                                id: block.block_request_id,
                                label: `${block.block_request_id} (Priority P${block.priority})`,
                                subLabel: `Type: ${block.maintenance_type.replace(/_/g, ' ').toUpperCase()}`,
                                sectionName: asset.name,
                                time: `${String(Math.floor(block.scheduled_start / 60)).padStart(2, '0')}:${String(block.scheduled_start % 60).padStart(2, '0')} → ${String(Math.floor(block.scheduled_end / 60)).padStart(2, '0')}:${String(block.scheduled_end % 60).padStart(2, '0')}`,
                                extra: `Duration: ${block.duration_minutes}m | Window Deviation: +${block.deviation_minutes}m`,
                              })
                            }
                            onMouseLeave={() => setHoveredItem(null)}
                            className="absolute top-1.5 bottom-1.5 bg-[#7B1113] hover:bg-red-700 border-2 border-yellow-400 shadow-glow-amber z-20 cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-y-110"
                          >
                            <div className="flex items-center space-x-1 px-1">
                              <PixelWrench size={10} color="#facc15" />
                              <span className="font-pixel text-[7px] text-yellow-300 font-bold truncate">
                                {block.block_request_id}
                              </span>
                            </div>
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

      {/* 3. Real-Time Telemetry & Inspector Tooltip Dock */}
      <div className="bg-white dark:bg-[#121214] border border-slate-200/90 dark:border-[#27272a] rounded-2xl p-4 min-h-[60px] flex items-center justify-between font-mono text-xs shadow-sm transition-colors duration-200">
        {hoveredItem ? (
          <div className="flex items-center space-x-3 w-full">
            <div className="p-2 bg-amber-50 dark:bg-[#18181b] border border-amber-200 dark:border-[#27272a] rounded-xl">
              {hoveredItem.type === 'train' ? (
                <PixelTrain size={22} color="#0284c7" />
              ) : (
                <PixelWrench size={22} color="#d97706" />
              )}
            </div>
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-pixel text-xs text-amber-600 dark:text-yellow-400">
                    {hoveredItem.label}
                  </span>
                  <span className="text-[10px] text-slate-800 dark:text-slate-300 font-bold">
                    {hoveredItem.subLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Section: <strong className="text-slate-900 dark:text-slate-200">{hoveredItem.sectionName}</strong> • {hoveredItem.extra}
                </div>
              </div>

              <div className="text-right">
                <div className="font-digital text-xl text-emerald-600 dark:text-emerald-400 font-bold">
                  {hoveredItem.time}
                </div>
                <span className="text-[8px] font-pixel text-slate-400">TIMETABLE WINDOW</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-slate-400 font-mono text-xs">
            <span className="w-2 h-2 bg-rose-500 animate-pulse inline-block"></span>
            <span>
              Hover over any train traversal or maintenance possession block to inspect micro-timings, safety headway clearances, and schedule deviation details.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
