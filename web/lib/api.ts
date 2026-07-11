const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export interface LandmarkFrame {
  t_offset_ms: number;
  landmarks: number[][];
}

export interface MovementWindowInput {
  session_id: string;
  user_id: string;
  captured_at: string;
  sport: string;
  event_type: string;
  kicking_foot: string;
  source_fps: number;
  contact_frame_index: number;
  contact_frame_thumbnail_base64?: string;
  window: LandmarkFrame[];
}

export interface SubScores {
  plant_leg_stability: number;
  hip_rotation: number;
  strike_leg_extension: number;
  follow_through: number;
  recovery_balance: number;
}

export interface RawMeasurements {
  swing_foot_peak_speed_norm_per_s: number;
  hip_rotation_peak_deg: number;
  plant_foot_lateral_drift_norm: number;
  strike_leg_knee_extension_deg: number;
  follow_through_range_deg: number;
  torso_lean_at_contact_deg: number;
  recovery_com_displacement_norm: number;
}

export interface CoachingOutput {
  summary: string;
  strengths: string[];
  tips: string[];
  drill: string;
}

export interface CaptureResponse {
  session_id: string;
  technique_score: number;
  sub_scores: SubScores;
  raw_measurements: RawMeasurements;
  tracking_confidence: number;
  coaching: CoachingOutput | null;
  coaching_error: string | null;
}

export interface DiagnosticsPayload {
  internet_connection: string;
  local_pose_engine: string;
  local_bitnet_engine: string;
  bitnet_endpoint: string;
  external_request_count: number;
  cpu_percent: number;
  ram_used_mb: number;
  inference_latency_ms: number;
}

export interface ChatResponse {
  reply: string;
}

export async function postCapture(data: MovementWindowInput): Promise<CaptureResponse> {
  const res = await fetch(`${API_BASE}/api/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Capture failed");
  }
  return res.json();
}

export async function getMetrics(): Promise<DiagnosticsPayload> {
  const res = await fetch(`${API_BASE}/api/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export async function postChat(sessionId: string, message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function getHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}
