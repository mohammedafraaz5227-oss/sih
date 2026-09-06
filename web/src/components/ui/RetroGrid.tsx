import React from 'react';
import { cn } from '../../lib/utils';

export interface RetroGridProps {
  className?: string;
  angle?: number;
}

export const RetroGrid: React.FC<RetroGridProps> = ({
  className,
  angle = 65,
}) => {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden opacity-30 [perspective:200px]',
        className
      )}
    >
      {/* Grid */}
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div
          className={cn(
            'animate-grid',
            '[background-repeat:repeat] [background-size:40px_40px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:200vw]',
            '[background-image:linear-gradient(to_right,rgba(15,23,42,0.12)_1px,transparent_0),linear-gradient(to_bottom,rgba(15,23,42,0.12)_1px,transparent_0)]',
            'dark:[background-image:linear-gradient(to_right,rgba(0,240,255,0.08)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,240,255,0.08)_1px,transparent_0)]'
          )}
        />
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f1f5f9] via-transparent to-transparent dark:from-[#060a12]" />
    </div>
  );
};
