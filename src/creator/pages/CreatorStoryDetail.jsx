import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link, useParams } from "react-router-dom";
import { communityApi, getAvatarUrl } from "../services/communityApi";

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
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
        Memuat cerita komunitas...
      </div>
    );
  }

  if (errorMessage || !story) {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center">
        <h1 className="font-serif text-2xl font-bold">Cerita tidak ditemukan.</h1>
        <p className="mt-2 text-sm text-neutral-500">{errorMessage}</p>
        <Link to="/creator" className="mt-5 inline-flex text-sm underline">
          Kembali ke komunitas
        </Link>
      </div>
    );
  }

  const authorName =
    story.author?.pen_name || story.author?.name || story.author || "Penulis Aksara";
  const authorAvatar = getAvatarUrl(story.author?.avatar);
  const authorInitial = authorName.charAt(0).toUpperCase() || "P";
  const cleanContent = DOMPurify.sanitize(story.content || "");

  return (
    <article className="rounded-[28px] border border-neutral-200 bg-white px-5 py-8 shadow-sm md:px-10 md:py-12">
      <header className="mx-auto max-w-prose border-b border-neutral-100 pb-8">
        <Link
          to="/creator"
          className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 transition hover:text-neutral-950"
        >
          Komunitas Aksara
        </Link>

        <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-neutral-950 md:text-5xl">
          {story.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-2 text-neutral-900">
            <AuthorAvatar
              avatarUrl={authorAvatar}
              authorName={authorName}
              authorInitial={authorInitial}
            />
            <span className="font-medium">{authorName}</span>
          </span>
          <span>·</span>
          <span>{formatDate(story.created_at)}</span>
          <span>·</span>
          <span>{story.read_time || 1} menit baca</span>
          {story.word_count && (
            <>
              <span>·</span>
              <span>{story.word_count} kata</span>
            </>
          )}
          {story.category && (
            <>
              <span>·</span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                {story.category}
              </span>
            </>
          )}
        </div>
      </header>

      <div
        className="prose prose-neutral mx-auto mt-10 max-w-prose font-serif text-lg leading-relaxed prose-blockquote:border-l-neutral-900 prose-blockquote:text-neutral-600 prose-h2:font-serif prose-p:my-5"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      <footer className="mx-auto mt-12 max-w-prose border-t border-neutral-100 pt-8">
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
  );
}
