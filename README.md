# AI Image Analysis & Q&A Platform

Full-stack app: users sign up / log in, upload an image, run YOLO object detection (inside Docker), view annotated image + sortable results table, and ask questions about detections using Gemini 2.5 Flash.

## Architecture

- Frontend: Next.js (React) — login/signup UI + main app
- Backend: FastAPI (Python) — auth (Postgres), YOLO inference (Ultralytics), Gemini calls
- Database: PostgreSQL (docker-compose)
- Deployment: `docker compose up` launches all services

## Key features

- Secure signup / login with hashed passwords (bcrypt) and JWT tokens
- Image upload → YOLO inference inside backend container (Ultralytics)
- Annotated image saved and served by backend
- Sortable table for results (class, bbox, confidence)
- Gemini 2.5 Flash conversational Q&A (backend calls Gemini via OpenAI-compatible base_url)

## How to run (local Docker)

1. Create a `.env` file or set environment variables:

