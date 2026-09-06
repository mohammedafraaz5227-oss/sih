import React, { useState, useEffect } from 'react';
import { Asset, TrainMovement, ScheduledBlock } from '../../types';
import { PixelTrack, PixelWrench, PixelTrain } from '../PixelIcons';

interface MiniGanttStripProps {
  assets: Asset[];
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
  onOpenFullTimeline: () => void;
}

export const MiniGanttStrip: React.FC<MiniGanttStripProps> = ({
  assets,
  trains,
  scheduledBlocks,
  onOpenFullTimeline,
}) => {
  // Live IST Laser Scrubber Line
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

  const totalMinutes = 1440;
  const hours = [0, 4, 8, 12, 16, 20, 24];

  return (
    <div className="pixel-card-light p-4 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-slate-200 pb-2.5 mb-3 gap-2">
        <div className="flex items-center space-x-2">
          <PixelTrack size={18} color="#0284c7" />
          <h3 className="font-pixel text-xs text-slate-900 uppercase">
            24-Hour Corridor Timetable & Headway Strip
          </h3>
          <span className="px-1.5 py-0.5 bg-cyan-100 border border-cyan-400 text-cyan-800 text-[8px] font-pixel">
            LIVE SCRUBBER
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Legend */}
          <div className="flex items-center space-x-3 text-[9px] font-pixel text-slate-600 hidden sm:flex">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2 bg-[#0284c7] inline-block"></span>
              <span>TRAIN</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2 bg-[#d97706] inline-block"></span>
              <span>BLOCK</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2 bg-rose-500 inline-block animate-pulse"></span>
              <span>NOW (IST)</span>
            </span>
          </div>

          <button
            onClick={onOpenFullTimeline}
            className="text-[9px] font-pixel text-blue-700 hover:text-blue-900 underline"
          >
            OPEN FULL GANTT VIEW →
          </button>
        </div>
      </div>

      {/* Mini Gantt Canvas */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[650px] relative">
          {/* LIVE IST LASER SCRUBBER */}
          <div
            style={{ left: `calc(130px + (100% - 130px) * ${scrubberPct / 100})` }}
            className="absolute top-0 bottom-0 w-[2px] bg-rose-600 z-30 pointer-events-none shadow-[0_0_8px_#f43f5e]"
          >
            <div className="absolute -top-3.5 -left-8 bg-rose-600 text-white px-1 py-0.5 text-[7px] font-pixel whitespace-nowrap shadow-sm border border-white">
              {istTimeString} IST
            </div>
          </div>

          {/* Time scale markings */}
          <div className="flex border-b border-slate-200 pb-1 mb-2 text-[9px] font-pixel text-slate-400">
            <div className="w-32 flex-shrink-0">SECTION</div>
            <div className="flex-1 flex justify-between px-1">
              {hours.map((h) => (
                <span key={h} className="font-digital text-slate-600 text-xs">
                  {String(h).padStart(2, '0')}:00
                </span>
              ))}
            </div>
          </div>

          {/* Section rows */}
          <div className="space-y-2">
            {assets.map((asset) => {
              // Trains on this asset
              const assetTrains: { entry: number; exit: number; train: TrainMovement }[] = [];
              trains.forEach((t) => {
                t.sections.forEach((s) => {
                  if (s.asset_id === asset.id) {
                    assetTrains.push({ entry: s.entry_time, exit: s.exit_time, train: t });
                  }
                });
              });

              // Blocks on this asset
              const assetBlocks = scheduledBlocks.filter((b) => b.asset_id === asset.id);

              return (
                <div key={asset.id} className="flex items-center">
                  <div className="w-32 flex-shrink-0 text-[9px] font-mono font-bold text-slate-800 truncate pr-2">
                    {asset.id.replace('SEC_', '')}
                  </div>

                  <div className="flex-1 h-7 bg-slate-100 border border-slate-300 relative overflow-hidden rounded-none">
                    {/* Trains */}
                    {assetTrains.map(({ entry, exit, train }, i) => {
                      const leftPct = (entry / totalMinutes) * 100;
                      const widthPct = ((exit - entry) / totalMinutes) * 100;
                      return (
                        <div
                          key={`tr-${train.id}-${i}`}
                          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.8)}%` }}
                          title={`${train.train_number} ${train.name} (${entry}m - ${exit}m)`}
                          className="absolute top-1 bottom-1 bg-[#0284c7] hover:bg-[#0ea5e9] border border-black z-10 cursor-pointer flex items-center justify-center overflow-hidden"
                        >
                          <span className="text-[6px] font-pixel text-white font-bold px-0.5 truncate">
                            {train.train_number}
                          </span>
                        </div>
                      );
                    })}

                    {/* Blocks */}
                    {assetBlocks.map((b) => {
                      const leftPct = (b.scheduled_start / totalMinutes) * 100;
                      const widthPct = (b.duration_minutes / totalMinutes) * 100;
                      return (
                        <div
                          key={`bk-${b.block_request_id}`}
                          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1.5)}%` }}
                          title={`Block ${b.block_request_id}: ${b.duration_minutes}m`}
                          className="absolute top-0.5 bottom-0.5 bg-[#d97706] hover:bg-[#b45309] border border-black z-20 cursor-pointer flex items-center justify-center overflow-hidden"
                        >
                          <span className="text-[6px] font-pixel text-yellow-100 font-bold px-0.5 truncate">
                            {b.block_request_id}
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
    </div>
  );
};
