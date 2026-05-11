'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import {
  addCustomSong,
  isExternalUrl,
  playerActions,
  readCustomSongs,
  removeSong,
  startSongStorageSync,
  usePlayerStore,
} from '@/store/playerStore';
import type { NewSongInput } from '@/types/music';

type FormState = {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  genre: string;
  language: string;
  year: string;
};

const initialFormState: FormState = {
  title: '',
  artist: '',
  album: '',
  coverUrl: '',
  audioUrl: '',
  duration: '',
  genre: '',
  language: '',
  year: String(new Date().getFullYear()),
};

const fieldClass =
  'h-12 w-full rounded-[8px] border border-white/10 bg-ink-900/75 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-aqua-300/60';

const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/45';

export default function ManageSongsPage() {
  const { songs, currentTrack } = usePlayerStore();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customSongIds, setCustomSongIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const syncCustomSongIds = () => {
      setCustomSongIds(new Set(readCustomSongs().map((song) => song.id)));
    };

    const stopSongStorageSync = startSongStorageSync();

    syncCustomSongIds();
    window.addEventListener('storage', syncCustomSongIds);
    window.addEventListener('vibestream:custom-songs-changed', syncCustomSongIds);

    return () => {
      stopSongStorageSync();
      window.removeEventListener('storage', syncCustomSongIds);
      window.removeEventListener('vibestream:custom-songs-changed', syncCustomSongIds);
    };
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const year = Number(form.year);
    const input: NewSongInput = {
      title: form.title.trim(),
      artist: form.artist.trim(),
      album: form.album.trim(),
      coverUrl: form.coverUrl.trim(),
      audioUrl: form.audioUrl.trim(),
      duration: form.duration.trim() || '0:00',
      genre: form.genre.trim(),
      language: form.language.trim(),
      year,
    };

    if (!input.title || !input.artist || !input.album || !input.genre || !input.language) {
      setError('Please fill in the song title, artist, album, genre, and language.');
      return;
    }

    if (!isExternalUrl(input.coverUrl)) {
      setError('Cover image URL must be a valid external http, https, blob, or data URL.');
      return;
    }

    if (!isExternalUrl(input.audioUrl)) {
      setError('Audio URL must be a valid external http, https, blob, or data URL.');
      return;
    }

    if (!Number.isFinite(year) || year < 1900 || year > 2100) {
      setError('Release year must be between 1900 and 2100.');
      return;
    }

    const newSong = addCustomSong(input);
    setForm(initialFormState);
    setMessage(`${newSong.title} was added to your local demo library.`);
  };

  return (
    <main className="min-h-screen px-4 pb-48 pt-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[8px] border border-white/10 bg-ink-950/45 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-aqua-400 font-black text-ink-950 shadow-glow">
              VS
            </span>
            <span>
              <span className="block text-lg font-black tracking-wide">VibeStream</span>
              <span className="block text-xs text-white/45">Manage Songs</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-aqua-300/50 hover:text-aqua-300"
            >
              Library
            </Link>
            <Link
              href="/manage-songs"
              className="rounded-full border border-ember-300/35 bg-ember-300/10 px-4 py-2 text-sm font-semibold text-ember-300"
            >
              Manage Songs
            </Link>
          </nav>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel rounded-[8px] p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-aqua-300">
              Demo admin
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Add songs with external audio URLs.
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/56">
              Songs added here are saved in localStorage on this browser and merged with the default songs from <span className="font-semibold text-white/80">src/data/songs.ts</span>.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Song title</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateField('title', event.currentTarget.value)}
                    className={fieldClass}
                    placeholder="Midnight Dreams"
                    required
                  />
                </label>
                <label>
                  <span className={labelClass}>Artist</span>
                  <input
                    value={form.artist}
                    onChange={(event) => updateField('artist', event.currentTarget.value)}
                    className={fieldClass}
                    placeholder="Aarav Beats"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Album</span>
                  <input
                    value={form.album}
                    onChange={(event) => updateField('album', event.currentTarget.value)}
                    className={fieldClass}
                    placeholder="Neon Nights"
                    required
                  />
                </label>
                <label>
                  <span className={labelClass}>Genre</span>
                  <input
                    value={form.genre}
                    onChange={(event) => updateField('genre', event.currentTarget.value)}
                    className={fieldClass}
                    placeholder="Chill"
                    required
                  />
                </label>
              </div>

              <label>
                <span className={labelClass}>Cover image URL</span>
                <input
                  type="url"
                  value={form.coverUrl}
                  onChange={(event) => updateField('coverUrl', event.currentTarget.value)}
                  className={fieldClass}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </label>

              <label>
                <span className={labelClass}>Audio URL</span>
                <input
                  type="url"
                  value={form.audioUrl}
                  onChange={(event) => updateField('audioUrl', event.currentTarget.value)}
                  className={fieldClass}
                  placeholder="https://your-cloud-host.com/song.mp3"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label>
                  <span className={labelClass}>Language</span>
                  <input
                    value={form.language}
                    onChange={(event) => updateField('language', event.currentTarget.value)}
                    className={fieldClass}
                    placeholder="English"
                    required
                  />
                </label>
                <label>
                  <span className={labelClass}>Year</span>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.year}
                    onChange={(event) => updateField('year', event.currentTarget.value)}
                    className={fieldClass}
                    required
                  />
                </label>
                <label>
                  <span className={labelClass}>Duration</span>
                  <input
                    value={form.duration}
                    onChange={(event) => updateField('duration', event.currentTarget.value)}
                    className={fieldClass}
                    placeholder="3:45"
                  />
                </label>
              </div>

              {error && (
                <p className="rounded-[8px] border border-berry-400/30 bg-berry-500/10 px-4 py-3 text-sm font-semibold text-berry-400">
                  {error}
                </p>
              )}
              {message && (
                <p className="rounded-[8px] border border-aqua-300/30 bg-aqua-300/10 px-4 py-3 text-sm font-semibold text-aqua-300">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="h-12 rounded-full bg-aqua-400 px-5 text-sm font-black text-ink-950 shadow-glow transition hover:bg-aqua-300"
              >
                Add Song
              </button>
            </form>
          </div>

          <section className="glass-panel rounded-[8px] p-5 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ember-300">
                  Library preview
                </p>
                <h2 className="mt-2 text-2xl font-black">{songs.length} songs</h2>
              </div>
              <p className="text-sm text-white/45">Remove any song for this browser.</p>
            </div>

            <div className="mt-5 grid gap-3">
              {songs.map((song) => {
                const isCustomSong = customSongIds.has(song.id);
                const isActive = currentTrack?.id === song.id;

                return (
                  <article
                    key={song.id}
                    className={`grid gap-3 rounded-[8px] border p-3 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center ${
                      isActive ? 'border-aqua-300/50 bg-aqua-300/10' : 'border-white/10 bg-white/[0.045]'
                    }`}
                  >
                    <img
                      src={song.coverUrl}
                      alt={`${song.title} cover`}
                      className="h-16 w-16 rounded-[8px] object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black">{song.title}</h3>
                      <p className="truncate text-sm text-white/50">
                        {song.artist} - {song.album}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="rounded-full bg-aqua-300/10 px-2.5 py-1 text-aqua-300">{song.genre}</span>
                        <span className="rounded-full bg-ember-300/10 px-2.5 py-1 text-ember-300">{song.language}</span>
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-white/55">{song.year}</span>
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-white/55">
                          {isCustomSong ? 'localStorage' : 'default'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => playerActions.selectTrack(song.id, true)}
                        className="rounded-full border border-aqua-300/35 bg-aqua-300/10 px-4 py-2 text-sm font-bold text-aqua-300 transition hover:bg-aqua-300 hover:text-ink-950"
                      >
                        Play
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const removalType = removeSong(song.id);

                          if (!removalType) {
                            setError('This song could not be removed. Refresh and try again.');
                            setMessage(null);
                            return;
                          }

                          setMessage(
                            removalType === 'custom'
                              ? `${song.title} was removed from localStorage.`
                              : `${song.title} was removed from this browser library.`
                          );
                          setError(null);
                        }}
                        className="rounded-full border border-berry-400/35 bg-berry-500/10 px-4 py-2 text-sm font-bold text-berry-400 transition hover:bg-berry-400 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
