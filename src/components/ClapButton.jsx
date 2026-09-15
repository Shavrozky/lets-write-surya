// src/components/ClapButton.jsx
import { useState, useEffect } from "react";

export default function ClapButton({ slug, theme = "light" }) {
  const [claps, setClaps] = useState(28); // default base claps
  const [userClaps, setUserClaps] = useState(0);
  const [floatingBubbles, setFloatingBubbles] = useState([]);

  useEffect(() => {
    // Ambil data tepukan dari localStorage
    const savedTotal = localStorage.getItem(`claps_${slug}`);
    const savedUser = localStorage.getItem(`user_claps_${slug}`);

    if (savedTotal) setClaps(parseInt(savedTotal, 10));
    if (savedUser) setUserClaps(parseInt(savedUser, 10));
  }, [slug]);

  const handleClap = () => {
    if (userClaps >= 50) return; // batas maksimal 50 tepukan per orang

    const newClaps = claps + 1;
    const newUserClaps = userClaps + 1;

    setClaps(newClaps);
    setUserClaps(newUserClaps);

    localStorage.setItem(`claps_${slug}`, newClaps);
    localStorage.setItem(`user_claps_${slug}`, newUserClaps);

    // Animasi gelembung +1 melayang
    const id = Date.now() + Math.random();
    setFloatingBubbles((prev) => [...prev, { id, text: `+${newUserClaps}` }]);

    setTimeout(() => {
      setFloatingBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 1000);
  };

  const isDark = theme === "dark";

  return (
    <div className="relative inline-flex items-center gap-3">
      {/* Floating +1 Animations */}
      <div className="absolute -top-10 left-3 pointer-events-none">
        {floatingBubbles.map((bubble) => (
          <span
            key={bubble.id}
            className="absolute -translate-x-1/2 text-xs font-sans font-bold text-neutral-800 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full shadow-md animate-bounce"
            style={{ animationDuration: "0.8s" }}
          >
            {bubble.text}
          </span>
        ))}
      </div>

      {/* Tombol Tepuk Tangan */}
      <button
        onClick={handleClap}
        disabled={userClaps >= 50}
        title={
          userClaps >= 50
            ? "Batas maksimal tepukan tercapai (50)"
            : "Beri apresiasi (tepukan)"
        }
        className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 active:scale-95 ${
          userClaps > 0
            ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
            : "border-neutral-300 hover:border-neutral-500 text-neutral-600 dark:text-neutral-300"
        }`}
      >
        {/* Ikon Tangan */}
        <span className="text-lg group-hover:scale-125 transition-transform duration-200">
          👏
        </span>
        <span className="font-sans text-xs font-semibold">{claps}</span>
      </button>

      {userClaps > 0 && (
        <span className="text-[11px] font-sans opacity-60">
          ({userClaps} dari kamu)
        </span>
      )}
    </div>
  );
}
