'use client';

import React from 'react';
import { ChevronDown, Heart, MoreHorizontal, ListMusic, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import { cn } from '@/lib/utils';

// Fixed waveform heights based on sine curve — no random rerenders
const WAVE_HEIGHTS = Array.from({ length: 24 }, (_, i) =>
  8 + Math.abs(Math.sin(i * 0.55)) * 24
);
const WAVE_DELAYS = Array.from({ length: 24 }, (_, i) =>
  (i * 0.06) % 0.8
);
const WAVE_DURATIONS = Array.from({ length: 24 }, (_, i) =>
  0.45 + ((i * 0.13) % 0.55)
);

export default function FullscreenPlayer() {
  const { showFullscreen, currentSong, isPlaying, toggleFullscreen, toggleQueue } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const liked = currentSong ? isLiked(currentSong.id) : false;

  return (
    <AnimatePresence>
      {showFullscreen && currentSong && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 300 }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden select-none"
        >
          {/* ── Blurred cover background ─────────────────────────── */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Base dark layer */}
            <div className="absolute inset-0 bg-[#070710]" />
            {/* Blurred album art — creates a moody, song-specific atmosphere */}
            <div
              className="absolute inset-0 scale-125"
              style={{
                backgroundImage:   `url(${currentSong.coverUrl})`,
                backgroundSize:    'cover',
                backgroundPosition:'center',
                filter:            'blur(60px) saturate(1.4)',
                opacity:           0.25,
              }}
            />
            {/* Gradient vignette overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.75) 100%)',
              }}
            />
          </div>

          {/* ── Header ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 pt-12 pb-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 active:scale-95 transition-all"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">
                Now Playing
              </p>
              <p className="text-sm font-bold text-white/90 mt-0.5 truncate max-w-[180px]">
                {currentSong.album}
              </p>
            </div>
            <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 active:scale-95 transition-all">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* ── Vinyl Disc ───────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 min-h-0">
            <motion.div
              key={currentSong.id}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              className="relative"
            >
              {/* Outer glow ring — brightens when playing */}
              <div
                className={cn(
                  'rounded-full transition-all duration-700',
                  isPlaying
                    ? 'shadow-[0_0_50px_rgba(29,185,84,0.25),0_0_100px_rgba(29,185,84,0.12),0_24px_80px_rgba(0,0,0,0.8)]'
                    : 'shadow-[0_24px_80px_rgba(0,0,0,0.8)]'
                )}
              >
                {/* Spinning disc */}
                <div
                  className="w-72 h-72 rounded-full overflow-hidden relative"
                  style={{
                    animation:          'disc-spin 8s linear infinite',
                    animationPlayState: isPlaying ? 'running' : 'paused',
                  }}
                >
                  {/* Album art */}
                  <Image
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                  {/* Vinyl groove overlay */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%,
                        transparent 0%,
                        transparent 28%,
                        rgba(0,0,0,0.08) 30%,
                        transparent 32%,
                        rgba(0,0,0,0.06) 38%,
                        transparent 40%,
                        rgba(0,0,0,0.08) 48%,
                        transparent 50%,
                        rgba(0,0,0,0.12) 60%,
                        rgba(0,0,0,0.25) 72%,
                        rgba(0,0,0,0.55) 88%,
                        rgba(0,0,0,0.75) 100%
                      )`,
                    }}
                  />
                  {/* Gloss sheen */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
                    }}
                  />
                  {/* Center spindle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-[#0d0d0d] border-2 border-[#2a2a2a] shadow-inner flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3a3a3a]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Waveform (shows when playing) ─────────────────── */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="flex items-end gap-[3px] h-9"
                >
                  {WAVE_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        height:            `${h}px`,
                        '--wave-delay':    `${WAVE_DELAYS[i]}s`,
                        '--wave-dur':      `${WAVE_DURATIONS[i]}s`,
                      } as React.CSSProperties}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Track info + controls ─────────────────────────────── */}
          <div className="px-6 pb-10 space-y-5 shrink-0">
            {/* Title + like */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <motion.h1
                  key={currentSong.id + '_title'}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="text-2xl font-black text-white truncate"
                >
                  {currentSong.title}
                </motion.h1>
                <motion.p
                  key={currentSong.id + '_artist'}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', damping: 20, delay: 0.04 }}
                  className="text-white/55 text-base mt-0.5 truncate"
                >
                  {currentSong.artist}
                </motion.p>
              </div>
              <button
                onClick={() => toggleLike(currentSong)}
                className={cn(
                  'shrink-0 h-11 w-11 rounded-full flex items-center justify-center',
                  'transition-all active:scale-90',
                  liked
                    ? 'bg-vs-green/20 text-vs-green'
                    : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/15'
                )}
              >
                <Heart className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Progress */}
            <ProgressBar />

            {/* Controls */}
            <div className="flex justify-center">
              <PlayerControls size="md" />
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={toggleQueue}
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all active:scale-90"
              >
                <ListMusic className="h-4 w-4" />
              </button>
              <VolumeControl />
              <button className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all active:scale-90">
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Genre / language / year pills */}
            <div className="flex gap-2 flex-wrap">
              {currentSong.genre && (
                <span className="text-xs bg-white/[0.07] px-3 py-1 rounded-full text-white/45 border border-white/10">
                  {currentSong.genre}
                </span>
              )}
              {currentSong.language && (
                <span className="text-xs bg-white/[0.07] px-3 py-1 rounded-full text-white/45 border border-white/10">
                  {currentSong.language}
                </span>
              )}
              {currentSong.year && (
                <span className="text-xs bg-white/[0.07] px-3 py-1 rounded-full text-white/45 border border-white/10">
                  {currentSong.year}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
