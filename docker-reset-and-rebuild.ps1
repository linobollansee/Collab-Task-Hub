#!/usr/bin/env pwsh
# Docker Cleanup Script - Removes all containers, images, and volumes

Write-Host "[CLEANUP] Cleaning up Docker resources..." -ForegroundColor Yellow

# Stop all running containers
Write-Host "`n1. Stopping all running containers..." -ForegroundColor Cyan
docker stop $(docker ps -aq) 2>$null

# Remove all containers
Write-Host "2. Removing all containers..." -ForegroundColor Cyan
docker rm $(docker ps -aq) 2>$null

# Remove all images
Write-Host "3. Removing all images..." -ForegroundColor Cyan
docker rmi $(docker images -q) -f 2>$null

# Remove all volumes
Write-Host "4. Removing all volumes..." -ForegroundColor Cyan
docker volume rm $(docker volume ls -q) 2>$null

# Prune system (removes networks, build cache, etc.)
Write-Host "5. Pruning system..." -ForegroundColor Cyan
docker system prune -af --volumes

Write-Host "`n[SUCCESS] Docker cleanup complete!" -ForegroundColor Green

# Start containers with docker compose
Write-Host "`n[STARTING] Starting Docker Compose..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "`n[DONE] All done!" -ForegroundColor Green
