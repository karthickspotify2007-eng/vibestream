'use client';

import { Play, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePlayerStore } from '@/store/playerStore';
import type { Playlist } from '@/types';
import { cn } from '@/lib/utils';

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const { playQueue } = usePlayerStore();
  const cover = playlist.coverUrl || playlist.songs[0]?.coverUrl || '';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group flex flex-col gap-3 p-3 rounded-xl bg-vs-surface hover:bg-vs-hover transition-colors cursor-pointer"
    >
      <Link href={`/playlist/${playlist.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-card">
          {cover ? (
            <Image src={cover} alt={playlist.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
          ) : (
            <div className="w-full h-full bg-vs-elevated grid place-items-center">
              <Music2 className="h-10 w-10 text-vs-gray" />
            </div>
          )}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.preventDefault();
              if (playlist.songs.length > 0) playQueue(playlist.songs, 0);
            }}
            className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-vs-green grid place-items-center shadow-green"
          >
            <Play className="h-4 w-4 text-vs-black fill-vs-black ml-0.5" />
          </motion.button>
        </div>
        <div className="mt-3 min-w-0">
          <p className="font-bold text-sm text-vs-white truncate">{playlist.title}</p>
          <p className="text-xs text-vs-gray mt-0.5 truncate">
            {playlist.description || `${playlist.songs.length} songs`}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
