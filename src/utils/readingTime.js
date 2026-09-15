// src/utils/readingTime.js
export function getReadingStats(content = "") {
  // Hapus karakter markdown agar perhitungan kata akurat
  const cleanText = content.replace(/[#*`_~\[\]()>-]/g, "").trim();

  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return {
    wordCount: words,
    readTime: `${minutes} min read`,
  };
}
