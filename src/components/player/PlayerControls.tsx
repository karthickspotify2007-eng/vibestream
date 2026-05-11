'use client';

import type { RepeatMode } from '@/types/music';

type PlayerControlsProps = {
  isPlaying: boolean;
  isBuffering: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
};

type IconProps = {
  className?: string;
};

const PlayIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

const PauseIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
  </svg>
);

const PreviousIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M6 5h2v14H6V5Zm13 1v12l-9-6 9-6Z" />
  </svg>
);

const NextIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M16 5h2v14h-2V5ZM5 6l9 6-9 6V6Z" />
  </svg>
);

const ShuffleIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
    <path d="M4 7h2.7c2.8 0 4.4 2.2 5.9 5s3.1 5 5.9 5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 5l2 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 15l2 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 17h2.8c1.4 0 2.5-.6 3.5-1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 8.7C15.1 7.6 16.2 7 17.6 7H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const RepeatIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
    <path d="M7 7h9.5c2 0 3.5 1.5 3.5 3.5S18.5 14 16.5 14H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 17H7.5C5.5 17 4 15.5 4 13.5S5.5 10 7.5 10H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 14l-3 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = ({ className }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className ?? ''} animate-spin`} fill="none">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" opacity="0.25" />
    <path d="M20 12a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const controlButtonClass =
  'grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:border-aqua-300/50 hover:text-aqua-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aqua-300';

export default function PlayerControls({
  isPlaying,
  isBuffering,
  shuffle,
  repeatMode,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onCycleRepeat,
}: PlayerControlsProps) {
  const repeatLabel = repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Repeat all' : 'Repeat off';

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
        title={shuffle ? 'Shuffle on' : 'Shuffle off'}
        onClick={onToggleShuffle}
        className={`${controlButtonClass} ${shuffle ? 'border-aqua-300/70 text-aqua-300 shadow-glow' : ''}`}
      >
        <ShuffleIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label="Previous song"
        title="Previous"
        onClick={onPrevious}
        className={controlButtonClass}
      >
        <PreviousIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        aria-pressed={isPlaying}
        title={isPlaying ? 'Pause' : 'Play'}
        onClick={onPlayPause}
        className="grid h-12 w-12 place-items-center rounded-full bg-aqua-400 text-ink-950 shadow-[0_0_34px_rgba(37,217,195,0.42)] transition hover:bg-aqua-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-300"
      >
        {isBuffering ? (
          <SpinnerIcon className="h-5 w-5" />
        ) : isPlaying ? (
          <PauseIcon className="h-5 w-5" />
        ) : (
          <PlayIcon className="ml-0.5 h-5 w-5" />
        )}
      </button>

      <button
        type="button"
        aria-label="Next song"
        title="Next"
        onClick={onNext}
        className={controlButtonClass}
      >
        <NextIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label={repeatLabel}
        title={repeatLabel}
        onClick={onCycleRepeat}
        className={`${controlButtonClass} ${repeatMode !== 'off' ? 'border-ember-300/70 text-ember-300 shadow-[0_0_28px_rgba(245,169,73,0.22)]' : ''}`}
      >
        <span className="relative">
          <RepeatIcon className="h-4 w-4" />
          {repeatMode === 'one' && (
            <span className="absolute -bottom-1 -right-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-ember-300 text-[9px] font-black leading-none text-ink-950">
              1
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
