"""
Calibrate PenaltyIQ scoring thresholds against the SoccerKicks dataset.

Usage:
  1. Download dataset from https://drive.google.com/drive/folders/1RS93v-QE8jQ-6NFTGu4gwx_-5xYsWona
     and place in research/soccerkicks-src/data/
  2. pip install numpy pandas
  3. python research/calibrate_thresholds.py

Output:
  - research/calibration_results.csv  — per-clip computed angles
  - Prints summary statistics for comparison against backend/config.py thresholds

SoccerKicks joint schema (HMMR 3D, 25 joints):
  Indices: 0=Right_heel, 1=Right_knee, 2=Right_hip, 3=Left_hip, 4=Left_knee,
           5=Left_heel, 6=Right_wrist, 7=Right_elbow, 8=Right_shoulder, 9=Left_shoulder,
           10=Left_elbow, 11=Left_wrist, 12=Neck, 13=Head_top, 14=Nose,
           15=Left_eye, 16=Right_eye, 17=Left_ear, 18=Right_ear,
           19=Left_big_toe, 20=Right_big_toe, 21=Left_small_toe, 22=Right_small_toe,
           23=Left_ankle, 24=Right_ankle
"""

import json
import math
import os
import csv
import sys
from pathlib import Path
from typing import List, Tuple, Dict

# Add backend to path so we can reuse scoring formulas
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.config import (
    LATERAL_DRIFT_THRESHOLD_HIGH,
    HIP_ROTATION_IDEAL_MIN, HIP_ROTATION_IDEAL_MAX,
    STRIKE_LEG_EXTENSION_IDEAL_MIN, STRIKE_LEG_EXTENSION_IDEAL_MAX,
    FOLLOW_THROUGH_IDEAL_MIN, FOLLOW_THROUGH_IDEAL_MAX,
    RECOVERY_COM_IDEAL_MAX,
)

# ============================================================
# JOINT MAPPING: SoccerKicks HMMR → PenaltyIQ landmark names
# ============================================================
# PenaltyIQ uses MediaPipe Pose indices. SoccerKicks HMMR uses 25-joint SMPL-derived indices.
# This dict maps the joint names PenaltyIQ's angle functions need to HMMR indices.

HMMR = {
    "RIGHT_HEEL": 0, "RIGHT_KNEE": 1, "RIGHT_HIP": 2, "LEFT_HIP": 3, "LEFT_KNEE": 4,
    "LEFT_HEEL": 5, "RIGHT_WRIST": 6, "RIGHT_ELBOW": 7, "RIGHT_SHOULDER": 8, "LEFT_SHOULDER": 9,
    "LEFT_ELBOW": 10, "LEFT_WRIST": 11, "NECK": 12, "HEAD_TOP": 13, "NOSE": 14,
    "LEFT_EYE": 15, "RIGHT_EYE": 16, "LEFT_EAR": 17, "RIGHT_EAR": 18,
    "LEFT_BIG_TOE": 19, "RIGHT_BIG_TOE": 20, "LEFT_SMALL_TOE": 21, "RIGHT_SMALL_TOE": 22,
    "LEFT_ANKLE": 23, "RIGHT_ANKLE": 24,
}

# Joints needed by PenaltyIQ scoring.py + their HMMR index
REQUIRED_JOINTS = {
    "left_hip": HMMR["LEFT_HIP"],
    "right_hip": HMMR["RIGHT_HIP"],
    "left_shoulder": HMMR["LEFT_SHOULDER"],
    "right_shoulder": HMMR["RIGHT_SHOULDER"],
    "left_knee": HMMR["LEFT_KNEE"],
    "right_knee": HMMR["RIGHT_KNEE"],
    "left_ankle": HMMR["LEFT_ANKLE"],
    "right_ankle": HMMR["RIGHT_ANKLE"],
    "left_heel": HMMR["LEFT_HEEL"],
    "right_heel": HMMR["RIGHT_HEEL"],
    "neck": HMMR["NECK"],
}

