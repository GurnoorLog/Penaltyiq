import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.schemas import LandmarkFrame
from backend.scoring import (
    compute_all,
    knee_angle,
    angle_between,
    score_from_range,
    score_lower_is_better,
)


def load_sample_window():
    path = Path(__file__).resolve().parent.parent / "sample_data" / "sample_landmark_window.json"
    with open(path) as f:
        data = json.load(f)
    window = [LandmarkFrame(**f) for f in data["window"]]
    return window, data["kicking_foot"]


def test_compute_all_returns_expected_keys():
    window, foot = load_sample_window()
    result = compute_all(window, foot)
    assert "technique_score" in result
    assert "sub_scores" in result
    assert "raw_measurements" in result
    assert isinstance(result["technique_score"], int)
    assert 0 <= result["technique_score"] <= 100


def test_sub_scores_keys():
    window, foot = load_sample_window()
    result = compute_all(window, foot)
    subs = result["sub_scores"]
    expected = {"plant_leg_stability", "hip_rotation", "strike_leg_extension", "follow_through", "recovery_balance"}
    assert set(subs.keys()) == expected
    for v in subs.values():
        assert 0 <= v <= 100


def test_raw_measurements_keys():
    window, foot = load_sample_window()
    result = compute_all(window, foot)
    raw = result["raw_measurements"]
    expected = {
        "swing_foot_peak_speed_norm_per_s",
        "hip_rotation_peak_deg",
        "plant_foot_lateral_drift_norm",
        "strike_leg_knee_extension_deg",
        "follow_through_range_deg",
        "torso_lean_at_contact_deg",
        "recovery_com_displacement_norm",
    }
    assert set(raw.keys()) == expected


def test_knee_angle_returns_degrees():
    hip = [0, 0]
    knee = [1, 1]
    ankle = [2, 0]
    angle = knee_angle(hip, knee, ankle)
    assert 0 < angle < 180


def test_angle_between_returns_degrees():
    a = (1, 0)
    b = (0, 1)
    assert angle_between(a, b) == 90.0


def test_score_from_range_center():
    assert score_from_range(50, 0, 100) > 90


def test_score_from_range_extreme():
    assert score_from_range(500, 0, 100) < 10


def test_score_lower_is_better():
    assert score_lower_is_better(0.001, 0.05) > 90
    assert score_lower_is_better(0.5, 0.05) < 10


def test_compute_all_same_result():
    window, foot = load_sample_window()
    r1 = compute_all(window, foot)
    r2 = compute_all(window, foot)
    assert r1 == r2
