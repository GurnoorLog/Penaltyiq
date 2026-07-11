"use client";

import Link from "next/link";

interface TabBarProps {
  active: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: "\u{1F3E0}", label: "Home", href: "/dashboard" },
  { id: "upload", icon: "\u{1F4C1}", label: "Upload", href: "/start" },
  { id: "history", icon: "\u{1F4CB}", label: "History", href: "/history" },
  { id: "compare", icon: "\u{1F504}", label: "Compare", href: "/compare" },
  { id: "settings", icon: "\u{2699}\uFE0F", label: "Settings", href: "#" },
];

export function TabBar({ active }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel rounded-none border-b-0 border-x-0 z-40">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
