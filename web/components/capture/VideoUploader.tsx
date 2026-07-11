"use client";

import { useState, useRef } from "react";
import { content } from "@/lib/content";
import { PoseOverlay } from "./PoseOverlay";
import { FrameScrubber } from "./FrameScrubber";
import { ContactFrameCapture } from "./ContactFrameCapture";
import { Skeleton3DView } from "./Skeleton3DView";

export function VideoUploader() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [frozenLandmarks, setFrozenLandmarks] = useState<number[][] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarksRef = useRef<number[][]>([]);

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
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setViewMode("2d")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            viewMode === "2d" ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--text-muted)]"
          }`}
        >
          2D Overlay
        </button>
        <button
          onClick={() => setViewMode("3d")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            viewMode === "3d" ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--text-muted)]"
          }`}
        >
          3D Skeleton
        </button>
      </div>
      <div className={viewMode === "2d" ? "relative glass-panel-lg overflow-hidden" : "hidden"}>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full rounded-lg"
            onPause={() => handlePauseChange(true)}
            onPlay={() => { handlePauseChange(false); setFrozenLandmarks(null); }}
          />
          <PoseOverlay videoRef={videoRef} landmarksRef={landmarksRef} />
      </div>
      <div className={viewMode === "3d" ? "block" : "hidden"}>
        <Skeleton3DView landmarksRef={landmarksRef} visible={true} frozenLandmarks={frozenLandmarks} />
      </div>
      <FrameScrubber videoRef={videoRef} />
      <ContactFrameCapture
        videoRef={videoRef}
        isPaused={isPaused}
        landmarksRef={landmarksRef}
        onCapture={(data) => {
          setFrozenLandmarks(landmarksRef.current.map((landmark) => [...landmark]));
          console.log("Capture data:", data);
          localStorage.setItem("penaltyiq-last-capture", JSON.stringify({
            techniqueScore: data.technique_score,
            subScores: data.sub_scores,
            rawMeasurements: data.raw_measurements,
            coaching: data.coaching,
            trackingConfidence: data.tracking_confidence ?? 0.94,
          }));
        }}
      />
    </div>
  );
}
