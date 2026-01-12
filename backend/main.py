from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2

app = FastAPI(title="Camera Stream Server")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default RTSP URL - can be overridden via environment variable
RTSP_URL = "rtsp://Talkhawy1:Talkhawy123@192.168.88.96/stream2"


def generate_frames():
    """Generator function to yield video frames as MJPEG stream"""
    cap = cv2.VideoCapture(RTSP_URL)
    
    if not cap.isOpened():
        print(f"Error: Could not open RTSP stream: {RTSP_URL}")
        return
    
    print(f"Successfully connected to RTSP stream: {RTSP_URL}")
    
    while True:
        success, frame = cap.read()
        if not success:
            print("Failed to read frame, reconnecting...")
            cap.release()
            cap = cv2.VideoCapture(RTSP_URL)
            continue
        
        # Encode frame as JPEG
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        
        # Yield frame in MJPEG format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')


@app.get("/video_feed")
def video_feed():
    """Endpoint to stream video as MJPEG"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "message": "Camera stream server is running"}


@app.get("/")
def root():
    """Root endpoint with API info"""
    return {
        "name": "Camera Stream Server",
        "endpoints": {
            "/video_feed": "MJPEG video stream",
            "/health": "Health check"
        }
    }
