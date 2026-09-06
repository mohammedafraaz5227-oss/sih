import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PixelStation, PixelSignal } from '../PixelIcons';

export interface StationNodeData {
  id: string;
  code: string;
  name: string;
  km: number;
  platforms: number;
  division: string;
  zone: string;
  activeTrainsCount: number;
  activeBlocksCount: number;
  isSelected?: boolean;
}

export const StationNode: React.FC<NodeProps<StationNodeData>> = memo(({ data, selected }) => {
  const isTerminus = data.code === 'NDLS' || data.code === 'AGC';
  const isJunction = data.code === 'GZB' || data.code === 'ALG' || data.code === 'TDK' || data.code === 'MTJ';

  return (
    <div
      className={`relative min-w-[180px] p-3 transition-all duration-150 cursor-pointer ${
        selected || data.isSelected
          ? 'bg-[#0f2347] border-2 border-electric-cyan shadow-glow-cyan'
          : 'bg-[#0a1324] border-2 border-[#1e293b] hover:border-slate-500 shadow-pixel'
      }`}
      style={{
        clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))',
      }}
    >
      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-electric-cyan !border-2 !border-black !rounded-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-electric-cyan !border-2 !border-black !rounded-none"
      />

      {/* Top Header: Signal + Station Code */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-black border border-slate-700">
            <PixelStation size={16} color="#38bdf8" />
          </div>
          <div>
            <div className="font-pixel text-sm text-yellow-400 tracking-wider">
              {data.code}
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-tight">
              KM {data.km.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Signal Aspect Lamp */}
        <div className="flex flex-col items-center">
          <PixelSignal aspect={data.activeBlocksCount > 0 ? 'amber' : 'green'} size={18} />
          <span className="text-[8px] font-pixel text-slate-400 mt-0.5">
            {data.activeBlocksCount > 0 ? 'CAUTION' : 'CLEAR'}
          </span>
        </div>
      </div>

      {/* Station Full Name */}
      <div className="font-mono text-xs font-bold text-slate-200 truncate mb-2">
        {data.name}
      </div>

      {/* Telemetry Badges */}
      <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
        <div className="bg-[#060a12] border border-slate-800 px-1.5 py-1 flex items-center justify-between">
          <span className="text-slate-400">PFs:</span>
          <span className="text-cyan-300 font-bold font-pixel text-[8px]">{data.platforms}</span>
        </div>

        <div className="bg-[#060a12] border border-slate-800 px-1.5 py-1 flex items-center justify-between">
          <span className="text-slate-400">Trains:</span>
          <span className="text-emerald-400 font-bold font-pixel text-[8px]">{data.activeTrainsCount}</span>
        </div>
      </div>

      {/* Type Badge Footer */}
      <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[8px] font-pixel text-slate-400">
        <span className={isTerminus ? 'text-amber-400' : isJunction ? 'text-purple-400' : 'text-slate-400'}>
          {isTerminus ? 'TERMINUS' : 'JUNCTION'}
        </span>
        <span className="text-slate-500 uppercase">{data.zone}</span>
      </div>
    </div>
  );
});

StationNode.displayName = 'StationNode';
