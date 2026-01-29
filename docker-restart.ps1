#!/usr/bin/env pwsh
# Docker Restart Script - Stops and rebuilds containers to reflect code changes

Write-Host "[RESTART] Stopping containers..." -ForegroundColor Yellow
docker compose down

Write-Host "`n[BUILD] Rebuilding and starting containers..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "`n[DONE] Containers restarted with latest changes!" -ForegroundColor Green
