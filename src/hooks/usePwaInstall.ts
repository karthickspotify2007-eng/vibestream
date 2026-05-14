'use client';

import { useState, useEffect } from 'react';

/** Typed wrapper around the non-standard BeforeInstallPromptEvent */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Module-level reference so the prompt survives component remounts
let _deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * usePwaInstall — exposes whether the PWA can be installed + a trigger function.
 *
 * Usage:
 *   const { canInstall, install, installed } = usePwaInstall();
 *   <button onClick={install} hidden={!canInstall}>Install app</button>
 */
export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed,  setInstalled]  = useState(false);

  useEffect(() => {
    // If a prompt is already stored (component remounted), reflect that
    if (_deferredPrompt) setCanInstall(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      _deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const onAppInstalled = () => {
      _deferredPrompt = null;
      setCanInstall(false);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled',         onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled',         onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!_deferredPrompt) return;
    try {
      await _deferredPrompt.prompt();
      const { outcome } = await _deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        _deferredPrompt = null;
        setCanInstall(false);
        setInstalled(true);
      }
    } catch {}
  };

  return { canInstall, install, installed };
}
