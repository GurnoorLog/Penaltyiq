"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function AccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--glass)] transition-colors"
      >
        {session.user.image ? (
          <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold">
            {session.user.email?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 glass-panel-lg p-2 z-50">
            <Link
              href="/history"
              className="block px-3 py-2 text-sm rounded-lg hover:bg-[var(--glass)] transition-colors"
              onClick={() => setOpen(false)}
            >
              My History
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 text-sm rounded-lg hover:bg-[var(--glass)] transition-colors opacity-50"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            <hr className="my-1 border-[var(--glass-border)]" />
            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--glass)] transition-colors text-red-400"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
