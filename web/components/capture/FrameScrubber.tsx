"use client";

import { useState, useEffect } from "react";

interface FrameScrubberProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function FrameScrubber({ videoRef }: FrameScrubberProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const update = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", update);
    return () => video.removeEventListener("timeupdate", update);
  }, [videoRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const pct = parseFloat(e.target.value);
    video.currentTime = (pct / 100) * video.duration;
    setProgress(pct);
  };

  return (
    <div className="glass-panel p-3">
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        onChange={handleChange}
        className="w-full accent-[var(--accent)]"
      />
      <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
        <span>Seek</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
