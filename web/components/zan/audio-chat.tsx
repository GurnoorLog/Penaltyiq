"use client";

export interface AiBuddy {
  id: string;
  name: string;
  icon: string;
  fallback: string;
}

export const aiBuddies: AiBuddy[] = [
  { id: "zan", name: "Zan", icon: "/logo_bankai.jpeg", fallback: "Z" },
  { id: "chatgpt", name: "ChatGPT", icon: "/openai.png", fallback: "C" },
  { id: "claude", name: "Claude", icon: "/claude.webp", fallback: "C" },
  { id: "copilot", name: "Copilot", icon: "/copilot-color.svg", fallback: "C" },
  { id: "deepseek", name: "DeepSeek", icon: "/deepseek-color.svg", fallback: "D" },
  { id: "metaai", name: "Meta AI", icon: "/metaai-color.svg", fallback: "M" },
  { id: "perplexity", name: "Perplexity", icon: "/perplexity-color.svg", fallback: "P" },
  { id: "qwen", name: "Qwen", icon: "/qwen-color.svg", fallback: "Q" },
  { id: "grok", name: "Grok", icon: "/grok.png", fallback: "G" },
  { id: "gemini", name: "Gemini", icon: "/gemini.svg", fallback: "G" },
];
