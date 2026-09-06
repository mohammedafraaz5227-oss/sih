import React from 'react';

/**
 * Coherent SVG-based Pixel Art Character Sprites
 * Built with crisp pixel rendering (shape-rendering="crispEdges")
 * Authentic 16-bit Indian Railways palette & proportions (7-head human proportion)
 * Grounded baseline, natural occlusion, and multi-frame animation states.
 */

// 1. WALKING OFFICER / CHIEF CONTROLLER (Side / 3/4 View, 20x36 pixel grid)
interface WalkingOfficerSpriteProps {
  frame: number; // 0: Walk 1, 1: Walk 2, 2: Walk 3, 3: Walk 4, 4: Idle Notes, 5: Idle Look Up
  isFacingLeft?: boolean;
  className?: string;
}

export const WalkingOfficerSprite: React.FC<WalkingOfficerSpriteProps> = ({
  frame,
  isFacingLeft = false,
  className = '',
}) => {
  // y=36 is the grounded foot baseline
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{
        transform: isFacingLeft ? 'scaleX(-1)' : 'scaleX(1)',
        transformOrigin: 'bottom center',
      }}
    >
      <svg
        viewBox="0 0 20 38"
        className="w-full h-full block"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Ground Shadow (always grounded at baseline) */}
        <ellipse cx="10" cy="36.5" rx="7" ry="1.5" fill="#0f172a" opacity="0.35" />

        {/* --- HEAD & CAP (Frames 0-3 Walk, Frame 4 Look Down, Frame 5 Look Up) --- */}
        {frame === 5 ? (
          // Look Up Pose (Inspecting Wall Board)
          <g transform="translate(0, -1)">
            {/* Cap Brim & Crown tilted up */}
            <rect x="7" y="1" width="7" height="3" fill="#0f172a" />
            <rect x="6" y="2" width="1" height="2" fill="#0f172a" />
            <rect x="9" y="3" width="3" height="1" fill="#eab308" />
            <rect x="7" y="4" width="8" height="1" fill="#1e293b" />
            {/* Face tilted up */}
            <rect x="7" y="5" width="6" height="4" fill="#d97706" />
            <rect x="9" y="5" width="4" height="3" fill="#f59e0b" />
            <rect x="12" y="6" width="1" height="1" fill="#0f172a" />
            {/* Hair */}
            <rect x="6" y="5" width="2" height="3" fill="#18181b" />
            {/* Collar */}
            <rect x="8" y="9" width="4" height="1" fill="#f8fafc" />
          </g>
        ) : frame === 4 ? (
          // Look Down Pose (Reading Notes)
          <g transform="translate(0, 1)">
            {/* Cap tilted down */}
            <rect x="7" y="3" width="7" height="3" fill="#0f172a" />
            <rect x="6" y="4" width="1" height="2" fill="#0f172a" />
            <rect x="9" y="5" width="3" height="1" fill="#eab308" />
            <rect x="8" y="6" width="8" height="1" fill="#1e293b" />
            {/* Face tilted down */}
            <rect x="7" y="7" width="6" height="3" fill="#d97706" />
            <rect x="9" y="7" width="3" height="2" fill="#f59e0b" />
            <rect x="11" y="8" width="1" height="1" fill="#0f172a" />
            {/* Hair */}
            <rect x="6" y="6" width="2" height="3" fill="#18181b" />
            {/* Collar */}
            <rect x="8" y="10" width="4" height="1" fill="#f8fafc" />
          </g>
        ) : (
          // Neutral / Walk Pose
          <g transform={`translate(0, ${frame % 2 === 1 ? -1 : 0})`}>
            {/* Peaked Cap with Gold Trim */}
            <rect x="7" y="2" width="7" height="3" fill="#0f172a" />
            <rect x="6" y="3" width="1" height="2" fill="#0f172a" />
            <rect x="9" y="4" width="3" height="1" fill="#eab308" />
            <rect x="8" y="5" width="8" height="1" fill="#1e293b" />
            {/* Face Profile */}
            <rect x="7" y="6" width="6" height="4" fill="#d97706" />
            <rect x="9" y="6" width="4" height="3" fill="#f59e0b" />
            <rect x="12" y="7" width="1" height="1" fill="#0f172a" />
            <rect x="12" y="8" width="1" height="1" fill="#c27847" />
            {/* Hair */}
            <rect x="6" y="5" width="2" height="4" fill="#18181b" />
            {/* Collar */}
            <rect x="8" y="10" width="4" height="1" fill="#f8fafc" />
          </g>
        )}

        {/* --- TORSO & UNIFORM SHIRT --- */}
        <g transform={`translate(0, ${frame % 2 === 1 && frame < 4 ? -1 : 0})`}>
          {/* White Uniform Shirt */}
          <rect x="6" y="11" width="8" height="8" fill="#f8fafc" />
          <rect x="6" y="11" width="1" height="8" fill="#cbd5e1" />
          {/* Gold Epaulettes */}
          <rect x="6" y="11" width="2" height="1" fill="#eab308" />
          <rect x="12" y="11" width="2" height="1" fill="#eab308" />
          {/* Navy Blue Tie */}
          <rect x="9" y="11" width="2" height="5" fill="#1e3a8a" />
          {/* Brown Belt & Gold Buckle */}
          <rect x="6" y="19" width="8" height="2" fill="#451a03" />
          <rect x="9" y="19" width="2" height="2" fill="#facc15" />

          {/* --- ARMS & CLIPBOARD --- */}
          {frame >= 4 ? (
            // Idle: Both hands holding clipboard in front
            <g>
              {/* Arms bent holding folder */}
              <rect x="8" y="13" width="2" height="4" fill="#f8fafc" />
              <rect x="10" y="14" width="2" height="3" fill="#d97706" />
              {/* Cyan Digital Clipboard / Folder */}
              <rect x="10" y="13" width="5" height="7" fill="#0284c7" />
              <rect x="11" y="14" width="3" height="5" fill="#ffffff" />
              <rect x="12" y="15" width="2" height="1" fill="#ef4444" />
              <rect x="12" y="17" width="2" height="1" fill="#0284c7" />
            </g>
          ) : (
            // Walking: Arm with folder swings
            <g>
              {/* Left arm swings slightly */}
              <rect x="5" y="13" width="2" height="4" fill="#cbd5e1" />
              <rect x="5" y="17" width="2" height="2" fill="#d97706" />
              {/* Right arm carrying folder */}
              <rect x="11" y="13" width="2" height="5" fill="#f8fafc" />
              <rect x="11" y="18" width="2" height="2" fill="#d97706" />
              {/* Blue folder at hip */}
              <rect
                x={frame === 0 ? '12' : frame === 2 ? '10' : '11'}
                y="16"
                width="4"
                height="6"
                fill="#0284c7"
              />
              <rect
                x={frame === 0 ? '13' : frame === 2 ? '11' : '12'}
                y="17"
                width="2"
                height="4"
                fill="#ffffff"
              />
              <rect
                x={frame === 0 ? '13' : frame === 2 ? '11' : '12'}
                y="18"
                width="2"
                height="1"
                fill="#ef4444"
              />
            </g>
          )}
        </g>

        {/* --- LEGS & BOOTS (Grounded at Baseline y=36) --- */}
        {frame === 0 ? (
          // Walk Frame 0: Left leg forward, right leg trailing
          <g>
            {/* Left Leg (Forward) */}
            <rect x="10" y="21" width="3" height="9" fill="#1e3a8a" />
            <rect x="11" y="30" width="3" height="4" fill="#1e3a8a" />
            <rect x="11" y="34" width="4" height="2" fill="#1c1917" />
            {/* Right Leg (Back) */}
            <rect x="7" y="21" width="3" height="8" fill="#172554" />
            <rect x="6" y="29" width="3" height="4" fill="#172554" />
            <rect x="5" y="33" width="3" height="3" fill="#1c1917" />
          </g>
        ) : frame === 1 ? (
          // Walk Frame 1: Left leg planted, right leg passing forward
          <g>
            {/* Planted Leg */}
            <rect x="8" y="20" width="3" height="14" fill="#1e3a8a" />
            <rect x="8" y="34" width="4" height="2" fill="#1c1917" />
            {/* Passing Leg */}
            <rect x="11" y="20" width="3" height="8" fill="#172554" />
            <rect x="10" y="28" width="3" height="5" fill="#172554" />
            <rect x="9" y="33" width="3" height="2" fill="#1c1917" />
          </g>
        ) : frame === 2 ? (
          // Walk Frame 2: Right leg forward, left leg trailing
          <g>
            {/* Right Leg (Forward) */}
            <rect x="10" y="21" width="3" height="9" fill="#172554" />
            <rect x="11" y="30" width="3" height="4" fill="#172554" />
            <rect x="11" y="34" width="4" height="2" fill="#1c1917" />
            {/* Left Leg (Back) */}
            <rect x="7" y="21" width="3" height="8" fill="#1e3a8a" />
            <rect x="6" y="29" width="3" height="4" fill="#1e3a8a" />
            <rect x="5" y="33" width="3" height="3" fill="#1c1917" />
          </g>
        ) : frame === 3 ? (
          // Walk Frame 3: Right leg planted, left leg passing
          <g>
            {/* Planted Leg */}
            <rect x="9" y="20" width="3" height="14" fill="#172554" />
            <rect x="9" y="34" width="4" height="2" fill="#1c1917" />
            {/* Passing Leg */}
            <rect x="8" y="20" width="3" height="8" fill="#1e3a8a" />
            <rect x="7" y="28" width="3" height="5" fill="#1e3a8a" />
            <rect x="7" y="33" width="3" height="2" fill="#1c1917" />
          </g>
        ) : (
          // Idle (Frames 4 & 5): Both feet together, solidly grounded
          <g>
            <rect x="7" y="21" width="3" height="13" fill="#1e3a8a" />
            <rect x="10" y="21" width="3" height="13" fill="#172554" />
            <rect x="6" y="34" width="4" height="2" fill="#1c1917" />
            <rect x="10" y="34" width="4" height="2" fill="#1c1917" />
          </g>
        )}
      </svg>
    </div>
  );
};

