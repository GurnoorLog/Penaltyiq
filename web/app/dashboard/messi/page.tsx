"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Plus, Settings, Sparkles, Swords, Target, BarChart3, BrainCircuit } from "lucide-react";
import { Sidebar } from "@/components/zan/sidebar";
import { ChatArea, type ChatAreaHandle } from "@/components/zan/chat-area";
import { InputBar } from "@/components/zan/chat-input";
import { aiBuddies, type AiBuddy } from "@/components/zan/audio-chat";

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
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
          <Swords className="w-10 h-10 text-black" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
      </div>
      <p ref={textRef} className="text-white/60 text-sm font-medium tracking-widest uppercase mb-6">StrikerOS</p>
      <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div ref={barRef} className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 rounded-full origin-left" />
      </div>
    </div>
  );
}

function ViewWrapper({ id, activeView, children }: { id: string; activeView: string; children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (id === activeView) {
      gsap.fromTo(el, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" });
    }
  }, [id, activeView]);

  if (id !== activeView) return null;

  return (
    <div ref={wrapperRef} className="flex-1 flex flex-col min-h-0">
      {children}
    </div>
  );
}

export default function MessiDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<AiBuddy>(aiBuddies[0]);
  const [activeView, setActiveView] = useState<string>("Dashboard");
  const [historyOpen, setHistoryOpen] = useState(false);
  const chatAreaRef = useRef<ChatAreaHandle>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const modelsGridRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loadingComplete) return;
    gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
  }, [loadingComplete]);

  useEffect(() => {
    if (activeView === "Models" && modelsGridRef.current) {
      gsap.fromTo(modelsGridRef.current.querySelectorAll("button"), { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.05, ease: "back.out(1.4)" });
    }
    if (activeView === "Settings" && settingsRef.current) {
      gsap.fromTo(settingsRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
    }
  }, [activeView]);

  useEffect(() => {
    const onLoading = (e: CustomEvent<boolean>) => {
      setIsLoading(e.detail);
    };
    window.addEventListener("zan-loading", onLoading as EventListener);
    return () => window.removeEventListener("zan-loading", onLoading as EventListener);
  }, []);

  const handleSend = (message: { role: "user"; content: string }) => {
    setHasStartedChat(true);
    setActiveView("Chat");
    const event = new CustomEvent("zan-send", { detail: message });
    window.dispatchEvent(event);
  };

  const handleNewChat = useCallback(() => {
    setHasStartedChat(false);
    setActiveView("Chat");
    chatAreaRef.current?.handleNewChat();
  }, []);

  const handleSearch = useCallback(() => {
    const textarea = document.querySelector("textarea[aria-label='Message Input']") as HTMLTextAreaElement;
    textarea?.focus();
  }, []);

  const handleModels = useCallback(() => {
    setActiveView("Models");
  }, []);

  const handleSettings = useCallback(() => {
    setActiveView("Settings");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "n") { e.preventDefault(); handleNewChat(); }
      if (e.key === "k") { e.preventDefault(); handleSearch(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewChat, handleSearch]);

  const handleSidebarAction = useCallback((action: string) => {
    switch (action) {
      case "New Chat": handleNewChat(); break;
      case "New Projects": setActiveView("Dashboard"); break;
      case "Search": handleSearch(); break;
      case "Models": handleModels(); break;
      case "History": setHistoryOpen(true); break;
      case "Settings": handleSettings(); break;
      case "Dashboard": setActiveView("Dashboard"); break;
    }
  }, [handleNewChat, handleSearch, handleModels, handleSettings]);

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[#0a0a0b]">
      {!loadingComplete && <LoadingScreen onComplete={() => setLoadingComplete(true)} />}

      <div ref={mainRef} className="relative flex h-full w-full" style={{ opacity: 0 }}>
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onAction={handleSidebarAction} />

        <div className="relative z-10 flex-1 flex flex-col min-w-0">
          <ViewWrapper id="Dashboard" activeView={activeView}>
            <div className="flex-1 relative">
              <iframe src="/messi-dashboard.html?embedded=1" className="absolute inset-0 w-full h-full border-0" title="StrikerOS Dashboard" />
            </div>
          </ViewWrapper>

          <ViewWrapper id="Chat" activeView={activeView}>
            <div className="flex-1 flex flex-col min-h-0">
              <ChatArea ref={chatAreaRef} aiBuddy={selectedBuddy} />
            </div>
            <div className="shrink-0">
              <InputBar
                onSend={handleSend}
                onStop={() => {
                  setIsLoading(false);
                  window.dispatchEvent(new CustomEvent("zan-loading", { detail: false }));
                }}
                status={isLoading ? "streaming" : "ready"}
                placeholder={`Ask ${selectedBuddy.name}...`}
              />
            </div>
          </ViewWrapper>

          <ViewWrapper id="Models" activeView={activeView}>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-semibold text-white">Select AI Model</h2>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div ref={modelsGridRef} className="grid grid-cols-5 gap-3 max-w-2xl">
                  {aiBuddies.map((buddy, i) => (
                    <button
                      key={buddy.id}
                      onClick={() => {
                        setSelectedBuddy(buddy);
                        setActiveView("Chat");
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
                        selectedBuddy.id === buddy.id
                          ? "bg-white/10 ring-1 ring-white/20 shadow-lg shadow-white/5"
                          : "hover:bg-white/5 hover:shadow-lg hover:shadow-white/5"
                      }`}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2, ease: "power2.out" });
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out" });
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-base font-bold shadow-lg">
                        {buddy.fallback}
                      </div>
                      <span className="text-[11px] text-white/70 font-medium">{buddy.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-6">Click any model to start a conversation</p>
              </div>
            </div>
          </ViewWrapper>

          <ViewWrapper id="Settings" activeView={activeView}>
            <div ref={settingsRef} className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-8 h-8 text-white/40" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Settings</h2>
                <p className="text-sm text-white/40 leading-relaxed">
                  Configure API keys, manage your theme, adjust system prompts, and export your data.
                </p>
                <div className="flex items-center justify-center gap-3 mt-8">
                  <div className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse" />
                  <span className="text-xs text-white/30">Coming soon</span>
                </div>
              </div>
            </div>
          </ViewWrapper>
        </div>
      </div>

      {historyOpen && (
        <div
          className="fixed inset-0 z-40 flex"
          style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="w-80 bg-[#0a0a0b] border-r border-white/10 h-full overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Chat History</h3>
            <p className="text-sm text-white/30">No history yet. Start a chat to see it here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
