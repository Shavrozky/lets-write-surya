// src/components/StoryCard.jsx
import { Link } from "react-router-dom";
import { getReadingStats } from "../utils/readingTime";

export default function StoryCard({ story }) {
  const { readTime } = getReadingStats(story.content);

  return (
    <article className="py-6 sm:py-7 border-b border-proseBorder flex items-start justify-between gap-4 sm:gap-6 group">
      <div className="min-w-0 flex-1">
        {/* Meta Dinamis */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-sans text-proseMuted mb-2">
          <span>{story.date}</span>
          <span>·</span>
          <span>{readTime}</span>
          <span>·</span>
            <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] sm:text-[11px]">
            {story.category}
          </span>
        </div>

        {/* Title */}
        <Link to={`/cerita/${story.slug}`}>
          <h2 className="font-serif font-bold text-[21px] sm:text-2xl text-proseText group-hover:text-neutral-600 transition-colors leading-snug mb-2">
            {story.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="font-serif text-proseMuted text-[15px] sm:text-base line-clamp-3 sm:line-clamp-2 leading-relaxed mb-3">
          {story.excerpt}
        </p>
      </div>

      {/* Thumbnail */}
      {story.coverImage && (
        <Link to={`/cerita/${story.slug}`} className="flex-shrink-0">
          <div className="w-20 h-20 min-[380px]:w-24 min-[380px]:h-24 sm:w-32 sm:h-28 rounded-sm overflow-hidden bg-neutral-100">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}
    </article>
  );
}
