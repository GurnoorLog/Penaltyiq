# PenaltyIQ — Decisions Log

This file logs every intentional deviation from the PRD with a one-line reason.

| Date | Decision | Reason |
|------|----------|--------|
| 2026-07-11 | Hero image uses CSS background fallback instead of pre-composed image | The provided `/public/hero-image.png` may not exist yet; CSS fallback ensures landing page renders without it. |
| 2026-07-11 | Mock data in `useDashboardData.ts` used before backend wired | Enables dashboard/HCI development in parallel with backend work, per build order step 7. |
| 2026-07-11 | SQLite used as database provider | Matches PRD spec for local dev; swappable to Postgres later via config per PRD 2. |
| 2026-07-11 | MediaPipe Pose overlay is a stub canvas without actual landmarker init | Full MediaPipe integration requires WASM task files to be downloaded and placed in `public/mediapipe-models/`. Stub allows layout dev without model assets. |
| 2026-07-11 | `next-auth` beta (v5) used instead of stable | Next.js 16 requires next-auth v5 beta for App Router compatibility. |
| 2026-07-11 | `@auth/prisma-adapter` used instead of `next-auth/prisma-adapter` | `next-auth/prisma-adapter` is deprecated; `@auth/prisma-adapter` is the maintained replacement. |
