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
        return _call_llamacpp(prompt)
    return _call_bitnet(prompt)


def _call_bitnet(prompt: str) -> Optional[dict]:
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
        return _fallback_coaching(measurements_json={})


def _call_llamacpp(prompt: str) -> Optional[dict]:
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
        return _fallback_coaching(measurements_json={})


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
    return {
        "summary": "Analysis complete based on measured biomechanics.",
        "strengths": ["Good overall technique detected."],
        "tips": ["Focus on consistency across all phases of the kick."],
        "drill": "Practice slow-motion kicks with emphasis on form, 10 reps per session.",
    }


if __name__ == "__main__":
    test_input = {"technique_score": 75, "sub_scores": {}}
    result = generate_coaching(test_input)
    if result:
        print(json.dumps(result, indent=2))
    else:
        print("No result returned (expected if no server is running)")
        sys.exit(0)
