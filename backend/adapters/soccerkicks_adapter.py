"""
SoccerKicks → PenaltyIQ adapter.

Maps SoccerKicks dataset HMMR 3D joint data to PenaltyIQ's
MediaPipe-based landmark frame format so clips can be scored
through the existing scoring pipeline.

SoccerKicks joint schema (HMMR 3D, 25 joints):
  0=Right_heel, 1=Right_knee, 2=Right_hip, 3=Left_hip, 4=Left_knee,
  5=Left_heel, 6=Right_wrist, 7=Right_elbow, 8=Right_shoulder, 9=Left_shoulder,
  10=Left_elbow, 11=Left_wrist, 12=Neck, 13=Head_top, 14=Nose,
  15=Left_eye, 16=Right_eye, 17=Left_ear, 18=Right_ear,
  19=Left_big_toe, 20=Right_big_toe, 21=Left_small_toe, 22=Right_small_toe,
  23=Left_ankle, 24=Right_ankle

PenaltyIQ (MediaPipe Pose) landmarks (33 keypoints):
  0=nose, 1=left_eye_inner, 2=left_eye, 3=left_eye_outer,
  4=right_eye_inner, 5=right_eye, 6=right_eye_outer, 7=left_ear,
  8=right_ear, 9=mouth_left, 10=mouth_right, 11=left_shoulder,
  12=right_shoulder, 13=left_elbow, 14=right_elbow, 15=left_wrist,
  16=right_wrist, 17=left_pinky, 18=right_pinky, 19=left_index,
  20=right_index, 21=left_thumb, 22=right_thumb, 23=left_hip,
  24=right_hip, 25=left_knee, 26=right_knee, 27=left_ankle,
  28=right_ankle, 29=left_heel, 30=right_heel, 31=left_foot_index,
  32=right_foot_index
"""

from dataclasses import dataclass, field
from typing import List, Optional

# Mapping: SoccerKicks HMMR index → PenaltyIQ landmark index
# Only joints that have a direct counterpart in both schemas.
HMMR_TO_PENALTYIQ = {
    # Face / head
    12: 0,   # Neck -> nose (approximate, best available)
    14: 0,   # Nose -> nose
    13: 0,   # Head_top -> nose (fallback)
    # Shoulders
    8: 12,   # Right_shoulder -> right_shoulder
    9: 11,   # Left_shoulder -> left_shoulder
    # Hips
    2: 24,   # Right_hip -> right_hip
    3: 23,   # Left_hip -> left_hip
    # Knees
    1: 26,   # Right_knee -> right_knee
    4: 25,   # Left_knee -> left_knee
    # Ankles
    24: 28,  # Right_ankle -> right_ankle
    23: 27,  # Left_ankle -> left_ankle
    # Heels
    0: 30,   # Right_heel -> right_heel
    5: 29,   # Left_heel -> left_heel
    # Feet
    20: 32,  # Right_big_toe -> right_foot_index
    19: 31,  # Left_big_toe -> left_foot_index
    # Ears
    17: 7,   # Left_ear -> left_ear
    18: 8,   # Right_ear -> right_ear
    # Elbows
    7: 14,   # Right_elbow -> right_elbow
    10: 13,  # Left_elbow -> left_elbow
    # Wrists
    6: 16,   # Right_wrist -> right_wrist
    11: 15,  # Left_wrist -> left_wrist
}


@dataclass
class LandmarkFrame:
    """A single frame of 33 MediaPipe Pose landmarks, compatible with scoring.py."""
    landmarks: List[List[float]]  # 33 × [x, y]
    t_offset_ms: float = 0.0


def hmmr_to_penaltyiq_frame(hmmr_joints_3d: List[List[float]]) -> LandmarkFrame:
    """
    Convert a single frame of HMMR 3D joints (25 × [x,y,z]) to
    a PenaltyIQ LandmarkFrame (33 × [x,y]), filling missing indices
    with [0,0] and projecting 3D→2D by dropping z.
    """
    landmarks_2d = [[0.0, 0.0] for _ in range(33)]

    for hmmr_idx, piq_idx in HMMR_TO_PENALTYIQ.items():
        if hmmr_idx < len(hmmr_joints_3d):
            j = hmmr_joints_3d[hmmr_idx]
            landmarks_2d[piq_idx] = [j[0], j[1]]

    return LandmarkFrame(landmarks=landmarks_2d)


def build_window_from_clip(
    frame_joints: List[List[List[float]]],
    kicking_foot: str = "right",
    contact_frame_idx: Optional[int] = None,
) -> List[LandmarkFrame]:
    """
    Build a full MovementWindow from a list of HMMR 3D joint arrays.

    Args:
        frame_joints: list of frames, each a 25×3 joint array.
        kicking_foot: "left" or "right".
        contact_frame_idx: index of the contact frame (t_offset_ms = 0).
                           If None, assumes middle frame is contact.

    Returns:
        List of LandmarkFrame suitable for scoring.compute_all().
    """
    if contact_frame_idx is None:
        contact_frame_idx = len(frame_joints) // 2

    window = []
    for i, joints in enumerate(frame_joints):
        frame = hmmr_to_penaltyiq_frame(joints)
        frame.t_offset_ms = (i - contact_frame_idx) * 33.0  # ~30 fps
        window.append(frame)

    return window
