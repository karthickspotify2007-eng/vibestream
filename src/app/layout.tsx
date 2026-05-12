import type { Metadata, Viewport } from 'next';
import './globals.css';
import LeftLibrary from '@/components/layout/LeftLibrary';
import MobileNav from '@/components/layout/MobileNav';
import BottomPlayer from '@/components/player/BottomPlayer';
import FullscreenPlayer from '@/components/player/FullscreenPlayer';
import QueuePanel from '@/components/player/QueuePanel';
import AudioEngine from '@/components/player/AudioEngine';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import ToastProvider from '@/components/ui/Toast';
import AddToPlaylistModal from '@/components/modals/AddToPlaylistModal';
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal';

export const metadata: Metadata = {
  title: { default: 'Vibestream', template: '%s | Vibestream' },
  description: 'Premium music streaming — feel the vibe.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Vibestream' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
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
        {/* Invisible utilities */}
        <ServiceWorkerRegister />
        <AudioEngine />
        <FullscreenPlayer />
        <QueuePanel />
        <AddToPlaylistModal />
        <CreatePlaylistModal />
        <ToastProvider />

        {/* App shell */}
        <div className="flex h-screen w-screen overflow-hidden flex-col">
          <div className="flex flex-1 overflow-hidden">
            <LeftLibrary />
            {/* Main scroll area */}
            <main
              id="main-scroll"
              className="flex-1 overflow-y-auto bg-vs-surface pb-[90px] md:pb-[90px] mb-16 md:mb-0"
            >
              {children}
            </main>
          </div>
          {/* Bottom player */}
          <BottomPlayer />
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
