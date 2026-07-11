"use client";

import { useState } from "react";
import { CoachPanel } from "../CoachPanel";
import { DashboardData } from "@/hooks/useDashboardData";
import { DiagnosticsPayload } from "@/lib/api";

interface CoachSheetProps {
  data: DashboardData;
  diagnostics: DiagnosticsPayload;
}

export function CoachSheet({ data, diagnostics }: CoachSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full accent-gradient text-white text-xl shadow-lg z-40 flex items-center justify-center"
      >
        {'\u{1F3AF}'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
          <div className="bg-[var(--bg-dark)] rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-dark)] p-4 border-b border-[var(--glass-border)] flex justify-between items-center">
              <h2 className="text-sm font-semibold">AI Coach</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--text-muted)]">{'\u2715'}</button>
            </div>
            <CoachPanel data={data} diagnostics={diagnostics} />
          </div>
        </div>
      )}
    </>
  );
}
