import { useState, useEffect } from "react";
import { stories as fallbackStories } from "../data/stories";
import StoryCard from "../components/StoryCard";

export default function Home() {
  const [storyList, setStoryList] = useState(fallbackStories);
  const [activeCategory, setActiveCategory] = useState("Semua");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStoryList(data);
        }
      })
      .catch(() => {
        // Jika server Laravel belum aktif, gunakan fallback stories.js
      });
  }, []);

  const categories = ["Semua", ...new Set(storyList.map((s) => s.category))];

  const filteredStories =
    activeCategory === "Semua"
      ? storyList
      : storyList.filter((s) => s.category === activeCategory);

  return (
    <main className="max-w-[760px] mx-auto px-4 py-12">
      <section className="mb-10 pb-8 border-b border-proseBorder">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-proseText mb-2">
          Surya
        </h1>
        <p className="font-serif text-proseMuted text-lg leading-relaxed max-w-[580px]">
          Ruang catatan, fiksi reflektif, dan rekam pikiran. Tulisan-tulisan
          yang ditulis saat malam terlalu sunyi atau pagi datang terlalu cepat.
        </p>
      </section>

      <div className="flex items-center gap-6 border-b border-proseBorder mb-6 overflow-x-auto pb-1 text-sm font-sans">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`pb-3 transition-colors relative whitespace-nowrap ${
                isActive
                  ? "text-proseText font-medium"
                  : "text-proseMuted hover:text-proseText"
              }`}
            >
              {category}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-proseText" />
              )}
            </button>
          );
        })}
      </div>

      <section>
        {filteredStories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </section>
    </main>
  );
}
