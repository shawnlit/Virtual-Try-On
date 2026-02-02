import base64
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import math
import os
import glob

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MediaPipe Pose via Tasks API
base_options = python.BaseOptions(model_asset_path='pose_landmarker_lite.task')
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=False)
detector = vision.PoseLandmarker.create_from_options(options)

class PoseRequest(BaseModel):
    image: str

@app.get("/clothes")
def get_clothes():
    files = glob.glob("shirt*.jpeg")
    return {"clothes": files}

@app.post("/pose")
def detect_pose(request: PoseRequest):
    try:
        # Decode image
        if "," in request.image:
            header, encoded = request.image.split(",", 1)
        else:
            encoded = request.image
        
        data = base64.b64decode(encoded)
        np_arr = np.frombuffer(data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if image is None:
            return {"detected": False, "error": "Could not decode image"}

        # Convert to RGB (MediaPipe Image)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        
        # Detect
        results = detector.detect(mp_image)
        
        if not results.pose_landmarks:
            return {"detected": False}
        
        # Get first person detected
        landmarks = results.pose_landmarks[0]
        h, w, _ = image.shape
        
        # Get coordinates
        # MediaPipe Tasks Pose Landmarks indices are same as Blazepose
        # 11: left_shoulder, 12: right_shoulder, 23: left_hip, 24: right_hip
        l_shoulder = landmarks[11]
        r_shoulder = landmarks[12]
        l_hip = landmarks[23]
        r_hip = landmarks[24]
        
        # Convert to pixel coordinates
        ls_px = (l_shoulder.x * w, l_shoulder.y * h)
        rs_px = (r_shoulder.x * w, r_shoulder.y * h)
        lh_px = (l_hip.x * w, l_hip.y * h)
        rh_px = (r_hip.x * w, r_hip.y * h)
        
        # 1. Shoulder Width
        width_shoulder = math.dist(ls_px, rs_px)
        
        # 2. Torso Center
        center_x = (ls_px[0] + rs_px[0] + lh_px[0] + rh_px[0]) / 4
        center_y = (ls_px[1] + rs_px[1] + lh_px[1] + rh_px[1]) / 4
        
        # 3. Rotation Angle
        # Vector from Right Shoulder (12) to Left Shoulder (11).
        # In non-mirrored camera view:
        #   Right Shoulder (12) is on the LEFT side of image (Low X).
        #   Left Shoulder (11) is on the RIGHT side of image (High X).
        # Vector 12 -> 11 points in positive X direction.
        # Angle of Vector(1,0) is 0 degrees.
        
        dx = ls_px[0] - rs_px[0]
        dy = ls_px[1] - rs_px[1]
        
        angle_rad = math.atan2(dy, dx)
        angle_deg = math.degrees(angle_rad)
        
        return {
            "detected": True,
            "torso": {
                "center": [center_x, center_y],
                "angle": angle_deg,
            },
            "width_shoulder": width_shoulder
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"detected": False, "error": str(e)}

# Serve Static files via mounting
# Note: mounting "/" catches all requests, so make sure API routes are defined before this.
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Bind to localhost (127.0.0.1) explicitly to ensure browser treats it as a secure context for camera access
    uvicorn.run(app, host="127.0.0.1", port=8000)
