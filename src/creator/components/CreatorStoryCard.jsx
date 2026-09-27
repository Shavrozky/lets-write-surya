import { Link } from "react-router-dom";

const formatDate = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const stripHtml = (html = "") => {
  if (typeof window !== "undefined" && window.DOMParser) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  return html.replace(/<[^>]*>/g, " ");
};

const createExcerpt = (content = "") => {
  const plainText = stripHtml(content)
    .replace(/[#*_>`\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > 150 ? `${plainText.slice(0, 150)}...` : plainText;
};

export default function CreatorStoryCard({ story }) {
  const authorName =
    story.author?.pen_name || story.author?.name || "Penulis Aksara";

  return (
    <article className="border-b border-neutral-100 p-5 last:border-b-0">
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span>{authorName}</span>
        <span>·</span>
        <span>{story.read_time || 1} menit baca</span>
        <span>·</span>
        <span>{formatDate(story.created_at)}</span>
      </div>

      <Link to={`/creator/stories/${story.id}`}>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-snug text-neutral-950 transition hover:text-neutral-600">
          {story.title}
        </h2>
      </Link>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">
        {createExcerpt(story.content)}
      </p>
    </article>
  );
}
