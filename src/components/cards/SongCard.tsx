'use client';

import { Play, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import AnimatedEqualizer from '@/components/player/AnimatedEqualizer';
import { cn } from '@/lib/utils';
import type { Song } from '@/types';

type Props = {
  song: Song;
  queue?: Song[];
  index?: number;
  showIndex?: boolean;
  compact?: boolean;
};

export default function SongCard({ song, queue, index, showIndex = false, compact = false }: Props) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();

  const isActive = currentSong?.id === song.id;
  const liked    = isLiked(song.id);

  const handlePlay = () => {
    playSong(song, queue ?? [song]);
  };

  if (compact) {
    return (
      <motion.button
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        onClick={handlePlay}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg group text-left transition-colors',
          isActive && 'bg-vs-elevated'
        )}
      >
        {showIndex && (
          <span className="w-5 text-center text-sm text-vs-gray shrink-0">
            {isActive && isPlaying
              ? <AnimatedEqualizer className="mx-auto" />
              : index != null ? index + 1 : ''
            }
          </span>
        )}
        <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden">
          <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="h-4 w-4 text-vs-white fill-vs-white" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold truncate', isActive ? 'text-vs-green' : 'text-vs-white')}>
            {song.title}
          </p>
          <p className="text-xs text-vs-gray truncate">{song.artist}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
          className={cn(
            'shrink-0 opacity-0 group-hover:opacity-100 transition-all hover:scale-110',
            liked ? 'text-vs-green opacity-100' : 'text-vs-gray hover:text-vs-white'
          )}
        >
          <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
        </button>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={handlePlay}
      className={cn(
        'group flex flex-col gap-3 p-3 rounded-xl bg-vs-surface hover:bg-vs-hover transition-colors text-left w-full'
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-card">
        <Image
          src={song.coverUrl}
          alt={song.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-vs-green grid place-items-center shadow-green"
        >
          {isActive && isPlaying
            ? <AnimatedEqualizer />
            : <Play className="h-4 w-4 text-vs-black fill-vs-black ml-0.5" />
          }
        </motion.div>
      </div>
      <div className="min-w-0">
        <p className={cn('font-bold text-sm truncate', isActive ? 'text-vs-green' : 'text-vs-white')}>
          {song.title}
        </p>
        <p className="text-xs text-vs-gray truncate mt-0.5">{song.artist}</p>
      </div>
    </motion.button>
  );
}
