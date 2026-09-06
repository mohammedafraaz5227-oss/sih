import React, { useState } from 'react';
import { Asset, TrainMovement, OptimizedSchedule, BlockRequest } from '../types';
import { PixelTrain, PixelWrench, PixelTrack } from './PixelIcons';

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
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'train' | 'block';
    label: string;
    details: string;
    time: string;
  } | null>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const totalMinutes = 1440;

  // Filter scheduled blocks
  const scheduledBlocks = schedule?.blocks.filter(b => b.is_scheduled) || [];

  return (
    <div className="space-y-6">
      {/* Timeline Controls & Legend */}
      <div className="bg-[#1e293b] border-2 border-black shadow-pixel p-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-pixel text-xs text-yellow-400 uppercase flex items-center space-x-2">
            <PixelTrack size={18} color="#facc15" />
            <span>24-Hour Railway Corridor Gantt Timetable</span>
          </h2>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            5 Track Sections • 00:00 to 24:00 (1,440 Mins) • Train Movements & Maintenance Blocks
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-pixel text-slate-300">
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3 bg-cyan-600 border border-cyan-400"></div>
            <span>TRAIN (NOMINAL)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3 bg-cyan-950/80 border border-dashed border-cyan-500"></div>
            <span>15M BUFFER</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3 bg-[#7B1113] border border-yellow-400"></div>
            <span>MAINTENANCE BLOCK</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Timeline Container */}
      <div className="pixel-card bg-[#0b101d] p-4 border-2 border-slate-700 overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Hour Marks Header */}
          <div className="flex border-b-2 border-slate-700 pb-2 mb-4 text-[10px] font-pixel text-slate-400">
            <div className="w-48 flex-shrink-0 font-pixel text-yellow-400">TRACK SECTION</div>
            <div className="flex-1 grid grid-cols-24 gap-0 relative">
              {hours.map((h) => (
                <div key={h} className="text-center border-l border-slate-800 text-[9px] font-digital text-cyan-300">
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Section Rows */}
          <div className="space-y-4">
            {assets.map((asset) => {
              // Find train sections for this asset
              const assetTrainSections: { train: TrainMovement; entry: number; exit: number }[] = [];
              trains.forEach((t) => {
                t.sections.forEach((s) => {
                  if (s.asset_id === asset.id) {
                    assetTrainSections.push({ train: t, entry: s.entry_time, exit: s.exit_time });
                  }
                });
              });

              // Find blocks on this asset
              const assetBlocks = scheduledBlocks.filter((b) => b.asset_id === asset.id);

              return (
                <div key={asset.id} className="flex items-center border-b border-slate-800/80 pb-3">
                  {/* Left Label */}
                  <div className="w-48 flex-shrink-0 pr-3">
                    <div className="font-pixel text-[10px] text-yellow-300 truncate">
                      {asset.id.replace('SEC_', '')}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {asset.name}
                    </div>
                  </div>

                  {/* 24-Hour Timeline Bar */}
                  <div className="flex-1 h-14 bg-black/60 border border-slate-800 relative rounded-none overflow-hidden">
                    {/* Hourly Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                      {hours.map((h) => (
                        <div key={h} className="border-r border-slate-800/40 h-full"></div>
                      ))}
                    </div>

                    {/* Render Train Intervals (with 15-min buffers) */}
                    {assetTrainSections.map(({ train, entry, exit }, idx) => {
                      const bufStart = Math.max(0, entry - 15);
                      const bufEnd = Math.min(totalMinutes, exit + 15);

                      const bufLeftPct = (bufStart / totalMinutes) * 100;
                      const bufWidthPct = ((bufEnd - bufStart) / totalMinutes) * 100;

                      const leftPct = (entry / totalMinutes) * 100;
                      const widthPct = ((exit - entry) / totalMinutes) * 100;

                      return (
                        <React.Fragment key={`train-${train.id}-${idx}`}>
                          {/* 15m Safety Buffer Zone (Dashed Hatched) */}
                          <div
                            style={{ left: `${bufLeftPct}%`, width: `${Math.max(bufWidthPct, 0.5)}%` }}
                            className="absolute top-1 bottom-1 bg-cyan-950/40 border border-dashed border-cyan-600/60 z-0 pointer-events-none"
                          ></div>

                          {/* Nominal Train Movement Bar */}
                          <div
                            style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.4)}%` }}
                            onMouseEnter={() =>
                              setHoveredItem({
                                type: 'train',
                                label: `${train.train_number} - ${train.name}`,
                                details: `Type: ${train.train_type.toUpperCase()} • Priority: P${train.priority} • Section: ${asset.name}`,
                                time: `${String(Math.floor(entry / 60)).padStart(2, '0')}:${String(entry % 60).padStart(2, '0')} - ${String(Math.floor(exit / 60)).padStart(2, '0')}:${String(exit % 60).padStart(2, '0')} (Buffer: ±15m)`,
                              })
                            }
                            onMouseLeave={() => setHoveredItem(null)}
                            className="absolute top-2 bottom-2 bg-cyan-600 hover:bg-cyan-400 border border-black shadow-sm z-10 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
                          >
                            <span className="font-pixel text-[7px] text-black font-bold truncate px-0.5">
                              {train.train_number}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {/* Render Scheduled Maintenance Blocks */}
                    {assetBlocks.map((block) => {
                      const leftPct = (block.scheduled_start / totalMinutes) * 100;
                      const widthPct = (block.duration_minutes / totalMinutes) * 100;

                      return (
                        <div
                          key={block.block_request_id}
                          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%` }}
                          onMouseEnter={() =>
                            setHoveredItem({
                              type: 'block',
                              label: `${block.block_request_id} (P${block.priority}) - ${block.maintenance_type.replace(/_/g, ' ')}`,
                              details: `Section: ${asset.name} • Shift: +${block.deviation_minutes}m • Duration: ${block.duration_minutes}m`,
                              time: `${String(Math.floor(block.scheduled_start / 60)).padStart(2, '0')}:${String(block.scheduled_start % 60).padStart(2, '0')} - ${String(Math.floor(block.scheduled_end / 60)).padStart(2, '0')}:${String(block.scheduled_end % 60).padStart(2, '0')}`,
                            })
                          }
                          onMouseLeave={() => setHoveredItem(null)}
                          className="absolute top-1.5 bottom-1.5 bg-[#7B1113] hover:bg-red-700 border-2 border-yellow-400 shadow-pixel-sm z-20 cursor-pointer flex items-center justify-center overflow-hidden transition-all"
                        >
                          <div className="flex items-center space-x-1 px-1">
                            <PixelWrench size={10} color="#facc15" />
                            <span className="font-pixel text-[8px] text-yellow-300 font-bold truncate">
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

      {/* Hover Info Tooltip Bar */}
      <div className="bg-[#111827] border-2 border-black p-3 min-h-[56px] flex items-center justify-between font-mono text-xs">
        {hoveredItem ? (
          <div className="flex items-center space-x-3">
            {hoveredItem.type === 'train' ? (
              <PixelTrain size={20} color="#06b6d4" />
            ) : (
              <PixelWrench size={20} color="#facc15" />
            )}
            <div>
              <div className="font-pixel text-[11px] text-yellow-400">
                {hoveredItem.label}
              </div>
              <div className="text-slate-300 text-xs">
                {hoveredItem.details} • <strong className="text-cyan-300">{hoveredItem.time}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 font-mono text-xs italic">
            Hover over any train bar (cyan) or maintenance block (maroon) to inspect timings, headways, and deviation details.
          </div>
        )}
      </div>
    </div>
  );
};
