import React, { useState, useEffect } from 'react';
import { PixelSignal, PixelCpu } from '../PixelIcons';

interface ControlRoomSceneProps {
  isSolving: boolean;
  activeTrainsCount: number;
  scheduledBlocksCount: number;
  conflictsCount: number;
  scenario: 'congested' | 'demo';
}

export const ControlRoomScene: React.FC<ControlRoomSceneProps> = ({
  isSolving,
  activeTrainsCount,
  scheduledBlocksCount,
  conflictsCount,
  scenario,
}) => {
  // Live local clock for the control room wall
  const [wallTime, setWallTime] = useState('12:00:00');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setWallTime(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now)
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pixel-card-light overflow-hidden relative select-none">
      {/* 1. Control Room Header & Status Signboard */}
      <div className="bg-[#0f172a] text-white px-4 py-2 flex flex-wrap items-center justify-between border-b-2 border-black text-xs font-mono">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-pulse"></span>
          <span className="font-pixel text-[9px] text-yellow-400 uppercase tracking-wider">
            CENTRAL SECTION CONTROL OPERATIONS FLOOR • AGRA DIVISION
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 text-[10px]">
            {activeTrainsCount} TRAINS MONITORED • {scheduledBlocksCount} BLOCKS RESERVED
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Wall Clocks */}
          <div className="flex items-center space-x-2 font-digital text-sm text-emerald-400 bg-black px-2 py-0.5 border border-slate-700">
            <span className="text-slate-400 text-[9px] font-pixel">IST:</span>
            <span>{wallTime}</span>
          </div>

          <div
            className={`px-2 py-0.5 font-pixel text-[8px] border ${
              isSolving
                ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse'
                : conflictsCount === 0
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-rose-950 text-rose-300 border-rose-600'
            }`}
          >
            {isSolving ? 'CP-SAT SOLVING...' : conflictsCount === 0 ? 'ALL TRACKS CLEAR' : 'CONFLICT WARNING'}
          </div>
        </div>
      </div>

      {/* 2. Control Room Stage View (Pixel Art Canvas) */}
      <div className="relative h-44 bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] overflow-hidden border-b-2 border-[#0f172a]">
        {/* Back Wall Acoustic Panels & Structural Pillars */}
        <div className="absolute inset-0 flex justify-between px-6 pointer-events-none opacity-40">
          <div className="w-6 h-full bg-[#94a3b8] border-x border-[#64748b]"></div>
          <div className="w-6 h-full bg-[#94a3b8] border-x border-[#64748b]"></div>
          <div className="w-6 h-full bg-[#94a3b8] border-x border-[#64748b]"></div>
          <div className="w-6 h-full bg-[#94a3b8] border-x border-[#64748b]"></div>
        </div>

        {/* Status Signboard on Back Wall */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0f172a] text-cyan-300 border-2 border-black px-4 py-1 font-pixel text-[8px] shadow-pixel-sm z-10 flex items-center space-x-2">
          <span className={`w-2 h-2 ${isSolving ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'} inline-block`}></span>
          <span>
            {isSolving
              ? 'ALERT: CP-SAT SEARCHING 1,440-MINUTE CONFLICT-FREE WINDOWS'
              : 'NORTH CENTRAL RAILWAY • HIGH-SPEED SECTION DISPATCH CONSOLE'}
          </span>
        </div>

        {/* Emergency Beacon (Rotates/Pulses during solving) */}
        <div className="absolute top-2 right-8 z-20">
          <div
            className={`w-4 h-4 rounded-full border border-black ${
              isSolving ? 'bg-amber-400 anim-beacon-spin' : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* Server Telemetry Racks (Left Wall) */}
        <div className="absolute bottom-8 left-4 w-16 h-28 bg-[#1e293b] border-2 border-black z-10 p-1 flex flex-col justify-between shadow-pixel">
          <div className="text-[6px] font-pixel text-slate-400 text-center">CP-SAT SVR</div>
          {/* Rack Units with blinking LEDs */}
          {[1, 2, 3, 4].map((rack) => (
            <div key={rack} className="bg-black p-1 border border-slate-700 flex items-center justify-between">
              <div className="flex space-x-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 anim-server-led-1 inline-block"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 anim-server-led-2 inline-block"></span>
                <span className="w-1.5 h-1.5 bg-amber-400 anim-server-led-3 inline-block"></span>
              </div>
              <div className="w-3 h-0.5 bg-slate-600"></div>
            </div>
          ))}
        </div>

        {/* Main Floor Tile Pattern with Yellow Safety Line */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#64748b] border-t-2 border-[#0f172a]">
          {/* Yellow / Black Hazard Demarcation Stripe */}
          <div className="h-1.5 w-full hazard-stripes border-b border-black"></div>
          {/* Floor Grid Lines */}
          <div className="h-full w-full opacity-30 bg-[linear-gradient(90deg,#334155_1px,transparent_1px),linear-gradient(#334155_1px,transparent_1px)] bg-[size:24px_16px]"></div>
        </div>

        {/* Patrolling Supervisor / Station Superintendent (Walks back and forth naturally) */}
        <div className="absolute bottom-6 left-28 z-20 anim-supervisor-walk pointer-events-none">
          <div className="flex flex-col items-center">
            {/* White Cap / Head */}
            <div className="w-3 h-3 bg-[#fde047] border border-black rounded-none anim-head-bob relative">
              <div className="w-1 h-1 bg-black absolute top-1 right-0.5"></div>
            </div>
            {/* Torso: IR White Uniform with epaulettes */}
            <div className="w-5 h-6 bg-[#ffffff] border border-black relative">
              {/* Blue Divisional Tie / Badge */}
              <div className="w-1 h-3 bg-[#1d4ed8] mx-auto mt-0.5"></div>
              {/* Clipboard in Hand */}
              <div className="w-2 h-3 bg-[#b45309] border border-black absolute -left-1 top-2"></div>
            </div>
            {/* Legs: Navy Blue Trousers */}
            <div className="flex space-x-1 anim-leg-shuffle">
              <div className="w-1.5 h-4 bg-[#0f172a]"></div>
              <div className="w-1.5 h-4 bg-[#0f172a]"></div>
            </div>
          </div>
        </div>

        {/* Workstation Desk 1: Seated Operator (Delhi Division Controller) */}
        <div className="absolute bottom-4 left-64 z-20 flex items-end">
          {/* Seated Person Sprite */}
          <div className="flex flex-col items-center mr-1">
            {/* Head with Headset */}
            <div className="w-3.5 h-3.5 bg-[#fde047] border border-black relative anim-head-bob">
              <div className="w-1 h-2 bg-[#0284c7] absolute -left-0.5 top-0.5"></div>
              <div className="w-1 h-1 bg-black absolute top-1.5 right-0.5"></div>
            </div>
            {/* Torso & Typing Arms */}
            <div className="w-5 h-5 bg-[#0284c7] border border-black relative">
              <div
                className={`w-3 h-1.5 bg-[#fde047] border border-black absolute -right-1.5 top-2 ${
                  isSolving ? 'anim-typing-fast' : 'anim-typing-arms'
                }`}
              ></div>
            </div>
            {/* Chair Legs */}
            <div className="w-4 h-3 bg-[#0f172a] border border-black"></div>
          </div>

          {/* Operator Desk & Terminal Monitors */}
          <div className="flex flex-col items-center">
            <div className="flex space-x-1 mb-0.5">
              {/* CRT Monitor 1 (Track Circuits) */}
              <div className="w-8 h-7 bg-[#0f172a] border-2 border-black p-0.5 flex flex-col justify-between anim-screen-glow">
                <div className="text-[5px] font-pixel text-cyan-300">NDLS-GZB</div>
                <div className="w-full h-2 bg-black flex items-center px-0.5">
                  <div className="w-full h-0.5 bg-emerald-400"></div>
                </div>
              </div>
              {/* CRT Monitor 2 (Timetable) */}
              <div className="w-8 h-7 bg-[#0f172a] border-2 border-black p-0.5 flex flex-col justify-between">
                <div className="text-[5px] font-pixel text-yellow-400">12002 EXP</div>
                <div className="text-[5px] font-digital text-green-400">06:15 IST</div>
              </div>
            </div>
            {/* Desk Surface & Keyboard */}
            <div className="w-20 h-5 bg-[#334155] border-2 border-black relative">
              {/* Keyboard */}
              <div className="w-7 h-1.5 bg-[#0f172a] border border-slate-600 mx-auto mt-0.5"></div>
              {/* Coffee Cup with Steam */}
              <div className="w-1.5 h-2 bg-[#f8fafc] border border-black absolute right-1 top-0.5">
                <div className="w-0.5 h-1 bg-slate-400 mx-auto -mt-1 animate-pulse"></div>
              </div>
            </div>
            {/* Desk Legs */}
            <div className="w-18 flex justify-between w-full px-1">
              <div className="w-1.5 h-3 bg-black"></div>
              <div className="w-1.5 h-3 bg-black"></div>
            </div>
          </div>
        </div>

        {/* Workstation Desk 2: Seated Operator (Agra Division Controller) */}
        <div className="absolute bottom-4 right-32 z-20 flex items-end">
          {/* Desk & Terminal Monitors */}
          <div className="flex flex-col items-center mr-1">
            <div className="flex space-x-1 mb-0.5">
              {/* CRT Monitor 3 (Gantt Blocks) */}
              <div className="w-9 h-7 bg-[#0f172a] border-2 border-black p-0.5 flex flex-col justify-between anim-screen-glow">
                <div className="text-[5px] font-pixel text-amber-300">BLOCK P3</div>
                <div className="w-full h-2 bg-black flex items-center space-x-0.5 px-0.5">
                  <div className="w-2 h-1 bg-amber-400"></div>
                  <div className="w-3 h-1 bg-emerald-400"></div>
                </div>
              </div>
            </div>
            {/* Desk Surface */}
            <div className="w-16 h-5 bg-[#334155] border-2 border-black relative">
              <div className="w-6 h-1.5 bg-[#0f172a] border border-slate-600 mx-auto mt-0.5"></div>
            </div>
            {/* Desk Legs */}
            <div className="w-full flex justify-between px-1">
              <div className="w-1.5 h-3 bg-black"></div>
              <div className="w-1.5 h-3 bg-black"></div>
            </div>
          </div>

          {/* Seated Person Sprite */}
          <div className="flex flex-col items-center">
            {/* Head */}
            <div className="w-3.5 h-3.5 bg-[#fde047] border border-black relative anim-head-bob">
              <div className="w-1 h-1 bg-black absolute top-1.5 left-0.5"></div>
            </div>
            {/* Torso */}
            <div className="w-5 h-5 bg-[#16a34a] border border-black relative">
              <div
                className={`w-3 h-1.5 bg-[#fde047] border border-black absolute -left-1.5 top-2 ${
                  isSolving ? 'anim-typing-fast' : 'anim-typing-arms'
                }`}
              ></div>
            </div>
            {/* Chair */}
            <div className="w-4 h-3 bg-[#0f172a] border border-black"></div>
          </div>
        </div>

        {/* Standing Signaling Inspector (Right Wall with Radio) */}
        <div className="absolute bottom-6 right-8 z-20 flex flex-col items-center">
          {/* Hard Hat */}
          <div className="w-3.5 h-2 bg-[#ea580c] border border-black"></div>
          <div className="w-3 h-2.5 bg-[#fde047] border border-black"></div>
          {/* High-Vis Vest */}
          <div className="w-5 h-6 bg-[#facc15] border border-black relative">
            {/* Reflective Stripes */}
            <div className="w-full h-1 bg-[#ffffff] mt-1"></div>
            {/* Radio in Hand */}
            <div className="w-1.5 h-3 bg-black absolute -right-1 top-1">
              <div className="w-0.5 h-1 bg-slate-400 mx-auto -mt-1"></div>
            </div>
          </div>
          {/* Trousers */}
          <div className="flex space-x-1">
            <div className="w-1.5 h-4 bg-[#1e293b]"></div>
            <div className="w-1.5 h-4 bg-[#1e293b]"></div>
          </div>
        </div>
      </div>

      {/* 3. Operational Floor Sub-Bar */}
      <div className="bg-[#f8fafc] px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono border-t border-slate-300">
        <div className="flex items-center space-x-2 text-[11px] text-slate-700">
          <span className="font-pixel text-[8px] text-blue-700 bg-blue-100 px-1.5 py-0.5 border border-blue-300">
            STAFF ON DUTY
          </span>
          <span>Chief Train Controller (CTPC) • Delhi Section Controller • Agra Section Controller • Signals S&T</span>
        </div>

        <div className="text-[10px] text-slate-500 font-pixel">
          DISPATCH WORKSTATION TELEMETRY: 100% SYNCED
        </div>
      </div>
    </div>
  );
};
