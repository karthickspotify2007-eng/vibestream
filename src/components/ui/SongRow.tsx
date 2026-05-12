'use client';

import { useState } from 'react';
import { Play, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useUIStore } from '@/store/uiStore';
import AnimatedEqualizer from '@/components/player/AnimatedEqualizer';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Song } from '@/types';

type Props = {
  song: Song;
  index?: number;
  queue?: Song[];
  showAlbum?: boolean;
  showArtist?: boolean;
};

export default function SongRow({ song, index, queue, showAlbum = false, showArtist = true }: Props) {
  const [hovered, setHovered] = useState(false);
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const { openAddToPlaylist } = useUIStore();

  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => playSong(song, queue ?? [song])}
      className={cn(
        'grid items-center gap-4 px-4 py-2 rounded-md cursor-pointer group transition-colors',
        'hover:bg-white/5',
        isActive && 'bg-white/10',
        showAlbum ? 'grid-cols-[16px_minmax(0,2fr)_minmax(0,1fr)_auto]' : 'grid-cols-[16px_minmax(0,1fr)_auto]'
      )}
    >
      {/* Index / equalizer / play */}
      <div className="flex items-center justify-center w-4 shrink-0">
        {isActive && isPlaying ? (
          <AnimatedEqualizer className="mx-auto" />
        ) : hovered ? (
          <Play className="h-3.5 w-3.5 text-vs-white fill-vs-white" />
        ) : (
          <span className={cn('text-sm tabular-nums', isActive ? 'text-vs-green' : 'text-vs-gray')}>
            {index != null ? index + 1 : ''}
          </span>
        )}
      </div>

      {/* Title + art */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden">
          <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
        </div>
        <div className="min-w-0">
          <p className={cn('text-sm font-semibold truncate', isActive ? 'text-vs-green' : 'text-vs-white')}>
            {song.title}
          </p>
          {showArtist && (
            <p className="text-xs text-vs-gray truncate">{song.artist}</p>
          )}
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <p className="text-sm text-vs-gray truncate hidden md:block">{song.album}</p>
      )}

      {/* Actions + duration */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); openAddToPlaylist(song); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-vs-gray hover:text-vs-white"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
          className={cn(
            'transition-all',
            liked
              ? 'text-vs-green opacity-100'
              : 'text-vs-gray opacity-0 group-hover:opacity-100 hover:text-vs-white'
          )}
        >
          <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
        </button>
        <span className="text-sm text-vs-gray tabular-nums w-10 text-right">
          {song.duration}
        </span>
      </div>
    </motion.div>
  );
}
