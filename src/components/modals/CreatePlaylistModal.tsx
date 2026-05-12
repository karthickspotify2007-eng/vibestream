'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Music2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useLibraryStore } from '@/store/libraryStore';

export default function CreatePlaylistModal() {
  const { modal, modalSong, closeModal } = useUIStore();
  const { createPlaylist, addToPlaylist } = useLibraryStore();
  const { addToast } = useUIStore();
  const [name, setName] = useState('My Playlist');
  const [desc, setDesc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = modal === 'createPlaylist';

  useEffect(() => {
    if (isOpen) {
      setName('My Playlist');
      setDesc('');
      setTimeout(() => inputRef.current?.select(), 100);
    }
  }, [isOpen]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const pl = createPlaylist(trimmed, desc.trim());
    if (modalSong) {
      addToPlaylist(pl.id, modalSong);
      addToast(`Added to "${trimmed}"`, 'success');
    } else {
      addToast(`Playlist "${trimmed}" created`, 'success');
    }
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/70 z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-sm bg-[#282828] rounded-xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-black text-white">Create playlist</h2>
              <button onClick={closeModal} className="text-vs-gray hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Cover preview */}
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-lg bg-vs-elevated flex items-center justify-center shadow-lg">
                  {modalSong?.coverUrl ? (
                    <img src={modalSong.coverUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Music2 className="h-10 w-10 text-vs-gray" />
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Playlist name"
                  maxLength={60}
                  className="w-full bg-vs-elevated text-white placeholder-vs-gray rounded-md px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-vs-green"
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Add an optional description"
                  rows={2}
                  maxLength={200}
                  className="w-full bg-vs-elevated text-white placeholder-vs-gray rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-vs-green"
                />
              </div>

              {modalSong && (
                <p className="text-xs text-vs-gray">
                  &quot;{modalSong.title}&quot; will be added to this playlist.
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-full border border-white/20 text-white text-sm font-semibold hover:border-white/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 rounded-full bg-vs-green text-black text-sm font-black hover:bg-vs-green-light disabled:opacity-40 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
