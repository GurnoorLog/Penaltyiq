"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("penaltyiq-dashboard-theme", "desktop");
    router.replace("/dashboard/messi");
  }, [router]);

  return null;
}
