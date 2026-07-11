from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class LandmarkFrame(BaseModel):
    t_offset_ms: int
    landmarks: List[List[float]]


class MovementWindowInput(BaseModel):
    session_id: str
    user_id: str
    captured_at: str
    sport: str = "football"
    event_type: str = "penalty_kick_window"
    kicking_foot: str
    source_fps: int
    contact_frame_index: int
    contact_frame_thumbnail_base64: Optional[str] = None
    window: List[LandmarkFrame]


class SubScores(BaseModel):
    plant_leg_stability: float
    hip_rotation: float
    strike_leg_extension: float
    follow_through: float
    recovery_balance: float


class RawMeasurements(BaseModel):
    swing_foot_peak_speed_norm_per_s: float
    hip_rotation_peak_deg: float
    plant_foot_lateral_drift_norm: float
    strike_leg_knee_extension_deg: float
    follow_through_range_deg: float
    torso_lean_at_contact_deg: float
    recovery_com_displacement_norm: float


class ScoringOutput(BaseModel):
    session_id: str
    technique_score: int
    sub_scores: SubScores
    raw_measurements: RawMeasurements
    tracking_confidence: float


class CoachingOutput(BaseModel):
    summary: str
    strengths: List[str]
    tips: List[str]
    drill: str


class VideoRelevanceRequest(BaseModel):
    frames: List[str] = Field(min_length=1, max_length=3)


class VideoRelevanceResponse(BaseModel):
    accepted: bool
    confidence: float = Field(ge=0, le=1)
    detected_activity: str
    reason: str


class CaptureResponse(BaseModel):
    session_id: str
    technique_score: int
    sub_scores: SubScores
    raw_measurements: RawMeasurements
    tracking_confidence: float
    coaching: Optional[CoachingOutput] = None
    coaching_error: Optional[str] = None
    coaching_engine: str = "local"


class DiagnosticsPayload(BaseModel):
    internet_connection: str
    local_pose_engine: str
    local_bitnet_engine: str
    bitnet_endpoint: str
    external_request_count: int
    cpu_percent: float
    ram_used_mb: float
    inference_latency_ms: int


class ChatRequest(BaseModel):
    session_id: str
    message: str
    generate_image: bool = False


class ChatResponse(BaseModel):
    reply: str
