import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockUseDashboardData = vi.fn();
vi.mock("../../hooks/useDashboardData", () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

vi.mock("@/components/dashboard/StatWidget", () => ({
  StatWidget: ({ icon, label, value }: any) => (
    <div data-testid="stat-widget">{icon} {label}: {value}</div>
  ),
}));

vi.mock("@/components/dashboard/CoachPanel", () => ({
  CoachPanel: () => <div data-testid="coach-panel" />,
}));

vi.mock("@/components/dashboard/Dock", () => ({
  Dock: () => <div data-testid="dock" />,
}));

vi.mock("@/components/dashboard/UtilityIcons", () => ({
  UtilityIcons: () => <div data-testid="utility-icons" />,
}));

vi.mock("@/components/dashboard/mobile/WidgetStack", () => ({
  WidgetStack: () => <div data-testid="widget-stack" />,
}));

vi.mock("@/components/dashboard/mobile/CoachSheet", () => ({
  CoachSheet: () => <div data-testid="coach-sheet" />,
}));

vi.mock("@/components/dashboard/mobile/TabBar", () => ({
  TabBar: () => <div data-testid="tab-bar" />,
}));

import HaalandDashboard from "../../app/dashboard/haaland/page";

describe("HaalandDashboard", () => {
  it("shows loading spinner while data loads", () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      diagnostics: null,
      loading: true,
      error: null,
    });

    render(<HaalandDashboard />);
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("shows empty state when there is an error and no data", () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      diagnostics: null,
      loading: false,
      error: "No sessions yet — upload a video to get started.",
    });

    render(<HaalandDashboard />);
    expect(screen.getByText("No Sessions Yet")).toBeInTheDocument();
    expect(screen.getByText("Upload a Kick")).toBeInTheDocument();
  });

  it("shows empty state when data is null without error", () => {
    mockUseDashboardData.mockReturnValue({
      data: null,
      diagnostics: null,
      loading: false,
      error: null,
    });

    render(<HaalandDashboard />);
    expect(screen.getByText("No Sessions Yet")).toBeInTheDocument();
  });

  it("renders dashboard with real data, coach panel and dock", () => {
    mockUseDashboardData.mockReturnValue({
      data: {
        techniqueScore: 72,
        trackingConfidence: 0.94,
        subScores: {
          plant_leg_stability: 80,
          hip_rotation: 65,
          strike_leg_extension: 70,
          follow_through: 75,
          recovery_balance: 68,
        },
        rawMeasurements: {
          swing_foot_peak_speed_norm_per_s: 3.2,
          hip_rotation_peak_deg: 34.5,
          plant_foot_lateral_drift_norm: 0.02,
          strike_leg_knee_extension_deg: 120.0,
          follow_through_range_deg: 45.0,
          torso_lean_at_contact_deg: 10.0,
          recovery_com_displacement_norm: 0.03,
        },
        coaching: {
          summary: "Strong overall technique",
          strengths: ["Good hip rotation (34.5deg)"],
          tips: ["Increase follow-through range"],
          drill: "Practice slow-motion kicks",
        },
        sessionId: "sess-1",
      },
      diagnostics: {
        internet_connection: "online",
        local_pose_engine: "ready",
        local_bitnet_engine: "down",
        bitnet_endpoint: "http://127.0.0.1:8080",
        external_request_count: 5,
        cpu_percent: 23.4,
        ram_used_mb: 4096,
        inference_latency_ms: 120,
      },
      loading: false,
      error: null,
    });

    render(<HaalandDashboard />);

    const widgets = screen.getAllByTestId("stat-widget");
    expect(widgets).toHaveLength(3);
    expect(screen.getByTestId("coach-panel")).toBeInTheDocument();
    expect(screen.getByTestId("dock")).toBeInTheDocument();
    expect(screen.getByTestId("utility-icons")).toBeInTheDocument();
  });
});
