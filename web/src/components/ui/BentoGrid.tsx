import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
};

export interface BentoCardProps {
  children?: ReactNode;
  className?: string;
  name?: string;
  icon?: ReactNode;
  description?: string;
  badge?: ReactNode;
  headerAction?: ReactNode;
  glowColor?: 'blue' | 'green' | 'amber' | 'cyan' | 'red' | 'purple';
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className,
  name,
  icon,
  description,
  badge,
  headerAction,
  glowColor = 'blue',
}) => {
  const glowStyles = {
    blue: 'hover:border-blue-400/80 hover:shadow-[0_8px_30px_rgb(2,132,199,0.12)]',
    green: 'hover:border-emerald-400/80 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)]',
    amber: 'hover:border-amber-400/80 hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)]',
    cyan: 'hover:border-cyan-400/80 hover:shadow-[0_8px_30px_rgb(6,182,212,0.12)]',
    red: 'hover:border-rose-400/80 hover:shadow-[0_8px_30px_rgb(239,68,68,0.12)]',
    purple: 'hover:border-purple-400/80 hover:shadow-[0_8px_30px_rgb(124,58,237,0.12)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-4 shadow-sm transition-all duration-300',
        glowStyles[glowColor],
        className
      )}
    >
      {(name || icon || badge || headerAction) && (
        <div className="flex items-center justify-between gap-2 mb-3 z-10">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className="flex items-center justify-center text-slate-700">
                {icon}
              </div>
            )}
            {name && (
              <h3 className="font-pixel text-[9px] text-slate-900 tracking-wider uppercase truncate">
                {name}
              </h3>
            )}
            {badge}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {description && (
        <p className="font-mono text-xs text-slate-500 mb-3 z-10">
          {description}
        </p>
      )}

      <div className="relative z-10 flex-1 flex flex-col">{children}</div>

      {/* Subtle corner highlight gradient */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-slate-100/60 to-transparent blur-xl transition-all duration-500 group-hover:scale-125" />
    </motion.div>
  );
};
