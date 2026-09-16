"use client";

import React from "react";

interface OmniSalesLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function OmniSalesLogo({
  size = 28,
  showText = true,
  className = "",
}: OmniSalesLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark */}
      <div 
        className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 p-1.5 shadow-sm"
        style={{ width: size + 6, height: size + 6 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="omniGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#828fff" />
              <stop offset="50%" stopColor="#5e6ad2" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Hexagonal/Orbital Outer Ring */}
          <path
            d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
            stroke="url(#omniGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-95"
          />

          {/* Dynamic AI Pulse Core */}
          <path
            d="M16 8L18.5 13.5L24 16L18.5 18.5L16 24L13.5 18.5L8 16L13.5 13.5L16 8Z"
            fill="url(#omniGrad)"
          />

          {/* Central Neural Synapse Dot */}
          <circle cx="16" cy="16" r="2.2" fill="url(#accentGrad)" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-ink">
              OmniSales
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase bg-primary/15 text-primary border border-primary/30 tracking-wide">
              AI
            </span>
          </div>
          <span className="text-[10px] text-ink-muted uppercase tracking-wider font-mono mt-1">
            Commerce Copilot
          </span>
        </div>
      )}
    </div>
  );
}
