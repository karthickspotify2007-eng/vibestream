'use client';

import { useMemo } from 'react';
import { Play, Shuffle, Music2 } from 'lucide-react';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import SongRow from '@/components/ui/SongRow';
import DynamicBackground from '@/components/ui/DynamicBackground';
import { usePlayerStore } from '@/store/playerStore';
import { songs as allSongs } from '@/data/songs';

export default function ArtistPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { playQueue, toggleShuffle } = usePlayerStore();

  // Decode id — could be artist name or artist id
  const artistName = decodeURIComponent(id);
  const artistSongs = useMemo(
    () => allSongs.filter((s) => s.artist === artistName || s.artist === id),
    [id, artistName]
  );
  const meta = artistSongs[0];

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Music2 className="h-16 w-16 text-vs-gray" />
        <h1 className="text-xl font-black text-vs-white">Artist not found</h1>
      </div>
    );
  }

  const genres = Array.from(new Set(artistSongs.map((s) => s.genre)));

  return (
    <div className="fade-up min-h-screen relative">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <DynamicBackground imageUrl={meta.coverUrl} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-vs-surface via-transparent to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-6">
          <TopBar />
          <p className="text-xs text-vs-white/70 uppercase tracking-widest font-semibold mb-1">Artist</p>
          <h1 className="text-4xl sm:text-5xl font-black text-vs-white">{meta.artist}</h1>
          <p className="text-sm text-vs-gray mt-1">{artistSongs.length} songs · {genres.join(', ')}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 flex items-center gap-4">
        <button onClick={() => playQueue(artistSongs)}
          className="h-14 w-14 rounded-full bg-vs-green flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
          <Play className="h-6 w-6 text-black fill-black ml-0.5" />
        </button>
        <button onClick={() => { toggleShuffle(); playQueue(artistSongs); }}
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-vs-white transition-colors">
          <Shuffle className="h-5 w-5" />
        </button>
      </div>

      {/* Songs */}
      <div className="px-6 pb-10">
        <h2 className="section-title mb-4">Popular</h2>
        <div className="space-y-1">
          {artistSongs.map((song, i) => (
            <SongRow key={song.id} song={song} queue={artistSongs} index={i} showAlbum />
          ))}
        </div>
      </div>
    </div>
  );
}
