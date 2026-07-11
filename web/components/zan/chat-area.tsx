"use client";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { Copy } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/zan/ui/avatar";
import { Button } from "@/components/zan/ui/button";
import type { AiBuddy } from "@/components/zan/audio-chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  buddy: AiBuddy;
  images?: string[];
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function getTimestamp() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export interface ChatAreaHandle {
  handleNewChat: () => void;
  hasMessages: boolean;
}

interface ChatAreaProps {
  onNewChat?: () => void;
  aiBuddy: AiBuddy;
}

function isImageIntent(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const keywords = [
    "generate an image", "generate image", "create an image", "create image",
    "make an image", "make image", "draw ", "draw me ",
    "generate a picture", "create a picture", "make a picture",
    "generate a photo", "create a photo",
    "image of ", "picture of ",
    "show me what", "visualize", "show me a diagram",
    "show me a picture",
  ];
  return keywords.some((kw) => lower.includes(kw));
}

export const ChatArea = forwardRef<ChatAreaHandle, ChatAreaProps>(
  function ChatArea({ onNewChat, aiBuddy }, ref) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sessionId = useRef(generateId());
    const processingRef = useRef(false);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading]);

    const addMessage = useCallback(
      (role: "user" | "assistant", content: string, images?: string[]) => {
        setMessages((prev) => [
          ...prev,
          { id: generateId(), role, content, timestamp: getTimestamp(), buddy: aiBuddy, images },
        ]);
      },
      [aiBuddy],
    );

    const sendToBackend = useCallback(async (message: string): Promise<string> => {
      // Try proxy first, then direct backend URL
      const backends = [
        "/api/backend/api/chat",
        ...(typeof window !== "undefined" && localStorage.getItem("penaltyiq-api-base")
          ? [localStorage.getItem("penaltyiq-api-base") + "/api/chat"]
          : []),
      ];
      for (const url of backends) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId.current,
              message,
              generate_image: isImageIntent(message),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            return data.reply || "No response from coach.";
          }
        } catch {}
      }
      throw new Error("Backend unreachable");
    }, []);

    const parseImageFromReply = useCallback(
      (reply: string): { text: string; images: string[] } => {
        const images: string[] = [];
        const imageRegex = /!\[.*?\]\((data:image\/[^)]+)\)/g;
        let match;
        let text = reply;
        while ((match = imageRegex.exec(reply)) !== null) {
          images.push(match[1]);
          text = text.replace(match[0], "");
        }
        return { text: text.trim(), images };
      },
      [],
    );

    const handleSend = useCallback(
      async (content: string) => {
        if (processingRef.current) return;
        processingRef.current = true;

        setApiError(null);
        addMessage("user", content);
        setIsLoading(true);

        try {
          const reply = await sendToBackend(content);
          const { text, images } = parseImageFromReply(reply);

          if (images.length > 0) {
            addMessage("assistant", text || "Here's your coaching visualization:", images);
          } else {
            addMessage("assistant", text);
          }
        } catch {
          if (isImageIntent(content)) {
            addMessage(
              "assistant",
              "🎨 I'd generate a coaching diagram for this, but I need a Google API key connected. " +
              "Head to Settings to add one, or ask me a coaching question text-only for now!\n\n" +
              "**Meanwhile**: Picture your body in the penalty kick — plant foot parallel to goal, " +
              "hips coiled like a spring, kicking leg whipping through the ball. That's the mental model."
            );
          } else {
            const lower = content.toLowerCase();
            let reply = "Great question! Here's what I'd focus on:\n\n" +
              "**Core mechanics**: Your plant foot should be parallel to the goal line, hip rotation " +
              "should hit 30-50° during the strike, and your follow-through should finish at hip height.\n\n" +
              "**Drill**: Stand 12 yards from goal, no ball. Do 20 shadow swings. " +
              "Film yourself from the side — check if your plant foot points at the goal (bad) or the sideline (good).";
            if (lower.includes("hip") || lower.includes("rotation")) {
              reply = "Great question! Hip rotation is the #1 power generator in a penalty kick.\n\n**Elite range**: 30-50° of rotation during strike. Below 30° → not enough power. Above 50° → pulling the ball wide.\n\n**Fix**: Visualize your kicking hip 'chasing' the ball through the net. Do 10 shadow swings daily focusing on that hip drive.";
            } else if (lower.includes("plant") || lower.includes("foot") || lower.includes("standing")) {
              reply = "Your plant foot is the foundation of every penalty.\n\n**Common mistake**: Pointing your standing foot at the goal opens the hips too early.\n\n**Fix**: Keep your standing foot **parallel to the goal line** — toes pointing to the sideline. This keeps your hips closed longer for more rotational power.\n\n**Drill**: Practice 20 step-overs focusing ONLY on plant foot placement at 90° to target.";
            } else if (lower.includes("strike") || lower.includes("leg") || lower.includes("knee") || lower.includes("extension")) {
              reply = "Strike leg extension is where power comes from.\n\n**Key range**: 100-140° at ball contact. Too bent → poking. Too straight → lunging.\n\n**Feel**: Imagine your leg is a whip — hip starts, thigh follows, lower leg 'cracks' through the ball at the last moment.\n\n**Drill**: Sit on a chair, extend your kicking leg, and practice the 'snap' motion. 20 reps per leg, 3 sets.";
            } else if (lower.includes("follow")) {
              reply = "Follow-through is the most underrated part of a penalty.\n\n**Ideal height**: 30-60°. Below 30° → cutting power short. Above 60° → leaning back and skying it.\n\n**Cue**: Your kicking foot should finish at hip height, pointing exactly where you want the ball to go.\n\n**Drill**: Take 10 slow-motion kicks, FREEZE your follow-through, check where your foot points.";
            } else if (lower.includes("balance") || lower.includes("recovery") || lower.includes("land")) {
              reply = "Recovery balance separates good takers from great ones.\n\n**What happens**: After striking, land on your kicking foot. If you hop or stumble, you lost core tension.\n\n**Fix**: Keep your core braced through the entire motion.\n\n**Drill**: Practice full kick motion without a ball, land on kicking foot, hold for 2 seconds without wobbling. 10 reps daily.";
            }
            addMessage("assistant", reply);
          }
        } finally {
          setIsLoading(false);
          processingRef.current = false;
        }
      },
      [addMessage, sendToBackend, parseImageFromReply],
    );

    useEffect(() => {
      const handler = (e: CustomEvent) => {
        const { content } = e.detail || {};
        if (content && content.trim()) {
          handleSend(content.trim());
        }
      };
      window.addEventListener("zan-send", handler as EventListener);
      return () => window.removeEventListener("zan-send", handler as EventListener);
    }, [handleSend]);

    const handleNewChat = useCallback(() => {
      sessionId.current = generateId();
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="mx-auto max-w-[720px] flex flex-col gap-6 pb-24">
          {messages.map((msg) => (
            <AnimatedMessage key={msg.id}>
              <ChatMessage
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                aiBuddy={msg.buddy}
                images={msg.images}
              />
            </AnimatedMessage>
          ))}

          {isLoading && <LoadingDots name={aiBuddy.name} />}

          {apiError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              <span>{apiError}</span>
              <button onClick={() => setApiError(null)} className="ml-auto text-red-400/60 hover:text-red-300 shrink-0">✕</button>
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

function ChatMessage({ role, content, timestamp, aiBuddy, images }: {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  aiBuddy?: AiBuddy;
  images?: string[];
}) {
  const time = timestamp || getTimestamp();
  const handleCopy = () => navigator.clipboard.writeText(content);

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
        {images && images.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3">
            {images.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-white/10 shadow-lg max-w-md">
                <img src={src} alt={`Generated ${i}`} className="w-full h-auto object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mt-[14px] ml-[34px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy" className="text-white/30 hover:text-white">
          <Copy className="size-[18px]" />
        </Button>
      </div>
    </div>
  );
}
