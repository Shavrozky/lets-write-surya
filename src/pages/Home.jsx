import { useState, useEffect } from "react";
import { stories as fallbackStories } from "../data/stories";
import StoryCard from "../components/StoryCard";

const pageSizeOptions = [5, 10, 25, 100];

export default function Home() {
  const [storyList, setStoryList] = useState(fallbackStories);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "https://api.katasurya.my.id/api";

    fetch(`${API_BASE_URL}/stories`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Cukup pastikan respon berupa array
        if (Array.isArray(data)) {
          setStoryList(data);
        }
      })
      .catch((err) => {
        console.warn(
          "Gagal mengambil naskah dari API, menggunakan fallback lokal:",
          err,
        );
        // setStoryList(fallbackStories); // jika ingin fallback
      });
  }, []);

  const categories = ["Semua", ...new Set(storyList.map((s) => s.category))];

  const filteredStories =
    activeCategory === "Semua"
      ? storyList
      : storyList.filter((s) => s.category === activeCategory);

  const totalPages = Math.max(1, Math.ceil(filteredStories.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedStories = filteredStories.slice(
    pageStartIndex,
    pageStartIndex + pageSize,
  );
  const visibleStart = filteredStories.length === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = Math.min(pageStartIndex + pageSize, filteredStories.length);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="max-w-[760px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <section className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-proseBorder">
        <h1 className="font-serif text-[34px] sm:text-4xl font-bold tracking-tight text-proseText mb-2">
          Surya
        </h1>
        <p className="font-serif text-proseMuted text-[17px] sm:text-lg leading-relaxed max-w-[580px]">
          Ruang catatan, fiksi reflektif, dan rekam pikiran. Tulisan-tulisan
          yang ditulis saat malam terlalu sunyi atau pagi datang terlalu cepat.
        </p>
      </section>

      <div className="flex items-center gap-5 sm:gap-6 border-b border-proseBorder mb-4 sm:mb-6 overflow-x-auto pb-1 text-sm font-sans -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
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

      <div className="mb-5 sm:mb-6 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4 font-sans shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Navigasi Naskah
            </p>
            <p className="mt-1 text-sm text-neutral-700">
              Menampilkan {visibleStart}-{visibleEnd} dari{" "}
              {filteredStories.length} cerita
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600">
              <span>Per halaman</span>
              <select
                value={pageSize}
                onChange={(event) => handlePageSizeChange(event.target.value)}
                className="bg-transparent font-semibold text-neutral-900 outline-none"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <section>
        {paginatedStories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </section>

      {filteredStories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-12 text-center font-serif text-neutral-500">
          Belum ada cerita untuk kategori ini.
        </div>
      )}

      {filteredStories.length > 0 && (
        <nav className="mt-8 flex flex-col gap-3 border-t border-proseBorder pt-5 font-sans sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-proseMuted">
            Halaman {safeCurrentPage} dari {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(
                  Math.max(0, safeCurrentPage - 3),
                  Math.max(5, safeCurrentPage + 2),
                )
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`h-8 min-w-8 rounded-full px-2 text-xs transition ${
                      page === safeCurrentPage
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-200 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </nav>
      )}

    </main>
  );
}
