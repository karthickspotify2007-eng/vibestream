'use client';

import { use, useMemo } from 'react';
import { Play, Shuffle, Clock, Music2 } from 'lucide-react';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import SongRow from '@/components/ui/SongRow';
import DynamicBackground from '@/components/ui/DynamicBackground';
import { usePlayerStore } from '@/store/playerStore';
import { songs as allSongs } from '@/data/songs';

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { playQueue, toggleShuffle } = usePlayerStore();

  // Build album from songs data (no external DB required)
  const albumSongs = useMemo(() => allSongs.filter((s) => s.album === id || s.album === decodeURIComponent(id)), [id]);
  const meta = albumSongs[0];

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Music2 className="h-16 w-16 text-vs-gray" />
        <h1 className="text-xl font-black text-vs-white">Album not found</h1>
      </div>
    );
  }

  return (
    <div className="fade-up min-h-screen relative">
      <div className="relative overflow-hidden">
        <DynamicBackground imageUrl={meta.coverUrl} />
        <div className="relative z-10">
          <TopBar />
          <div className="px-6 pt-6 pb-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
              <div className="relative h-48 w-48 sm:h-52 sm:w-52 rounded-xl overflow-hidden shadow-2xl shrink-0">
                <Image src={meta.coverUrl} alt={meta.album} fill className="object-cover" unoptimized />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-vs-white/70 uppercase tracking-widest font-semibold mb-2">Album</p>
                <h1 className="text-3xl sm:text-4xl font-black text-vs-white">{meta.album}</h1>
                <p className="text-vs-gray mt-1 font-semibold">{meta.artist} · {meta.year}</p>
                <p className="text-sm text-vs-gray mt-0.5">{albumSongs.length} songs · {meta.genre}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
                  <button onClick={() => playQueue(albumSongs)}
                    className="h-14 w-14 rounded-full bg-vs-green flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                    <Play className="h-6 w-6 text-black fill-black ml-0.5" />
                  </button>
                  <button onClick={() => { toggleShuffle(); playQueue(albumSongs); }}
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-vs-white transition-colors">
                    <Shuffle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="grid grid-cols-[16px_minmax(0,1fr)_auto] gap-4 px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-vs-gray">
          <span>#</span><span>Title</span><span><Clock className="h-3.5 w-3.5" /></span>
        </div>
        <div className="space-y-1">
          {albumSongs.map((song, i) => (
            <SongRow key={song.id} song={song} queue={albumSongs} index={i} showArtist={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
