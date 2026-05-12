'use client';

import { use } from 'react';
import { Play, Pause, Heart, Plus, MoreHorizontal, Music2, Mic2, Disc3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import SongRow from '@/components/ui/SongRow';
import DynamicBackground from '@/components/ui/DynamicBackground';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useUIStore } from '@/store/uiStore';
import { songs as allSongs } from '@/data/songs';

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const song = allSongs.find((s) => s.id === id);
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const { openAddToPlaylist } = useUIStore();

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Music2 className="h-16 w-16 text-vs-gray" />
        <h1 className="text-xl font-black text-vs-white">Song not found</h1>
      </div>
    );
  }

  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);
  const sameSongs = allSongs.filter((s) => s.artist === song.artist && s.id !== song.id).slice(0, 8);

  return (
    <div className="fade-up min-h-screen relative">
      <div className="relative overflow-hidden">
        <DynamicBackground imageUrl={song.coverUrl} />
        <div className="relative z-10">
          <TopBar />
          <div className="px-6 pt-6 pb-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 max-w-4xl mx-auto">
              {/* Album art */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative h-52 w-52 sm:h-60 sm:w-60 rounded-2xl overflow-hidden shadow-2xl shrink-0"
              >
                <Image src={song.coverUrl} alt={song.title} fill className="object-cover" unoptimized />
              </motion.div>

              {/* Info */}
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-vs-white/70 uppercase tracking-widest font-semibold mb-2">Song</p>
                <h1 className="text-4xl sm:text-5xl font-black text-vs-white mb-2 leading-tight">{song.title}</h1>
                <p className="text-lg text-vs-gray font-semibold">{song.artist}</p>
                <p className="text-sm text-vs-gray mt-1">{song.album} · {song.year} · {song.genre}</p>

                {/* Pills */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                  {[song.language, song.genre].filter(Boolean).map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-vs-gray">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-6">
                  <button
                    onClick={() => isActive ? togglePlay() : playSong(song, allSongs)}
                    className="h-14 w-14 rounded-full bg-vs-green flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
                  >
                    {isActive && isPlaying
                      ? <Pause className="h-6 w-6 text-black fill-black" />
                      : <Play className="h-6 w-6 text-black fill-black ml-0.5" />
                    }
                  </button>
                  <button
                    onClick={() => openAddToPlaylist(song)}
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-vs-white transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => toggleLike(song)}
                    className={`h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110 ${
                      liked ? 'text-vs-green' : 'text-vs-white'
                    }`}
                  >
                    <Heart className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More from artist */}
      {sameSongs.length > 0 && (
        <div className="px-6 py-8">
          <div className="flex items-center gap-2 mb-5">
            <Mic2 className="h-5 w-5 text-vs-green" />
            <h2 className="section-title">More by {song.artist}</h2>
          </div>
          <div className="space-y-1">
            {sameSongs.map((s, i) => (
              <SongRow key={s.id} song={s} queue={sameSongs} index={i} showAlbum />
            ))}
          </div>
        </div>
      )}

      {/* Credits */}
      <div className="px-6 pb-10">
        <div className="bg-vs-elevated rounded-xl p-5 max-w-lg">
          <h3 className="font-bold text-vs-white mb-3">Credits</h3>
          <div className="space-y-2">
            {[
              { label: 'Artist', value: song.artist },
              { label: 'Album', value: song.album },
              { label: 'Genre', value: song.genre },
              { label: 'Year', value: String(song.year) },
              { label: 'Language', value: song.language },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-xs text-vs-gray uppercase tracking-wider font-semibold w-20">{label}</span>
                <span className="text-sm text-vs-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
