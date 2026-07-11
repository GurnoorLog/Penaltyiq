import psutil
import time

from backend.bitnet_client import get_external_request_count, health_check
from backend.config import BITNET_ENDPOINT


class MetricsCollector:
    def __init__(self):
        self._last_latency_ms = 0
        self._last_check = 0.0

    def collect(self) -> dict:
        cpu = psutil.cpu_percent(interval=0.1)
        ram = psutil.virtual_memory().used / (1024 * 1024)
        bitnet_ready = health_check()
        now = time.time()

        if now - self._last_check > 5:
            self._last_check = now

        return {
            "internet_connection": "online",
            "local_pose_engine": "ready",
            "local_bitnet_engine": "ready" if bitnet_ready else "down",
            "bitnet_endpoint": BITNET_ENDPOINT,
            "external_request_count": get_external_request_count(),
            "cpu_percent": round(cpu, 1),
            "ram_used_mb": round(ram, 1),
            "inference_latency_ms": self._last_latency_ms,
        }

    def record_latency(self, ms: int):
        self._last_latency_ms = ms
