import React from 'react';

/**
 * VibeStream wordmark logo.
 * A geometric waveform icon (three bars of descending height, green)
 * beside bold "Vibe" (white) + "Stream" (green) text.
 *
 * Usage:
 *   <VibeLogo size={36} />          — with text
 *   <VibeLogo size={36} iconOnly /> — just the icon
 */
export default function VibeLogo({
  size = 36,
  iconOnly = false,
  className = '',
}: {
  size?: number;
  iconOnly?: boolean;
  className?: string;
}) {
  const green = '#1DB954';
  const s = size;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Icon: three waveform bars */}
      <svg
        width={s}
        height={s}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background rounded square */}
        <rect width="36" height="36" rx="9" fill={green} />

        {/* Waveform bars (left to right, taller in center) */}
        <rect x="7"  y="14" width="5" height="14" rx="2.5" fill="#000" />
        <rect x="15" y="8"  width="5" height="20" rx="2.5" fill="#000" />
        <rect x="23" y="11" width="5" height="17" rx="2.5" fill="#000" />

        {/* Subtle gloss */}
        <rect x="0" y="0" width="36" height="18" rx="9" fill="white" fillOpacity="0.07" />
      </svg>

      {/* Wordmark */}
      {!iconOnly && (
        <span
          style={{
            fontWeight: 900,
            fontSize: size * 0.5,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          <span style={{ color: '#ffffff' }}>Vibe</span>
          <span style={{ color: green }}>Stream</span>
        </span>
      )}
    </span>
  );
}
