'use client';

import { useState } from 'react';
import { Plus, Music2, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import { usePlayerStore } from '@/store/playerStore';
import { songs as allSongs } from '@/data/songs';

export default function ManageSongsPage() {
  const { playSong, currentSong } = usePlayerStore();
  const [search, setSearch] = useState('');

  const filtered = allSongs.filter(
    s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-up min-h-screen">
      <div className="px-6 pt-4 bg-gradient-to-b from-vs-elevated to-transparent">
        <TopBar title="Song Library" />
        <div className="py-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search songs…"
            className="w-full bg-vs-elevated text-vs-white placeholder-vs-gray rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-vs-green"
          />
        </div>
      </div>

      <div className="px-6 pb-8">
        <p className="text-vs-gray text-sm mb-4">{filtered.length} songs</p>
        <div className="space-y-1">
          {filtered.map((song, i) => {
            const isActive = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-vs-elevated transition-colors ${isActive ? 'bg-vs-elevated' : ''}`}
                onClick={() => playSong(song, filtered)}
              >
                <span className="w-6 text-center text-xs text-vs-gray shrink-0">{i + 1}</span>
                <div className="relative h-10 w-10 rounded overflow-hidden shrink-0">
                  <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? 'text-vs-green' : 'text-vs-white'}`}>{song.title}</p>
                  <p className="text-xs text-vs-gray truncate">{song.artist} · {song.genre}</p>
                </div>
                <span className="text-xs text-vs-gray shrink-0">{song.duration}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
