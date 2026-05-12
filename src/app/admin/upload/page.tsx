'use client';

import { useState, useRef } from 'react';
import { Upload, Music2, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import { uploadFile, insertSong, fetchSongs, deleteSong } from '@/lib/supabase';
import { useUIStore } from '@/store/uiStore';

type UploadedSong = {
  id: string;
  title: string;
  artist_id?: string;
  cover_url?: string;
  audio_url: string;
  genre?: string;
  duration?: string;
  created_at?: string;
};

const SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminUploadPage() {
  const { addToast } = useUIStore();
  const [form, setForm] = useState({
    title: '', artist: '', album: '', genre: '', language: 'Tamil',
    year: String(new Date().getFullYear()), duration: '',
  });
  const [audioFile,  setAudioFile]  = useState<File | null>(null);
  const [coverFile,  setCoverFile]  = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [songs, setSongs]   = useState<UploadedSong[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const loadSongs = async () => {
    setLoadingSongs(true);
    try {
      const data = await fetchSongs();
      setSongs(data as UploadedSong[]);
    } catch {}
    setLoadingSongs(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) { addToast('Select an audio file', 'warning'); return; }
    if (!form.title.trim() || !form.artist.trim()) { addToast('Title and artist are required', 'warning'); return; }
    if (!SUPABASE_CONFIGURED) { addToast('Supabase not configured — set env vars', 'error'); return; }
    setLoading(true);
    try {
      const ts = Date.now();
      const audioUrl = await uploadFile('audio', `${ts}-${audioFile.name}`, audioFile);
      let coverUrl = '';
      if (coverFile) coverUrl = await uploadFile('covers', `${ts}-${coverFile.name}`, coverFile);
      await insertSong({
        title: form.title.trim(),
        audio_url: audioUrl,
        cover_url: coverUrl || undefined,
        genre:    form.genre,
        language: form.language,
        year:     Number(form.year) || undefined,
        duration: form.duration,
      } as Parameters<typeof insertSong>[0]);
      addToast('Song uploaded successfully!', 'success');
      setForm({ title: '', artist: '', album: '', genre: '', language: 'Tamil', year: String(new Date().getFullYear()), duration: '' });
      setAudioFile(null); setCoverFile(null); setCoverPreview('');
      loadSongs();
    } catch (err) {
      addToast((err as Error).message || 'Upload failed', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteSong(id);
      setSongs((s) => s.filter((x) => x.id !== id));
      addToast('Song deleted', 'info');
    } catch (err) {
      addToast((err as Error).message, 'error');
    }
  };

  return (
    <div className="fade-up min-h-screen">
      <TopBar title="Admin — Upload" />
      <div className="px-6 pb-10 max-w-3xl mx-auto">
        {/* Status badge */}
        <div className={`flex items-center gap-2 mt-6 mb-8 px-4 py-2.5 rounded-xl text-sm font-semibold ${
          SUPABASE_CONFIGURED ? 'bg-vs-green/15 text-vs-green' : 'bg-amber-500/15 text-amber-400'
        }`}>
          {SUPABASE_CONFIGURED
            ? <><CheckCircle2 className="h-4 w-4" /> Supabase connected</>
            : <><AlertCircle  className="h-4 w-4" /> Supabase not configured — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local</>
          }
        </div>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="bg-vs-elevated rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-black text-vs-white">Upload Song</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'title', label: 'Song title *', placeholder: 'Midnight Dreams' },
              { key: 'artist', label: 'Artist *', placeholder: 'A.R. Rahman' },
              { key: 'album', label: 'Album', placeholder: 'Roja' },
              { key: 'genre', label: 'Genre', placeholder: 'Tamil' },
              { key: 'language', label: 'Language', placeholder: 'Tamil' },
              { key: 'year', label: 'Year', placeholder: '2024' },
              { key: 'duration', label: 'Duration', placeholder: '3:45' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-vs-gray mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleField(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-vs-hover text-vs-white placeholder-vs-gray rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vs-green"
                />
              </div>
            ))}
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-xs font-semibold text-vs-gray mb-1.5 uppercase tracking-wider">Cover Image</label>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)} />
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover" width={64} height={64} className="rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-vs-hover flex items-center justify-center shrink-0">
                  <Music2 className="h-7 w-7 text-vs-gray" />
                </div>
              )}
              <button type="button" onClick={() => coverRef.current?.click()}
                className="text-sm font-semibold text-vs-green hover:underline">
                {coverPreview ? 'Change cover' : 'Choose cover'}
              </button>
            </div>
          </div>

          {/* Audio file */}
          <div>
            <label className="block text-xs font-semibold text-vs-gray mb-1.5 uppercase tracking-wider">Audio File *</label>
            <input ref={audioRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
              className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => audioRef.current?.click()}
                className="flex items-center gap-2 text-sm font-semibold bg-vs-hover hover:bg-vs-border rounded-lg px-4 py-2.5 text-vs-white transition-colors">
                <Upload className="h-4 w-4" />
                {audioFile ? audioFile.name : 'Choose audio file'}
              </button>
              {audioFile && (
                <span className="text-xs text-vs-gray">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</span>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading || !SUPABASE_CONFIGURED}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-vs-green text-black font-black hover:bg-vs-green-light disabled:opacity-40 transition-colors">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Upload Song</>}
          </button>
        </form>

        {/* Uploaded songs list */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-vs-white">Uploaded Songs</h2>
            <button onClick={loadSongs} disabled={!SUPABASE_CONFIGURED}
              className="text-sm text-vs-green hover:underline disabled:opacity-40">
              {loadingSongs ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          {!SUPABASE_CONFIGURED && (
            <p className="text-vs-gray text-sm">Configure Supabase to manage songs.</p>
          )}
          <div className="space-y-2">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center gap-3 px-4 py-3 bg-vs-elevated rounded-xl group">
                {song.cover_url ? (
                  <Image src={song.cover_url} alt={song.title} width={40} height={40} className="rounded object-cover shrink-0" unoptimized />
                ) : (
                  <div className="h-10 w-10 bg-vs-hover rounded flex items-center justify-center shrink-0">
                    <Music2 className="h-5 w-5 text-vs-gray" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-vs-white truncate">{song.title}</p>
                  <p className="text-xs text-vs-gray truncate">{song.genre} · {song.duration}</p>
                </div>
                <button onClick={() => handleDelete(song.id, song.title)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-900/50 text-vs-gray hover:text-red-400 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
