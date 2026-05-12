'use client';

import { ChevronDown, Heart, MoreHorizontal, ListMusic, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import { cn } from '@/lib/utils';

export default function FullscreenPlayer() {
  const { showFullscreen, currentSong, toggleFullscreen, toggleQueue } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const liked = currentSong ? isLiked(currentSong.id) : false;

  return (
    <AnimatePresence>
      {showFullscreen && currentSong && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #121212 50%, #000 100%)',
          }}
        >
          {/* Dynamic background blur from cover */}
          <div
            className="absolute inset-0 -z-10 opacity-30 blur-3xl scale-110"
            style={{
              backgroundImage: `url(${currentSong.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-safe pt-6 pb-2">
            <button
              onClick={toggleFullscreen}
              className="text-vs-gray hover:text-vs-white transition-colors"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
            <div className="text-center">
              <p className="text-xs text-vs-gray font-semibold uppercase tracking-wider">Playing from</p>
              <p className="text-sm font-bold text-vs-white">{currentSong.album}</p>
            </div>
            <button className="text-vs-gray hover:text-vs-white">
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </div>

          {/* Album art */}
          <div className="flex-1 flex items-center justify-center px-8 py-4">
            <motion.div
              key={currentSong.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
            >
              <Image
                src={currentSong.coverUrl}
                alt={currentSong.title}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                unoptimized
              />
            </motion.div>
          </div>

          {/* Info + controls */}
          <div className="px-6 pb-safe pb-8 space-y-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <motion.h1
                  key={currentSong.id + 'title'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black text-vs-white truncate"
                >
                  {currentSong.title}
                </motion.h1>
                <p className="text-vs-gray text-base truncate">{currentSong.artist}</p>
              </div>
              <button
                onClick={() => toggleLike(currentSong)}
                className={cn(
                  'shrink-0 mt-1 transition-transform hover:scale-110 active:scale-95',
                  liked ? 'text-vs-green' : 'text-vs-gray hover:text-vs-white'
                )}
              >
                <Heart className="h-6 w-6" fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <ProgressBar />

            <div className="flex justify-center">
              <PlayerControls />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={toggleQueue}
                className="text-vs-gray hover:text-vs-white transition-colors"
              >
                <ListMusic className="h-5 w-5" />
              </button>
              <VolumeControl />
              <button className="text-vs-gray hover:text-vs-white transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {currentSong.genre && (
                <span className="text-xs bg-vs-elevated px-3 py-1 rounded-full text-vs-gray border border-vs-border">
                  {currentSong.genre}
                </span>
              )}
              {currentSong.language && (
                <span className="text-xs bg-vs-elevated px-3 py-1 rounded-full text-vs-gray border border-vs-border">
                  {currentSong.language}
                </span>
              )}
              {currentSong.year && (
                <span className="text-xs bg-vs-elevated px-3 py-1 rounded-full text-vs-gray border border-vs-border">
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
