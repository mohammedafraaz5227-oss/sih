import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const PixelTrain: React.FC<IconProps> = ({ className = '', size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Locomotive Roof */}
    <rect x="2" y="2" width="12" height="2" fill={color} />
    {/* Body */}
    <rect x="1" y="4" width="14" height="7" fill={color} />
    {/* Windows */}
    <rect x="3" y="5" width="3" height="3" fill="#090d16" />
    <rect x="7" y="5" width="2" height="3" fill="#090d16" />
    <rect x="10" y="5" width="3" height="3" fill="#090d16" />
    {/* Headlight */}
    <rect x="14" y="8" width="1" height="2" fill="#facc15" />
    {/* Wheels */}
    <rect x="2" y="11" width="3" height="2" fill="#334155" />
    <rect x="6" y="11" width="3" height="2" fill="#334155" />
    <rect x="11" y="11" width="3" height="2" fill="#334155" />
    <rect x="0" y="13" width="16" height="1" fill="#64748b" />
  </svg>
);

export const PixelTrack: React.FC<IconProps> = ({ className = '', size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Rails */}
    <rect x="0" y="3" width="16" height="2" fill="#94a3b8" />
    <rect x="0" y="11" width="16" height="2" fill="#94a3b8" />
    {/* Sleepers / Ties */}
    <rect x="2" y="1" width="2" height="14" fill={color} />
    <rect x="7" y="1" width="2" height="14" fill={color} />
    <rect x="12" y="1" width="2" height="14" fill={color} />
  </svg>
);

export const PixelStation: React.FC<IconProps> = ({ className = '', size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Station Clock Tower Roof */}
    <polygon points="8,1 5,4 11,4" fill="#f59e0b" />
    {/* Tower */}
    <rect x="6" y="4" width="4" height="4" fill={color} />
    {/* Clock */}
    <rect x="7" y="5" width="2" height="2" fill="#ffffff" />
    {/* Station Depot */}
    <rect x="2" y="8" width="12" height="7" fill={color} />
    {/* Doors */}
    <rect x="7" y="11" width="2" height="4" fill="#090d16" />
    {/* Windows */}
    <rect x="3" y="10" width="2" height="2" fill="#facc15" />
    <rect x="11" y="10" width="2" height="2" fill="#facc15" />
  </svg>
);

export const PixelSignal: React.FC<{ aspect?: 'green' | 'amber' | 'red'; size?: number; className?: string }> = ({
  aspect = 'green',
  size = 20,
  className = '',
}) => {
  const isGreen = aspect === 'green';
  const isAmber = aspect === 'amber';
  const isRed = aspect === 'red';

  return (
    <svg width={size} height={size} viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Signal Post */}
      <rect x="5" y="10" width="2" height="6" fill="#64748b" />
      {/* Housing */}
      <rect x="2" y="1" width="8" height="10" fill="#0f172a" stroke="#000" strokeWidth="1" />
      {/* Red Lamp */}
      <rect x="4" y="2" width="4" height="2" fill={isRed ? '#ef4444' : '#450a0a'} className={isRed ? 'signal-active-red' : ''} />
      {/* Amber Lamp */}
      <rect x="4" y="5" width="4" height="2" fill={isAmber ? '#eab308' : '#422006'} className={isAmber ? 'signal-active-amber' : ''} />
      {/* Green Lamp */}
      <rect x="4" y="8" width="4" height="2" fill={isGreen ? '#22c55e' : '#052e16'} className={isGreen ? 'signal-active-green' : ''} />
    </svg>
  );
};

export const PixelWrench: React.FC<IconProps> = ({ className = '', size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="10" y="1" width="4" height="2" fill={color} />
    <rect x="13" y="3" width="2" height="3" fill={color} />
    <rect x="8" y="3" width="3" height="3" fill={color} />
    <rect x="7" y="6" width="3" height="3" fill={color} />
    <rect x="5" y="8" width="3" height="3" fill={color} />
    <rect x="3" y="10" width="3" height="3" fill={color} />
    <rect x="1" y="12" width="3" height="3" fill={color} />
    <rect x="2" y="14" width="2" height="1" fill={color} />
  </svg>
);

export const PixelCpu: React.FC<IconProps> = ({ className = '', size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Body */}
    <rect x="3" y="3" width="10" height="10" fill={color} />
    <rect x="5" y="5" width="6" height="6" fill="#090d16" />
    <rect x="7" y="7" width="2" height="2" fill="#06b6d4" />
    {/* Pins */}
    <rect x="5" y="1" width="2" height="2" fill="#f59e0b" />
    <rect x="9" y="1" width="2" height="2" fill="#f59e0b" />
    <rect x="5" y="13" width="2" height="2" fill="#f59e0b" />
    <rect x="9" y="13" width="2" height="2" fill="#f59e0b" />
    <rect x="1" y="5" width="2" height="2" fill="#f59e0b" />
    <rect x="1" y="9" width="2" height="2" fill="#f59e0b" />
    <rect x="13" y="5" width="2" height="2" fill="#f59e0b" />
    <rect x="13" y="9" width="2" height="2" fill="#f59e0b" />
  </svg>
);

export const PixelAlert: React.FC<IconProps> = ({ className = '', size = 20, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="8,1 1,14 15,14" fill="#000" />
    <polygon points="8,3 3,13 13,13" fill={color} />
    <rect x="7" y="6" width="2" height="4" fill="#000" />
    <rect x="7" y="11" width="2" height="1" fill="#000" />
  </svg>
);
