"""Gemini-powered coaching brain for PenaltyIQ.

Owns all chat, coaching refinement, video relevance checking, AND
image generation (Imagen). When Gemini is offline everything falls
back to deterministic local logic.
"""

import base64
import io
import json
from typing import Optional

try:
    from backend.config import GEMINI_API_KEY, GEMINI_MODEL
except ModuleNotFoundError:
    from config import GEMINI_API_KEY, GEMINI_MODEL

_conversations: dict = {}
_chat_available = bool(GEMINI_API_KEY)
_vision_model = None
_chat_model = None

if _chat_available:
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _vision_model = genai.GenerativeModel("gemini-2.0-flash-001")  # vision-capable
        _chat_model = genai.GenerativeModel(GEMINI_MODEL)
    except Exception:
        _chat_available = False


def is_available() -> bool:
    return _chat_available and _chat_model is not None


IMAGEN_AVAILABLE = bool(GEMINI_API_KEY)


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


# ── Video relevance gate ────────────────────────────────────────────────

def assess_penalty_video(frames: list[str]) -> Optional[dict]:
    """Classify sampled frames before local pose processing starts."""
    if not is_available():
        return None
    images = [part for frame in frames if (part := _image_part(frame))]
    if not images:
        return {
            "accepted": False,
            "confidence": 1.0,
            "detected_activity": "invalid upload",
            "reason": "No valid video frames were supplied."
        }

    prompt = """You are PenaltyIQ's upload gate. Inspect these sampled video frames.
Accept only a real football/soccer kick or penalty/free-kick training clip where a player's lower body can be assessed.
Reject unrelated content, non-sports content, crowds/highlights without a visible kicker, still images, and clips where the player is too obscured to evaluate.
Do not judge skill or make biomechanical claims. Return ONLY JSON:
{"accepted": boolean, "confidence": number from 0 to 1, "detected_activity": string, "reason": string}.
When uncertain, reject the upload so the user can provide a clearer kick clip."""
    try:
        response = _vision_model.generate_content(
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


# ── Coaching refinement ─────────────────────────────────────────────────

def refine_coaching(local_coaching: dict, measurements: dict) -> Optional[dict]:
    """Gemini polishes the local BitNet coaching draft into expert feedback."""
    if not is_available():
        return None
    prompt = f"""You are the second half of PenaltyIQ's dual-brain coaching system.
The local engine measured the kick and a local model drafted feedback. Preserve the factual direction of the measurements and do not invent precision, injuries, or contact-angle claims. Improve the draft into concise, encouraging football coaching.
Return ONLY valid JSON with exactly: summary, strengths (array), tips (array), drill.

Measurements (source of truth): {json.dumps(measurements)}
Local draft: {json.dumps(local_coaching)}"""
    try:
        response = _chat_model.generate_content(
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


# ── Image generation via Imagen ─────────────────────────────────────────

def generate_coaching_image(prompt: str) -> Optional[str]:
    """Generate a coaching/technique diagram image using Google Imagen.

    Returns a data URI (data:image/png;base64,...) or None on failure.
    """
    if not GEMINI_API_KEY:
        return None

    import requests

    imagen_url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"imagen-3.0-generate-002:predict?key={GEMINI_API_KEY}"
    )

    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {"sampleCount": 1},
    }

    try:
        resp = requests.post(imagen_url, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        b64 = data.get("predictions", [{}])[0].get("bytesBase64Encoded")
        if b64:
            return f"data:image/png;base64,{b64}"
        # fallback: try structured_generations
        for pred in data.get("predictions", []):
            for key in ("bytesBase64Encoded", "image"):
                val = pred.get(key)
                if val:
                    return f"data:image/png;base64,{val}"
        return None
    except Exception:
        return None


# ── Full chat (the main coaching brain) ─────────────────────────────────

SYSTEM_PROMPT = """You are PenaltyIQ, the world's best football penalty-kick coach — a blend of Dr. football biomechanics, elite-level technical coach, and sports psychologist.

Your job:
1. Answer any football coaching question with specific, actionable advice.
2. If the user asks about their body or technique ("what did I do wrong?", "which side of my body is off?", "how can I improve?"), give detailed biomechanical feedback referencing plant foot, hip rotation, strike leg, follow-through, and recovery balance.
3. If asked to visualize or show something ("show me what I'm doing wrong", "draw the correct plant foot position", "generate an image"), respond by triggering image generation.
4. Keep responses concise — 2-3 short paragraphs max — but pack them with expert insight.
5. Always end with ONE specific drill or actionable step the user can do right now.
6. Reference specific body parts and angles: hip rotation (30-50° ideal), knee extension at strike (100-140°), plant foot angle, follow-through height.

Coaching philosophy: Build confidence first, then technique. Be encouraging but precise. Use football language every player understands."""


def chat(
    session_id: str,
    message: str,
    context: Optional[dict] = None,
    generate_image: bool = False,
) -> str:
    """Full Gemini chat — the central coaching brain.

    If ``generate_image`` is True, the method first generates a coaching
    image via Imagen and appends a markdown image link to the reply.
    """
    if not is_available():
        return _fallback_coaching(message)

    if session_id not in _conversations:
        system = SYSTEM_PROMPT
        if context:
            measurements = context.get("raw_measurements", {})
            system += f"\n\nCurrent session measurements for reference:\n{json.dumps(measurements, indent=2)}"
        _conversations[session_id] = _chat_model.start_chat(history=[])
        _conversations[session_id].send_message(system)

    try:
        reply = _conversations[session_id].send_message(message).text
    except Exception:
        return _fallback_coaching(message)

    # If image was requested, try to generate and append
    if generate_image:
        image_prompt = (
            f"A football coaching diagram showing: {message[:200]}. "
            f"Clean technical illustration with labels, white background, "
            f"professional sports coaching style."
        )
        data_uri = generate_coaching_image(image_prompt)
        if data_uri:
            reply += f"\n\n![Coaching visualization]({data_uri})"

    return reply


def _fallback_coaching(user_message: str) -> str:
    """Fallback when Gemini is offline — gives smart local coaching advice."""
    msg = user_message.lower()

    if "hip" in msg or "rotation" in msg:
        return (
            "Great question — hip rotation is the #1 power generator in a penalty kick.\n\n"
            "**The numbers**: Elite takers hit 30-50° of hip rotation during the strike phase. "
            "Less than 30° means you're not coiling enough → less power. More than 50° means "
            "you're over-rotating → pulling the ball wide.\n\n"
            "**Fix it**: Stand sideways to the goal in your stance — belt buckle facing the "
            "right post (if right-footed). As you strike, visualize your kicking hip "
            "'chasing' the ball through the net. Do 10 shadow swings daily focusing on that hip drive."
        )
    if "plant" in msg or "standing foot" in msg or "non-kicking" in msg:
        return (
            "Your plant foot is the foundation of every penalty.\n\n"
            "**The mistake**: Most players point their standing foot at the goal, which opens "
            "the hips too early and kills accuracy.\n\n"
            "**The fix**: Keep your standing foot **parallel to the goal line** — toes pointing "
            "to the sideline, not the net. This keeps your hips closed longer, stores rotational "
            "energy, and lets you whip your kicking leg through.\n\n"
            "**Drill**: Without a ball, practice 20 step-overs focusing ONLY on where your "
            "standing foot lands. It should be 15-20 cm from the ball position, pointed at 90° to your target."
        )
    if "strike" in msg or "leg" in msg or "extension" in msg:
        return (
            "Strike leg extension is where power comes from.\n\n"
            "**The key**: At ball contact, your kicking knee should be at 100-140° extension. "
            "Too bent (< 100°) → you're poking at the ball. Too straight (> 140°) → you're "
            "lunging and losing control.\n\n"
            "**The feel**: Imagine your leg is a whip — the hip starts, then the thigh, then "
            "the lower leg 'cracks' through the ball. The last moment before contact is when "
            "your lower leg snaps forward explosively.\n\n"
            "**Drill**: Sit on a chair, extend your kicking leg, and practice the 'snap' motion "
            "— thigh stabilizes, lower leg fires. 20 reps per leg, 3 sets."
        )
    if "follow through" in msg or "follow-through" in msg:
        return (
            "Follow-through is the most underrated part of a penalty.\n\n"
            "**The range**: 30-60° of follow-through height is ideal. Below 30° and you're "
            "cutting your power short. Above 60° and you're likely leaning back and skying it.\n\n"
            "**The cue**: Your kicking foot should finish at hip height or slightly above, "
            "pointing exactly where you want the ball to go. If your foot points at the corner "
            "flag, that's where the ball is going too.\n\n"
            "**Drill**: Take 10 slow-motion kicks. After each one, FREEZE your follow-through "
            "position. Look at where your foot is pointing. Adjust until it aims at your target."
        )
    if "recovery" in msg or "balance" in msg or "landing" in msg:
        return (
            "Recovery balance separates good takers from great ones.\n\n"
            "**What happens**: After striking, your body should settle into a controlled "
            "landing on your kicking foot. If you hop, stumble, or take extra steps, you "
            "lost core tension during the strike.\n\n"
            "**The fix**: Keep your core braced throughout the entire motion. Imagine someone "
            "is about to punch your stomach right after you kick — that tension level.\n\n"
            "**Drill**: Practice your full kick motion without a ball, focusing on landing "
            "on your kicking foot and holding for 2 seconds without wobbling. 10 reps daily."
        )
    if "image" in msg or "draw" in msg or "show me" in msg or "picture" in msg or "visualize" in msg or "photo" in msg:
        return (
            "🎨 **Visualization incoming!** I'll generate a coaching diagram for you. "
            "While that renders, here's the quick mental model:\n\n"
            "Picture your body from the side: your standing foot is a pivot point, "
            "your hips are a coiled spring, your kicking leg is a pendulum. "
            "The perfect penalty is when all three work in sequence — plant, coil, strike, land.\n\n"
            "Once I have the image ready, it'll appear below!"
        )
    if len(msg) < 10:
        return (
            "I'm here to help you become a penalty-kick specialist! 🎯\n\n"
            "**Try asking me about**:\n"
            "• \"What's wrong with my hip rotation?\"\n"
            "• \"Show me the correct plant foot position\"\n"
            "• \"How can I improve my follow-through?\"\n"
            "• \"Which side of my body needs work?\"\n"
            "• \"Generate an image of proper kicking form\"\n\n"
            "Upload a video of your kick and I'll analyze every joint angle."
        )

    return (
        "Great question! Here's my coaching take:\n\n"
        "**Core principle**: Every penalty is three phases — approach, strike, recovery. "
        "Most players focus on the strike, but the approach sets up everything. "
        "A curved approach (coming from an angle) naturally opens your hips for "
        "more power. A straight approach gives you more placement control.\n\n"
        "**Pro tip**: Practice both approaches. Use the curved run for power shots "
        "to the top corners, and the straight run for placement to the bottom corners. "
        "Being unpredictable with your run-up is a superpower.\n\n"
        "**Drill**: Pick a target corner. Take 5 penalties with a curved approach, "
        "5 with a straight approach. Record which feels more accurate. That's your "
        "match-day default — but practice the other one too."
    )
