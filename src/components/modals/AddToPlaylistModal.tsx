'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Check, Music2, X } from 'lucide-react';
import Image from 'next/image';
import { useUIStore } from '@/store/uiStore';
import { useLibraryStore } from '@/store/libraryStore';

export default function AddToPlaylistModal() {
  const { modal, modalSong, closeModal, openCreatePlaylist } = useUIStore();
  const { playlists, addToPlaylist, isInPlaylist } = useLibraryStore();
  const { addToast } = useUIStore();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const isOpen = modal === 'addToPlaylist' && !!modalSong;

  const handleAdd = (playlistId: string) => {
    if (!modalSong) return;
    if (isInPlaylist(playlistId, modalSong.id)) return;
    addToPlaylist(playlistId, modalSong);
    setJustAdded(playlistId);
    const pl = playlists.find((p) => p.id === playlistId);
    addToast(`Added to ${pl?.title ?? 'playlist'}`, 'success');
    setTimeout(() => { setJustAdded(null); closeModal(); }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/70 z-[100]"
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-sm bg-[#282828] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-black text-white">Add to playlist</h2>
                {modalSong && (
                  <p className="text-xs text-vs-gray mt-0.5 truncate">{modalSong.title}</p>
                )}
              </div>
              <button onClick={closeModal} className="text-vs-gray hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Create new */}
            <button
              onClick={() => { closeModal(); openCreatePlaylist(modalSong ?? undefined); }}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded bg-vs-elevated border border-dashed border-vs-gray flex items-center justify-center shrink-0">
                <Plus className="h-4 w-4 text-vs-gray" />
              </div>
              <span className="text-sm font-semibold text-white">Create new playlist</span>
            </button>

            {/* Playlist list */}
            <div className="max-h-64 overflow-y-auto">
              {playlists.length === 0 && (
                <p className="text-center text-vs-gray text-sm py-8">No playlists yet</p>
              )}
              {playlists.map((pl) => {
                const cover = pl.coverUrl || pl.songs[0]?.coverUrl;
                const added = modalSong ? isInPlaylist(pl.id, modalSong.id) : false;
                const justAddedThis = justAdded === pl.id;
                return (
                  <button
                    key={pl.id}
                    onClick={() => handleAdd(pl.id)}
                    disabled={added}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 disabled:opacity-60 transition-colors text-left"
                  >
                    <div className="relative h-10 w-10 rounded overflow-hidden shrink-0">
                      {cover ? (
                        <Image src={cover} alt={pl.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-vs-elevated flex items-center justify-center">
                          <Music2 className="h-5 w-5 text-vs-gray" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{pl.title}</p>
                      <p className="text-xs text-vs-gray">{pl.songs.length} songs</p>
                    </div>
                    {(added || justAddedThis) && (
                      <Check className="h-4 w-4 text-vs-green shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
