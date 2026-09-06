import React, { useState } from 'react';
import { Station, Asset, TrainMovement, ScheduledBlock } from '../../types';

interface LiveCorridorMapCardProps {
  stations: Station[];
  assets: Asset[];
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
  selectedId: string;
  onSelectStation: (code: string) => void;
  onSelectTrack: (trackId: string) => void;
}

export const LiveCorridorMapCard: React.FC<LiveCorridorMapCardProps> = ({
  stations,
  assets,
  trains,
  scheduledBlocks,
  selectedId,
  onSelectStation,
  onSelectTrack,
}) => {
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [searchQuery, setSearchQuery] = useState('');

  // 6 Station hotspot coordinates aligned with the landscape illustration
  const stationPins = [
    { code: 'NDLS', name: 'New Delhi', km: 0, leftPct: 8.5 },
    { code: 'GZB', name: 'Ghaziabad', km: 30, leftPct: 25.5 },
    { code: 'ALG', name: 'Aligarh', km: 90, leftPct: 42.5 },
    { code: 'TDK', name: 'Tundla', km: 148, leftPct: 60.0 },
    { code: 'MTJ', name: 'Mathura', km: 200, leftPct: 77.0 },
    { code: 'AGC', name: 'Agra Cantt', km: 265, leftPct: 93.5 },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* 1. Header Bar: Title + Legend + Map/Satellite Toggle */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-1.5 gap-2 border-b border-slate-100">
        {/* Title */}
        <div className="flex items-center space-x-2 font-pixel text-[9px] text-slate-800 tracking-wide uppercase">
          <span className="text-blue-600 text-sm">🚆</span>
          <span>LIVE CORRIDOR MAP</span>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[9px] text-slate-600 font-mono">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
            <span>Train</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Signal</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span>
            <span>Station</span>
          </div>
        </div>

        {/* Search & Map Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <span className="text-xs text-slate-400">🔍</span>
          </div>

          <div className="inline-flex border border-slate-200 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setMapMode('map')}
              className={`px-2 py-0.5 rounded-md transition-all font-pixel text-[7px] ${
                mapMode === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2 py-0.5 rounded-md transition-all font-pixel text-[7px] ${
                mapMode === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* 2. Panoramic Pixel Landscape Banner */}
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner group">
        <img
          src="/corridor-landscape.png"
          alt="Delhi-Agra Live Corridor Panoramic Landscape"
          className="w-full h-auto object-cover select-none pointer-events-none block min-h-[145px]"
        />

        {/* Interactive Hotspot Overlay Layer */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {stationPins.map((stn) => {
            const isSelected = selectedId === stn.code;
            return (
              <div
                key={stn.code}
                onClick={() => onSelectStation(stn.code)}
                style={{ left: `${stn.leftPct}%` }}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
              >
                {/* Active Animated Signal Light (Green / Amber) */}
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black shadow-[0_0_8px_#10b981] animate-pulse mb-8" />

                {/* Clickable Touch Target */}
                <div
                  className={`w-12 h-14 rounded-md transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-500/20' : 'hover:bg-white/20'
                  }`}
                  title={`${stn.name} (${stn.code}) - KM ${stn.km}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
