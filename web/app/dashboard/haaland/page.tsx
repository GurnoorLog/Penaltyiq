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

export default function HaalandDashboard() {
  const { data, diagnostics } = useDashboardData();
  const [mobileView, setMobileView] = useState("home");

  return (
    <>
      <div className="hidden md:flex flex-col min-h-screen bg-grid pt-14">
        <div className="flex-1 flex gap-4 p-4">
          <div className="w-64 space-y-3">
            <StatWidget icon="🏆" label="Technique Score" value={`${data.techniqueScore}`} caption={data.subScores ? `Stability: ${data.subScores.plant_leg_stability}` : ""} accentColor="#6366f1" progress={data.techniqueScore / 100} />
            <StatWidget icon="🔍" label="Tracking Confidence" value={`${Math.round(data.trackingConfidence * 100)}%`} caption="MediaPipe Pose" accentColor="#22c55e" progress={data.trackingConfidence} />
            <StatWidget icon="📊" label="Sessions Analyzed" value="12" caption="All time" accentColor="#f59e0b" progress={0.5} />
          </div>
          <div className="flex-1">
            <CoachPanel data={data} diagnostics={diagnostics} />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <UtilityIcons diagnostics={diagnostics} />
        </div>
        <Dock />
      </div>
      <div className="md:hidden flex flex-col min-h-screen bg-grid pt-14">
        {mobileView === "home" && (
          <div className="flex-1 p-4 space-y-4">
            <WidgetStack data={data} />
            <CoachSheet data={data} diagnostics={diagnostics} />
          </div>
        )}
        <TabBar active={mobileView} onTabChange={setMobileView} />
      </div>
    </>
  );
}
