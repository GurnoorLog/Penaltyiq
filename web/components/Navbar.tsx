"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { content } from "@/lib/content";
import { AccountMenu } from "./AccountMenu";
import { SignInButton } from "./SignInButton";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel rounded-none border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-wider accent-gradient bg-clip-text text-transparent">
          {content.nav.logo}
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {content.nav.links.map((link) => {
            if (link.authRequired && !session) return null;
            return (
              <Link
                key={link.label}
                href={link.disabled ? "#" : link.href}
                className={`text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors ${link.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {session ? <AccountMenu /> : <SignInButton />}
        </div>
      </div>
    </nav>
  );
}
