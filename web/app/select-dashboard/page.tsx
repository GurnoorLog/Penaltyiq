"use client";

import { useRouter } from "next/navigation";
import { RulerCarousel, CarouselItem } from "@/components/ui/ruler-carousel";

const dashboardOptions: CarouselItem[] = [
  { id: 1, title: "🥷 Wanna feel Messi", subtitle: "Desktop OS — Mission Control" },
  { id: 2, title: "🐐 Wanna seal Haaland", subtitle: "Alternative layout (coming soon)" },
];

export default function SelectDashboardPage() {
  const router = useRouter();

  const handleSelect = (item: CarouselItem) => {
    const theme = item.id === 1 ? "desktop" : "haaland";
    localStorage.setItem("penaltyiq-dashboard-theme", theme);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your Dashboard
        </h1>
        <p className="text-lg text-gray-400">
          Pick the style that fits your vibe
        </p>
      </div>

      <RulerCarousel originalItems={dashboardOptions} onSelect={handleSelect} />
    </div>
  );
}
