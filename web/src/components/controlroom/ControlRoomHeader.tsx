import React, { useState, useEffect } from 'react';
import { PulsingSignalPip } from '../ui/PulsingSignalPip';
import { motion } from 'framer-motion';

interface ControlRoomHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  scenario: 'congested' | 'demo';
  onToggleScenario: (s: 'congested' | 'demo') => void;
  isSolving: boolean;
  theme: 'light' | 'dark';
  onSetTheme: (theme: 'light' | 'dark') => void;
}

export const ControlRoomHeader: React.FC<ControlRoomHeaderProps> = ({
  activeTab,
  onSelectTab,
  scenario,
  onToggleScenario,
  isSolving,
  theme,
  onSetTheme,
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
    { id: 'compare', label: 'REPORTS', icon: '📊' },
  ];

  return (
    <header className="w-full bg-white/95 dark:bg-[#0a101d]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2.5 sm:px-4 shadow-sm mb-4 select-none transition-colors duration-200">
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
                <h1 className="font-pixel text-[11px] text-slate-900 dark:text-slate-100 tracking-wider">
                  INDIAN RAILWAYS
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-pixel text-[6.5px]">
                  CENTRAL OCC
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 tracking-tight">
                AI Automated Maintenance Block Planning System • Delhi-Agra
              </p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <div
              className="flex items-center bg-slate-200/90 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300 dark:border-slate-800 cursor-pointer"
              onClick={() => onSetTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetTheme('light');
                }}
                className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white shadow-xs text-blue-700 font-bold border border-slate-200'
                    : 'opacity-40 hover:opacity-100 text-slate-500'
                }`}
                title="Light Mode"
              >
                ☀️
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetTheme('dark');
                }}
                className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 shadow-xs text-yellow-400 font-bold border border-slate-700'
                    : 'opacity-40 hover:opacity-100 text-slate-500'
                }`}
                title="Dark Mode"
              >
                🌙
              </button>
            </div>
            <PulsingSignalPip aspect={isSolving ? 'amber' : 'green'} size="sm" />
          </div>
        </div>

        {/* Center: Modern 21st.dev Nav Tabs Pill Strip */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-pixel text-[7.5px] transition-all shrink-0 ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
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
        <div className="hidden md:flex items-center gap-3">
          {/* Segmented Dual-Pill Theme Toggle */}
          <div
            className="flex items-center bg-slate-200/90 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xs cursor-pointer"
            onClick={() => onSetTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetTheme('light');
              }}
              className={`px-2.5 py-1 rounded-lg font-pixel text-[7.5px] flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Switch to Light Mode"
            >
              <span>☀️</span>
              <span>LIGHT</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetTheme('dark');
              }}
              className={`px-2.5 py-1 rounded-lg font-pixel text-[7.5px] flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 text-yellow-400 font-bold shadow-xs border border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Switch to Dark Mode"
            >
              <span>🌙</span>
              <span>DARK</span>
            </button>
          </div>

          {/* System Status Pill (Matching Reference) */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_#10b981] animate-pulse" />
            <div className="flex flex-col">
              <span className="font-pixel text-[8px] text-slate-900 dark:text-slate-100 uppercase tracking-wider font-bold">
                SYSTEM NORMAL
              </span>
              <span className="text-[9px] text-slate-400 font-mono leading-none">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Clock */}
          <div className="flex flex-col items-end pl-2 border-l border-slate-200 dark:border-slate-800 font-mono">
            <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-bold font-digital text-lg leading-tight tracking-wider">
              <span>{istTime}</span>
              <span className="text-[9px] font-pixel text-blue-700 dark:text-blue-400">IST</span>
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
