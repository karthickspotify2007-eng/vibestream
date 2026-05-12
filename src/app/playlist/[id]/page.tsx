'use client';

import { useState } from 'react';
import { use } from 'react';
import { Play, Shuffle, MoreHorizontal, Music2, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import SongCard from '@/components/cards/SongCard';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { songs as allSongs } from '@/data/songs';

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { playQueue, toggleShuffle } = usePlayerStore();
  const { playlists, addToPlaylist, removeFromPlaylist, deletePlaylist } = useLibraryStore();
  const [showAdd, setShowAdd] = useState(false);

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <Music2 className="h-16 w-16 text-vs-gray" />
        <h1 className="text-xl font-black text-vs-white">Playlist not found</h1>
        <p className="text-vs-gray text-sm">This playlist may have been deleted.</p>
        <button
          onClick={() => router.push('/library')}
          className="flex items-center gap-2 text-vs-green font-semibold hover:text-vs-green-light"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </button>
      </div>
    );
  }

  const cover = playlist.coverUrl || playlist.songs[0]?.coverUrl;

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) playQueue(playlist.songs, 0);
  };

  const handleShuffle = () => {
    if (playlist.songs.length > 0) {
      toggleShuffle();
      playQueue(playlist.songs, 0);
    }
  };

  const notInPlaylist = allSongs.filter(s => !playlist.songs.find(ps => ps.id === s.id));

  return (
    <div className="fade-up min-h-screen">
      {/* Hero */}
      <div className="relative px-6 pt-4 pb-8 bg-gradient-to-b from-indigo-900/60 to-transparent">
        <TopBar />

        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mt-4">
          {/* Cover art */}
          <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-2xl overflow-hidden shadow-2xl shrink-0">
            {cover ? (
              <Image src={cover} alt={playlist.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-vs-elevated grid place-items-center">
                <Music2 className="h-16 w-16 text-vs-gray" />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="text-center sm:text-left">
            <p className="text-xs text-vs-white/70 uppercase tracking-widest font-semibold mb-2">Playlist</p>
            <h1 className="text-3xl sm:text-4xl font-black text-vs-white leading-tight">{playlist.title}</h1>
            {playlist.description && (
              <p className="text-sm text-vs-gray mt-2">{playlist.description}</p>
            )}
            <p className="text-sm text-vs-gray mt-1">{playlist.songs.length} songs</p>

            {/* Actions */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
              <button
                onClick={handlePlayAll}
                disabled={playlist.songs.length === 0}
                className="h-14 w-14 rounded-full bg-vs-green grid place-items-center shadow-green hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
              >
                <Play className="h-6 w-6 text-vs-black fill-vs-black ml-0.5" />
              </button>
              <button
                onClick={handleShuffle}
                disabled={playlist.songs.length === 0}
                className="h-10 w-10 rounded-full bg-vs-elevated hover:bg-vs-hover grid place-items-center text-vs-white transition-colors disabled:opacity-40"
              >
                <Shuffle className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAdd(v => !v)}
                className="h-10 w-10 rounded-full bg-vs-elevated hover:bg-vs-hover grid place-items-center text-vs-white transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${playlist.title}"?`)) {
                    deletePlaylist(playlist.id);
                    router.push('/library');
                  }
                }}
                className="h-10 w-10 rounded-full bg-vs-elevated hover:bg-red-900/50 grid place-items-center text-vs-gray hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Song list */}
      <div className="px-6 pb-8 space-y-6">
        {playlist.songs.length === 0 ? (
          <div className="text-center py-12">
            <Music2 className="h-12 w-12 text-vs-gray mx-auto mb-4" />
            <p className="text-vs-white font-bold">This playlist is empty</p>
            <p className="text-vs-gray text-sm mt-1">Add songs using the + button above.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((song, i) => (
              <div key={song.id} className="group relative">
                <SongCard song={song} queue={playlist.songs} index={i} compact showIndex />
                <button
                  onClick={() => removeFromPlaylist(playlist.id, song.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full bg-vs-elevated hover:bg-red-900/50 grid place-items-center text-vs-gray hover:text-red-400 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add songs panel */}
        {showAdd && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-vs-white">Add songs</h3>
              <button onClick={() => setShowAdd(false)} className="text-xs text-vs-gray hover:text-vs-white">
                Done
              </button>
            </div>
            <div className="space-y-1">
              {notInPlaylist.map(song => (
                <motion.div
                  key={song.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                  onClick={() => addToPlaylist(playlist.id, song)}
                >
                  <div className="relative h-10 w-10 rounded overflow-hidden shrink-0">
                    <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-vs-white truncate">{song.title}</p>
                    <p className="text-xs text-vs-gray truncate">{song.artist}</p>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-vs-green/20 hover:bg-vs-green grid place-items-center transition-colors group">
                    <Plus className="h-4 w-4 text-vs-green group-hover:text-vs-black" />
                  </div>
                </motion.div>
              ))}
              {notInPlaylist.length === 0 && (
                <p className="text-vs-gray text-sm text-center py-4">All songs are already in this playlist.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
