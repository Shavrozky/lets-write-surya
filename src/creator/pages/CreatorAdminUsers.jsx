import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { communityApi, getAvatarUrl } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import FeedbackModal from "../components/FeedbackModal";

function UserAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayName = user.pen_name || user.name || "User";
  const avatarUrl = getAvatarUrl(user.avatar);
  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-sm font-semibold text-white">
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
}

export default function CreatorAdminUsers() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useCommunityAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    setErrorMessage("");

    communityApi
      .getAdminUsers()
      .then((data) => setUsers(data.data || []))
      .catch((error) => setErrorMessage(error.message))
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

    loadUsers();
  }, [isAuthenticated, isLoading, navigate, user?.role]);

  const handleBanUser = async (account) => {
    setErrorMessage("");

    try {
      await communityApi.banAdminUser(account.id);
      setFeedback({
        tone: "success",
        eyebrow: "Akun dibatasi",
        title: "Akun berhasil di-ban.",
        message: `${account.pen_name || account.name || "User"} tidak dapat menerbitkan cerita baru.`,
      });
      loadUsers();
    } catch (error) {
      setErrorMessage(error.message);
      setFeedback({
        tone: "danger",
        eyebrow: "Aksi gagal",
        title: "Akun belum berhasil di-ban.",
        message: error.message,
      });
    }
  };

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-8">
      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />

      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Admin Aksara
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold">
            Akun terdaftar.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            Lihat daftar penulis komunitas, role, status akun, dan jumlah tulisan
            yang sudah mereka buat.
          </p>
        </div>
        <Link
          to="/creator/admin"
          className="w-fit rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950"
        >
          Moderasi tulisan
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-neutral-400">Memuat daftar akun...</p>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
          Belum ada akun komunitas.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <div className="hidden grid-cols-[1.4fr_1fr_90px_100px_140px] gap-4 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 md:grid">
            <span>Profil</span>
            <span>Email</span>
            <span>Role</span>
            <span>Tulisan</span>
            <span>Aksi</span>
          </div>

          {users.map((account) => {
            const displayName = account.pen_name || account.name || "Tanpa nama";

            return (
              <article
                key={account.id}
                className="grid gap-3 border-t border-neutral-100 px-4 py-4 text-sm md:grid-cols-[1.4fr_1fr_90px_100px_140px] md:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar user={account} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-950">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-neutral-400">
                      {account.name}
                    </p>
                    {account.is_banned && (
                      <p className="mt-1 w-fit rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                        Banned
                      </p>
                    )}
                  </div>
                </div>

                <p className="truncate text-xs text-neutral-500">{account.email}</p>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    account.role === "admin"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {account.role}
                </span>

                <p className="text-xs text-neutral-500">
                  {account.stories_count || 0} tulisan
                </p>

                <div>
                  {account.role !== "admin" && !account.is_banned ? (
                    <button
                      onClick={() => handleBanUser(account)}
                      className="rounded-full border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
                    >
                      Ban User
                    </button>
                  ) : (
                    <span className="text-xs text-neutral-400">Tidak ada aksi</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
