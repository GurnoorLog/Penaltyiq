import json
import os
import sys
from typing import Optional

import httpx

from backend.config import BITNET_ENDPOINT, BITNET_TIMEOUT_SEC, INFERENCE_BACKEND

_EXTERNAL_REQUEST_COUNT = 0


def get_external_request_count() -> int:
    return _EXTERNAL_REQUEST_COUNT


def _increment_request_count():
    global _EXTERNAL_REQUEST_COUNT
    _EXTERNAL_REQUEST_COUNT += 1


def health_check() -> bool:
    try:
        url = f"{BITNET_ENDPOINT}/health"
        with httpx.Client(timeout=5) as client:
            r = client.get(url)
            _increment_request_count()
            return r.status_code == 200
    except Exception:
        return False


def generate_coaching(measurements_json: dict) -> Optional[dict]:
    prompt = (
        "You are a football biomechanics coaching assistant. Given the following technique "
        "measurements from a penalty kick, respond with ONLY valid JSON (no markdown, no "
        "preamble) matching exactly this shape:\n"
        '{"summary": string, "strengths": [string, ...], "tips": [string, ...], "drill": string}\n\n'
        f"Measurements:\n{json.dumps(measurements_json)}"
    )

    if INFERENCE_BACKEND == "llamacpp":
        return _call_llamacpp(prompt, measurements_json)
    return _call_bitnet(prompt, measurements_json)


def _call_bitnet(prompt: str, measurements_json: dict) -> Optional[dict]:
    url = f"{BITNET_ENDPOINT}/v1/completions"
    payload = {
        "prompt": prompt,
        "max_tokens": 512,
        "temperature": 0.3,
        "stop": ["</s>", "\n\n\n"],
    }
    try:
        with httpx.Client(timeout=BITNET_TIMEOUT_SEC) as client:
            r = client.post(url, json=payload)
            _increment_request_count()
            r.raise_for_status()
            text = r.json().get("choices", [{}])[0].get("text", "")
            return _parse_coaching_response(text)
    except Exception:
        return _fallback_coaching(measurements_json)


def _call_llamacpp(prompt: str, measurements_json: dict) -> Optional[dict]:
    url = f"{BITNET_ENDPOINT}/completion"
    payload = {
        "prompt": prompt,
        "n_predict": 512,
        "temperature": 0.3,
        "stop": ["</s>", "\n\n\n"],
    }
    try:
        with httpx.Client(timeout=BITNET_TIMEOUT_SEC) as client:
            r = client.post(url, json=payload)
            _increment_request_count()
            r.raise_for_status()
            text = r.json().get("content", "")
            return _parse_coaching_response(text)
    except Exception:
        return _fallback_coaching(measurements_json)


def _parse_coaching_response(text: str) -> Optional[dict]:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(l for l in lines if not l.startswith("```"))
    try:
        result = json.loads(text)
        if all(k in result for k in ("summary", "strengths", "tips", "drill")):
            return result
    except json.JSONDecodeError:
        pass
    return None


def _fallback_coaching(measurements_json: dict) -> dict:
    m = measurements_json if isinstance(measurements_json, dict) else {}
    hip_rot = m.get("hip_rotation_peak_deg", 0)
    knee_ext = m.get("strike_leg_knee_extension_deg", 0)
    speed = m.get("swing_foot_peak_speed_norm_per_s", 0)
    drift = m.get("plant_foot_lateral_drift_norm", 0)
    follow = m.get("follow_through_range_deg", 0)
    lean = m.get("torso_lean_at_contact_deg", 0)
    recovery = m.get("recovery_com_displacement_norm", 0)

    strengths = []
    tips = []

    if hip_rot > 30:
        strengths.append(f"Strong hip rotation ({hip_rot:.1f}°) generates good power transfer.")
    else:
        tips.append(f"Hip rotation is {hip_rot:.1f}° — work on driving the hip through the kick.")
    if knee_ext > 100:
        strengths.append(f"Good strike-leg extension ({knee_ext:.1f}°) for full follow-through.")
    else:
        tips.append(f"Strike-leg extension is {knee_ext:.1f}° — extend fully through the ball.")
    if drift < 0.03:
        strengths.append(f"Plant leg is stable (lateral drift: {drift:.3f}).")
    else:
        tips.append(f"Plant leg drifts {drift:.3f} — focus on keeping the plant foot grounded.")
    if follow > 30:
        strengths.append(f"Follow-through range ({follow:.1f}°) shows good deceleration control.")
    else:
        tips.append(f"Increase follow-through range (currently {follow:.1f}°) for better control.")
    if lean < 15:
        strengths.append(f"Torso remains upright ({lean:.1f}° lean) — good posture at contact.")
    else:
        tips.append(f"Torso lean is {lean:.1f}° — try to stay more upright through the strike.")
    if recovery < 0.02:
        strengths.append("Clean recovery — balance maintained post-kick.")
    else:
        tips.append(f"Recovery displacement ({recovery:.3f}) — improve landing balance.")

    summary = strengths[0] if strengths else "Analysis complete."
    drill = (
        f"Plant-and-freeze drill: {int(speed * 10 + 5)} slow-motion kicks, "
        "hold finish position for 3 seconds each. "
        "Focus on keeping the plant knee flexed through contact."
    )

    return {
        "summary": summary,
        "strengths": strengths[:3],
        "tips": tips[:3],
        "drill": drill,
    }


if __name__ == "__main__":
    test_input = {"technique_score": 75, "sub_scores": {}}
    result = generate_coaching(test_input)
    if result:
        print(json.dumps(result, indent=2))
    else:
        print("No result returned (expected if no server is running)")
        sys.exit(0)
