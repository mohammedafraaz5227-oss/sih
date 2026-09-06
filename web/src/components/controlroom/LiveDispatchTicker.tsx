import React from 'react';
import { BentoCard } from '../ui/BentoGrid';
import { PulsingSignalPip } from '../ui/PulsingSignalPip';

interface LiveDispatchTickerProps {
  scenario: 'congested' | 'demo';
}

export const LiveDispatchTicker: React.FC<LiveDispatchTickerProps> = ({ scenario }) => {
  const dispatchEvents = [
    { time: '12:35', aspect: 'green' as const, section: 'SEC_NDLS_GZB', text: '12002 Shatabdi Line Clear granted' },
    { time: '12:32', aspect: 'amber' as const, section: 'SEC_TDK_MTJ', text: 'Possession window BR_REQ_001 active' },
    { time: '12:28', aspect: 'green' as const, section: 'SEC_GZB_ALG', text: 'Track circuit TC-44 validated normal' },
    { time: '12:25', aspect: 'green' as const, section: 'SEC_MTJ_AGC', text: '12301 Rajdhani on time (+0m)' },
    { time: '12:20', aspect: 'green' as const, section: 'CENTRAL_CTC', text: 'CP-SAT integer schedule synced to interlocking' },
  ];

  return (
    <BentoCard
      name="LIVE DISPATCH ACTIVITY"
      icon={<span className="text-sm">📡</span>}
      badge={
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-pixel text-[7px] uppercase">
          TELEMETRY
        </span>
      }
      glowColor="blue"
      className="h-full"
    >
      <div className="space-y-2.5 flex-1 flex flex-col justify-between py-1">
        {dispatchEvents.map((evt, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all font-mono text-xs border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
          >
            <div className="flex items-center gap-2 min-w-0">
              <PulsingSignalPip aspect={evt.aspect} size="sm" pulse={idx === 0} />
              <span className="font-digital text-sm text-slate-500 dark:text-slate-400 shrink-0">
                {evt.time}
              </span>
              <span className="text-slate-800 dark:text-slate-200 text-[11px] font-medium truncate">
                {evt.text}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] shrink-0">
              {evt.section}
            </span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
};
