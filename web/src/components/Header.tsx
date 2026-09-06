import React, { useState, useEffect } from 'react';
import { PixelTrain, PixelSignal, PixelCpu } from './PixelIcons';
import { isFirebaseConfigured } from '../services/firebase';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  scenario: 'congested' | 'demo';
  onToggleScenario: (s: 'congested' | 'demo') => void;
  isSolving: boolean;
  scanlines: boolean;
  onToggleScanlines: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  scenario,
  onToggleScenario,
  isSolving,
  scanlines,
  onToggleScanlines,
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
    { id: 'overview', label: 'OVERVIEW', icon: '📊' },
    { id: 'network', label: 'CORRIDOR MAP', icon: '🗺️' },
    { id: 'blocks', label: 'BLOCK REQUESTS', icon: '🔧' },
    { id: 'optimize', label: 'CP-SAT SOLVER', icon: '⚡' },
    { id: 'timeline', label: '24H TIMELINE', icon: '⏱️' },
    { id: 'compare', label: 'BENCHMARK', icon: '⚖️' },
  ];

  return (
    <header className="border-b-2 border-[#1e293b] bg-[#070d18] shadow-pixel relative z-30">
      {/* Top Ticker / Railway Operations Status Bar */}
      <div className="bg-[#5c0d11] text-white px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-black text-[11px] font-mono tracking-wider">
        <div className="flex items-center space-x-2.5">
          <span className="inline-block w-2 h-2 bg-emerald-400 rounded-none animate-ping"></span>
          <span className="font-pixel text-[9px] text-yellow-300">
            CONTROL DESK: CENTRAL OPERATIONS
          </span>
          <span className="text-red-300">|</span>
          <span className="text-slate-200">
            TRUNK CORRIDOR: DELHI (NDLS) → AGRA CANTT (AGC) [265 KM]
          </span>
          <span className="text-red-300 hidden md:inline">|</span>
          <span className="text-cyan-300 hidden md:inline font-mono">
            6 STATIONS • 5 SECTIONS • 100% ELECTRIFIED
          </span>
        </div>

        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          {/* CRT Scanlines Toggle */}
          <button
            onClick={onToggleScanlines}
            className={`font-pixel text-[8px] px-2 py-0.5 border transition-colors ${
              scanlines
                ? 'bg-electric-cyan text-black border-white shadow-glow-cyan'
                : 'bg-black/50 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            SCANLINES: {scanlines ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center space-x-1.5 bg-black/60 px-2 py-0.5 border border-yellow-500/40">
            <span className="font-pixel text-[8px] text-yellow-400 uppercase tracking-widest">
              SYNTHETIC BENCHMARK DEMO
            </span>
          </div>
        </div>
      </div>

      {/* Main Control Panel Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Railway Emblem */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-[#0c1424] border-2 border-electric-cyan shadow-glow-cyan flex items-center justify-center p-1.5 relative overflow-hidden">
            <PixelTrain size={30} color="#00f0ff" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 transform rotate-45"></div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-pixel text-sm md:text-base text-yellow-400 tracking-wider">
                AI BLOCK PLANNING CONTROL
              </h1>
              <span className="px-1.5 py-0.5 bg-[#0f2347] text-cyan-300 border border-electric-cyan text-[8px] font-pixel shadow-glow-cyan">
                SIH-2024
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide mt-0.5">
              Automated Railway Maintenance Possession & Conflict Resolution System • CP-SAT
            </p>
          </div>
        </div>

        {/* Right: Live IST Digital Clock & Telemetry Badges */}
        <div className="flex items-center space-x-3">
          {/* Live IST Digital Clock */}
          <div className="bg-[#060a12] border-2 border-[#1e293b] shadow-pixel px-3.5 py-1.5 text-right relative">
            <div className="text-[8px] font-pixel text-electric-cyan uppercase flex items-center justify-end space-x-1 mb-0.5">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-none animate-pulse"></span>
              <span>IST (UTC+05:30)</span>
            </div>
            <div className="font-digital text-2xl md:text-3xl text-emerald-400 tracking-widest leading-none">
              {istTime || '--:--:--'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {istDate || '--- --, ----'}
            </div>
          </div>

          {/* Engine Status Lamp */}
          <div className="bg-[#060a12] border-2 border-[#1e293b] shadow-pixel px-3 py-2 flex items-center space-x-2.5">
            <PixelSignal aspect={isSolving ? 'amber' : 'green'} size={22} />
            <div>
              <div className="text-[8px] font-pixel text-slate-400">SOLVER</div>
              <div className={`text-[10px] font-pixel ${isSolving ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                {isSolving ? 'SEARCHING...' : 'OPTIMAL'}
              </div>
            </div>
          </div>

          {/* Data Storage Layer */}
          <div className="bg-[#060a12] border-2 border-[#1e293b] shadow-pixel px-3 py-2 hidden lg:block">
            <div className="text-[8px] font-pixel text-slate-400">DATA LAYER</div>
            <div className="text-[10px] font-pixel text-cyan-300">
              {isFirebaseConfigured ? 'FIRESTORE' : 'LOCAL REPO'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar & Scenario Switcher */}
      <div className="bg-[#040811] border-t border-[#1e293b] px-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex space-x-1.5 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-[10px] md:text-[11px] font-pixel transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#0f2347] text-electric-cyan border-2 border-electric-cyan shadow-glow-cyan -translate-y-0.5'
                    : 'bg-[#0a101d] text-slate-300 border-2 border-[#1e293b] hover:border-slate-600 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Scenario Switcher */}
        <div className="flex items-center space-x-2 py-1.5">
          <span className="text-[9px] font-pixel text-slate-400 uppercase hidden sm:inline">
            SCENARIO:
          </span>
          <div className="inline-flex border-2 border-[#1e293b] shadow-pixel-sm bg-[#060a12]">
            <button
              onClick={() => onToggleScenario('congested')}
              className={`px-3 py-1 text-[9px] font-pixel transition-all ${
                scenario === 'congested'
                  ? 'bg-amber-600 text-black font-bold shadow-glow-amber'
                  : 'bg-[#0a101d] text-slate-400 hover:text-white'
              }`}
            >
              CONGESTED (11T / 10B)
            </button>
            <button
              onClick={() => onToggleScenario('demo')}
              className={`px-3 py-1 text-[9px] font-pixel transition-all ${
                scenario === 'demo'
                  ? 'bg-[#7B1113] text-yellow-300 font-bold'
                  : 'bg-[#0a101d] text-slate-400 hover:text-white'
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
