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
  onToggleTheme: () => void;
  onOpenCopilot?: () => void;
}

export const ControlRoomHeader: React.FC<ControlRoomHeaderProps> = ({
  activeTab,
  onSelectTab,
  scenario,
  onToggleScenario,
  isSolving,
  theme,
  onToggleTheme,
  onOpenCopilot,
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
    <header className="w-full bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border border-slate-200/90 dark:border-[#27272a] rounded-2xl p-2.5 sm:px-4 shadow-sm mb-4 select-none transition-colors duration-200">
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
                <h1 className="font-pixel text-[11px] text-slate-900 dark:text-[#f4f4f5] tracking-wider">
                  INDIAN RAILWAYS
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 font-pixel text-[6.5px]">
                  CENTRAL OCC
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 tracking-tight">
                AI Automated Maintenance Block Planning System • Delhi-Agra
              </p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="px-2 py-1 rounded-lg bg-zinc-900 text-amber-300 border border-amber-500/30 font-pixel text-[7px] flex items-center gap-1 shadow-xs"
              >
                <span>✨</span>
                <span>AI</span>
              </button>
            )}
            <button
              type="button"
              data-testid="theme-toggle-mobile"
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <PulsingSignalPip aspect={isSolving ? 'amber' : 'green'} size="sm" />
          </div>
        </div>

        {/* Center: Modern 21st.dev Nav Tabs Pill Strip */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto max-w-full">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-pixel text-[7.5px] transition-all shrink-0 ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTabPill"
                    className="absolute inset-0 bg-[#7B1113] rounded-lg -z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 text-xs">{tab.icon}</span>
                <span className="relative z-10 uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* AI Co-Pilot Launch Button (Neutral Tech Obsidian & Amber, Zero Purple/Blue) */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-pixel text-[8px] tracking-wider shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 border border-amber-500/40"
            title="Open AI Dispatcher Co-Pilot (NLP Requisitions, Form T/409, XAI)"
          >
            <span className="text-xs text-amber-400">✨</span>
            <span>AI CO-PILOT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        )}

        {/* Right: Dark Mode Toggle, Status & Digital Clock */}
        <div className="hidden md:flex items-center gap-3">
          {/* Robust Dark Mode Toggle (Neutral Zinc) */}
          <button
            type="button"
            data-testid="theme-toggle-desktop"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-pixel text-[7.5px] hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="text-xs">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="uppercase tracking-wider font-bold">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
          </button>

          {/* System Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_#10b981] animate-pulse" />
            <div className="flex flex-col">
              <span className="font-pixel text-[8px] text-slate-900 dark:text-[#f4f4f5] uppercase tracking-wider font-bold">
                SYSTEM NORMAL
              </span>
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono leading-none">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Clock */}
          <div className="flex flex-col items-end pl-2 border-l border-slate-200 dark:border-zinc-800 font-mono">
            <div className="flex items-center gap-1 text-slate-900 dark:text-[#f4f4f5] font-bold font-digital text-lg leading-tight tracking-wider">
              <span>{istTime}</span>
              <span className="text-[9px] font-pixel text-slate-500 dark:text-zinc-400">IST</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono leading-tight">
              {istDate}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
