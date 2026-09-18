import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityApi } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";

export default function CreatorAdmin() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useCommunityAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStories = () => {
    setLoading(true);
    setErrorMessage("");

    communityApi
      .getAdminStories()
      .then((data) => setStories(data.data || []))
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/creator/auth?mode=signin", { replace: true });
      return;
    }

    if (user?.role !== "admin") {
      setErrorMessage("Akses ditolak.");
      setLoading(false);
      return;
    }

    loadStories();
  }, [isAuthenticated, isLoading, navigate, user?.role]);

  const runAction = async (action) => {
    setErrorMessage("");

    try {
      await action();
      loadStories();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-8">
      <div className="mb-6 border-b border-neutral-100 pb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Moderasi Komunitas
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold">Admin Aksara.</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Tinjau tulisan masuk, sembunyikan konten bermasalah, hapus spam, atau
          blokir penulis yang menyalahgunakan ruang komunitas.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-neutral-400">Memuat antrean moderasi...</p>
      ) : stories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
          Belum ada tulisan untuk dimoderasi.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <div className="hidden grid-cols-[1.5fr_1fr_110px_220px] gap-4 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 md:grid">
            <span>Judul</span>
            <span>Penulis</span>
            <span>Status</span>
            <span>Aksi</span>
          </div>

          {stories.map((story) => (
            <article
              key={story.id}
              className="grid gap-3 border-t border-neutral-100 px-4 py-4 text-sm md:grid-cols-[1.5fr_1fr_110px_220px] md:items-center"
            >
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-950">
                  {story.title}
                </h2>
                <p className="mt-1 line-clamp-1 text-xs text-neutral-400">
                  Updated {new Date(story.updated_at).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="text-xs text-neutral-500">
                <p className="font-medium text-neutral-800">
                  {story.author?.pen_name || story.author?.name || "-"}
                </p>
                <p className="truncate">{story.author?.email}</p>
                {story.author?.is_banned && (
                  <p className="mt-1 font-medium text-red-600">Banned</p>
                )}
              </div>

              <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {story.status}
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    runAction(() => communityApi.hideAdminStory(story.id))
                  }
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:border-neutral-400"
                >
                  Sembunyikan
                </button>
                <button
                  onClick={() =>
                    runAction(() => communityApi.deleteAdminStory(story.id))
                  }
                  className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Hapus
                </button>
                {story.author?.id && !story.author?.is_banned && (
                  <button
                    onClick={() =>
                      runAction(() => communityApi.banAdminUser(story.author.id))
                    }
                    className="rounded-full border border-amber-200 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                  >
                    Ban User
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
