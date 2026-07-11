"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";

export function DashboardSelector() {
  const router = useRouter();

  useEffect(() => {
    const theme = localStorage.getItem("penaltyiq-dashboard-theme");
    if (theme) {
      router.replace("/dashboard");
    }
  }, [router]);

  const items: CarouselItem[] = [
    { id: 1, title: "Messi" },
    { id: 2, title: "Haaland" },
  ];

  const handleSelect = (item: CarouselItem) => {
    const themeKey = item.title === "Messi" ? "desktop" : "haaland";
    localStorage.setItem("penaltyiq-dashboard-theme", themeKey);
    router.push("/dashboard");
  };

  return <RulerCarousel originalItems={items} onSelect={handleSelect} />;
}
