// src/components/ReadingProgressBar.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function ReadingProgressBar({ theme = "light", accentColor }) {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setProgress(Math.min(100, Math.max(0, currentProgress)));
    };

    window.addEventListener("scroll", calculateScroll, { passive: true });
    calculateScroll();
    return () => window.removeEventListener("scroll", calculateScroll);
  }, []);

  // Menentukan warna garis dan jalur track berdasarkan tema
  const getThemeStyles = () => {
    switch (theme) {
      case "dark":
      case "malam":
        return {
          bar: accentColor || "bg-amber-400",
          track: "bg-neutral-800",
          glow: "shadow-[0_0_10px_rgba(251,191,36,0.6)]",
        };
      case "paper":
      case "kertas":
        return {
          bar: accentColor || "bg-[#5c5243]",
          track: "bg-[#e4d8c5]",
          glow: "shadow-[0_0_8px_rgba(92,82,67,0.4)]",
        };
      case "light":
      case "putih":
      default:
        return {
          bar: accentColor || "bg-neutral-900",
          track: "bg-neutral-200",
          glow: "shadow-[0_0_8px_rgba(0,0,0,0.3)]",
        };
    }
  };

  if (!mounted) return null;

  const { bar, track, glow } = getThemeStyles();

  const content = (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] h-[4px] w-full transition-colors duration-300 pointer-events-none ${track}`}
      style={{ isolation: "isolate" }}
    >
      <div
        className={`h-full transition-[width] duration-100 ease-out ${bar} ${glow}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  return createPortal(content, document.body);
}
