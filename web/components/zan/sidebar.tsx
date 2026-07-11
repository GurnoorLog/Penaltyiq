"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Home,
  BarChart3,
  Swords,
  TrendingUp,
  GitCompare,
  History,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAction?: (action: string) => void;
}

const navItems = [
  { label: "AI Coach", icon: BrainCircuit },
  { label: "Dashboard", icon: Home },
  { label: "Kick Analysis", icon: BarChart3 },
  { label: "Training", icon: Swords },
  { label: "Progress", icon: TrendingUp },
  { label: "Compare", icon: GitCompare },
  { label: "History", icon: History },
  { label: "Settings", icon: Settings },
];

const MIN_WIDTH = 60;
const MAX_WIDTH = 320;
const COLLAPSED_WIDTH = 60;
const DEFAULT_OPEN_WIDTH = 220;

export function Sidebar({ isOpen, onToggle, onAction }: SidebarProps) {
  const [width, setWidth] = useState(DEFAULT_OPEN_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_OPEN_WIDTH);

  useEffect(() => {
    if (!isOpen) {
      setWidth(COLLAPSED_WIDTH);
    } else {
      setWidth(Math.max(MIN_WIDTH, width));
    }
  }, [isOpen]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
      setWidth(next);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (width < 100) {
        onToggle();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, width, onToggle]);

  const isCollapsed = width < 100;

  return (
    <aside
      className={cn(
        "h-full bg-[#0a0a0b] flex flex-col shrink-0 overflow-hidden border-r border-white/10 relative",
      )}
      style={{ width, transition: isResizing ? "none" : "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-end px-3 h-12 shrink-0">
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Logo */}
      {!isCollapsed && (
        <div className="flex items-center px-5 pb-5 shrink-0">
          <div className="w-9 h-9 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onAction?.(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-all group whitespace-nowrap",
              isCollapsed && "justify-center px-0",
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Resize handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500/30 active:bg-emerald-500/50 transition-colors z-50"
      />
    </aside>
  );
}
