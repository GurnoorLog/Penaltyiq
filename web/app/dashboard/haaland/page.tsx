"use client";

import { StatWidget } from "@/components/dashboard/StatWidget";
import { CoachPanel } from "@/components/dashboard/CoachPanel";
import { Dock } from "@/components/dashboard/Dock";
import { UtilityIcons } from "@/components/dashboard/UtilityIcons";
import { WidgetStack } from "@/components/dashboard/mobile/WidgetStack";
import { CoachSheet } from "@/components/dashboard/mobile/CoachSheet";
import { TabBar } from "@/components/dashboard/mobile/TabBar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import Link from "next/link";

export default function HaalandDashboard() {
  const { data, diagnostics, loading, error } = useDashboardData();
  const [mobileView, setMobileView] = useState("home");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-grid pt-14">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const diagnosticsPayload = diagnostics ?? {
      internet_connection: "offline",
      local_pose_engine: "ready",
      local_bitnet_engine: "down",
      bitnet_endpoint: "127.0.0.1:8080",
      external_request_count: 0,
      cpu_percent: 0,
      ram_used_mb: 0,
      inference_latency_ms: 0,
    };
    return (
      <div className="flex flex-col min-h-screen bg-grid pt-14">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="text-6xl opacity-30">🎯</div>
            <h2 className="text-2xl font-bold">No Sessions Yet</h2>
            <p className="text-sm text-[var(--text-muted)]">{error ?? "Upload your first video to get biomechanical analysis."}</p>
            <Link href="/start" className="inline-block px-8 py-3 rounded-xl accent-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              Upload a Kick
            </Link>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <UtilityIcons diagnostics={diagnosticsPayload} />
        </div>
        <Dock />
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:flex flex-col min-h-screen bg-grid pt-14">
        <div className="flex-1 flex gap-4 p-4">
          <div className="w-64 space-y-3">
            <StatWidget icon="🏆" label="Technique Score" value={`${data.techniqueScore}`} caption={data.subScores ? `Stability: ${data.subScores.plant_leg_stability}` : ""} accentColor="#6366f1" progress={data.techniqueScore / 100} />
            <StatWidget icon="🔍" label="Tracking Confidence" value={`${Math.round(data.trackingConfidence * 100)}%`} caption="MediaPipe Pose" accentColor="#22c55e" progress={data.trackingConfidence} />
            <StatWidget icon="📊" label="Sessions Analyzed" value={data.sessionId ? "1" : "0"} caption={data.sessionId ? "Last session" : "All time"} accentColor="#f59e0b" progress={0.5} />
          </div>
          <div className="flex-1">
            <CoachPanel data={data} diagnostics={diagnostics ?? {
              internet_connection: "offline",
              local_pose_engine: "ready",
              local_bitnet_engine: "down",
              bitnet_endpoint: "127.0.0.1:8080",
              external_request_count: 0,
              cpu_percent: 0,
              ram_used_mb: 0,
              inference_latency_ms: 0,
            }} />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <UtilityIcons diagnostics={diagnostics ?? {
            internet_connection: "offline",
            local_pose_engine: "ready",
            local_bitnet_engine: "down",
            bitnet_endpoint: "127.0.0.1:8080",
            external_request_count: 0,
            cpu_percent: 0,
            ram_used_mb: 0,
            inference_latency_ms: 0,
          }} />
        </div>
        <Dock />
      </div>
      <div className="md:hidden flex flex-col min-h-screen bg-grid pt-14">
        {mobileView === "home" && (
          <div className="flex-1 p-4 space-y-4">
            <WidgetStack data={data} />
            <CoachSheet data={data} diagnostics={diagnostics ?? {
              internet_connection: "offline",
              local_pose_engine: "ready",
              local_bitnet_engine: "down",
              bitnet_endpoint: "127.0.0.1:8080",
              external_request_count: 0,
              cpu_percent: 0,
              ram_used_mb: 0,
              inference_latency_ms: 0,
            }} />
          </div>
        )}
        <TabBar active={mobileView} onTabChange={setMobileView} />
      </div>
    </>
  );
}
