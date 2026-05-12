'use client';

import { cn } from '@/lib/utils';

export default function AnimatedEqualizer({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end gap-[2px] h-4', className)}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'w-[3px] rounded-sm bg-vs-green eq-bar-' + i
          )}
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );
}
