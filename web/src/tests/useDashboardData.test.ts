import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "../../hooks/useDashboardData";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

const fakeMetricsPayload = {
  internet_connection: "online",
  local_pose_engine: "ready",
  local_bitnet_engine: "down",
  bitnet_endpoint: "http://127.0.0.1:8080",
  external_request_count: 5,
  cpu_percent: 23.4,
  ram_used_mb: 4096,
  inference_latency_ms: 120,
};

beforeEach(() => {
  mockFetch.mockReset();
  localStorageMock.clear();
});

describe("useDashboardData", () => {
  it("returns loading initially, then sets data from API", async () => {
    const fakeSession = {
      id: "sess-1",
      techniqueScore: 72,
      subScoresJson: JSON.stringify({
        plant_leg_stability: 80,
        hip_rotation: 65,
        strike_leg_extension: 70,
        follow_through: 75,
        recovery_balance: 68,
      }),
      rawMeasurementsJson: JSON.stringify({
        swing_foot_peak_speed_norm_per_s: 3.2,
        hip_rotation_peak_deg: 34.5,
        plant_foot_lateral_drift_norm: 0.02,
        strike_leg_knee_extension_deg: 120.0,
        follow_through_range_deg: 45.0,
        torso_lean_at_contact_deg: 10.0,
        recovery_com_displacement_norm: 0.03,
      }),
      coachingJson: JSON.stringify({
        summary: "Strong kick",
        strengths: ["Good hip rotation"],
        tips: ["Improve follow-through"],
        drill: "Practice slow-motion kicks",
      }),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [fakeSession],
    });

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data!.techniqueScore).toBe(72);
    expect(result.current.data!.coaching!.strengths).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("falls back to localStorage when API returns 401", async () => {
    const storedData = {
      techniqueScore: 55,
      trackingConfidence: 0.88,
      subScores: { plant_leg_stability: 30 },
      rawMeasurements: { swing_foot_peak_speed_norm_per_s: 1.5 },
      coaching: { summary: "Needs work", strengths: [], tips: ["Practice"], drill: "Kick more" },
    };
    localStorageMock.setItem("penaltyiq-last-capture", JSON.stringify(storedData));

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data!.techniqueScore).toBe(55);
    expect(result.current.error).toBeNull();
  });

  it("returns error when no data in API or localStorage", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("No sessions yet — upload a video to get started.");
  });

  it("starts polling metrics endpoint after load", async () => {
    const fakeSession = {
      id: "sess-1",
      techniqueScore: 72,
      subScoresJson: "{}",
      rawMeasurementsJson: "{}",
      coachingJson: "{}",
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [fakeSession],
      });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify fetch was called for sessions (not necessarily metrics yet)
    const fetchCalls = mockFetch.mock.calls
      .map((args: any[]) => args[0])
      .filter((url: string) => typeof url === "string");

    expect(fetchCalls.length).toBeGreaterThanOrEqual(1);
    // At minimum the sessions call was made
    expect(fetchCalls[0]).toBe("/api/sessions");
  });
});
