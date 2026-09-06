import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ShinyButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  className?: string;
  variant?: 'emerald' | 'blue' | 'amber' | 'crimson';
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className,
  variant = 'emerald',
  ...props
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
    amber: 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20',
    crimson: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      {...props}
      className={cn(
        'relative radial-gradient group flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 font-medium transition-all shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      {/* 21st.dev shimmer sweep */}
      <span
        style={{
          mask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))',
          maskComposite: 'exclude',
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:200%_100%] transition-all [animation:shimmer_3s_infinite]"
      />
    </motion.button>
  );
};