// 2. SEATED OPERATOR (Desk-Occluded Controller, 24x24 pixel grid)
interface SeatedOperatorSpriteProps {
  frame: number; // 0: Neutral, 1: Typing Right, 2: Typing Left, 3: Head Glance
  hasCap?: boolean;
  className?: string;
}

export const SeatedOperatorSprite: React.FC<SeatedOperatorSpriteProps> = ({
  frame,
  hasCap = false,
  className = '',
}) => {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full block"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Office Chair Backrest (Subtle dark ergonomic frame behind) */}
        <rect x="6" y="6" width="12" height="15" rx="1" fill="#0f172a" />
        <rect x="8" y="8" width="8" height="12" fill="#1e293b" />

        {/* --- HEAD & PROFILE --- */}
        <g
          transform={
            frame === 3
              ? 'translate(1, 0)'
              : frame === 1 || frame === 2
              ? 'translate(0, 0.5)'
              : 'translate(0, 0)'
          }
        >
          {hasCap ? (
            // Cap Version (Agra / Central Controller)
            <g>
              <rect x="9" y="3" width="7" height="3" fill="#0f172a" />
              <rect x="11" y="5" width="4" height="1" fill="#eab308" />
              <rect x="10" y="6" width="6" height="1" fill="#1e293b" />
              <rect x="10" y="7" width="5" height="4" fill="#d97706" />
              <rect x="11" y="7" width="3" height="3" fill="#f59e0b" />
              <rect x="13" y="8" width="1" height="1" fill="#0f172a" />
              <rect x="9" y="7" width="1" height="3" fill="#18181b" />
            </g>
          ) : (
            // Headset Version (Delhi Controller / Systems)
            <g>
              <rect x="9" y="3" width="7" height="4" fill="#18181b" />
              <rect x="10" y="7" width="5" height="4" fill="#d97706" />
              <rect x="11" y="7" width="3" height="3" fill="#f59e0b" />
              <rect x="13" y="8" width="1" height="1" fill="#0f172a" />
              {/* Blue Headset Band & Ear Cup */}
              <rect x="8" y="4" width="7" height="1" fill="#38bdf8" />
              <rect x="8" y="5" width="2" height="3" fill="#0284c7" />
              <rect x="8" y="7" width="1" height="1" fill="#38bdf8" />
            </g>
          )}
          {/* White Collar */}
          <rect x="10" y="11" width="4" height="1" fill="#f8fafc" />
        </g>

        {/* --- TORSO & UNIFORM --- */}
        <rect x="7" y="12" width="10" height="7" fill="#f8fafc" />
        <rect x="7" y="12" width="2" height="1" fill="#eab308" />
        <rect x="15" y="12" width="2" height="1" fill="#eab308" />
        <rect x="11" y="12" width="2" height="4" fill="#1e3a8a" />

        {/* --- TYPING ARMS & HANDS (Over Console Keyboard) --- */}
        {frame === 1 ? (
          // Typing Right: Right hand keystroke down, left hand neutral
          <g>
            <rect x="5" y="14" width="3" height="4" fill="#f8fafc" />
            <rect x="6" y="18" width="3" height="2" fill="#d97706" />
            <rect x="16" y="14" width="3" height="4" fill="#f8fafc" />
            <rect x="15" y="19" width="3" height="2" fill="#d97706" />
          </g>
        ) : frame === 2 ? (
          // Typing Left: Left hand keystroke down, right hand neutral
          <g>
            <rect x="5" y="14" width="3" height="4" fill="#f8fafc" />
            <rect x="6" y="19" width="3" height="2" fill="#d97706" />
            <rect x="16" y="14" width="3" height="4" fill="#f8fafc" />
            <rect x="15" y="18" width="3" height="2" fill="#d97706" />
          </g>
        ) : (
          // Neutral Typing / Resting Hands
          <g>
            <rect x="5" y="14" width="3" height="4" fill="#f8fafc" />
            <rect x="6" y="18" width="3" height="2" fill="#d97706" />
            <rect x="16" y="14" width="3" height="4" fill="#f8fafc" />
            <rect x="15" y="18" width="3" height="2" fill="#d97706" />
          </g>
        )}

        {/* Natural Desk Occlusion (Bottom 4 pixels clipped behind desk surface) */}
        <rect x="4" y="21" width="16" height="3" fill="#334155" opacity="0.9" />
        <rect x="7" y="20" width="10" height="1" fill="#0f172a" />
      </svg>
    </div>
  );
};
