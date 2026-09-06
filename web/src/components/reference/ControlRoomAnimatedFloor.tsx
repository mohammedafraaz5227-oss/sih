import React, { useState, useEffect, useRef } from 'react';
import { WalkingOfficerSprite, SeatedOperatorSprite } from './PixelSprites';

interface ControlRoomAnimatedFloorProps {
  isSolving: boolean;
  onTriggerSolve: () => void;
}

export const ControlRoomAnimatedFloor: React.FC<ControlRoomAnimatedFloorProps> = ({
  isSolving,
  onTriggerSolve,
}) => {
  // Live seconds for analog wall clock
  const [clockSeconds, setClockSeconds] = useState(0);

  // Status message ticker for bottom bar
  const [statusMessage, setStatusMessage] = useState('ALL CORRIDORS CLEAR • BLOCK PLANNING 100% OK');

  // --- Walking Officer State (Grounded floor path, calm pacing) ---
  // Position percentage along floor walkway (ranges from 12% to 76%)
  const [officerPos, setOfficerPos] = useState(18);
  const [isWalkingLeft, setIsWalkingLeft] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [isOfficerIdle, setIsOfficerIdle] = useState(false);

  // --- Seated Operators State (Subtle typing & screen interactions) ---
  const [op1Frame, setOp1Frame] = useState(0);
  const [op2Frame, setOp2Frame] = useState(0);

  // 1. Live Clock Timer
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setClockSeconds(now.getSeconds());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 2. Status Message Ticker
  useEffect(() => {
    if (isSolving) {
      setStatusMessage('CP-SAT OPTIMIZING • RESOLVING TEMPORAL CONFLICTS');
    } else {
      const messages = [
        'ALL CORRIDORS CLEAR • BLOCK PLANNING 100% OK',
        '12002 EXP ON TIME (+0m) • SEC_GZB_ALG',
        'NDLS-GZB AUTO-BLOCK ENFORCED • HEADWAY 6m',
        'MAINTENANCE POSSESSION VERIFIED • 0 TRAIN CONFLICTS',
        'SIGNAL GREEN 6/6 SECTIONS • TRAFFIC FLOW OPTIMAL',
      ];
      const ticker = setInterval(() => {
        setStatusMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 5000);
      return () => clearInterval(ticker);
    }
  }, [isSolving]);

  // 3. Walking Officer Animation Engine (Calm, grounded horizontal path)
  useEffect(() => {
    // Walk step interval (advances position and walk cycle frames)
    const stepInterval = setInterval(() => {
      if (isOfficerIdle) {
        // In idle pose: alternate between reading notes (frame 4) and looking up (frame 5)
        setWalkFrame((prev) => (prev === 4 ? 5 : 4));
        return;
      }

      // In walk cycle: advance frames 0 -> 1 -> 2 -> 3 -> 0
      setWalkFrame((prev) => (prev + 1) % 4);

      setOfficerPos((prevPos) => {
        const stepSize = isSolving ? 0.65 : 0.45; // Gentle, slow pacing
        if (!isWalkingLeft) {
          // Walking Right
          const next = prevPos + stepSize;
          if (next >= 74) {
            // Reached right console: trigger idle inspection pause
            setIsOfficerIdle(true);
            setWalkFrame(4);
            setTimeout(() => {
              setIsWalkingLeft(true);
              setIsOfficerIdle(false);
              setWalkFrame(0);
            }, 4000); // 4-second calm inspection pause
            return 74;
          }
          return next;
        } else {
          // Walking Left
          const next = prevPos - stepSize;
          if (next <= 14) {
            // Reached left station: trigger idle inspection pause
            setIsOfficerIdle(true);
            setWalkFrame(4);
            setTimeout(() => {
              setIsWalkingLeft(false);
              setIsOfficerIdle(false);
              setWalkFrame(0);
            }, 3500); // 3.5-second inspection pause
            return 14;
          }
          return next;
        }
      });
    }, 280);

    return () => clearInterval(stepInterval);
  }, [isWalkingLeft, isOfficerIdle, isSolving]);

  // 4. Seated Operators Animation (Subtle typing & screen glancing)
  useEffect(() => {
    const typingInterval = setInterval(() => {
      // Randomized subtle micro-actions: 0 (neutral), 1 (type right), 2 (type left), 3 (glance)
      const r1 = Math.random();
      if (r1 < 0.4) setOp1Frame(1);
      else if (r1 < 0.7) setOp1Frame(2);
      else if (r1 < 0.85) setOp1Frame(3);
      else setOp1Frame(0);

      const r2 = Math.random();
      if (r2 < 0.4) setOp2Frame(2);
      else if (r2 < 0.7) setOp2Frame(1);
      else if (r2 < 0.85) setOp2Frame(3);
      else setOp2Frame(0);
    }, isSolving ? 450 : 850);

    return () => clearInterval(typingInterval);
  }, [isSolving]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300/80 shadow-md mt-4 select-none group bg-[#cbd5e1]">
      {/* 1. LAYER 0: Static High-Resolution Pixel-Art Control Room Painting */}
      <img
        src="/control-room-bottom.png"
        alt="Central Railway Operations Control Room Floor"
        className="w-full h-auto object-cover block min-h-[170px]"
      />

      {/* 2. LAYER 1: Subtle Screen Phosphor Glances (Static room ambient) */}
      <div className="absolute inset-0 pointer-events-none z-5">
        {/* Analog Wall Clock Second Hand (Left Wall ~1.8%, ~14%) */}
        <div
          style={{ left: '1.8%', top: '14%' }}
          className="absolute w-7 h-7 rounded-full bg-white/20 flex items-center justify-center pointer-events-none"
        >
          <div
            style={{ transform: `rotate(${clockSeconds * 6}deg)` }}
            className="w-0.5 h-3 bg-red-600 origin-bottom rounded-full transition-transform duration-200"
          />
        </div>

        {/* Systems Board Blinking Status LEDs (Right Wall ~82.5%, ~16.5%) */}
        <div
          style={{ left: '82.5%', top: '16.5%' }}
          className="absolute flex flex-col space-y-1.5 pointer-events-none"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSolving
                ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping'
                : 'bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse'
            }`}
          />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-pulse" />
        </div>
      </div>

      {/* 3. LAYER 2: Seated Operators Naturally Behind Workstations (Naturally Occluded) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Seated Operator 1 (Delhi Division - Left Workstation Console ~27.0%) */}
        <div
          style={{ left: '26.8%', top: '48.5%', width: '3.6%' }}
          className="absolute pointer-events-auto cursor-help"
          title="Section Controller 1 (Delhi Division) • Timetable & Track Circuits"
        >
          <SeatedOperatorSprite frame={op1Frame} hasCap={false} />
        </div>

        {/* Seated Operator 2 (Agra Division / Interlocking - Center Workstation Console ~48.2%) */}
        <div
          style={{ left: '48.0%', top: '48.5%', width: '3.6%' }}
          className="absolute pointer-events-auto cursor-help"
          title="Section Controller 2 (Agra Division) • CTC Interlocking Console"
        >
          <SeatedOperatorSprite frame={op2Frame} hasCap={true} />
        </div>
      </div>

      {/* 4. LAYER 3: Standing Officer (Chief Controller) Walking Slowly Along Grounded Floor Path */}
      <div className="absolute inset-0 pointer-events-none z-15">
        <div
          style={{
            left: `${officerPos}%`,
            bottom: '19px', // Grounded foot baseline locked to floor line
            width: '3.0%',
            minWidth: '28px',
            maxWidth: '42px',
          }}
          className="absolute pointer-events-auto cursor-pointer transition-[left] duration-300 ease-linear"
          title="Chief Train Controller • Patrolling Central Dispatch Floor"
        >
          <WalkingOfficerSprite
            frame={walkFrame}
            isFacingLeft={isWalkingLeft}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* 5. LAYER 4: Retro Pixel Status Bar (Preserves spaciousness & clean readability) */}
      <div className="absolute bottom-1 left-2 right-2 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs border border-slate-700/70 z-20 shadow-pixel-sm">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span className="font-pixel text-[8px] text-yellow-400 shrink-0 uppercase tracking-wide">
            OPERATIONS FLOOR
          </span>
          <span className="text-slate-500 shrink-0 font-pixel text-[8px]">|</span>
          <span className="font-digital text-sm text-cyan-300 truncate tracking-wide">
            {statusMessage}
          </span>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 ml-2">
          {isSolving && (
            <span className="text-[8px] font-pixel text-amber-300 animate-pulse hidden sm:inline">
              CP-SAT SOLVING...
            </span>
          )}
          <button
            onClick={onTriggerSolve}
            disabled={isSolving}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-pixel text-[8px] tracking-wide shadow-pixel-sm transition-all pointer-events-auto active:translate-y-0.5"
          >
            {isSolving ? 'SOLVING...' : 'RUN SOLVER'}
          </button>
        </div>
      </div>
    </div>
  );
};
