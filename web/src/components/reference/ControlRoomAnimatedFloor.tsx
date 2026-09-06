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
  const [operatorNote, setOperatorNote] = useState('ALL CORRIDORS CLEAR');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSeconds(now.getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isSolving) {
      setOperatorNote('CP-SAT OPTIMIZING • RESOLVING CONFLICTS');
    } else {
      const notes = [
        'ALL CORRIDORS CLEAR',
        '12002 EXP ON TIME (+0m)',
        'NDLS-GZB AUTO-BLOCK OK',
        'MAINTENANCE WINDOW VERIFIED',
        'SIGNAL GREEN 6/6 SECTIONS',
      ];
      const interval = setInterval(() => {
        setOperatorNote(notes[Math.floor(Math.random() * notes.length)]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isSolving]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300/80 shadow-md mt-4 select-none group bg-[#cbd5e1]">
      {/* 1. Base High-Resolution Pixel-Art Control Room Painting */}
      <img
        src="/control-room-bottom.png"
        alt="Central Railway Operations Control Room Floor"
        className="w-full h-auto object-cover block min-h-[170px]"
      />

      {/* 2. Scenic Window Train: Glides past on the elevated bridge outside the window */}
      <div
        style={{ left: '12%', top: '24%', width: '70%', height: '14%' }}
        className="absolute overflow-hidden pointer-events-none z-5"
      >
        <div className="relative w-full h-full">
          {/* Animated 8-bit Train */}
          <div className="absolute top-1 flex items-center space-x-0.5 animate-[window-train_18s_linear_infinite]">
            {/* Engine Nose */}
            <div className="w-8 h-3.5 bg-[#0284c7] border border-black rounded-l-md flex items-center px-0.5 relative shadow-xs">
              <div className="w-1.5 h-1 bg-yellow-300 rounded-full animate-pulse mr-0.5" />
              <div className="w-4 h-1 bg-white" />
            </div>
            {/* Passenger Coaches */}
            {[1, 2, 3, 4].map((coach) => (
              <div
                key={coach}
                className="w-9 h-3.5 bg-slate-100 border border-black flex items-center justify-evenly px-0.5 relative"
              >
                <div className="w-1.5 h-1.5 bg-[#0369a1] rounded-xs" />
                <div className="w-1.5 h-1.5 bg-[#0369a1] rounded-xs" />
                <div className="w-1.5 h-1.5 bg-[#0369a1] rounded-xs" />
                {/* Red stripe */}
                <div className="absolute bottom-0.5 left-0 right-0 h-0.5 bg-rose-600" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Fully Visible Animated Character Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* CHARACTER 1: Standing Station Superintendent (Far Left, ~4% from left, ~37% from top) */}
        <div
          style={{ left: '3.8%', top: '37%' }}
          className="absolute w-10 h-28 pointer-events-auto cursor-help group/super"
          title="Station Superintendent (Monitoring Timetable & Tablet)"
        >
          {/* Head & Peaked Cap: Tilts down to tablet, then looks up at departure board */}
          <div className="absolute top-0 left-2.5 w-6 h-6 animate-[super-look_5s_infinite_ease-in-out]">
            {/* Peaked Cap */}
            <div className="w-5 h-2.5 bg-[#0f172a] border border-black rounded-t-sm relative">
              <div className="w-1.5 h-1 bg-yellow-400 mx-auto rounded-full" />
              <div className="w-6 h-1 bg-[#1e293b] absolute -bottom-0.5 -left-0.5 rounded-full" />
            </div>
            {/* Face Profile */}
            <div className="w-4 h-3.5 bg-[#d97706] mx-auto border-x border-b border-black/80 relative">
              <div className="w-1 h-1 bg-black absolute top-1 right-0.5 rounded-full" />
            </div>
          </div>

          {/* Right Arm & Hand: Actively Taps and Swipes on the Tablet */}
          <div className="absolute top-10 left-4 animate-[tablet-tap_1.2s_infinite_ease-in-out]">
            {/* Hand */}
            <div className="w-2.5 h-2.5 bg-[#d97706] rounded-xs border border-black relative">
              {/* Tapping finger */}
              <div className="w-1 h-1.5 bg-[#b45309] absolute -right-0.5 top-0 animate-[finger-tap_0.4s_infinite]" />
            </div>
          </div>

          {/* Glowing Digital Tablet Screen */}
          <div
            style={{ left: '16px', top: '44px' }}
            className="absolute w-5 h-6 bg-[#0284c7] border border-black rounded-xs shadow-[0_0_8px_#38bdf8] flex flex-col justify-between p-0.5"
          >
            <div className="w-full h-0.5 bg-white animate-pulse" />
            <div className="w-3 h-0.5 bg-yellow-300" />
            <div className="w-full h-0.5 bg-emerald-400" />
          </div>

          {/* Hover Status Tag */}
          <div className="opacity-0 group-hover/super:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-yellow-300 px-1.5 py-0.5 rounded text-[8px] font-pixel whitespace-nowrap border border-slate-700 shadow-md">
            NDLS CHIEF
          </div>
        </div>

        {/* CHARACTER 2: Console Operator 1 - Delhi Division Controller (At ~25% from left, ~46% from top) */}
        <div
          style={{ left: '25.0%', top: '46%' }}
          className="absolute w-14 h-24 pointer-events-auto group/op1"
          title="Delhi Section Controller (Typing at Triple Consoles)"
        >
          {/* Head & Headset: Scans side-to-side between Monitor 1 and Monitor 2 */}
          <div className="absolute top-0 left-4 w-6 h-6 animate-[head-scan_3.8s_infinite_ease-in-out]">
            <div className="w-5 h-4 bg-[#18181b] rounded-t-sm relative">
              {/* Headset band */}
              <div className="w-5.5 h-1 bg-[#38bdf8] absolute top-1 -left-0.5" />
            </div>
            <div className="w-4.5 h-3 bg-[#c27847] mx-auto border-x border-b border-black/70" />
          </div>

          {/* Rapid Animated Typing Arms & Hands over Keyboard */}
          <div className="absolute top-12 left-1.5 flex space-x-2">
            {/* Left Hand: Rapid Key-Tapping */}
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite]' : 'animate-[typing-left_0.28s_infinite]'
              }`}
            >
              <div className="w-1.5 h-0.5 bg-white -mt-0.5 mx-auto" />
            </div>
            {/* Right Hand: Alternating Key-Tapping */}
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite_0.05s]' : 'animate-[typing-right_0.25s_infinite_0.12s]'
              }`}
            >
              <div className="w-1.5 h-0.5 bg-white -mt-0.5 mx-auto" />
            </div>
          </div>

          {/* Coffee Mug Steam on Desk */}
          <div className="absolute top-10 right-0 w-1.5 h-3 flex flex-col items-center">
            <div className="w-0.5 h-1.5 bg-slate-300 rounded-full animate-[steam_1.8s_infinite]" />
          </div>
        </div>

        {/* CHARACTER 3: Console Operator 2 - Central Corridor / Interlocking (At ~46.5% from left, ~46% from top) */}
        <div
          style={{ left: '46.5%', top: '46%' }}
          className="absolute w-14 h-24 pointer-events-auto group/op2"
          title="Section Interlocking Controller (Operating CTC Board)"
        >
          {/* Head with Railway Cap: Gentle Nodding & Posture Shift */}
          <div className="absolute top-0 left-4 w-6 h-6 animate-[operator-nod_3.2s_infinite_ease-in-out]">
            <div className="w-5.5 h-2 bg-[#0f172a] rounded-t-sm relative">
              <div className="w-6 h-0.5 bg-amber-400 absolute -bottom-0.5" />
            </div>
            <div className="w-4.5 h-3.5 bg-[#c27847] mx-auto border-x border-b border-black/70" />
          </div>

          {/* Animated Typing Hands */}
          <div className="absolute top-12 left-2 flex space-x-2">
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite]' : 'animate-[typing-left_0.32s_infinite]'
              }`}
            />
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite_0.05s]' : 'animate-[typing-right_0.3s_infinite_0.15s]'
              }`}
            />
          </div>
        </div>

        {/* CHARACTER 4: Console Operator 3 - Agra Division Controller (At ~66.5% from left, ~46% from top) */}
        <div
          style={{ left: '66.5%', top: '46%' }}
          className="absolute w-14 h-24 pointer-events-auto group/op3"
          title="Agra Division Controller (Monitoring Taj Mahal Track Corridor)"
        >
          {/* Head scanning between CTC Track and Timetable */}
          <div className="absolute top-0 left-4 w-6 h-6 animate-[head-scan_4.2s_infinite_ease-in-out]">
            <div className="w-5 h-3.5 bg-[#18181b] rounded-t-sm" />
            <div className="w-4.5 h-3 bg-[#c27847] mx-auto border-x border-b border-black/70" />
          </div>

          {/* Active Typing Hands */}
          <div className="absolute top-12 left-2 flex space-x-2">
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite]' : 'animate-[typing-left_0.26s_infinite]'
              }`}
            />
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite_0.05s]' : 'animate-[typing-right_0.29s_infinite_0.1s]'
              }`}
            />
          </div>
        </div>

        {/* CHARACTER 5: Patrolling Chief Controller - WALKS ACROSS THE AISLE (Between 74% and 81%) */}
        <div
          style={{ top: '36%' }}
          className="absolute w-12 h-28 pointer-events-auto cursor-pointer animate-[officer-patrol_10s_infinite_ease-in-out]"
          title="Chief Section Controller (Patrolling Aisle & Inspecting Block Status)"
        >
          {/* Body Container with Walking Bob */}
          <div className="relative w-full h-full animate-[walking-step-bob_0.42s_infinite_ease-in-out]">
            {/* Peaked Cap */}
            <div className="w-7 h-3 bg-[#0f172a] border border-black rounded-t-sm mx-auto relative">
              <div className="w-2 h-1 bg-yellow-400 mx-auto rounded-full mt-0.5" />
              <div className="w-8 h-1 bg-[#1e293b] absolute -bottom-0.5 -left-0.5" />
            </div>

            {/* Head & Face */}
            <div className="w-5.5 h-4 bg-[#c27847] mx-auto border-x border-b border-black/80 relative">
              <div className="w-1.5 h-1 bg-black absolute top-1 right-1 rounded-full" />
            </div>

            {/* Torso: Crisp White Uniform with Epaulettes and Tie */}
            <div className="w-7 h-8 bg-white border border-black mx-auto relative shadow-xs">
              {/* Epaulettes */}
              <div className="w-2 h-0.5 bg-yellow-400 absolute top-0 left-0" />
              <div className="w-2 h-0.5 bg-yellow-400 absolute top-0 right-0" />
              {/* Navy Tie */}
              <div className="w-1.5 h-4 bg-[#1e3a8a] mx-auto mt-0.5" />
              {/* Gold Belt Buckle */}
              <div className="w-full h-1.5 bg-[#451a03] absolute bottom-0 left-0 flex items-center justify-center">
                <div className="w-1.5 h-1 bg-yellow-400" />
              </div>
            </div>

            {/* Right Arm: Carrying Clipboard / Folder with Gentle Swing */}
            <div className="absolute top-8 -right-1 animate-[arm-swing_0.84s_infinite_ease-in-out]">
              <div className="w-3 h-5 bg-[#38bdf8] border border-black rounded-xs shadow-xs relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
              </div>
            </div>

            {/* Left Arm: Swings Naturally */}
            <div className="absolute top-8 -left-1 w-2 h-5 bg-[#d97706] border border-black rounded-xs animate-[arm-swing-reverse_0.84s_infinite_ease-in-out]" />

            {/* Legs: Visible Stepping Walk Cycle */}
            <div className="flex justify-center space-x-1 mt-0.5">
              {/* Left Leg & Boot */}
              <div className="w-2.5 h-9 bg-[#1e3a8a] border-x border-b border-black origin-top animate-[leg-stride-left_0.42s_infinite_ease-in-out] flex flex-col justify-end">
                <div className="w-3 h-2 bg-[#261c14] border border-black -ml-0.5 rounded-xs" />
              </div>
              {/* Right Leg & Boot */}
              <div className="w-2.5 h-9 bg-[#172554] border-x border-b border-black origin-top animate-[leg-stride-right_0.42s_infinite_ease-in-out] flex flex-col justify-end">
                <div className="w-3 h-2 bg-[#261c14] border border-black -ml-0.5 rounded-xs" />
              </div>
            </div>

            {/* Floor Footstep Shadow */}
            <div className="w-8 h-2 bg-slate-900/40 rounded-full mx-auto -mt-1 blur-2xs" />
          </div>
        </div>

        {/* CHARACTER 6: Console Operator 4 - Power & Traction (At ~91.5% from left, ~46% from top) */}
        <div
          style={{ left: '91.5%', top: '46%' }}
          className="absolute w-14 h-24 pointer-events-auto group/op4"
          title="Traction Power & Overhead Equipment Controller"
        >
          {/* Head looking at India Network Grid Map */}
          <div className="absolute top-0 left-4 w-6 h-6 animate-[operator-nod_4.0s_infinite_ease-in-out]">
            <div className="w-5 h-3.5 bg-[#18181b] rounded-t-sm" />
            <div className="w-4.5 h-3 bg-[#c27847] mx-auto border-x border-b border-black/70" />
          </div>

          {/* Active Typing Hands */}
          <div className="absolute top-12 left-2 flex space-x-2">
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite]' : 'animate-[typing-left_0.35s_infinite]'
              }`}
            />
            <div
              className={`w-3 h-2 bg-[#d97706] border border-black rounded-xs ${
                isSolving ? 'animate-[typing-fast_0.1s_infinite_0.05s]' : 'animate-[typing-right_0.31s_infinite_0.1s]'
              }`}
            />
          </div>
        </div>

        {/* 4. Real Analog Wall Clock (Left Wall at ~1.8% from left, ~14% from top) */}
        <div
          style={{ left: '1.8%', top: '14%' }}
          className="absolute w-7 h-7 rounded-full bg-white/20 flex items-center justify-center pointer-events-none"
        >
          <div
            style={{ transform: `rotate(${seconds * 6}deg)` }}
            className="w-0.5 h-3 bg-red-600 origin-bottom rounded-full transition-transform duration-200"
          />
        </div>

        {/* 5. Systems Board Blinking Green/Cyan LEDs (Right Wall at ~82.5% from left, ~16% from top) */}
        <div
          style={{ left: '82.5%', top: '16.5%' }}
          className="absolute flex flex-col space-y-1.5 pointer-events-none"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSolving ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping' : 'bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse'
            }`}
          />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-pulse" />
        </div>

        {/* 6. Active Screen Glowing Highlights & Phosphor Pulses */}
        <div
          style={{ left: '20.5%', top: '51%' }}
          className={`absolute w-14 h-9 rounded-sm pointer-events-none transition-all duration-300 ${
            isSolving ? 'bg-amber-400/25 shadow-[0_0_14px_#f59e0b]' : 'bg-cyan-400/15 shadow-[0_0_8px_#0284c7]'
          }`}
        />
        <div
          style={{ left: '42.5%', top: '50%' }}
          className={`absolute w-18 h-10 rounded-sm pointer-events-none transition-all duration-300 ${
            isSolving ? 'bg-amber-400/25 shadow-[0_0_14px_#f59e0b]' : 'bg-blue-400/15 shadow-[0_0_8px_#0284c7]'
          }`}
        />
        <div
          style={{ left: '62.5%', top: '51%' }}
          className={`absolute w-14 h-9 rounded-sm pointer-events-none transition-all duration-300 ${
            isSolving ? 'bg-amber-400/25 shadow-[0_0_14px_#f59e0b]' : 'bg-emerald-400/15 shadow-[0_0_8px_#10b981]'
          }`}
        />
      </div>

      {/* 7. Bottom Central Dispatcher Status Bar */}
      <div className="absolute bottom-1 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono border border-slate-700/60 z-20">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-pixel text-[8px] text-yellow-400">
            NORTH CENTRAL RAILWAY • SECTION OPERATIONS FLOOR
          </span>
          <span className="text-slate-400 hidden md:inline text-[10px]">
            • Dispatch Status: <strong className="text-cyan-300 font-mono">{operatorNote}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isSolving && (
            <span className="text-[8px] font-pixel text-amber-300 animate-pulse hidden sm:inline">
              CP-SAT SOLVER IN PROGRESS...
            </span>
          )}
          <button
            onClick={onTriggerSolve}
            disabled={isSolving}
            className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-pixel text-[8px] font-bold shadow-xs transition-colors pointer-events-auto"
          >
            {isSolving ? 'SOLVING...' : 'TRIGGER SOLVER'}
          </button>
        </div>
      </div>

      {/* 8. CSS Keyframes for Real Character Movement */}
      <style>{`
        /* Officer Walking Across the Aisle */
        @keyframes officer-patrol {
          0% {
            left: 74%;
            transform: scaleX(1);
          }
          42% {
            left: 81%;
            transform: scaleX(1);
          }
          50% {
            left: 81%;
            transform: scaleX(-1);
          }
          92% {
            left: 74%;
            transform: scaleX(-1);
          }
          100% {
            left: 74%;
            transform: scaleX(1);
          }
        }

        /* Walking Step Bob */
        @keyframes walking-step-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3.5px); }
        }

        /* Arm Swing */
        @keyframes arm-swing {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(10deg); }
        }

        @keyframes arm-swing-reverse {
          0%, 100% { transform: rotate(10deg); }
          50% { transform: rotate(-8deg); }
        }

        /* Leg Strides */
        @keyframes leg-stride-left {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(14deg); }
        }

        @keyframes leg-stride-right {
          0%, 100% { transform: rotate(14deg); }
          50% { transform: rotate(-12deg); }
        }

        /* Seated Operators Typing */
        @keyframes typing-left {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes typing-right {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes typing-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        /* Head Nod & Scan */
        @keyframes head-scan {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          50% { transform: rotate(4deg) translateY(-1px); }
        }

        @keyframes operator-nod {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.8px); }
        }

        /* Superintendent Looking */
        @keyframes super-look {
          0%, 55% { transform: rotate(6deg) translateY(1.5px); }
          65%, 90% { transform: rotate(-8deg) translateY(-2px); }
          100% { transform: rotate(6deg) translateY(1.5px); }
        }

        @keyframes tablet-tap {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2.5px); }
        }

        @keyframes finger-tap {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(1.5px); }
        }

        /* Coffee Steam */
        @keyframes steam {
          0% { transform: translateY(0) scaleX(1); opacity: 0.8; }
          100% { transform: translateY(-6px) scaleX(1.8); opacity: 0; }
        }

        /* Window Train Gliding */
        @keyframes window-train {
          0% { transform: translateX(-220px); }
          100% { transform: translateX(950px); }
        }
      `}</style>
    </div>
  );
};
