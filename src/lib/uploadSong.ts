import { uploadFile } from './supabase';

export type UploadSongResult = {
  audioUrl: string;
  path: string;
};

/**
 * Uploads an audio file to the "audio" Supabase storage bucket.
 * Returns the public URL and the storage path.
 */
export async function uploadSongFile(file: File): Promise<UploadSongResult> {
  const timestamp = Date.now();
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${timestamp}-${sanitized}`;

  const audioUrl = await uploadFile('audio', path, file);
  return { audioUrl, path };
}

/**
 * Returns an estimated duration string from an audio File object.
 * Uses the browser Audio API — must run client-side.
 */
export function getAudioDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = url;
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      const s = Math.floor(audio.duration);
      const m = Math.floor(s / 60);
      const r = s % 60;
      resolve(`${m}:${r.toString().padStart(2, '0')}`);
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve('0:00');
    });
  });
}
