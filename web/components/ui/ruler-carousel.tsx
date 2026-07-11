"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface CarouselItem {
  id: number;
  title: string;
}

function Ruler() {
  return (
    <div className="relative h-6 w-full overflow-hidden opacity-70" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      <div className="absolute inset-x-0 flex justify-between px-1">
        {Array.from({ length: 64 }, (_, index) => (
          <span key={index} className={`w-px bg-white/55 ${index % 8 === 0 ? "h-6 bg-yellow-300" : index % 4 === 0 ? "h-4" : "h-2"}`} />
        ))}
      </div>
    </div>
  );
}

export function RulerCarousel({ originalItems, onSelect }: { originalItems: CarouselItem[]; onSelect?: (item: CarouselItem) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = originalItems[activeIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + originalItems.length) % originalItems.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % originalItems.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [originalItems.length]);

  return (
    <section className="min-h-screen w-full pt-24 pb-10 px-5 flex flex-col justify-center bg-black">
      <div className="mx-auto w-full max-w-5xl space-y-7">
        <Ruler />
        <div className="grid gap-4 md:grid-cols-2">
          {originalItems.map((item, index) => {
            const isActive = index === activeIndex;
            const [name, descriptor] = item.title.split(" · ");
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className={`min-h-64 rounded-3xl border p-8 text-left transition-colors ${isActive ? "border-yellow-300 bg-gradient-to-br from-yellow-300/20 to-white/[0.03]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                animate={{ scale: isActive ? 1 : 0.96, opacity: isActive ? 1 : 0.58 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] ${isActive ? "bg-yellow-300 text-black" : "bg-white/10 text-white/55"}`}>DASHBOARD 0{index + 1}</span>
                  {isActive && <Sparkles className="h-5 w-5 text-yellow-300" />}
                </div>
                <h2 className="mt-12 text-4xl font-extrabold tracking-tight text-white md:text-5xl">{name}</h2>
                <p className="mt-3 text-sm font-medium tracking-[0.14em] text-white/50">{descriptor ?? "ANALYSIS"}</p>
              </motion.button>
            );
          })}
        </div>
        <Ruler />
        <div className="flex items-center justify-center gap-5 pt-1">
          <button onClick={() => setActiveIndex((index) => (index - 1 + originalItems.length) % originalItems.length)} className="rounded-full border border-white/15 p-3 text-white/70 hover:border-yellow-300 hover:text-yellow-300" aria-label="Previous dashboard"><ChevronLeft className="h-5 w-5" /></button>
          <span className="text-sm font-semibold tabular-nums text-white/55">{activeIndex + 1} / {originalItems.length}</span>
          <button onClick={() => setActiveIndex((index) => (index + 1) % originalItems.length)} className="rounded-full border border-white/15 p-3 text-white/70 hover:border-yellow-300 hover:text-yellow-300" aria-label="Next dashboard"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="text-center">
          <button onClick={() => onSelect?.(activeItem)} className="rounded-2xl bg-yellow-300 px-10 py-4 font-bold text-black shadow-[0_12px_40px_rgba(234,179,8,0.24)] transition-transform hover:scale-[1.02] active:scale-95">Open {activeItem?.title.split(" · ")[0]} dashboard</button>
        </div>
      </div>
    </section>
  );
}
