import React, { useState, useEffect } from 'react';
import { PixelTrain, PixelSignal, PixelCpu } from './PixelIcons';
import { isFirebaseConfigured } from '../services/firebase';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  scenario: 'congested' | 'demo';
  onToggleScenario: (s: 'congested' | 'demo') => void;
  isSolving: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  scenario,
  onToggleScenario,
  isSolving,
}) => {
  // Live IST Digital Clock (User Correction #3: Actual current time converted to IST)
  const [istTime, setIstTime] = useState<string>('');
  const [istDate, setIstDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Indian Standard Time (Asia/Kolkata)
      const timeStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      const dateStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(now);

      setIstTime(timeStr);
      setIstDate(dateStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'network', label: 'CORRIDOR MAP' },
    { id: 'blocks', label: 'BLOCK REQUESTS' },
    { id: 'optimize', label: 'OPTIMIZER' },
    { id: 'timeline', label: '24H TIMELINE' },
    { id: 'compare', label: 'BENCHMARK' },
  ];

  return (
    <header className="border-b-4 border-black bg-[#111827] shadow-[0_4px_0_0_#000]">
      {/* Top Ticker / Disclaimer Banner */}
      <div className="bg-[#7B1113] text-white px-4 py-1 flex items-center justify-between border-b-2 border-black text-[11px] font-mono tracking-wider">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-yellow-400 animate-ping"></span>
          <span className="font-pixel text-[9px] text-yellow-300">SYSTEM STATUS: ACTIVE</span>
          <span className="text-zinc-300">|</span>
          <span className="text-amber-200">CORRIDOR: DELHI - AGRA CANTT (265 KM)</span>
        </div>
        <div className="flex items-center space-x-2 bg-black/40 px-2 py-0.5 border border-yellow-500/40">
          <span className="font-pixel text-[8px] text-yellow-400 uppercase tracking-widest">
            DEMO DATA — NOT REAL INDIAN RAILWAYS DATA
          </span>
        </div>
      </div>

      {/* Main Control Panel Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-[#7B1113] border-2 border-black shadow-pixel flex items-center justify-center p-1">
            <PixelTrain size={30} color="#facc15" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-pixel text-sm md:text-base text-yellow-400 tracking-wider">
                AI-POWERED RAILWAY BLOCK PLANNING
              </h1>
              <span className="px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-700 text-[9px] font-pixel">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide">
              Centralized Maintenance Possession & Conflict Resolution System • CP-SAT Engine
            </p>
          </div>
        </div>

        {/* Right: Live IST Digital Clock & System Status */}
        <div className="flex items-center space-x-3">
          {/* Live IST Digital Clock */}
          <div className="bg-black border-2 border-[#334155] shadow-pixel px-3 py-1 text-right">
            <div className="text-[9px] font-pixel text-cyan-400 uppercase flex items-center justify-end space-x-1">
              <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
              <span>IST (UTC+05:30)</span>
            </div>
            <div className="font-digital text-2xl md:text-3xl text-green-400 tracking-widest leading-none">
              {istTime || '--:--:--'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {istDate || '--- --, ----'}
            </div>
          </div>

          {/* Engine Status Lamp */}
          <div className="bg-black border-2 border-[#334155] shadow-pixel px-3 py-2 flex items-center space-x-2">
            <PixelSignal aspect={isSolving ? 'amber' : 'green'} size={24} />
            <div>
              <div className="text-[8px] font-pixel text-slate-400">ENGINE</div>
              <div className={`text-[10px] font-pixel ${isSolving ? 'text-yellow-400 animate-pulse' : 'text-green-400'}`}>
                {isSolving ? 'SOLVING...' : 'OPTIMAL'}
              </div>
            </div>
          </div>

          {/* Database Mode */}
          <div className="bg-black border-2 border-[#334155] shadow-pixel px-2.5 py-2 hidden md:block">
            <div className="text-[8px] font-pixel text-slate-400">STORAGE</div>
            <div className="text-[10px] font-pixel text-cyan-400">
              {isFirebaseConfigured ? 'FIRESTORE' : 'LOCAL STORE'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar & Scenario Selector */}
      <div className="bg-[#090d16] border-t-2 border-black px-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex space-x-1 py-1.5 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-[10px] md:text-[11px] font-pixel transition-all ${
                  isActive
                    ? 'bg-[#7B1113] text-yellow-300 border-2 border-black shadow-pixel-sm translate-y-[-1px]'
                    : 'bg-[#1e293b] text-slate-300 border-2 border-transparent hover:border-black hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Scenario Switcher */}
        <div className="flex items-center space-x-2 py-1">
          <span className="text-[10px] font-pixel text-slate-400 uppercase hidden sm:inline">SCENARIO:</span>
          <div className="inline-flex border-2 border-black shadow-pixel-sm bg-black">
            <button
              onClick={() => onToggleScenario('congested')}
              className={`px-2.5 py-1 text-[9px] font-pixel ${
                scenario === 'congested'
                  ? 'bg-amber-600 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              CONGESTED (11T / 10B)
            </button>
            <button
              onClick={() => onToggleScenario('demo')}
              className={`px-2.5 py-1 text-[9px] font-pixel ${
                scenario === 'demo'
                  ? 'bg-[#7B1113] text-yellow-300 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              STANDARD (8T / 8B)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
