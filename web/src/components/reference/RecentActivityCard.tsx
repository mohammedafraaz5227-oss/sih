import React from 'react';

interface RecentActivityCardProps {
  lastSolveTimestamp?: string;
  scenario: 'congested' | 'demo';
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = () => {
  const activities = [
    { time: '12:34', text: 'Optimization complete', dotColor: 'bg-amber-500' },
    { time: '12:31', text: 'Block scheduled (TDK-MTJ)', dotColor: 'bg-emerald-500' },
    { time: '12:28', text: 'Maintenance validated', dotColor: 'bg-amber-500' },
    { time: '12:26', text: 'No conflicts detected', dotColor: 'bg-yellow-400' },
    { time: '12:24', text: 'Crew allocation updated', dotColor: 'bg-blue-500' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 tracking-wider uppercase mb-3">
        <span className="text-slate-500">⚡</span>
        <span>RECENT ACTIVITY</span>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5 text-xs font-sans">
        {activities.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2.5 text-slate-700">
            {/* Colored Dot */}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dotColor}`}></span>

            {/* Timestamp */}
            <span className="font-mono text-slate-400 text-[11px] flex-shrink-0">
              {item.time}
            </span>

            {/* Activity Description */}
            <span className="text-slate-800 truncate text-xs font-medium">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
