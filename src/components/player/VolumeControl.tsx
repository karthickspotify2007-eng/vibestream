'use client';

import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export default function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const eff = isMuted ? 0 : volume;
  const pct  = Math.round(eff * 100);

  const Icon = isMuted || volume === 0
    ? VolumeX
    : volume < 0.33
    ? Volume
    : volume < 0.66
    ? Volume1
    : Volume2;

  return (
    <div className="flex items-center gap-2 min-w-[130px] group">
      <button
        onClick={toggleMute}
        className="text-vs-gray hover:text-vs-white transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <Icon className="h-4 w-4" />
      </button>
      <div className="relative flex-1 flex items-center h-4">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={eff}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="vs-range h-1 w-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #1DB954 ${pct}%, #535353 ${pct}%)`,
          }}
          aria-label="Volume"
        />
      </div>
      <span className="text-[10px] text-vs-gray-dark tabular-nums w-7">{pct}%</span>
    </div>
  );
}
