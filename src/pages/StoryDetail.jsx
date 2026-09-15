// src/pages/StoryDetail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { stories } from "../data/stories";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Share2, Check, Quote } from "lucide-react";
import ReadingProgressBar from "../components/ReadingProgressBar";
import ClapButton from "../components/ClapButton";
import { getReadingStats } from "../utils/readingTime";

export default function StoryDetail() {
  const { slug } = useParams();
  const story = stories.find((s) => s.slug === slug);
  const contentRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const [readingTheme, setReadingTheme] = useState("light");
  const [fontSize, setFontSize] = useState("md");
  const [toastMessage, setToastMessage] = useState("");

  // State untuk Tooltip Sorotan Teks (Quote Tooltip)
  const [selectedQuote, setSelectedQuote] = useState("");
  const [tooltipPos, setTooltipPos] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2400);
  };

  // Listener Seleksi Teks
  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (
      text &&
      text.length > 5 &&
      contentRef.current &&
      contentRef.current.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedQuote(text);
      setTooltipPos({
        top: rect.top + window.scrollY - 44,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    } else {
      setTooltipPos(null);
    }
  };

  // Copy Teks Kutipan Berformat
  const handleCopyQuote = (e) => {
    e.stopPropagation();
    const formatted = `“${selectedQuote}”\n\n— Surya, dari naskah “${story.title}”\nhttps://katasurya.my.id/cerita/${story.slug}`;
    navigator.clipboard.writeText(formatted);
    setTooltipPos(null);
    showToast("Kutipan berhasil disalin dengan rapi");
  };

  if (!story) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl mb-4">Cerita tidak ditemukan.</h2>
        <Link to="/" className="text-sm font-sans underline text-proseMuted">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const { wordCount, readTime } = getReadingStats(story.content);
  const recommendedStories = stories.filter((s) => s.slug !== slug).slice(0, 2);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Tautan cerita berhasil disalin");
  };

  const themeStyles = {
    light: {
      bg: "bg-white",
      text: "text-[#242424]",
      muted: "text-neutral-500",
      border: "border-neutral-150",
      badge: "bg-neutral-100 text-neutral-600",
      cardBg: "bg-neutral-50/70 border-neutral-200/60 hover:border-neutral-300",
      progress: "bg-neutral-800",
      controlBg: "bg-white border-neutral-200 text-neutral-600",
      activeBtn: "bg-neutral-100 text-neutral-900 font-semibold",
    },
    paper: {
      bg: "bg-[#FAF6EF]",
      text: "text-[#2C2724]",
      muted: "text-[#786E65]",
      border: "border-[#E8DFD3]",
      badge: "bg-[#EFE8DC] text-[#5C534B]",
      cardBg: "bg-[#F3EDE3] border-[#E2D7C7] hover:border-[#D5C8B4]",
      progress: "bg-[#5C534B]",
      controlBg: "bg-[#F5EFE4] border-[#E2D7C7] text-[#5C534B]",
      activeBtn: "bg-[#EAE2D3] text-[#2C2724] font-semibold",
    },
    dark: {
      bg: "bg-[#191919]",
      text: "text-[#D8D8D8]",
      muted: "text-[#8E8E8E]",
      border: "border-[#2E2E2E]",
      badge: "bg-[#2A2A2A] text-[#B0B0B0]",
      cardBg: "bg-[#212121] border-[#333333] hover:border-[#444444]",
      progress: "bg-neutral-300",
      controlBg: "bg-[#242424] border-[#333333] text-[#A0A0A0]",
      activeBtn: "bg-neutral-700 text-white font-semibold",
    },
  };

  const currentTheme = themeStyles[readingTheme];

  const fontSizes = {
    sm: "text-[17px] md:text-[18px] leading-[1.8]",
    md: "text-[19px] md:text-[21px] leading-[1.85]",
    lg: "text-[22px] md:text-[24px] leading-[1.9]",
  };

  return (
    <div
      onMouseUp={handleSelection}
      onTouchEnd={handleSelection}
      className={`min-h-screen transition-colors duration-300 ${currentTheme.bg} ${currentTheme.text}`}
    >
      <ReadingProgressBar accentColor={currentTheme.progress} />

      {/* Floating Quote Tooltip saat teks disorot */}
      {tooltipPos && (
        <div
          style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
          className="absolute -translate-x-1/2 z-50 animate-fade-in"
        >
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-md shadow-xl text-xs font-sans hover:bg-neutral-800 transition-colors"
          >
            <Quote size={12} />
            <span>Kutip Kalimat Ini</span>
          </button>
        </div>
      )}

      {/* Floating Toast Notifikasi */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-xs font-sans ${
          toastMessage
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        } bg-neutral-900 text-white border border-neutral-700`}
      >
        <Check size={14} className="text-emerald-400" />
        <span>{toastMessage}</span>
      </div>

      <article className="py-10 px-4 md:px-0">
        <div className="max-w-[680px] mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-dashed border-neutral-200/50">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 text-xs font-sans transition-colors ${currentTheme.muted} hover:${currentTheme.text}`}
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Ukuran Font */}
              <div
                className={`flex items-center border rounded-full p-0.5 text-xs font-sans ${currentTheme.controlBg}`}
              >
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-2 py-0.5 rounded-full ${fontSize === "sm" ? currentTheme.activeBtn : ""}`}
                >
                  A⁻
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  className={`px-2 py-0.5 rounded-full ${fontSize === "md" ? currentTheme.activeBtn : ""}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2 py-0.5 rounded-full ${fontSize === "lg" ? currentTheme.activeBtn : ""}`}
                >
                  A⁺
                </button>
              </div>

              {/* Tema Warna */}
              <div
                className={`flex items-center border rounded-full p-0.5 text-xs font-sans ${currentTheme.controlBg}`}
              >
                <button
                  onClick={() => setReadingTheme("light")}
                  className={`px-2.5 py-0.5 rounded-full ${readingTheme === "light" ? currentTheme.activeBtn : ""}`}
                >
                  Putih
                </button>
                <button
                  onClick={() => setReadingTheme("paper")}
                  className={`px-2.5 py-0.5 rounded-full ${readingTheme === "paper" ? currentTheme.activeBtn : ""}`}
                >
                  Kertas
                </button>
                <button
                  onClick={() => setReadingTheme("dark")}
                  className={`px-2.5 py-0.5 rounded-full ${readingTheme === "dark" ? currentTheme.activeBtn : ""}`}
                >
                  Malam
                </button>
              </div>

              {/* Tombol Share */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1 border rounded-full px-3 py-1 text-xs font-sans hover:scale-105 active:scale-95 ${currentTheme.controlBg}`}
              >
                <Share2 size={13} />
                <span className="hidden sm:inline">Bagikan</span>
              </button>
            </div>
          </div>

          {/* Judul Cerita */}
          <h1 className="font-serif text-3xl md:text-[44px] leading-[1.2] font-bold tracking-tight mb-6">
            {story.title}
          </h1>

          {/* Metadata Penulis */}
          <div
            className={`flex items-center gap-3 pb-8 mb-8 border-b ${currentTheme.border} text-sm`}
          >
            <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Surya"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-sans font-medium text-sm">Surya</div>
              <div
                className={`font-sans text-xs flex flex-wrap items-center gap-1.5 mt-0.5 ${currentTheme.muted}`}
              >
                <span>{readTime}</span>
                <span>({wordCount} kata)</span>
                <span>·</span>
                <span>{story.date}</span>
                <span>·</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${currentTheme.badge}`}
                >
                  {story.category}
                </span>
              </div>
            </div>
          </div>

          {/* Cover Gambar */}
          {story.coverImage && (
            <div className="mb-10 overflow-hidden rounded-sm">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full max-h-[440px] object-cover"
              />
              <p
                className={`text-center font-sans text-xs mt-2 italic ${currentTheme.muted}`}
              >
                Dokumentasi visual fragmen narasi.
              </p>
            </div>
          )}

          {/* Tubuh Cerita */}
          <div
            ref={contentRef}
            className={`prose font-serif max-w-none prose-p:mb-7 selection:bg-neutral-200/70 dark:selection:bg-neutral-700 ${fontSizes[fontSize]}`}
            style={{ color: "inherit" }}
          >
            <ReactMarkdown>{story.content}</ReactMarkdown>
          </div>

          {/* Fitur Clap Button & Apresiasi */}
          <div
            className={`my-12 py-6 border-y ${currentTheme.border} flex items-center justify-between`}
          >
            <div>
              <p className="font-sans text-xs font-medium mb-1">
                Menikmati narasi ini?
              </p>
              <p className={`font-sans text-[11px] ${currentTheme.muted}`}>
                Beri tepukan untuk mengapresiasi tulisan.
              </p>
            </div>
            <ClapButton slug={story.slug} theme={readingTheme} />
          </div>

          {/* Bio Singkat */}
          <div className={`pt-6 border-t ${currentTheme.border}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Surya"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm">
                  Ditulis oleh Surya
                </h3>
                <p
                  className={`font-sans text-xs mt-1 leading-relaxed ${currentTheme.muted}`}
                >
                  Ruang cerita dan monolog rasa. Untuk melihat rekayasa sistem
                  dan project teknis, kunjungi{" "}
                  <a
                    href="https://portfolio.katasurya.my.id"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    portfolio.katasurya.my.id
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Rekomendasi Cerita Lain */}
          {recommendedStories.length > 0 && (
            <section className={`mt-16 pt-10 border-t ${currentTheme.border}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold tracking-tight">
                  Cerita Lainnya dari Surya
                </h2>
                <Link
                  to="/"
                  className={`text-xs font-sans underline ${currentTheme.muted} hover:${currentTheme.text}`}
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedStories.map((item) => {
                  const itemStats = getReadingStats(item.content);
                  return (
                    <Link
                      key={item.slug}
                      to={`/cerita/${item.slug}`}
                      className={`p-5 rounded-md border transition-all duration-200 flex flex-col justify-between ${currentTheme.cardBg}`}
                    >
                      <div>
                        <div
                          className={`text-[11px] font-sans mb-1.5 ${currentTheme.muted}`}
                        >
                          {item.date} · {itemStats.readTime}
                        </div>
                        <h3 className="font-serif font-bold text-base line-clamp-2 mb-2">
                          {item.title}
                        </h3>
                        <p
                          className={`font-serif text-xs line-clamp-2 leading-relaxed ${currentTheme.muted}`}
                        >
                          {item.excerpt}
                        </p>
                      </div>
                      <span className="text-xs font-sans mt-4 font-medium flex items-center gap-1">
                        Baca cerita →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
