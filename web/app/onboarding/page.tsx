"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";

const dashboardChoices: CarouselItem[] = [
  { id: 1, title: "MESSI · CINEMATIC ANALYSIS" },
  { id: 2, title: "HAALAND · METRICS LAB" },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div className="min-h-screen bg-black text-white grid place-items-center text-sm">Preparing your workspace…</div>;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6 text-center">
        <div className="space-y-5 max-w-sm">
          <p className="text-xs tracking-[0.24em] text-yellow-300">PENALTYIQ</p>
          <h1 className="text-3xl font-bold">Sign in to save every session.</h1>
          <button onClick={() => signIn("google", { callbackUrl: "/onboarding" })} className="rounded-xl bg-yellow-300 px-6 py-3 font-semibold text-black">
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(235,194,70,0.16),transparent_35%),#050505] text-white">
      <div className="absolute top-8 left-0 right-0 z-10 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-yellow-300">WELCOME, {session.user.name?.toUpperCase() ?? "ATHLETE"}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Choose your analysis space</h1>
        <p className="mt-2 text-sm text-white/55">You can change this any time from your account.</p>
      </div>
      <RulerCarousel
        originalItems={dashboardChoices}
        onSelect={(choice) => {
          const destination = choice.id === 1 ? "/dashboard/messi" : "/dashboard/haaland";
          localStorage.setItem("penaltyiq-dashboard-theme", choice.id === 1 ? "messi" : "haaland");
          router.push(destination);
        }}
      />
    </div>
  );
}
