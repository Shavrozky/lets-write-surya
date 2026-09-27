import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit3, ExternalLink, PenLine } from "lucide-react";
import { communityApi } from "../services/communityApi";

export default function CreatorStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("drafts"); // 'drafts' atau 'published'

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
          const list = data.data || [];
          setStories(list);
          // Jika tidak ada draft tapi ada published, otomatis arahkan ke tab published
          const hasDrafts = list.some((item) => item.status === "draft");
          if (!hasDrafts && list.length > 0) {
            setActiveTab("published");
          }
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
  const currentList = activeTab === "drafts" ? drafts : published;

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-white px-6 sm:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
              Dashboard Penulis
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Stories milikmu
            </h1>
          </div>

          <Link
            to="/creator/write"
            className="inline-flex items-center gap-2 self-start rounded-full bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 shadow-sm"
          >
            <PenLine size={14} />
            <span>Tulis Cerita</span>
          </Link>
        </div>

        {/* ================= TAB NAVIGASI HORIZONTAL ================= */}
        <div className="flex items-center gap-8 border-b border-neutral-200/80 mt-6 text-sm font-sans">
          <button
            onClick={() => setActiveTab("drafts")}
            className={`pb-3 font-medium transition-all relative ${
              activeTab === "drafts"
                ? "text-neutral-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            Drafts{" "}
            <span className="ml-1 text-xs opacity-60">({drafts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("published")}
            className={`pb-3 font-medium transition-all relative ${
              activeTab === "published"
                ? "text-neutral-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            Published{" "}
            <span className="ml-1 text-xs opacity-60">
              ({published.length})
            </span>
          </button>
        </div>

        {/* ================= STATUS & PESAN ERROR ================= */}
        {loading && (
          <div className="py-20 text-center text-sm font-sans text-neutral-400 animate-pulse">
            Memuat tulisan...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        {/* ================= DAFTAR CERITA ================= */}
        {!loading && !errorMessage && (
          <div className="divide-y divide-neutral-100 mt-2">
            {currentList.length === 0 ? (
              /* State Kosong Bersahaja */
              <div className="py-20 text-center">
                <p className="font-serif text-lg text-neutral-700 mb-1">
                  {activeTab === "drafts"
                    ? "Belum ada draf naskah."
                    : "Belum ada tulisan yang dipublikasikan."}
                </p>
                <p className="text-xs text-neutral-400 font-sans mb-6">
                  {activeTab === "drafts"
                    ? "Goresan kata pertama selalu menjadi langkah terbaik."
                    : "Tulisan yang telah kamu publikasikan akan muncul di sini."}
                </p>
                <Link
                  to="/creator/write"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 underline underline-offset-4 hover:text-emerald-700"
                >
                  Mulai menulis draf baru
                </Link>
              </div>
            ) : (
              /* Item Baris Cerita */
              currentList.map((story) => (
                <div
                  key={story.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 transition-colors hover:bg-neutral-50/60 px-3 rounded-xl"
                >
                  {/* Sisi Kiri: Judul dan Info */}
                  <div className="min-w-0 flex-1 pr-4">
                    <Link
                      to={
                        activeTab === "drafts"
                          ? `/creator/write?id=${story.id}`
                          : `/cerita/${story.slug || story.id}`
                      }
                    >
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors leading-snug">
                        {story.title || "Tanpa Judul"}
                      </h2>
                    </Link>

                    <div className="flex items-center gap-2 mt-2 text-xs font-sans text-neutral-400">
                      <span>{story.read_time || 1} menit baca</span>
                      <span>·</span>
                      <span className="capitalize">{story.status}</span>
                      {story.created_at && (
                        <>
                          <span>·</span>
                          <span>
                            {new Date(story.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sisi Kanan: Tombol Aksi */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      to={`/creator/write?id=${story.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300"
                      title="Edit Naskah"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </Link>

                    {activeTab === "published" && (
                      <Link
                        to={`/cerita/${story.slug || story.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
                        title="Buka Halaman Baca"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
