'use client';

import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TopBar({ title }: { title?: string }) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 glass">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="h-8 w-8 rounded-full bg-vs-black/60 grid place-items-center text-vs-white hover:bg-vs-hover transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => router.forward()}
          className="h-8 w-8 rounded-full bg-vs-black/60 grid place-items-center text-vs-white hover:bg-vs-hover transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {title && (
          <h1 className="ml-2 font-bold text-vs-white text-lg">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="h-8 w-8 rounded-full bg-vs-black/60 grid place-items-center text-vs-gray hover:text-vs-white">
          <Bell className="h-4 w-4" />
        </button>
        <Link
          href="/library"
          className="h-8 w-8 rounded-full bg-vs-green grid place-items-center text-vs-black font-bold text-xs hover:bg-vs-green-light transition-colors"
        >
          VS
        </Link>
      </div>
    </div>
  );
}
