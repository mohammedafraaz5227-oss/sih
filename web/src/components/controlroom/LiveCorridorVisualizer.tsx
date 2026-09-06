import React, { useState, useEffect } from 'react';
import { Station, Asset, TrainMovement, ScheduledBlock } from '../../types';
import { PulsingSignalPip, SignalAspect } from '../ui/PulsingSignalPip';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveCorridorVisualizerProps {
  stations: Station[];
  assets: Asset[];
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
  selectedId: string;
  onSelectStation: (code: string) => void;
  onSelectTrack: (trackId: string) => void;
  isSolving?: boolean;
}

export const LiveCorridorVisualizer: React.FC<LiveCorridorVisualizerProps> = ({
  stations,
  assets,
  trains,
  scheduledBlocks,
  selectedId,
  onSelectStation,
  onSelectTrack,
  isSolving = false,
}) => {
  // Real-time animation loop for trains
  const [trainProgress, setTrainProgress] = useState({
    train1: 22, // 12002 Shatabdi (GZB -> ALG)
    train2: 64, // 12301 Rajdhani (TDK -> MTJ)
    train3: 88, // 12417 Express (MTJ -> AGC)
    train4: 42, // Freight 50211 (ALG -> GZB)
  });

  // Track inspected station/asset
  const [inspectedEntity, setInspectedEntity] = useState<{
    type: 'station' | 'track';
    id: string;
    title: string;
    subtitle: string;
    speed?: number;
    km?: number;
    blocks?: ScheduledBlock[];
    trainCount?: number;
  } | null>(null);

  // Smooth train motion ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTrainProgress((prev) => ({
        train1: prev.train1 >= 95 ? 5 : prev.train1 + 0.35,
        train2: prev.train2 >= 95 ? 8 : prev.train2 + 0.42,
        train3: prev.train3 >= 95 ? 12 : prev.train3 + 0.3,
        train4: prev.train4 <= 5 ? 95 : prev.train4 - 0.22,
      }));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // 6 Main Stations
  const stationList = [
    { code: 'NDLS', name: 'New Delhi', km: 0, x: 8 },
    { code: 'GZB', name: 'Ghaziabad', km: 30, x: 26 },
    { code: 'ALG', name: 'Aligarh', km: 90, x: 44 },
    { code: 'TDK', name: 'Tundla', km: 148, x: 62 },
    { code: 'MTJ', name: 'Mathura', km: 200, x: 79 },
    { code: 'AGC', name: 'Agra Cantt', km: 265, x: 94 },
  ];

  // 5 Track Sections
  const sectionList = [
    { id: 'SEC_NDLS_GZB', name: 'NDLS - GZB', fromX: 8, toX: 26, km: '30 km', maxSpeed: 130 },
    { id: 'SEC_GZB_ALG', name: 'GZB - ALG', fromX: 26, toX: 44, km: '60 km', maxSpeed: 130 },
    { id: 'SEC_ALG_TDK', name: 'ALG - TDK', fromX: 44, toX: 62, km: '58 km', maxSpeed: 120 },
    { id: 'SEC_TDK_MTJ', name: 'TDK - MTJ', fromX: 62, toX: 79, km: '52 km', maxSpeed: 110 },
    { id: 'SEC_MTJ_AGC', name: 'MTJ - AGC', fromX: 79, toX: 94, km: '65 km', maxSpeed: 110 },
  ];

  // Handle station click
  const handleStationClick = (stn: typeof stationList[0]) => {
    onSelectStation(stn.code);
    const relatedBlocks = scheduledBlocks.filter(
      (b) => b.is_scheduled && (b.asset_id.includes(stn.code) || b.asset_name.includes(stn.code))
    );
    setInspectedEntity({
      type: 'station',
      id: stn.code,
      title: `${stn.code} • ${stn.name} Junction`,
      subtitle: `Corridor Chainage: KM ${stn.km} • 25kV AC Electrified`,
      km: stn.km,
      blocks: relatedBlocks,
    });
  };

  // Handle track section click
  const handleTrackClick = (sec: typeof sectionList[0]) => {
    onSelectTrack(sec.id);
    const relatedBlocks = scheduledBlocks.filter(
      (b) => b.is_scheduled && b.asset_id === sec.id
    );
    const passingTrains = trains.filter((t) =>
      t.sections.some((s) => s.asset_id === sec.id)
    );
    setInspectedEntity({
      type: 'track',
      id: sec.id,
      title: `${sec.name} • Section Block`,
      subtitle: `Track Section Length: ${sec.km} • Max Permissible: ${sec.maxSpeed} km/h`,
      speed: sec.maxSpeed,
      blocks: relatedBlocks,
      trainCount: passingTrains.length,
    });
  };

  return (
    <div className="relative w-full bg-white dark:bg-[#0a101d] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden flex flex-col justify-between transition-colors duration-200">
      {/* 1. Header Bar: Title + Legend + Inspector Trigger */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 gap-2.5 z-20">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-4 bg-[#7B1113] rounded-xs shadow-xs" />
          <div>
            <h2 className="font-pixel text-[10px] text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              LIVE CORRIDOR TOPOLOGY & DISPATCH
            </h2>
            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Delhi ⇄ Agra 6-Station Double-Line High-Density Route (265 KM)
            </p>
          </div>
        </div>

        {/* Dynamic Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px]">Down Line (NDLS→AGC)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span className="text-[11px]">Up Line (AGC→NDLS)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs border border-amber-600 hazard-stripes-light inline-block" />
            <span className="text-[11px]">Active Maintenance Possession</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <PulsingSignalPip aspect="green" size="sm" />
            <span className="text-[11px]">Signal Clear</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Corridor Canvas */}
      <div className="relative w-full min-h-[220px] bg-slate-50/70 dark:bg-[#060a12]/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 select-none overflow-hidden">
        {/* CP-SAT Solver Scanning Laser (Visible during solve) */}
        {isSolving && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
            <div className="h-full w-24 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-laser-sweep border-r-2 border-cyan-400" />
            <div className="absolute top-2 right-3 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-pixel text-[8px] animate-pulse">
              RESOLVING TRACK CONSTRAINTS...
            </div>
          </div>
        )}

        <svg className="w-full h-[180px]" viewBox="0 0 1000 180" preserveAspectRatio="none">
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="track-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.5" />
            </pattern>
            {/* Directional Headlight Gradient */}
            <linearGradient id="headlight-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="headlight-left" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1000" height="180" fill="url(#track-grid)" opacity="0.6" />

          {/* DOWN TRACK LINE (NDLS -> AGC at y=70) */}
          <line x1="50" y1="70" x2="960" y2="70" stroke="#94a3b8" strokeWidth="3" />
          <line x1="50" y1="70" x2="960" y2="70" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />

          {/* UP TRACK LINE (AGC -> NDLS at y=110) */}
          <line x1="50" y1="110" x2="960" y2="110" stroke="#94a3b8" strokeWidth="3" />
          <line x1="50" y1="110" x2="960" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />

          {/* Track Crossovers / Scissors Interlockings */}
          <line x1="240" y1="70" x2="270" y2="110" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2,2" />
          <line x1="420" y1="110" x2="450" y2="70" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2,2" />
          <line x1="600" y1="70" x2="630" y2="110" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2,2" />
          <line x1="770" y1="110" x2="800" y2="70" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2,2" />

          {/* Maintenance Possession Zones on Tracks */}
          {scheduledBlocks
            .filter((b) => b.is_scheduled)
            .map((b, idx) => {
              const sec = sectionList.find((s) => s.id === b.asset_id);
              if (!sec) return null;
              const xStart = (sec.fromX / 100) * 1000 + 15;
              const xEnd = (sec.toX / 100) * 1000 - 15;
              const yPos = idx % 2 === 0 ? 64 : 104; // Alternate lines
              return (
                <g key={b.block_request_id} className="cursor-pointer">
                  {/* Glowing Possession Box */}
                  <rect
                    x={xStart}
                    y={yPos}
                    width={xEnd - xStart}
                    height="12"
                    fill="#f59e0b"
                    fillOpacity="0.25"
                    stroke="#d97706"
                    strokeWidth="1.5"
                    rx="3"
                    className="animate-pulse"
                  />
                  {/* Hazard Warning Hash Marks */}
                  <line
                    x1={xStart + 10}
                    y1={yPos}
                    x2={xStart + 20}
                    y2={yPos + 12}
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                  <line
                    x1={xEnd - 20}
                    y1={yPos}
                    x2={xEnd - 10}
                    y2={yPos + 12}
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                  {/* Floating Block Badge */}
                  <rect
                    x={xStart + (xEnd - xStart) / 2 - 35}
                    y={yPos - 12}
                    width="70"
                    height="12"
                    fill="#78350f"
                    rx="2"
                  />
                  <text
                    x={xStart + (xEnd - xStart) / 2}
                    y={yPos - 3}
                    textAnchor="middle"
                    fill="#fef3c7"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    POSSESSION
                  </text>
                </g>
              );
            })}

          {/* Section Click Zones */}
          {sectionList.map((sec) => {
            const isSelected = selectedId === sec.id;
            const x1 = (sec.fromX / 100) * 1000;
            const x2 = (sec.toX / 100) * 1000;
            return (
              <g
                key={sec.id}
                onClick={() => handleTrackClick(sec)}
                className="cursor-pointer group"
              >
                {/* Invisible hover capture area */}
                <rect
                  x={x1 + 10}
                  y="55"
                  width={x2 - x1 - 20}
                  height="70"
                  fill="transparent"
                  className="hover:fill-blue-500/5 transition-all"
                />
                {/* Speed & Chainage Pill along Track */}
                <rect
                  x={x1 + (x2 - x1) / 2 - 28}
                  y="85"
                  width="56"
                  height="12"
                  fill={isSelected ? '#1e40af' : '#ffffff'}
                  stroke={isSelected ? '#3b82f6' : '#cbd5e1'}
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={x1 + (x2 - x1) / 2}
                  y="94"
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#475569'}
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {sec.maxSpeed} km/h
                </text>
              </g>
            );
          })}

          {/* 6 STATIONS (Platforms + Signal Masts + Names) */}
          {stationList.map((stn) => {
            const isSelected = selectedId === stn.code;
            const cx = (stn.x / 100) * 1000;
            return (
              <g
                key={stn.code}
                onClick={() => handleStationClick(stn)}
                className="cursor-pointer group"
              >
                {/* Station Platform Building Graphic */}
                <rect
                  x={cx - 24}
                  y="24"
                  width="48"
                  height="26"
                  fill={isSelected ? '#dbeafe' : '#ffffff'}
                  stroke={isSelected ? '#2563eb' : '#0f172a'}
                  strokeWidth="1.5"
                  rx="4"
                  className="transition-all group-hover:stroke-blue-600"
                />
                {/* Indian Railways Station Roof Accent */}
                <path
                  d={`M ${cx - 24} 24 L ${cx} 16 L ${cx + 24} 24 Z`}
                  fill={isSelected ? '#2563eb' : '#7B1113'}
                />
                {/* Station Code Text */}
                <text
                  x={cx}
                  y="38"
                  textAnchor="middle"
                  fill={isSelected ? '#1d4ed8' : '#0f172a'}
                  fontSize="9"
                  fontFamily='"Press Start 2P", monospace'
                  fontWeight="bold"
                >
                  {stn.code}
                </text>
                {/* Distance km */}
                <text
                  x={cx}
                  y="46"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="7"
                  fontFamily="monospace"
                >
                  {stn.km} km
                </text>

                {/* Station Platform Edge Lines */}
                <rect x={cx - 16} y="62" width="32" height="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                <rect x={cx - 16} y="114" width="32" height="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />

                {/* Vertical Connector Spine to Tracks */}
                <line x1={cx} y1="50" x2={cx} y2="135" stroke={isSelected ? '#3b82f6' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray="2,2" />

                {/* Ground Sensor Track Node */}
                <circle
                  cx={cx}
                  cy="142"
                  r="4"
                  fill={isSelected ? '#2563eb' : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y="156"
                  textAnchor="middle"
                  fill="#334155"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {stn.name}
                </text>
              </g>
            );
          })}

          {/* LIVE MOVING TRAINS */}
          {/* Train 1: 12002 Shatabdi (Moving Right on Down Line, y=70) */}
          <g
            transform={`translate(${(trainProgress.train1 / 100) * 1000 - 30}, 56)`}
            className="transition-transform duration-100 ease-linear pointer-events-none"
          >
            {/* Directional Headlight Beam */}
            <polygon points="45,14 110,6 110,22" fill="url(#headlight-right)" />
            {/* Engine Body */}
            <rect x="0" y="7" width="45" height="14" fill="#0284c7" rx="3" stroke="#0369a1" strokeWidth="1" />
            <rect x="3" y="9" width="8" height="6" fill="#bae6fd" rx="1" />
            {/* Train Number Badge */}
            <rect x="14" y="2" width="30" height="8" fill="#0f172a" rx="2" />
            <text x="29" y="8" textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="monospace" fontWeight="bold">
              12002 EXP
            </text>
          </g>

          {/* Train 2: 12301 Rajdhani Express (Moving Right on Down Line, y=70) */}
          <g
            transform={`translate(${(trainProgress.train2 / 100) * 1000 - 30}, 56)`}
            className="transition-transform duration-100 ease-linear pointer-events-none"
          >
            <polygon points="45,14 110,6 110,22" fill="url(#headlight-right)" />
            <rect x="0" y="7" width="45" height="14" fill="#dc2626" rx="3" stroke="#991b1b" strokeWidth="1" />
            <rect x="3" y="9" width="8" height="6" fill="#fef08a" rx="1" />
            <rect x="14" y="2" width="30" height="8" fill="#7f1d1d" rx="2" />
            <text x="29" y="8" textAnchor="middle" fill="#fef08a" fontSize="6" fontFamily="monospace" fontWeight="bold">
              12301 RAJ
            </text>
          </g>

          {/* Train 3: 12417 Prayagraj Express (Moving Right on Down Line, y=70) */}
          <g
            transform={`translate(${(trainProgress.train3 / 100) * 1000 - 30}, 56)`}
            className="transition-transform duration-100 ease-linear pointer-events-none"
          >
            <polygon points="45,14 110,6 110,22" fill="url(#headlight-right)" />
            <rect x="0" y="7" width="40" height="14" fill="#2563eb" rx="3" stroke="#1d4ed8" strokeWidth="1" />
            <rect x="12" y="2" width="28" height="8" fill="#1e3a8a" rx="2" />
            <text x="26" y="8" textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="monospace">
              12417 SF
            </text>
          </g>

          {/* Train 4: Freight BCN-HL (Moving Left on Up Line, y=110) */}
          <g
            transform={`translate(${(trainProgress.train4 / 100) * 1000 - 20}, 96)`}
            className="transition-transform duration-100 ease-linear pointer-events-none"
          >
            <polygon points="0,14 -60,6 -60,22" fill="url(#headlight-left)" />
            <rect x="0" y="7" width="50" height="14" fill="#15803d" rx="2" stroke="#14532d" strokeWidth="1" />
            <rect x="12" y="2" width="34" height="8" fill="#064e3b" rx="2" />
            <text x="29" y="8" textAnchor="middle" fill="#86efac" fontSize="6" fontFamily="monospace">
              BCN FREIGHT
            </text>
          </g>

          {/* 3-ASPECT PULSING SIGNALS AT SECTION JUNCTIONS */}
          <g transform="translate(245, 48)">
            <circle cx="0" cy="0" r="3" fill="#10b981" className="animate-pulse" />
            <line x1="0" y1="3" x2="0" y2="18" stroke="#475569" strokeWidth="1" />
          </g>
          <g transform="translate(425, 48)">
            <circle cx="0" cy="0" r="3" fill="#f59e0b" className="animate-pulse" />
            <line x1="0" y1="3" x2="0" y2="18" stroke="#475569" strokeWidth="1" />
          </g>
          <g transform="translate(605, 48)">
            <circle cx="0" cy="0" r="3" fill="#10b981" className="animate-pulse" />
            <line x1="0" y1="3" x2="0" y2="18" stroke="#475569" strokeWidth="1" />
          </g>
          <g transform="translate(775, 48)">
            <circle cx="0" cy="0" r="3" fill="#10b981" className="animate-pulse" />
            <line x1="0" y1="3" x2="0" y2="18" stroke="#475569" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* 3. Interactive Telemetry Drawer / Quick Info Pill */}
      <AnimatePresence>
        {inspectedEntity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/90 border border-blue-200/80 dark:border-blue-900/60 rounded-xl flex items-center justify-between gap-4 text-xs font-mono"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-pixel text-[9px]">
                  {inspectedEntity.title}
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  {inspectedEntity.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {inspectedEntity.blocks && inspectedEntity.blocks.length > 0 ? (
                <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-semibold text-[10px] border border-amber-300 dark:border-amber-700">
                  {inspectedEntity.blocks.length} Scheduled Block(s)
                </span>
              ) : (
                <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 font-semibold text-[10px] border border-emerald-300 dark:border-emerald-700">
                  Track Clear • No Possessions
                </span>
              )}

              <button
                onClick={() => setInspectedEntity(null)}
                className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase"
              >
                [CLOSE]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
