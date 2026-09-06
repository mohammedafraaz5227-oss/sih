import React from 'react';

interface SceneryProps {
  className?: string;
  size?: number;
}

/**
 * Pixel Art India Gate (New Delhi Western Terminus Landmark)
 */
export const PixelIndiaGate: React.FC<SceneryProps> = ({ className = '', size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <title>India Gate (New Delhi Landmark)</title>
    {/* Base Pedestal */}
    <rect x="2" y="21" width="20" height="2" fill="#d97706" />
    <rect x="3" y="19" width="18" height="2" fill="#b45309" />
    {/* Left Pillar */}
    <rect x="4" y="9" width="4" height="10" fill="#f59e0b" />
    <rect x="5" y="10" width="2" height="8" fill="#d97706" />
    {/* Right Pillar */}
    <rect x="16" y="9" width="4" height="10" fill="#f59e0b" />
    <rect x="17" y="10" width="2" height="8" fill="#d97706" />
    {/* Arch Portal Opening (Transparent / Dark) */}
    <rect x="8" y="12" width="8" height="9" fill="#78350f" />
    <rect x="9" y="10" width="6" height="2" fill="#78350f" />
    <rect x="10" y="9" width="4" height="1" fill="#78350f" />
    {/* Arch Top Lintels */}
    <rect x="3" y="6" width="18" height="3" fill="#f59e0b" />
    <rect x="4" y="7" width="16" height="1" fill="#fbbf24" />
    {/* Upper Attic Tier */}
    <rect x="5" y="4" width="14" height="2" fill="#d97706" />
    <rect x="7" y="2" width="10" height="2" fill="#b45309" />
    {/* Top Domelet / Finial */}
    <rect x="11" y="1" width="2" height="1" fill="#f59e0b" />
  </svg>
);

/**
 * Pixel Art Taj Mahal (Agra Cantt Southern Terminus Landmark)
 */
export const PixelTajMahal: React.FC<SceneryProps> = ({ className = '', size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <title>Taj Mahal (Agra Landmark)</title>
    {/* Plinth Base */}
    <rect x="1" y="21" width="22" height="2" fill="#cbd5e1" />
    {/* Left Minaret */}
    <rect x="2" y="7" width="2" height="14" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
    <polygon points="3,4 2,7 4,7" fill="#e2e8f0" />
    <rect x="1.5" y="11" width="3" height="1" fill="#64748b" />
    <rect x="1.5" y="16" width="3" height="1" fill="#64748b" />
    {/* Right Minaret */}
    <rect x="20" y="7" width="2" height="14" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
    <polygon points="21,4 20,7 22,7" fill="#e2e8f0" />
    <rect x="19.5" y="11" width="3" height="1" fill="#64748b" />
    <rect x="19.5" y="16" width="3" height="1" fill="#64748b" />
    {/* Main Mausoleum Base */}
    <rect x="5" y="11" width="14" height="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
    {/* Main Center Arch (Iwan) */}
    <rect x="9" y="14" width="6" height="7" fill="#334155" />
    <rect x="10" y="13" width="4" height="1" fill="#334155" />
    {/* Side Arches */}
    <rect x="6" y="13" width="2" height="3" fill="#64748b" />
    <rect x="6" y="17" width="2" height="3" fill="#64748b" />
    <rect x="16" y="13" width="2" height="3" fill="#64748b" />
    <rect x="16" y="17" width="2" height="3" fill="#64748b" />
    {/* Side Domes (Chhatris) */}
    <rect x="6" y="8" width="3" height="3" fill="#e2e8f0" />
    <rect x="7" y="7" width="1" height="1" fill="#cbd5e1" />
    <rect x="15" y="8" width="3" height="3" fill="#e2e8f0" />
    <rect x="16" y="7" width="1" height="1" fill="#cbd5e1" />
    {/* Central Onion Dome */}
    <rect x="9" y="7" width="6" height="4" fill="#ffffff" />
    <rect x="10" y="5" width="4" height="2" fill="#ffffff" />
    <rect x="11" y="3" width="2" height="2" fill="#ffffff" />
    <rect x="11.5" y="1" width="1" height="2" fill="#f59e0b" />
  </svg>
);

/**
 * Pixel Art Yamuna River Bridge Girder
 */
export const PixelYamunaBridge: React.FC<SceneryProps> = ({ className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <title>Yamuna River Bridge Crossing</title>
    {/* Steel Truss Girders */}
    <rect x="1" y="2" width="22" height="2" fill="#64748b" />
    <rect x="1" y="9" width="22" height="2" fill="#475569" />
    {/* Diagonal Struts */}
    <line x1="2" y1="9" x2="8" y2="4" stroke="#64748b" strokeWidth="1.5" />
    <line x1="8" y1="4" x2="14" y2="9" stroke="#64748b" strokeWidth="1.5" />
    <line x1="14" y1="9" x2="20" y2="4" stroke="#64748b" strokeWidth="1.5" />
    {/* Bridge Piers */}
    <rect x="3" y="10" width="3" height="4" fill="#334155" />
    <rect x="18" y="10" width="3" height="4" fill="#334155" />
    {/* River Waves */}
    <rect x="0" y="13" width="24" height="3" fill="#0284c7" opacity={0.8} />
    <rect x="2" y="14" width="4" height="1" fill="#7dd3fc" />
    <rect x="10" y="14" width="5" height="1" fill="#7dd3fc" />
    <rect x="18" y="14" width="4" height="1" fill="#7dd3fc" />
  </svg>
);

/**
 * Pixel Art Indian Railways WAP-7 Locomotive (Red / Cream / Blue Livery)
 */
export const PixelWap7: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => (
  <svg
    width={size}
    height={Math.round(size * 0.45)}
    viewBox="0 0 32 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <title>Indian Railways WAP-7 Locomotive</title>
    {/* Pantograph */}
    <line x1="8" y1="3" x2="11" y2="1" stroke="#94a3b8" strokeWidth="0.8" />
    <line x1="11" y1="1" x2="15" y2="3" stroke="#94a3b8" strokeWidth="0.8" />
    <rect x="10" y="0.5" width="6" height="0.8" fill="#ef4444" />
    <rect x="12" y="3" width="2" height="1" fill="#334155" />

    {/* Loco Roof */}
    <rect x="4" y="4" width="25" height="1.5" fill="#b91c1c" />
    {/* Loco Cab / Body (Cream) */}
    <rect x="3" y="5.5" width="27" height="4.5" fill="#fef08a" />
    {/* IR Tricolor Blue Stripe */}
    <rect x="3" y="8" width="27" height="1" fill="#1d4ed8" />
    <rect x="3" y="9" width="27" height="1.5" fill="#b91c1c" />
    {/* Front Cabs (Aerodynamic slant) */}
    <rect x="2" y="6" width="2" height="3" fill="#fef08a" />
    <rect x="1" y="7.5" width="2" height="2" fill="#b91c1c" />
    {/* Cab Windshields */}
    <rect x="3" y="6" width="3" height="1.5" fill="#0f172a" />
    <rect x="26" y="6" width="3" height="1.5" fill="#0f172a" />
    {/* Side Machine Windows */}
    <rect x="10" y="6" width="2" height="1.5" fill="#475569" />
    <rect x="15" y="6" width="2" height="1.5" fill="#475569" />
    <rect x="20" y="6" width="2" height="1.5" fill="#475569" />
    {/* Headlight */}
    <rect x="0.5" y="7" width="1" height="1.5" fill="#fef08a" />
    {/* Underframe & Bogie Wheels */}
    <rect x="1" y="10.5" width="30" height="1" fill="#1e293b" />
    <circle cx="5" cy="12" r="1.5" fill="#475569" />
    <circle cx="9" cy="12" r="1.5" fill="#475569" />
    <circle cx="13" cy="12" r="1.5" fill="#475569" />
    <circle cx="19" cy="12" r="1.5" fill="#475569" />
    <circle cx="23" cy="12" r="1.5" fill="#475569" />
    <circle cx="27" cy="12" r="1.5" fill="#475569" />
  </svg>
);

/**
 * Pixel Art Vande Bharat Express (Train 18 Aerodynamic Nose)
 */
export const PixelVandeBharat: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg
    width={size}
    height={Math.round(size * 0.42)}
    viewBox="0 0 34 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <title>Vande Bharat Express (Train 18)</title>
    {/* Aerodynamic Roof */}
    <rect x="6" y="4" width="27" height="1" fill="#e2e8f0" />
    {/* White Body */}
    <rect x="3" y="5" width="30" height="5.5" fill="#ffffff" />
    {/* Nose Slant */}
    <polygon points="4,5 0,9.5 4,9.5" fill="#ffffff" />
    {/* Deep Blue Speed Stripe */}
    <rect x="3" y="7.5" width="30" height="1.8" fill="#1e3a8a" />
    <polygon points="3,7.5 0,9.5 3,9.5" fill="#1e3a8a" />
    {/* Black Tinted Windshield & Continuous Windows */}
    <polygon points="3,5.5 1,8 4,8" fill="#090d16" />
    <rect x="5" y="6" width="3" height="1.5" fill="#090d16" />
    <rect x="10" y="6" width="6" height="1.5" fill="#090d16" />
    <rect x="18" y="6" width="6" height="1.5" fill="#090d16" />
    <rect x="26" y="6" width="6" height="1.5" fill="#090d16" />
    {/* Twin Headlights */}
    <rect x="0.5" y="8.5" width="1.5" height="0.8" fill="#facc15" />
    {/* Wheels */}
    <rect x="1" y="10.5" width="32" height="1" fill="#0f172a" />
    <circle cx="6" cy="12" r="1.3" fill="#334155" />
    <circle cx="11" cy="12" r="1.3" fill="#334155" />
    <circle cx="23" cy="12" r="1.3" fill="#334155" />
    <circle cx="28" cy="12" r="1.3" fill="#334155" />
  </svg>
);

/**
 * Pixel Art OHE Electric Traction Mast (25kV AC Catenary)
 */
export const PixelOheMast: React.FC<SceneryProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <title>25kV AC OHE Electric Mast</title>
    {/* Vertical Mast Pole */}
    <rect x="3" y="4" width="2" height="16" fill="#475569" />
    <rect x="2" y="18" width="4" height="2" fill="#0f172a" />
    {/* Cantilever Arm */}
    <rect x="3" y="5" width="10" height="1.5" fill="#64748b" />
    <line x1="4" y1="8" x2="12" y2="5" stroke="#64748b" strokeWidth="1" />
    {/* Insulator */}
    <rect x="11" y="6.5" width="2" height="2" fill="#78350f" />
    {/* Catenary Wire & Contact Wire Drop */}
    <line x1="12" y1="8.5" x2="12" y2="11" stroke="#94a3b8" strokeWidth="0.8" />
    <rect x="10" y="11" width="4" height="0.6" fill="#f59e0b" />
  </svg>
);
