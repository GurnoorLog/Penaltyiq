"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-1.5 text-sm rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-light)] transition-colors"
    >
      Sign In
    </button>
  );
}
