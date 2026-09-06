import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface AnimatedCircularProgressBarProps {
  max?: number;
  value: number;
  min?: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export const AnimatedCircularProgressBar: React.FC<AnimatedCircularProgressBarProps> = ({
  max = 100,
  min = 0,
  value,
  gaugePrimaryColor = '#0284c7',
  gaugeSecondaryColor = 'currentColor',
  className,
  size = 110,
  strokeWidth = 9,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn('relative flex items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugeSecondaryColor}
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugePrimaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {/* Centered Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
