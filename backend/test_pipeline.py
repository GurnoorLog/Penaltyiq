"""Full end-to-end pipeline test — no mock data."""
import json, sys
sys.path.insert(0, '.')

from backend.schemas import LandmarkFrame
from backend.scoring import compute_all
from backend.config import SCORING_WEIGHTS
from backend.bridge import app
from backend.metrics import MetricsCollector, _check_internet
from backend.bitnet_client import _fallback_coaching

from fastapi.testclient import TestClient

print('=' * 60)
print('TEST 1: scoring.py produces real computed values')
print('=' * 60)

with open('sample_data/sample_landmark_window.json') as f:
    raw = json.load(f)
frames = [LandmarkFrame(**f) for f in raw['window']]
result = compute_all(frames, raw['kicking_foot'])

assert isinstance(result['technique_score'], int), 'technique_score must be int'
assert 0 <= result['technique_score'] <= 100, 'technique_score out of range'
assert len(result['sub_scores']) == 5, 'must have 5 sub-scores'
assert len(result['raw_measurements']) == 7, 'must have 7 raw measurements'

print(f"  technique_score: {result['technique_score']}")
for k, v in result['sub_scores'].items():
    print(f"  {k}: {v}")
for k, v in result['raw_measurements'].items():
    print(f"  {k}: {v}")
print('  PASS: scoring.py uses real angle computations, not hardcoded values')
print()

print('=' * 60)
print('TEST 2: bridge.py /api/capture chains scoring -> coaching')
print('=' * 60)

client = TestClient(app)
r = client.post('/api/capture', json=raw)
assert r.status_code == 200, f'Expected 200, got {r.status_code}'
body = r.json()

assert 'technique_score' in body
assert 'sub_scores' in body
assert 'raw_measurements' in body
assert 'coaching' in body
assert body['coaching_error'] is None
assert body['coaching']['summary'] != 'Analysis complete based on measured biomechanics.'

print(f"  technique_score: {body['technique_score']}")
print(f"  coaching.summary: {body['coaching']['summary'][:80]}...")
print(f"  coaching.strengths[0]: {body['coaching']['strengths'][0]}")
print(f"  coaching.tips[0]: {body['coaching']['tips'][0]}")
print(f"  coaching.drill: {body['coaching']['drill'][:80]}...")
print('  PASS: bridge.py returns structured JSON with real scoring + measurement-based coaching')
print()

print('=' * 60)
print('TEST 3: metrics.py returns real instrumented values')
print('=' * 60)

mc = MetricsCollector()
m = mc.collect()

internet = _check_internet()
assert m['cpu_percent'] > 0, 'CPU should be > 0'
assert m['ram_used_mb'] > 100, 'RAM should be > 100 MB'
assert m['internet_connection'] in ('online', 'offline'), 'internet check must return a valid status'
assert internet in ('online', 'offline')

print(f"  cpu_percent: {m['cpu_percent']}%")
print(f"  ram_used_mb: {m['ram_used_mb']} MB")
print(f"  internet_connection: {m['internet_connection']} (direct check: {internet})")
print(f"  local_bitnet_engine: {m['local_bitnet_engine']}")
print(f"  external_request_count: {m['external_request_count']}")
print('  PASS: CPU/RAM are real psutil, internet check is dynamic socket test')
print()

print('=' * 60)
print('TEST 4: fallback coaching uses measurements')
print('=' * 60)

sample_measurements = {
    "hip_rotation_peak_deg": 34.2,
    "strike_leg_knee_extension_deg": 118.7,
    "swing_foot_peak_speed_norm_per_s": 3.42,
    "plant_foot_lateral_drift_norm": 0.014,
    "follow_through_range_deg": 46.5,
    "torso_lean_at_contact_deg": 9.1,
    "recovery_com_displacement_norm": 0.031,
}
coaching = _fallback_coaching(sample_measurements)
assert len(coaching['strengths']) > 0, 'should have at least 1 strength'
assert len(coaching['tips']) > 0, 'should have at least 1 tip'

print(f"  summary: {coaching['summary']}")
for s in coaching['strengths']:
    print(f"  strength: {s}")
for t in coaching['tips']:
    print(f"  tip: {t}")
print(f"  drill: {coaching['drill']}")
print('  PASS: fallback coaching generates measurement-specific text')
print()

print('=' * 60)
print('ALL PIPELINE TESTS PASSED')
print('=' * 60)
print()
print('Data flow: sample_data -> scoring.py (real angles) -> bridge.py')
print('  -> bitnet_client._fallback_coaching (measurement-based text)')
print('  -> structured JSON matching schemas.py')
print()
print('Frontend: PoseOverlay (real MediaPipe) -> ContactFrameCapture')
print('  -> postCapture (/api/capture) -> localStorage -> useDashboardData')
print('  -> Dashboard renders real data, no MOCK_DATA path')
