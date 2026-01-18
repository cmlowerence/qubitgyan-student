import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // We use CSS variables for colors to allow dark mode overrides if needed later
  // But strictly adhering to your brand colors for now:
  const c = {
    gold: "#F59E0B",
    goldLight: "#FCD34D",
    slate900: "#0F172A", 
  };

  return (
    <div className={cn("select-none relative z-10", className)}>
      <svg 
        width="160" 
        height="48" 
        viewBox="0 0 160 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <defs>
          <linearGradient id="staticGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.gold} />
            <stop offset="50%" stopColor={c.goldLight} />
            <stop offset="100%" stopColor={c.gold} />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- ICON --- */}
        <g transform="translate(4, 4)">
          <path 
            d="M20 2 A18 18 0 1 1 6.5 32.5" 
            stroke={c.gold} 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          <path 
            d="M20 12 V28 M20 28 L28 36" 
            stroke={c.slate900} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="4" fill={c.gold} filter="url(#glow)" />
          <circle cx="6.5" cy="32.5" r="2" fill={c.slate900} />
        </g>

        {/* --- QUBIT (Typography) --- */}
        <g transform="translate(50, 14)">
          <path d="M8 0 H4 A4 4 0 0 0 0 4 V10 A4 4 0 0 0 4 14 H8 A4 4 0 0 0 12 10 V4 A4 4 0 0 0 8 0 Z M9 11 L13 15" stroke={c.slate900} strokeWidth="2.5" fill="none" />
          <path d="M17 0 V10 A4 4 0 0 0 21 14 H24 A4 4 0 0 0 28 10 V0" stroke={c.slate900} strokeWidth="2.5" fill="none" />
          <path d="M33 0 V14 M33 0 H38 A3.5 3.5 0 0 1 38 7 H33 M33 14 H39 A3.5 3.5 0 0 0 39 7 H33" stroke={c.slate900} strokeWidth="2.5" fill="none" />
          <path d="M48 0 V14" stroke={c.slate900} strokeWidth="3" strokeLinecap="round" />
          <path d="M54 0 H64 M59 0 V14" stroke={c.slate900} strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* --- GYAN (Hindi Text) --- */}
        <text
          x="50"
          y="38"
          fill={c.gold}
          style={{ 
            fontFamily: '"Noto Sans Devanagari", "Segoe UI", Tahoma, sans-serif',
            fontSize: '12px',
            fontWeight: '900',
            letterSpacing: '0.1em'
          }}
        >
          ज्ञान
        </text>
        
        {/* Underline for GYAN */}
        <path 
          d="M82 35 H115" 
          stroke={c.gold} 
          strokeWidth="1.5" 
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
      </svg>
    </div>
  );
}
