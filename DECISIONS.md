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
| 2026-07-11 | SoccerKicks thresholds in `config.py` kept at literature baselines | SoccerKicks dataset (1.5 GB+) could not be downloaded via gdown (timeout); calibrate_thresholds.py script written and ready — user must download annotations and run it. |
| 2026-07-11 | `calibration_results.csv` is an empty placeholder (header only) | Will be populated when user runs `python research/calibrate_thresholds.py` after downloading SoccerKicks annotations. |
| 2026-07-11 | Skeleton3DView uses R3F Canvas instead of A-Frame | R3F + Three.js already installed in `web/package.json`; A-Frame would be an additional dependency. R3F integrates naturally with React component model. |
| 2026-07-11 | 2D/3D toggle placed inside VideoUploader rather than as a separate route | Keeps the capture flow contained in one page; PoseOverlay and Skeleton3DView share the same landmarksRef without routing complexity. |
| 2026-07-11 | SoccerKicks adapter maps HMMR 3D→MediaPipe 2D by dropping z | scoring.py uses 2D (x,y) landmarks for angle computation; 3D z is available but not used by the current scoring formulas. |
| 2026-07-11 | Skeleton3DView normalizes landmark coords to [-1,1] for display | MediaPipe Pose returns [0,1] normalized x,y; remapping to [-1,1] centers the skeleton in the Canvas. |
| 2026-07-11 | Offline badge bug in messi-dashboard.html fixed — removed hardcoded lines 1208-1214 that overrode dynamic polling | The hardcoded HTML lines always showed "Offline" badge even when backend was reachable; removed and let JavaScript fetch decide. |
