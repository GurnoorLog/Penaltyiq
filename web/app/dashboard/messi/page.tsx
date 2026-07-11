"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Settings } from "lucide-react";
import { Sidebar } from "@/components/zan/sidebar";
import { ChatArea, type ChatAreaHandle } from "@/components/zan/chat-area";
import { InputBar } from "@/components/zan/chat-input";
import { aiBuddies, type AiBuddy } from "@/components/zan/audio-chat";

export default function MessiDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<AiBuddy>(aiBuddies[0]);
  const [activeView, setActiveView] = useState<string>("Dashboard");
  const [historyOpen, setHistoryOpen] = useState(false);
  const chatAreaRef = useRef<ChatAreaHandle>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onAction={handleSidebarAction} />

      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {activeView === "Dashboard" && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <iframe
                src="/messi-dashboard.html?embedded=1"
                className="absolute inset-0 w-full h-full border-0"
                title="StrikerOS Dashboard"
              />
            </div>
          </div>
        )}

        {activeView === "Chat" && (
          <div className="flex-1 flex flex-col min-h-0">
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
          </div>
        )}

        {activeView === "Models" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">Select AI Model</h2>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {aiBuddies.map((buddy) => (
                  <button
                    key={buddy.id}
                    onClick={() => {
                      setSelectedBuddy(buddy);
                      setActiveView("Chat");
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                      selectedBuddy.id === buddy.id
                        ? "bg-white/10 ring-1 ring-white/20"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {buddy.fallback}
                    </div>
                    <span className="text-xs text-white/80">{buddy.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "Settings" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Settings className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Settings</h2>
              <p className="text-sm text-white/50">API management, theme, and system prompts coming soon.</p>
            </div>
          </div>
        )}
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

      {!mounted && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0b]">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}
    </div>
  );
}
