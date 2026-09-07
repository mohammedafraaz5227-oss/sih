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
          ? 'bg-[#1c1c1f] border-2 border-amber-500 shadow-sm'
          : 'bg-[#121214] border-2 border-[#27272a] hover:border-zinc-500 shadow-pixel'
      }`}
      style={{
        clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))',
      }}
    >
      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-black !rounded-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-black !rounded-none"
      />

      {/* Top Header: Signal + Station Code */}
      <div className="flex items-center justify-between gap-2 border-b border-[#27272a] pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-zinc-900 border border-[#27272a]">
            <PixelStation size={16} color="#d97706" />
          </div>
          <div>
            <div className="font-pixel text-sm text-yellow-400 tracking-wider">
              {data.code}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono leading-tight">
              KM {data.km.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Signal Aspect Lamp */}
        <div className="flex flex-col items-center">
          <PixelSignal aspect={data.activeBlocksCount > 0 ? 'amber' : 'green'} size={18} />
          <span className="text-[8px] font-pixel text-zinc-400 mt-0.5">
            {data.activeBlocksCount > 0 ? 'CAUTION' : 'CLEAR'}
          </span>
        </div>
      </div>

      {/* Station Full Name */}
      <div className="font-mono text-xs font-bold text-zinc-200 truncate mb-2">
        {data.name}
      </div>

      {/* Telemetry Badges */}
      <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
        <div className="bg-[#18181b] border border-[#27272a] px-1.5 py-1 flex items-center justify-between">
          <span className="text-zinc-400">PFs:</span>
          <span className="text-amber-300 font-bold font-pixel text-[8px]">{data.platforms}</span>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] px-1.5 py-1 flex items-center justify-between">
          <span className="text-zinc-400">Trains:</span>
          <span className="text-emerald-400 font-bold font-pixel text-[8px]">{data.activeTrainsCount}</span>
        </div>
      </div>

      {/* Type Badge Footer */}
      <div className="mt-2 pt-1 border-t border-[#27272a]/60 flex items-center justify-between text-[8px] font-pixel text-zinc-400">
        <span className={isTerminus ? 'text-amber-400' : isJunction ? 'text-amber-300' : 'text-zinc-400'}>
          {isTerminus ? 'TERMINUS' : 'JUNCTION'}
        </span>
        <span className="text-zinc-500 uppercase">{data.zone}</span>
      </div>
    </div>
  );
});

StationNode.displayName = 'StationNode';
