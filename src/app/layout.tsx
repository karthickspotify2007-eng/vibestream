import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import MiniPlayer from '@/components/player/MiniPlayer';
import FullscreenPlayer from '@/components/player/FullscreenPlayer';
import QueuePanel from '@/components/player/QueuePanel';
import AudioEngine from '@/components/player/AudioEngine';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: { default: 'Vibestream', template: '%s | Vibestream' },
  description: 'Premium music streaming — feel the vibe.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Vibestream' },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-vs-black text-vs-white overflow-hidden">
        <ServiceWorkerRegister />
        <AudioEngine />
        <FullscreenPlayer />
        <QueuePanel />

        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar />

          {/* Main scroll area */}
          <main className="flex-1 overflow-y-auto pb-[90px] md:pb-[90px] mb-16 md:mb-0">
            {children}
          </main>
        </div>

        <MiniPlayer />
        <MobileNav />
      </body>
    </html>
  );
}
