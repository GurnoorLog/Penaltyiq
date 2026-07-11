"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { content } from "@/lib/content";

export function Hero() {
  const { data: session } = useSession();

  const handleGetStarted = () => {
    if (session) {
      window.location.href = "/start";
    } else {
      signIn();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url(/hero-image.png)" }}
      />

      <div className="relative z-10 text-center max-w-3xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          <span className="accent-gradient bg-clip-text text-transparent">
            {content.hero.title}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto">
          {content.hero.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGetStarted}
            className="px-8 py-3 rounded-xl accent-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {content.hero.cta}
          </button>
          <Link
            href="/demo"
            className="px-8 py-3 rounded-xl glass-panel text-[var(--text)] font-semibold text-sm hover:bg-[var(--glass)] transition-colors"
          >
            {content.hero.demo}
          </Link>
        </div>
      </div>
    </section>
  );
}
