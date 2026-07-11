import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.bitnet_client import _parse_coaching_response, _fallback_coaching


def test_parse_valid_json():
    text = '{"summary": "test", "strengths": ["a"], "tips": ["b"], "drill": "c"}'
    result = _parse_coaching_response(text)
    assert result is not None
    assert result["summary"] == "test"


def test_parse_markdown_wrapped():
    text = '```\n{"summary": "s", "strengths": [], "tips": [], "drill": "d"}\n```'
    result = _parse_coaching_response(text)
    assert result is not None
    assert result["summary"] == "s"


def test_parse_invalid_returns_none():
    result = _parse_coaching_response("not json")
    assert result is None


def test_fallback_has_required_keys():
    result = _fallback_coaching({})
    assert "summary" in result
    assert "strengths" in result
    assert "tips" in result
    assert "drill" in result
