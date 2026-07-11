"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Plus, Settings, Sparkles, Swords, Target, BarChart3, BrainCircuit, TrendingUp, GitCompare, Lightbulb, BookOpen, Video, ClipboardList } from "lucide-react";
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
          <BrainCircuit className="w-10 h-10 text-black" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
      </div>
      <p ref={textRef} className="text-white/60 text-sm font-medium tracking-widest uppercase mb-6">PenaltyIQ Coach</p>
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

function CoachTipCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group"
      onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.02, borderColor: "rgba(255,255,255,0.15)", duration: 0.2 })}
      onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, borderColor: "rgba(255,255,255,0.06)", duration: 0.2 })}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-white/90 mb-0.5">{title}</h4>
        <p className="text-xs text-white/40 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function CoachView({ id, activeView, icon: Icon, title, inputPlaceholder, children, chatRef, buddy, isLoading, onSend, onStop, status }: {
  id: string;
  activeView: string;
  icon: any;
  title: string;
  inputPlaceholder: string;
  children: React.ReactNode;
  chatRef: React.RefObject<ChatAreaHandle | null>;
  buddy: AiBuddy;
  isLoading: boolean;
  onSend: (msg: { role: "user"; content: string }) => void;
  onStop: () => void;
  status: string;
}) {
  return (
    <ViewWrapper id={id} activeView={activeView}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-8 py-8 pb-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Icon className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
            {children}
          </div>
        </div>
        <ChatArea ref={chatRef} aiBuddy={buddy} />
        <div className="shrink-0">
          <InputBar onSend={onSend} onStop={onStop} status={status as any} placeholder={inputPlaceholder} />
        </div>
      </div>
    </ViewWrapper>
  );
}

