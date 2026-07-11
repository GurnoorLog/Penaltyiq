"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Settings, Sparkles, Swords, Target, BarChart3, BrainCircuit, TrendingUp, GitCompare, Lightbulb, Zap } from "lucide-react";
import { Sidebar } from "@/components/zan/sidebar";
import { ChatArea, type ChatAreaHandle } from "@/components/zan/chat-area";
import DynamicGrowInput from "@/components/zan/dynamic-input";
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

function ViewWrapper({ id, activeView, children }: { id: string; activeView: string; children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (id === activeView) {
      gsap.fromTo(el, { opacity: 0, y: 16, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
    }
  }, [id, activeView]);
  if (id !== activeView) return null;
  return <div ref={wrapperRef} className="flex-1 flex flex-col min-h-0">{children}</div>;
}

function CoachView({ id, activeView, icon: Icon, title, children, chatRef, buddy, onSubmit }: {
  id: string; activeView: string; icon: any; title: string; children: React.ReactNode;
  chatRef: React.RefObject<ChatAreaHandle | null>; buddy: AiBuddy;
  onSubmit: (value: string) => void;
}) {
  return (
    <ViewWrapper id={id} activeView={activeView}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
          <Icon className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white/80">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-2">
          {children}
        </div>
        <ChatArea ref={chatRef} aiBuddy={buddy} />
        <div className="px-4 pb-3 pt-1">
          <DynamicGrowInput onSubmit={(value) => onSubmit(value)} placeholder={`Ask your coach...`} showEffects={true} />
        </div>
      </div>
    </ViewWrapper>
  );
}

function StatCard({ icon: Icon, label, value, change }: { icon: any; label: string; value: string; change?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/50 truncate">{label}</div>
        <div className="text-base font-bold text-white">{value}</div>
      </div>
      {change && <span className="text-[10px] text-emerald-400/80 shrink-0">{change}</span>}
    </div>
  );
}

function TipCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all cursor-pointer group"
      onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.01, borderColor: "rgba(16,185,129,0.2)", duration: 0.2 })}
      onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, borderColor: "rgba(255,255,255,0.06)", duration: 0.2 })}
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <div className="text-sm font-medium text-white/90">{title}</div>
        <div className="text-xs text-white/40">{description}</div>
      </div>
    </div>
  );
}

export default function MessiDashboard() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBuddy, setSelectedBuddy] = useState<AiBuddy>(aiBuddies[0]);
  const [activeView, setActiveView] = useState<string>("AI Coach");
  const [historyOpen, setHistoryOpen] = useState(false);
  const chatAreaRef = useRef<ChatAreaHandle>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadingComplete) return;
    gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
  }, [loadingComplete]);

  const handleSend = (value: string) => {
    const event = new CustomEvent("zan-send", { detail: { role: "user", content: value } });
    window.dispatchEvent(event);
  };

  const handleNewCoachChat = useCallback(() => {
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

          <CoachView id="AI Coach" activeView={activeView} icon={BrainCircuit} title="AI Coach" chatRef={chatAreaRef} buddy={selectedBuddy} onSubmit={handleSend}>
            <TipCard icon={Sparkles} title="Welcome to PenaltyIQ" description="Your AI-powered penalty kick coach. Ask me anything about your technique, form, or training." />
            <TipCard icon={Target} title="Quick Tip" description="Keep your standing foot parallel to the ball — it improves accuracy by up to 34%." />
            <TipCard icon={Zap} title="Last Session" description="You scored 7/10 from the spot. Your placement was strong, but power needs work." />
          </CoachView>

          <CoachView id="Kick Analysis" activeView={activeView} icon={BarChart3} title="Kick Analysis" chatRef={chatAreaRef} buddy={selectedBuddy} onSubmit={handleSend}>
            <StatCard icon={Target} label="Placement Accuracy" value="76%" change="+5%" />
            <StatCard icon={BarChart3} label="Body Mechanics" value="B+" change="+2 pts" />
            <StatCard icon={TrendingUp} label="Ball Speed" value="84 km/h" change="+3 km/h" />
            <StatCard icon={BrainCircuit} label="AI Coach Rating" value="Good" change="Improving" />
          </CoachView>

          <CoachView id="Training" activeView={activeView} icon={Swords} title="Training" chatRef={chatAreaRef} buddy={selectedBuddy} onSubmit={handleSend}>
            <TipCard icon={Swords} title="Pressure Training" description="Simulate match scenarios with time pressure and visual distractions." />
            <TipCard icon={Target} title="Placement Drills" description="Hit designated zones in the goal with increasing difficulty." />
            <TipCard icon={TrendingUp} title="Consistency Builder" description="10-rep sets tracking variance in placement and power." />
          </CoachView>

          <CoachView id="Progress" activeView={activeView} icon={TrendingUp} title="Progress" chatRef={chatAreaRef} buddy={selectedBuddy} onSubmit={handleSend}>
            <StatCard icon={TrendingUp} label="Conversion Rate" value="84%" change="+12%" />
            <StatCard icon={Target} label="Placement" value="76%" change="+5%" />
            <StatCard icon={Zap} label="Power Score" value="8.4/10" change="+0.3" />
            <StatCard icon={BrainCircuit} label="Coach Rating" value="B+" change="Up from C" />
          </CoachView>

          <CoachView id="Compare" activeView={activeView} icon={GitCompare} title="Compare" chatRef={chatAreaRef} buddy={selectedBuddy} onSubmit={handleSend}>
            <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <GitCompare className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/50 mb-3">Record kicks to compare form, placement, and power side by side.</p>
              <button onClick={() => setActiveView("Dashboard")} className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-all">
                Record a Kick
              </button>
            </div>
          </CoachView>

          <ViewWrapper id="Settings" activeView={activeView}>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-white/40" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">Settings</h2>
                <p className="text-sm text-white/40">API keys, preferences, and data export.</p>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                  <span className="text-xs text-white/30">Coming soon</span>
                </div>
              </div>
            </div>
          </ViewWrapper>
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-40 flex" style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)" }} onClick={() => setHistoryOpen(false)}>
          <div className="w-72 bg-[#0a0a0b] border-r border-white/10 h-full overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Session History</h3>
            <p className="text-xs text-white/30">No sessions yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
