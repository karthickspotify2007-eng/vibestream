# VibeStream

VibeStream is an original dark premium music web app that plays songs from external audio links. It does not use Spotify branding, logos, or copyrighted UI assets.

## Run The App

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Adding Songs With Cloud Links

Default songs live in `src/data/songs.ts`. Paste your direct cloud audio link into the `audioUrl` field:

```ts
{
  id: "song-001",
  title: "Midnight Dreams",
  artist: "Aarav Beats",
  album: "Neon Nights",
  coverUrl: "https://images.unsplash.com/...",
  audioUrl: "PASTE_MY_CLOUD_AUDIO_LINK_HERE",
  duration: "3:45",
  genre: "Chill",
  language: "English",
  year: 2026
}
```

For demo/admin use, open `/manage-songs` and add songs through the form. Songs added there are stored in browser `localStorage` and automatically merged with the default songs from `src/data/songs.ts`.

## Links That Work Best

Use direct links to playable audio files:

- MP3: `https://your-cloud-host.com/song.mp3`
- WAV: `https://your-cloud-host.com/song.wav`
- OGG: `https://your-cloud-host.com/song.ogg`
- Cloud links that return the raw audio file with an audio content type
- Claude public artifact links only when the public link points directly to an audio file

Links that open an HTML preview page, require login, block hotlinking, or deny media requests may not play in the browser. When a link is invalid or blocked, VibeStream shows: `This audio link cannot be played.`

## How To Add More Songs

Option 1: edit `src/data/songs.ts` and add another `Song` object with a unique `id`.

Option 2: use the Manage Songs page:

1. Go to `/manage-songs`.
2. Paste the song title, artist, album, cover image URL, audio URL, genre, language, year, and optional duration.
3. Click `Add Song`.
4. Return to the library or press `Play` from the preview list.

To remove songs for demo/admin testing, open `/manage-songs` and click `Remove` on any row. Locally added songs are deleted from `localStorage`; default songs are hidden in this browser with a localStorage removed-ID list, so you do not need to edit code.

## Testing Audio Playback

1. Start the app with `npm run dev`.
2. Open the library page.
3. Click a song row or press the play button in the player.
4. Test pause, next, previous, seek, volume, repeat, and shuffle.
5. Add a broken URL from `/manage-songs` to confirm the error toast appears.

The app uses `HTMLAudioElement` directly, does not autoplay before user interaction, and keeps all demo song additions client-side with no backend.
