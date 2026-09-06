import React from 'react';
import { cn } from '../../lib/utils';

export type SignalAspect = 'green' | 'amber' | 'red';

interface PulsingSignalPipProps {
  aspect: SignalAspect;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  pulse?: boolean;
  className?: string;
}

export const PulsingSignalPip: React.FC<PulsingSignalPipProps> = ({
  aspect,
  size = 'md',
  label,
  pulse = true,
  className,
}) => {
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const pingSizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const colorMap = {
    green: {
      bg: 'bg-emerald-500',
      shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      ping: 'bg-emerald-400',
      text: 'text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-500',
      shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      ping: 'bg-amber-400',
      text: 'text-amber-700',
    },
    red: {
      bg: 'bg-rose-500',
      shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
      ping: 'bg-rose-400',
      text: 'text-rose-700',
    },
  };

  const c = colorMap[aspect];

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex rounded-full opacity-75 animate-ping',
              pingSizeMap[size],
              c.ping
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full transition-all duration-300',
            sizeMap[size],
            c.bg,
            c.shadow
          )}
        />
      </span>
      {label && (
        <span className={cn('font-mono text-xs font-semibold tracking-wider', c.text)}>
          {label}
        </span>
      )}
    </div>
  );
};
