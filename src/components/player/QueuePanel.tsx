'use client';

import { X, ListMusic, GripVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import AnimatedEqualizer from './AnimatedEqualizer';
import Image from 'next/image';

export default function QueuePanel() {
  const { showQueue, queue, queueIndex, currentSong, isPlaying, jumpTo, removeFromQueue, toggleQueue } = usePlayerStore();

  return (
    <AnimatePresence>
      {showQueue && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-20 w-80 bg-vs-surface border-l border-vs-border z-40 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-vs-border">
            <div className="flex items-center gap-2">
              <ListMusic className="h-5 w-5 text-vs-green" />
              <h2 className="font-bold text-vs-white">Queue</h2>
            </div>
            <button onClick={toggleQueue} className="text-vs-gray hover:text-vs-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {currentSong && (
              <div className="mb-4">
                <p className="text-xs font-bold text-vs-gray uppercase tracking-wider px-2 mb-2">Now playing</p>
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-vs-elevated">
                  <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden">
                    <Image src={currentSong.coverUrl} alt={currentSong.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-vs-white truncate">{currentSong.title}</p>
                    <p className="text-xs text-vs-gray truncate">{currentSong.artist}</p>
                  </div>
                  {isPlaying && <AnimatedEqualizer className="shrink-0" />}
                </div>
              </div>
            )}

            {queue.slice(queueIndex + 1).length > 0 && (
              <div>
                <p className="text-xs font-bold text-vs-gray uppercase tracking-wider px-2 mb-2">Next up</p>
                {queue.slice(queueIndex + 1).map((song, i) => {
                  const realIdx = queueIndex + 1 + i;
                  return (
                    <button
                      key={song.id + realIdx}
                      onClick={() => jumpTo(realIdx)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-vs-hover group text-left"
                    >
                      <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden">
                        <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-vs-white truncate">{song.title}</p>
                        <p className="text-xs text-vs-gray truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(realIdx); }}
                        className="opacity-0 group-hover:opacity-100 text-vs-gray hover:text-vs-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </button>
                  );
                })}
              </div>
            )}

            {queue.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-vs-gray">
                <ListMusic className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Your queue is empty</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
