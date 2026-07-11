import math
from typing import List, Tuple

try:  # Supports package execution locally and Railway's backend root directory.
    from backend.config import (
        SCORING_WEIGHTS,
        LATERAL_DRIFT_THRESHOLD_HIGH,
        HIP_ROTATION_IDEAL_MIN,
        HIP_ROTATION_IDEAL_MAX,
        STRIKE_LEG_EXTENSION_IDEAL_MIN,
        STRIKE_LEG_EXTENSION_IDEAL_MAX,
        FOLLOW_THROUGH_IDEAL_MIN,
        FOLLOW_THROUGH_IDEAL_MAX,
        RECOVERY_COM_IDEAL_MAX,
    )
except ModuleNotFoundError:
    from config import (
        SCORING_WEIGHTS,
        LATERAL_DRIFT_THRESHOLD_HIGH,
        HIP_ROTATION_IDEAL_MIN,
    HIP_ROTATION_IDEAL_MAX,
    STRIKE_LEG_EXTENSION_IDEAL_MIN,
    STRIKE_LEG_EXTENSION_IDEAL_MAX,
    FOLLOW_THROUGH_IDEAL_MIN,
    FOLLOW_THROUGH_IDEAL_MAX,
        RECOVERY_COM_IDEAL_MAX,
    )

# MediaPipe Pose landmark indices
LEFT_HIP = 23
RIGHT_HIP = 24
LEFT_KNEE = 25
RIGHT_KNEE = 26
LEFT_ANKLE = 27
RIGHT_ANKLE = 28
LEFT_HEEL = 29
RIGHT_HEEL = 31
LEFT_FOOT_INDEX = 31
RIGHT_FOOT_INDEX = 32
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
NOSE = 0


def landmark_vector(a: List[float], b: List[float]) -> Tuple[float, float]:
    return (b[0] - a[0], b[1] - a[1])


def vector_length(v: Tuple[float, float]) -> float:
    return math.sqrt(v[0] ** 2 + v[1] ** 2)


def normalize(v: Tuple[float, float]) -> Tuple[float, float]:
    length = vector_length(v)
    if length < 1e-8:
        return (0.0, 0.0)
    return (v[0] / length, v[1] / length)


