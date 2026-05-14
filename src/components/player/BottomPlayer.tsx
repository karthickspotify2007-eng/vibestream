'use client';

import { useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Plus, Volume2, VolumeX, Volume1, Volume, ListMusic, Maximize2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useUIStore } from '@/store/uiStore';
import AnimatedEqualizer from '@/components/player/AnimatedEqualizer';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

function ProgressBar() {
  const { currentTime, duration, seek, isBuffering } = usePlayerStore();
  const [dragging, setDragging] = useState(false);
  const [dragVal, setDragVal] = useState(0);
  const pct = duration > 0 ? ((dragging ? dragVal : currentTime) / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full group">
      <span className="text-[11px] text-vs-gray tabular-nums w-8 text-right shrink-0">
        {formatTime(currentTime)}
      </span>
      <div className="relative flex-1 h-1 rounded-full bg-vs-gray-dark group-hover:h-[5px] transition-all">
        <div
          className="absolute h-full rounded-full bg-vs-white group-hover:bg-vs-green transition-colors"
          style={{ width: `${pct}%` }}
        />
        {isBuffering && (
          <div className="absolute inset-0 rounded-full bg-vs-white/20 animate-pulse" />
        )}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={dragging ? dragVal : currentTime}
          onChange={(e) => { setDragging(true); setDragVal(+e.target.value); }}
          onMouseUp={(e) => { seek(+(e.target as HTMLInputElement).value); setDragging(false); }}
          onTouchEnd={(e) => { seek(+(e.target as HTMLInputElement).value); setDragging(false); }}
          disabled={!duration}
          className="vs-range absolute inset-0 opacity-0 group-hover:opacity-100 h-full cursor-pointer"
        />
      </div>
      <span className="text-[11px] text-vs-gray tabular-nums w-8 shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
}

function VolumeSlider() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const pct = isMuted ? 0 : volume * 100;
  const VIcon = isMuted || volume === 0 ? VolumeX : volume < 0.35 ? Volume : volume < 0.7 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-1.5 group w-32">
      <button onClick={toggleMute} className="text-vs-gray hover:text-vs-white transition-colors shrink-0">
        <VIcon className="h-4 w-4" />
      </button>
      <div className="relative flex-1 h-1 rounded-full bg-vs-gray-dark group-hover:h-[5px] transition-all">
        <div
          className="absolute h-full rounded-full bg-vs-white group-hover:bg-vs-green transition-colors"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range" min={0} max={1} step={0.02}
          value={isMuted ? 0 : volume}
          onChange={(e) => { if (isMuted) toggleMute(); setVolume(+e.target.value); }}
          className="vs-range vs-range-always absolute inset-0 opacity-0 group-hover:opacity-100 h-full cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function BottomPlayer() {
  const {
    currentSong, isPlaying, isBuffering, shuffle, repeatMode,
    togglePlay, next, previous, toggleShuffle, cycleRepeat, toggleQueue, toggleFullscreen,
  } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const { openAddToPlaylist } = useUIStore();

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);

  return (
    <motion.div
      initial={{ y: 90 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 h-[90px] glass-player flex items-center px-4 gap-4"
    >
      {/* ── Left: art + info + like ─────────────────── */}
      <div className="flex items-center gap-3 w-[30%] min-w-0">
        <div
          className="relative h-14 w-14 rounded shrink-0 cursor-pointer overflow-hidden"
          onClick={toggleFullscreen}
        >
          <Image
            src={currentSong.coverUrl}
            alt={currentSong.title}
            fill
            className="object-cover"
            unoptimized
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <AnimatedEqualizer />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <button
            onClick={toggleFullscreen}
            className="text-sm font-semibold text-vs-white truncate block hover:underline text-left w-full"
          >
            {currentSong.title}
          </button>
          <p className="text-xs text-vs-gray truncate">{currentSong.artist}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => openAddToPlaylist(currentSong)}
            className="p-1.5 text-vs-gray hover:text-vs-white transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleLike(currentSong)}
            className={cn('p-1.5 transition-all hover:scale-110', liked ? 'text-vs-green' : 'text-vs-gray hover:text-vs-white')}
          >
            <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── Center: controls + progress ──────────────── */}
      <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 max-w-[500px] mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={cn('p-1.5 transition-colors hover:scale-110', shuffle ? 'text-vs-green' : 'text-vs-gray hover:text-vs-white')}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            onClick={previous}
            className="p-1.5 text-vs-gray hover:text-vs-white transition-colors hover:scale-110"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-vs-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isBuffering
              ? <Loader2 className="h-4 w-4 text-black animate-spin" />
              : isPlaying
                ? <Pause className="h-4 w-4 text-black fill-black" />
                : <Play className="h-4 w-4 text-black fill-black ml-0.5" />
            }
          </button>
          <button
            onClick={next}
            className="p-1.5 text-vs-gray hover:text-vs-white transition-colors hover:scale-110"
          >
            <SkipForward className="h-5 w-5" />
          </button>
          <button
            onClick={cycleRepeat}
            className={cn(
              'p-1.5 transition-colors hover:scale-110',
              repeatMode !== 'off' ? 'text-vs-green' : 'text-vs-gray hover:text-vs-white'
            )}
          >
            {repeatMode === 'one'
              ? <Repeat1 className="h-4 w-4" />
              : <Repeat className="h-4 w-4" />
            }
          </button>
        </div>
        <ProgressBar />
      </div>

      {/* ── Right: queue + volume + fullscreen ─────── */}
      <div className="flex items-center gap-2 w-[30%] justify-end shrink-0">
        <button
          onClick={toggleQueue}
          className="p-1.5 text-vs-gray hover:text-vs-white transition-colors"
          title="Queue"
        >
          <ListMusic className="h-4 w-4" />
        </button>
        <VolumeSlider />
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-vs-gray hover:text-vs-white transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
