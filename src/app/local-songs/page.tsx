'use client';

import { useEffect } from 'react';
import { FolderOpen, Trash2, Play, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import LocalSongImporter from '@/components/local/LocalSongImporter';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';
import type { LocalSong } from '@/types';
import type { Song } from '@/types';

function localToSong(s: LocalSong): Song {
  return { ...s, isLocal: true };
}

export default function LocalSongsPage() {
  const { localSongs, removeLocalSong, refreshLocalSongUrl } = useLibraryStore();
  const { playSong } = usePlayerStore();
  const { addToast } = useUIStore();

  // Hydrate object URLs on mount (they expire between sessions)
  useEffect(() => {
    localSongs.forEach((s) => {
      if (!s.audioUrl || s.audioUrl === '') {
        refreshLocalSongUrl(s.id).catch(() => {});
      }
    });
  }, []);

  const handlePlay = (song: LocalSong) => {
    if (!song.audioUrl) {
      refreshLocalSongUrl(song.id).then((url) => {
        if (url) {
          const queue = localSongs.map(localToSong);
          playSong(localToSong({ ...song, audioUrl: url }), queue);
        } else {
          addToast('File not found. Please re-import.', 'error');
        }
      });
    } else {
      const queue = localSongs.map(localToSong);
      playSong(localToSong(song), queue);
    }
  };

  const handleDelete = async (id: string) => {
    await removeLocalSong(id);
    addToast('Song removed', 'info');
  };

  return (
    <div className="fade-up min-h-screen">
      <TopBar title="Local Songs" />
      <div className="px-6 pb-10">
        {/* Header */}
        <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-amber-700 to-orange-900 rounded-2xl my-6">
          <div className="h-16 w-16 rounded-xl bg-white/10 grid place-items-center">
            <FolderOpen className="h-8 w-8 text-vs-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-vs-white/70 uppercase tracking-widest font-semibold">Collection</p>
            <h2 className="text-2xl font-black text-vs-white">Local Songs</h2>
            <p className="text-sm text-vs-white/70 mt-0.5">{localSongs.length} songs</p>
          </div>
          {localSongs.length > 0 && (
            <button
              onClick={() => {
                const queue = localSongs.map(localToSong);
                playSong(queue[0], queue);
              }}
              className="h-12 w-12 rounded-full bg-vs-green grid place-items-center shrink-0 hover:scale-105 transition-transform"
            >
              <Play className="h-5 w-5 text-black fill-black ml-0.5" />
            </button>
          )}
        </div>

        {/* Importer */}
        <div className="mb-8">
          <LocalSongImporter />
        </div>

        {/* Song list */}
        {localSongs.length === 0 ? (
          <div className="text-center py-12">
            <Music2 className="h-12 w-12 text-vs-gray mx-auto mb-4" />
            <p className="text-vs-white font-bold text-lg">No local songs yet</p>
            <p className="text-vs-gray text-sm mt-1">Import audio files from your device above.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {localSongs.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                onClick={() => handlePlay(song)}
              >
                <span className="w-5 text-center text-xs text-vs-gray shrink-0">{i + 1}</span>
                <div className="relative h-10 w-10 rounded overflow-hidden shrink-0">
                  <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-vs-white truncate">{song.title}</p>
                  <p className="text-xs text-vs-gray truncate">{song.artist} · {song.fileName}</p>
                </div>
                <span className="text-xs text-vs-gray shrink-0">{song.duration}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(song.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-900/50 text-vs-gray hover:text-red-400 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
