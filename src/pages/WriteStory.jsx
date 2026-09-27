import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  X,
  Bold,
  Italic,
  Quote,
  Heading2,
  Sparkles,
} from "lucide-react";
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
  const [status, setStatus] = useState("draft"); // 'draft' atau 'published'
  const [coverImage, setCoverImage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionModal, setActionModal] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const { wordCount, readTime } = getReadingStats(content);

  const token =
    auth.getToken() || localStorage.getItem("katasurya_token") || "";

  // Auto-resize textarea judul
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Helper untuk menyisipkan format Markdown
  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || "teks"}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4),
      );
    }, 0);
  };

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
      setErrorMessage("Ukuran gambar maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      const compressedCover = await resizeCoverImage(file);
      setCoverImage(compressedCover);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    if (!isEditMode) return;

    setIsLoadingStory(true);
    fetch(`${API_BASE_URL}/stories/${editSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data naskah.");
        return res.json();
      })
      .then((data) => {
        const item = data.data || data;
        setTitle(item.title || "");
        setContent(item.content || "");
        setCategory(item.category || "Monolog");
        setStatus(item.status || "draft");
        setCoverImage(item.coverImage || item.cover_image || "");
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setIsLoadingStory(false));
  }, [isEditMode, editSlug, API_BASE_URL]);

  const handleSubmit = async (submitStatus = status) => {
    if (!title.trim() || !content.trim()) {
      setActionModal({
        tone: "warning",
        eyebrow: "Draf Belum Lengkap",
        title: "Judul dan naskah wajib diisi.",
        message: "Lengkapi judul dan isi tulisan terlebih dahulu.",
        confirmLabel: "Lanjut Menulis",
      });
      return;
    }

    if (!token) {
      setActionModal({
        tone: "danger",
        eyebrow: "Sesi Habis",
        title: "Silakan login kembali.",
        message: "Akses penulis diperlukan untuk menyimpan naskah.",
        confirmLabel: "Ke Halaman Login",
        nextPath: "/creator/auth?mode=signin",
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

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
          status: submitStatus,
          coverImage: coverImage.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          auth.logout();
          throw new Error("Sesi telah habis. Silakan login kembali.");
        }
        throw new Error(data.message || "Gagal menyimpan naskah.");
      }

      const targetSlug = isEditMode ? editSlug : data.data?.slug || data.slug;
      setActionModal({
        tone: "success",
        eyebrow:
          submitStatus === "published" ? "Naskah Terbit" : "Draf Tersimpan",
        title:
          submitStatus === "published"
            ? "Ceritamu berhasil dipublikasikan."
            : "Draf berhasil disimpan.",
        message:
          submitStatus === "published"
            ? "Cerita sudah tayang dan siap dibaca oleh komunitas."
            : "Perubahan naskah tersimpan dengan aman.",
        confirmLabel:
          submitStatus === "published" ? "Lihat Cerita" : "Lanjut Menulis",
        nextPath: submitStatus === "published" ? `/cerita/${targetSlug}` : null,
      });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStory) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-sm font-sans text-neutral-400">
        <Loader2 className="animate-spin mr-2" size={16} /> Memuat naskah...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-200">
      {/* ================= BILAH HEADER ATAS ================= */}
      <nav className="sticky top-0 z-30 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          {/* Sisi Kiri: Kembali & Indikator Kategori */}
          <div className="flex items-center gap-4">
            <Link
              to="/creator/stories"
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-neutral-900"
            >
              <ArrowLeft size={15} />
              <span>Kembali</span>
            </Link>

            <span className="h-3.5 w-px bg-neutral-200" />

            {/* Pemilih Kategori Berbentuk Kapsul Bersahaja */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Sparkles size={13} className="text-neutral-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="cursor-pointer rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 outline-none transition hover:border-neutral-300 focus:border-neutral-900"
              >
                <option value="Monolog">Monolog</option>
                <option value="Fiksi">Fiksi</option>
                <option value="Catatan">Catatan</option>
                <option value="Puitis">Puitis</option>
              </select>
            </div>
          </div>

          {/* Sisi Kanan: Statistik & Tombol Aksi */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline-block text-xs font-sans text-neutral-400">
              {wordCount} kata · {readTime}
            </span>

            {/* Tombol Simpan Draf */}
            <button
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
              className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50"
            >
              Simpan Draf
            </button>

            {/* Tombol Publikasi Hijau/Hitam Ala Medium */}
            <button
              onClick={() => handleSubmit("published")}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-full bg-[#1A8917] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#156f13] shadow-sm disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              <span>{isEditMode ? "Perbarui" : "Publikasikan"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ================= PESAN KESALAHAN ================= */}
      {errorMessage && (
        <div className="mx-auto max-w-3xl px-6 pt-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600">
            {errorMessage}
          </div>
        </div>
      )}

      {/* ================= KANVAS PENULISAN (SEAMLESS) ================= */}
      <main className="mx-auto max-w-3xl px-6 pt-10 pb-36">
        {/* Kontrol Sampul Gambar (Minimalis) */}
        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />

          {!coverImage ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 px-3 py-1 text-xs text-neutral-400 transition hover:border-neutral-500 hover:text-neutral-700"
            >
              <ImageIcon size={14} />
              <span>+ Tambah Gambar Sampul</span>
            </button>
          ) : (
            <div className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
              <img
                src={coverImage}
                alt="Sampul cerita"
                className="max-h-[360px] w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-900 shadow hover:bg-white"
                >
                  Ganti Sampul
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                  title="Hapus sampul"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bidang Judul (Auto-expand, Tanpa Garis Tepi) */}
        <textarea
          rows={1}
          placeholder="Judul Cerita..."
          value={title}
          onChange={handleTitleChange}
          className="w-full resize-none border-none bg-transparent font-serif text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 placeholder:text-neutral-300 focus:outline-none focus:ring-0 leading-tight mb-4"
        />

        {/* Toolbar Format Teks Tipis */}
        <div className="sticky top-[60px] z-20 flex items-center gap-1 border-y border-neutral-100 bg-white/95 py-2 mb-6 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => insertMarkdown("**", "**")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Tebal (Bold)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("*", "*")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Miring (Italic)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("\n> ", "\n")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Kutipan (Quote)"
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("\n## ", "\n")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Subjudul (H2)"
          >
            <Heading2 size={16} />
          </button>
        </div>

        {/* Kanvas Teks Utama (Bebas Border, Tipografi Nyaman) */}
        <textarea
          ref={textareaRef}
          rows={20}
          placeholder="Tuliskan kisahmu di sini... Biarkan kata-kata mengalir tenang."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-none border-none bg-transparent font-serif text-[18px] sm:text-[20px] leading-[2.1] text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-0 min-h-[500px]"
        />
      </main>

      {/* ================= MODAL NOTIFIKASI ================= */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActionModal(null)}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          />

          <div className="relative w-full max-w-sm rounded-[28px] bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-2">
              {actionModal.eyebrow}
            </p>

            <h3 className="font-serif text-xl font-bold text-neutral-900 mb-2">
              {actionModal.title}
            </h3>

            <p className="text-xs leading-relaxed text-neutral-500 mb-6">
              {actionModal.message}
            </p>

            <button
              type="button"
              onClick={() => {
                const next = actionModal.nextPath;
                setActionModal(null);
                if (next) navigate(next);
              }}
              className="w-full rounded-full bg-neutral-950 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800"
            >
              {actionModal.confirmLabel || "Mengerti"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
