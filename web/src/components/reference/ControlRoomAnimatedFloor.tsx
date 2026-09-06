import React, { useState, useEffect } from 'react';

interface ControlRoomAnimatedFloorProps {
  isSolving: boolean;
  onTriggerSolve: () => void;
}

export const ControlRoomAnimatedFloor: React.FC<ControlRoomAnimatedFloorProps> = ({
  isSolving,
  onTriggerSolve,
}) => {
  // Live seconds for analog clock second-hand tick
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSeconds(now.getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300/80 shadow-md mt-4 select-none group bg-[#cbd5e1]">
      {/* 1. Base High-Resolution Pixel-Art Control Room Painting */}
      <img
        src="/control-room-bottom.png"
        alt="Central Railway Operations Control Room Floor"
        className="w-full h-auto object-cover block min-h-[170px]"
      />

      {/* 2. Interactive Character Micro-Movement Overlays ("make sure the characters below have little movement") */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Character 1: Left Walking Officer with Clipboard (At ~5% from left, ~60% from top) */}
        <div
          style={{ left: '4.8%', top: '56%' }}
          className={`absolute w-8 h-20 transition-all ${
            isSolving ? 'animate-bounce' : 'animate-[subtle-sway_4s_infinite_ease-in-out]'
          }`}
          title="Chief Train Controller"
        >
          {/* Subtle breathing / head-turn shadow overlay */}
          <div className="w-4 h-4 rounded-full bg-amber-400/20 absolute top-0 left-2 animate-pulse" />
        </div>

        {/* Character 2: Center-Left Seated Operator (At ~27.5% from left, ~65% from top) */}
        <div
          style={{ left: '27.2%', top: '64%' }}
          className="absolute w-12 h-18"
          title="Delhi Section Controller"
        >
          {/* Subtle typing arm micro-animation */}
          <div
            className={`w-4 h-1.5 bg-white/40 rounded-xs absolute top-8 left-1 ${
              isSolving ? 'animate-ping' : 'animate-[subtle-type_0.6s_infinite_ease-in-out]'
            }`}
          />
          {/* Gentle head bob */}
          <div className="w-3 h-3 rounded-full bg-slate-900/10 absolute top-0 left-4 animate-[subtle-bob_2.8s_infinite_ease-in-out]" />
        </div>

        {/* Character 3: Center Master Operator (At ~48.5% from left, ~63% from top) */}
        <div
          style={{ left: '48.2%', top: '62%' }}
          className="absolute w-14 h-20"
          title="Section Controller In-Charge (Gantt Monitor)"
        >
          {/* Subtle breathing & posture adjustment */}
          <div className="w-5 h-4 rounded-xs bg-slate-900/10 absolute top-0 left-4 animate-[subtle-bob_3.5s_infinite_ease-in-out]" />
          {/* Subtle hand motion */}
          <div
            className={`w-3 h-1 bg-amber-300/30 absolute top-9 left-2 ${
              isSolving ? 'animate-pulse' : 'animate-[subtle-type_0.8s_infinite_ease-in-out]'
            }`}
          />
        </div>

        {/* Character 4: Center-Right Seated Operator (At ~68.5% from left, ~65% from top) */}
        <div
          style={{ left: '68.2%', top: '64%' }}
          className="absolute w-12 h-18"
          title="Agra Section Controller"
        >
          {/* Subtle typing animation */}
          <div
            className={`w-4 h-1.5 bg-white/40 rounded-xs absolute top-8 right-1 ${
              isSolving ? 'animate-ping' : 'animate-[subtle-type_0.5s_infinite_ease-in-out]'
            }`}
          />
          <div className="w-3 h-3 rounded-full bg-slate-900/10 absolute top-0 left-4 animate-[subtle-bob_3s_infinite_ease-in-out]" />
        </div>

        {/* Character 5: Right Walking Officer (At ~79.5% from left, ~60% from top) */}
        <div
          style={{ left: '79.2%', top: '58%' }}
          className="absolute w-8 h-20 animate-[subtle-sway_5s_infinite_ease-in-out]"
          title="Signals & Telemetry Supervisor"
        >
          {/* Subtle movement indicator */}
          <div className="w-3 h-3 rounded-full bg-cyan-400/20 absolute top-0 left-2 animate-pulse" />
        </div>

        {/* Character 6: Far Right Seated Operator (At ~93.5% from left, ~66% from top) */}
        <div
          style={{ left: '93.2%', top: '65%' }}
          className="absolute w-10 h-16 animate-[subtle-bob_4s_infinite_ease-in-out]"
          title="Power & Traction Controller"
        />

        {/* 3. Wall Elements & Live Status Lights */}
        {/* Wall Clock (Left Wall at ~2% from left, ~15% from top) */}
        <div
          style={{ left: '1.8%', top: '15%' }}
          className="absolute w-7 h-7 rounded-full bg-white/30 flex items-center justify-center pointer-events-none"
        >
          {/* Clock Ticking Hand */}
          <div
            style={{ transform: `rotate(${seconds * 6}deg)` }}
            className="w-0.5 h-3 bg-red-600 origin-bottom rounded-full transition-transform duration-200"
          />
        </div>

        {/* Systems Board Blinking Green LEDs (Right Wall at ~82% from left, ~16% from top) */}
        <div
          style={{ left: '82.5%', top: '16.5%' }}
          className="absolute flex flex-col space-y-1.5 pointer-events-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-pulse" />
        </div>

        {/* Computer Screen Phosphor Glow Highlights */}
        <div
          style={{ left: '21%', top: '53%' }}
          className={`absolute w-14 h-9 rounded-sm pointer-events-none transition-all duration-300 ${
            isSolving ? 'bg-amber-400/20 shadow-[0_0_12px_#f59e0b]' : 'bg-cyan-400/10 shadow-[0_0_8px_#0284c7]'
          }`}
        />
        <div
          style={{ left: '41%', top: '52%' }}
          className={`absolute w-18 h-10 rounded-sm pointer-events-none transition-all duration-300 ${
            isSolving ? 'bg-amber-400/20 shadow-[0_0_12px_#f59e0b]' : 'bg-blue-400/10 shadow-[0_0_8px_#0284c7]'
          }`}
        />
        <div
          style={{ left: '61%', top: '53%' }}
          className={`absolute w-14 h-9 rounded-sm pointer-events-none transition-all duration-300 ${
            isSolving ? 'bg-amber-400/20 shadow-[0_0_12px_#f59e0b]' : 'bg-emerald-400/10 shadow-[0_0_8px_#10b981]'
          }`}
        />
      </div>

      {/* 4. Bottom Control Bar Overlay */}
      <div className="absolute bottom-1 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono border border-slate-700/60 z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-pixel text-[8px] text-yellow-400">
            NORTH CENTRAL RAILWAY CENTRAL CONTROL ROOM
          </span>
          <span className="text-slate-400 hidden sm:inline text-[10px]">
            • 5 Active Dispatch Consoles • Automated Headway Enforcement
          </span>
        </div>

        <button
          onClick={onTriggerSolve}
          disabled={isSolving}
          className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-pixel text-[8px] font-bold shadow-xs transition-colors pointer-events-auto"
        >
          {isSolving ? 'SOLVING...' : 'TRIGGER SOLVER'}
        </button>
      </div>

      {/* Embedded CSS for Little Movement Keyframes */}
      <style>{`
        @keyframes subtle-type {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.2px); }
        }
        @keyframes subtle-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(0.8px); }
        }
        @keyframes subtle-sway {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};