def dot(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    return a[0] * b[0] + a[1] * b[1]


def angle_between(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    cos_angle = dot(normalize(a), normalize(b))
    cos_angle = max(-1.0, min(1.0, cos_angle))
    return math.degrees(math.acos(cos_angle))


def knee_angle(hip: List[float], knee: List[float], ankle: List[float]) -> float:
    v1 = landmark_vector(knee, hip)
    v2 = landmark_vector(knee, ankle)
    return angle_between(v1, v2)


def hip_angle(shoulder: List[float], hip: List[float], knee: List[float]) -> float:
    v1 = landmark_vector(hip, shoulder)
    v2 = landmark_vector(hip, knee)
    return angle_between(v1, v2)


def get_landmark(landmarks: List[List[float]], idx: int) -> List[float]:
    return landmarks[idx]


def compute_swing_foot_peak_speed(window_frames: List) -> float:
    speeds = []
    for i in range(1, len(window_frames)):
        prev = window_frames[i - 1].landmarks
        curr = window_frames[i].landmarks
        dt_s = (window_frames[i].t_offset_ms - window_frames[i - 1].t_offset_ms) / 1000.0
        if dt_s < 1e-6:
            continue
        foot_idx = RIGHT_FOOT_INDEX
        dx = curr[foot_idx][0] - prev[foot_idx][0]
        dy = curr[foot_idx][1] - prev[foot_idx][1]
        speed = math.sqrt(dx ** 2 + dy ** 2) / dt_s
        speeds.append(speed)
    if not speeds:
        return 0.0
    return max(speeds)


def compute_hip_rotation_peak(window_frames: List) -> float:
    angles = []
    for frame in window_frames:
        lm = frame.landmarks
        l_hip = get_landmark(lm, LEFT_HIP)
        r_hip = get_landmark(lm, RIGHT_HIP)
        l_shoulder = get_landmark(lm, LEFT_SHOULDER)
        r_shoulder = get_landmark(lm, RIGHT_SHOULDER)
        l_angle = hip_angle(l_shoulder, l_hip, get_landmark(lm, LEFT_KNEE))
        r_angle = hip_angle(r_shoulder, r_hip, get_landmark(lm, RIGHT_KNEE))
        angles.append(abs(l_angle - r_angle))
    if not angles:
        return 0.0
    return max(angles)


def compute_plant_foot_lateral_drift(window_frames: List, kicking_foot: str) -> float:
    if not window_frames:
        return 0.0
    plant_foot_idx = LEFT_FOOT_INDEX if kicking_foot == "right" else RIGHT_FOOT_INDEX
    x_vals = [f.landmarks[plant_foot_idx][0] for f in window_frames]
    return max(x_vals) - min(x_vals)


def compute_strike_leg_knee_extension(window_frames: List, kicking_foot: str) -> float:
    knee_idx = RIGHT_KNEE if kicking_foot == "right" else LEFT_KNEE
    hip_idx = RIGHT_HIP if kicking_foot == "right" else LEFT_HIP
    ankle_idx = RIGHT_ANKLE if kicking_foot == "right" else LEFT_ANKLE
    max_ext = 0.0
    for frame in window_frames:
        lm = frame.landmarks
        angle = knee_angle(
            get_landmark(lm, hip_idx),
            get_landmark(lm, knee_idx),
            get_landmark(lm, ankle_idx),
        )
        if angle > max_ext:
            max_ext = angle
    return max_ext


def compute_follow_through_range(window_frames: List, kicking_foot: str) -> float:
    knee_idx = RIGHT_KNEE if kicking_foot == "right" else LEFT_KNEE
    ankle_idx = RIGHT_ANKLE if kicking_foot == "right" else LEFT_ANKLE
    hip_idx = RIGHT_HIP if kicking_foot == "right" else LEFT_HIP
    angles = []
    for frame in window_frames:
        lm = frame.landmarks
        angle = knee_angle(
            get_landmark(lm, hip_idx),
            get_landmark(lm, knee_idx),
            get_landmark(lm, ankle_idx),
        )
        angles.append(angle)
    if not angles:
        return 0.0
    return max(angles) - min(angles)


def compute_torso_lean_at_contact(window_frames: List) -> float:
    contact = None
    for f in window_frames:
        if f.t_offset_ms == 0:
            contact = f
            break
    if contact is None:
        contact = window_frames[len(window_frames) // 2]
    lm = contact.landmarks
    l_shoulder = get_landmark(lm, LEFT_SHOULDER)
    r_shoulder = get_landmark(lm, RIGHT_SHOULDER)
    mid_shoulder = ((l_shoulder[0] + r_shoulder[0]) / 2, (l_shoulder[1] + r_shoulder[1]) / 2)
    l_hip = get_landmark(lm, LEFT_HIP)
    r_hip = get_landmark(lm, RIGHT_HIP)
    mid_hip = ((l_hip[0] + r_hip[0]) / 2, (l_hip[1] + r_hip[1]) / 2)
    vertical = (0, 1)
    torso = (mid_shoulder[0] - mid_hip[0], mid_shoulder[1] - mid_hip[1])
    lean = angle_between(torso, vertical)
    return lean


def compute_recovery_com_displacement(window_frames: List) -> float:
    if len(window_frames) < 2:
        return 0.0
    first = window_frames[0]
    last = window_frames[-1]
    def com(lm):
        l_hip = get_landmark(lm, LEFT_HIP)
        r_hip = get_landmark(lm, RIGHT_HIP)
        return ((l_hip[0] + r_hip[0]) / 2, (l_hip[1] + r_hip[1]) / 2)
    c1 = com(first.landmarks)
    c2 = com(last.landmarks)
    return math.sqrt((c2[0] - c1[0]) ** 2 + (c2[1] - c1[1]) ** 2)


def score_from_range(value: float, ideal_min: float, ideal_max: float) -> float:
    midpoint = (ideal_min + ideal_max) / 2
    half_range = (ideal_max - ideal_min) / 2
    if half_range < 1e-6:
        return 50.0
    distance = abs(value - midpoint)
    ratio = distance / (half_range * 3)
    score = 100 * math.exp(-ratio * 2)
    return max(0, min(100, score))


def score_lower_is_better(value: float, threshold: float) -> float:
    ratio = value / threshold if threshold > 0 else 1
    score = 100 * math.exp(-ratio * 3)
    return max(0, min(100, score))


def score_higher_is_better(value: float, ideal_min: float, ideal_max: float) -> float:
    return score_from_range(value, ideal_min, ideal_max)


def compute_all(window_frames: List, kicking_foot: str) -> dict:
    swing_foot_peak_speed = compute_swing_foot_peak_speed(window_frames)
    hip_rotation_peak = compute_hip_rotation_peak(window_frames)
    plant_foot_lateral_drift = compute_plant_foot_lateral_drift(window_frames, kicking_foot)
    strike_leg_knee_extension = compute_strike_leg_knee_extension(window_frames, kicking_foot)
    follow_through_range = compute_follow_through_range(window_frames, kicking_foot)
    torso_lean_at_contact = compute_torso_lean_at_contact(window_frames)
    recovery_com_displacement = compute_recovery_com_displacement(window_frames)

    raw = {
        "swing_foot_peak_speed_norm_per_s": round(swing_foot_peak_speed, 3),
        "hip_rotation_peak_deg": round(hip_rotation_peak, 1),
        "plant_foot_lateral_drift_norm": round(plant_foot_lateral_drift, 3),
        "strike_leg_knee_extension_deg": round(strike_leg_knee_extension, 1),
        "follow_through_range_deg": round(follow_through_range, 1),
        "torso_lean_at_contact_deg": round(torso_lean_at_contact, 1),
        "recovery_com_displacement_norm": round(recovery_com_displacement, 3),
    }

    sub_scores = {
        "plant_leg_stability": round(score_lower_is_better(plant_foot_lateral_drift, LATERAL_DRIFT_THRESHOLD_HIGH)),
        "hip_rotation": round(score_from_range(hip_rotation_peak, HIP_ROTATION_IDEAL_MIN, HIP_ROTATION_IDEAL_MAX)),
        "strike_leg_extension": round(score_from_range(strike_leg_knee_extension, STRIKE_LEG_EXTENSION_IDEAL_MIN, STRIKE_LEG_EXTENSION_IDEAL_MAX)),
        "follow_through": round(score_from_range(follow_through_range, FOLLOW_THROUGH_IDEAL_MIN, FOLLOW_THROUGH_IDEAL_MAX)),
        "recovery_balance": round(score_lower_is_better(recovery_com_displacement, RECOVERY_COM_IDEAL_MAX)),
    }

    technique_score = round(
        sub_scores["plant_leg_stability"] * SCORING_WEIGHTS["plant_leg_stability"]
        + sub_scores["hip_rotation"] * SCORING_WEIGHTS["hip_rotation"]
        + sub_scores["strike_leg_extension"] * SCORING_WEIGHTS["strike_leg_extension"]
        + sub_scores["follow_through"] * SCORING_WEIGHTS["follow_through"]
        + sub_scores["recovery_balance"] * SCORING_WEIGHTS["recovery_balance"]
    )

    return {
        "technique_score": technique_score,
        "sub_scores": sub_scores,
        "raw_measurements": raw,
    }
