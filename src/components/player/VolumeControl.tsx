'use client';

import { ChangeEvent } from 'react';

type VolumeControlProps = {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
};

const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
    <path
      d="M4 9.5v5h4l5 4.5V5L8 9.5H4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {muted ? (
      <>
        <path d="M17 9l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M21 9l-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M16 9c1 1 1 5 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18.5 6.5c2.5 2.7 2.5 8.3 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    )}
  </svg>
);

export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const effectiveVolume = isMuted ? 0 : volume;
  const volumeProgress = Math.round(effectiveVolume * 100);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(event.currentTarget.value));
  };

  return (
    <div className="flex min-w-[154px] items-center gap-2">
      <button
        type="button"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        title={isMuted ? 'Unmute' : 'Mute'}
        onClick={onToggleMute}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 transition hover:border-aqua-300/50 hover:text-aqua-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aqua-300"
      >
        <VolumeIcon muted={isMuted || volume === 0} />
      </button>

      <label className="sr-only" htmlFor="vibestream-volume">
        Volume
      </label>
      <input
        id="vibestream-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={effectiveVolume}
        onChange={handleVolumeChange}
        className="vibestream-range h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(90deg, #f5a949 ${volumeProgress}%, rgba(255,255,255,0.14) ${volumeProgress}%)`,
        }}
      />

      <span className="w-9 text-right text-[11px] font-semibold text-white/50">
        {volumeProgress}%
      </span>
    </div>
  );
}
