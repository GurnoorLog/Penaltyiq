import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_backend_env() -> None:
    """Load local backend/.env without adding a runtime dependency."""
    env_path = BASE_DIR / "backend" / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_backend_env()
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
SESSIONS_DIR = SAMPLE_DATA_DIR / "sessions"

BITNET_ENDPOINT = os.getenv("BITNET_ENDPOINT", "http://127.0.0.1:8080")
BITNET_TIMEOUT_SEC = int(os.getenv("BITNET_TIMEOUT_SEC", "30"))
INFERENCE_BACKEND = os.getenv("INFERENCE_BACKEND", "bitnet")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_TIMEOUT_SEC = int(os.getenv("GEMINI_TIMEOUT_SEC", "20"))

SCORING_WEIGHTS = {
    "plant_leg_stability": 0.20,
    "hip_rotation": 0.20,
    "strike_leg_extension": 0.25,
    "follow_through": 0.20,
    "recovery_balance": 0.15,
}

FRAMES_BEFORE_CONTACT_MS = 250
FRAMES_AFTER_CONTACT_MS = 400

# Calibrated thresholds — see research/calibrate_thresholds.py
# Run: python research/calibrate_thresholds.py
# Updates calibration_results.csv and prints summary stats.
# Current values are biomechanics literature baselines (elite penalty kick).
# Refine with SoccerKicks dataset once annotations are downloaded.

LATERAL_DRIFT_THRESHOLD_HIGH = 0.05
HIP_ROTATION_IDEAL_MIN = 30.0
HIP_ROTATION_IDEAL_MAX = 50.0
STRIKE_LEG_EXTENSION_IDEAL_MIN = 100.0
STRIKE_LEG_EXTENSION_IDEAL_MAX = 140.0
FOLLOW_THROUGH_IDEAL_MIN = 30.0
FOLLOW_THROUGH_IDEAL_MAX = 60.0
RECOVERY_COM_IDEAL_MAX = 0.05
