'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';

const tabs = [
  { href: '/',            icon: Home,       label: 'Home'    },
  { href: '/search',      icon: Search,     label: 'Search'  },
  { href: '/library',     icon: Library,    label: 'Library' },
  { href: '/local-songs', icon: FolderOpen, label: 'Local'   },
];

export default function MobileNav() {
  const pathname = usePathname();
  // Selector: only re-render when song presence changes, not every time-tick
  const hasSong = usePlayerStore((s) => !!s.currentSong);
  // Shift up when the mini player is visible so tabs aren't hidden behind it
  const bottomOffset = hasSong ? 'bottom-[90px]' : 'bottom-0';

  return (
    <nav className={`md:hidden fixed ${bottomOffset} left-0 right-0 z-40 glass-player flex transition-all duration-300`}>
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors',
              active ? 'text-vs-white' : 'text-vs-gray hover:text-vs-white/70'
            )}
          >
            <div className={cn(
              'relative flex items-center justify-center w-10 h-7 rounded-full transition-all',
              active && 'bg-white/10'
            )}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
              {active && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-vs-green" />
              )}
            </div>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
