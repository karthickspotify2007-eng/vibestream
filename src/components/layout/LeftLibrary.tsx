'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Search, Library, Plus, ChevronRight,
  Heart, Music2, FolderOpen, Disc3, Pencil, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLibraryStore } from '@/store/libraryStore';
import { useUIStore } from '@/store/uiStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils';

function NavItem({ href, icon: Icon, label, active }: {
  href: string; icon: React.ElementType; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-4 px-3 py-2 rounded-md text-sm font-bold transition-colors',
        active ? 'text-vs-white' : 'text-vs-gray hover:text-vs-white'
      )}
    >
      <Icon className={cn('h-6 w-6 shrink-0', active ? 'text-vs-white' : '')} />
      {label}
    </Link>
  );
}

export default function LeftLibrary() {
  const pathname = usePathname();
  const router = useRouter();
  const { playlists, likedSongs, localSongs, createPlaylist, deletePlaylist, renamePlaylist } = useLibraryStore();
  const { openCreatePlaylist } = useUIStore();
  const { playQueue } = usePlayerStore();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  const startRename = (id: string, current: string) => {
    setRenamingId(id);
    setRenameVal(current);
  };
  const commitRename = () => {
    if (renamingId && renameVal.trim()) renamePlaylist(renamingId, renameVal.trim());
    setRenamingId(null);
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 bg-black rounded-r-none h-full overflow-hidden">
      {/* Logo */}
      <div className="px-6 pt-6 pb-2 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-vs-green flex items-center justify-center">
            <Music2 className="h-5 w-5 text-black" />
          </div>
          <span className="font-black text-lg text-vs-white tracking-tight">Vibestream</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-4 pb-2 space-y-1 shrink-0">
        <NavItem href="/"       icon={Home}   label="Home"   active={pathname === '/'} />
        <NavItem href="/search" icon={Search} label="Search" active={pathname.startsWith('/search')} />
      </nav>

      {/* Library */}
      <div className="flex-1 overflow-y-auto mt-2 px-2">
        <div className="bg-[#121212] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button
              onClick={() => router.push('/library')}
              className="flex items-center gap-2 text-vs-gray hover:text-vs-white transition-colors"
            >
              <Library className="h-5 w-5" />
              <span className="text-sm font-bold">Your Library</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu((v) => !v)}
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-vs-gray hover:text-vs-white transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {showCreateMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-[#282828] rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    {[
                      { label: 'Create playlist', icon: Plus, onClick: () => { openCreatePlaylist(); setShowCreateMenu(false); } },
                      { label: 'Import local songs', icon: FolderOpen, onClick: () => { router.push('/local-songs'); setShowCreateMenu(false); } },
                    ].map(({ label, icon: Icon, onClick }) => (
                      <button
                        key={label}
                        onClick={onClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-vs-white hover:bg-white/5 transition-colors text-left"
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Liked Songs shortcut */}
          <Link
            href="/library"
            className={cn(
              'flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors',
              pathname === '/library' && 'bg-white/10'
            )}
          >
            <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-vs-white truncate">Liked Songs</p>
              <p className="text-xs text-vs-gray">{likedSongs.length} songs</p>
            </div>
          </Link>

          {/* Local songs shortcut */}
          {localSongs.length > 0 && (
            <Link
              href="/local-songs"
              className={cn(
                'flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors',
                pathname === '/local-songs' && 'bg-white/10'
              )}
            >
              <div className="h-10 w-10 rounded bg-gradient-to-br from-amber-700 to-orange-900 flex items-center justify-center shrink-0">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-vs-white truncate">Local Songs</p>
                <p className="text-xs text-vs-gray">{localSongs.length} songs</p>
              </div>
            </Link>
          )}

          {/* Playlists */}
          {playlists.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-bold text-vs-white mb-1">Create your first playlist</p>
              <p className="text-xs text-vs-gray mb-3">It&apos;s easy, we&apos;ll help you.</p>
              <button
                onClick={() => openCreatePlaylist()}
                className="text-xs font-semibold bg-vs-white text-black rounded-full px-4 py-1.5 hover:scale-105 transition-transform"
              >
                Create playlist
              </button>
            </div>
          )}
          {playlists.map((pl) => {
            const cover = pl.coverUrl || pl.songs[0]?.coverUrl;
            const isActive = pathname === `/playlist/${pl.id}`;
            if (renamingId === pl.id) {
              return (
                <div key={pl.id} className="px-4 py-2">
                  <input
                    autoFocus
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                    className="w-full bg-vs-elevated text-vs-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-vs-green"
                  />
                </div>
              );
            }
            return (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors group',
                  isActive && 'bg-white/10'
                )}
              >
                <div className="relative h-10 w-10 rounded shrink-0 overflow-hidden">
                  {cover ? (
                    <Image src={cover} alt={pl.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-vs-elevated flex items-center justify-center">
                      <Music2 className="h-5 w-5 text-vs-gray" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-vs-white truncate">{pl.title}</p>
                  <p className="text-xs text-vs-gray truncate">Playlist · {pl.songs.length} songs</p>
                </div>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.preventDefault(); startRename(pl.id, pl.title); }}
                    className="p-1.5 rounded hover:bg-white/10 text-vs-gray hover:text-white transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); deletePlaylist(pl.id); }}
                    className="p-1.5 rounded hover:bg-white/10 text-vs-gray hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </Link>
            );
          })}
          <div className="h-4" />
        </div>
      </div>
    </aside>
  );
}
