import psutil
import socket
import time
from urllib.request import urlopen, Request
from urllib.error import URLError

try:  # Supports package execution locally and Railway's backend root directory.
    from backend.bitnet_client import get_external_request_count, health_check
    from backend.config import BITNET_ENDPOINT
except ModuleNotFoundError:
    from bitnet_client import get_external_request_count, health_check
    from config import BITNET_ENDPOINT


def _check_internet() -> str:
    """Check if internet is reachable by connecting to Google DNS."""
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=2)
        return "online"
    except (OSError, socket.timeout):
        return "offline"


class MetricsCollector:
    def __init__(self):
        self._last_latency_ms = 0
        self._last_check = 0.0

    def collect(self) -> dict:
        cpu = psutil.cpu_percent(interval=0.1)
        ram = psutil.virtual_memory().used / (1024 * 1024)
        bitnet_ready = health_check()
        internet = _check_internet()
        now = time.time()

        if now - self._last_check > 5:
            self._last_check = now

        return {
            "internet_connection": internet,
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
