"use client";

import { useState } from "react";
import { DiagnosticsPayload } from "@/lib/api";

interface UtilityIconsProps {
  diagnostics: DiagnosticsPayload;
}

export function UtilityIcons({ diagnostics }: UtilityIconsProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const allReady = diagnostics.local_bitnet_engine === "ready" && diagnostics.local_pose_engine === "ready";

  return (
    <>
      <div className="flex items-center gap-2 glass-panel px-3 py-2">
        <button className="opacity-60 hover:opacity-100 transition-opacity" title="Search/Inspect">
          {'\u{1F50D}'}
        </button>
        <div
          className={`w-2.5 h-2.5 rounded-full ${allReady ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
          title={allReady ? "All engines ready" : "Engine issue detected"}
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        />
      </div>

      {showDiagnostics && (
        <div className="absolute top-12 right-0 w-80 glass-panel-lg p-4 z-50">
          <h3 className="text-sm font-semibold mb-3">Diagnostics</h3>
          <div className="space-y-1.5">
            {Object.entries(diagnostics).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">{key.replace(/_/g, " ")}</span>
                <span className="font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
