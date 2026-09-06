import React, { useState, useEffect } from 'react';
import { PulsingSignalPip } from '../ui/PulsingSignalPip';
import { motion } from 'framer-motion';

interface ControlRoomHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  scenario: 'congested' | 'demo';
  onToggleScenario: (s: 'congested' | 'demo') => void;
  isSolving: boolean;
}

export const ControlRoomHeader: React.FC<ControlRoomHeaderProps> = ({
  activeTab,
  onSelectTab,
  scenario,
  onToggleScenario,
  isSolving,
}) => {
  const [istTime, setIstTime] = useState<string>('12:35:39');
  const [istDate, setIstDate] = useState<string>('Wed, 06 Sep 2026');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      const dateStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(now);

      setIstTime(timeStr);
      setIstDate(dateStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navTabs = [
    { id: 'overview', label: 'OVERVIEW', icon: '🎛️' },
    { id: 'network', label: 'NETWORK', icon: '🗺️' },
    { id: 'blocks', label: 'BLOCK DEMANDS', icon: '📋' },
    { id: 'optimize', label: 'SOLVER', icon: '⚡' },
    { id: 'timeline', label: 'TIMELINE', icon: '🕒' },
    { id: 'compare', label: 'BENCHMARK', icon: '📊' },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:px-4 shadow-sm mb-4 select-none">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Indian Railways Crest & Wordmark */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            {/* Indian Railways Circular Emblem */}
            <div className="w-9 h-9 rounded-xl bg-[#7B1113] border border-[#d97706]/40 flex items-center justify-center shadow-sm">
              <span className="text-white text-base">🚂</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-pixel text-[11px] text-slate-900 tracking-wider">
                  INDIAN RAILWAYS
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-pixel text-[6.5px]">
                  CENTRAL OCC
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-500 tracking-tight">
                AI Automated Maintenance Block Planning System • Delhi-Agra
              </p>
            </div>
          </div>

          {/* Quick Scenario Badge on Mobile */}
          <div className="md:hidden">
            <PulsingSignalPip aspect={isSolving ? 'amber' : 'green'} size="sm" />
          </div>
        </div>

        {/* Center: Modern 21st.dev Nav Tabs Pill Strip */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-pixel text-[7.5px] transition-all shrink-0 ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTabPill"
                    className="absolute inset-0 bg-blue-600 rounded-lg -z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 text-xs">{tab.icon}</span>
                <span className="relative z-10 uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Real-Time Digital Clock & Telemetry Badges */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Active Line Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700">
            <PulsingSignalPip aspect={isSolving ? 'amber' : 'green'} size="sm" />
            <span className="text-[11px] font-medium">
              {isSolving ? 'OPTIMIZING...' : 'NORMAL WORKING'}
            </span>
          </div>

          {/* Clock */}
          <div className="flex flex-col items-end pl-2 border-l border-slate-200 font-mono">
            <div className="flex items-center gap-1 text-slate-900 font-bold font-digital text-lg leading-tight tracking-wider">
              <span>{istTime}</span>
              <span className="text-[9px] font-pixel text-blue-700">IST</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono leading-tight">
              {istDate}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
