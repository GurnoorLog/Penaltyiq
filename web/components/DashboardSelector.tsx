"use client";

import { useState, useEffect } from "react";

export function DashboardSelector() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("penaltyiq-dashboard-theme");
    if (!theme) {
      setShow(true);
    }
  }, []);

  const selectTheme = (theme: string) => {
    localStorage.setItem("penaltyiq-dashboard-theme", theme);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Choose Your Dashboard
        </h2>
        <p className="text-zinc-400 text-center mb-8">
          Pick the style that fits your vibe
        </p>

        <div className="space-y-4">
          <button
            onClick={() => selectTheme("desktop")}
            className="w-full p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-indigo-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shrink-0">
                🥷
              </div>
              <div>
                <p className="text-white font-semibold text-lg group-hover:text-indigo-400 transition-colors">
                  Wanna feel Messi
                </p>
                <p className="text-zinc-500 text-sm">
                  Desktop OS — Mission Control
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => selectTheme("haaland")}
            className="w-full p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shrink-0">
                🐐
              </div>
              <div>
                <p className="text-white font-semibold text-lg group-hover:text-emerald-400 transition-colors">
                  Wanna seal Haaland
                </p>
                <p className="text-zinc-500 text-sm">
                  Alternative layout (coming soon)
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
