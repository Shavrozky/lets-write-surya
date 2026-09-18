import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useNavigate } from "react-router-dom";
import { communityApi } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";

const toolbarButtons = [
  { label: "Bold", action: "bold" },
  { label: "Italic", action: "italic" },
  { label: "Quote", action: "blockquote" },
  { label: "H2", action: "heading" },
];

export default function CreatorWrite() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useCommunityAuth();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const runToolbarAction = (action) => {
    if (!editor) return;

    if (action === "heading") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    }

    editor.chain().focus()[`toggle${action[0].toUpperCase()}${action.slice(1)}`]().run();
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
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await communityApi.createStory({
        title,
        content: htmlContent,
        status,
      });
      navigate("/creator/stories");
    } catch (err) {
      setErrorMessage(err.message);
      if (err.message.toLowerCase().includes("unauthenticated")) {
        navigate("/creator/auth?mode=signin");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
        Memeriksa sesi penulis...
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Editor Komunitas
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold">Tulis kisahmu.</h1>
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
            {loading ? "Menyimpan..." : status === "published" ? "Publish" : "Simpan Draft"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

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
