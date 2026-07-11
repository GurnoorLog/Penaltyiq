"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export type ChatStatus = "ready" | "streaming" | "submitted" | "idle";

export type InputBarProps = {
  onSend?: (message: { role: "user"; content: string }) => void;
  onStop?: () => void;
  status?: ChatStatus;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

const SendIcon = ({ className = "w-[14px] h-[14px]" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const StopIcon = ({ className = "w-[12px] h-[12px]" }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

export const InputBar = memo(function InputBar({
  onSend,
  onStop,
  status = "ready",
  placeholder = "Send a message...",
  className,
  disabled,
  autoFocus,
}: InputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = status === "streaming" || status === "submitted";
  const hasInput = input.trim().length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    const next = Math.min(el.scrollHeight, 120);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
  }, [input]);

  useEffect(() => {
    if (!autoFocus) return;
    textareaRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend?.({ role: "user", content: trimmed });
    setInput("");
  }, [input, isStreaming, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      !(e.target as HTMLElement).closest("button, textarea")
    ) {
      textareaRef.current?.focus();
    }
  }, []);

  const sendState: "idle" | "typing" | "streaming" = isStreaming
    ? "streaming"
    : hasInput && !disabled
      ? "typing"
      : "idle";

  return (
    <div className={cn("shrink-0 px-3 pb-3 w-full", className)}>
      <div className="mx-auto max-w-[420px]">
        <div
          className="relative cursor-text rounded-[16px] bg-white dark:bg-neutral-800/80 shadow-sm ring-1 ring-neutral-200 dark:ring-white/15"
          onClick={handleContainerClick}
        >
          <div className="pt-3 pb-0 pr-3 pl-3.5 min-h-[44px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent border-0 outline-none text-[14px] leading-[1.6] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "overflow-hidden",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
          <div className="flex items-center justify-end gap-3 px-2 pt-1 pb-2">
            <button
              type="button"
              onClick={() => {
                if (isStreaming) onStop?.();
                else if (hasInput) handleSubmit();
              }}
              aria-label={isStreaming ? "Stop" : "Send"}
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150",
                sendState === "typing" || sendState === "streaming"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600",
              )}
            >
              {isStreaming ? <StopIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InputBar;
