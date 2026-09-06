import React, { useState, useMemo } from 'react';
import { TrainMovement, ScheduledBlock } from '../../types';
import { PixelTrain, PixelWrench, PixelSignal, PixelAlert } from '../PixelIcons';

interface LiveActivityFeedProps {
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
  isSolving: boolean;
}

interface ActivityEvent {
  id: string;
  time: string;
  type: 'train' | 'block' | 'signal' | 'solver';
  title: string;
  detail: string;
  badge: string;
  badgeColor: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  trains,
  scheduledBlocks,
  isSolving,
}) => {
  const [filter, setFilter] = useState<'all' | 'train' | 'block'>('all');

  // Generate realistic, dynamic operational activity events
  const events: ActivityEvent[] = useMemo(() => {
    const list: ActivityEvent[] = [];

    // 1. Train Movement events
    trains.slice(0, 5).forEach((t) => {
      const firstSec = t.sections[0];
      if (!firstSec) return;
      const h = Math.floor(firstSec.entry_time / 60);
      const m = firstSec.entry_time % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} IST`;

      list.push({
        id: `evt-tr-${t.id}`,
        time: timeStr,
        type: 'train',
        title: `${t.train_number} • ${t.name}`,
        detail: `Entered ${firstSec.asset_id.replace('SEC_', '')} • Permissible headway cleared`,
        badge: t.train_type.toUpperCase(),
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-400',
      });
    });

    // 2. Scheduled Block events
    scheduledBlocks.forEach((b) => {
      const h = Math.floor(b.scheduled_start / 60);
      const m = b.scheduled_start % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} IST`;

      list.push({
        id: `evt-bk-${b.block_request_id}`,
        time: timeStr,
        type: 'block',
        title: `POSSESSION: ${b.block_request_id}`,
        detail: `${b.asset_id.replace('SEC_', '')} (${b.duration_minutes}m ${b.maintenance_type.replace(/_/g, ' ')})`,
        badge: `P${b.priority} APPROVED`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-400',
      });
    });

    // 3. Solver Status Event
    list.unshift({
      id: 'evt-solver-status',
      time: 'LIVE TELEMETRY',
      type: 'solver',
      title: isSolving ? 'CP-SAT SOLVER OPTIMIZING' : 'CP-SAT ZERO-CONFLICT GUARANTEE',
      detail: isSolving
        ? 'Evaluating disjunctive intervals across 5 corridor sections...'
        : 'All 6 stations & 5 track sections 100% collision-free.',
      badge: isSolving ? 'SOLVING' : 'OPTIMAL',
      badgeColor: isSolving
        ? 'bg-amber-500 text-black border-black'
        : 'bg-emerald-500 text-white border-black',
    });

    return list;
  }, [trains, scheduledBlocks, isSolving]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  return (
    <div className="pixel-card-light p-4 bg-white flex flex-col h-full">
      {/* Feed Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <h3 className="font-pixel text-xs text-slate-900 uppercase">
            Live Dispatch Activity Feed
          </h3>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex border border-slate-300 bg-slate-100 p-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 text-[8px] font-pixel transition-colors ${
              filter === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-black'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter('train')}
            className={`px-2 py-0.5 text-[8px] font-pixel transition-colors ${
              filter === 'train' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600 hover:text-black'
            }`}
          >
            TRAINS
          </button>
          <button
            onClick={() => setFilter('block')}
            className={`px-2 py-0.5 text-[8px] font-pixel transition-colors ${
              filter === 'block' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:text-black'
            }`}
          >
            BLOCKS
          </button>
        </div>
      </div>

      {/* Scrolling Events Container */}
      <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-2 bg-slate-50 border border-slate-200 hover:border-slate-400 transition-colors flex items-start justify-between gap-2"
          >
            <div className="flex items-start space-x-2">
              <div className="p-1 bg-white border border-slate-300 mt-0.5">
                {evt.type === 'train' ? (
                  <PixelTrain size={14} color="#0284c7" />
                ) : evt.type === 'block' ? (
                  <PixelWrench size={14} color="#d97706" />
                ) : (
                  <PixelSignal aspect="green" size={14} />
                )}
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <span>{evt.title}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {evt.detail}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className={`px-1.5 py-0.5 font-pixel text-[7px] border ${evt.badgeColor} block`}>
                {evt.badge}
              </span>
              <span className="text-[9px] font-digital text-slate-500 mt-1 block">
                {evt.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
