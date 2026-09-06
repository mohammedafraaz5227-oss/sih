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
  // Live IST Digital Clock (Asia/Kolkata)
  const [istTime, setIstTime] = useState<string>('');
  const [istDate, setIstDate] = useState<string>('');

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
    { id: 'blocks', label: 'BLOCK DEMANDS', icon: '🔧' },
    { id: 'optimize', label: 'CP-SAT SOLVER', icon: '⚡' },
    { id: 'timeline', label: '24H TIMELINE', icon: '⏱️' },
    { id: 'compare', label: 'BENCHMARK', icon: '⚖️' },
  ];

  return (
    <header className="border-b-2 border-[#0f172a] bg-white shadow-pixel relative z-30">
      {/* 1. Top Ticker: Indian Railways Crimson Operational Ribbon */}
      <div className="bg-[#7B1113] text-white px-4 py-1.5 flex flex-wrap items-center justify-between border-b-2 border-[#0f172a] text-[11px] font-mono tracking-wider">
        <div className="flex items-center space-x-2.5">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-none animate-ping"></span>
          <span className="font-pixel text-[9px] text-yellow-300">
            NORTH CENTRAL RAILWAY • CENTRAL SECTION DISPATCH
          </span>
          <span className="text-red-300">|</span>
          <span className="text-white font-bold">
            DELHI (NDLS) ⇄ AGRA CANTT (AGC) [265 KM TRUNK]
          </span>
          <span className="text-red-300 hidden md:inline">|</span>
          <span className="text-amber-200 hidden md:inline font-mono">
            6 STATIONS • 5 SECTIONS • 25kV AC ELECTRIFIED
          </span>
        </div>

        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          {/* CRT Scanlines Toggle */}
          <button
            onClick={onToggleScanlines}
            className={`font-pixel text-[8px] px-2 py-0.5 border-2 transition-colors ${
              scanlines
                ? 'bg-amber-400 text-black border-black font-bold'
                : 'bg-black/40 text-amber-200 border-amber-300/40 hover:text-white'
            }`}
          >
            SCANLINES: {scanlines ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center space-x-1.5 bg-black/50 px-2 py-0.5 border border-yellow-400/50">
            <span className="font-pixel text-[8px] text-yellow-300 uppercase tracking-widest">
              SIH-2024 BENCHMARK
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Control Room Console Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Locomotive Emblem */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-[#0c1424] border-2 border-[#0f172a] shadow-pixel flex items-center justify-center p-1.5 relative overflow-hidden">
            <PixelTrain size={30} color="#facc15" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 transform rotate-45"></div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-pixel text-sm md:text-base text-slate-900 tracking-wider">
                AI RAILWAY BLOCK PLANNER
              </h1>
              <span className="px-1.5 py-0.5 bg-red-100 text-red-900 border border-red-500 text-[8px] font-pixel font-bold">
                OPERATIONS CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-mono tracking-wide mt-0.5">
              Automated Railway Maintenance Possession & Conflict Resolution System • Google OR-Tools CP-SAT
            </p>
          </div>
        </div>

        {/* Right: Live IST Digital Clock & Telemetry Badges */}
        <div className="flex items-center space-x-3">
          {/* Live IST Digital Clock */}
          <div className="bg-[#0f172a] border-2 border-black shadow-pixel px-3.5 py-1.5 text-right relative">
            <div className="text-[8px] font-pixel text-cyan-400 uppercase flex items-center justify-end space-x-1 mb-0.5">
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
          <div className="bg-white border-2 border-[#0f172a] shadow-pixel px-3 py-2 flex items-center space-x-2">
            <PixelSignal aspect={isSolving ? 'amber' : 'green'} size={20} />
            <div>
              <div className="text-[8px] font-pixel text-slate-500">SOLVER</div>
              <div className={`text-[10px] font-pixel font-bold ${isSolving ? 'text-amber-700 animate-pulse' : 'text-emerald-700'}`}>
                {isSolving ? 'SEARCHING' : 'OPTIMAL'}
              </div>
            </div>
          </div>

          {/* Data Storage Mode */}
          <div className="bg-white border-2 border-[#0f172a] shadow-pixel px-3 py-2 hidden lg:block">
            <div className="text-[8px] font-pixel text-slate-500">DATA STORE</div>
            <div className="text-[10px] font-pixel font-bold text-blue-800">
              {isFirebaseConfigured ? 'FIRESTORE' : 'LOCAL REPO'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar & Scenario Switcher */}
      <div className="bg-[#f1f5f9] border-t-2 border-[#0f172a] px-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex space-x-1.5 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-[10px] md:text-[11px] font-pixel transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#7B1113] text-yellow-300 border-2 border-black shadow-pixel -translate-y-0.5 font-bold'
                    : 'bg-white text-slate-800 border-2 border-slate-400 hover:border-black hover:bg-slate-50 shadow-pixel-sm'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Scenario Switcher */}
        <div className="flex items-center space-x-2 py-1.5">
          <span className="text-[9px] font-pixel text-slate-700 uppercase hidden sm:inline font-bold">
            SCENARIO:
          </span>
          <div className="inline-flex border-2 border-[#0f172a] shadow-pixel-sm bg-white">
            <button
              onClick={() => onToggleScenario('congested')}
              className={`px-3 py-1 text-[9px] font-pixel transition-all ${
                scenario === 'congested'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-white text-slate-600 hover:text-black'
              }`}
            >
              CONGESTED (11T / 10B)
            </button>
            <button
              onClick={() => onToggleScenario('demo')}
              className={`px-3 py-1 text-[9px] font-pixel transition-all ${
                scenario === 'demo'
                  ? 'bg-[#7B1113] text-yellow-300 font-bold'
                  : 'bg-white text-slate-600 hover:text-black'
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
