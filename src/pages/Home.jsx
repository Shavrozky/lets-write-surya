// src/pages/Home.jsx
import { useState } from "react";
import { stories } from "../data/stories";
import StoryCard from "../components/StoryCard";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Ambil semua kategori unik secara otomatis dari data
  const categories = ["Semua", ...new Set(stories.map((s) => s.category))];

  // Filter cerita sesuai kategori yang dipilih
  const filteredStories =
    activeCategory === "Semua"
      ? stories
      : stories.filter((s) => s.category === activeCategory);

  return (
    <main className="max-w-[760px] mx-auto px-4 py-12">
      {/* Profil Publikasi Penulis */}
      <section className="mb-10 pb-8 border-b border-proseBorder">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-proseText mb-2">
          Surya
        </h1>
        <p className="font-serif text-proseMuted text-lg leading-relaxed max-w-[580px]">
          Ruang catatan, fiksi reflektif, dan rekam pikiran. Tulisan-tulisan
          yang ditulis saat malam terlalu sunyi atau pagi datang terlalu cepat.
        </p>
      </section>

      {/* Tab Filter Kategori (Gaya Medium) */}
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
              {/* Garis bawah penanda tab aktif */}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-proseText" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feed Cerita Hasil Filter */}
      <section>
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))
        ) : (
          <p className="py-12 text-center text-sm font-sans text-proseMuted">
            Belum ada cerita di kategori ini.
          </p>
        )}
      </section>
    </main>
  );
}
