import React, { useState } from 'react';
import { Station, Asset, OptimizedSchedule, BlockRequest, TrainMovement } from '../types';
import { PixelStation, PixelTrack, PixelSignal, PixelTrain, PixelWrench } from './PixelIcons';

interface RailwayNetworkProps {
  stations: Station[];
  assets: Asset[];
  schedule: OptimizedSchedule | null;
  blocks: BlockRequest[];
  trains: TrainMovement[];
}

export const RailwayNetwork: React.FC<RailwayNetworkProps> = ({
  stations,
  assets,
  schedule,
  blocks,
  trains,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || 'SEC_NDLS_GZB');
  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  // Find blocks scheduled on selected asset
  const scheduledBlocksOnAsset = schedule?.blocks.filter(
    b => b.asset_id === selectedAssetId && b.is_scheduled
  ) || [];

  // Find trains using selected asset
  const trainsOnAsset = trains.filter(t =>
    t.sections.some(s => s.asset_id === selectedAssetId)
  );

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#1e293b] border-2 border-black shadow-pixel p-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-pixel text-xs text-yellow-400 uppercase flex items-center space-x-2">
            <PixelTrack size={18} color="#facc15" />
            <span>Delhi–Agra Railway Corridor Network Map</span>
          </h2>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            6 Stations • 5 Track Sections • 265 Kilometers • Double-Line Electrified Trunk Line
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-pixel text-slate-300">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-green-500 border border-black inline-block"></span>
            <span>AVAILABLE</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-yellow-500 border border-black inline-block"></span>
            <span>MAINTENANCE POSSESSION</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-cyan-500 border border-black inline-block"></span>
            <span>TRAIN TRAVERSAL</span>
          </span>
        </div>
      </div>

      {/* Corridor Diagram: Interactive Pixel Art Schematic */}
      <div className="pixel-card p-6 overflow-x-auto bg-[#0b101d] border-2 border-slate-700">
        <div className="min-w-[850px] relative py-6">
          {/* Main Corridor Line Track (Visual Dual Rails) */}
          <div className="absolute top-[82px] left-8 right-8 h-4 bg-[#1e293b] border-y-2 border-slate-600">
            {/* Alternating Railway Sleepers */}
            <div className="w-full h-full railway-track opacity-70"></div>
          </div>

          {/* Render 6 Stations and 5 Connecting Sections */}
          <div className="relative flex justify-between items-start px-4">
            {stations.map((stn, index) => {
              const nextStation = stations[index + 1];
              const section = nextStation
                ? assets.find(a => a.id === `SEC_${stn.code}_${nextStation.code}`)
                : null;
              const isSelected = section && section.id === selectedAssetId;

              // Check if any block is scheduled on this section
              const hasBlockScheduled = section && schedule?.blocks.some(
                b => b.asset_id === section.id && b.is_scheduled
              );

              return (
                <React.Fragment key={stn.id}>
                  {/* Station Node */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-14 h-14 bg-[#182234] border-2 border-black shadow-pixel-sm flex flex-col items-center justify-center p-1 relative hover:border-yellow-400 transition-colors">
                      <PixelStation size={24} color="#facc15" />
                      <span className="font-pixel text-[8px] text-yellow-300 font-bold mt-1">
                        {stn.code}
                      </span>
                      {/* Signal Lamp on Station */}
                      <div className="absolute -top-3 -right-2">
                        <PixelSignal aspect="green" size={16} />
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <div className="font-pixel text-[9px] text-white whitespace-nowrap">
                        {stn.name}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        KM {stn.km}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {stn.platforms} PF
                      </div>
                    </div>
                  </div>

                  {/* Section between this station and next */}
                  {section && (
                    <div className="flex-1 flex flex-col items-center justify-center px-2 relative">
                      <button
                        onClick={() => setSelectedAssetId(section.id)}
                        className={`mt-4 px-2 py-1 border-2 text-[9px] font-pixel transition-all z-10 ${
                          isSelected
                            ? 'bg-yellow-500 text-black border-black shadow-pixel-sm scale-105'
                            : hasBlockScheduled
                            ? 'bg-[#7B1113] text-yellow-300 border-black hover:bg-red-800'
                            : 'bg-slate-800 text-slate-300 border-black hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {hasBlockScheduled && <PixelWrench size={12} color="#facc15" />}
                          <span>{section.end_km - section.start_km} KM</span>
                        </div>
                      </button>

                      <div className="mt-1 text-[9px] font-mono text-slate-400 text-center">
                        {section.max_speed_kmph} km/h • 25kV OHE
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Track Section Detail Inspector */}
      {selectedAsset && (
        <div className="pixel-card p-5 border-2 border-black bg-[#111827]">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-slate-700 pb-3 gap-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#7B1113] border-2 border-black">
                <PixelTrack size={24} color="#facc15" />
              </div>
              <div>
                <span className="text-[10px] font-pixel text-yellow-400">
                  TRACK SECTION INSPECTION
                </span>
                <h3 className="font-pixel text-sm text-white">
                  {selectedAsset.id}: {selectedAsset.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-green-950 border border-green-700 text-green-400 text-[10px] font-pixel">
                STATUS: OPERATIONAL
              </span>
              <span className="px-2.5 py-1 bg-blue-950 border border-blue-700 text-cyan-300 text-[10px] font-pixel">
                MAX: {selectedAsset.max_speed_kmph} KM/H
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Left: Scheduled Maintenance Blocks on this Section */}
            <div>
              <h4 className="font-pixel text-xs text-yellow-400 mb-2 flex items-center space-x-1.5">
                <PixelWrench size={16} color="#facc15" />
                <span>SCHEDULED MAINTENANCE BLOCKS ({scheduledBlocksOnAsset.length})</span>
              </h4>

              {scheduledBlocksOnAsset.length === 0 ? (
                <div className="bg-black/50 border border-slate-800 p-4 text-xs font-mono text-slate-400 text-center">
                  No maintenance blocks currently scheduled on this section.
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledBlocksOnAsset.map(block => (
                    <div
                      key={block.block_request_id}
                      className="bg-black/60 border border-slate-700 p-3 text-xs font-mono flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-pixel text-[10px] text-yellow-400">{block.block_request_id}</span>
                          <span className="px-1.5 py-0.2 bg-red-950 border border-red-700 text-red-300 text-[8px] font-pixel">
                            P{block.priority}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] capitalize mt-0.5">
                          {block.maintenance_type.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-digital text-base">
                          {String(Math.floor(block.scheduled_start / 60)).padStart(2, '0')}:
                          {String(block.scheduled_start % 60).padStart(2, '0')} -{' '}
                          {String(Math.floor(block.scheduled_end / 60)).padStart(2, '0')}:
                          {String(block.scheduled_end % 60).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Duration: {block.duration_minutes}m (Dev: {block.deviation_minutes}m)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Timetabled Trains Traversing this Section */}
            <div>
              <h4 className="font-pixel text-xs text-cyan-400 mb-2 flex items-center space-x-1.5">
                <PixelTrain size={16} color="#38bdf8" />
                <span>TIMETABLED TRAIN MOVEMENTS ({trainsOnAsset.length})</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {trainsOnAsset.map(train => {
                  const sec = train.sections.find(s => s.asset_id === selectedAssetId)!;
                  return (
                    <div
                      key={train.id}
                      className="bg-black/60 border border-slate-800 p-2.5 text-xs font-mono flex items-center justify-between"
                    >
                      <div>
                        <div className="font-pixel text-[10px] text-white">
                          {train.train_number} • {train.name}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          Type: {train.train_type} (Priority: {train.priority})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-300 font-digital text-base">
                          {String(Math.floor(sec.entry_time / 60)).padStart(2, '0')}:
                          {String(sec.entry_time % 60).padStart(2, '0')} -{' '}
                          {String(Math.floor(sec.exit_time / 60)).padStart(2, '0')}:
                          {String(sec.exit_time % 60).padStart(2, '0')}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          Buffer: ±15m safety zone
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
