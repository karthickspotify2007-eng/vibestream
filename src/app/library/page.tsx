'use client';

import { useState } from 'react';
import { Heart, ListMusic, Plus, Play, Trash2, Music2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import SongRow from '@/components/ui/SongRow';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useUIStore } from '@/store/uiStore';

type Tab = 'liked' | 'playlists';

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('liked');
  const { playQueue } = usePlayerStore();
  const { likedSongs, playlists, deletePlaylist, renamePlaylist } = useLibraryStore();
  const { openCreatePlaylist } = useUIStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  return (
    <div className="fade-up min-h-screen">
      <TopBar title="Your Library" />
      <div className="px-6 pb-8">
        {/* Tabs */}
        <div className="flex gap-2 py-5">
          {(['liked', 'playlists'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tab === t ? 'bg-vs-white text-vs-black' : 'bg-vs-elevated text-vs-gray hover:text-vs-white'
              }`}>
              {t === 'liked' ? 'Liked Songs' : 'Playlists'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Liked ─────────────────────────────────── */}
          {tab === 'liked' && (
            <motion.div key="liked" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-2xl mb-6">
                <div className="h-16 w-16 rounded-xl bg-white/10 grid place-items-center">
                  <Heart className="h-8 w-8 text-vs-white fill-vs-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-vs-white/70 uppercase tracking-widest font-semibold">Playlist</p>
                  <h2 className="text-2xl font-black text-vs-white">Liked Songs</h2>
                  <p className="text-sm text-vs-white/70 mt-0.5">{likedSongs.length} songs</p>
                </div>
                {likedSongs.length > 0 && (
                  <button onClick={() => playQueue(likedSongs)}
                    className="h-12 w-12 rounded-full bg-vs-green grid place-items-center shrink-0 hover:scale-105 transition-transform">
                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                  </button>
                )}
              </div>
              {likedSongs.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="h-12 w-12 text-vs-gray mx-auto mb-4" />
                  <p className="text-vs-white font-bold text-lg">Songs you like appear here</p>
                  <p className="text-vs-gray text-sm mt-1">Tap the heart on any song to save it.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {likedSongs.map((song, i) => (
                    <SongRow key={song.id} song={song} queue={likedSongs} index={i} showAlbum />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Playlists ─────────────────────────────── */}
          {tab === 'playlists' && (
            <motion.div key="playlists" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <button onClick={() => openCreatePlaylist()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-vs-elevated hover:border-vs-green text-vs-gray hover:text-vs-green transition-all group">
                <div className="h-10 w-10 rounded-lg bg-vs-elevated group-hover:bg-vs-green/10 grid place-items-center transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">Create new playlist</span>
              </button>

              {playlists.length === 0 && (
                <div className="text-center py-16">
                  <ListMusic className="h-12 w-12 text-vs-gray mx-auto mb-4" />
                  <p className="text-vs-white font-bold text-lg">Create your first playlist</p>
                  <p className="text-vs-gray text-sm mt-1">It&apos;s easy, we&apos;ll help you.</p>
                </div>
              )}

              {playlists.map((pl) => {
                const cover = pl.coverUrl || pl.songs[0]?.coverUrl;
                if (renamingId === pl.id) {
                  return (
                    <div key={pl.id} className="flex items-center gap-3 p-3 rounded-xl bg-vs-elevated">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                        {cover ? <Image src={cover} alt="" fill className="object-cover" unoptimized /> :
                          <div className="w-full h-full bg-vs-hover grid place-items-center"><Music2 className="h-6 w-6 text-vs-gray" /></div>}
                      </div>
                      <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={() => { if (renameVal.trim()) renamePlaylist(pl.id, renameVal.trim()); setRenamingId(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && renameVal.trim()) { renamePlaylist(pl.id, renameVal.trim()); setRenamingId(null); } if (e.key === 'Escape') setRenamingId(null); }}
                        className="flex-1 bg-vs-hover text-vs-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-vs-green" />
                    </div>
                  );
                }
                return (
                  <motion.div key={pl.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-vs-surface hover:bg-vs-elevated transition-colors group">
                    <Link href={`/playlist/${pl.id}`} className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                      {cover ? <Image src={cover} alt={pl.title} fill className="object-cover" unoptimized /> :
                        <div className="w-full h-full bg-vs-elevated grid place-items-center"><Music2 className="h-6 w-6 text-vs-gray" /></div>}
                    </Link>
                    <Link href={`/playlist/${pl.id}`} className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-vs-white truncate">{pl.title}</p>
                      <p className="text-xs text-vs-gray mt-0.5">{pl.description || `${pl.songs.length} songs`}</p>
                    </Link>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pl.songs.length > 0 && (
                        <button onClick={() => playQueue(pl.songs)} className="h-9 w-9 rounded-full bg-vs-green grid place-items-center">
                          <Play className="h-3.5 w-3.5 text-black fill-black ml-0.5" />
                        </button>
                      )}
                      <button onClick={() => { setRenamingId(pl.id); setRenameVal(pl.title); }}
                        className="h-9 w-9 rounded-full bg-vs-elevated grid place-items-center text-vs-gray hover:text-vs-white transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { if (confirm(`Delete "${pl.title}"?`)) deletePlaylist(pl.id); }}
                        className="h-9 w-9 rounded-full bg-vs-elevated hover:bg-red-900/50 grid place-items-center text-vs-gray hover:text-red-400 transition-colors">
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
