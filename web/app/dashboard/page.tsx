"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";

export default function DashboardPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("penaltyiq-dashboard-theme");
    if (stored === "desktop") {
      router.replace("/dashboard/messi");
    } else if (stored === "haaland") {
      router.replace("/dashboard/haaland");
    }
    setTheme(stored);
  }, [router]);

  if (theme) return null;

  const items: CarouselItem[] = [
    { id: 1, title: "Messi" },
    { id: 2, title: "Haaland" },
  ];

  const handleSelect = (item: CarouselItem) => {
    const themeKey = item.title === "Messi" ? "desktop" : "haaland";
    localStorage.setItem("penaltyiq-dashboard-theme", themeKey);
    if (themeKey === "desktop") {
      router.push("/dashboard/messi");
    } else {
      router.push("/dashboard/haaland");
    }
  };

  return <RulerCarousel originalItems={items} onSelect={handleSelect} />;
}
