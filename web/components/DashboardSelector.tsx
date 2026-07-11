"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";

export function DashboardSelector() {
  const router = useRouter();
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("penaltyiq-dashboard-theme");
    setTheme(stored);
  }, []);

  const handleSelect = (item: CarouselItem) => {
    const themeKey = item.title === "Messi" ? "desktop" : "haaland";
    localStorage.setItem("penaltyiq-dashboard-theme", themeKey);
    setTheme(themeKey);
    router.push("/dashboard");
  };

  if (theme) return null;

  const items: CarouselItem[] = [
    { id: 1, title: "Messi" },
    { id: 2, title: "Haaland" },
  ];

  return <RulerCarousel originalItems={items} onSelect={handleSelect} />;
}
