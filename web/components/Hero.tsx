"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { content } from "@/lib/content";

export function Hero() {
  const { data: session } = useSession();

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 60s linear infinite;
        }
      `}</style>

      <div className="relative w-full h-screen overflow-hidden bg-[#09090b]">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="/landing-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Rotating Decorative Circles (from WaitlistHero) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            perspective: "1200px",
            transform: "perspective(1200px) rotateX(15deg)",
            transformOrigin: "center bottom",
          }}
        >
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "2000px",
                height: "2000px",
                transform: "translate(-50%, -50%) rotate(279.05deg)",
              }}
            >
              <img
                src="https://framerusercontent.com/images/oqZEqzDEgSLygmUDuZAYNh2XQ9U.png?scale-down-to=2048"
                alt=""
                className="w-full h-full object-cover opacity-20"
              />
            </div>
          </div>

          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "1000px",
                height: "1000px",
                transform: "translate(-50%, -50%) rotate(304.42deg)",
              }}
            >
              <img
                src="https://framerusercontent.com/images/UbucGYsHDAUHfaGZNjwyCzViw8.png?scale-down-to=1024"
                alt=""
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          </div>

          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "800px",
                height: "800px",
                transform: "translate(-50%, -50%) rotate(48.33deg)",
              }}
            >
              <img
                src="https://framerusercontent.com/images/Ans5PAxtJfg3CwxlrPMSshx2Pqc.png"
                alt=""
                className="w-full h-full object-cover opacity-40"
              />
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #09090b 10%, rgba(9,9,11,0.8) 40%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center gap-6 px-4">
          {/* Logo Icon */}
          <div className="w-20 h-20 rounded-2xl shadow-lg overflow-hidden ring-1 ring-white/10 mb-2">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              IQ
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-center tracking-tight text-white">
            {content.hero.title}
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 text-center max-w-xl">
            {content.hero.subtitle}
          </p>

          {/* Sign In / Get Started */}
          <div className="mt-4">
            {session ? (
              <Link
                href="/start"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-[#0079da] hover:brightness-110 transition-all active:scale-95 text-base"
              >
                {content.hero.cta}
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold text-white bg-[#0079da] hover:brightness-110 transition-all active:scale-95 text-base"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {content.hero.cta}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
