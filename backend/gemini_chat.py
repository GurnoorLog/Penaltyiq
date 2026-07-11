"""Gemini vision gate and coaching refinement.

Gemini only receives the three small user-selected video frames used for relevance
checking plus numeric, already-computed measurement data. Pose inference and scoring
remain local and never depend on Gemini.
"""

import base64
import json
from typing import Optional

from backend.config import GEMINI_API_KEY, GEMINI_MODEL

_conversations: dict = {}
_chat_available = bool(GEMINI_API_KEY)
_model = None

if _chat_available:
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel(GEMINI_MODEL)
    except Exception:
        _chat_available = False


def is_available() -> bool:
    return _chat_available and _model is not None


def _json_response(response) -> Optional[dict]:
    text = getattr(response, "text", "").strip()
    if text.startswith("```"):
        text = "\n".join(line for line in text.splitlines() if not line.startswith("```"))
    try:
        payload = json.loads(text)
    except (TypeError, json.JSONDecodeError):
        return None
    return payload if isinstance(payload, dict) else None


def _image_part(data_url: str) -> Optional[dict]:
    if not data_url.startswith("data:image/") or "," not in data_url:
        return None
    header, encoded = data_url.split(",", 1)
    try:
        data = base64.b64decode(encoded, validate=True)
    except ValueError:
        return None
    mime_type = header.split(";", 1)[0].replace("data:", "")
    return {"mime_type": mime_type, "data": data}


def assess_penalty_video(frames: list[str]) -> Optional[dict]:
    """Classify sampled frames before local pose processing starts."""
    if not is_available():
        return None
    images = [part for frame in frames if (part := _image_part(frame))]
    if not images:
        return {"accepted": False, "confidence": 1.0, "detected_activity": "invalid upload", "reason": "No valid video frames were supplied."}

    prompt = """You are PenaltyIQ's upload gate. Inspect these sampled video frames.
Accept only a real football/soccer kick or penalty/free-kick training clip where a player's lower body can be assessed.
Reject unrelated content, non-sports content, crowds/highlights without a visible kicker, still images, and clips where the player is too obscured to evaluate.
Do not judge skill or make biomechanical claims. Return ONLY JSON:
{"accepted": boolean, "confidence": number from 0 to 1, "detected_activity": string, "reason": string}.
When uncertain, reject the upload so the user can provide a clearer kick clip."""
    try:
        response = _model.generate_content(
            [prompt, *images],
            generation_config={"temperature": 0, "response_mime_type": "application/json"},
        )
        result = _json_response(response)
        if not result:
            return None
        return {
            "accepted": bool(result.get("accepted", False)),
            "confidence": max(0.0, min(1.0, float(result.get("confidence", 0)))),
            "detected_activity": str(result.get("detected_activity", "unknown")),
            "reason": str(result.get("reason", "The clip could not be verified as a football kick.")),
        }
    except Exception:
        return None


def refine_coaching(local_coaching: dict, measurements: dict) -> Optional[dict]:
    """Use Gemini as an editorial layer; local measurements remain the source of truth."""
    if not is_available():
        return None
    prompt = f"""You are the second half of PenaltyIQ's dual-brain coaching system.
The local engine measured the kick and a local model drafted feedback. Preserve the factual direction of the measurements and do not invent precision, injuries, or contact-angle claims. Improve the draft into concise, encouraging football coaching.
Return ONLY valid JSON with exactly: summary, strengths (array), tips (array), drill.

Measurements (source of truth): {json.dumps(measurements)}
Local draft: {json.dumps(local_coaching)}"""
    try:
        response = _model.generate_content(
            prompt,
            generation_config={"temperature": 0.25, "response_mime_type": "application/json"},
        )
        result = _json_response(response)
        required = ("summary", "strengths", "tips", "drill")
        if not result or not all(key in result for key in required):
            return None
        return {
            "summary": str(result["summary"]),
            "strengths": [str(item) for item in result["strengths"]][:3],
            "tips": [str(item) for item in result["tips"]][:3],
            "drill": str(result["drill"]),
        }
    except Exception:
        return None


def chat(session_id: str, message: str, context: Optional[dict] = None) -> str:
    if not is_available():
        return "Ask the Coach needs an internet connection and a valid GEMINI_API_KEY."
    if session_id not in _conversations:
        system_prompt = "You are a football biomechanics coaching assistant. Answer concisely from supplied measurements; never claim this is 3D motion capture."
        if context:
            system_prompt += f"\nSession context: {context}"
        _conversations[session_id] = _model.start_chat(history=[])
        _conversations[session_id].send_message(system_prompt)
    try:
        return _conversations[session_id].send_message(message).text
    except Exception:
        return "Ask the Coach needs an internet connection."
