'use client';

import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Upload, Music2, Image as ImageIcon,
  Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useUIStore } from '@/store/uiStore';
import { addSong } from '@/lib/songService';
import { validateAudioFile, validateCoverFile, createCoverPreview } from '@/lib/uploadCover';
import { isSupabaseConfigured } from '@/lib/supabase';

const CONFIGURED = isSupabaseConfigured();

const LANGUAGES = ['Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'English', 'Other'];
const GENRES    = [
  'Tamil', 'Tamil Folk', 'Bollywood', 'Pop', 'Electronic',
  'Chill', 'Classical', 'Lo-Fi', 'Fusion', 'Jazz', 'R&B', 'Other',
];

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

export default function UploadSongModal() {
  const { modal, closeModal, addToast } = useUIStore();
  const isOpen = modal === 'uploadSong';

  const [form, setForm]           = useState<FormState>(defaultForm);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [step, setStep]           = useState<'idle' | 'audio' | 'cover' | 'db' | 'done'>('idle');

  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const setField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCoverChange = (file: File | null) => {
    if (!file) return;
    const v = validateCoverFile(file);
    if (!v.valid) { addToast(v.error!, 'error'); return; }
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(createCoverPreview(file));
  };

  const handleAudioChange = (file: File | null) => {
    if (!file) return;
    const v = validateAudioFile(file);
    if (!v.valid) { addToast(v.error!, 'error'); return; }
    setAudioFile(file);
    if (!form.title.trim()) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setForm((f) => ({ ...f, title: name }));
    }
  };

  const handleClose = () => {
    if (uploading) return;
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setForm(defaultForm);
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview('');
    setStep('idle');
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CONFIGURED) { addToast('Supabase not configured', 'error'); return; }
    if (!audioFile)   { addToast('Please choose an audio file', 'warning'); return; }
    if (!form.title.trim())  { addToast('Song title is required', 'warning'); return; }
    if (!form.artist.trim()) { addToast('Artist name is required', 'warning'); return; }

    setUploading(true);
    setStep('audio');
    try {
      setStep('cover');
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
      setStep('done');
      addToast(`"${song.title}" uploaded successfully! 🎵`, 'success');
      setTimeout(() => { handleClose(); }, 1200);
    } catch (err) {
      addToast((err as Error).message || 'Upload failed', 'error');
      setStep('idle');
    }
    setUploading(false);
  };

  const stepLabel: Record<typeof step, string> = {
    idle:  'Upload Song',
    audio: 'Uploading audio…',
    cover: 'Uploading cover…',
    db:    'Saving to database…',
    done:  'Done! ✓',
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 z-[100] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]
                       w-full max-w-md bg-[#181818] rounded-2xl shadow-2xl overflow-hidden
                       max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-vs-green/20 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-vs-green" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Upload Song</h2>
                  <p className="text-xs text-vs-gray mt-0.5">Saves to Supabase storage</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={uploading}
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-vs-gray hover:text-white transition-colors disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Supabase status */}
            {!CONFIGURED && (
              <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Supabase not configured — songs will not be saved online
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* Cover + basic info row */}
              <div className="flex gap-4 items-start">
                {/* Cover picker */}
                <button
                  type="button"
                  onClick={() => coverRef.current?.click()}
                  className="relative h-24 w-24 rounded-xl overflow-hidden shrink-0 bg-vs-hover hover:bg-vs-border transition-colors group"
                >
                  {coverPreview ? (
                    <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <ImageIcon className="h-7 w-7 text-vs-gray group-hover:text-vs-white transition-colors" />
                      <span className="text-[10px] text-vs-gray group-hover:text-vs-white font-semibold">Cover</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </button>
                <input ref={coverRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)} />

                {/* Title + Artist */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="upload-label">Song Title *</label>
                    <input value={form.title} onChange={setField('title')}
                      placeholder="e.g. Munbe Vaa"
                      className="upload-input" required />
                  </div>
                  <div>
                    <label className="upload-label">Artist *</label>
                    <input value={form.artist} onChange={setField('artist')}
                      placeholder="e.g. A.R. Rahman"
                      className="upload-input" required />
                  </div>
                </div>
              </div>

              {/* Album + Year row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="upload-label">Album</label>
                  <input value={form.album} onChange={setField('album')}
                    placeholder="e.g. Sillunu Oru Kaadhal"
                    className="upload-input" />
                </div>
                <div>
                  <label className="upload-label">Year</label>
                  <input value={form.year} onChange={setField('year')}
                    type="number" min="1900" max="2030"
                    className="upload-input" />
                </div>
              </div>

              {/* Genre + Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="upload-label">Genre</label>
                  <select value={form.genre} onChange={setField('genre')} className="upload-input">
                    {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="upload-label">Language</label>
                  <select value={form.language} onChange={setField('language')} className="upload-input">
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Audio file picker */}
              <div>
                <label className="upload-label">Audio File *</label>
                <input ref={audioRef} type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                  className="hidden"
                  onChange={(e) => handleAudioChange(e.target.files?.[0] ?? null)} />
                <button
                  type="button"
                  onClick={() => audioRef.current?.click()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all
                    ${audioFile
                      ? 'border-vs-green/50 bg-vs-green/8 text-vs-white'
                      : 'border-white/15 hover:border-white/30 bg-vs-hover text-vs-gray hover:text-vs-white'
                    }`}
                >
                  {audioFile ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-vs-green shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold truncate">{audioFile.name}</p>
                        <p className="text-xs text-vs-gray">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Music2 className="h-5 w-5 shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-semibold">Choose audio file</p>
                        <p className="text-xs opacity-60">MP3, WAV, M4A, OGG, FLAC · max 50 MB</p>
                      </div>
                    </>
                  )}
                </button>
              </div>

              {/* Upload progress bar (shown during upload) */}
              <AnimatePresence>
                {uploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-vs-hover rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Loader2 className="h-4 w-4 text-vs-green animate-spin shrink-0" />
                        <p className="text-sm font-semibold text-vs-white">{stepLabel[step]}</p>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-vs-green rounded-full"
                          initial={{ width: '0%' }}
                          animate={{
                            width: step === 'audio' ? '40%'
                              : step === 'cover' ? '70%'
                              : step === 'db'    ? '90%'
                              : step === 'done'  ? '100%'
                              : '0%',
                          }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 shrink-0 border-t border-white/8">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-full border border-white/15 text-sm font-bold text-vs-gray hover:text-vs-white hover:border-white/30 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading || !audioFile || !form.title.trim() || !form.artist.trim()}
                  className="flex-2 flex-grow flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-vs-green text-black font-black text-sm hover:bg-vs-green/90 disabled:opacity-40 transition-colors"
                >
                  {uploading
                    ? <><Loader2 className="h-4 w-4 animate-spin" />{stepLabel[step]}</>
                    : <><Upload className="h-4 w-4" />Upload</>
                  }
                </button>
              </div>
            </div>
          </motion.div>

          {/* Scoped styles */}
          <style jsx global>{`
            .upload-label {
              display: block;
              font-size: 0.68rem;
              font-weight: 700;
              color: #b3b3b3;
              text-transform: uppercase;
              letter-spacing: 0.07em;
              margin-bottom: 5px;
            }
            .upload-input {
              width: 100%;
              background: #2a2a2a;
              color: white;
              border-radius: 8px;
              padding: 9px 11px;
              font-size: 0.83rem;
              outline: none;
              border: 1.5px solid transparent;
              transition: border-color 0.15s;
            }
            .upload-input:focus {
              border-color: #1db954;
            }
            .upload-input option {
              background: #282828;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
