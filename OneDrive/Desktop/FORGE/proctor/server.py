"""
THE FORGE — Local Proctoring Server - FULL VERSION with Gaze Tracking

Fully free, local, open-source proctoring using:
  - MediaPipe Face Mesh: face detection + eye/gaze tracking
  - YOLOv5s: object detection (phone, book, multiple people)
  - OpenCV: frame processing

Runs on port 8900. Optimized for 8GB RAM machines.
"""

import base64
import io
import time
import logging
from contextlib import asynccontextmanager

import cv2
import numpy as np
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# MediaPipe imports for version 0.10.33
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(asctime)s [PROCTOR] %(message)s")
logger = logging.getLogger("proctor")

# ─── Global model holders ─────────────────────────────────────────────────────

yolo_model = None
face_landmarker = None

# ─── Lifespan: load models on startup ─────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global yolo_model, face_landmarker

    logger.info("Loading YOLOv5s model...")
    yolo_model = torch.hub.load("ultralytics/yolov5", "yolov5s", pretrained=True, trust_repo=True)
    yolo_model.conf = 0.45
    yolo_model.iou = 0.45
    yolo_model.classes = [0, 67, 73, 63]  # person, cell phone, book, laptop
    yolo_model.eval()
    logger.info("YOLOv5s loaded.")

    logger.info("Loading MediaPipe Face Landmarker...")
    base_options = python.BaseOptions(model_asset_path='face_landmarker.task')
    options = vision.FaceLandmarkerOptions(
        base_options=base_options,
        output_face_blendshapes=False,
        output_facial_transformation_matrixes=False,
        num_faces=3,
        min_face_detection_confidence=0.5,
        min_face_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    face_landmarker = vision.FaceLandmarker.create_from_options(options)
    logger.info("MediaPipe Face Landmarker loaded with gaze tracking support!")

    logger.info("Proctoring server ready on port 8900.")
    yield

    if face_landmarker:
        face_landmarker.close()
    logger.info("Proctoring server shut down.")


app = FastAPI(title="FORGE Proctor", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ─── Request / Response Models ────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    image: str


class AnalyzeResponse(BaseModel):
    status: str = "ok"
    personCount: int = 0
    faceDetected: bool = False
    gazeOk: bool = True
    violations: list[str] = []
    objects: list[dict] = []
    fallback: bool = False
    processingMs: int = 0


# ─── Gaze Analysis Functions ──────────────────────────────────────────────────

def analyze_gaze_from_landmarks(face_landmarks_list, img_w: int, img_h: int) -> bool:
    """Returns True if looking at screen, False if looking away"""
    if not face_landmarks_list or len(face_landmarks_list) == 0:
        return True
    
    try:
        landmarks = face_landmarks_list[0]
        
        # Iris landmarks (from MediaPipe Face Landmarker)
        left_iris = [468, 469, 470, 471, 472]
        right_iris = [473, 474, 475, 476, 477]
        
        # Eye corners
        left_outer = 33
        left_inner = 133
        right_outer = 263
        right_inner = 362
        
        # Left eye analysis
        left_iris_x = np.mean([landmarks[i].x for i in left_iris if i < len(landmarks)])
        left_outer_x = landmarks[left_outer].x
        left_inner_x = landmarks[left_inner].x
        left_width = abs(left_inner_x - left_outer_x)
        
        if left_width > 0.001:
            left_ratio = (left_iris_x - left_outer_x) / left_width
        else:
            left_ratio = 0.5
        
        # Right eye analysis
        right_iris_x = np.mean([landmarks[i].x for i in right_iris if i < len(landmarks)])
        right_outer_x = landmarks[right_outer].x
        right_inner_x = landmarks[right_inner].x
        right_width = abs(right_inner_x - right_outer_x)
        
        if right_width > 0.001:
            right_ratio = (right_iris_x - right_outer_x) / right_width
        else:
            right_ratio = 0.5
        
        avg_ratio = (left_ratio + right_ratio) / 2
        
        # Looking away if iris is too far left (<0.2) or right (>0.8)
        return 0.2 <= avg_ratio <= 0.8
        
    except Exception as e:
        logger.warning(f"Gaze analysis error: {e}")
        return True


def analyze_head_pose_from_landmarks(face_landmarks_list, img_w: int, img_h: int) -> bool:
    """Returns True if facing forward, False if turned away"""
    if not face_landmarks_list or len(face_landmarks_list) == 0:
        return True
    
    try:
        landmarks = face_landmarks_list[0]
        nose_tip = landmarks[1]
        chin = landmarks[152]
        
        # Check if nose is centered
        nose_x = nose_tip.x
        if nose_x < 0.15 or nose_x > 0.85:
            return False
        
        # Check if face is upright
        nose_y = nose_tip.y
        chin_y = chin.y
        if chin_y - nose_y < 0.03:
            return False
        
        return True
        
    except Exception as e:
        logger.warning(f"Head pose error: {e}")
        return True


# ─── Main Analysis Endpoint ──────────────────────────────────────────────────

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_frame(req: AnalyzeRequest):
    start = time.time()
    violations = []
    objects_found = []

    try:
        # Decode image
        image_data = req.image
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]

        img_bytes = base64.b64decode(image_data)
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Resize for performance
        max_w = 640
        if pil_img.width > max_w:
            ratio = max_w / pil_img.width
            pil_img = pil_img.resize((max_w, int(pil_img.height * ratio)))

        img_np = np.array(pil_img)
        img_h, img_w = img_np.shape[:2]

        # YOLOv5 Detection
        person_count = 0
        phone_detected = False
        book_detected = False

        if yolo_model is not None:
            results = yolo_model(img_np)
            detections = results.pandas().xyxy[0]

            for _, row in detections.iterrows():
                label = row["name"]
                conf = row["confidence"]

                obj_info = {
                    "label": label,
                    "confidence": round(float(conf), 2),
                    "box": {
                        "x1": int(row["xmin"]),
                        "y1": int(row["ymin"]),
                        "x2": int(row["xmax"]),
                        "y2": int(row["ymax"]),
                    },
                }
                objects_found.append(obj_info)

                if label == "person":
                    person_count += 1
                elif label == "cell phone" and conf > 0.5:
                    phone_detected = True
                elif label == "book" and conf > 0.5:
                    book_detected = True

        # Violations from object detection
        if person_count == 0:
            violations.append("no_person")
        elif person_count > 1:
            violations.append("multiple_persons")

        if phone_detected:
            violations.append("phone_detected")
        if book_detected:
            violations.append("book_detected")

        # MediaPipe Face and Gaze Analysis
        face_detected = False
        gaze_ok = True

        if face_landmarker is not None:
            try:
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_np)
                detection_result = face_landmarker.detect(mp_image)
                
                if detection_result and detection_result.face_landmarks:
                    face_detected = True
                    face_count = len(detection_result.face_landmarks)
                    
                    # Gaze and head pose analysis
                    gaze_ok = analyze_gaze_from_landmarks(
                        detection_result.face_landmarks, img_w, img_h
                    )
                    head_ok = analyze_head_pose_from_landmarks(
                        detection_result.face_landmarks, img_w, img_h
                    )
                    
                    if not gaze_ok or not head_ok:
                        gaze_ok = False
                        if "looking_away" not in violations:
                            violations.append("looking_away")
                    
                    if face_count > 1 and "multiple_persons" not in violations:
                        violations.append("multiple_persons")
                else:
                    if person_count > 0:
                        violations.append("face_not_visible")
                        
            except Exception as e:
                logger.error(f"MediaPipe error: {e}")
                if person_count > 0:
                    violations.append("face_detection_error")

        processing_ms = int((time.time() - start) * 1000)

        return AnalyzeResponse(
            status="ok",
            personCount=person_count,
            faceDetected=face_detected,
            gazeOk=gaze_ok,
            violations=violations,
            objects=objects_found,
            fallback=False,
            processingMs=processing_ms,
        )

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        processing_ms = int((time.time() - start) * 1000)
        return AnalyzeResponse(
            status="ok",
            personCount=1,
            faceDetected=True,
            gazeOk=True,
            violations=["analysis_error"],
            objects=[],
            fallback=True,
            processingMs=processing_ms,
        )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "yolo_loaded": yolo_model is not None,
        "face_landmarker_loaded": face_landmarker is not None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8900, reload=False, workers=1)