export default function MessiDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<AiBuddy>(aiBuddies[0]);
  const [activeView, setActiveView] = useState<string>("AI Coach");
  const [historyOpen, setHistoryOpen] = useState(false);
  const chatAreaRef = useRef<ChatAreaHandle>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const coachingRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const trainingRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loadingComplete) return;
    gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
  }, [loadingComplete]);

  useEffect(() => {
    const views: Record<string, React.RefObject<HTMLDivElement | null>> = {
      "Kick Analysis": analysisRef,
      "Training": trainingRef,
      "Progress": progressRef,
      "Compare": compareRef,
    };
    const ref = views[activeView];
    if (ref?.current) {
      gsap.fromTo(ref.current.querySelectorAll(".coach-card"), { opacity: 0, y: 16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.08, ease: "power3.out" });
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
    setActiveView("AI Coach");
    const event = new CustomEvent("zan-send", { detail: message });
    window.dispatchEvent(event);
  };

  const handleNewCoachChat = useCallback(() => {
    setHasStartedChat(false);
    setActiveView("AI Coach");
    chatAreaRef.current?.handleNewChat();
  }, []);

  const handleSidebarAction = useCallback((action: string) => {
    switch (action) {
      case "AI Coach": handleNewCoachChat(); break;
      case "Dashboard": setActiveView("Dashboard"); break;
      case "Kick Analysis": setActiveView("Kick Analysis"); break;
      case "Training": setActiveView("Training"); break;
      case "Progress": setActiveView("Progress"); break;
      case "Compare": setActiveView("Compare"); break;
      case "History": setHistoryOpen(true); break;
      case "Settings": setActiveView("Settings"); break;
    }
  }, [handleNewCoachChat]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "c") { e.preventDefault(); handleNewCoachChat(); }
      if (e.key === "a") { e.preventDefault(); setActiveView("Kick Analysis"); }
      if (e.key === "t") { e.preventDefault(); setActiveView("Training"); }
      if (e.key === "p") { e.preventDefault(); setActiveView("Progress"); }
      if (e.key === "h") { e.preventDefault(); setHistoryOpen(true); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewCoachChat]);

  const coachTips = [
    { icon: Lightbulb, title: "Quick Tip", description: "Keep your standing foot parallel to the ball for better accuracy" },
    { icon: Video, title: "Review Last Kick", description: "Watch your last recorded penalty and get AI feedback" },
    { icon: BookOpen, title: "Training Drill", description: "Practice placement — aim for the top corners from 12 yards" },
    { icon: ClipboardList, title: "Session Summary", description: "View your practice stats and improvement areas" },
  ];

  const analysisFeatures = [
    { icon: Target, title: "Placement Analysis", description: "Shot accuracy, preferred corners, and goalkeeper reading" },
    { icon: BarChart3, title: "Body Mechanics", description: "Hip rotation, follow-through, balance, and contact point" },
    { icon: TrendingUp, title: "Power & Speed", description: "Ball velocity, approach speed, and strike force metrics" },
    { icon: BrainCircuit, title: "AI Recommendations", description: "Personalized drills to fix form issues and improve scoring" },
  ];

  const trainingPlans = [
    { icon: Swords, title: "Pressure Training", description: "Simulate match scenarios with time pressure and distractions" },
    { icon: Target, title: "Placement Drills", description: "Hit designated zones in the goal with increasing difficulty" },
    { icon: TrendingUp, title: "Consistency Builder", description: "10-rep sets tracking variance in placement and power" },
    { icon: BrainCircuit, title: "Adaptive Program", description: "AI-generated plan based on your weak spots and progress" },
  ];

  const progressStats = [
    { icon: TrendingUp, title: "Conversion Rate", value: "84%", change: "+12% this month" },
    { icon: Target, title: "Placement Accuracy", value: "76%", change: "+5% this week" },
    { icon: BarChart3, title: "Power Score", value: "8.4/10", change: "+0.3 avg" },
    { icon: BrainCircuit, title: "Coach Rating", value: "B+", change: "Up from C last session" },
  ];

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[#0a0a0b]">
      {!loadingComplete && <LoadingScreen onComplete={() => setLoadingComplete(true)} />}

      <div ref={mainRef} className="relative flex h-full w-full" style={{ opacity: 0 }}>
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onAction={handleSidebarAction} />

        <div className="relative z-10 flex-1 flex flex-col min-w-0">
          <ViewWrapper id="Dashboard" activeView={activeView}>
            <div className="flex-1 relative">
              <iframe src="/messi-dashboard.html?embedded=1" className="absolute inset-0 w-full h-full border-0" title="PenaltyIQ Dashboard" />
            </div>
          </ViewWrapper>

          <CoachView id="AI Coach" activeView={activeView} icon={BrainCircuit} title="AI Coach" inputPlaceholder="Ask your AI coach..." chatRef={chatAreaRef} buddy={selectedBuddy} isLoading={isLoading} onSend={handleSend} onStop={() => { setIsLoading(false); window.dispatchEvent(new CustomEvent("zan-loading", { detail: false })); }} status={isLoading ? "streaming" : "ready"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coachTips.map((f, i) => (
                <div key={i} className="coach-card">
                  <CoachTipCard icon={f.icon} title={f.title} description={f.description} />
                </div>
              ))}
            </div>
          </CoachView>

          <CoachView id="Kick Analysis" activeView={activeView} icon={BarChart3} title="Kick Analysis" inputPlaceholder="Ask about your kick analysis..." chatRef={chatAreaRef} buddy={selectedBuddy} isLoading={isLoading} onSend={handleSend} onStop={() => { setIsLoading(false); window.dispatchEvent(new CustomEvent("zan-loading", { detail: false })); }} status={isLoading ? "streaming" : "ready"}>
            <div ref={analysisRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisFeatures.map((f, i) => (
                <div key={i} className="coach-card">
                  <CoachTipCard icon={f.icon} title={f.title} description={f.description} />
                </div>
              ))}
            </div>
          </CoachView>

          <CoachView id="Training" activeView={activeView} icon={Swords} title="Training Plans" inputPlaceholder="Ask about training..." chatRef={chatAreaRef} buddy={selectedBuddy} isLoading={isLoading} onSend={handleSend} onStop={() => { setIsLoading(false); window.dispatchEvent(new CustomEvent("zan-loading", { detail: false })); }} status={isLoading ? "streaming" : "ready"}>
            <div ref={trainingRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingPlans.map((f, i) => (
                <div key={i} className="coach-card">
                  <CoachTipCard icon={f.icon} title={f.title} description={f.description} />
                </div>
              ))}
            </div>
            <div className="mt-6 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-semibold hover:from-amber-400 hover:to-orange-400 transition-all">
                Begin Session
              </button>
            </div>
          </CoachView>

          <CoachView id="Progress" activeView={activeView} icon={TrendingUp} title="Your Progress" inputPlaceholder="Ask about your progress..." chatRef={chatAreaRef} buddy={selectedBuddy} isLoading={isLoading} onSend={handleSend} onStop={() => { setIsLoading(false); window.dispatchEvent(new CustomEvent("zan-loading", { detail: false })); }} status={isLoading ? "streaming" : "ready"}>
            <div ref={progressRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressStats.map((s, i) => (
                <div key={i} className="coach-card p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <s.icon className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-white/70">{s.title}</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                  <div className="text-xs text-emerald-400">{s.change}</div>
                </div>
              ))}
            </div>
          </CoachView>

          <CoachView id="Compare" activeView={activeView} icon={GitCompare} title="Compare Kicks" inputPlaceholder="Ask about comparisons..." chatRef={chatAreaRef} buddy={selectedBuddy} isLoading={isLoading} onSend={handleSend} onStop={() => { setIsLoading(false); window.dispatchEvent(new CustomEvent("zan-loading", { detail: false })); }} status={isLoading ? "streaming" : "ready"}>
            <div ref={compareRef} className="coach-card p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <GitCompare className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-base font-medium text-white/70 mb-2">No recordings yet</h3>
              <p className="text-sm text-white/40 mb-6">Record two or more kicks to compare your form, placement, and power side by side.</p>
              <button onClick={() => setActiveView("Dashboard")} className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-all">
                Record a Kick
              </button>
            </div>
          </CoachView>

          <ViewWrapper id="Settings" activeView={activeView}>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-8 h-8 text-white/40" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Settings</h2>
                <p className="text-sm text-white/40 leading-relaxed">
                  Configure API keys, manage your profile, adjust coaching preferences, and export data.
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
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Session History</h3>
            <p className="text-sm text-white/30">No sessions yet. Start coaching to see your history.</p>
          </div>
        </div>
      )}
    </div>
  );
}
