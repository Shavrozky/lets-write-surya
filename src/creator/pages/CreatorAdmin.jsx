import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  EyeOff,
  Trash2,
  UserX,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";
import { communityApi, getAvatarUrl } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import FeedbackModal from "../components/FeedbackModal";

export default function CreatorAdmin() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useCommunityAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null);

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
      setErrorMessage("Akses ditolak. Halaman ini khusus administrator.");
      setLoading(false);
      return;
    }

    loadStories();
  }, [isAuthenticated, isLoading, navigate, user?.role]);

  const runAction = async (action, successFeedback) => {
    setErrorMessage("");

    try {
      await action();
      setFeedback(successFeedback);
      loadStories();
    } catch (err) {
      setErrorMessage(err.message);
      setFeedback({
        tone: "danger",
        eyebrow: "Aksi gagal",
        title: "Perubahan belum berhasil diproses.",
        message: err.message,
      });
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-white">
      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Kontainer diselaraskan dengan Navbar: mx-auto max-w-6xl px-6 */}
      <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={14} className="text-neutral-400" />
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Moderasi Komunitas
              </p>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Admin Aksara.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
              Tinjau tulisan masuk, sembunyikan konten bermasalah, hapus spam,
              atau batasi akses penulis yang menyalahgunakan platform.
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-3.5 py-1 text-xs font-medium text-neutral-600">
              Total {stories.length} Tulisan
            </span>
          </div>
        </div>

        {/* ================= PESAN ERROR ================= */}
        {errorMessage && (
          <div className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        {/* ================= TABEL MODERASI ================= */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-neutral-400 font-sans">
            <Loader2 className="animate-spin mr-2" size={16} />
            <span>Memuat antrean moderasi...</span>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-neutral-700 mb-1">
              Tidak ada antrean moderasi.
            </p>
            <p className="text-xs text-neutral-400 font-sans">
              Semua naskah komunitas dalam keadaan tertib.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/75 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 font-sans">
                  <th className="py-3.5 pl-6 pr-4">Naskah</th>
                  <th className="py-3.5 px-4">Penulis</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {stories.map((story) => {
                  const authorName =
                    story.author?.pen_name || story.author?.name || "Anonim";
                  const avatar = getAvatarUrl(story.author?.avatar);

                  return (
                    <tr
                      key={story.id}
                      className="group transition-colors hover:bg-neutral-50/60"
                    >
                      {/* Kolom 1: Judul & Tanggal */}
                      <td className="py-4 pl-6 pr-4 align-middle">
                        <div className="flex items-start gap-2 max-w-sm">
                          <div>
                            <Link
                              to={`/cerita/${story.slug || story.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-serif font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors inline-flex items-center gap-1.5 leading-snug"
                            >
                              <span>{story.title}</span>
                              <ExternalLink
                                size={12}
                                className="opacity-0 group-hover:opacity-100 text-neutral-400 transition"
                              />
                            </Link>
                            <p className="mt-1 text-[11px] font-sans text-neutral-400">
                              Diperbarui:{" "}
                              {new Date(story.updated_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Penulis */}
                      <td className="py-4 px-4 align-middle font-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xs font-semibold text-white">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={authorName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              authorName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold capitalize text-neutral-800">
                              {authorName}
                            </p>
                            <p className="truncate text-[11px] text-neutral-400">
                              {story.author?.email || "-"}
                            </p>
                            {story.author?.is_banned && (
                              <span className="mt-0.5 inline-block text-[10px] font-semibold text-red-600">
                                ● Akun Dibatasi
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kolom 3: Status Cerita */}
                      <td className="py-4 px-4 align-middle font-sans">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                            story.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200/60"
                          }`}
                        >
                          {story.status}
                        </span>
                      </td>

                      {/* Kolom 4: Baris Aksi */}
                      <td className="py-4 pl-4 pr-6 align-middle font-sans text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {story.status === "draft" && (
                            <button
                              onClick={() =>
                                runAction(
                                  () =>
                                    communityApi.publishAdminStory(story.id),
                                  {
                                    tone: "success",
                                    eyebrow: "Cerita Terbit",
                                    title: "Cerita berhasil dipublikasikan.",
                                    message: `"${story.title}" kini tampil untuk pembaca.`,
                                  },
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 shadow-sm"
                              title="Publikasikan Cerita"
                            >
                              <Check size={12} strokeWidth={2.5} />
                              <span>Terbitkan</span>
                            </button>
                          )}

                          {story.status === "published" && (
                            <button
                              onClick={() =>
                                runAction(
                                  () => communityApi.hideAdminStory(story.id),
                                  {
                                    tone: "success",
                                    eyebrow: "Disembunyikan",
                                    title: "Cerita berhasil disembunyikan.",
                                    message: `"${story.title}" tidak lagi tampil di feed publik.`,
                                  },
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 shadow-sm"
                              title="Sembunyikan dari publik"
                            >
                              <EyeOff size={12} />
                              <span>Sembunyikan</span>
                            </button>
                          )}

                          <button
                            onClick={() =>
                              runAction(
                                () => communityApi.deleteAdminStory(story.id),
                                {
                                  tone: "success",
                                  eyebrow: "Cerita Terhapus",
                                  title: "Cerita berhasil dihapus.",
                                  message: `"${story.title}" telah dihapus secara permanen.`,
                                },
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 shadow-sm"
                            title="Hapus Cerita"
                          >
                            <Trash2 size={12} />
                            <span>Hapus</span>
                          </button>

                          {story.author?.id && !story.author?.is_banned && (
                            <button
                              onClick={() =>
                                runAction(
                                  () =>
                                    communityApi.banAdminUser(story.author.id),
                                  {
                                    tone: "success",
                                    eyebrow: "Akun Dibatasi",
                                    title: "Penulis berhasil di-ban.",
                                    message: `${authorName} tidak dapat lagi mempublikasikan naskah.`,
                                  },
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:border-amber-200 hover:bg-amber-50 shadow-sm"
                              title="Batasi Akun Penulis"
                            >
                              <UserX size={12} />
                              <span>Ban</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
