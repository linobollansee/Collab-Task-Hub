#!/bin/bash

# Start backend with Docker Compose
echo "Starting backend with Docker Compose..."
docker compose -f ./docker-compose.yml up -d --build

# Wait a moment for backend to initialize
sleep 2

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev
pause