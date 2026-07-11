"use client";

import { useState, useEffect, useCallback } from "react";
import { getMetrics, type SubScores, type RawMeasurements, type CoachingOutput, type DiagnosticsPayload } from "../lib/api";

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
  sessionId: string | null;
}



interface StoredCapture {
  techniqueScore: number;
  subScores: SubScores;
  rawMeasurements: RawMeasurements;
  coaching: CoachingOutput | null;
  trackingConfidence: number;
}

const STORAGE_KEY = "penaltyiq-last-capture";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromStorage = useCallback((): DashboardData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed: StoredCapture = JSON.parse(stored);
      return {
        techniqueScore: parsed.techniqueScore,
        trackingConfidence: parsed.trackingConfidence ?? 0.94,
        subScores: parsed.subScores ?? null,
        rawMeasurements: parsed.rawMeasurements ?? null,
        coaching: parsed.coaching ?? null,
        sessionId: null,
      };
    } catch {
      return null;
    }
  }, []);

  // Fetch the latest session from the API
  const fetchFromApi = useCallback(async (): Promise<DashboardData | null> => {
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) return null;
      const sessions = await res.json();
      if (!sessions || sessions.length === 0) return null;

      const latest = sessions[0];
      return {
        techniqueScore: latest.techniqueScore ?? 0,
        trackingConfidence: 0.94,
        subScores: latest.subScoresJson ? JSON.parse(latest.subScoresJson) : null,
        rawMeasurements: latest.rawMeasurementsJson ? JSON.parse(latest.rawMeasurementsJson) : null,
        coaching: latest.coachingJson ? JSON.parse(latest.coachingJson) : null,
        sessionId: latest.id,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Try API first, fall back to localStorage
      let result = await fetchFromApi();
      if (!result) {
        result = loadFromStorage();
      }

      if (!cancelled) {
        if (result) {
          setData(result);
        } else {
          setError("No sessions yet — upload a video to get started.");
        }
        setLoading(false);
      }
    }

    load();

    // Poll diagnostics every 5s
    const interval = setInterval(async () => {
      try {
        const metrics = await getMetrics();
        if (!cancelled) setDiagnostics(metrics);
      } catch {
        if (!cancelled) {
          setDiagnostics((prev) => prev ? { ...prev, local_bitnet_engine: "down" as const } : null);
        }
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchFromApi, loadFromStorage]);

  return { data, diagnostics, loading, error };
}
