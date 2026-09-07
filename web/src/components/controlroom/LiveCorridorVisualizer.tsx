import React, { useState, useEffect, useRef } from 'react';
import { Station, Asset, TrainMovement, ScheduledBlock } from '../../types';
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
  onSelectTrain?: (trainNumber: string) => void;
}

// 6 Corridor Stations
const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', km: 0, x: 105, isOrigin: true },
  { code: 'GZB', name: 'Ghaziabad', km: 30, x: 350, isOrigin: false },
  { code: 'ALG', name: 'Aligarh', km: 90, x: 605, isOrigin: false },
  { code: 'TDK', name: 'Tundla', km: 148, x: 845, isOrigin: false },
  { code: 'MTJ', name: 'Mathura', km: 200, x: 1080, isOrigin: false },
  { code: 'AGC', name: 'Agra Cantt', km: 265, x: 1280, isOrigin: false },
];

// 5 Track Sections
const SECTIONS = [
  { id: 'SEC_NDLS_GZB', name: 'NDLS - GZB', fromX: 105, toX: 350, lengthKm: 30, maxSpeed: 130 },
  { id: 'SEC_GZB_ALG', name: 'GZB - ALG', fromX: 350, toX: 605, lengthKm: 60, maxSpeed: 130 },
  { id: 'SEC_ALG_TDK', name: 'ALG - TDK', fromX: 605, toX: 845, lengthKm: 58, maxSpeed: 120 },
  { id: 'SEC_TDK_MTJ', name: 'TDK - MTJ', fromX: 845, toX: 1080, lengthKm: 52, maxSpeed: 110 },
  { id: 'SEC_MTJ_AGC', name: 'MTJ - AGC', fromX: 1080, toX: 1280, lengthKm: 65, maxSpeed: 110 },
];

// Track Y coordinates on the 1376x340 background canvas
const DOWN_LINE_Y = 113; // Upper track (NDLS -> AGC, Left to Right)
const UP_LINE_Y = 170;   // Lower track (AGC -> NDLS, Right to Left)

// Signal mast positions along the tracks
const SIGNAL_POSTS = [
  { id: 'SIG_NDLS_DN', x: 125, trackY: DOWN_LINE_Y, line: 'down' },
  { id: 'SIG_GZB_DN', x: 375, trackY: DOWN_LINE_Y, line: 'down' },
  { id: 'SIG_ALG_DN', x: 585, trackY: DOWN_LINE_Y, line: 'down' },
  { id: 'SIG_TDK_DN', x: 825, trackY: DOWN_LINE_Y, line: 'down' },
  { id: 'SIG_MTJ_DN', x: 1060, trackY: DOWN_LINE_Y, line: 'down' },
  { id: 'SIG_GZB_UP', x: 325, trackY: UP_LINE_Y, line: 'up' },
  { id: 'SIG_ALG_UP', x: 625, trackY: UP_LINE_Y, line: 'up' },
  { id: 'SIG_TDK_UP', x: 865, trackY: UP_LINE_Y, line: 'up' },
  { id: 'SIG_MTJ_UP', x: 1100, trackY: UP_LINE_Y, line: 'up' },
  { id: 'SIG_AGC_UP', x: 1255, trackY: UP_LINE_Y, line: 'up' },
];

