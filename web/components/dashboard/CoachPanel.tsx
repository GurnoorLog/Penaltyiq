"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { DashboardData } from "@/hooks/useDashboardData";
import { DiagnosticsPayload } from "@/lib/api";

interface CoachPanelProps {
  data: DashboardData;
  diagnostics: DiagnosticsPayload;
}

export function CoachPanel({ data, diagnostics }: CoachPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [chatMode, setChatMode] = useState(false);

  const statusText = diagnostics.local_bitnet_engine === "ready"
    ? content.dashboard.statusReady
    : diagnostics.local_bitnet_engine === "down"
    ? content.dashboard.statusOffline
    : content.dashboard.statusLoading;

  const handleChip = (action: string) => {
    const msg = `User requested: ${action}`;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);

    if (action === "analyze" && data.coaching) {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: data.coaching!.summary },
        ...data.coaching!.strengths.map((s) => ({ role: "system", text: `\u2705 ${s}` })),
        ...data.coaching!.tips.map((t) => ({ role: "system", text: `\u{1F4A1} ${t}` })),
        { role: "system", text: `\u{1F3AF} ${data.coaching!.drill}` },
      ]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setMessages((prev) => [
      ...prev,
      { role: "system", text: chatMode ? "Ask the Coach (online) response placeholder" : "Analysis requested. Use the chips above for quick actions." },
    ]);
    setInput("");
  };

  return (
    <div className="glass-panel-lg flex flex-col h-[600px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${diagnostics.local_bitnet_engine === "ready" ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-sm font-semibold">{content.dashboard.aiCoachTitle}</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{statusText}</span>
      </div>

      <div className="px-4 py-3 flex gap-2 flex-wrap border-b border-[var(--glass-border)]">
        {content.dashboard.chips.map((chip) => (
          <button
            key={chip.action}
            onClick={() => handleChip(chip.action)}
            className="px-3 py-1.5 text-xs rounded-full glass-panel hover:bg-[var(--glass)] transition-colors"
          >
            {chip.label}
          </button>
        ))}
        <button
          onClick={() => setChatMode(!chatMode)}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${chatMode ? "accent-gradient text-white" : "glass-panel hover:bg-[var(--glass)]"}`}
        >
          {content.dashboard.askCoach}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
              msg.role === "user"
                ? "accent-gradient text-white"
                : "glass-panel"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm mt-8">
            Select a chip above or ask a question about your technique.
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[var(--glass-border)]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={content.dashboard.inputPlaceholder}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg accent-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {chatMode ? "Online mode \u2022 Gemini" : `Local model \u2022 ${input.length} chars`}
        </p>
      </div>
    </div>
  );
}
