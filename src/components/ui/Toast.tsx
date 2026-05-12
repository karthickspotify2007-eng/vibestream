'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};
const COLORS = {
  success: 'bg-[#1DB954] text-black',
  error:   'bg-[#e91429] text-white',
  info:    'bg-[#0d72ea] text-white',
  warning: 'bg-amber-500 text-black',
};

export default function ToastProvider() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl text-sm font-semibold pointer-events-auto ${COLORS[toast.type]}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
