// src/components/AmbientPlayer.jsx
import { useState, useRef } from "react";
import { Volume2, VolumeX, CloudRain } from "lucide-react";

export default function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseNodeRef = useRef(null);

  const startRainAudio = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Generate Pink Noise (Suara Hujan Halus)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04; // volume lembut
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter frekuensi agar menyerupai suara rintik hujan di atap
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start(0);

    noiseNodeRef.current = whiteNoise;
    gainNodeRef.current = gainNode;
  };

  const stopAudio = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch {
        // Audio nodes may already be stopped when users tap quickly.
      }
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
  };

  const toggleSound = () => {
    if (!isPlaying) {
      startRainAudio();
      setIsPlaying(true);
    } else {
      stopAudio();
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        onClick={toggleSound}
        className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 rounded-full border shadow-md text-xs font-sans transition-all duration-300 backdrop-blur-md ${
          isPlaying
            ? "bg-neutral-900 text-white border-neutral-700 ring-2 ring-neutral-400/20"
            : "bg-white/90 text-neutral-600 border-neutral-200 hover:bg-neutral-50"
        }`}
        title={
          isPlaying ? "Hentikan Suara Ambience" : "Putar Ambience Hujan Malam"
        }
      >
        <CloudRain
          size={14}
          className={
            isPlaying ? "text-cyan-300 animate-pulse" : "text-neutral-400"
          }
        />
        <span className="font-medium hidden sm:inline">
          {isPlaying ? "Hujan Malam Aktif" : "Suara Latar"}
        </span>
        {isPlaying ? (
          <Volume2 size={13} />
        ) : (
          <VolumeX size={13} className="text-neutral-400" />
        )}
      </button>
    </div>
  );
}
