import React from 'react';
import { BentoCard } from '../ui/BentoGrid';
import { PulsingSignalPip } from '../ui/PulsingSignalPip';

interface LiveDispatchTickerProps {
  scenario: 'congested' | 'demo';
}

export const LiveDispatchTicker: React.FC<LiveDispatchTickerProps> = ({ scenario }) => {
  const dispatchEvents = [
    { time: '14:47', dotColor: 'bg-blue-500', tag: 'TRN_12031', text: '12031 Rajdhani passed ALG' },
    { time: '14:45', dotColor: 'bg-amber-500', tag: 'SEC_ALG_TDK', text: 'Possession window activated' },
    { time: '14:42', dotColor: 'bg-emerald-500', tag: 'TRN_12002', text: '12002 Shatabdi arrived MTJ' },
    { time: '14:40', dotColor: 'bg-blue-500', tag: 'SEC_TDK_MTJ', text: 'Track circuit TC-44 normal' },
    { time: '14:38', dotColor: 'bg-amber-500', tag: 'SEC_ALG_TDK', text: 'Maintenance crew at site' },
  ];

  return (
    <BentoCard
      name="LIVE DISPATCH ACTIVITY"
      icon={<span className="text-sm">📡</span>}
      badge={
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-pixel text-[7px] uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          REAL-TIME
        </span>
      }
      glowColor="blue"
      className="h-full"
    >
      <div className="space-y-2 flex-1 flex flex-col justify-between py-1">
        {dispatchEvents.map((evt, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all font-mono text-xs border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full ${evt.dotColor} shrink-0`} />
              <span className="font-digital text-sm text-slate-500 dark:text-slate-400 shrink-0">
                {evt.time}
              </span>
              <span className="text-slate-800 dark:text-slate-200 text-[11px] font-medium truncate">
                {evt.text}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] shrink-0 border border-slate-200/60 dark:border-slate-700">
              {evt.tag}
            </span>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
          <button className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-mono font-bold flex items-center gap-1">
            <span>View All Activity</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </BentoCard>
  );
};
