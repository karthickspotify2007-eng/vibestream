'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';

const NAV = [
  { href: '/',       label: 'Home',    icon: Home    },
  { href: '/search', label: 'Search',  icon: Search  },
  { href: '/library',label: 'Library', icon: Library },
];

export default function MobileNav() {
  const pathname = usePathname();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const playerOffset = currentSong ? 'bottom-[145px]' : 'bottom-0';

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 z-20 md:hidden glass border-t border-vs-border',
        'bottom-0'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
            >
              <Icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  active ? 'text-vs-white' : 'text-vs-gray'
                )}
                fill={active ? 'currentColor' : 'none'}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold transition-colors',
                  active ? 'text-vs-white' : 'text-vs-gray'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