# ============================================================
# Angle formulas (reimplemented from backend/scoring.py)
# ============================================================

def vec(a: List[float], b: List[float]) -> Tuple[float, float]:
    return (b[0] - a[0], b[1] - a[1])

def norm(v: Tuple[float, float]) -> float:
    return math.sqrt(v[0]**2 + v[1]**2)

def normalize(v: Tuple[float, float]) -> Tuple[float, float]:
    l = norm(v)
    return (0.0, 0.0) if l < 1e-8 else (v[0]/l, v[1]/l)

def dot(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    return a[0]*b[0] + a[1]*b[1]

def angle_between(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    ca = dot(normalize(a), normalize(b))
    ca = max(-1.0, min(1.0, ca))
    return math.degrees(math.acos(ca))

def knee_angle(hip, knee, ankle) -> float:
    return angle_between(vec(knee, hip), vec(knee, ankle))

def hip_angle(shoulder, hip, knee) -> float:
    return angle_between(vec(hip, shoulder), vec(hip, knee))

# ============================================================
# Per-clip analysis
# ============================================================

def load_frame_joints(clip_dir: Path) -> List[Dict]:
    """Load all alphapose_hmmr_annotation frame_*_joints.json files."""
    ann_dir = clip_dir / "annotations" / "alphapose_hmmr_annotations"
    if not ann_dir.exists():
        ann_dir = clip_dir / "alphapose_hmmr_annotations"
    if not ann_dir.exists():
        print(f"  WARN: no alphapose_hmmr_annotations found in {clip_dir}")
        return []

    frames = []
    for fpath in sorted(ann_dir.glob("frame_*_joints.json")):
        with open(fpath) as f:
            data = json.load(f)
        frames.append(data)
    return frames

def get_joint_positions(frame_data: dict) -> List[List[float]]:
    """
    Extract 3D joint positions from a frame_*_joints.json.
    Format: list of 25 joints, each with [x, y, z] in 3D space.
    """
    joints = frame_data.get("joints3d", frame_data.get("joints", None))
    if joints is None:
        # Try common field names
        joints = frame_data.get("xyz", frame_data.get("3d_joints", None))
    if joints is None:
        raise ValueError(f"Unknown joint format: keys={list(frame_data.keys())}")
    return joints

def compute_clip_metrics(frames: List[dict], kicking_foot: str) -> dict:
    """
    Compute all 7 PenaltyIQ raw metrics across a clip's frames.
    Uses the same angle formulas as backend/scoring.py.
    """
    if len(frames) < 3:
        return {}

    l_hip_i, r_hip_i = REQUIRED_JOINTS["left_hip"], REQUIRED_JOINTS["right_hip"]
    l_shoulder_i = REQUIRED_JOINTS["left_shoulder"]
    r_shoulder_i = REQUIRED_JOINTS["right_shoulder"]
    l_knee_i = REQUIRED_JOINTS["left_knee"]
    r_knee_i = REQUIRED_JOINTS["right_knee"]
    l_ankle_i = REQUIRED_JOINTS["left_ankle"]
    r_ankle_i = REQUIRED_JOINTS["right_ankle"]

    hip_rots = []
    knee_exts = []
    speeds = []
    leans = []

    prev_foot_pos = None

    for frame_data in frames:
        j = get_joint_positions(frame_data)

        # Hip rotation
        l_hip, r_hip = j[l_hip_i], j[r_hip_i]
        l_shoulder, r_shoulder = j[l_shoulder_i], j[r_shoulder_i]
        l_knee, r_knee = j[l_knee_i], j[r_knee_i]

        l_angle = hip_angle(l_shoulder, l_hip, l_knee)
        r_angle = hip_angle(r_shoulder, r_hip, r_knee)
        hip_rots.append(abs(l_angle - r_angle))

        # Knee extension (kicking leg)
        if kicking_foot == "right":
            ext = knee_angle(j[r_hip_i], j[r_knee_i], j[r_ankle_i])
        else:
            ext = knee_angle(j[l_hip_i], j[l_knee_i], j[l_ankle_i])
        knee_exts.append(ext)

        # Torso lean
        mid_shoulder = (
            (j[l_shoulder_i][0] + j[r_shoulder_i][0]) / 2,
            (j[l_shoulder_i][1] + j[r_shoulder_i][1]) / 2,
        )
        mid_hip = (
            (j[l_hip_i][0] + j[r_hip_i][0]) / 2,
            (j[l_hip_i][1] + j[r_hip_i][1]) / 2,
        )
        torso = (mid_shoulder[0] - mid_hip[0], mid_shoulder[1] - mid_hip[1])
        leans.append(angle_between(torso, (0, 1)))

        # Swing foot speed (2D approximation)
        if kicking_foot == "right":
            foot_pos = (j[r_ankle_i][0], j[r_ankle_i][1])
        else:
            foot_pos = (j[l_ankle_i][0], j[l_ankle_i][1])

        if prev_foot_pos:
            dx = foot_pos[0] - prev_foot_pos[0]
            dy = foot_pos[1] - prev_foot_pos[1]
            speeds.append(math.sqrt(dx**2 + dy**2))
        prev_foot_pos = foot_pos

    # Plant foot lateral drift (kicking foot determines plant foot)
    plant_foot_i = l_ankle_i if kicking_foot == "right" else r_ankle_i
    x_vals = [get_joint_positions(f)[plant_foot_i][0] for f in frames]
    lateral_drift = max(x_vals) - min(x_vals) if x_vals else 0

    # Follow-through range (kicking leg knee extension range)
    ft_range = max(knee_exts) - min(knee_exts) if knee_exts else 0

    # Recovery COM displacement
    j0 = get_joint_positions(frames[0])
    j1 = get_joint_positions(frames[-1])
    com0 = ((j0[l_hip_i][0] + j0[r_hip_i][0]) / 2, (j0[l_hip_i][1] + j0[r_hip_i][1]) / 2)
    com1 = ((j1[l_hip_i][0] + j1[r_hip_i][0]) / 2, (j1[l_hip_i][1] + j1[r_hip_i][1]) / 2)
    com_disp = math.sqrt((com1[0] - com0[0])**2 + (com1[1] - com0[1])**2)

    return {
        "swing_foot_peak_speed_norm": max(speeds) if speeds else 0,
        "hip_rotation_peak_deg": max(hip_rots) if hip_rots else 0,
        "plant_foot_lateral_drift_norm": lateral_drift,
        "strike_leg_knee_extension_deg": max(knee_exts) if knee_exts else 0,
        "follow_through_range_deg": ft_range,
        "torso_lean_at_contact_deg": leans[len(leans)//2] if leans else 0,
        "recovery_com_displacement_norm": com_disp,
    }


def main():
    data_dir = Path(__file__).resolve().parent / "soccerkicks-src" / "data"
    results_file = Path(__file__).resolve().parent / "calibration_results.csv"

    if not data_dir.exists():
        print(f"ERROR: Data directory not found: {data_dir}")
        print("Download the dataset from:")
        print("  https://drive.google.com/drive/folders/1RS93v-QE8jQ-6NFTGu4gwx_-5xYsWona")
        print("and place contents in research/soccerkicks-src/data/")
        sys.exit(1)

    # Find penalty clips (exclude freekicks by folder naming convention)
    # Penalty clips are under Penalty/ subdirectory
    penalty_dir = data_dir / "Penalty"
    if not penalty_dir.exists():
        print(f"WARN: No Penalty/ directory found in {data_dir}")
        print("Looking for any clip directories with 'penalty' in the name...")
        clip_dirs = [d for d in data_dir.iterdir() if d.is_dir() and "penalty" in d.name.lower()]
    else:
        clip_dirs = [d for d in penalty_dir.iterdir() if d.is_dir()]

    print(f"Found {len(clip_dirs)} penalty clip directories")
    if not clip_dirs:
        print("No penalty clips found. Check dataset structure.")
        sys.exit(1)

    results = []
    for clip_dir in sorted(clip_dirs):
        clip_name = clip_dir.name
        print(f"\nProcessing {clip_name}...")

        # Detect kicking foot from clip name convention (right-footed default)
        # In a full implementation, this would come from video_source.csv
        kicking_foot = "right"

        frames = load_frame_joints(clip_dir)
        if not frames:
            print(f"  SKIP: no frame joints found")
            continue

        print(f"  {len(frames)} frames loaded")

        try:
            metrics = compute_clip_metrics(frames, kicking_foot)
        except Exception as e:
            print(f"  ERROR computing metrics: {e}")
            continue

        row = {
            "clip_name": clip_name,
            "kicking_foot": kicking_foot,
            "num_frames": len(frames),
            **metrics,
        }
        results.append(row)

    if not results:
        print("\nNo clips were successfully processed.")
        print("Check that the dataset contains alphapose_hmmr_annotations/ with frame_*_joints.json files.")
        sys.exit(1)

    # Write results CSV
    fieldnames = [
        "clip_name", "kicking_foot", "num_frames",
        "swing_foot_peak_speed_norm", "hip_rotation_peak_deg",
        "plant_foot_lateral_drift_norm", "strike_leg_knee_extension_deg",
        "follow_through_range_deg", "torso_lean_at_contact_deg",
        "recovery_com_displacement_norm",
    ]
    with open(results_file, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    print(f"\nResults written to {results_file} ({len(results)} clips)")
    print("\n=== SUMMARY STATISTICS ===")
    metrics_to_summarize = [k for k in fieldnames if k not in ("clip_name", "kicking_foot", "num_frames")]
    for metric in metrics_to_summarize:
        vals = [r[metric] for r in results]
        mean = sum(vals) / len(vals)
        sorted_vals = sorted(vals)
        median = sorted_vals[len(sorted_vals)//2]
        min_v = min(vals)
        max_v = max(vals)
        variance = sum((v - mean)**2 for v in vals) / len(vals)
        std = math.sqrt(variance)
        print(f"\n{metric}:")
        print(f"  Mean={mean:.2f}, Median={median:.2f}, Std={std:.2f}")
        print(f"  Min={min_v:.2f}, Max={max_v:.2f}, N={len(vals)}")

    print("\n=== CURRENT CONFIG THRESHOLDS ===")
    print(f"  LATERAL_DRIFT_THRESHOLD_HIGH = {LATERAL_DRIFT_THRESHOLD_HIGH}")
    print(f"  HIP_ROTATION_IDEAL_MIN = {HIP_ROTATION_IDEAL_MIN}, HIP_ROTATION_IDEAL_MAX = {HIP_ROTATION_IDEAL_MAX}")
    print(f"  STRIKE_LEG_EXTENSION_IDEAL_MIN = {STRIKE_LEG_EXTENSION_IDEAL_MIN}, STRIKE_LEG_EXTENSION_IDEAL_MAX = {STRIKE_LEG_EXTENSION_IDEAL_MAX}")
    print(f"  FOLLOW_THROUGH_IDEAL_MIN = {FOLLOW_THROUGH_IDEAL_MIN}, FOLLOW_THROUGH_IDEAL_MAX = {FOLLOW_THROUGH_IDEAL_MAX}")
    print(f"  RECOVERY_COM_IDEAL_MAX = {RECOVERY_COM_IDEAL_MAX}")
    print("\nCompare the real distributions above against these placeholders.")
    print("Update backend/config.py thresholds where real data disagrees.")


if __name__ == "__main__":
    main()
