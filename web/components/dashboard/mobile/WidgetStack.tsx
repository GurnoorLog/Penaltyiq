"use client";

import { useState } from "react";
import { DashboardData } from "@/hooks/useDashboardData";
import Link from "next/link";

interface WidgetStackProps {
  data: DashboardData;
}

export function WidgetStack({ data }: WidgetStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const widgets = [
    { icon: "\u{1F3C6}", label: "Technique Score", value: `${data.techniqueScore}`, color: "#6366f1" },
    { icon: "\u{1F50D}", label: "Tracking Confidence", value: `${Math.round(data.trackingConfidence * 100)}%`, color: "#22c55e" },
    { icon: "\u{1F4CA}", label: "Sessions Analyzed", value: "12", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-4">
      <div className="glass-panel-lg p-6 text-center">
        <p className="text-xs text-[var(--text-muted)] uppercase">{widgets[currentIndex].label}</p>
        <p className="text-5xl font-bold mt-2" style={{ color: widgets[currentIndex].color }}>
          {widgets[currentIndex].value}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {widgets.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-[var(--accent)]" : "bg-[var(--glass)]"}`}
          />
        ))}
      </div>

      {data.coaching && (
        <div className="glass-panel-lg p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-sm font-bold">
              IQ
            </div>
            <div>
              <p className="text-xs font-semibold">Latest Result</p>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{data.coaching.tips[0]}</p>
          <Link
            href="/dashboard"
            className="inline-block text-xs text-[var(--accent)] hover:underline"
          >
            See full analysis {'\u2192'}
          </Link>
        </div>
      )}
    </div>
  );
}
