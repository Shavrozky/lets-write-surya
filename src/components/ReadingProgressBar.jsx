// src/components/ReadingProgressBar.jsx
import { useState, useEffect } from "react";

export default function ReadingProgressBar({ accentColor = "bg-neutral-800" }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(currentProgress);
      }
    };

    window.addEventListener("scroll", calculateScroll);
    return () => window.removeEventListener("scroll", calculateScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 h-[2.5px] z-50 transition-all duration-75 ease-out ${accentColor}`}
      style={{ width: `${progress}%` }}
    />
  );
}
