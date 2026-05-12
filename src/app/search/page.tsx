'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Music2, Mic2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/layout/TopBar';
import SongRow from '@/components/ui/SongRow';
import { usePlayerStore } from '@/store/playerStore';
import { songs as allSongs } from '@/data/songs';
import { debounce } from '@/lib/utils';
import type { Song } from '@/types';

const GENRE_CARDS = [
  { label: 'Tamil Hits',  color: 'from-rose-700 to-pink-900',     icon: '🎵' },
  { label: 'Tamil Folk',  color: 'from-amber-600 to-orange-800',  icon: '🥁' },
  { label: 'Electronic',  color: 'from-blue-700 to-indigo-900',   icon: '🎛️' },
  { label: 'Chill',       color: 'from-teal-600 to-cyan-900',     icon: '🌊' },
  { label: 'Fusion',      color: 'from-purple-700 to-fuchsia-900',icon: '🎸' },
  { label: 'Lo-Fi',       color: 'from-slate-600 to-gray-900',    icon: '☕' },
  { label: 'Pop',         color: 'from-pink-600 to-rose-900',     icon: '🎤' },
  { label: 'Classical',   color: 'from-emerald-700 to-green-900', icon: '🎻' },
];

function SearchContent() {
  const params = useSearchParams();
  const [query, setQuery]           = useState(params?.get('q') ?? '');
  const [debouncedQ, setDebouncedQ] = useState(params?.get('q') ?? '');
  const [history, setHistory]       = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playQueue } = usePlayerStore();

  const updateDebounced = useMemo(() => debounce((v: string) => setDebouncedQ(v), 200), []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vs-search-history') ?? '[]');
      setHistory(saved);
    } catch {}
    inputRef.current?.focus();
  }, []);

  const saveQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((h) => h !== trimmed)].slice(0, 8);
      localStorage.setItem('vs-search-history', JSON.stringify(next));
      return next;
    });
  };

  const removeHistory = (item: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h !== item);
      localStorage.setItem('vs-search-history', JSON.stringify(next));
      return next;
    });
  };

  const handleChange = (v: string) => { setQuery(v); updateDebounced(v); };

  const results = useMemo(() => {
    const q = debouncedQ.toLowerCase().trim();
    if (!q) return { songs: [], artists: [] };
    const songs = allSongs.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q) ||
      (s.album ?? '').toLowerCase().includes(q)
    );
    const artistSet = new Set<string>();
    const artists: { name: string; songs: Song[] }[] = [];
    songs.forEach((s) => {
      if (!artistSet.has(s.artist)) {
        artistSet.add(s.artist);
        artists.push({ name: s.artist, songs: allSongs.filter((x) => x.artist === s.artist) });
      }
    });
    return { songs, artists: artists.slice(0, 4) };
  }, [debouncedQ]);

  return (
    <div className="fade-up min-h-screen">
      <TopBar title="Search" />
      <div className="px-6 py-6 space-y-8">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-vs-gray pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveQuery(query)}
            placeholder="Artists, songs, or podcasts"
            className="w-full bg-[#242424] text-vs-white placeholder-vs-gray rounded-full py-3.5 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-vs-green"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setQuery(''); setDebouncedQ(''); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-vs-gray hover:text-vs-white transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {debouncedQ ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {results.songs.length === 0 && (
                <div className="text-center py-20">
                  <Music2 className="h-12 w-12 text-vs-gray mx-auto mb-4" />
                  <p className="text-vs-white font-bold text-xl">No results for &quot;{debouncedQ}&quot;</p>
                  <p className="text-vs-gray text-sm mt-1">Check the spelling or try different keywords.</p>
                </div>
              )}

              {/* Artists */}
              {results.artists.length > 0 && (
                <section>
                  <h2 className="section-title mb-4">Artists</h2>
                  <div className="flex flex-wrap gap-2">
                    {results.artists.map(({ name, songs }) => (
                      <motion.button key={name} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => playQueue(songs)}
                        className="flex items-center gap-2.5 bg-vs-elevated hover:bg-vs-hover rounded-full px-4 py-2 transition-colors"
                      >
                        <Mic2 className="h-4 w-4 text-vs-green" />
                        <span className="text-sm font-semibold text-vs-white">{name}</span>
                      </motion.button>
                    ))}
                  </div>
                </section>
              )}

              {/* Songs */}
              {results.songs.length > 0 && (
                <section>
                  <h2 className="section-title mb-4">Songs <span className="text-vs-gray font-normal text-base">({results.songs.length})</span></h2>
                  <div className="space-y-1">
                    {results.songs.map((song, i) => (
                      <SongRow key={song.id} song={song} queue={results.songs} index={i} showAlbum />
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {/* History */}
              {history.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">Recent searches</h2>
                    <button onClick={() => { setHistory([]); localStorage.removeItem('vs-search-history'); }}
                      className="text-xs text-vs-gray hover:text-vs-white transition-colors">Clear all</button>
                  </div>
                  <div className="space-y-1">
                    {history.map((item) => (
                      <motion.div key={item} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group"
                        onClick={() => { setQuery(item); handleChange(item); }}>
                        <Clock className="h-4 w-4 text-vs-gray shrink-0" />
                        <span className="text-sm text-vs-white flex-1">{item}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeHistory(item); }}
                          className="opacity-0 group-hover:opacity-100 text-vs-gray hover:text-vs-white transition-all">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-vs-green" />
                  <h2 className="section-title">Trending</h2>
                </div>
                <div className="space-y-1">
                  {allSongs.slice(0, 8).map((song, i) => (
                    <SongRow key={song.id} song={song} queue={allSongs} index={i} showAlbum />
                  ))}
                </div>
              </section>

              {/* Browse genres */}
              <section>
                <h2 className="section-title mb-4">Browse all</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {GENRE_CARDS.map(({ label, color, icon }) => {
                    const genreSongs = allSongs.filter((s) =>
                      s.genre.toLowerCase().includes(label.toLowerCase().split(' ')[0].toLowerCase()) ||
                      (label === 'Tamil Hits' && s.language === 'Tamil')
                    );
                    return (
                      <motion.button key={label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => genreSongs.length > 0 && playQueue(genreSongs)}
                        className={`relative h-24 rounded-2xl bg-gradient-to-br ${color} p-4 text-left overflow-hidden`}>
                        <p className="font-black text-base text-vs-white">{label}</p>
                        <p className="text-xs text-vs-white/60 mt-0.5">{genreSongs.length} songs</p>
                        <span className="absolute bottom-2 right-3 text-2xl">{icon}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
