'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Music2, Trash2, Loader2, CheckCircle2,
  AlertCircle, Image as ImageIcon, RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import { useUIStore } from '@/store/uiStore';
import { addSong, removeSong } from '@/lib/songService';
import { getSongs } from '@/lib/songService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { validateAudioFile, validateCoverFile, createCoverPreview } from '@/lib/uploadCover';
import type { Song } from '@/types';

const CONFIGURED = isSupabaseConfigured();

const LANGUAGES = ['Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'English', 'Other'];
const GENRES    = ['Tamil', 'Tamil Folk', 'Bollywood', 'Pop', 'Electronic', 'Chill', 'Classical', 'Lo-Fi', 'Fusion', 'Jazz', 'R&B', 'Other'];

type FormState = {
  title: string;
  artist: string;
  album: string;
  genre: string;
  language: string;
  year: string;
};

const defaultForm: FormState = {
  title: '', artist: '', album: '',
  genre: 'Tamil', language: 'Tamil',
  year: String(new Date().getFullYear()),
};

export default function AdminUploadPage() {
  const { addToast } = useUIStore();
  const [form, setForm]     = useState<FormState>(defaultForm);
  const [audioFile, setAudioFile]   = useState<File | null>(null);
  const [coverFile, setCoverFile]   = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [songs, setSongs]           = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const setField = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // ── Load songs ────────────────────────────────────────────
  const loadSongs = useCallback(async () => {
    if (!CONFIGURED) return;
    setLoadingSongs(true);
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (err) {
      addToast((err as Error).message || 'Failed to load songs', 'error');
    }
    setLoadingSongs(false);
  }, [addToast]);

  useEffect(() => { void loadSongs(); }, [loadSongs]);

  // ── Cover file change ─────────────────────────────────────
  const handleCoverChange = (file: File | null) => {
    if (!file) return;
    const validation = validateCoverFile(file);
    if (!validation.valid) { addToast(validation.error!, 'error'); return; }
    setCoverFile(file);
    // Revoke previous preview
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(createCoverPreview(file));
  };

  // ── Audio file change ─────────────────────────────────────
  const handleAudioChange = (file: File | null) => {
    if (!file) return;
    const validation = validateAudioFile(file);
    if (!validation.valid) { addToast(validation.error!, 'error'); return; }
    setAudioFile(file);
    // Auto-fill title from filename if empty
    if (!form.title.trim()) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setForm((f) => ({ ...f, title: name }));
    }
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CONFIGURED) { addToast('Supabase not configured', 'error'); return; }
    if (!audioFile)   { addToast('Please select an audio file', 'warning'); return; }
    if (!form.title.trim())  { addToast('Song title is required', 'warning'); return; }
    if (!form.artist.trim()) { addToast('Artist name is required', 'warning'); return; }

    setUploading(true);
    try {
      setUploadProgress('Uploading audio…');
      const song = await addSong({
        title:      form.title.trim(),
        artistName: form.artist.trim(),
        albumName:  form.album.trim() || undefined,
        genre:      form.genre || undefined,
        language:   form.language || undefined,
        year:       Number(form.year) || undefined,
        audioFile,
        coverFile:  coverFile ?? null,
      });

      addToast(`"${song.title}" uploaded successfully!`, 'success');
      setForm(defaultForm);
      setAudioFile(null);
      setCoverFile(null);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview('');
      if (audioRef.current) audioRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
      await loadSongs();
    } catch (err) {
      addToast((err as Error).message || 'Upload failed', 'error');
    }
    setUploadProgress('');
    setUploading(false);
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (song: Song) => {
    if (!confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
    try {
      await removeSong(song.id);
      setSongs((prev) => prev.filter((s) => s.id !== song.id));
      addToast('Song deleted', 'info');
    } catch (err) {
      addToast((err as Error).message || 'Delete failed', 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="fade-up min-h-screen">
      <TopBar title="Admin — Upload" />
      <div className="px-6 pb-12 max-w-3xl mx-auto">

        {/* Status badge */}
        <div className={`flex items-center gap-2 mt-6 mb-8 px-4 py-3 rounded-xl text-sm font-semibold ${
          CONFIGURED
            ? 'bg-vs-green/15 text-vs-green'
            : 'bg-amber-500/15 text-amber-400'
        }`}>
          {CONFIGURED
            ? <><CheckCircle2 className="h-4 w-4 shrink-0" /> Supabase connected — okhlbfsopsmzmzxidaub.supabase.co</>
            : <><AlertCircle  className="h-4 w-4 shrink-0" /> Supabase not configured — add env vars to .env.local</>
          }
        </div>

        {/* ── Upload form ─────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="bg-vs-elevated rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-black text-vs-white">Upload Song</h2>

          {/* Text fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="field-label">Song title *</label>
              <input value={form.title} onChange={setField('title')}
                placeholder="Midnight Dreams"
                className="field-input" required />
            </div>

            {/* Artist */}
            <div>
              <label className="field-label">Artist *</label>
              <input value={form.artist} onChange={setField('artist')}
                placeholder="A.R. Rahman"
                className="field-input" required />
            </div>

            {/* Album */}
            <div>
              <label className="field-label">Album</label>
              <input value={form.album} onChange={setField('album')}
                placeholder="Roja"
                className="field-input" />
            </div>

            {/* Year */}
            <div>
              <label className="field-label">Year</label>
              <input value={form.year} onChange={setField('year')}
                type="number" min="1900" max="2030" placeholder="2024"
                className="field-input" />
            </div>

            {/* Genre */}
            <div>
              <label className="field-label">Genre</label>
              <select value={form.genre} onChange={setField('genre')} className="field-input">
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="field-label">Language</label>
              <select value={form.language} onChange={setField('language')} className="field-input">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="field-label">Cover Image</label>
            <input ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)} />
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover" width={72} height={72}
                  className="rounded-xl object-cover shrink-0 ring-2 ring-vs-green/40" />
              ) : (
                <div className="h-[72px] w-[72px] rounded-xl bg-vs-hover flex items-center justify-center shrink-0">
                  <ImageIcon className="h-8 w-8 text-vs-gray" />
                </div>
              )}
              <div>
                <button type="button" onClick={() => coverRef.current?.click()}
                  className="text-sm font-semibold text-vs-green hover:underline">
                  {coverPreview ? 'Change cover' : 'Choose cover image'}
                </button>
                {coverFile && (
                  <p className="text-xs text-vs-gray mt-1">
                    {coverFile.name} — {(coverFile.size / 1024).toFixed(0)} KB
                  </p>
                )}
                <p className="text-xs text-vs-gray/60 mt-0.5">JPEG, PNG, WebP · max 10 MB</p>
              </div>
            </div>
          </div>

          {/* Audio file */}
          <div>
            <label className="field-label">Audio File *</label>
            <input ref={audioRef} type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
              className="hidden"
              onChange={(e) => handleAudioChange(e.target.files?.[0] ?? null)} />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => audioRef.current?.click()}
                className="flex items-center gap-2 text-sm font-semibold bg-vs-hover hover:bg-vs-border rounded-xl px-4 py-2.5 text-vs-white transition-colors">
                <Upload className="h-4 w-4" />
                {audioFile ? audioFile.name : 'Choose audio file'}
              </button>
              {audioFile && (
                <span className="text-xs text-vs-gray">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
            <p className="text-xs text-vs-gray/60 mt-1.5">MP3, WAV, M4A, OGG, FLAC · max 50 MB</p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={uploading || !CONFIGURED}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-vs-green text-black font-black text-sm hover:bg-vs-green/90 disabled:opacity-40 transition-colors">
            {uploading
              ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadProgress || 'Uploading…'}</>
              : <><Upload className="h-4 w-4" />Upload Song to Supabase</>
            }
          </button>
        </form>

        {/* ── Songs list ──────────────────────────────────── */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-vs-white">
              Uploaded Songs
              {songs.length > 0 && (
                <span className="ml-2 text-sm font-normal text-vs-gray">({songs.length})</span>
              )}
            </h2>
            <button onClick={loadSongs} disabled={!CONFIGURED || loadingSongs}
              className="flex items-center gap-1.5 text-sm text-vs-green hover:underline disabled:opacity-40">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingSongs ? 'animate-spin' : ''}`} />
              {loadingSongs ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {!CONFIGURED && (
            <div className="text-center py-12 text-vs-gray">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">Configure Supabase to manage songs</p>
            </div>
          )}

          {CONFIGURED && !loadingSongs && songs.length === 0 && (
            <div className="text-center py-12 text-vs-gray">
              <Music2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No songs uploaded yet</p>
              <p className="text-sm mt-1">Use the form above to upload your first song.</p>
            </div>
          )}

          <div className="space-y-2">
            {songs.map((song) => (
              <div key={song.id}
                className="flex items-center gap-3 px-4 py-3 bg-vs-elevated rounded-xl group hover:bg-vs-hover transition-colors">
                {song.coverUrl ? (
                  <Image src={song.coverUrl} alt={song.title} width={44} height={44}
                    className="rounded-lg object-cover shrink-0" unoptimized />
                ) : (
                  <div className="h-11 w-11 bg-vs-hover rounded-lg flex items-center justify-center shrink-0">
                    <Music2 className="h-5 w-5 text-vs-gray" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-vs-white truncate">{song.title}</p>
                  <p className="text-xs text-vs-gray truncate">
                    {song.artist}
                    {song.album && ` · ${song.album}`}
                    {song.genre && ` · ${song.genre}`}
                    {song.duration && ` · ${song.duration}`}
                  </p>
                </div>
                <button onClick={() => handleDelete(song)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-900/40 text-vs-gray hover:text-red-400 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inline CSS for shared field styles */}
      <style jsx global>{`
        .field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: rgb(var(--vs-gray, 179 179 179));
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .field-input {
          width: 100%;
          background: rgb(var(--vs-hover, 42 42 42));
          color: white;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.875rem;
          outline: none;
          border: 1.5px solid transparent;
          transition: border-color 0.15s;
        }
        .field-input:focus {
          border-color: #1db954;
        }
      `}</style>
    </div>
  );
}
