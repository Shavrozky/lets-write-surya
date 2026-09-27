import { useState, useEffect } from "react";
import { stories as fallbackStories } from "../data/stories";
import StoryCard from "../components/StoryCard";

const pageSizeOptions = [5, 10, 25, 100];

const formatDate = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const createExcerpt = (content = "") => {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_>`\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > 150 ? `${plainText.slice(0, 150)}...` : plainText;
};

const normalizeCommunityStory = (story) => ({
  ...story,
  slug: `community-${story.id}`,
  detailPath: `/creator/stories/${story.id}`,
  date: formatDate(story.created_at || story.updated_at),
  category: story.category || "Komunitas",
  excerpt: story.excerpt || createExcerpt(story.content),
  coverImage: story.cover_image || story.coverImage || null,
});

export default function Home() {
  const [storyList, setStoryList] = useState(fallbackStories);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "https://api.katasurya.my.id/api";

    Promise.allSettled([
      fetch(`${API_BASE_URL}/stories`).then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      }),
      fetch(`${API_BASE_URL}/community/stories`).then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      }),
    ])
      .then(([legacyStoriesResult, communityStoriesResult]) => {
        const legacyStories =
          legacyStoriesResult.status === "fulfilled"
            ? legacyStoriesResult.value
            : [];
        const communityStories =
          communityStoriesResult.status === "fulfilled"
            ? communityStoriesResult.value
            : null;

        const normalizedLegacyStories = Array.isArray(legacyStories)
          ? legacyStories
          : [];
        const normalizedCommunityStories = Array.isArray(communityStories?.data)
          ? communityStories.data.map(normalizeCommunityStory)
          : [];

        setStoryList([
          ...normalizedCommunityStories,
          ...normalizedLegacyStories,
        ]);
      })
      .catch((err) => {
        console.warn("Gagal mengambil naskah dari API:", err);
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
  const visibleEnd = Math.min(
    pageStartIndex + pageSize,
    filteredStories.length,
  );

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
    /* mx-auto DIHAPUS, padding disamakan dengan navbar agar sejajar tegak lurus */
    <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      {/* Header Aksara */}
      <section className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-neutral-100">
        <h1 className="font-serif text-[34px] sm:text-5xl font-bold tracking-tight text-neutral-900 mb-3">
          Aksara
        </h1>
        <p className="font-serif text-neutral-500 text-[17px] sm:text-lg leading-relaxed max-w-2xl">
          Ruang catatan, fiksi reflektif, dan rekam pikiran. Tulisan-tulisan
          yang ditulis saat malam terlalu sunyi atau pagi datang terlalu cepat.
        </p>
      </section>

      {/* Kategori Tab */}
      <div className="flex items-center gap-6 border-b border-neutral-200/80 mb-6 overflow-x-auto pb-1 text-sm font-sans">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`pb-3 transition-colors relative whitespace-nowrap font-medium ${
                isActive
                  ? "text-neutral-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-neutral-950"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Navigasi / Bar Info Naskah */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 font-sans sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Navigasi Naskah
          </p>
          <p className="mt-0.5 text-xs text-neutral-600">
            Menampilkan {visibleStart}–{visibleEnd} dari{" "}
            {filteredStories.length} cerita
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 shadow-xs">
            <span>Per halaman:</span>
            <select
              value={pageSize}
              onChange={(event) => handlePageSizeChange(event.target.value)}
              className="bg-transparent font-semibold text-neutral-900 outline-none cursor-pointer"
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

      {/* Daftar Naskah */}
      <section className="divide-y divide-neutral-100">
        {paginatedStories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </section>

      {/* Empty State */}
      {filteredStories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-16 text-center font-serif text-neutral-400">
          Belum ada cerita untuk kategori ini.
        </div>
      )}

      {/* Pagination */}
      {filteredStories.length > 0 && (
        <nav className="mt-10 flex flex-col gap-4 border-t border-neutral-100 pt-6 font-sans sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-400">
            Halaman {safeCurrentPage} dari {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                    className={`h-7 min-w-7 rounded-full px-2 text-xs font-medium transition ${
                      page === safeCurrentPage
                        ? "bg-neutral-950 text-white"
                        : "border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
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
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </nav>
      )}
    </main>
  );
}
