import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { communityApi } from "../services/communityApi";

export default function CreatorStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("community_token")) {
      navigate("/creator/auth?mode=signin", { replace: true });
      return;
    }

    let isMounted = true;

    communityApi
      .getMyStories()
      .then((data) => {
        if (isMounted) {
          setStories(data.data || []);
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
  }, [navigate]);

  const drafts = stories.filter((story) => story.status === "draft");
  const published = stories.filter((story) => story.status === "published");

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-8">
      <div className="mb-6 border-b border-neutral-100 pb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Dashboard Penulis
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold">Stories milikmu.</h1>
      </div>

      {loading && <p className="text-sm text-neutral-400">Memuat tulisan...</p>}
      {!loading && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      {!loading && !errorMessage && stories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center">
          <p className="font-serif text-xl font-semibold">
            Belum ada tulisan komunitas.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Draf dan tulisan yang kamu publish akan tampil di sini.
          </p>
          <Link
            to="/creator/write"
            className="mt-5 inline-flex rounded-full bg-neutral-950 px-5 py-2 text-xs font-medium text-white"
          >
            Tulis sekarang
          </Link>
        </div>
      )}

      {!loading && !errorMessage && stories.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <StoryColumn title="Draft" stories={drafts} />
          <StoryColumn title="Published" stories={published} />
        </div>
      )}
    </div>
  );
}

function StoryColumn({ title, stories }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {title}
      </h2>
      <div className="space-y-3">
        {stories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-5 text-sm text-neutral-400">
            Belum ada tulisan.
          </div>
        )}
        {stories.map((story) => (
          <article key={story.id} className="rounded-2xl border border-neutral-200 p-4">
            <h3 className="font-serif text-xl font-bold">{story.title}</h3>
            <p className="mt-2 text-xs text-neutral-500">
              {story.read_time || 1} menit baca · {story.status}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
