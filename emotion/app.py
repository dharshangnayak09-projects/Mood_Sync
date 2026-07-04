from flask import Flask, jsonify
from flask_cors import CORS
import cv2
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

camera = cv2.VideoCapture(0)

@app.route("/")
def home():
    return "Emotion backend is running"

@app.route("/emotion", methods=["GET"])
def detect_emotion():
    try:
        success, frame = camera.read()

        if not success:
            return jsonify({
                "emotion": "unknown",
                "confidence": 0,
                "error": "Could not access webcam"
            }), 500

        result = DeepFace.analyze(
            img_path=frame,
            actions=["emotion"],
            enforce_detection=False,
            detector_backend="opencv"
        )

        if isinstance(result, list):
            result = result[0]

        dominant_emotion = result.get("dominant_emotion", "unknown")
        confidence = result.get("emotion", {}).get(dominant_emotion, 0)

        return jsonify({
            "emotion": dominant_emotion,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({
            "emotion": "unknown",
            "confidence": 0,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)