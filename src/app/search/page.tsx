'use client';

import { useState, useMemo, useRef, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Music2, Mic2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import SongRow from '@/components/ui/SongRow';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useSupabaseSongs } from '@/hooks/useSupabaseSongs';
import { searchSongs } from '@/lib/songService';
import { debounce } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';
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
  const [dbResults, setDbResults]   = useState<{
    songs: Song[]; artists: { id: string; name: string }[]; albums: { id: string; title: string }[];
  }>({ songs: [], artists: [], albums: [] });
  const [searchingDb, setSearchingDb] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playQueue } = usePlayerStore();
  const { localSongs } = useLibraryStore();
  const { songs: allSongs } = useSupabaseSongs();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateDebounced = useCallback(debounce((v: string) => setDebouncedQ(v), 250), []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vs-search-history') ?? '[]');
      setHistory(saved);
    } catch {}
    inputRef.current?.focus();
  }, []);

  // Search Supabase when debounced query changes
  useEffect(() => {
    if (!debouncedQ.trim() || !isSupabaseConfigured()) return;
    setSearchingDb(true);
    searchSongs(debouncedQ)
      .then((res) => {
        setDbResults({
          songs: res.songs,
          artists: res.artists.map((a) => ({ id: a.id, name: a.name })),
          albums: res.albums.map((al) => ({ id: al.id, title: (al as { title: string }).title })),
        });
      })
      .catch(() => {})
      .finally(() => setSearchingDb(false));
  }, [debouncedQ]);

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

  // Client-side search across all songs + local songs
  const localResults = useMemo(() => {
    const q = debouncedQ.toLowerCase().trim();
    if (!q) return { songs: [] as Song[], artists: [] as { name: string; songs: Song[] }[] };

    // Combine allSongs (static + DB) with local songs for unified search
    const combined: Song[] = [
      ...allSongs,
      ...localSongs.map((ls) => ({ ...ls, isLocal: true as const })),
    ];

    const songs = combined.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      (s.genre ?? '').toLowerCase().includes(q) ||
      (s.album ?? '').toLowerCase().includes(q)
    );

    // Extract unique artists from song results
    const artistMap = new Map<string, Song[]>();
    songs.forEach((s) => {
      if (!artistMap.has(s.artist)) artistMap.set(s.artist, []);
      artistMap.get(s.artist)!.push(s);
    });

    return {
      songs,
      artists: Array.from(artistMap.entries())
        .map(([name, songs]) => ({ name, songs }))
        .slice(0, 5),
    };
  }, [debouncedQ, allSongs, localSongs]);

  // Merge DB results with client results (deduplicate by ID)
  const mergedSongs = useMemo(() => {
    if (!debouncedQ.trim()) return [];
    const seen = new Set<string>();
    const all = [...dbResults.songs, ...localResults.songs];
    return all.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [dbResults.songs, localResults.songs, debouncedQ]);

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
            placeholder="Artists, songs, albums, genres…"
            className="w-full bg-[#242424] text-vs-white placeholder-vs-gray rounded-full py-3.5 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-vs-green"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => {
                  setQuery(''); setDebouncedQ('');
                  setDbResults({ songs: [], artists: [], albums: [] });
                  inputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-vs-gray hover:text-vs-white transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {debouncedQ ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8">

              {/* DB artists */}
              {dbResults.artists.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="h-4 w-4 text-vs-green" />
                    <h2 className="section-title">Artists</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dbResults.artists.map(({ id, name }) => (
                      <Link key={id} href={`/artist/${encodeURIComponent(name)}`}>
                        <motion.span whileHover={{ scale: 1.04 }}
                          className="flex items-center gap-2.5 bg-vs-elevated hover:bg-vs-hover rounded-full px-4 py-2 transition-colors cursor-pointer">
                          <Mic2 className="h-4 w-4 text-vs-green" />
                          <span className="text-sm font-semibold text-vs-white">{name}</span>
                        </motion.span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Local artists (from client-side search) */}
              {localResults.artists.length > 0 &&
                !dbResults.artists.some((a) => localResults.artists.find((la) => la.name === a.name)) && (
                <section>
                  <h2 className="section-title mb-4">Artists</h2>
                  <div className="flex flex-wrap gap-2">
                    {localResults.artists.map(({ name, songs }) => (
                      <motion.button key={name} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => playQueue(songs)}
                        className="flex items-center gap-2.5 bg-vs-elevated hover:bg-vs-hover rounded-full px-4 py-2 transition-colors">
                        <Mic2 className="h-4 w-4 text-vs-green" />
                        <span className="text-sm font-semibold text-vs-white">{name}</span>
                      </motion.button>
                    ))}
                  </div>
                </section>
              )}

              {/* No results */}
              {mergedSongs.length === 0 && !searchingDb && (
                <div className="text-center py-20">
                  <Music2 className="h-12 w-12 text-vs-gray mx-auto mb-4" />
                  <p className="text-vs-white font-bold text-xl">
                    No results for &quot;{debouncedQ}&quot;
                  </p>
                  <p className="text-vs-gray text-sm mt-1">
                    Check the spelling or try different keywords.
                  </p>
                </div>
              )}

              {/* Songs */}
              {mergedSongs.length > 0 && (
                <section>
                  <h2 className="section-title mb-4">
                    Songs{' '}
                    <span className="text-vs-gray font-normal text-base">
                      ({mergedSongs.length})
                      {searchingDb && <span className="ml-2 text-xs">searching…</span>}
                    </span>
                  </h2>
                  <div className="space-y-1">
                    {mergedSongs.map((song, i) => (
                      <SongRow key={song.id} song={song} queue={mergedSongs} index={i} showAlbum />
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8">

              {/* History */}
              {history.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">Recent searches</h2>
                    <button
                      onClick={() => { setHistory([]); localStorage.removeItem('vs-search-history'); }}
                      className="text-xs text-vs-gray hover:text-vs-white transition-colors">
                      Clear all
                    </button>
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
                    <SongRow key={song.id} song={song} queue={allSongs.slice(0, 8)} index={i} showAlbum />
                  ))}
                </div>
              </section>

              {/* Browse genres */}
              <section>
                <h2 className="section-title mb-4">Browse all</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {GENRE_CARDS.map(({ label, color, icon }) => {
                    const genreSongs = allSongs.filter((s) =>
                      (s.genre ?? '').toLowerCase().includes(label.toLowerCase().split(' ')[0].toLowerCase()) ||
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
