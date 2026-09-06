import React, { memo } from 'react';
import { EdgeProps, getStraightPath, EdgeLabelRenderer } from 'reactflow';
import { PixelTrack, PixelAlert } from '../PixelIcons';

export interface TrackEdgeData {
  id: string;
  name: string;
  distanceKm: number;
  maxSpeedKmph: number;
  status: string;
  activeTrainsCount: number;
  scheduledBlocksCount: number;
  isSelected?: boolean;
  onSelect?: (trackId: string) => void;
}

export const TrackEdge: React.FC<EdgeProps<TrackEdgeData>> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const hasMaintenance = (data?.scheduledBlocksCount ?? 0) > 0;
  const hasTrains = (data?.activeTrainsCount ?? 0) > 0;
  const isSelected = selected || data?.isSelected;

  return (
    <>
      {/* 1. Ballast bed (wide dark stroke) */}
      <path
        d={edgePath}
        fill="none"
        stroke="#0b1322"
        strokeWidth={18}
        strokeLinecap="square"
      />

      {/* 2. Sleepers / Ties (dashed cross-stroke) */}
      <path
        d={edgePath}
        fill="none"
        stroke="#1e293b"
        strokeWidth={14}
        strokeDasharray="2, 6"
        strokeLinecap="square"
      />

      {/* 3. Outer Rail 1 (Top Rail) */}
      <path
        d={edgePath}
        fill="none"
        stroke={hasMaintenance ? '#ea580c' : isSelected ? '#00f0ff' : '#475569'}
        strokeWidth={2}
        transform="translate(0, -4)"
      />

      {/* 4. Outer Rail 2 (Bottom Rail) */}
      <path
        d={edgePath}
        fill="none"
        stroke={hasMaintenance ? '#ea580c' : isSelected ? '#00f0ff' : '#475569'}
        strokeWidth={2}
        transform="translate(0, 4)"
      />

      {/* 5. Center Signaling / Power Line or Hazard Glow */}
      {hasMaintenance ? (
        <path
          d={edgePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={3}
          strokeDasharray="8, 4"
          className="animate-pulse"
        />
      ) : hasTrains ? (
        <path
          d={edgePath}
          fill="none"
          stroke="#00f0ff"
          strokeWidth={2}
          strokeDasharray="6, 12"
          className="animate-[dash_1.5s_linear_infinite]"
        />
      ) : (
        <path
          d={edgePath}
          fill="none"
          stroke="#059669"
          strokeWidth={1}
          strokeDasharray="4, 8"
          opacity={0.6}
        />
      )}

      {/* 6. Interactive HTML Badge via EdgeLabelRenderer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onClick={(e) => {
            e.stopPropagation();
            data?.onSelect?.(data.id);
          }}
          className={`cursor-pointer transition-all duration-150 px-2.5 py-1.5 border ${
            isSelected
              ? 'bg-[#0f2347] border-electric-cyan shadow-glow-cyan text-electric-cyan scale-105'
              : hasMaintenance
              ? 'bg-[#2a1305] border-amber-600 text-amber-300 hover:border-amber-400'
              : 'bg-[#070d18] border-slate-700 text-slate-300 hover:border-cyan-500/60'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            {hasMaintenance ? (
              <PixelAlert size={12} color="#f59e0b" />
            ) : (
              <PixelTrack size={12} color={isSelected ? '#00f0ff' : '#64748b'} />
            )}
            <span className="font-pixel text-[9px] tracking-wide">
              {data?.distanceKm ?? 0} KM
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[8px] font-mono text-slate-400 mt-0.5">
            <span>{data?.maxSpeedKmph ?? 130} km/h</span>
            {hasMaintenance ? (
              <span className="font-pixel text-amber-400 text-[7px] px-1 bg-amber-950/80 border border-amber-800">
                BLOCKED
              </span>
            ) : hasTrains ? (
              <span className="font-pixel text-emerald-400 text-[7px] px-1 bg-emerald-950/80 border border-emerald-800">
                TRAIN
              </span>
            ) : (
              <span className="text-slate-500 text-[7px]">CLEAR</span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

TrackEdge.displayName = 'TrackEdge';
