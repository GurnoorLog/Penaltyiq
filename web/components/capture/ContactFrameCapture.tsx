"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { content } from "@/lib/content";
import { useSession } from "next-auth/react";
import { postCapture } from "@/lib/api";

interface ContactFrameCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPaused: boolean;
  onCapture: (data: any) => void;
}

export function ContactFrameCapture({ videoRef, isPaused, onCapture }: ContactFrameCaptureProps) {
  const { data: session } = useSession();
  const [kickingFoot, setKickingFoot] = useState<"right" | "left">("right");
  const [captured, setCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const fps = 30;
      const contactFrameIndex = Math.round(video.currentTime * fps);
      const framesBefore = Math.round(0.25 * fps);
      const framesAfter = Math.round(0.40 * fps);

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.3);

      const windowFrames = [];
      for (let i = -framesBefore; i <= framesAfter; i++) {
        windowFrames.push({
          t_offset_ms: Math.round((i / fps) * 1000),
          landmarks: Array.from({ length: 33 }, () => [0.5, 0.5]),
        });
      }

      const payload = {
        session_id: uuidv4(),
        user_id: session.user.id,
        captured_at: new Date().toISOString(),
        sport: "football",
        event_type: "penalty_kick_window",
        kicking_foot: kickingFoot,
        source_fps: fps,
        contact_frame_index: contactFrameIndex,
        contact_frame_thumbnail_base64: thumbnail,
        window: windowFrames,
      };

      const result = await postCapture(payload);
      setCaptured(true);
      onCapture(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel-lg p-4 space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--text-muted)]">{content.capture.kickingFootLabel}:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setKickingFoot("right")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${kickingFoot === "right" ? "accent-gradient text-white" : "glass-panel"}`}
          >
            {content.capture.rightFoot}
          </button>
          <button
            onClick={() => setKickingFoot("left")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${kickingFoot === "left" ? "accent-gradient text-white" : "glass-panel"}`}
          >
            {content.capture.leftFoot}
          </button>
        </div>
      </div>

      <button
        onClick={handleCapture}
        disabled={!isPaused || loading}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${captured ? "bg-green-500/20 text-green-400 border border-green-500/30" : loading ? "glass-panel opacity-60" : "accent-gradient text-white hover:opacity-90"} ${!isPaused && !loading ? "opacity-50" : ""}`}
      >
        {loading ? content.capture.processing : captured ? `${content.capture.captureSuccess} \u2705` : content.capture.contactFrameButton}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
