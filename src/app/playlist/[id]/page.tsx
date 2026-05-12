'use client';

import { use, useState } from 'react';
import { Play, Shuffle, Plus, Trash2, Music2, Clock, Pencil, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import SongRow from '@/components/ui/SongRow';
import DynamicBackground from '@/components/ui/DynamicBackground';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { songs as allSongs } from '@/data/songs';

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { playQueue, toggleShuffle } = usePlayerStore();
  const { playlists, addToPlaylist, removeFromPlaylist, deletePlaylist, updatePlaylist } = useLibraryStore();
  const [showAdd, setShowAdd] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Music2 className="h-16 w-16 text-vs-gray" />
        <h1 className="text-xl font-black text-vs-white">Playlist not found</h1>
        <button onClick={() => router.push('/library')} className="text-vs-green hover:underline font-semibold">
          ← Back to Library
        </button>
      </div>
    );
  }

  const cover = playlist.coverUrl || playlist.songs[0]?.coverUrl;
  const notInPlaylist = allSongs.filter((s) => !playlist.songs.find((ps) => ps.id === s.id));

  return (
    <div className="fade-up min-h-screen relative">
      <div className="relative">
        {cover && <DynamicBackground imageUrl={cover} />}
        <div className="relative z-10">
          <TopBar />
          <div className="px-6 pb-8 pt-4">
            {/* Hero */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
              <div className="relative h-48 w-48 sm:h-52 sm:w-52 rounded-xl overflow-hidden shadow-2xl shrink-0">
                {cover ? (
                  <Image src={cover} alt={playlist.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-vs-elevated flex items-center justify-center">
                    <Music2 className="h-16 w-16 text-vs-gray" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-vs-white/70 uppercase tracking-widest font-semibold mb-2">Playlist</p>
                {renaming ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newName.trim()) { updatePlaylist(id, { title: newName.trim() }); setRenaming(false); }
                        if (e.key === 'Escape') setRenaming(false);
                      }}
                      className="text-3xl font-black bg-transparent text-vs-white border-b border-vs-green outline-none" />
                    <button onClick={() => { if (newName.trim()) updatePlaylist(id, { title: newName.trim() }); setRenaming(false); }}>
                      <Check className="h-5 w-5 text-vs-green" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-vs-white">{playlist.title}</h1>
                    <button onClick={() => { setRenaming(true); setNewName(playlist.title); }} className="text-vs-gray hover:text-vs-white transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {playlist.description && <p className="text-sm text-vs-gray mb-1">{playlist.description}</p>}
                <p className="text-sm text-vs-gray">{playlist.songs.length} songs</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
                  <button onClick={() => playlist.songs.length > 0 && playQueue(playlist.songs, 0)} disabled={!playlist.songs.length}
                    className="h-14 w-14 rounded-full bg-vs-green flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 shadow-lg">
                    <Play className="h-6 w-6 text-black fill-black ml-0.5" />
                  </button>
                  <button onClick={() => { toggleShuffle(); if (playlist.songs.length) playQueue(playlist.songs, 0); }}
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-vs-white transition-colors">
                    <Shuffle className="h-5 w-5" />
                  </button>
                  <button onClick={() => setShowAdd((v) => !v)}
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-vs-white transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                  <button onClick={() => { if (confirm(`Delete "${playlist.title}"?`)) { deletePlaylist(id); router.push('/library'); } }}
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-red-900/50 flex items-center justify-center text-vs-gray hover:text-red-400 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Song list */}
      <div className="px-6 pb-10">
        {/* Header row */}
        {playlist.songs.length > 0 && (
          <div className="grid grid-cols-[16px_minmax(0,2fr)_minmax(0,1fr)_auto] gap-4 px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-vs-gray">
            <span>#</span><span>Title</span><span className="hidden md:block">Album</span>
            <span className="flex justify-end"><Clock className="h-3.5 w-3.5" /></span>
          </div>
        )}

        {playlist.songs.length === 0 ? (
          <div className="text-center py-16">
            <Music2 className="h-12 w-12 text-vs-gray mx-auto mb-4" />
            <p className="text-vs-white font-bold">This playlist is empty</p>
            <p className="text-vs-gray text-sm mt-1">Add songs using the + button above.</p>
          </div>
        ) : (
          <div className="space-y-1 relative">
            {playlist.songs.map((song, i) => (
              <div key={song.id} className="group relative">
                <SongRow song={song} queue={playlist.songs} index={i} showAlbum />
                <button onClick={() => removeFromPlaylist(id, song.id)}
                  className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7 rounded-full bg-vs-elevated hover:bg-red-900/50 grid place-items-center text-vs-gray hover:text-red-400 transition-all">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add songs panel */}
        {showAdd && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-vs-white">Add songs</h3>
              <button onClick={() => setShowAdd(false)} className="text-xs text-vs-gray hover:text-vs-white">Done</button>
            </div>
            <div className="space-y-1">
              {notInPlaylist.slice(0, 20).map((song) => (
                <motion.button key={song.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  onClick={() => addToPlaylist(id, song)}>
                  <Image src={song.coverUrl} alt={song.title} width={40} height={40} className="rounded object-cover shrink-0" unoptimized />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-vs-white truncate">{song.title}</p>
                    <p className="text-xs text-vs-gray truncate">{song.artist}</p>
                  </div>
                  <div className="h-7 w-7 rounded-full border border-vs-gray hover:border-vs-white grid place-items-center transition-colors">
                    <Plus className="h-4 w-4 text-vs-white" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
