// src/pages/StoryDetail.jsx
import { useState, useEffect, useRef } from "react";
import { stories } from "../data/stories";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Share2, Check, Quote } from "lucide-react";
import ReadingProgressBar from "../components/ReadingProgressBar";
import ClapButton from "../components/ClapButton";
import { getReadingStats } from "../utils/readingTime";
import { useParams, Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/auth";
import { deleteStory } from "../services/api";

const authorAvatar = "/suryanata.jpg";

export default function StoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const contentRef = useRef(null);

  // Mengambil token via helper resmi auth.js
  const token = auth.getToken();
  const isLoggedIn = auth.isAuthenticated();

  const closeActionModal = () => {
    const nextPath = actionModal?.nextPath;
    setActionModal(null);

    if (nextPath) {
      navigate(nextPath);
    }
  };

  const requestDelete = () => {
    setActionModal({
      tone: "danger",
      eyebrow: "Konfirmasi hapus",
      title: "Hapus naskah ini?",
      message: `Naskah "${story?.title}" akan dihapus dari arsip dan tidak tampil lagi di halaman utama.`,
      confirmLabel: "Ya, hapus",
      cancelLabel: "Batal",
      onConfirm: handleDelete,
    });
  };

  const handleDelete = async () => {
    try {
      setActionModal(null);
      await deleteStory(slug, token);
      setActionModal({
        tone: "success",
        eyebrow: "Naskah terhapus",
        title: "Cerita berhasil dihapus.",
        message: "Arsip sudah diperbarui. Kamu akan kembali ke halaman utama.",
        confirmLabel: "Kembali ke beranda",
        nextPath: "/",
      });
    } catch (err) {
      setActionModal({
        tone: "danger",
        eyebrow: "Gagal menghapus",
        title: "Naskah belum berhasil dihapus.",
        message: err.message,
        confirmLabel: "Mengerti",
      });
    }
  };

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://api.katasurya.my.id/api";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);

    // Menggunakan API_BASE_URL dinamis
    fetch(`${API_BASE_URL}/stories/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Gagal mengambil dari API");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.title && data.content) {
          setStory(data);
        } else {
          throw new Error("Format data API tidak valid");
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback otomatis ke data lokal jika API gagal/offline
        const local = stories.find((s) => s.slug === slug);
        setStory(local || null);
        setLoading(false);
      });
  }, [slug, API_BASE_URL]);

  const [readingTheme, setReadingTheme] = useState("light");
  const [fontSize, setFontSize] = useState("md");
  const [textAlign, setTextAlign] = useState("left");
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
    const formatted = `“${selectedQuote}”\n\n— Surya, dari naskah “${story?.title}”\nhttps://katasurya.my.id/cerita/${story?.slug}`;
    navigator.clipboard.writeText(formatted);
    setTooltipPos(null);
    showToast("Kutipan berhasil disalin dengan rapi");
  };

  // 1. Tampilan saat proses loading data berlangsung
  if (loading) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-32 text-center text-sm font-sans text-neutral-400">
        Memuat naskah cerita...
      </div>
    );
  }

  // 2. Tampilan jika cerita benar-benar tidak ditemukan (baik di API maupun stories.js)
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

  const { wordCount, readTime } = getReadingStats(story.content || "");
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

  const textAlignments = {
    left: "prose-p:text-left prose-li:text-left",
    center: "prose-p:text-center prose-li:text-center",
    right: "prose-p:text-right prose-li:text-right",
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
          className="absolute -translate-x-1/2 z-50 animate-fade-in max-w-[calc(100vw-2rem)]"
        >
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-md shadow-xl text-xs font-sans hover:bg-neutral-800 transition-colors cursor-pointer"
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

      <article className="py-7 sm:py-10 px-4 sm:px-5 md:px-0">
        <div className="max-w-[680px] mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-dashed border-neutral-200/50">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 text-xs font-sans transition-colors ${currentTheme.muted} hover:${currentTheme.text}`}
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </Link>

            <div className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
              {/* Ukuran Font */}
              <div
                className={`flex items-center border rounded-full p-0.5 text-xs font-sans ${currentTheme.controlBg}`}
              >
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-2 py-1 sm:py-0.5 rounded-full ${fontSize === "sm" ? currentTheme.activeBtn : ""}`}
                >
                  A⁻
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  className={`px-2 py-1 sm:py-0.5 rounded-full ${fontSize === "md" ? currentTheme.activeBtn : ""}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2 py-1 sm:py-0.5 rounded-full ${fontSize === "lg" ? currentTheme.activeBtn : ""}`}
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
                  className={`px-2.5 py-1 sm:py-0.5 rounded-full ${readingTheme === "light" ? currentTheme.activeBtn : ""}`}
                >
                  Putih
                </button>
                <button
                  onClick={() => setReadingTheme("paper")}
                  className={`px-2.5 py-1 sm:py-0.5 rounded-full ${readingTheme === "paper" ? currentTheme.activeBtn : ""}`}
                >
                  Kertas
                </button>
                <button
                  onClick={() => setReadingTheme("dark")}
                  className={`px-2.5 py-1 sm:py-0.5 rounded-full ${readingTheme === "dark" ? currentTheme.activeBtn : ""}`}
                >
                  Malam
                </button>
              </div>

              {/* Perataan Teks */}
              <div
                className={`flex items-center border rounded-full p-0.5 text-xs font-sans ${currentTheme.controlBg}`}
              >
                <button
                  onClick={() => setTextAlign("left")}
                  className={`px-2.5 py-1 sm:py-0.5 rounded-full ${textAlign === "left" ? currentTheme.activeBtn : ""}`}
                >
                  Kiri
                </button>
                <button
                  onClick={() => setTextAlign("center")}
                  className={`px-2.5 py-1 sm:py-0.5 rounded-full ${textAlign === "center" ? currentTheme.activeBtn : ""}`}
                >
                  Tengah
                </button>
                <button
                  onClick={() => setTextAlign("right")}
                  className={`px-2.5 py-1 sm:py-0.5 rounded-full ${textAlign === "right" ? currentTheme.activeBtn : ""}`}
                >
                  Kanan
                </button>
              </div>

              {/* Tombol Share */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1 border rounded-full px-3 py-1.5 sm:py-1 text-xs font-sans hover:scale-105 active:scale-95 ${currentTheme.controlBg}`}
              >
                <Share2 size={13} />
                <span className="hidden sm:inline">Bagikan</span>
              </button>
            </div>
          </div>

          {/* Judul Cerita */}
          <h1 className="font-serif text-[32px] sm:text-[40px] md:text-[44px] leading-[1.18] sm:leading-[1.2] font-bold tracking-tight mb-6">
            {story.title}
          </h1>

          {/* Metadata Penulis */}
          <div
            className={`flex items-start sm:items-center gap-3 pb-7 sm:pb-8 mb-7 sm:mb-8 border-b ${currentTheme.border} text-sm`}
          >
            <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
              <img
                src={authorAvatar}
                alt="Surya"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-sans font-medium text-sm">Surya</div>
              <div
                className={`font-sans text-xs flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-0.5 ${currentTheme.muted}`}
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

          {/* Tombol Khusus Penulis (Hanya muncul jika sudah login) */}
          {isLoggedIn && (
            <div
              className={`flex flex-wrap items-center gap-2 sm:gap-3 mb-8 -mt-4 pb-4 border-b ${currentTheme.border}`}
            >
              <span
                className={`text-xs uppercase tracking-wider font-mono ${currentTheme.muted}`}
              >
                Aksi Creator:
              </span>
              <Link
                to={`/write?edit=${slug}`}
                className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-sans"
              >
                Edit Naskah
              </Link>
              <button
                onClick={requestDelete}
                className="text-xs px-3 py-1.5 rounded-md border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition font-sans cursor-pointer"
              >
                Hapus Naskah
              </button>
            </div>
          )}

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
            className={`prose font-serif max-w-none prose-p:mb-6 sm:prose-p:mb-7 prose-img:rounded-sm break-words selection:bg-neutral-200/70 dark:selection:bg-neutral-700 ${fontSizes[fontSize]} ${textAlignments[textAlign]}`}
            style={{ color: "inherit" }}
          >
            <ReactMarkdown>{story.content}</ReactMarkdown>
          </div>

          {/* Fitur Clap Button & Apresiasi */}
          <div
            className={`my-10 sm:my-12 py-5 sm:py-6 border-y ${currentTheme.border} flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-4`}
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

          {/* Bio Singkat Penulis */}
          <div className={`pt-6 border-t ${currentTheme.border}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                <img
                  src={authorAvatar}
                  alt="Surya"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm">
                  Ditulis oleh Surya
                </h3>
                <p
                className={`font-sans text-xs mt-1 leading-relaxed break-words ${currentTheme.muted}`}
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
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight leading-snug">
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
                  const itemStats = getReadingStats(item.content || "");
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

      {actionModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8 font-sans">
          <button
            type="button"
            aria-label="Tutup modal"
            onClick={closeActionModal}
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white text-neutral-950 shadow-2xl">
            <div
              className={`absolute -right-14 -top-14 h-36 w-36 rounded-full blur-2xl ${
                actionModal.tone === "success"
                  ? "bg-emerald-200/70"
                  : "bg-red-200/70"
              }`}
            />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-neutral-200 blur-2xl" />

            <div className="relative p-6 sm:p-7">
              <div
                className={`mb-5 inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                  actionModal.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {actionModal.eyebrow}
              </div>

              <h2 className="font-serif text-3xl font-bold leading-tight">
                {actionModal.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                {actionModal.message}
              </p>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {actionModal.cancelLabel && (
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="rounded-full border border-neutral-200 px-5 py-2.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-400"
                  >
                    {actionModal.cancelLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={actionModal.onConfirm || closeActionModal}
                  className={`rounded-full px-5 py-2.5 text-xs font-medium text-white transition ${
                    actionModal.tone === "danger"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-neutral-950 hover:bg-neutral-800"
                  }`}
                >
                  {actionModal.confirmLabel || "Mengerti"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
