'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePlayerStore } from '@/store/playerStore';
import type { Artist } from '@/types';

export default function ArtistCard({ artist }: { artist: Artist }) {
  const [hovered, setHovered] = useState(false);
  const { playQueue } = usePlayerStore();
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className="group flex flex-col gap-4 p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition-colors cursor-pointer"
    >
      <Link href={`/artist/${artist.id}`} className="relative aspect-square w-full overflow-hidden rounded-full shadow-lg block">
        <Image
          src={artist.imageUrl}
          alt={artist.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          onClick={(e) => {
            e.preventDefault();
            if (artist.songs?.length) playQueue(artist.songs);
          }}
          className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-vs-green flex items-center justify-center shadow-lg"
        >
          <Play className="h-5 w-5 text-black fill-black ml-0.5" />
        </motion.button>
      </Link>
      <Link href={`/artist/${artist.id}`} className="min-w-0 text-center">
        <p className="font-bold text-sm text-vs-white truncate hover:underline">{artist.name}</p>
        <p className="text-xs text-vs-gray mt-0.5">Artist</p>
      </Link>
    </motion.div>
  );
}
