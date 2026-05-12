'use client';

import { useRef, useState } from 'react';
import { Upload, FolderOpen, Music, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLibraryStore } from '@/store/libraryStore';
import { useUIStore } from '@/store/uiStore';
import { readFileMeta, formatDuration } from '@/lib/indexeddb';
import { generateId } from '@/lib/utils';
import type { LocalSong } from '@/types';

const SUPPORTED = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];

export default function LocalSongImporter({ onImported }: { onImported?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { addLocalSong } = useLibraryStore();
  const { addToast } = useUIStore();

  const processFiles = async (files: File[]) => {
    const audioFiles = files.filter((f) =>
      SUPPORTED.some((ext) => f.name.toLowerCase().endsWith(ext)) ||
      f.type.startsWith('audio/')
    );
    if (!audioFiles.length) {
      addToast('No supported audio files found', 'warning');
      return;
    }
    setLoading(true);
    let imported = 0;
    for (const file of audioFiles) {
      try {
        const meta = await readFileMeta(file);
        const id   = generateId();
        const url  = URL.createObjectURL(file);
        const song: LocalSong = {
          id,
          title:          meta.title,
          artist:         meta.artist,
          album:          meta.album,
          genre:          'Local',
          language:       'Unknown',
          duration:       formatDuration(meta.duration),
          durationSeconds: meta.duration,
          coverUrl:       '/icon-192.png',
          audioUrl:       url,
          fileName:       file.name,
          fileSize:       file.size,
          fileType:       file.type,
          importedAt:     new Date().toISOString(),
          isLocal:        true,
          year:           new Date().getFullYear(),
        };
        await addLocalSong(song, file);
        imported++;
      } catch {}
    }
    setLoading(false);
    if (imported > 0) {
      addToast(`${imported} song${imported > 1 ? 's' : ''} imported`, 'success');
      onImported?.();
    } else {
      addToast('Import failed', 'error');
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={loading}
        className={`w-full flex flex-col items-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed transition-all ${
          dragOver
            ? 'border-vs-green bg-vs-green/10'
            : 'border-vs-border hover:border-vs-gray bg-vs-elevated/50 hover:bg-vs-elevated'
        }`}
      >
        {loading ? (
          <Loader2 className="h-8 w-8 text-vs-green animate-spin" />
        ) : dragOver ? (
          <Music className="h-8 w-8 text-vs-green" />
        ) : (
          <FolderOpen className="h-8 w-8 text-vs-gray" />
        )}
        <div className="text-center">
          <p className="text-sm font-semibold text-vs-white">
            {loading ? 'Importing…' : dragOver ? 'Drop to import' : 'Import local songs'}
          </p>
          <p className="text-xs text-vs-gray mt-1">
            {SUPPORTED.join(', ')} supported
          </p>
        </div>
      </motion.button>
    </div>
  );
}
