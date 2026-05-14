'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, X, Bell, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePlayerStore } from '@/store/playerStore';
import { songs as allSongs } from '@/data/songs';
import { debounce } from '@/lib/utils';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import VibeLogo from '@/components/ui/VibeLogo';
import type { Song } from '@/types';

export default function TopBar({ title }: { title?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const { playSong } = usePlayerStore();
  const { canInstall, install, installed } = usePwaInstall();

  const doSearch = debounce((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    setResults(
      allSongs
        .filter((s) =>
          s.title.toLowerCase().includes(lower) ||
          s.artist.toLowerCase().includes(lower) ||
          s.album?.toLowerCase().includes(lower)
        )
        .slice(0, 8)
    );
  }, 180);

  const handleChange = (v: string) => {
    setQuery(v);
    doSearch(v);
    setOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="sticky top-0 z-20 flex items-center gap-4 px-6 py-3 bg-vs-surface/80 backdrop-blur-xl border-b border-white/5">
      {/* Back / Forward */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-vs-white hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => router.forward()}
          className="h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-vs-white hover:bg-black/60 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Title OR search bar */}
      {title ? (
        <h1 className="text-lg font-black text-vs-white truncate flex-1">{title}</h1>
      ) : (
        <div ref={wrapRef} className="relative flex-1 max-w-xl">
          <div className="flex items-center gap-2 bg-[#242424] hover:bg-[#2a2a2a] rounded-full px-4 py-2.5 transition-colors">
            <Search className="h-4 w-4 text-vs-gray shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => query && setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query) {
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                  setOpen(false);
                }
              }}
              placeholder="What do you want to play?"
              className="flex-1 bg-transparent text-sm text-vs-white placeholder-vs-gray outline-none min-w-0"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                  className="text-vs-gray hover:text-white transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown results */}
          <AnimatePresence>
            {open && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 right-0 bg-[#282828] rounded-xl shadow-2xl overflow-hidden z-30"
              >
                {results.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => { playSong(song, results); setOpen(false); setQuery(''); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <img src={song.coverUrl} alt="" className="h-9 w-9 rounded object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-vs-white truncate">{song.title}</p>
                      <p className="text-xs text-vs-gray truncate">{song.artist}</p>
                    </div>
                  </button>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs text-vs-gray hover:text-white py-3 border-t border-white/5 transition-colors"
                >
                  See all results for &quot;{query}&quot;
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <Link
          href="/library"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-vs-white bg-white/10 hover:bg-white/15 rounded-full px-4 py-2 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-vs-green" />
          Premium
        </Link>

        {/* PWA install — only shown when browser is ready to install */}
        <AnimatePresence>
          {(canInstall || installed) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={!installed ? install : undefined}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold rounded-full px-4 py-2 transition-colors ${
                installed
                  ? 'text-vs-green bg-vs-green/10 cursor-default'
                  : 'text-vs-white bg-white/10 hover:bg-white/15 cursor-pointer'
              }`}
            >
              {installed
                ? <><CheckCircle2 className="h-3.5 w-3.5" /> Installed</>
                : <><Download className="h-3.5 w-3.5" /> Install app</>
              }
            </motion.button>
          )}
        </AnimatePresence>

        <button className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-vs-gray hover:text-white transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <Link href="/library">
          <VibeLogo size={30} iconOnly />
        </Link>
      </div>
    </div>
  );
}
