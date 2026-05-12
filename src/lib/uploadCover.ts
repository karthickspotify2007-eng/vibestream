import { uploadFile } from './supabase';

export type UploadCoverResult = {
  coverUrl: string;
  path: string;
};

/**
 * Uploads an image file to the "covers" Supabase storage bucket.
 * Returns the public URL and the storage path.
 */
export async function uploadCoverFile(file: File): Promise<UploadCoverResult> {
  const timestamp = Date.now();
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${timestamp}-${sanitized}`;

  const coverUrl = await uploadFile('covers', path, file);
  return { coverUrl, path };
}

/**
 * Generates a local object URL preview for an image file.
 * Remember to call URL.revokeObjectURL(url) when done.
 */
export function createCoverPreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Validates that a file is an acceptable cover image format
 * and within the size limit (10 MB).
 */
export function validateCoverFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!ALLOWED.includes(file.type)) {
    return { valid: false, error: 'Cover must be JPEG, PNG, WebP or GIF' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Cover image must be under 10 MB' };
  }
  return { valid: true };
}

/**
 * Validates that a file is an acceptable audio format
 * and within the size limit (50 MB).
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/aac', 'audio/x-m4a'];
  const EXT = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
  const hasAllowedType = ALLOWED.includes(file.type);
  const hasAllowedExt = EXT.some((e) => file.name.toLowerCase().endsWith(e));
  if (!hasAllowedType && !hasAllowedExt) {
    return { valid: false, error: 'Audio must be MP3, WAV, OGG, M4A, FLAC or AAC' };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: 'Audio file must be under 50 MB' };
  }
  return { valid: true };
}
