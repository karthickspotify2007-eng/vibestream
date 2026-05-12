'use client';

import { Heart, ListMusic, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import AnimatedEqualizer from './AnimatedEqualizer';
import { cn } from '@/lib/utils';

export default function MiniPlayer() {
  const { currentSong, isPlaying, showFullscreen, toggleFullscreen, toggleQueue } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const liked = currentSong ? isLiked(currentSong.id) : false;

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-vs-border bg-vs-surface shadow-player"
      style={{ height: '90px' }}
    >
      {/* Thin progress bar at top */}
      <div className="absolute top-0 inset-x-0">
        <ProgressBar compact />
      </div>

      <div className="flex items-center h-full px-4 gap-4">
        {/* ── Track info ─────────────────────────── */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-3 min-w-0 flex-[0_0_25%] group"
        >
          <div className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden shadow-card">
            <Image
              src={currentSong.coverUrl}
              alt={currentSong.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <AnimatedEqualizer />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-vs-white truncate group-hover:text-vs-green transition-colors">
              {currentSong.title}
            </p>
            <p className="text-xs text-vs-gray truncate">{currentSong.artist}</p>
          </div>
        </button>

        {/* ── Player controls (center) ───────────── */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <PlayerControls />
          <div className="w-full max-w-lg hidden sm:block">
            <ProgressBar />
          </div>
        </div>

        {/* ── Side controls ─────────────────────── */}
        <div className="flex items-center gap-3 flex-[0_0_25%] justify-end">
          <button
            onClick={() => toggleLike(currentSong)}
            className={cn(
              'hidden sm:block transition-all hover:scale-110 active:scale-95',
              liked ? 'text-vs-green' : 'text-vs-gray hover:text-vs-white'
            )}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={toggleQueue}
            className="hidden md:block text-vs-gray hover:text-vs-white transition-colors"
            aria-label="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </button>

          <div className="hidden lg:block">
            <VolumeControl />
          </div>

          <button
            onClick={toggleFullscreen}
            className="sm:hidden text-vs-gray hover:text-vs-white"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
