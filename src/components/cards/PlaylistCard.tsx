'use client';

import { useState } from 'react';
import { Play, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePlayerStore } from '@/store/playerStore';
import type { Playlist } from '@/types';

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const [hovered, setHovered] = useState(false);
  const { playQueue } = usePlayerStore();
  const cover = playlist.coverUrl || playlist.songs[0]?.coverUrl;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className="group flex flex-col gap-3 p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition-colors cursor-pointer"
    >
      <Link href={`/playlist/${playlist.id}`} className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg block">
        {cover ? (
          <Image src={cover} alt={playlist.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
        ) : (
          <div className="w-full h-full bg-vs-elevated flex items-center justify-center">
            <Music2 className="h-10 w-10 text-vs-gray" />
          </div>
        )}
        {playlist.songs.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            onClick={(e) => { e.preventDefault(); playQueue(playlist.songs); }}
            className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-vs-green flex items-center justify-center shadow-lg"
          >
            <Play className="h-5 w-5 text-black fill-black ml-0.5" />
          </motion.button>
        )}
      </Link>
      <Link href={`/playlist/${playlist.id}`} className="min-w-0">
        <p className="font-bold text-sm text-vs-white truncate hover:underline">{playlist.title}</p>
        <p className="text-xs text-vs-gray truncate mt-0.5">
          {playlist.description || `${playlist.songs.length} songs`}
        </p>
      </Link>
    </motion.div>
  );
}
