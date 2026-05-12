'use client';

import { useMemo } from 'react';
import { Play, TrendingUp, Clock, Music2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import SongCard from '@/components/cards/SongCard';
import PlaylistCard from '@/components/cards/PlaylistCard';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { songs as allSongs } from '@/data/songs';
import type { Song } from '@/types';

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];
const greeting  = GREETINGS[Math.min(2, Math.floor(new Date().getHours() / 8))];

const GENRE_COLORS: Record<string, string> = {
  'Tamil':       'from-rose-800  to-pink-900',
  'Tamil Folk':  'from-amber-700 to-orange-900',
  'Electronic':  'from-blue-800  to-indigo-900',
  'Chill':       'from-teal-700  to-cyan-900',
  'Fusion':      'from-purple-800 to-fuchsia-900',
  'Lo-Fi':       'from-slate-700  to-gray-900',
};

function QuickPlayCard({ song, queue }: { song: Song; queue: Song[] }) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const active = currentSong?.id === song.id;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => playSong(song, queue)}
      className="flex items-center gap-3 bg-[#282828] hover:bg-[#3a3a3a] rounded-md overflow-hidden group transition-colors w-full text-left"
    >
      <div className="relative h-16 w-16 shrink-0">
        <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
      </div>
      <span className="font-bold text-sm text-vs-white truncate flex-1 pr-2">{song.title}</span>
      <div className="mr-3 h-8 w-8 rounded-full bg-vs-green grid place-items-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Play className="h-4 w-4 text-black fill-black ml-0.5" />
      </div>
    </motion.button>
  );
}

function SectionHeader({ title, href, icon: Icon }: { title: string; href?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-vs-green" />}
        <h2 className="section-title">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-xs font-semibold text-vs-gray hover:text-vs-white transition-colors flex items-center gap-1">
          Show all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { playQueue } = usePlayerStore();
  const { recentlyPlayed, playlists, likedSongs } = useLibraryStore();

  const featured  = allSongs.slice(0, 6);
  const trending  = useMemo(() => [...allSongs].sort(() => Math.random() - 0.5).slice(0, 8), []);
  const tamilSongs = useMemo(() => allSongs.filter((s) => s.language === 'Tamil'), []);
  const recent    = recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 6) : allSongs.slice(4, 10);

  const genres = useMemo(() => {
    const map: Record<string, Song[]> = {};
    allSongs.forEach((s) => {
      if (!map[s.genre]) map[s.genre] = [];
      map[s.genre].push(s);
    });
    return Object.entries(map).filter(([, arr]) => arr.length >= 2).slice(0, 8);
  }, []);

  return (
    <div className="fade-up">
      <TopBar />

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#535353]/40 to-transparent px-6 pt-6 pb-8">
        <h1 className="text-3xl font-black text-vs-white mb-6">{greeting} 👋</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {featured.map((song) => (
            <QuickPlayCard key={song.id} song={song} queue={featured} />
          ))}
        </div>
      </div>

      <div className="px-6 space-y-10 pb-10">
        {/* ── Your playlists ────────────────────────────── */}
        {playlists.length > 0 && (
          <section>
            <SectionHeader title="Your Playlists" href="/library" icon={Music2} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {playlists.slice(0, 6).map((pl) => (
                <PlaylistCard key={pl.id} playlist={pl} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recently played ───────────────────────────── */}
        <section>
          <SectionHeader title="Recently Played" icon={Clock} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recent.map((song) => (
              <SongCard key={song.id} song={song} queue={recent} />
            ))}
          </div>
        </section>

        {/* ── Trending ──────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-vs-green" />
              <h2 className="section-title">Trending Now</h2>
            </div>
            <button
              onClick={() => playQueue(trending)}
              className="flex items-center gap-1.5 text-xs font-semibold text-vs-gray hover:text-vs-white transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Play all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trending.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} queue={trending} />
            ))}
          </div>
        </section>

        {/* ── Tamil Hits ────────────────────────────────── */}
        {tamilSongs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-vs-green" />
                <h2 className="section-title">Tamil Hits 🎵</h2>
              </div>
              <button onClick={() => playQueue(tamilSongs)} className="text-xs font-semibold text-vs-gray hover:text-vs-white transition-colors flex items-center gap-1">
                <Play className="h-3.5 w-3.5 fill-current" /> Play all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tamilSongs.slice(0, 12).map((song) => (
                <SongCard key={song.id} song={song} queue={tamilSongs} />
              ))}
            </div>
          </section>
        )}

        {/* ── Browse by genre ───────────────────────────── */}
        <section>
          <SectionHeader title="Browse by Genre" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {genres.map(([genre, songs]) => (
              <motion.button
                key={genre}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => playQueue(songs)}
                className={`relative h-28 rounded-2xl overflow-hidden bg-gradient-to-br ${GENRE_COLORS[genre] ?? 'from-gray-700 to-gray-900'} p-4 text-left`}
              >
                <p className="font-black text-lg text-vs-white leading-tight">{genre}</p>
                <p className="text-sm text-vs-white/70 mt-0.5">{songs.length} songs</p>
                <div className="absolute bottom-0 right-0 h-16 w-16 rounded-tl-2xl bg-white/10" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── All songs ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">All Songs</h2>
            <span className="text-xs text-vs-gray">{allSongs.length} tracks</span>
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
