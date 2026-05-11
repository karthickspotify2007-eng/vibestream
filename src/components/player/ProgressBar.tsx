'use client';

import { ChangeEvent } from 'react';
import { formatTime } from '@/store/playerStore';

type ProgressBarProps = {
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  onSeek: (time: number) => void;
};

export default function ProgressBar({ currentTime, duration, isBuffering, onSeek }: ProgressBarProps) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeCurrentTime = Math.min(Math.max(currentTime, 0), safeDuration || currentTime);
  const progress = safeDuration > 0 ? (safeCurrentTime / safeDuration) * 100 : 0;

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(event.currentTarget.value));
  };

  return (
    <div className="w-full min-w-0">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-white/55">
        <span>{formatTime(safeCurrentTime)}</span>
        <span className="text-aqua-300/80">{isBuffering ? 'Buffering' : formatTime(safeDuration)}</span>
      </div>

      <label className="sr-only" htmlFor="vibestream-progress">
        Seek audio position
      </label>
      <input
        id="vibestream-progress"
        type="range"
        min="0"
        max={safeDuration || 0}
        step="0.1"
        value={safeDuration ? safeCurrentTime : 0}
        onChange={handleSeek}
        disabled={!safeDuration}
        className="vibestream-range h-2 w-full cursor-pointer appearance-none rounded-full outline-none disabled:cursor-not-allowed disabled:opacity-45"
        style={{
          background: `linear-gradient(90deg, #25d9c3 ${progress}%, rgba(255,255,255,0.14) ${progress}%)`,
        }}
      />
    </div>
  );
}
