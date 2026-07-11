"use client";

import { SessionProvider } from "next-auth/react";
import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";

export default function HomePage() {
  return (
    <SessionProvider>
      <Hero />
      <FeatureCards />
    </SessionProvider>
  );
}
