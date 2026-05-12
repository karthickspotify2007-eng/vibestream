'use client';

import { useMemo } from 'react';
import { Play, TrendingUp, Clock, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import SongCard from '@/components/cards/SongCard';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { songs as allSongs } from '@/data/songs';
import type { Song } from '@/types';

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];
const greeting = GREETINGS[Math.min(2, Math.floor(new Date().getHours() / 8))];

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-vs-green" />
      <h2 className="text-xl font-black text-vs-white">{title}</h2>
    </div>
  );
}

function QuickPlayCard({ song, queue }: { song: Song; queue: Song[] }) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const active = currentSong?.id === song.id;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => playSong(song, queue)}
      className="flex items-center gap-3 bg-vs-elevated hover:bg-vs-hover rounded-lg overflow-hidden group transition-colors w-full text-left"
    >
      <div className="relative h-16 w-16 shrink-0">
        <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
      </div>
      <span className="font-bold text-sm text-vs-white truncate flex-1 pr-2">
        {song.title}
      </span>
      <div className="mr-3 h-9 w-9 rounded-full bg-vs-green grid place-items-center shadow-green opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Play className="h-4 w-4 text-vs-black fill-vs-black ml-0.5" />
      </div>
    </motion.button>
  );
}

export default function Home() {
  const { playQueue } = usePlayerStore();
  const { recentlyPlayed, likedSongs } = useLibraryStore();

  const tamilSongs  = useMemo(() => allSongs.filter((s) => s.language === 'Tamil'), []);
  const otherSongs  = useMemo(() => allSongs.filter((s) => s.language !== 'Tamil'), []);
  const featured    = allSongs.slice(0, 6);
  const trending    = useMemo(() => [...allSongs].sort(() => Math.random() - 0.5).slice(0, 8), []);
  const recent      = recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 6) : allSongs.slice(4, 10);

  // Genre sections
  const genres = useMemo(() => {
    const map: Record<string, Song[]> = {};
    allSongs.forEach((s) => {
      if (!map[s.genre]) map[s.genre] = [];
      map[s.genre].push(s);
    });
    return Object.entries(map).filter(([, songs]) => songs.length >= 2).slice(0, 4);
  }, []);

  const GENRE_COLORS: Record<string, string> = {
    Tamil:         'from-rose-800  to-pink-900',
    'Tamil Folk':  'from-amber-800 to-orange-900',
    Electronic:    'from-blue-800  to-indigo-900',
    Chill:         'from-teal-800  to-cyan-900',
    Fusion:        'from-purple-800 to-fuchsia-900',
    'Lo-Fi':       'from-slate-700  to-gray-900',
  };

  return (
    <div className="fade-up">
      {/* ── Hero ────────────────────────────────────────── */}
      <div className="bg-hero px-6 pt-4">
        <TopBar />
        <div className="py-6">
          <h1 className="text-3xl font-black text-vs-white">{greeting} 👋</h1>
          <p className="text-vs-gray mt-1 text-sm">What do you want to listen to?</p>
        </div>

        {/* Quick play grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-8">
          {featured.map((song) => (
            <QuickPlayCard key={song.id} song={song} queue={featured} />
          ))}
        </div>
      </div>

      <div className="px-6 space-y-10 pb-8">
        {/* ── Recently Played ───────────────────────────── */}
        <section>
          <SectionHeader title="Recently Played" icon={Clock} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recent.map((song) => (
              <SongCard key={song.id} song={song} queue={recent} />
            ))}
          </div>
        </section>

        {/* ── Trending ──────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-vs-green" />
              <h2 className="text-xl font-black text-vs-white">Trending Now</h2>
            </div>
            <button
              onClick={() => playQueue(trending)}
              className="flex items-center gap-1.5 text-sm text-vs-green hover:text-vs-green-light font-semibold transition-colors"
            >
              <Play className="h-4 w-4 fill-current" /> Play all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {trending.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} queue={trending} />
            ))}
          </div>
        </section>

        {/* ── Tamil Hits ────────────────────────────────── */}
        {tamilSongs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-vs-green" />
                <h2 className="text-xl font-black text-vs-white">Tamil Hits 🎵</h2>
              </div>
              <button
                onClick={() => playQueue(tamilSongs)}
                className="text-sm text-vs-green hover:text-vs-green-light font-semibold"
              >
                Play all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {tamilSongs.slice(0, 12).map((song) => (
                <SongCard key={song.id} song={song} queue={tamilSongs} />
              ))}
            </div>
          </section>
        )}

        {/* ── Genre sections ────────────────────────────── */}
        <section>
          <SectionHeader title="Browse by Genre" icon={Music2} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {genres.map(([genre, songs]) => (
              <motion.button
                key={genre}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => playQueue(songs)}
                className={`relative h-28 rounded-2xl overflow-hidden bg-gradient-to-br ${GENRE_COLORS[genre] ?? 'from-gray-700 to-gray-900'} p-4 text-left`}
              >
                <p className="font-black text-lg text-vs-white">{genre}</p>
                <p className="text-sm text-vs-white/70">{songs.length} songs</p>
                <div className="absolute bottom-0 right-0 h-16 w-16 rounded-tl-2xl bg-white/10" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── All songs ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-vs-white">All Songs</h2>
            <span className="text-sm text-vs-gray">{allSongs.length} tracks</span>
          </div>
          <div className="space-y-1">
            {allSongs.map((song, i) => (
              <SongCard key={song.id} song={song} queue={allSongs} index={i} compact showIndex />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
