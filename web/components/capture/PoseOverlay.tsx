"use client";

import { useEffect, useRef } from "react";

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const LANDMARK_COLORS: Record<string, string> = {
  face: "#FFD700",
  torso: "#00FFFF",
  kicking: "#FF4444",
  plant: "#44FF44",
  arms: "#FFFFFF",
};

const REGION_MAP: Record<number, string> = {
  0: "face", 1: "face", 2: "face", 3: "face", 4: "face",
  5: "face", 6: "face", 7: "face", 8: "face", 9: "face",
  10: "face",
  11: "arms", 12: "arms",
  13: "arms", 14: "arms",
  15: "arms", 16: "arms",
  17: "arms", 18: "arms",
  19: "arms", 20: "arms",
  21: "arms", 22: "arms",
  23: "torso", 24: "torso",
  25: "plant", 26: "kicking",
  27: "plant", 28: "kicking",
  29: "plant", 30: "kicking",
  31: "plant", 32: "kicking",
};

export function PoseOverlay({ videoRef }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
    };

    video.addEventListener("loadedmetadata", resize);
    window.addEventListener("resize", resize);

    return () => {
      video.removeEventListener("loadedmetadata", resize);
      window.removeEventListener("resize", resize);
    };
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
