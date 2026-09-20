// src/components/StoryCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../creator/services/communityApi";
import { useCommunityAuth } from "../creator/context/CommunityAuthContext";
import { getReadingStats } from "../utils/readingTime";

const SURYA_DEFAULT_AVATAR = "/suryanata.jpg";

function AuthorAvatar({ avatarUrl, authorName, authorInitial }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
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

export default function StoryCard({ story }) {
  const { user } = useCommunityAuth();
  const { readTime } = getReadingStats(story.content);
  const detailPath = story.detailPath || `/cerita/${story.slug}`;
  const authorName =
    story.author?.pen_name || story.author?.name || story.author || "Surya";
  const isSuryaStory = authorName.toLowerCase() === "surya";
  const loggedInName = user?.pen_name || user?.name || "";
  const loggedInIsSurya = loggedInName.toLowerCase() === "surya";
  const authorAvatar = getAvatarUrl(
    story.author?.avatar ||
      (isSuryaStory && loggedInIsSurya ? user?.avatar : null) ||
      (isSuryaStory ? SURYA_DEFAULT_AVATAR : null),
  );
  const authorInitial = authorName.charAt(0).toUpperCase() || "S";

  return (
    <article className="py-6 sm:py-7 border-b border-proseBorder flex items-start justify-between gap-4 sm:gap-6 group">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-sans text-proseMuted mb-2">
          <span className="inline-flex items-center gap-1.5 text-neutral-900">
            <AuthorAvatar
              avatarUrl={authorAvatar}
              authorName={authorName}
              authorInitial={authorInitial}
            />
            <span className="font-medium">{authorName}</span>
          </span>
          <span>·</span>
          <span>{story.date}</span>
          <span>·</span>
          <span>{readTime}</span>
          <span>·</span>
          <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] sm:text-[11px]">
            {story.category}
          </span>
        </div>

        <Link to={detailPath}>
          <h2 className="font-serif font-bold text-[21px] sm:text-2xl text-proseText group-hover:text-neutral-600 transition-colors leading-snug mb-2">
            {story.title}
          </h2>
        </Link>

        <p className="font-serif text-proseMuted text-[15px] sm:text-base line-clamp-3 sm:line-clamp-2 leading-relaxed mb-3">
          {story.excerpt}
        </p>
      </div>

      {story.coverImage && (
        <Link to={detailPath} className="flex-shrink-0">
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
