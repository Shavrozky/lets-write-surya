import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Edit3, Share2 } from "lucide-react";
import { communityApi, getAvatarUrl } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import ReadingProgressBar from "../components/ReadingProgressBar";

const formatDate = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

function AuthorAvatar({ avatarUrl, authorName, authorInitial }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xs font-semibold text-white">
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt={authorName}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        authorInitial
      )}
    </span>
  );
}

export default function CreatorStoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCommunityAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [readingTheme, setReadingTheme] = useState("light");
  const [fontSize, setFontSize] = useState("md");
  const [textAlign, setTextAlign] = useState("left");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2400);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/creator");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Tautan cerita berhasil disalin");
  };

  useEffect(() => {
    let isMounted = true;

    communityApi
      .getStory(id)
      .then((data) => {
        if (isMounted) {
          setStory(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white transition-colors duration-300">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center text-sm text-neutral-400 sm:max-w-3xl sm:px-6">
          Memuat cerita komunitas...
        </div>
      </div>
    );
  }

  if (errorMessage || !story) {
    return (
      <div className="w-full min-h-screen bg-white transition-colors duration-300">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:max-w-3xl sm:px-6">
          <h1 className="font-serif text-2xl font-bold">
            Cerita tidak ditemukan.
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{errorMessage}</p>
          <Link to="/creator" className="mt-5 inline-flex text-sm underline">
            Kembali ke komunitas
          </Link>
        </div>
      </div>
    );
  }

  const authorName =
    story.author?.pen_name ||
    story.author?.name ||
    story.author ||
    "Penulis Aksara";
  const authorAvatar = getAvatarUrl(story.author?.avatar);
  const authorInitial = authorName.charAt(0).toUpperCase() || "P";
  const coverImage = story.cover_image;
  const cleanContent = DOMPurify.sanitize(story.content || "");
  const isAdmin = user?.role === "admin";
  const isOwner = Boolean(
    user?.id &&
    (story.author_id === user.id ||
      story.author?.id === user.id ||
      story.user_id === user.id),
  );
  const canEditStory = Boolean(
    isAuthenticated && story.id && (isAdmin || isOwner),
  );
  const themeStyles = {
    light: {
      bg: "bg-white",
      text: "text-neutral-900",
      muted: "text-neutral-500",
      border: "border-neutral-150",
      active: "bg-neutral-100 font-semibold text-neutral-900",
    },
    paper: {
      bg: "bg-[#fbf7ee]",
      text: "text-[#2d2926]",
      muted: "text-[#766c61]",
      border: "border-[#e7ddcc]",
      active: "bg-[#efe6d6] font-semibold text-[#2d2926]",
    },
    dark: {
      bg: "bg-[#18181b]",
      text: "text-[#e4e4e7]",
      muted: "text-[#a1a1aa]",
      border: "border-[#3f3f46]",
      active: "bg-[#27272a] font-semibold text-[#f4f4f5]",
    },
  };
  const currentTheme = themeStyles[readingTheme];
  const controlClass = `rounded-full border px-3 py-1 flex items-center gap-2 text-xs font-sans transition ${
    readingTheme === "dark"
      ? "border-neutral-700 text-neutral-300"
      : "border-neutral-200 text-neutral-600"
  }`;
  const optionClass = (isActive) =>
    `rounded-full px-2 py-0.5 transition ${
      isActive ? currentTheme.active : "hover:text-neutral-900"
    }`;
  const fontSizeClass = {
    sm: "text-[19px] leading-[2.05]",
    md: "text-[22px] leading-[2.08]",
    lg: "text-[25px] leading-[2.1]",
  }[fontSize];
  const textAlignClass = {
    left: "text-left prose-p:text-left prose-li:text-left",
    center: "text-center prose-p:text-center prose-li:text-center",
    right: "text-right prose-p:text-right prose-li:text-right",
  }[textAlign];

  return (
    <main
      className={`w-full min-h-screen transition-colors duration-300 ${currentTheme.bg} ${currentTheme.text}`}
    >
      {/* Indikator Membaca Mengambang di Paling Atas Layar */}
      <ReadingProgressBar theme={readingTheme} />

      <div
        className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs text-white shadow-lg transition-all duration-300 ease-out ${
          toastMessage
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <Check size={14} className="text-emerald-400" />
        <span>{toastMessage}</span>
      </div>

      <article className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 pb-24">
        <div
          className={`mb-8 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${currentTheme.border}`}
        >
          <button
            type="button"
            onClick={handleBack}
            className={`text-sm font-sans transition hover:opacity-70 ${currentTheme.muted}`}
          >
            ← Kembali
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <div className={controlClass}>
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                className={optionClass(fontSize === "sm")}
              >
                A⁻
              </button>
              <button
                type="button"
                onClick={() => setFontSize("md")}
                className={optionClass(fontSize === "md")}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={optionClass(fontSize === "lg")}
              >
                A⁺
              </button>
            </div>
            <div className={controlClass}>
              <button
                type="button"
                onClick={() => setReadingTheme("light")}
                className={optionClass(readingTheme === "light")}
              >
                Putih
              </button>
              <button
                type="button"
                onClick={() => setReadingTheme("paper")}
                className={optionClass(readingTheme === "paper")}
              >
                Kertas
              </button>
              <button
                type="button"
                onClick={() => setReadingTheme("dark")}
                className={optionClass(readingTheme === "dark")}
              >
                Malam
              </button>
            </div>
            <div className={controlClass}>
              <button
                type="button"
                onClick={() => setTextAlign("left")}
                className={optionClass(textAlign === "left")}
              >
                Kiri
              </button>
              <button
                type="button"
                onClick={() => setTextAlign("center")}
                className={optionClass(textAlign === "center")}
              >
                Tengah
              </button>
              <button
                type="button"
                onClick={() => setTextAlign("right")}
                className={optionClass(textAlign === "right")}
              >
                Kanan
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={controlClass}
            >
              <Share2 size={13} />
              <span>Bagikan</span>
            </button>
            {canEditStory && (
              <Link
                to={`/creator/write?id=${story.id}`}
                className={controlClass}
              >
                <Edit3 size={13} />
                <span>Edit Cerita</span>
              </Link>
            )}
          </div>
        </div>

        <header className={`border-b pb-8 ${currentTheme.border}`}>
          <Link
            to="/creator"
            className="mb-3 block text-xs font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 transition hover:text-neutral-950"
          >
            {story.category || "Komunitas Aksara"}
          </Link>

          <h1 className="mb-6 font-serif text-3xl font-bold leading-tight sm:text-5xl">
            {story.title}
          </h1>

          <div
            className={`flex flex-wrap items-center gap-x-2 gap-y-2 font-sans text-sm ${currentTheme.muted}`}
          >
            <AuthorAvatar
              avatarUrl={authorAvatar}
              authorName={authorName}
              authorInitial={authorInitial}
            />
            <span className="font-medium">{authorName}</span>
            <span>·</span>
            <span>{formatDate(story.created_at)}</span>
            <span>·</span>
            <span>{story.read_time || 1} menit baca</span>
            {story.category && (
              <>
                <span>·</span>
                <span>{story.category}</span>
              </>
            )}
          </div>
        </header>

        <div
          className={`prose mt-10 max-w-none font-serif prose-blockquote:border-l-neutral-900 prose-h2:font-serif prose-p:my-5 ${fontSizeClass} ${textAlignClass} ${
            readingTheme === "dark" ? "prose-invert" : "prose-neutral"
          }`}
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {coverImage && (
          <div className="mt-10 overflow-hidden rounded-xl">
            <img
              src={coverImage}
              alt={story.title}
              className="max-h-[440px] w-full object-cover"
            />
          </div>
        )}

        <footer className={`mt-12 border-t pt-8 ${currentTheme.border}`}>
          {story.author?.bio && (
            <div className="mb-6 rounded-2xl bg-neutral-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                Tentang penulis
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {story.author.bio}
              </p>
            </div>
          )}

          <Link
            to="/creator"
            className="inline-flex rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            Kembali ke Beranda Komunitas
          </Link>
        </footer>
      </article>
    </main>
  );
}
