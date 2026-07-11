from typing import Optional

from backend.config import GEMINI_API_KEY, GEMINI_MODEL

_conversations: dict = {}

_chat_available = bool(GEMINI_API_KEY)

if _chat_available:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel(GEMINI_MODEL)
    except Exception:
        _chat_available = False
        _model = None
else:
    _model = None


def is_available() -> bool:
    return _chat_available


def chat(session_id: str, message: str, context: Optional[dict] = None) -> str:
    if not _chat_available or _model is None:
        return "Ask the Coach needs an internet connection and a valid GEMINI_API_KEY."

    if session_id not in _conversations:
        system_prompt = "You are a football biomechanics coaching assistant. "
        system_prompt += "Answer questions about penalty kick technique based on the measurements provided. "
        system_prompt += "Keep answers concise and actionable."
        if context:
            system_prompt += f"\n\nSession context:\n{context}"
        _conversations[session_id] = _model.start_chat(history=[])
        _conversations[session_id].send_message(system_prompt)

    try:
        response = _conversations[session_id].send_message(message)
        return response.text
    except Exception:
        return "Ask the Coach needs an internet connection."
