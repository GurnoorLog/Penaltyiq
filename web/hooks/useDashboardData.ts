"use client";

import { useState, useEffect } from "react";
import { CoachingOutput, DiagnosticsPayload, getMetrics } from "../lib/api";

export interface DashboardData {
  techniqueScore: number;
  trackingConfidence: number;
  subScores: {
    plant_leg_stability: number;
    hip_rotation: number;
    strike_leg_extension: number;
    follow_through: number;
    recovery_balance: number;
  } | null;
  rawMeasurements: {
    swing_foot_peak_speed_norm_per_s: number;
    hip_rotation_peak_deg: number;
    plant_foot_lateral_drift_norm: number;
    strike_leg_knee_extension_deg: number;
    follow_through_range_deg: number;
    torso_lean_at_contact_deg: number;
    recovery_com_displacement_norm: number;
  } | null;
  coaching: CoachingOutput | null;
}

const MOCK_DATA: DashboardData = {
  techniqueScore: 78,
  trackingConfidence: 0.94,
  subScores: {
    plant_leg_stability: 82,
    hip_rotation: 71,
    strike_leg_extension: 88,
    follow_through: 69,
    recovery_balance: 74,
  },
  rawMeasurements: {
    swing_foot_peak_speed_norm_per_s: 3.42,
    hip_rotation_peak_deg: 34.2,
    plant_foot_lateral_drift_norm: 0.014,
    strike_leg_knee_extension_deg: 118.7,
    follow_through_range_deg: 46.5,
    torso_lean_at_contact_deg: 9.1,
    recovery_com_displacement_norm: 0.031,
  },
  coaching: {
    summary: "Strong hip rotation but the plant leg loses stability just after contact.",
    strengths: ["Excellent hip rotation generates strong power transfer."],
    tips: ["Add slightly more plant-knee flexion to improve post-contact stability."],
    drill: "Slow-motion plant-and-freeze drill: kick and hold your finishing position for 3 seconds, 10 reps.",
  },
};

const MOCK_DIAGNOSTICS: DiagnosticsPayload = {
  internet_connection: "offline",
  local_pose_engine: "ready",
  local_bitnet_engine: "ready",
  bitnet_endpoint: "127.0.0.1:8080",
  external_request_count: 0,
  cpu_percent: 42.3,
  ram_used_mb: 1820,
  inference_latency_ms: 2350,
};

export function useDashboardData() {
  const [data] = useState<DashboardData>(MOCK_DATA);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload>(MOCK_DIAGNOSTICS);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const metrics = await getMetrics();
        setDiagnostics(metrics);
      } catch {
        // Use mock data if backend unreachable
        setDiagnostics((prev) => ({
          ...prev,
          local_bitnet_engine: "down" as const,
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { data, diagnostics };
}
