'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { playerActions, startSongStorageSync, usePlayerStore } from '@/store/playerStore';
import type { Song } from '@/types/music';

const allFilter = 'All';

const uniqueOptions = (songs: Song[], key: keyof Pick<Song, 'genre' | 'language'>) => {
  return [allFilter, ...Array.from(new Set(songs.map((song) => song[key]).filter(Boolean))).sort()];
};

export default function Home() {
  const { songs, currentTrack, isPlaying } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState(allFilter);
  const [language, setLanguage] = useState(allFilter);

  useEffect(() => {
    return startSongStorageSync();
  }, []);

  const genres = useMemo(() => uniqueOptions(songs, 'genre'), [songs]);
  const languages = useMemo(() => uniqueOptions(songs, 'language'), [songs]);

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [song.title, song.artist, song.album, song.genre, song.language]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesGenre = genre === allFilter || song.genre === genre;
      const matchesLanguage = language === allFilter || song.language === language;

      return matchesQuery && matchesGenre && matchesLanguage;
    });
  }, [genre, language, query, songs]);

  return (
    <main className="min-h-screen overflow-x-hidden px-4 pb-48 pt-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[8px] border border-white/10 bg-ink-950/45 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <Link href="/" className="group flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-aqua-400 font-black text-ink-950 shadow-glow">
              VS
            </span>
            <span>
              <span className="block text-lg font-black tracking-wide">VibeStream</span>
              <span className="block text-xs text-white/45">External link music library</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-aqua-300/35 bg-aqua-300/10 px-4 py-2 text-sm font-semibold text-aqua-300"
            >
              Library
            </Link>
            <Link
              href="/manage-songs"
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-ember-300/50 hover:text-ember-300"
            >
              Manage Songs
            </Link>
          </nav>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel rounded-[8px] p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aqua-300">
              Original cloud audio player
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              VibeStream turns your external song links into a polished music library.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">
              Add MP3, WAV, OGG, Claude public artifact audio links, or direct cloud-hosted audio URLs without editing the player every time.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/manage-songs"
                className="rounded-full bg-aqua-400 px-5 py-3 text-sm font-black text-ink-950 shadow-glow transition hover:bg-aqua-300"
              >
                Add Song Link
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (songs[0]) {
                    playerActions.selectTrack(songs[0].id, true);
                  }
                }}
                className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white/80 transition hover:border-aqua-300/50 hover:text-aqua-300"
              >
                Play First Track
              </button>
            </div>
          </div>

          <aside className="glass-panel rounded-[8px] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ember-300">
              Now selected
            </p>
            <div className="mt-5 overflow-hidden rounded-[8px] border border-white/10 bg-black/20">
              <div className="aspect-square bg-white/[0.04]">
                {currentTrack?.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={`${currentTrack.title} cover`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-4xl font-black text-aqua-300">
                    VS
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="truncate text-2xl font-black">{currentTrack?.title ?? 'No song selected'}</h2>
                <p className="mt-1 truncate text-sm text-white/55">
                  {currentTrack ? `${currentTrack.artist} - ${currentTrack.album}` : 'Choose a track from the list'}
                </p>
                {currentTrack && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-aqua-300/10 px-3 py-1 text-aqua-300">{currentTrack.genre}</span>
                    <span className="rounded-full bg-ember-300/10 px-3 py-1 text-ember-300">{currentTrack.language}</span>
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-white/60">{currentTrack.year}</span>
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-white/60">
                      {isPlaying ? 'Playing' : 'Ready'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 glass-panel rounded-[8px] p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search title, artist, album, genre..."
                className="h-12 w-full rounded-[8px] border border-white/10 bg-ink-900/75 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-aqua-300/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Genre</span>
              <select
                value={genre}
                onChange={(event) => setGenre(event.currentTarget.value)}
                className="h-12 w-full rounded-[8px] border border-white/10 bg-ink-900/75 px-4 text-sm text-white outline-none transition focus:border-aqua-300/60"
              >
                {genres.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45">Language</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.currentTarget.value)}
                className="h-12 w-full rounded-[8px] border border-white/10 bg-ink-900/75 px-4 text-sm text-white outline-none transition focus:border-aqua-300/60"
              >
                {languages.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Songs</h2>
              <p className="text-sm text-white/45">{filteredSongs.length} track links available</p>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredSongs.map((song, index) => {
              const isActive = currentTrack?.id === song.id;

              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => playerActions.selectTrack(song.id, true)}
                  className={`grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-[8px] border p-3 text-left transition sm:grid-cols-[46px_64px_minmax(0,1.6fr)_minmax(120px,0.8fr)_100px_92px] ${
                    isActive
                      ? 'border-aqua-300/55 bg-aqua-300/10 shadow-glow'
                      : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.075]'
                  }`}
                >
                  <span className="hidden text-center text-sm font-black text-white/35 sm:block">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="h-14 w-14 overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.06]">
                    <img src={song.coverUrl} alt={`${song.title} cover`} className="h-full w-full object-cover" />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-base font-black text-white">{song.title}</span>
                    <span className="block truncate text-sm text-white/48">{song.artist}</span>
                  </span>

                  <span className="hidden min-w-0 text-sm text-white/50 sm:block">
                    <span className="block truncate">{song.album}</span>
                    <span className="block truncate text-xs text-white/35">{song.genre}</span>
                  </span>

                  <span className="hidden text-sm font-semibold text-white/45 sm:block">{song.language}</span>
                  <span className="hidden text-right text-sm font-semibold text-white/45 sm:block">{song.duration}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
