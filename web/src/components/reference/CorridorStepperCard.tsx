import React from 'react';
import { Station } from '../../types';

interface CorridorStepperCardProps {
  stations: Station[];
  selectedId: string;
  onSelectStation: (id: string) => void;
}

export const CorridorStepperCard: React.FC<CorridorStepperCardProps> = ({
  stations,
  selectedId,
  onSelectStation,
}) => {
  // 6 Stations with exact chainage markers as shown in reference
  const corridorList = [
    { code: 'NDLS', km: 0, color: 'bg-cyan-500 ring-cyan-200' },
    { code: 'GZB', km: 30, color: 'bg-amber-500 ring-amber-200' },
    { code: 'ALG', km: 90, color: 'bg-blue-600 ring-blue-200' },
    { code: 'TDK', km: 140, color: 'bg-blue-600 ring-blue-200' },
    { code: 'MTJ', km: 200, color: 'bg-blue-600 ring-blue-200' },
    { code: 'AGC', km: 265, color: 'bg-blue-600 ring-blue-200' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 tracking-wider uppercase mb-3">
        <span className="w-1.5 h-3 bg-blue-600 rounded-full"></span>
        <span>CORRIDOR</span>
      </div>

      <div className="relative pl-2 py-1 flex-1 flex flex-col justify-between">
        {/* Continuous Vertical Connecting Line */}
        <div className="absolute left-[13px] top-2 bottom-3 w-[3px] bg-slate-200"></div>

        {corridorList.map((stn) => {
          const isSelected = selectedId === stn.code || selectedId.includes(stn.code);
          return (
            <div
              key={stn.code}
              onClick={() => onSelectStation(stn.code)}
              className={`relative flex items-center space-x-3 cursor-pointer group py-1.5 transition-all ${
                isSelected ? 'scale-105' : 'hover:translate-x-0.5'
              }`}
            >
              {/* Stepper Node Dot */}
              <div
                className={`w-3.5 h-3.5 rounded-full z-10 ring-4 transition-all ${stn.color} ${
                  isSelected ? 'ring-blue-400 scale-125' : 'group-hover:ring-blue-300'
                }`}
              />

              {/* Station Code & Distance */}
              <div className="leading-tight">
                <div
                  className={`text-xs font-black tracking-wide ${
                    isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-800 group-hover:text-blue-600'
                  }`}
                >
                  {stn.code}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {stn.km} km
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
