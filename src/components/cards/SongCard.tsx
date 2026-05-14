'use client';

import { memo, useState, useCallback } from 'react';
import { Play, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useUIStore } from '@/store/uiStore';
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

const SongCard = memo(function SongCard({ song, queue, index, showIndex = false, compact = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const { openAddToPlaylist } = useUIStore();
  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  if (compact) {
    return (
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => playSong(song, queue ?? [song])}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors hover:bg-white/5',
          isActive && 'bg-white/10'
        )}
      >
        {showIndex && (
          <span className="w-5 text-center text-sm text-vs-gray shrink-0">
            {isActive && isPlaying
              ? <AnimatedEqualizer className="mx-auto" />
              : hovered
                ? <Play className="h-3 w-3 text-white fill-white mx-auto" />
                : index != null ? index + 1 : ''}
          </span>
        )}
        <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden">
          <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold truncate', isActive ? 'text-vs-green' : 'text-vs-white')}>
            {song.title}
          </p>
          <p className="text-xs text-vs-gray truncate">{song.artist}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); openAddToPlaylist(song); }}
            className="p-1.5 rounded-full hover:bg-white/10 text-vs-gray hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
            className={cn('p-1.5 rounded-full hover:bg-white/10 transition-all', liked ? 'text-vs-green opacity-100' : 'text-vs-gray')}
          >
            <Heart className="h-3.5 w-3.5" fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className="group flex flex-col gap-3 p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition-colors cursor-pointer"
      onClick={() => playSong(song, queue ?? [song])}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={song.coverUrl}
          alt={song.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-vs-green flex items-center justify-center shadow-lg shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          {isActive && isPlaying
            ? <AnimatedEqualizer />
            : <Play className="h-5 w-5 text-black fill-black ml-0.5" onClick={() => playSong(song, queue ?? [song])} />
          }
        </motion.div>
      </div>
      <div className="min-w-0">
        <p className={cn('font-bold text-sm truncate', isActive ? 'text-vs-green' : 'text-vs-white')}>
          {song.title}
        </p>
        <p className="text-xs text-vs-gray truncate mt-0.5">{song.artist}</p>
      </div>
    </motion.div>
  );
});

export default SongCard;
