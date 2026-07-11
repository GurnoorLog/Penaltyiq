import React, { createContext, useContext, useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mic, Paperclip, FileText, X } from "lucide-react";

type MenuOption = "Auto" | "Max" | "Search" | "Plan";

interface FileAttachment {
  id: string;
  name: string;
}

interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

interface Position {
  x: number;
  y: number;
}

interface ChatInputProps {
  placeholder?: string;
  onSubmit?: (value: string, files?: FileAttachment[]) => void;
  disabled?: boolean;
  glowIntensity?: number;
  expandOnFocus?: boolean;
  animationDuration?: number;
  textColor?: string;
  backgroundOpacity?: number;
  showEffects?: boolean;
  menuOptions?: MenuOption[];
  onMicClick?: () => void;
}

interface ChatInputContextProps {
  mousePosition: Position;
  ripples: RippleEffect[];
  addRipple: (x: number, y: number) => void;
  animationDuration: number;
  glowIntensity: number;
  textColor: string;
  showEffects: boolean;
}

const ChatInputContext = createContext<ChatInputContextProps | undefined>(undefined);

const SendButton = memo(({ isDisabled }: { isDisabled: boolean }) => {
  return (
    <button
      type="submit"
      aria-label="Send message"
      disabled={isDisabled}
      className={`ml-auto self-center h-8 w-8 flex items-center justify-center rounded-full border-0 p-0 transition-all z-20 ${
        isDisabled
          ? "opacity-40 cursor-not-allowed bg-gray-400 text-white/60"
          : "opacity-90 bg-[#0A1217] text-white hover:opacity-100 cursor-pointer hover:shadow-lg"
      }`}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`block ${isDisabled ? "opacity-50" : "opacity-100"}`}>
        <path d="M16 22L16 10M16 10L11 15M16 10L21 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
});

const OptionsMenu = memo(({ isOpen, onSelect, menuOptions }: { isOpen: boolean; onSelect: (option: MenuOption) => void; menuOptions: MenuOption[] }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-30 min-w-[120px]">
      <ul className="py-1">
        {menuOptions.map((option) => (
          <li key={option} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-neutral-900 text-sm font-medium" onClick={() => onSelect(option)}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
});

const GlowEffects = memo(({ glowIntensity, mousePosition, animationDuration, enabled }: { glowIntensity: number; mousePosition: Position; animationDuration: number; enabled: boolean }) => {
  if (!enabled) return null;
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-white/12 to-white/8 backdrop-blur-2xl rounded-3xl"></div>
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `0 0 0 1px rgba(34,197,94,${0.2 * glowIntensity}),0 0 8px rgba(34,197,94,${0.3 * glowIntensity}),0 0 16px rgba(16,185,129,${0.2 * glowIntensity}),0 0 24px rgba(34,197,94,${0.15 * glowIntensity})`,
          filter: "blur(0.5px)",
          transitionDuration: `${animationDuration}ms`,
        }}
      />
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `0 0 12px rgba(34,197,94,${0.4 * glowIntensity}),0 0 20px rgba(16,185,129,${0.25 * glowIntensity}),0 0 32px rgba(34,197,94,${0.2 * glowIntensity})`,
          filter: "blur(1px)",
          transitionDuration: `${animationDuration}ms`,
        }}
      />
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none blur-sm"
        style={{ background: `radial-gradient(circle 120px at ${mousePosition.x}% ${mousePosition.y}%, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.05) 30%, rgba(34,197,94,0.04) 60%, transparent 100%)` }}
      />
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 overflow-hidden blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/8 to-transparent -translate-x-full group-hover:translate-x-full"
          style={{ transitionProperty: "transform", transitionDuration: `${animationDuration * 2}ms`, transitionTimingFunction: "ease-out" }}
        />
      </div>
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-25 transition-opacity bg-gradient-to-r from-transparent via-white/4 to-transparent animate-pulse blur-sm" />
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-15 group-focus-within:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-green-400/5 via-emerald-400/5 to-green-400/5 blur-sm" />
    </>
  );
});

const InputArea = memo(({ value, setValue, placeholder, handleKeyDown, disabled, isSubmitDisabled }: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  isSubmitDisabled: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 22 * 4 + 16;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + "px";
    }
  }, [value]);
  return (
    <div className="flex-1 relative h-full flex items-center">
      <textarea ref={textareaRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} aria-label="Message Input" rows={1}
        className="w-full min-h-8 max-h-24 bg-transparent text-sm font-normal text-left self-center text-neutral-900 dark:text-white placeholder-neutral-400 border-0 outline-none px-3 pr-10 py-1 z-20 relative resize-none overflow-y-auto"
        disabled={disabled}
      />
      <SendButton isDisabled={isSubmitDisabled} />
    </div>
  );
});

export default function DynamicGrowInput({
  placeholder = "Ask me anything...",
  onSubmit,
  disabled = false,
  glowIntensity = 0.4,
  expandOnFocus = true,
  animationDuration = 500,
  showEffects = true,
  menuOptions,
  onMicClick,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 50, y: 50 });
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const throttleRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && onSubmit && !disabled) {
      onSubmit(value.trim());
      setValue("");
      setFiles([]);
    }
  }, [value, onSubmit, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); }
  }, [handleSubmit]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!showEffects) return;
    if (containerRef.current && !throttleRef.current) {
      throttleRef.current = window.setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setMousePosition({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
        }
        throttleRef.current = null;
      }, 50);
    }
  }, [showEffects]);

  const addRipple = useCallback((x: number, y: number) => {
    if (!showEffects) return;
    if (ripples.length < 5) {
      const newRipple: RippleEffect = { x, y, id: Date.now() };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)), 600);
    }
  }, [ripples, showEffects]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      addRipple(e.clientX - rect.left, e.clientY - rect.top);
    }
  }, [addRipple]);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  const defaultOptions = menuOptions || [];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full min-h-12 transition-all duration-500 ease-out">
      <div ref={containerRef} onMouseMove={handleMouseMove} onClick={handleClick}
        className="relative flex flex-col w-full min-h-full bg-white/5 dark:bg-black/60 backdrop-blur-2xl border border-white/[0.08] shadow-lg rounded-3xl p-2 overflow-visible group transition-all duration-500"
      >
        <GlowEffects glowIntensity={glowIntensity} mousePosition={mousePosition} animationDuration={animationDuration} enabled={showEffects} />
        <div className="flex items-center relative z-20">
          {defaultOptions.length > 0 && (
            <div className="relative">
              <button type="button" onClick={toggleMenu} aria-label="Menu options"
                className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 dark:text-white dark:bg-white/10 dark:hover:bg-white/20 transition-all ml-1 mr-1"
              >
                <Plus size={16} />
              </button>
              <OptionsMenu isOpen={isMenuOpen} onSelect={() => {}} menuOptions={defaultOptions} />
            </div>
          )}
          <InputArea value={value} setValue={setValue} placeholder={placeholder} handleKeyDown={handleKeyDown} disabled={disabled} isSubmitDisabled={disabled || !value.trim()} />
        </div>
        <div className="flex items-center justify-between px-1 pt-1 z-20 relative">
          <div className="flex items-center gap-0.5">
            <button type="button" onClick={onMicClick} className="h-7 w-7 flex items-center justify-center rounded-full text-neutral-900/50 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white/70 hover:bg-white/20 transition-all" aria-label="Use microphone">
              <Mic className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="h-7 w-7 flex items-center justify-center rounded-full text-neutral-900/50 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white/70 hover:bg-white/20 transition-all" aria-label="Attach file">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" multiple className="hidden" />
      </div>
    </form>
  );
}
