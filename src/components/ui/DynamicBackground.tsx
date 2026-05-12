'use client';

import { useEffect, useRef } from 'react';

interface Props {
  imageUrl: string;
  className?: string;
}

/** Extracts the dominant color from an image via Canvas and applies a gradient bg. */
export default function DynamicBackground({ imageUrl, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageUrl || !ref.current) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 8, 8);
        const data = ctx.getImageData(0, 0, 8, 8).data;
        let r = 0, g = 0, b = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2];
        }
        r = Math.floor(r / pixels);
        g = Math.floor(g / pixels);
        b = Math.floor(b / pixels);
        // Darken the color so text stays readable
        const factor = 0.45;
        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);
        if (ref.current) {
          ref.current.style.background = `linear-gradient(180deg, rgb(${r},${g},${b}) 0%, #121212 50%, #121212 100%)`;
        }
      } catch {}
    };
    img.onerror = () => {
      if (ref.current) {
        ref.current.style.background = 'linear-gradient(180deg, #282828 0%, #121212 50%, #121212 100%)';
      }
    };
  }, [imageUrl]);

  return (
    <div
      ref={ref}
      className={`absolute inset-0 transition-[background] duration-700 pointer-events-none ${className}`}
    />
  );
}
