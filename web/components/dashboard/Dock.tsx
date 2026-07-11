"use client";

import Link from "next/link";
import { content } from "@/lib/content";
import { useState } from "react";
import { DiagnosticsPayload } from "@/lib/api";

const dockItems = [
  { icon: "\u{1F4C1}", label: "upload", href: "/start" },
  { icon: "\u{1F4CB}", label: "history", href: "/history" },
  { icon: "\u{1F504}", label: "compare", href: "/compare" },
  { icon: "\u2699\uFE0F", label: "diagnostics", href: "#diagnostics" },
  { icon: "\u{1F527}", label: "settings", href: "#settings" },
];

export function Dock() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <>
      <div className="flex justify-center pb-4">
        <div className="glass-panel-lg px-4 py-2 flex items-center gap-1">
          {dockItems.map((item) => (
            <div key={item.label} className="relative">
              {item.label === "diagnostics" ? (
                <button
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-[var(--glass)] transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {content.dashboard[item.label as keyof typeof content.dashboard] as string}
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-[var(--glass)] transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {content.dashboard[item.label as keyof typeof content.dashboard] as string}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
