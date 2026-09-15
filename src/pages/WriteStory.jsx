// src/pages/WriteStory.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2, Sparkles } from "lucide-react";
import { getReadingStats } from "../utils/readingTime";

export default function WriteStory() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Monolog");
  const [coverImage, setCoverImage] = useState("");
  const [adminKey, setAdminKey] = useState(
    localStorage.getItem("katasurya_key") || "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { wordCount, readTime } = getReadingStats(content);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Judul dan isi cerita tidak boleh kosong!");
      return;
    }

    if (!adminKey) {
      setShowKeyModal(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": localStorage.getItem("katasurya_token") || "",
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
        if (response.status === 403) {
          localStorage.removeItem("katasurya_key");
          setShowKeyModal(true);
          throw new Error(
            "Kunci Admin salah. Harap masukkan kunci yang sesuai.",
          );
        }
        throw new Error(data.message || "Gagal menerbitkan cerita.");
      }

      // Simpan kunci admin jika berhasil
      localStorage.setItem("katasurya_key", adminKey);

      // Redirect langsung ke cerita yang baru diterbitkan
      navigate(`/cerita/${data.data.slug}`);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-proseText py-8 px-4">
      {/* Top Header Bar */}
      <div className="max-w-[800px] mx-auto flex items-center justify-between border-b border-proseBorder pb-4 mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-sans text-proseMuted hover:text-proseText"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke draft</span>
        </Link>

        {/* Stats & Tombol Publish */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-xs font-sans text-proseMuted">
            {wordCount} kata · {readTime}
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            title="Ubah Kunci Admin"
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
          >
            <KeyRound size={16} />
          </button>

          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="bg-[#1A8917] hover:bg-[#156f13] text-white px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            <span>Publikasikan</span>
          </button>
        </div>
      </div>

      {/* Pesan Error Jika Ada */}
      {errorMessage && (
        <div className="max-w-[700px] mx-auto mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Editor Utama Bergaya Medium */}
      <main className="max-w-[700px] mx-auto">
        {/* Pengaturan Kategori & Cover (Metadata Bar) */}
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

        {/* Input Judul (Medium Style: Tanpa Border, Font Besar) */}
        <textarea
          rows={1}
          placeholder="Judul Cerita..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full font-serif text-3xl md:text-5xl font-bold tracking-tight text-proseText placeholder:text-neutral-300 outline-none resize-none mb-6 border-none focus:ring-0 leading-tight"
        />

        {/* Input Naskah Cerita */}
        <textarea
          rows={18}
          placeholder="Mulai tulis ceritamu di sini... (Mendukung format Markdown seperti *miring*, **tebal**, atau kutipan >)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full font-serif text-lg md:text-xl text-proseText placeholder:text-neutral-300 outline-none resize-y leading-[1.85] border-none focus:ring-0 min-h-[450px]"
        />
      </main>

      {/* Modal Masukkan Kunci Rahasia Admin */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border border-neutral-200">
            <h3 className="font-serif text-lg font-bold mb-2">Kunci Penulis</h3>
            <p className="font-sans text-xs text-proseMuted mb-4 leading-relaxed">
              Masukkan kunci rahasia yang ditentukan di file <code>.env</code>{" "}
              Laravel (<code>ADMIN_SECRET_KEY</code>) untuk memverifikasi bahwa
              ini kamu.
            </p>
            <input
              type="password"
              placeholder="Masukkan secret key..."
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full border border-neutral-300 rounded px-3 py-2 text-sm font-sans outline-none focus:border-neutral-600 mb-4"
            />
            <div className="flex justify-end gap-2 text-xs font-sans">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("katasurya_key", adminKey);
                  setShowKeyModal(false);
                }}
                className="px-4 py-1.5 rounded bg-neutral-900 text-white font-medium hover:bg-neutral-800"
              >
                Simpan Kunci
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
