"use client";

import { SessionProvider } from "next-auth/react";
import { VideoUploader } from "@/components/capture/VideoUploader";

export default function StartPage() {
  return (
    <SessionProvider>
      <div className="pt-20 min-h-screen bg-grid px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Capture Session</h1>
          <VideoUploader />
        </div>
      </div>
    </SessionProvider>
  );
}
