import type { Metadata } from 'next';
import AudioPlayer from '@/components/player/AudioPlayer';
import './globals.css';

export const metadata: Metadata = {
  title: 'VibeStream',
  description: 'A premium music app for external cloud audio links.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AudioPlayer />
      </body>
    </html>
  );
}
