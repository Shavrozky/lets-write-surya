// src/components/AmbientPlayer.jsx
import { useState, useRef } from "react";
import { CloudRain, Music2, Volume2, VolumeX } from "lucide-react";

const soundOptions = [
  {
    id: "rain",
    label: "Hujan Malam",
    description: "Rintik hujan sintetis yang lembut",
    type: "generated",
  },
  {
    id: "lofi",
    label: "Lo-fi Sunyi",
    description: "Letakkan file di public/audio/lofi.mp3",
    type: "file",
    src: "/audio/lofi.mp3",
  },
  {
    id: "piano",
    label: "Piano Pelan",
    description: "Letakkan file di public/audio/piano.mp3",
    type: "file",
    src: "/audio/piano.mp3",
  },
  {
    id: "ambient",
    label: "Ambient Fokus",
    description: "Letakkan file di public/audio/ambient.mp3",
    type: "file",
    src: "/audio/ambient.mp3",
  },
];

export default function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSoundId, setSelectedSoundId] = useState("rain");
  const [errorMessage, setErrorMessage] = useState("");
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const audioRef = useRef(null);

  const selectedSound =
    soundOptions.find((option) => option.id === selectedSoundId) ||
    soundOptions[0];

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

  const startFileAudio = async (sound) => {
    const audio = new Audio(sound.src);
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;

    try {
      await audio.play();
    } catch {
      audioRef.current = null;
      throw new Error(
        `File ${sound.src} belum tersedia atau browser memblokir pemutaran.`,
      );
    }
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    noiseNodeRef.current = null;
    audioCtxRef.current = null;
  };

  const startSelectedSound = async () => {
    setErrorMessage("");

    if (selectedSound.type === "generated") {
      startRainAudio();
      return;
    }

    await startFileAudio(selectedSound);
  };

  const toggleSound = async () => {
    if (!isPlaying) {
      try {
        await startSelectedSound();
        setIsPlaying(true);
      } catch (err) {
        stopAudio();
        setErrorMessage(err.message);
        setIsPlaying(false);
      }
    } else {
      stopAudio();
      setIsPlaying(false);
    }
  };

  const handleSoundChange = async (event) => {
    const nextSoundId = event.target.value;

    setSelectedSoundId(nextSoundId);
    setErrorMessage("");

    if (!isPlaying) return;

    stopAudio();
    setIsPlaying(false);

    const nextSound = soundOptions.find((option) => option.id === nextSoundId);

    try {
      if (nextSound.type === "generated") {
        startRainAudio();
      } else {
        await startFileAudio(nextSound);
      }
      setIsPlaying(true);
    } catch (err) {
      stopAudio();
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 font-sans">
      <div className="w-[min(calc(100vw-2rem),360px)] rounded-2xl border border-neutral-200 bg-white/90 p-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-neutral-50 px-3 py-2 text-xs text-neutral-600 ring-1 ring-neutral-200">
            <Music2 size={13} className="shrink-0 text-neutral-400" />
            <select
              value={selectedSoundId}
              onChange={handleSoundChange}
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-neutral-700 outline-none"
            >
              {soundOptions.map((sound) => (
                <option key={sound.id} value={sound.id}>
                  {sound.label}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={toggleSound}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs shadow-sm transition-all duration-300 ${
              isPlaying
                ? "border-neutral-800 bg-neutral-900 text-white ring-2 ring-neutral-400/20"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
            title={isPlaying ? "Hentikan backsound" : "Putar backsound"}
          >
            {selectedSoundId === "rain" ? (
              <CloudRain
                size={14}
                className={
                  isPlaying ? "text-cyan-300 animate-pulse" : "text-neutral-400"
                }
              />
            ) : (
              <Music2
                size={14}
                className={
                  isPlaying ? "text-amber-200 animate-pulse" : "text-neutral-400"
                }
              />
            )}
            <span className="hidden font-medium sm:inline">
              {isPlaying ? "Aktif" : "Putar"}
            </span>
            {isPlaying ? (
              <Volume2 size={13} />
            ) : (
              <VolumeX size={13} className="text-neutral-400" />
            )}
          </button>
        </div>

        <div className="px-2 pb-1 pt-2 text-[11px] leading-relaxed text-neutral-400">
          {errorMessage || selectedSound.description}
        </div>
      </div>
    </div>
  );
}
