// src/creator/pages/CreatorWrite.jsx
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  X,
  Bold,
  Italic,
  Quote,
  Heading2,
} from "lucide-react";
import { communityApi } from "../services/communityApi";

export default function CreatorWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [coverImage, setCoverImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea judul
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || "teks"}${suffix}`;

    setContent(
      content.substring(0, start) + replacement + content.substring(end),
    );
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4),
      );
    }, 0);
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (submitStatus = status) => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage("Judul dan isi naskah tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await communityApi.createStory({
        title,
        content,
        status: submitStatus,
        cover_image: coverImage || null,
      });
      navigate("/creator/stories");
    } catch (err) {
      setErrorMessage(err.message || "Gagal menyimpan tulisan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Top Bar Minimalis */}
      <nav className="sticky top-0 z-30 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <Link
            to="/creator/stories"
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-neutral-900"
          >
            <ArrowLeft size={15} />
            <span>Daftar Cerita</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
              className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              Simpan Draf
            </button>

            <button
              onClick={() => handleSubmit("published")}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-full bg-[#1A8917] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#156f13] shadow-sm disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              <span>Publikasikan</span>
            </button>
          </div>
        </div>
      </nav>

      {errorMessage && (
        <div className="mx-auto max-w-3xl px-6 pt-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Kanvas Naskah Bebas Border */}
      <main className="mx-auto max-w-3xl px-6 pt-10 pb-32">
        {/* Upload Sampul Minimalis */}
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
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Judul Auto-expand */}
        <textarea
          rows={1}
          placeholder="Judul Cerita..."
          value={title}
          onChange={handleTitleChange}
          className="w-full resize-none border-none bg-transparent font-serif text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 placeholder:text-neutral-300 focus:outline-none focus:ring-0 leading-tight mb-4"
        />

        {/* Toolbar Format Ringan */}
        <div className="sticky top-[58px] z-20 flex items-center gap-1 border-y border-neutral-100 bg-white/95 py-2 mb-6 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => insertMarkdown("**", "**")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Tebal"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("*", "*")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Miring"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("\n> ", "\n")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Kutipan"
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("\n## ", "\n")}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Subjudul"
          >
            <Heading2 size={16} />
          </button>
        </div>

        {/* Area Naskah Utama */}
        <textarea
          ref={textareaRef}
          rows={18}
          placeholder="Mulai tulis ceritamu..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-none border-none bg-transparent font-serif text-[18px] sm:text-[20px] leading-[2.1] text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-0 min-h-[500px]"
        />
      </main>
    </div>
  );
}
