# PenaltyIQ

AI-powered biomechanical analysis of football penalty kicks. Upload a video, get a technique score, and receive AI-generated coaching tips.

## Architecture

```
penaltyiq/
├── web/          # Next.js 14+ App Router (TypeScript, Tailwind CSS)
├── backend/      # Python FastAPI (scoring, BitNet, Gemini chat)
├── models/       # BitNet.cpp compiled binary + weights
├── sample_data/  # Sample landmark data and session storage
└── tests/        # Python test suite
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm or yarn

### Web App

```bash
cd web
cp .env.local.example .env.local
# Edit .env.local with your Google OAuth credentials
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python -m backend.bridge
```

### Environment Variables

**Web app (`web/.env.local`):**
- `DATABASE_URL` — SQLite path (default: `file:./dev.db`)
- `NEXTAUTH_URL` — App URL (default: `http://localhost:3000`)
- `NEXTAUTH_SECRET` — Random secret for NextAuth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `NEXT_PUBLIC_API_BASE` — Backend URL (default: `http://127.0.0.1:8000`)

**Backend (`backend/.env`):**
- `BITNET_ENDPOINT` — Local LLM endpoint (default: `http://127.0.0.1:8080`)
- `GEMINI_API_KEY` — Google Gemini API key (optional, for chat)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API / OAuth consent screen
4. Create OAuth 2.0 credentials (Web application type)
5. Add `http://localhost:3000` as an authorized origin
6. Add `http://localhost:3000/api/auth/callback/google` as a redirect URI
7. Copy Client ID and Client Secret to `.env.local`

### BitNet Setup

See `models/README.md` for instructions on compiling and running BitNet.cpp.

### MediaPipe Models

1. Download the Pose Landmarker task file from [MediaPipe Models](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
2. Place it in `web/public/mediapipe-models/`

## Testing

```bash
cd backend
pytest tests/
```

## Build Order

1. BitNet server + client
2. Web app shell (auth, landing page)
3. Upload + Pose Overlay
4. Contact-Frame Capture
5. Backend Scoring
6. Backend Bridge (FastAPI)
7. Mission Control Dashboard
8. History Page
9. Stretch Features

## License

MIT
