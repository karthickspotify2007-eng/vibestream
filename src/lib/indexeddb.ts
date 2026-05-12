// IndexedDB helpers for persisting local song files across browser sessions

const DB_NAME    = 'vibestream-local';
const DB_VERSION = 1;
const STORE_NAME = 'audio-files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function saveFileToIDB(id: string, file: File): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx   = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.put({ id, file });
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function getFileFromIDB(id: string): Promise<File | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.get(id);
      req.onsuccess = () => resolve(req.result?.file ?? null);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteFileFromIDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function getAllIDBIds(): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req   = store.getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/** Extract audio duration and basic metadata from a File */
export function readFileMeta(file: File): Promise<{
  duration: number;
  title: string;
  artist: string;
  album: string;
}> {
  return new Promise((resolve) => {
    const url   = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src   = url;
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      URL.revokeObjectURL(url);
      // Basic filename parsing: "Artist - Title.mp3" or "Title.mp3"
      const base  = file.name.replace(/\.[^/.]+$/, '');
      const parts = base.split(' - ');
      resolve({
        duration: isFinite(duration) ? duration : 0,
        title:  parts.length >= 2 ? parts.slice(1).join(' - ').trim() : base.trim(),
        artist: parts.length >= 2 ? parts[0].trim() : 'Unknown Artist',
        album:  'Local Library',
      });
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      const base = file.name.replace(/\.[^/.]+$/, '');
      resolve({ duration: 0, title: base, artist: 'Unknown Artist', album: 'Local Library' });
    });
  });
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
