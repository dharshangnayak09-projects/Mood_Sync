from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

song_db = {
    "happy": {
        "match": [
            {"title": "Happy Vibes", "artist": "Artist A", "file": "/songs/happy1.mp3"},
            {"title": "Dance Energy", "artist": "Artist B", "file": "/songs/happy2.mp3"},
            {"title": "Feel Good Beats", "artist": "Artist C", "file": "/songs/happy3.mp3"},
        ],
        "change": [
            {"title": "Focus Flow", "artist": "Artist D", "file": "/songs/focus1.mp3"},
            {"title": "Focus Boost", "artist": "Artist E", "file": "/songs/focus2.mp3"},
            {"title": "Deep Focus", "artist": "Artist F", "file": "/songs/focus3.mp3"},
        ],
    },
    "sad": {
        "match": [
            {"title": "Soft Memories", "artist": "Artist G", "file": "/songs/sad1.mp3"},
            {"title": "Midnight Rain", "artist": "Artist H", "file": "/songs/sad2.mp3"},
            {"title": "Blue Calm", "artist": "Artist I", "file": "/songs/calm1.mp3"},
        ],
        "change": [
            {"title": "Rise Again", "artist": "Artist J", "file": "/songs/upbeat1.mp3"},
            {"title": "Sunny Day", "artist": "Artist K", "file": "/songs/upbeat2.mp3"},
            {"title": "Energy Lift", "artist": "Artist L", "file": "/songs/happy1.mp3"},
        ],
    },
    "stressed": {
        "match": [
            {"title": "LoFi Calm", "artist": "Artist M", "file": "/songs/calm1.mp3"},
            {"title": "Breathing Space", "artist": "Artist N", "file": "/songs/calm2.mp3"},
            {"title": "Quiet Focus", "artist": "Artist O", "file": "/songs/focus1.mp3"},
        ],
        "change": [
            {"title": "Gentle Reset", "artist": "Artist P", "file": "/songs/reset1.mp3"},
            {"title": "Mind Refresh", "artist": "Artist Q", "file": "/songs/reset2.mp3"},
            {"title": "Positive Pulse", "artist": "Artist R", "file": "/songs/upbeat1.mp3"},
        ],
    },
}

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Recommendation API is running"})

@app.route("/recommend", methods=["GET"])
def recommend():
    emotion = request.args.get("emotion", "happy").lower()
    mode = request.args.get("mode", "match").lower()

    if emotion not in song_db:
        emotion = "stressed"

    if mode not in ["match", "change"]:
        mode = "match"

    return jsonify({
        "emotion": emotion,
        "mode": mode,
        "songs": song_db[emotion][mode]
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)