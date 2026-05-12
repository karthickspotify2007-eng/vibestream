'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Plus, Heart, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLibraryStore } from '@/store/libraryStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const NAV = [
  { href: '/',        label: 'Home',   icon: Home   },
  { href: '/search',  label: 'Search', icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { playlists, likedSongs, createPlaylist } = useLibraryStore();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-vs-black h-full overflow-hidden">
      {/* ── Logo ───────────────────────────────── */}
      <div className="px-6 pt-6 pb-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-vs-green grid place-items-center shadow-green shrink-0">
            <span className="font-black text-vs-black text-sm">VS</span>
          </div>
          <span className="font-black text-lg text-vs-white tracking-tight group-hover:text-vs-green transition-colors">
            Vibestream
          </span>
        </Link>
      </div>

      {/* ── Main nav ───────────────────────────── */}
      <nav className="px-2 mt-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-colors',
              pathname === href
                ? 'text-vs-white bg-vs-hover'
                : 'text-vs-gray hover:text-vs-white hover:bg-vs-hover/50'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Library ────────────────────────────── */}
      <div className="flex-1 mt-4 mx-2 rounded-xl bg-vs-surface overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Library className="h-5 w-5 text-vs-gray" />
            <span className="font-bold text-sm text-vs-gray">Your Library</span>
          </div>
          <button
            onClick={() => createPlaylist('My Playlist')}
            className="text-vs-gray hover:text-vs-white transition-colors"
            aria-label="Create playlist"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {/* Liked Songs */}
          <Link
            href="/library"
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-vs-hover transition-colors group',
              pathname === '/library' && 'bg-vs-hover'
            )}
          >
            <div className="w-10 h-10 rounded shrink-0 bg-gradient-to-br from-indigo-800 to-violet-600 grid place-items-center">
              <Heart className="h-4 w-4 text-vs-white fill-vs-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-vs-white truncate">Liked Songs</p>
              <p className="text-xs text-vs-gray">{likedSongs.length} songs</p>
            </div>
          </Link>

          {/* Playlists */}
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              href={`/playlist/${pl.id}`}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-vs-hover transition-colors',
                pathname === `/playlist/${pl.id}` && 'bg-vs-hover'
              )}
            >
              <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-vs-elevated flex items-center justify-center">
                {pl.songs[0]?.coverUrl
                  ? <Image src={pl.songs[0].coverUrl} alt={pl.title} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                  : <Library className="h-4 w-4 text-vs-gray" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-vs-white truncate">{pl.title}</p>
                <p className="text-xs text-vs-gray">{pl.songs.length} songs</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
