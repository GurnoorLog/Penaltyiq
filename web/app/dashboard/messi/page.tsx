"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { BrainCircuit, Settings } from "lucide-react";
import { Sidebar } from "@/components/zan/sidebar";
import { ChatArea, type ChatAreaHandle } from "@/components/zan/chat-area";
import DynamicGrowInput from "@/components/zan/dynamic-input";
import { aiBuddies } from "@/components/zan/audio-chat";

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const logoRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });
    tl.fromTo(logoRef.current, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" })
      .fromTo(textRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
      .fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, "-=0.1")
      .to(barRef.current, { scaleX: 0, duration: 0.3 }, "+=0.2")
      .to(logoRef.current, { opacity: 0, scale: 0.5, duration: 0.3 }, "-=0.1")
      .to(textRef.current, { opacity: 0, duration: 0.2 }, "-=0.2");
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0b]">
      <div ref={logoRef} className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <BrainCircuit className="w-10 h-10 text-black" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
      </div>
      <p ref={textRef} className="text-white/60 text-sm font-medium tracking-widest uppercase mb-6">PenaltyIQ</p>
      <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div ref={barRef} className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-full origin-left" />
      </div>
    </div>
  );
}

function WelcomeScreen({ onExampleClick }: { onExampleClick: (q: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    }
  }, []);

  const examples = [
    "What can I improve in my penalty technique?",
    "Show me the correct plant foot position",
    "How do I generate more power on my strike?",
    "Which side of my body needs work?",
  ];

  return (
    <div ref={ref} className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
        <BrainCircuit className="w-8 h-8 text-emerald-400" />
      </div>
      <h1 className="text-2xl font-semibold text-white/90 mb-2 text-center">PenaltyIQ Coach</h1>
      <p className="text-sm text-white/40 mb-8 text-center max-w-md">
        Your AI-powered penalty kick coach. Upload a video or ask me anything about your technique.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {examples.map((q) => (
          <button
            key={q}
            onClick={() => onExampleClick(q)}
            className="text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MessiDashboard() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>("AI Coach");
  const [hasMessages, setHasMessages] = useState(false);
  const chatAreaRef = useRef<ChatAreaHandle>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadingComplete) return;
    gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
  }, [loadingComplete]);

  const handleSend = useCallback((value: string) => {
    setHasMessages(true);
    const event = new CustomEvent("zan-send", { detail: { role: "user", content: value } });
    window.dispatchEvent(event);
  }, []);

  const handleNewCoachChat = useCallback(() => {
    setActiveView("AI Coach");
    setHasMessages(false);
    chatAreaRef.current?.handleNewChat();
  }, []);

  const handleSidebarAction = useCallback((action: string) => {
    switch (action) {
      case "AI Coach": handleNewCoachChat(); break;
      case "Dashboard": setActiveView("Dashboard"); break;
      case "Kick Analysis":
      case "Training":
      case "Progress":
      case "Compare":
        setActiveView(action);
        break;
      case "History": window.location.href = "/history"; break;
      case "Settings": setActiveView("Settings"); break;
    }
  }, [handleNewCoachChat]);

  const isCoachingView = ["AI Coach", "Kick Analysis", "Training", "Progress", "Compare"].includes(activeView);

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[#0a0a0b]">
      {!loadingComplete && <LoadingScreen onComplete={() => setLoadingComplete(true)} />}

      <div ref={mainRef} className="relative flex h-full w-full" style={{ opacity: 0 }}>
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onAction={handleSidebarAction} />

        <div className="relative z-10 flex-1 flex flex-col min-w-0">
          {/* Dashboard View */}
          {activeView === "Dashboard" && (
            <div className="flex-1 relative">
              <iframe src="/messi-dashboard.html?embedded=1" className="absolute inset-0 w-full h-full border-0" title="PenaltyIQ Dashboard" />
            </div>
          )}

          {/* Settings View */}
          {activeView === "Settings" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-white/40" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">Settings</h2>
                <p className="text-sm text-white/40">API keys, preferences, and data export.</p>
              </div>
            </div>
          )}

          {/* Coaching Views — centered chat layout like zan-chat */}
          {isCoachingView && (
            <div className="flex-1 flex flex-col min-h-0 relative">
              {hasMessages || activeView !== "AI Coach" ? (
                <ChatArea ref={chatAreaRef} aiBuddy={aiBuddies[0]} />
              ) : (
                <WelcomeScreen onExampleClick={handleSend} />
              )}

              {/* Fixed bottom input */}
              <div className="absolute bottom-0 left-0 right-0 pb-3 pt-2 px-4 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/95 to-transparent">
                <div className="mx-auto max-w-[720px]">
                  <DynamicGrowInput
                    onSubmit={(value) => handleSend(value)}
                    placeholder="Ask your penalty coach..."
                    showEffects={true}
                    glowIntensity={0.5}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
