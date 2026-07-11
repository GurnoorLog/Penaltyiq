"use client";

import { cn } from "@/lib/utils";
import {
  Download,
  Plus,
  FolderKanban,
  Search,
  Bot,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Asterisk,
  Home,
  History,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAction?: (action: string) => void;
}

const navItems = [
  { label: "New Chat", shortcut: "⌘N", icon: Plus },
  { label: "New Projects", shortcut: "⌘P", icon: FolderKanban },
  { label: "Search", shortcut: "⌘K", icon: Search },
  { label: "Models", shortcut: null, icon: Bot },
  { label: "History", shortcut: "⌘H", icon: History },
  { label: "Settings", shortcut: null, icon: Settings },
  { label: "Dashboard", shortcut: null, icon: Home },
];

export function Sidebar({ isOpen, onToggle, onAction }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full bg-black/40 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden border-r border-white/10",
        isOpen ? "w-64" : "w-16",
      )}
      style={{ transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {isOpen ? (
        <div className="flex flex-col h-full min-w-64">
          <div className="flex items-center justify-between px-4 h-12">
            <Download className="w-4 h-4 text-white/70 hover:text-white cursor-pointer transition-colors" />
            <button
              onClick={onToggle}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center px-5 pt-2 pb-5">
            <div className="w-10 h-10 rounded-xl border border-white/15 bg-white/[0.03] flex items-center justify-center">
              <Asterisk className="w-5 h-5 text-white/80" />
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onAction?.(item.label)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/[0.05] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-[11px] text-white/20 group-hover:text-white/50 transition-colors">{item.shortcut}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="px-3 pt-2 pb-4">
            <div className="h-px bg-white/[0.05] mb-3" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full items-center py-3 gap-0.5">
          <button
            onClick={onToggle}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <div className="w-6 h-px bg-white/10 my-1.5" />
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              <button
                onClick={() => onAction?.(item.label)}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <item.icon className="w-5 h-5" />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                <div className="bg-[#111111] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-white/90 whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-auto w-6 h-px bg-white/10 my-1.5" />
        </div>
      )}
    </aside>
  );
}