export const LiveCorridorVisualizer: React.FC<LiveCorridorVisualizerProps> = ({
  stations,
  assets,
  trains,
  scheduledBlocks,
  selectedId,
  onSelectStation,
  onSelectTrack,
  isSolving = false,
  onSelectTrain,
}) => {
  // Map View Mode: Scenic vs Satellite
  const [viewMode, setViewMode] = useState<'scenic' | 'satellite'>('scenic');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Inspector Drawer State
  const [inspectedItem, setInspectedItem] = useState<{
    type: 'station' | 'track' | 'train' | 'possession';
    title: string;
    subtitle: string;
    metrics: { label: string; value: string }[];
  } | null>(null);

  // Hover Tooltip State
  const [hoveredTrain, setHoveredTrain] = useState<{
    number: string;
    name: string;
    speed: string;
    location: string;
    x: number;
    y: number;
  } | null>(null);

  // Train animation state managed via requestAnimationFrame for 60fps interpolation
  const [trainPositions, setTrainPositions] = useState({
    // Down Line (x goes 0 -> 1376)
    shatabdi: { x: 420, speed: 1.15, paused: false, pauseTimer: 0 },
    rajdhani: { x: 140, speed: 1.35, paused: false, pauseTimer: 0 },
    // Up Line (x goes 1376 -> 0)
    freight: { x: 920, speed: 0.75, paused: false, pauseTimer: 0 },
    prayagraj: { x: 1220, speed: 1.05, paused: false, pauseTimer: 0 },
  });

  const animRef = useRef<number>();

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 2.5); // Normalized to 60fps
      lastTime = time;

      setTrainPositions((prev) => {
        // Update Shatabdi (Down Line)
        let sX = prev.shatabdi.x;
        let sPaused = prev.shatabdi.paused;
        let sTimer = prev.shatabdi.pauseTimer;

        if (sPaused) {
          sTimer -= delta;
          if (sTimer <= 0) sPaused = false;
        } else {
          sX += prev.shatabdi.speed * delta;
          // Station stop at Aligarh (x ≈ 605)
          if (sX >= 600 && sX <= 606 && sTimer <= 0) {
            sPaused = true;
            sTimer = 90; // 1.5 second halt
          }
          if (sX > 1400) sX = -120;
        }

        // Update Rajdhani (Down Line)
        let rX = prev.rajdhani.x + prev.rajdhani.speed * delta;
        if (rX > 1400) rX = -120;

        // Update Freight (Up Line, moving right-to-left)
        let fX = prev.freight.x - prev.freight.speed * delta;
        if (fX < -160) fX = 1420;

        // Update Prayagraj (Up Line)
        let pX = prev.prayagraj.x;
        let pPaused = prev.prayagraj.paused;
        let pTimer = prev.prayagraj.pauseTimer;

        if (pPaused) {
          pTimer -= delta;
          if (pTimer <= 0) pPaused = false;
        } else {
          pX -= prev.prayagraj.speed * delta;
          // Station stop at Mathura (x ≈ 1080)
          if (pX <= 1085 && pX >= 1079 && pTimer <= 0) {
            pPaused = true;
            pTimer = 80;
          }
          if (pX < -120) pX = 1420;
        }

        return {
          shatabdi: { ...prev.shatabdi, x: sX, paused: sPaused, pauseTimer: sTimer },
          rajdhani: { ...prev.rajdhani, x: rX },
          freight: { ...prev.freight, x: fX },
          prayagraj: { ...prev.prayagraj, x: pX, paused: pPaused, pauseTimer: pTimer },
        };
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Compute live signal aspect based on train proximities
  const getSignalAspect = (sig: (typeof SIGNAL_POSTS)[0]) => {
    if (sig.line === 'down') {
      const sDist = sig.x - trainPositions.shatabdi.x;
      const rDist = sig.x - trainPositions.rajdhani.x;
      if ((sDist > 0 && sDist < 80) || (rDist > 0 && rDist < 80)) return 'red';
      if ((sDist >= 80 && sDist < 180) || (rDist >= 80 && rDist < 180)) return 'amber';
      return 'green';
    } else {
      const fDist = trainPositions.freight.x - sig.x;
      const pDist = trainPositions.prayagraj.x - sig.x;
      if ((fDist > 0 && fDist < 80) || (pDist > 0 && pDist < 80)) return 'red';
      if ((fDist >= 80 && fDist < 180) || (pDist >= 80 && pDist < 180)) return 'amber';
      return 'green';
    }
  };

  // Station Click
  const handleStationClick = (stn: (typeof STATIONS)[0]) => {
    onSelectStation(stn.code);
    setInspectedItem({
      type: 'station',
      title: `${stn.name} Junction (${stn.code})`,
      subtitle: `Chainage: KM ${stn.km} • Delhi-Agra High-Density Corridor`,
      metrics: [
        { label: 'Electrification', value: '25 kV AC OHE Double-Line' },
        { label: 'Route Speed Limit', value: '130 km/h Permissible' },
        { label: 'Signaling Type', value: 'Automatic Block Signaling (ABS)' },
        { label: 'Track Interlocking', value: 'Electronic Interlocking (EI)' },
      ],
    });
  };

  // Track Click
  const handleTrackClick = (sec: (typeof SECTIONS)[0]) => {
    onSelectTrack(sec.id);
    const activeBlocks = scheduledBlocks.filter((b) => b.is_scheduled && b.asset_id === sec.id);
    setInspectedItem({
      type: 'track',
      title: `${sec.name} Block Section`,
      subtitle: `Track Section: ${sec.lengthKm} KM • Max Permissible Speed: ${sec.maxSpeed} km/h`,
      metrics: [
        { label: 'Active Possessions', value: `${activeBlocks.length} Maintenance Block(s)` },
        { label: 'Safety Buffer', value: '15 Minutes Before/After Trains' },
        { label: 'Interlocking Status', value: 'Normal Block Working' },
        { label: 'Line Capacity', value: '120 Trains / 24 Hours' },
      ],
    });
  };

  return (
    <div className="relative w-full bg-white dark:bg-[#0a101d] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden flex flex-col justify-between transition-colors duration-200">
      {/* 1. Header Bar: Title + Indian Railways Crest & Slogan */}
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

        {/* Right: Indian Railways Slogan Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-base">🇮🇳</span>
          <div className="flex flex-col text-right">
            <span className="font-pixel text-[7.5px] text-slate-900 dark:text-slate-100 tracking-wider">
              INDIAN RAILWAYS
            </span>
            <span className="font-mono text-[8.5px] text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              SAFE TRACKS • STRONGER TOMORROW
            </span>
          </div>
        </div>
      </div>

      {/* 2. Panoramic Corridor Canvas */}
      <div
        className="relative w-full aspect-[1376/340] min-h-[260px] sm:min-h-[290px] lg:min-h-[320px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 select-none shadow-inner group"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.25s ease' }}
      >
        {/* Layer A: Pure Static Scenic Landscape Background (Empty tracks, no baked-in trains/people) */}
        {viewMode === 'scenic' ? (
          <img
            src="/corridor_scenic_bg.jpg"
            alt="Delhi to Agra Railway Corridor Landscape"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          /* Satellite Terrain Grid Mode */
          <div className="absolute inset-0 w-full h-full bg-[#0a1424] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-1/3 left-0 right-0 h-1 bg-cyan-500/40" />
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-indigo-500/40" />
          </div>
        )}

        {/* Solver Scanning Beam */}
        {isSolving && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
            <div className="h-full w-28 bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent animate-laser-sweep border-r-2 border-cyan-400" />
            <div className="absolute top-3 right-4 px-2.5 py-1 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-pixel text-[8px] animate-pulse">
              RESOLVING TRACK INTERVALS & HEADWAYS...
            </div>
          </div>
        )}

        {/* Layer B: Interactive SVG / Graphic Overlay (ViewBox 0 0 1376 340) */}
        <svg
          viewBox="0 0 1376 340"
          className="absolute inset-0 w-full h-full z-10"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Directional Headlight Gradients */}
            <linearGradient id="headlight-dn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#fef08a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="headlight-up" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#fef08a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>
            {/* Active Hazard Stripes Pattern */}
            <pattern id="hazard-pattern" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="16" fill="#f59e0b" />
              <rect x="8" width="8" height="16" fill="#0f172a" />
            </pattern>
          </defs>

          {/* Section Click Captures */}
          {SECTIONS.map((sec) => (
            <rect
              key={sec.id}
              x={sec.fromX}
              y="90"
              width={sec.toX - sec.fromX}
              height="100"
              fill="transparent"
              className="cursor-pointer hover:fill-blue-500/10 transition-colors"
              onClick={() => handleTrackClick(sec)}
            />
          ))}

          {/* Active Maintenance Possession Zone at ALG (KM 90-148) */}
          <g className="cursor-pointer" onClick={() => handleTrackClick(SECTIONS[2])}>
            {/* Orange hazard ballast highlight */}
            <rect
              x="520"
              y="106"
              width="150"
              height="14"
              fill="url(#hazard-pattern)"
              opacity="0.85"
              stroke="#d97706"
              strokeWidth="1.5"
              rx="2"
            />
            {/* Track Machine / Crane Graphic on Site */}
            <g transform="translate(565, 84)">
              {/* Yellow Track Excavator Cabin */}
              <rect x="0" y="6" width="28" height="16" fill="#f59e0b" stroke="#78350f" strokeWidth="1" rx="2" />
              <rect x="14" y="8" width="10" height="7" fill="#38bdf8" />
              {/* Crane Arm */}
              <path d="M 6 6 L 14 -6 L 22 -6" stroke="#d97706" strokeWidth="2.5" fill="none" />
              <line x1="22" y1="-6" x2="22" y2="4" stroke="#475569" strokeWidth="1.5" />
              {/* Flashing Amber Beacon */}
              <circle cx="10" cy="4" r="2.5" fill="#ef4444" className="animate-ping" />
              <circle cx="10" cy="4" r="2" fill="#f59e0b" />
              {/* Caution Badge */}
              <rect x="-18" y="-12" width="22" height="14" fill="#78350f" rx="3" stroke="#f59e0b" strokeWidth="1" />
              <text x="-7" y="-2" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="bold">⚠️</text>
            </g>
          </g>

          {/* 3-Aspect Railway Signals */}
          {SIGNAL_POSTS.map((sig) => {
            const aspect = getSignalAspect(sig);
            const isDn = sig.line === 'down';
            const mastTopY = isDn ? sig.trackY - 26 : sig.trackY - 26;

            return (
              <g key={sig.id} transform={`translate(${sig.x}, ${mastTopY})`} className="pointer-events-none">
                {/* Mast Post */}
                <line x1="0" y1="0" x2="0" y2="24" stroke="#0f172a" strokeWidth="2" />
                {/* Signal Head Target Board */}
                <rect x="-4" y="0" width="8" height="18" fill="#0f172a" rx="2" stroke="#334155" strokeWidth="0.8" />
                {/* Red Aspect (Top) */}
                <circle cx="0" cy="3.5" r="2" fill={aspect === 'red' ? '#ef4444' : '#450a0a'} />
                {aspect === 'red' && <circle cx="0" cy="3.5" r="4" fill="#ef4444" opacity="0.4" className="animate-pulse" />}
                {/* Yellow Aspect (Middle) */}
                <circle cx="0" cy="9" r="2" fill={aspect === 'amber' ? '#f59e0b' : '#451a03'} />
                {aspect === 'amber' && <circle cx="0" cy="9" r="4" fill="#f59e0b" opacity="0.4" className="animate-pulse" />}
                {/* Green Aspect (Bottom) */}
                <circle cx="0" cy="14.5" r="2" fill={aspect === 'green' ? '#22c55e' : '#052e16'} />
                {aspect === 'green' && <circle cx="0" cy="14.5" r="4" fill="#22c55e" opacity="0.4" className="animate-pulse" />}
              </g>
            );
          })}

          {/* ===================== REAL PIXEL-ART TRAINS ===================== */}

          {/* 1. 12002 Shatabdi Express (Down Line, Upper Track, Left-to-Right) */}
          <g
            transform={`translate(${trainPositions.shatabdi.x}, ${DOWN_LINE_Y - 9})`}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectTrain && onSelectTrain('12002')}
            onMouseEnter={() =>
              setHoveredTrain({
                number: '12002',
                name: 'Shatabdi Express',
                speed: trainPositions.shatabdi.paused ? '0 km/h (HALT)' : '130 km/h',
                location: 'Down Line • NDLS → AGC',
                x: trainPositions.shatabdi.x,
                y: DOWN_LINE_Y,
              })
            }
            onMouseLeave={() => setHoveredTrain(null)}
          >
            {/* Forward Headlight Beam */}
            <polygon points="76,8 145,2 145,14" fill="url(#headlight-dn)" />
            {/* WAP-5 Electric Locomotive (White & Blue) */}
            <rect x="52" y="2" width="24" height="12" fill="#f8fafc" stroke="#0f172a" strokeWidth="0.8" rx="2" />
            <rect x="52" y="6" width="24" height="3" fill="#0284c7" />
            <rect x="68" y="4" width="6" height="4" fill="#38bdf8" />
            {/* Pantograph */}
            <path d="M 58 2 L 62 -3 L 66 2" stroke="#475569" strokeWidth="1" fill="none" />
            {/* Coach 1 (Executive Chair Car - Sky Blue) */}
            <rect x="26" y="2" width="24" height="12" fill="#0284c7" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            <rect x="28" y="4" width="20" height="3" fill="#bae6fd" />
            {/* Coach 2 (AC Chair Car) */}
            <rect x="0" y="2" width="24" height="12" fill="#0284c7" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            <rect x="2" y="4" width="20" height="3" fill="#bae6fd" />
            {/* Couplers */}
            <line x1="24" y1="8" x2="26" y2="8" stroke="#000" strokeWidth="2" />
            <line x1="50" y1="8" x2="52" y2="8" stroke="#000" strokeWidth="2" />
            {/* Wheels / Bogies */}
            <circle cx="6" cy="14" r="1.5" fill="#334155" />
            <circle cx="18" cy="14" r="1.5" fill="#334155" />
            <circle cx="32" cy="14" r="1.5" fill="#334155" />
            <circle cx="44" cy="14" r="1.5" fill="#334155" />
            <circle cx="58" cy="14" r="1.5" fill="#334155" />
            <circle cx="70" cy="14" r="1.5" fill="#334155" />
          </g>

          {/* 2. 12301 Rajdhani Express (Down Line, Upper Track, Left-to-Right) */}
          <g
            transform={`translate(${trainPositions.rajdhani.x}, ${DOWN_LINE_Y - 9})`}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectTrain && onSelectTrain('12301')}
            onMouseEnter={() =>
              setHoveredTrain({
                number: '12301',
                name: 'Rajdhani Express',
                speed: '130 km/h (CRUISING)',
                location: 'Down Line • NDLS → AGC',
                x: trainPositions.rajdhani.x,
                y: DOWN_LINE_Y,
              })
            }
            onMouseLeave={() => setHoveredTrain(null)}
          >
            {/* Headlight Beam */}
            <polygon points="76,8 155,1 155,15" fill="url(#headlight-dn)" />
            {/* WAP-7 Locomotive (Red & Cream) */}
            <rect x="52" y="2" width="24" height="12" fill="#7B1113" stroke="#0f172a" strokeWidth="0.8" rx="2" />
            <rect x="52" y="6" width="24" height="2.5" fill="#fde047" />
            <rect x="68" y="4" width="6" height="4" fill="#38bdf8" />
            {/* Pantograph */}
            <path d="M 58 2 L 62 -3 L 66 2" stroke="#d97706" strokeWidth="1" fill="none" />
            {/* LHB Coach 1 (Red & Cream) */}
            <rect x="26" y="2" width="24" height="12" fill="#7B1113" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            <rect x="28" y="4" width="20" height="3" fill="#fef08a" />
            {/* LHB Coach 2 */}
            <rect x="0" y="2" width="24" height="12" fill="#7B1113" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            <rect x="2" y="4" width="20" height="3" fill="#fef08a" />
            {/* Couplers */}
            <line x1="24" y1="8" x2="26" y2="8" stroke="#000" strokeWidth="2" />
            <line x1="50" y1="8" x2="52" y2="8" stroke="#000" strokeWidth="2" />
            {/* Wheels */}
            <circle cx="6" cy="14" r="1.5" fill="#334155" />
            <circle cx="18" cy="14" r="1.5" fill="#334155" />
            <circle cx="32" cy="14" r="1.5" fill="#334155" />
            <circle cx="44" cy="14" r="1.5" fill="#334155" />
            <circle cx="58" cy="14" r="1.5" fill="#334155" />
            <circle cx="70" cy="14" r="1.5" fill="#334155" />
          </g>

          {/* 3. BCN-HL Heavy Freight (Up Line, Lower Track, Right-to-Left) */}
          <g
            transform={`translate(${trainPositions.freight.x}, ${UP_LINE_Y - 9})`}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectTrain && onSelectTrain('50211')}
            onMouseEnter={() =>
              setHoveredTrain({
                number: '50211',
                name: 'BCN-HL Freight Rake',
                speed: '75 km/h',
                location: 'Up Line • AGC → NDLS',
                x: trainPositions.freight.x,
                y: UP_LINE_Y,
              })
            }
            onMouseLeave={() => setHoveredTrain(null)}
          >
            {/* Forward Headlight Beam (Facing Left) */}
            <polygon points="0,8 -80,2 -80,14" fill="url(#headlight-up)" />
            {/* WAG-9 Electric Locomotive (Green) */}
            <rect x="0" y="2" width="24" height="12" fill="#15803d" stroke="#0f172a" strokeWidth="0.8" rx="2" />
            <rect x="0" y="7" width="24" height="2" fill="#facc15" />
            <rect x="2" y="4" width="5" height="4" fill="#bae6fd" />
            {/* Pantograph */}
            <path d="M 12 2 L 16 -3 L 20 2" stroke="#475569" strokeWidth="1" fill="none" />
            {/* Boxcar 1 (Rust Red Container) */}
            <rect x="26" y="2" width="22" height="12" fill="#991b1b" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            {/* Boxcar 2 (Deep Blue Container) */}
            <rect x="50" y="2" width="22" height="12" fill="#1e3a8a" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            {/* Boxcar 3 (Green Container) */}
            <rect x="74" y="2" width="22" height="12" fill="#166534" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            {/* Boxcar 4 (Red Cargo) */}
            <rect x="98" y="2" width="22" height="12" fill="#b91c1c" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            {/* Couplers */}
            <line x1="24" y1="8" x2="26" y2="8" stroke="#000" strokeWidth="2" />
            <line x1="48" y1="8" x2="50" y2="8" stroke="#000" strokeWidth="2" />
            <line x1="72" y1="8" x2="74" y2="8" stroke="#000" strokeWidth="2" />
            <line x1="96" y1="8" x2="98" y2="8" stroke="#000" strokeWidth="2" />
            {/* Wheels */}
            <circle cx="4" cy="14" r="1.5" fill="#334155" />
            <circle cx="18" cy="14" r="1.5" fill="#334155" />
            <circle cx="30" cy="14" r="1.5" fill="#334155" />
            <circle cx="44" cy="14" r="1.5" fill="#334155" />
            <circle cx="54" cy="14" r="1.5" fill="#334155" />
            <circle cx="68" cy="14" r="1.5" fill="#334155" />
            <circle cx="78" cy="14" r="1.5" fill="#334155" />
            <circle cx="92" cy="14" r="1.5" fill="#334155" />
            <circle cx="102" cy="14" r="1.5" fill="#334155" />
            <circle cx="116" cy="14" r="1.5" fill="#334155" />
          </g>

          {/* 4. 12417 Prayagraj Express (Up Line, Lower Track, Right-to-Left) */}
          <g
            transform={`translate(${trainPositions.prayagraj.x}, ${UP_LINE_Y - 9})`}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => onSelectTrain && onSelectTrain('12417')}
            onMouseEnter={() =>
              setHoveredTrain({
                number: '12417',
                name: 'Prayagraj Express',
                speed: trainPositions.prayagraj.paused ? '0 km/h (HALT)' : '110 km/h',
                location: 'Up Line • AGC → NDLS',
                x: trainPositions.prayagraj.x,
                y: UP_LINE_Y,
              })
            }
            onMouseLeave={() => setHoveredTrain(null)}
          >
            {/* Forward Headlight Beam */}
            <polygon points="0,8 -80,2 -80,14" fill="url(#headlight-up)" />
            {/* WAP-7 Loco */}
            <rect x="0" y="2" width="24" height="12" fill="#7B1113" stroke="#0f172a" strokeWidth="0.8" rx="2" />
            <rect x="0" y="6" width="24" height="2.5" fill="#fde047" />
            <rect x="2" y="4" width="5" height="4" fill="#38bdf8" />
            {/* Classic ICF Blue Coach 1 */}
            <rect x="26" y="2" width="24" height="12" fill="#1d4ed8" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            <rect x="28" y="4" width="20" height="2" fill="#e0f2fe" />
            {/* Classic ICF Blue Coach 2 */}
            <rect x="52" y="2" width="24" height="12" fill="#1d4ed8" stroke="#0f172a" strokeWidth="0.8" rx="1" />
            <rect x="54" y="4" width="20" height="2" fill="#e0f2fe" />
            {/* Couplers */}
            <line x1="24" y1="8" x2="26" y2="8" stroke="#000" strokeWidth="2" />
            <line x1="50" y1="8" x2="52" y2="8" stroke="#000" strokeWidth="2" />
            {/* Wheels */}
            <circle cx="4" cy="14" r="1.5" fill="#334155" />
            <circle cx="18" cy="14" r="1.5" fill="#334155" />
            <circle cx="30" cy="14" r="1.5" fill="#334155" />
            <circle cx="44" cy="14" r="1.5" fill="#334155" />
            <circle cx="56" cy="14" r="1.5" fill="#334155" />
            <circle cx="70" cy="14" r="1.5" fill="#334155" />
          </g>

          {/* ===================== 6 STATION PINS & LABELS ===================== */}
          {STATIONS.map((stn) => {
            const isSelected = selectedId === stn.code;
            const isNDLS = stn.code === 'NDLS';

            return (
              <g
                key={stn.code}
                transform={`translate(${stn.x}, 0)`}
                className="cursor-pointer group"
                onClick={() => handleStationClick(stn)}
              >
                {/* Pointer Line Dropping to Track */}
                <line x1="0" y1="78" x2="0" y2="108" stroke={isSelected ? '#7B1113' : '#0f172a'} strokeWidth="1.5" strokeDasharray="2,2" />
                <circle cx="0" cy="108" r="3" fill={isSelected ? '#7B1113' : '#0f172a'} />

                {/* Floating Station Badge Pill */}
                <g transform="translate(0, 56)">
                  <rect
                    x="-26"
                    y="-16"
                    width="52"
                    height="28"
                    rx="6"
                    fill={isSelected ? '#7B1113' : '#ffffff'}
                    stroke={isSelected ? '#d97706' : '#0f172a'}
                    strokeWidth="1.5"
                    className="shadow-md transition-all group-hover:scale-110"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                  />
                  {/* Station Code */}
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#0f172a'}
                    fontSize="9.5"
                    fontFamily='"Press Start 2P", monospace'
                    fontWeight="bold"
                  >
                    {stn.code}
                  </text>
                  {/* Distance (km) */}
                  <text
                    x="0"
                    y="7"
                    textAnchor="middle"
                    fill={isNDLS ? '#bae6fd' : '#64748b'}
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {stn.km} km
                  </text>
                </g>

                {/* Station Ground Label Below Lower Track */}
                <text
                  x="0"
                  y="204"
                  textAnchor="middle"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  paintOrder="stroke"
                  fontSize="11"
                  fontFamily='"Space Mono", monospace'
                  fontWeight="bold"
                  className="tracking-wider select-none"
                >
                  {stn.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Train Hover Tooltip */}
        {hoveredTrain && (
          <div
            style={{
              left: `${(hoveredTrain.x / 1376) * 100}%`,
              top: `${(hoveredTrain.y / 340) * 100}%`,
              transform: 'translate(-50%, -130%)',
            }}
            className="absolute z-40 pointer-events-none bg-slate-900/95 text-white p-2 rounded-lg border border-slate-700 shadow-xl font-mono text-[10px] whitespace-nowrap"
          >
            <div className="flex items-center gap-1.5 text-yellow-400 font-pixel text-[8px]">
              <span>🚂</span>
              <span>{hoveredTrain.number} • {hoveredTrain.name}</span>
            </div>
            <div className="text-slate-300 mt-0.5">Speed: <strong className="text-emerald-400">{hoveredTrain.speed}</strong></div>
            <div className="text-slate-400 text-[9px]">{hoveredTrain.location}</div>
          </div>
        )}

        {/* Layer C: Floating Bottom Legend & Controls */}
        <div className="absolute bottom-2.5 left-3 right-3 z-30 flex flex-wrap items-center justify-between pointer-events-none gap-2">
          {/* Floating Dark Glassmorphic Legend */}
          <div className="pointer-events-auto flex items-center flex-wrap gap-3 bg-slate-900/90 text-white backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-700/80 text-[10px] font-mono shadow-md">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-xs bg-blue-600 inline-block" />
              <span>Down Line (NDLS→AGC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-xs bg-indigo-500 inline-block" />
              <span>Up Line (AGC→NDLS)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-xs border border-amber-500 hazard-stripes-light inline-block" />
              <span>Active Possession</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" />
              <span>Signal Green</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Signal Amber</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              <span>Signal Red</span>
            </div>
          </div>

          {/* Floating Right Map Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Satellite View Toggle */}
            <button
              onClick={() => setViewMode((m) => (m === 'scenic' ? 'satellite' : 'scenic'))}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 font-mono text-[10px] flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span>🌐</span>
              <span className="capitalize">{viewMode} View</span>
              <span className="text-[8px]">▾</span>
            </button>

            {/* Scale Bar + Compass */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white border border-slate-700/80 font-mono text-[9px] shadow-md">
              <div className="w-10 h-1 border-b-2 border-l-2 border-r-2 border-white" />
              <span>24 km</span>
              <span className="text-amber-400 font-pixel text-[8px] pl-1 border-l border-slate-700">N ▲</span>
            </div>

            {/* Zoom Buttons */}
            <div className="flex items-center bg-slate-900/90 rounded-lg border border-slate-700/80 overflow-hidden shadow-md">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="px-2 py-0.5 text-white hover:bg-slate-800 font-bold text-xs"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.1))}
                className="px-2 py-0.5 text-white hover:bg-slate-800 font-bold text-xs border-l border-slate-700"
                title="Zoom Out"
              >
                -
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Slide-Out Telemetry Drawer */}
      <AnimatePresence>
        {inspectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#7B1113] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {inspectedItem.type === 'station' ? '🏛️' : '🛤️'}
              </div>
              <div>
                <h4 className="font-pixel text-[10px] text-slate-900 dark:text-slate-100">
                  {inspectedItem.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{inspectedItem.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              {inspectedItem.metrics.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-pixel">{m.label}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setInspectedItem(null)}
              className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono uppercase"
            >
              Close [X]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
