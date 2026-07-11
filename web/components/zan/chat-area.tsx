"use client";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { Copy, RotateCcw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/zan/ui/avatar";
import { Button } from "@/components/zan/ui/button";
import type { AiBuddy } from "@/components/zan/audio-chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  buddy: AiBuddy;
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function getTimestamp() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface ChatAreaHandle {
  handleNewChat: () => void;
  hasMessages: boolean;
}

interface ChatAreaProps {
  onNewChat?: () => void;
  aiBuddy: AiBuddy;
}

export const ChatArea = forwardRef<ChatAreaHandle, ChatAreaProps>(
  function ChatArea({ onNewChat, aiBuddy }, ref) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading]);

    const addMessage = useCallback(
      (role: "user" | "assistant", content: string) => {
        setMessages((prev) => [
          ...prev,
          { id: generateId(), role, content, timestamp: getTimestamp(), buddy: aiBuddy },
        ]);
      },
      [aiBuddy],
    );

    const handleSend = useCallback(
      async (content: string) => {
        setApiError(null);
        addMessage("user", content);
        setIsLoading(true);

        // Simple mock response
        await new Promise((r) => setTimeout(r, 800));
        setIsLoading(false);
        addMessage(
          "assistant",
          `Thanks for your message! I'm **${aiBuddy.name}**, your PenaltyIQ coaching assistant. I can help you analyze your penalty kick technique, review metrics, or suggest improvements.`
        );
      },
      [addMessage, aiBuddy],
    );

    const handleNewChat = useCallback(() => {
      setMessages([]);
      setIsLoading(false);
      setApiError(null);
      onNewChat?.();
    }, [onNewChat]);

    useImperativeHandle(ref, () => ({
      handleNewChat,
      get hasMessages() { return messages.length > 0; },
    }), [handleNewChat, messages.length]);

    if (messages.length === 0 && !apiError) return null;

    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 pb-[130px] scroll-smooth">
        <div className="mx-auto max-w-[780px] flex flex-col gap-12">
          {messages.map((msg) => (
            <AnimatedMessage key={msg.id}>
              <ChatMessage
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                aiBuddy={msg.buddy}
              />
            </AnimatedMessage>
          ))}

          {isLoading && (
            <LoadingDots name={aiBuddy.name} />
          )}

          {apiError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              <span>{apiError}</span>
              <button onClick={() => setApiError(null)} className="ml-auto text-red-400/60 hover:text-red-300 transition-colors shrink-0">✕</button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

function LoadingDots({ name }: { name: string }) {
  const dot1 = useRef<HTMLDivElement>(null);
  const dot2 = useRef<HTMLDivElement>(null);
  const dot3 = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });
    tl.to(dot1.current, { y: -4, duration: 0.25, ease: "power2.out" })
      .to(dot1.current, { y: 0, duration: 0.25, ease: "power2.in" })
      .to(dot2.current, { y: -4, duration: 0.25, ease: "power2.out" }, "+=0.05")
      .to(dot2.current, { y: 0, duration: 0.25, ease: "power2.in" })
      .to(dot3.current, { y: -4, duration: 0.25, ease: "power2.out" }, "+=0.05")
      .to(dot3.current, { y: 0, duration: 0.25, ease: "power2.in" });
    return () => { tl.kill(); };
  }, []);
  return (
    <div className="flex items-center gap-2.5 text-sm text-white/50 px-4 py-2">
      <div className="flex items-center gap-1">
        <div ref={dot1} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <div ref={dot2} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <div ref={dot3} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>
      <span>{name}</span>
    </div>
  );
}

function AnimatedMessage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" });
    }
  }, []);
  return <div ref={ref}>{children}</div>;
}

function ChatMessage({ role, content, timestamp, aiBuddy }: {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  aiBuddy?: AiBuddy;
}) {
  const time = timestamp || new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  // Convert bold markdown **text** to <strong>
  const renderContent = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (role === "user") {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-6 rounded-md">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format" alt="You" className="rounded-md" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[11px] font-bold rounded-md">U</AvatarFallback>
          </Avatar>
          <span className="text-[13px] font-semibold text-white/60">You</span>
        </div>
        <div className="mt-[6px] ml-[34px]">
          <p className="text-base leading-[1.65] text-white/90">{renderContent(content)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col group">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-6 rounded-md">
          <AvatarImage src={aiBuddy?.icon} alt={aiBuddy?.name ?? "AI"} className="rounded-md" />
          <AvatarFallback className="bg-neutral-700 text-neutral-400 text-[11px] font-bold rounded-md">
            {aiBuddy?.fallback ?? "Z"}
          </AvatarFallback>
        </Avatar>
        <span className="text-[13px] font-semibold text-white/60">{aiBuddy?.name ?? "AI"}</span>
        <span className="text-[11px] text-white/30 ml-auto">{time}</span>
      </div>
      <div className="mt-[6px] ml-[34px]">
        <p className="text-base leading-[1.65] text-white/90">{renderContent(content)}</p>
      </div>
      <div className="flex items-center gap-3 mt-[14px] ml-[34px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy" className="text-white/30 hover:text-white">
          <Copy className="size-[18px]" />
        </Button>
      </div>
    </div>
  );
}
