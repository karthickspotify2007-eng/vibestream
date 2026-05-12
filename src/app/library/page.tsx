'use client';

import { useState } from 'react';
import { Heart, ListMusic, Plus, Play, Trash2, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import SongCard from '@/components/cards/SongCard';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';

type Tab = 'liked' | 'playlists';

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('liked');
  const { playQueue } = usePlayerStore();
  const { likedSongs, playlists, createPlaylist, deletePlaylist } = useLibraryStore();

  return (
    <div className="fade-up min-h-screen">
      <div className="px-6 pt-4 bg-gradient-to-b from-vs-elevated to-transparent">
        <TopBar title="Your Library" />

        {/* Tab switcher */}
        <div className="flex gap-2 py-4">
          {(['liked', 'playlists'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-vs-white text-vs-black'
                  : 'bg-vs-elevated text-vs-gray hover:text-vs-white'
              }`}
            >
              {t === 'liked' ? 'Liked Songs' : 'Playlists'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* ── Liked Songs ──────────────────────────── */}
          {tab === 'liked' && (
            <motion.div
              key="liked"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Header card */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-2xl mb-6">
                <div className="h-16 w-16 rounded-xl bg-white/10 grid place-items-center">
                  <Heart className="h-8 w-8 text-vs-white fill-vs-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-vs-white/70 uppercase tracking-widest font-semibold">Playlist</p>
                  <h2 className="text-xl font-black text-vs-white">Liked Songs</h2>
                  <p className="text-sm text-vs-white/70 mt-0.5">{likedSongs.length} songs</p>
                </div>
                {likedSongs.length > 0 && (
                  <button
                    onClick={() => playQueue(likedSongs)}
                    className="h-12 w-12 rounded-full bg-vs-green grid place-items-center shadow-green shrink-0"
                  >
                    <Play className="h-5 w-5 text-vs-black fill-vs-black ml-0.5" />
                  </button>
                )}
              </div>

              {likedSongs.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="h-12 w-12 text-vs-gray mx-auto mb-4" />
                  <p className="text-vs-white font-bold text-lg">Songs you like will appear here</p>
                  <p className="text-vs-gray text-sm mt-1">Save songs by tapping the heart icon.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {likedSongs.map((song, i) => (
                    <SongCard key={song.id} song={song} queue={likedSongs} index={i} compact showIndex />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Playlists ────────────────────────────── */}
          {tab === 'playlists' && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* Create button */}
              <button
                onClick={() => {
                  const name = prompt('Playlist name:');
                  if (name?.trim()) createPlaylist(name.trim());
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-vs-elevated hover:border-vs-green text-vs-gray hover:text-vs-green transition-all group"
              >
                <div className="h-10 w-10 rounded-lg bg-vs-elevated group-hover:bg-vs-green/10 grid place-items-center transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">Create new playlist</span>
              </button>

              {playlists.length === 0 && (
                <div className="text-center py-12">
                  <ListMusic className="h-12 w-12 text-vs-gray mx-auto mb-4" />
                  <p className="text-vs-white font-bold text-lg">Create your first playlist</p>
                  <p className="text-vs-gray text-sm mt-1">It&apos;s easy, we&apos;ll help you.</p>
                </div>
              )}

              {playlists.map(playlist => {
                const cover = playlist.coverUrl || playlist.songs[0]?.coverUrl;
                return (
                  <motion.div
                    key={playlist.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-vs-surface hover:bg-vs-hover transition-colors group"
                  >
                    {/* Cover */}
                    <Link href={`/playlist/${playlist.id}`} className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                      {cover ? (
                        <Image src={cover} alt={playlist.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-vs-elevated grid place-items-center">
                          <Music2 className="h-6 w-6 text-vs-gray" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <Link href={`/playlist/${playlist.id}`} className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-vs-white truncate">{playlist.title}</p>
                      <p className="text-xs text-vs-gray mt-0.5">
                        {playlist.description || `${playlist.songs.length} songs`}
                      </p>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {playlist.songs.length > 0 && (
                        <button
                          onClick={() => playQueue(playlist.songs)}
                          className="h-9 w-9 rounded-full bg-vs-green grid place-items-center shadow-green"
                        >
                          <Play className="h-3.5 w-3.5 text-vs-black fill-vs-black ml-0.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${playlist.title}"?`)) deletePlaylist(playlist.id);
                        }}
                        className="h-9 w-9 rounded-full bg-vs-elevated hover:bg-red-900/50 grid place-items-center text-vs-gray hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
