import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [emotion, setEmotion] = useState("happy");
  const [confidence, setConfidence] = useState(0);
  const [mode, setMode] = useState("match");
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingEmotion, setLoadingEmotion] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [error, setError] = useState("");

  const audioRef = useRef(null);

  const getExplanation = () => {
    if (emotion === "happy" && mode === "match") {
      return "You seem happy. We are recommending energetic songs to match your mood.";
    }
    if (emotion === "happy" && mode === "change") {
      return "You seem happy. We are recommending focus-friendly songs to calm and balance your energy.";
    }
    if (emotion === "sad" && mode === "match") {
      return "You seem sad. We are recommending soft and comforting songs to match your mood.";
    }
    if (emotion === "sad" && mode === "change") {
      return "You seem sad. We are recommending uplifting songs to improve your mood.";
    }
    if (emotion === "stressed" && mode === "match") {
      return "You seem stressed. We are recommending calming songs to help you relax.";
    }
    if (emotion === "stressed" && mode === "change") {
      return "You seem stressed. We are recommending light refreshing songs to reset your mood.";
    }
    return "Mood-based recommendations are active.";
  };

  const fetchEmotion = async () => {
    try {
      setLoadingEmotion(true);
      setError("");

      const res = await fetch("http://127.0.0.1:8000/emotion");
      if (!res.ok) {
        throw new Error("Failed to fetch emotion");
      }

      const data = await res.json();

      const detectedEmotion = ["happy", "sad", "stressed"].includes(data.emotion)
        ? data.emotion
        : "stressed";

      setEmotion(detectedEmotion);
      setConfidence(data.confidence || 0);
    } catch (err) {
      setError("Could not fetch emotion data");
      console.error(err);
    } finally {
      setLoadingEmotion(false);
    }
  };

  const fetchSongs = async () => {
    try {
      setLoadingSongs(true);
      setError("");

      const res = await fetch(
        `http://127.0.0.1:5000/recommend?emotion=${emotion}&mode=${mode}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch songs");
      }

      const data = await res.json();
      setSongs(data.songs || []);
    } catch (err) {
      setError("Could not fetch recommended songs");
      setSongs([]);
      console.error(err);
    } finally {
      setLoadingSongs(false);
    }
  };

  useEffect(() => {
    fetchEmotion();
    const interval = setInterval(fetchEmotion, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [emotion, mode]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio play error:", err);
          setError("Audio could not be played");
        });
    }
  }, [currentSong]);

  const handlePlaySong = (song) => {
    setError("");

    if (currentSong?.file === song.file) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.error("Resume play error:", err);
              setError("Audio could not be played");
            });
        }
      }
      return;
    }

    setCurrentSong(song);
  };

  return (
    <div className={`app ${emotion}`}>
      <div className="overlay">
        <header className="header">
          <h1>MoodSync 🎧</h1>
          <p>Real-time emotion-based smart music recommendation</p>
        </header>

        {error && <p className="error-text">{error}</p>}

        <main className="main-grid">
          <section className="card camera-card">
            <h2>Live Emotion Detection</h2>

            <div className="camera-box">
              <p>{loadingEmotion ? "Detecting emotion..." : "Emotion API Active"}</p>
            </div>

            <div className="emotion-info">
              <h3>Detected Emotion: {emotion.toUpperCase()}</h3>
              <p>Confidence: {confidence}%</p>
            </div>

            <div className="demo-buttons">
              <button onClick={fetchEmotion}>Refresh Emotion</button>
            </div>
          </section>

          <section className="card controls-card">
            <h2>Recommendation Mode</h2>

            <div className="mode-buttons">
              <button
                className={mode === "match" ? "active-btn" : ""}
                onClick={() => setMode("match")}
              >
                Match Mood
              </button>

              <button
                className={mode === "change" ? "active-btn" : ""}
                onClick={() => setMode("change")}
              >
                Change Mood
              </button>
            </div>

            <div className="explanation-box">
              <p>{getExplanation()}</p>
            </div>
          </section>

          <section className="card songs-card">
            <h2>Recommended Songs</h2>

            {loadingSongs ? (
              <p>Loading songs...</p>
            ) : songs.length === 0 ? (
              <p>No songs available for this mood right now.</p>
            ) : (
              <div className="songs-list">
                {songs.map((song, index) => (
                  <div className="song-item" key={index}>
                    <div>
                      <h3>{song.title}</h3>
                      <p>{song.artist}</p>
                      <small>{song.file}</small>
                    </div>

                    <button className="play-btn" onClick={() => handlePlaySong(song)}>
                      {currentSong?.file === song.file && isPlaying ? "Pause" : "Play"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card player-card">
            <h2>Now Playing</h2>

            {currentSong ? (
              <div className="now-playing">
                <h3>{currentSong.title}</h3>
                <p>{currentSong.artist}</p>

                <audio
                  ref={audioRef}
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={currentSong.file} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <p>No song selected yet.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;