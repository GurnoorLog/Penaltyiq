import { describe, it, expect, vi, beforeEach } from "vitest";
import { postCapture, getMetrics, postChat, getHealth } from "../../lib/api";
import type { MovementWindowInput } from "../../lib/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("postCapture", () => {
  const input: MovementWindowInput = {
    session_id: "test-123",
    user_id: "user-1",
    captured_at: "2024-01-01T00:00:00Z",
    sport: "soccer",
    event_type: "penalty_kick",
    kicking_foot: "right",
    source_fps: 30,
    contact_frame_index: 45,
    window: [{ t_offset_ms: 0, landmarks: [[0.5, 0.5, 0.5]] }],
  };

  it("sends POST to /api/capture and returns CaptureResponse", async () => {
    const fakeResponse = {
      session_id: "test-123",
      technique_score: 72,
      sub_scores: {
        plant_leg_stability: 80,
        hip_rotation: 65,
        strike_leg_extension: 70,
        follow_through: 75,
        recovery_balance: 68,
      },
      raw_measurements: {
        swing_foot_peak_speed_norm_per_s: 3.2,
        hip_rotation_peak_deg: 34.5,
        plant_foot_lateral_drift_norm: 0.02,
        strike_leg_knee_extension_deg: 120.0,
        follow_through_range_deg: 45.0,
        torso_lean_at_contact_deg: 10.0,
        recovery_com_displacement_norm: 0.03,
      },
      tracking_confidence: 0.92,
      coaching: {
        summary: "Strong kick",
        strengths: ["Good hip rotation"],
        tips: ["Improve follow-through"],
        drill: "Practice slow-motion kicks",
      },
      coaching_error: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeResponse,
    });

    const result = await postCapture(input);

    expect(mockFetch).toHaveBeenCalledWith("http://127.0.0.1:8000/api/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(result.technique_score).toBe(72);
    expect(result.coaching!.strengths).toHaveLength(1);
    expect(result.coaching_error).toBeNull();
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid landmarks" }),
    });

    await expect(postCapture(input)).rejects.toThrow("Invalid landmarks");
  });
});

describe("getMetrics", () => {
  it("fetches and returns diagnostics", async () => {
    const fakeMetrics = {
      internet_connection: "online",
      local_pose_engine: "ready",
      local_bitnet_engine: "down",
      bitnet_endpoint: "http://127.0.0.1:8080",
      external_request_count: 5,
      cpu_percent: 23.4,
      ram_used_mb: 4096.0,
      inference_latency_ms: 120,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeMetrics,
    });

    const result = await getMetrics();
    expect(result.cpu_percent).toBe(23.4);
    expect(result.internet_connection).toBe("online");
  });
});

describe("postChat", () => {
  it("sends message and returns reply", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Focus on your plant foot." }),
    });

    const result = await postChat("session-1", "How can I improve?");
    expect(result.reply).toBe("Focus on your plant foot.");
  });
});

describe("getHealth", () => {
  it("returns backend status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "ok", version: "2.0.0" }),
    });

    const result = await getHealth();
    expect(result.status).toBe("ok");
  });
});
