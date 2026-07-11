Write-Host '=== PenaltyIQ -- Starting Servers ===' -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host '[1/2] Starting FastAPI backend on http://localhost:8000 ...' -ForegroundColor Green
$bj = Start-Process -WindowStyle Hidden -PassThru -FilePath python -ArgumentList '-m uvicorn backend.bridge:app --host 127.0.0.1 --port 8000 --log-level error' -WorkingDirectory $root

Start-Sleep -Seconds 3

Write-Host '[2/2] Starting Next.js frontend on http://localhost:3000 ...' -ForegroundColor Green
$fj = Start-Process -WindowStyle Hidden -PassThru -FilePath npx.cmd -ArgumentList 'next dev --port 3000' -WorkingDirectory "$root\web"

Start-Sleep -Seconds 5

$h = curl.exe -s http://127.0.0.1:8000/api/health 2>$null
if ($h) { Write-Host "  Backend OK: $h" -ForegroundColor Green } else { Write-Host '  Backend FAILED' -ForegroundColor Red }

try {
    $fe = curl.exe -s -o NUL -w '%{http_code}' http://127.0.0.1:3000 2>$null
    if ($fe -eq '200') { Write-Host '  Frontend OK: http://localhost:3000' -ForegroundColor Green }
    else { Write-Host "  Frontend returned $fe" -ForegroundColor Yellow }
} catch {
    Write-Host '  Frontend still starting...' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '=== URLs ===' -ForegroundColor Cyan
Write-Host '  Landing:       http://localhost:3000'
Write-Host '  Start/Capture: http://localhost:3000/start'
Write-Host '  Dashboard:     http://localhost:3000/dashboard/messi'
Write-Host '  Backend API:   http://localhost:8000/api/health'
Write-Host ''
Write-Host '=== Quick Test ===' -ForegroundColor Cyan
Write-Host '  python backend/test_pipeline.py'
Write-Host ''
Write-Host 'Press Ctrl+C to stop.' -ForegroundColor Gray

while ($true) { Start-Sleep -Seconds 10 }
