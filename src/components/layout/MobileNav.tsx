'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/',            icon: Home,       label: 'Home'    },
  { href: '/search',      icon: Search,     label: 'Search'  },
  { href: '/library',     icon: Library,    label: 'Library' },
  { href: '/local-songs', icon: FolderOpen, label: 'Local'   },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/10 flex">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors',
              active ? 'text-vs-white' : 'text-vs-gray'
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
