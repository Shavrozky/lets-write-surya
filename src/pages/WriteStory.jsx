// src/pages/WriteStory.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { getReadingStats } from "../utils/readingTime";
import { auth } from "../utils/auth";

const MAX_COVER_FILE_SIZE = 5 * 1024 * 1024;
const MAX_COVER_PAYLOAD_SIZE = 700 * 1024;
const MAX_COVER_WIDTH = 1200;
const MAX_COVER_HEIGHT = 720;

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
  const [actionModal, setActionModal] = useState(null);

  const { wordCount, readTime } = getReadingStats(content);

  const openActionModal = (modal) => {
    setActionModal(modal);
  };

  const closeActionModal = () => {
    const nextPath = actionModal?.nextPath;
    setActionModal(null);

    if (nextPath) {
      navigate(nextPath);
    }
  };

  // Ambil token login kreator
  const token =
    auth.getToken() || localStorage.getItem("katasurya_token") || "";

  const resizeCoverImage = (file) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const scale = Math.min(
          1,
          MAX_COVER_WIDTH / image.width,
          MAX_COVER_HEIGHT / image.height,
        );
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);

        const qualities = [0.78, 0.68, 0.58, 0.48];
        const compressed = qualities
          .map((quality) => canvas.toDataURL("image/jpeg", quality))
          .find((dataUrl) => dataUrl.length <= MAX_COVER_PAYLOAD_SIZE);

        resolve(compressed || canvas.toDataURL("image/jpeg", 0.42));
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Gagal memproses gambar cover."));
      };

      image.src = objectUrl;
    });
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File cover harus berupa gambar.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_COVER_FILE_SIZE) {
      setErrorMessage("Ukuran gambar maksimal 5 MB sebelum dikompres.");
      event.target.value = "";
      return;
    }

    try {
      const compressedCover = await resizeCoverImage(file);

      if (compressedCover.length > MAX_COVER_PAYLOAD_SIZE) {
        setErrorMessage(
          "Gambar masih terlalu besar setelah dikompres. Coba gunakan gambar yang lebih kecil.",
        );
        event.target.value = "";
        return;
      }

      setCoverImage(compressedCover);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
      event.target.value = "";
    }
  };

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
      openActionModal({
        tone: "warning",
        eyebrow: "Draft belum lengkap",
        title: "Judul dan isi naskah wajib diisi.",
        message:
          "Lengkapi dua bagian utama ini dulu supaya naskah bisa diterbitkan dengan rapi.",
        confirmLabel: "Lanjut menulis",
      });
      return;
    }

    if (!token) {
      openActionModal({
        tone: "danger",
        eyebrow: "Sesi tidak ditemukan",
        title: "Silakan login kembali.",
        message:
          "Akses penulis diperlukan untuk menyimpan naskah baru atau perubahan naskah.",
        confirmLabel: "Ke halaman login",
        nextPath: "/login",
      });
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
          throw new Error(
            "Sesi telah habis atau otorisasi gagal. Silakan login kembali.",
          );
        }
        throw new Error(data.message || "Gagal menyimpan naskah.");
      }

      // Arahkan ke halaman detail naskah
      const targetSlug = isEditMode ? editSlug : data.data?.slug;
      openActionModal({
        tone: "success",
        eyebrow: isEditMode ? "Perubahan tersimpan" : "Naskah terbit",
        title: isEditMode
          ? "Naskah berhasil diperbarui."
          : "Naskah berhasil diterbitkan.",
        message: isEditMode
          ? "Perubahan terbaru sudah tersimpan dan siap dibaca kembali."
          : "Cerita barumu sudah masuk ke arsip katasurya dan siap dibaca.",
        confirmLabel: "Lihat naskah",
        nextPath: `/cerita/${targetSlug}`,
      });
    } catch (err) {
      setErrorMessage(err.message);
      openActionModal({
        tone: "danger",
        eyebrow: "Gagal menyimpan",
        title: "Naskah belum berhasil disimpan.",
        message: err.message,
        confirmLabel: err.message.includes("login")
          ? "Ke halaman login"
          : "Coba lagi",
        nextPath: err.message.includes("login") ? "/login" : null,
      });
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
    <div className="min-h-screen bg-white text-proseText py-5 sm:py-8 px-4 sm:px-5">
      {/* Top Header Bar */}
      <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-proseBorder pb-4 mb-6 sm:mb-8">
        <Link
          to={isEditMode ? `/cerita/${editSlug}` : "/"}
          className="inline-flex items-center gap-1 text-xs font-sans text-proseMuted hover:text-proseText"
        >
          <ArrowLeft size={14} />
          <span>{isEditMode ? "Batal Edit" : "Kembali ke draft"}</span>
        </Link>

        {/* Stats & Tombol Publish / Save */}
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4">
          <div className="hidden sm:block text-xs font-sans text-proseMuted">
            {wordCount} kata · {readTime}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#1A8917] hover:bg-[#156f13] text-white px-4 py-2 sm:py-1.5 rounded-full text-xs font-sans font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-7 sm:mb-8 p-3 bg-neutral-50 rounded-lg border border-neutral-150 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Sparkles size={14} />
            <span>Kategori:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white border border-neutral-300 rounded px-2 py-2 sm:py-1 text-xs outline-none focus:border-neutral-500"
            >
              <option value="Monolog">Monolog</option>
              <option value="Fiksi">Fiksi</option>
              <option value="Catatan">Catatan</option>
              <option value="Puitis">Puitis</option>
            </select>
          </div>

          <div className="w-full sm:flex-1 sm:min-w-[240px]">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded border border-neutral-300 bg-white px-2.5 py-2 sm:py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-500">
              <span className="truncate">
                {coverImage ? "Ganti cover gambar" : "Upload cover gambar"}
              </span>
              <span className="shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                Pilih File
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {coverImage && (
          <div className="mb-7 sm:mb-8 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            <img
              src={coverImage}
              alt="Preview cover cerita"
              className="h-52 w-full object-cover sm:h-64"
            />
            <div className="flex items-center justify-between gap-3 px-3 py-2 font-sans text-[11px] text-neutral-500">
              <span>Preview cover cerita</span>
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="font-medium text-red-600 hover:text-red-700"
              >
                Hapus cover
              </button>
            </div>
          </div>
        )}

        {/* Input Judul */}
        <textarea
          rows={1}
          placeholder="Judul Cerita..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full font-serif text-[34px] sm:text-5xl font-bold tracking-tight text-proseText placeholder:text-neutral-300 outline-none resize-none mb-5 sm:mb-6 border-none focus:ring-0 leading-tight"
        />

        {/* Input Isi Naskah */}
        <textarea
          rows={18}
          placeholder="Mulai tulis ceritamu di sini... (Mendukung format Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full font-serif text-[18px] sm:text-xl text-proseText placeholder:text-neutral-300 outline-none resize-y leading-[1.8] sm:leading-[1.85] border-none focus:ring-0 min-h-[360px] sm:min-h-[450px]"
        />
      </main>

      {actionModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8 font-sans">
          <button
            type="button"
            aria-label="Tutup modal"
            onClick={closeActionModal}
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl">
            <div
              className={`absolute -right-14 -top-14 h-36 w-36 rounded-full blur-2xl ${
                actionModal.tone === "success"
                  ? "bg-emerald-200/70"
                  : actionModal.tone === "warning"
                    ? "bg-amber-200/70"
                    : "bg-red-200/70"
              }`}
            />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-neutral-200 blur-2xl" />

            <div className="relative p-6 sm:p-7">
              <div
                className={`mb-5 inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                  actionModal.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : actionModal.tone === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {actionModal.eyebrow}
              </div>

              <h2 className="font-serif text-3xl font-bold leading-tight text-neutral-950">
                {actionModal.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                {actionModal.message}
              </p>

              <button
                type="button"
                onClick={closeActionModal}
                className="mt-7 w-full rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800"
              >
                {actionModal.confirmLabel || "Mengerti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
