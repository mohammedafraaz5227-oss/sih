import React, { useState, useEffect } from 'react';

interface HeaderReferenceProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  scenario: 'congested' | 'demo';
  onToggleScenario: (s: 'congested' | 'demo') => void;
  isSolving: boolean;
}

export const HeaderReference: React.FC<HeaderReferenceProps> = ({
  activeTab,
  onSelectTab,
  scenario,
  onToggleScenario,
  isSolving,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('12:35:39');
  const [currentDate, setCurrentDate] = useState<string>('Wed, 06 Sep 2026');

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

      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: '🏛️' },
    { id: 'blocks', label: 'Block Requests', icon: '📋' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'optimize', label: 'Solver', icon: '⚡' },
    { id: 'compare', label: 'Benchmark', icon: '📊' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-sm px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 mb-4">
      {/* 1. Left: Indian Railways Crest & Wordmark */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <img
            src="/ir-logo.png"
            alt="Indian Railways Crest"
            className="w-9 h-9 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="leading-tight select-none">
          <div className="font-pixel text-[8px] tracking-wider text-[#0284c7] uppercase">
            INDIAN
          </div>
          <div className="font-pixel text-[9px] tracking-widest text-[#0f172a] uppercase mt-0.5">
            RAILWAYS
          </div>
        </div>
      </div>

      {/* 2. Center: Navigation Pill Tabs */}
      <nav className="flex items-center space-x-1.5 overflow-x-auto py-1">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all duration-150 ${
                isActive
                  ? 'bg-[#e0f2fe] text-[#0284c7] border border-[#38bdf8] shadow-xs font-pixel text-[8px]'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent font-pixel text-[8px]'
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Weather, Live Digital Clock & User Tools */}
      <div className="flex items-center space-x-3">
        {/* Weather Icon */}
        <div className="text-xl" title="Delhi-Agra Corridor: Clear Sky 32°C">
          ☀️
        </div>

        {/* Digital Clock & Date */}
        <div className="text-right border-l border-slate-200 pl-3">
          <div className="font-digital text-lg font-bold text-slate-900 tracking-widest leading-none">
            {currentTime}
          </div>
          <div className="font-mono text-[10px] text-slate-500 mt-0.5">
            {currentDate} • <strong className="text-blue-600 font-pixel text-[8px]">IST</strong>
          </div>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative cursor-pointer p-1.5 rounded-full hover:bg-slate-100 text-slate-600">
          <span className="text-base">🔔</span>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            1
          </span>
        </div>

        {/* Settings */}
        <button
          onClick={() => onToggleScenario(scenario === 'congested' ? 'demo' : 'congested')}
          title={`Switch Corridor Scenario (Current: ${scenario.toUpperCase()})`}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <span className="text-base">⚙️</span>
        </button>

        {/* User Profile */}
        <div
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer hover:border-blue-500 transition-colors"
          title="Chief Operations Manager (Control Desk)"
        >
          <span className="text-sm">👤</span>
        </div>
      </div>
    </header>
  );
};
