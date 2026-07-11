import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:  # Supports package execution locally and Railway's backend root directory.
    from backend.config import SESSIONS_DIR
    from backend.schemas import (
        MovementWindowInput,
        CaptureResponse,
        DiagnosticsPayload,
        CoachingOutput,
        ChatRequest,
        ChatResponse,
        SubScores,
        RawMeasurements,
        VideoRelevanceRequest,
        VideoRelevanceResponse,
    )
    from backend.scoring import compute_all
    from backend.bitnet_client import generate_coaching
    from backend.gemini_chat import (
        assess_penalty_video,
        chat as gemini_chat,
        is_available as gemini_available,
        refine_coaching,
    )
    from backend.metrics import MetricsCollector
except ModuleNotFoundError:
    from config import SESSIONS_DIR
    from schemas import (
    MovementWindowInput,
    CaptureResponse,
    DiagnosticsPayload,
    CoachingOutput,
    ChatRequest,
    ChatResponse,
    SubScores,
    RawMeasurements,
    VideoRelevanceRequest,
    VideoRelevanceResponse,
)
    from scoring import compute_all
    from bitnet_client import generate_coaching
    from gemini_chat import (
    assess_penalty_video,
    chat as gemini_chat,
    is_available as gemini_available,
    refine_coaching,
)
    from metrics import MetricsCollector

app = FastAPI(title="PenaltyIQ Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

metrics_collector = MetricsCollector()

SESSIONS_DIR.mkdir(parents=True, exist_ok=True)


def persist_session(session_id: str, data: dict):
    path = SESSIONS_DIR / f"{session_id}.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


@app.post("/api/capture")
async def capture(input_data: MovementWindowInput):
    if not input_data.window:
        raise HTTPException(status_code=400, detail="window must contain at least one frame")

    scoring_result = compute_all(input_data.window, input_data.kicking_foot)

    coaching_result = None
    coaching_error = None
    coaching_engine = "local"
    try:
        coaching_raw = generate_coaching(scoring_result["raw_measurements"])
        refined_coaching = refine_coaching(coaching_raw, scoring_result["raw_measurements"]) if coaching_raw else None
        if refined_coaching:
            coaching_raw = refined_coaching
            coaching_engine = "bitnet+gemini"
        if coaching_raw:
            coaching_result = CoachingOutput(**coaching_raw)
    except Exception as e:
        coaching_error = str(e)

    response = CaptureResponse(
        session_id=input_data.session_id,
        technique_score=scoring_result["technique_score"],
        sub_scores=SubScores(**scoring_result["sub_scores"]),
        raw_measurements=RawMeasurements(**scoring_result["raw_measurements"]),
        tracking_confidence=0.94,
        coaching=coaching_result,
        coaching_error=coaching_error,
        coaching_engine=coaching_engine,
    )

    persist_session(input_data.session_id, response.model_dump(mode="json"))

    return response


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@app.post("/api/video-relevance", response_model=VideoRelevanceResponse)
async def video_relevance(input_data: VideoRelevanceRequest):
    if not gemini_available():
        raise HTTPException(status_code=503, detail="Video verification requires a valid GEMINI_API_KEY.")
    result = assess_penalty_video(input_data.frames)
    if result is None:
        raise HTTPException(status_code=502, detail="Gemini could not verify this video. Please try again.")
    return VideoRelevanceResponse(**result)


@app.get("/api/metrics", response_model=DiagnosticsPayload)
async def get_metrics():
    data = metrics_collector.collect()
    return DiagnosticsPayload(**data)


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not gemini_available():
        return ChatResponse(
            reply="Ask the Coach needs an internet connection and a valid GEMINI_API_KEY."
        )

    session_path = SESSIONS_DIR / f"{req.session_id}.json"
    context = None
    if session_path.exists():
        with open(session_path) as f:
            context = json.load(f)

    reply = gemini_chat(req.session_id, req.message, context)
    return ChatResponse(reply=reply)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
