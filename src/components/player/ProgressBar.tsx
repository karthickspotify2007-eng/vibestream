'use client';

import { useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { formatTime } from '@/lib/utils';

export default function ProgressBar({ compact = false }: { compact?: boolean }) {
  const { currentTime, duration, seek, isBuffering } = usePlayerStore();
  const [dragging, setDragging] = useState(false);
  const [dragVal, setDragVal]   = useState(0);

  const pct = duration > 0 ? ((dragging ? dragVal : currentTime) / duration) * 100 : 0;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setDragging(true);
    setDragVal(v);
  }, []);

  const handleRelease = useCallback((e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    seek(Number((e.target as HTMLInputElement).value));
    setDragging(false);
  }, [seek]);

  if (compact) {
    return (
      <div className="w-full h-1 bg-vs-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-vs-green rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full group">
      <span className="text-[11px] text-vs-gray tabular-nums w-8 text-right">
        {formatTime(currentTime)}
      </span>
      <div className="relative flex-1 flex items-center h-4">
        <div className="absolute inset-x-0 h-1 bg-vs-hover rounded-full">
          <div
            className="absolute h-full bg-vs-green rounded-full transition-none"
            style={{ width: `${pct}%` }}
          />
          {isBuffering && (
            <div className="absolute h-full bg-vs-green/30 rounded-full animate-pulse w-full" />
          )}
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={dragging ? dragVal : currentTime}
          onChange={handleChange}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          disabled={!duration}
          className="vs-range absolute inset-0 opacity-0 group-hover:opacity-100 h-4"
          style={{
            background: `linear-gradient(90deg, #1DB954 ${pct}%, #535353 ${pct}%)`,
          }}
        />
      </div>
      <span className="text-[11px] text-vs-gray tabular-nums w-8">
        {formatTime(duration)}
      </span>
    </div>
  );
}
