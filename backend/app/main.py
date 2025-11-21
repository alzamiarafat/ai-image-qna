import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import aiohttp
import shutil
from pathlib import Path
from database import init_db, get_session
from auth import router as auth_router
from ai_adapter import ask_ai
from ultralytics import YOLO
from PIL import Image
import io


PROJECT_ROOT = Path(__file__).resolve().parent.parent
UPLOAD_DIR = PROJECT_ROOT / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title='AI Image QnA Backend')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get('FRONTEND_ORIGIN', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)

app.mount('/uploads', StaticFiles(directory=str(UPLOAD_DIR)), name='uploads')


@app.on_event('startup')
def on_startup():
    init_db()


@app.post('/upload')
async def upload_image(file: UploadFile = File(...)):
    # Save upload and return URL
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='file must be an image')
    dest = UPLOAD_DIR / file.filename
    with dest.open('wb') as f:
        shutil.copyfileobj(file.file, f)
    url = f"/uploads/{file.filename}"
    return {'url': url}


model = YOLO("yolov8n.pt")

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # Run YOLO inference
    results = model(image)

    # Parse detections
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "class": model.names[int(box.cls)],
                "confidence": float(box.conf),
                "bbox": box.xyxy[0].tolist()
            })

    return JSONResponse({"detections": detections})


# @app.post('/detect')
# async def detect_image(image_url: str = None, file: UploadFile | None = None):
#     # Either forward the uploaded file to the YOLO service or forward the URL
#     yolo_base = os.environ.get('YOLO_URL', 'http://host.docker.internal:8001')
#     endpoint = f"{yolo_base}/detect"
#     async with aiohttp.ClientSession() as session:
#         if file is not None:
#             data = aiohttp.FormData()
#             data.add_field('file', file.file, filename=file.filename, content_type=file.content_type)
#             async with session.post(endpoint, data=data) as resp:
#                 if resp.status != 200:
#                     raise HTTPException(status_code=502, detail='YOLO service error')
#                 return await resp.json()
#         elif image_url:
#             async with session.post(endpoint, json={'image_url': image_url}) as resp:
#                 if resp.status != 200:
#                     raise HTTPException(status_code=502, detail='YOLO service error')
#                 return await resp.json()
#         else:
#             raise HTTPException(status_code=400, detail='file or image_url required')


@app.post('/ai/question')
async def ai_question(payload: dict):
    detections = payload.get('detections')
    question = payload.get('question')
    if not question:
        raise HTTPException(status_code=400, detail='question is required')
    answer = await ask_ai(detections, question)
    return {'answer': answer}


@app.get('/health')
def health():
    return {'status': 'ok'}
