import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useNavigate, useSearchParams } from "react-router-dom";
import { communityApi } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import FeedbackModal from "../components/FeedbackModal";

const MAX_COVER_FILE_SIZE = 5 * 1024 * 1024;
const MAX_COVER_PAYLOAD_SIZE = 700 * 1024;
const MAX_COVER_WIDTH = 1200;
const MAX_COVER_HEIGHT = 720;

const toolbarButtons = [
  { label: "Bold", action: "bold" },
  { label: "Italic", action: "italic" },
  { label: "Quote", action: "blockquote" },
  { label: "H2", action: "heading" },
];

export default function CreatorWrite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);
  const { isAuthenticated, isLoading } = useCommunityAuth();
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[360px] px-1 py-4 font-serif text-xl leading-relaxed outline-none prose-blockquote:border-l-neutral-900 prose-blockquote:text-neutral-600",
      },
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/creator/auth?mode=signin", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!editor || !isAuthenticated || !editId) return;

    let isMounted = true;
    setLoadingStory(true);
    setErrorMessage("");

    communityApi
      .getStory(editId)
      .then((story) => {
        if (!isMounted) return;

        setTitle(story.title || "");
        setCoverImage(story.cover_image || "");
        setStatus(story.status || "draft");
        editor.commands.setContent(story.content || "");
      })
      .catch((err) => {
        if (!isMounted) return;

        setErrorMessage(err.message);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingStory(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [editId, editor, isAuthenticated]);

  const runToolbarAction = (action) => {
    if (!editor) return;

    if (action === "heading") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    }

    editor.chain().focus()[`toggle${action[0].toUpperCase()}${action.slice(1)}`]().run();
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

  const isActionActive = (action) => {
    if (!editor) return false;

    return action === "heading"
      ? editor.isActive("heading", { level: 2 })
      : editor.isActive(action);
  };

  const handleSubmit = async () => {
    const htmlContent = editor?.getHTML() || "";
    const textContent = editor?.getText().trim() || "";

    if (!title.trim() || !textContent) {
      setErrorMessage("Judul dan isi cerita wajib diisi.");
      setFeedback({
        tone: "danger",
        eyebrow: "Draft belum lengkap",
        title: "Judul dan isi cerita wajib diisi.",
        message: "Lengkapi dua bagian utama ini sebelum menyimpan cerita.",
      });
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        title,
        content: htmlContent,
        cover_image: coverImage.trim() || null,
        status,
      };

      if (isEditMode) {
        await communityApi.updateStory(editId, payload);
        setFeedback({
          tone: "success",
          eyebrow: "Perubahan tersimpan",
          title: "Cerita berhasil diperbarui.",
          message: "Versi terbaru cerita sudah tersimpan dan siap dibaca kembali.",
          secondaryLabel: "Lanjut Menulis",
          confirmLabel: "Lihat cerita",
          nextPath: `/creator/stories/${editId}`,
        });
      } else {
        const data = await communityApi.createStory(payload);
        setFeedback({
          tone: "success",
          eyebrow: status === "published" ? "Cerita terbit" : "Draft tersimpan",
          title: status === "published" ? "Cerita berhasil dipublikasikan." : "Draft berhasil disimpan.",
          message: "Cerita sudah masuk ke ruang komunitas Aksara.",
          secondaryLabel: "Lanjut Menulis",
          confirmLabel: "Lihat cerita",
          nextPath: data.data?.id ? `/creator/stories/${data.data.id}` : "/creator/stories",
        });
      }
    } catch (err) {
      setErrorMessage(err.message);
      setFeedback({
        tone: "danger",
        eyebrow: "Gagal menyimpan",
        title: "Cerita belum berhasil disimpan.",
        message: err.message,
      });
      if (err.message.toLowerCase().includes("unauthenticated")) {
        navigate("/creator/auth?mode=signin");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loadingStory) {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
        {isLoading ? "Memeriksa sesi penulis..." : "Memuat cerita untuk diedit..."}
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-8">
      <FeedbackModal
        feedback={feedback}
        onClose={() => setFeedback(null)}
        onPrimary={() => {
          const nextPath = feedback?.nextPath;
          setFeedback(null);
          if (nextPath) navigate(nextPath);
        }}
      />

      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Editor Komunitas
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold">
            {isEditMode ? "Edit cerita." : "Tulis kisahmu."}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-neutral-200 px-3 py-2 text-xs outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading
              ? "Menyimpan..."
              : isEditMode
                ? "Perbarui Cerita"
                : status === "published"
                  ? "Publish"
                  : "Simpan Draft"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500 transition hover:border-neutral-400">
          <span className="truncate">
            {coverImage ? "Ganti cover cerita" : "Upload cover cerita"}
          </span>
          <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
            Pilih File
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="sr-only"
          />
        </label>

        {coverImage && (
          <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <img
              src={coverImage}
              alt="Preview cover cerita"
              className="h-52 w-full object-cover sm:h-64"
            />
            <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-neutral-500">
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
      </div>

      <textarea
        rows={1}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Judul cerita..."
        className="w-full resize-none border-none bg-transparent font-serif text-4xl font-bold leading-tight outline-none placeholder:text-neutral-300"
      />

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-2">
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 px-2 pb-2">
          {toolbarButtons.map((button) => (
            <button
              key={button.action}
              type="button"
              onClick={() => runToolbarAction(button.action)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isActionActive(button.action)
                  ? "bg-neutral-950 text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
