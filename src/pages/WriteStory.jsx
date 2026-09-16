// src/pages/WriteStory.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { getReadingStats } from "../utils/readingTime";
import { auth } from "../utils/auth";

export default function WriteStory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("edit");
  const isEditMode = Boolean(editSlug);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://api.katasurya.my.id/api";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Monolog");
  const [coverImage, setCoverImage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { wordCount, readTime } = getReadingStats(content);

  // Ambil token login kreator
  const token =
    auth.getToken() || localStorage.getItem("katasurya_token") || "";

  // Jika dalam Mode Edit, ambil naskah yang sudah ada
  useEffect(() => {
    if (!isEditMode) return;

    setIsLoadingStory(true);
    fetch(`${API_BASE_URL}/stories/${editSlug}`)
      .then((res) => {
        if (!res.ok)
          throw new Error("Gagal mengambil data naskah untuk diedit.");
        return res.json();
      })
      .then((data) => {
        setTitle(data.title || "");
        setContent(data.content || "");
        setCategory(data.category || "Monolog");
        setCoverImage(data.coverImage || "");
      })
      .catch((err) => {
        setErrorMessage(err.message);
      })
      .finally(() => {
        setIsLoadingStory(false);
      });
  }, [isEditMode, editSlug, API_BASE_URL]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Judul dan isi naskah tidak boleh kosong!");
      return;
    }

    if (!token) {
      alert("Sesi masuk tidak ditemukan. Harap login kembali.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    // Tentukan endpoint & method: PUT jika edit, POST jika buat baru
    const endpoint = isEditMode
      ? `${API_BASE_URL}/stories/${editSlug}`
      : `${API_BASE_URL}/stories`;
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-Admin-Key": token,
        },
        body: JSON.stringify({
          title,
          content,
          category,
          coverImage: coverImage.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          auth.logout();
          navigate("/login");
          throw new Error(
            "Sesi telah habis atau otorisasi gagal. Silakan login kembali.",
          );
        }
        throw new Error(data.message || "Gagal menyimpan naskah.");
      }

      alert(
        isEditMode
          ? "Perubahan naskah berhasil disimpan."
          : "Naskah berhasil diterbitkan!",
      );

      // Arahkan ke halaman detail naskah
      const targetSlug = isEditMode ? editSlug : data.data?.slug;
      navigate(`/cerita/${targetSlug}`);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStory) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-sans text-neutral-400">
        <Loader2 className="animate-spin mr-2" size={16} /> Memuat naskah untuk
        disunting...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-proseText py-8 px-4">
      {/* Top Header Bar */}
      <div className="max-w-[800px] mx-auto flex items-center justify-between border-b border-proseBorder pb-4 mb-8">
        <Link
          to={isEditMode ? `/cerita/${editSlug}` : "/"}
          className="inline-flex items-center gap-1 text-xs font-sans text-proseMuted hover:text-proseText"
        >
          <ArrowLeft size={14} />
          <span>{isEditMode ? "Batal Edit" : "Kembali ke draft"}</span>
        </Link>

        {/* Stats & Tombol Publish / Save */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-xs font-sans text-proseMuted">
            {wordCount} kata · {readTime}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#1A8917] hover:bg-[#156f13] text-white px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            <span>{isEditMode ? "Simpan Perubahan" : "Publikasikan"}</span>
          </button>
        </div>
      </div>

      {/* Pesan Error Jika Ada */}
      {errorMessage && (
        <div className="max-w-[700px] mx-auto mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Editor Naskah */}
      <main className="max-w-[700px] mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-8 p-3 bg-neutral-50 rounded-lg border border-neutral-150 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Sparkles size={14} />
            <span>Kategori:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs outline-none focus:border-neutral-500"
            >
              <option value="Monolog">Monolog</option>
              <option value="Fiksi">Fiksi</option>
              <option value="Catatan">Catatan</option>
              <option value="Puitis">Puitis</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <input
              type="url"
              placeholder="URL Cover Gambar (opsional)..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs outline-none focus:border-neutral-500 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Input Judul */}
        <textarea
          rows={1}
          placeholder="Judul Cerita..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full font-serif text-3xl md:text-5xl font-bold tracking-tight text-proseText placeholder:text-neutral-300 outline-none resize-none mb-6 border-none focus:ring-0 leading-tight"
        />

        {/* Input Isi Naskah */}
        <textarea
          rows={18}
          placeholder="Mulai tulis ceritamu di sini... (Mendukung format Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full font-serif text-lg md:text-xl text-proseText placeholder:text-neutral-300 outline-none resize-y leading-[1.85] border-none focus:ring-0 min-h-[450px]"
        />
      </main>
    </div>
  );
}
