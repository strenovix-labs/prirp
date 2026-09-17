import { useState, useRef, useEffect } from "react";

export default function AudioAmbience() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      // Initialize Web Audio API on user gesture
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Create warm glacial drone chords (55Hz, 110Hz, 164.8Hz, 220Hz)
      const freqs = [55, 110, 164.81, 220, 329.63];
      const oscs = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const oscGain = ctx.createGain();

        osc.type = i === 0 ? "sine" : i % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // Gentle sub-zero modulation
        oscGain.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime);

        if (panner) {
          panner.pan.setValueAtTime((i - 2) * 0.4, ctx.currentTime);
          osc.connect(panner);
          panner.connect(oscGain);
        } else {
          osc.connect(oscGain);
        }

        oscGain.connect(masterGain);
        osc.start();
        return osc;
      });

      oscillatorsRef.current = oscs;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (isPlaying) {
      // Fade out
      gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.3);
      setIsPlaying(false);
    } else {
      // Fade in
      gainNodeRef.current.gain.setTargetAtTime(0.2, audioCtxRef.current.currentTime, 0.5);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <button
      onClick={toggleAudio}
      className="audio-ambience-btn"
      title={isPlaying ? "Mute Sub-Zero Ambience" : "Play Sub-Zero Ambience"}
      aria-label="Toggle Sound"
    >
      <span className="audio-label font-mono">SOUND</span>
      <div className={`audio-bars ${isPlaying ? "playing" : ""}`}>
        <span className="bar bar-1"></span>
        <span className="bar bar-2"></span>
        <span className="bar bar-3"></span>
        <span className="bar bar-4"></span>
      </div>
    </button>
  );
}
