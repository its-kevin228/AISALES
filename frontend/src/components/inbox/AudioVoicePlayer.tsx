"use client";

import { useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioVoicePlayerProps {
  duration?: string;
}

export function AudioVoicePlayer({ duration = "0:24" }: AudioVoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 p-2.5 rounded bg-surface-2 border border-hairline w-64 max-w-full">
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition-colors flex-shrink-0"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        {/* Fake waveform bars */}
        <div className="flex items-center gap-0.5 h-4">
          {[40, 60, 25, 80, 50, 90, 30, 70, 85, 40, 65, 95, 30, 50, 75, 20, 60, 45, 80, 35].map(
            (height, i) => (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className={`w-1 rounded-full transition-colors ${
                  (i / 20) * 100 <= progress ? "bg-primary" : "bg-hairline-strong"
                }`}
              />
            )
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-ink-subtle">
          <span>{isPlaying ? "0:09" : "0:00"}</span>
          <span>{duration}</span>
        </div>
      </div>

      <Volume2 className="w-3.5 h-3.5 text-ink-subtle flex-shrink-0" />
    </div>
  );
}
