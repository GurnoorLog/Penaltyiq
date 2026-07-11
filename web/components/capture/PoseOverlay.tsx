"use client";

import { useEffect, useRef, useCallback } from "react";

interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
}

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarksRef: React.MutableRefObject<number[][]>;
  onPoseReady?: (ready: boolean) => void;
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
  5: "face", 6: "face", 7: "face", 8: "face", 9: "face", 10: "face",
  11: "arms", 12: "arms", 13: "arms", 14: "arms", 15: "arms", 16: "arms",
  17: "arms", 18: "arms", 19: "arms", 20: "arms", 21: "arms", 22: "arms",
  23: "torso", 24: "torso", 25: "plant", 26: "kicking",
  27: "plant", 28: "kicking", 29: "plant", 30: "kicking", 31: "plant", 32: "kicking",
};

const SKELETON_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],
  [11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[17,19],
  [12,14],[14,16],[16,18],[16,20],[16,22],[18,20],
  [11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],
  [27,29],[28,30],[29,31],[30,32],[27,31],[28,32],
];

export function PoseOverlay({ videoRef, landmarksRef, onPoseReady }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseLandmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const lastTime = useRef(-1);

  const getColor = useCallback((idx: number): string => {
    const region = REGION_MAP[idx] ?? "arms";
    return LANDMARK_COLORS[region] ?? "#FFFFFF";
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loadMediaPipe = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const W = window as any;
        const vision = W.Vision;
        if (!vision) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm/vision_bundle.js";
            script.crossOrigin = "anonymous";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load MediaPipe"));
            document.head.appendChild(script);
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const V = (window as any).Vision;
        if (!V) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileset = await (V.FilesetResolver as any).forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm/"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const landmarker = await (V.PoseLandmarker as any).createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        poseLandmarkerRef.current = landmarker;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (landmarker as any).poseReady = true;
        onPoseReady?.(true);
      } catch (e) {
        console.warn("MediaPipe init failed:", e);
        onPoseReady?.(false);
      }
    };

    const detectPose = () => {
      const pl = poseLandmarkerRef.current;
      if (!pl || !video || video.paused || video.ended) return;
      if (video.currentTime === lastTime.current) return;
      lastTime.current = video.currentTime;

      try {
        const result = pl.detectForVideo(video, performance.now());
        if (result.landmarks && result.landmarks.length > 0) {
          const lm = result.landmarks[0] as MediaPipeLandmark[];
          landmarksRef.current = lm.map((p) => [p.x, p.y, p.z ?? 0]);
          drawSkeleton(ctx, canvas, lm);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        // skip frame errors silently
      }
    };

    const drawSkeleton = (
      c: CanvasRenderingContext2D,
      cv: HTMLCanvasElement,
      landmarks: MediaPipeLandmark[]
    ) => {
      const rect = cv.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cv.width = rect.width * dpr;
      cv.height = rect.height * dpr;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
      c.scale(dpr, dpr);

      SKELETON_CONNECTIONS.forEach(([i, j]) => {
        if (landmarks[i] && landmarks[j]) {
          const x1 = landmarks[i].x * rect.width;
          const y1 = landmarks[i].y * rect.height;
          const x2 = landmarks[j].x * rect.width;
          const y2 = landmarks[j].y * rect.height;
          c.beginPath();
          c.moveTo(x1, y1);
          c.lineTo(x2, y2);
          c.strokeStyle = getColor(i);
          c.lineWidth = 2;
          c.stroke();
        }
      });

      landmarks.forEach((pt: MediaPipeLandmark, idx: number) => {
        const x = pt.x * rect.width;
        const y = pt.y * rect.height;
        c.beginPath();
        c.arc(x, y, 4, 0, Math.PI * 2);
        c.fillStyle = getColor(idx);
        c.shadowBlur = 8;
        c.shadowColor = getColor(idx);
        c.fill();
        c.shadowBlur = 0;
      });
    };

    const loop = () => {
      detectPose();
      rafRef.current = requestAnimationFrame(loop);
    };

    const resize = () => {
      if (canvas && video) {
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
      }
    };

    video.addEventListener("loadedmetadata", resize);
    window.addEventListener("resize", resize);
    loadMediaPipe();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      video.removeEventListener("loadedmetadata", resize);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      const pl = poseLandmarkerRef.current;
      if (pl) pl.close();
    };
  }, [videoRef, landmarksRef, onPoseReady, getColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
