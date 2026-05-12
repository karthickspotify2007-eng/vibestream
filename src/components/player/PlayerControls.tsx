'use client';

import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';

export default function PlayerControls({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const {
    isPlaying, isBuffering, shuffle, repeatMode,
    togglePlay, next, previous, toggleShuffle, cycleRepeat, currentSong,
  } = usePlayerStore();

  const iconSm  = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnBase = 'transition-all duration-150 text-vs-gray hover:text-vs-white hover:scale-105 active:scale-95';
  const playBtn = cn(
    'grid place-items-center rounded-full bg-vs-white text-vs-black transition-transform hover:scale-105 active:scale-95',
    size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  );

  return (
    <div className={cn('flex items-center gap-3', size === 'sm' ? 'gap-2' : 'gap-4')}>
      <button
        aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
        onClick={toggleShuffle}
        className={cn(btnBase, shuffle && 'text-vs-green')}
      >
        <Shuffle className={iconSm} />
      </button>

      <button
        aria-label="Previous"
        onClick={previous}
        disabled={!currentSong}
        className={cn(btnBase, 'disabled:opacity-40')}
      >
        <SkipBack className={iconSm} fill="currentColor" />
      </button>

      <button
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={togglePlay}
        disabled={!currentSong}
        className={cn(playBtn, 'disabled:opacity-40')}
      >
        {isBuffering
          ? <Loader2 className={cn(iconSm, 'animate-spin')} />
          : isPlaying
          ? <Pause  className={iconSm} fill="currentColor" />
          : <Play   className={cn(iconSm, 'ml-0.5')} fill="currentColor" />
        }
      </button>

      <button
        aria-label="Next"
        onClick={next}
        disabled={!currentSong}
        className={cn(btnBase, 'disabled:opacity-40')}
      >
        <SkipForward className={iconSm} fill="currentColor" />
      </button>

      <button
        aria-label="Repeat"
        onClick={cycleRepeat}
        className={cn(btnBase, repeatMode !== 'off' && 'text-vs-green')}
      >
        {repeatMode === 'one'
          ? <Repeat1 className={iconSm} />
          : <Repeat  className={iconSm} />
        }
      </button>
    </div>
  );
}
