"use client";

import { useState, useRef } from "react";
import { content } from "@/lib/content";
import { PoseOverlay } from "./PoseOverlay";
import { FrameScrubber } from "./FrameScrubber";
import { ContactFrameCapture } from "./ContactFrameCapture";

export function VideoUploader() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handlePauseChange = (paused: boolean) => {
    setIsPaused(paused);
  };

  if (!videoUrl) {
    return (
      <div className="glass-panel-lg p-12 text-center">
        <label className="cursor-pointer inline-flex flex-col items-center gap-4">
          <div className="text-5xl opacity-50">{'\u{1F3AC}'}</div>
          <span className="text-lg font-semibold">{content.capture.uploadLabel}</span>
          <span className="text-sm text-[var(--text-muted)]">{content.capture.uploadHint}</span>
          <div className="px-6 py-2.5 rounded-xl accent-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Choose File
          </div>
          <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative glass-panel-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full rounded-lg"
          onPause={() => handlePauseChange(true)}
          onPlay={() => handlePauseChange(false)}
        />
        <PoseOverlay videoRef={videoRef} />
      </div>
      <FrameScrubber videoRef={videoRef} />
      <ContactFrameCapture
        videoRef={videoRef}
        isPaused={isPaused}
        onCapture={(data) => console.log("Capture data:", data)}
      />
    </div>
  );
}
