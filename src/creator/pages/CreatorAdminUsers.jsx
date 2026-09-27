import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserX,
  BookOpen,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { communityApi, getAvatarUrl } from "../services/communityApi";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import FeedbackModal from "../components/FeedbackModal";

function UserAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayName = user.pen_name || user.name || "User";
  const avatarUrl = getAvatarUrl(user.avatar);
  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xs font-semibold text-white shadow-sm ring-1 ring-neutral-200/60">
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
      setErrorMessage("Akses ditolak. Halaman ini khusus administrator.");
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
        eyebrow: "Akun Dibatasi",
        title: "Akun berhasil di-ban.",
        message: `${account.pen_name || account.name || "User"} tidak dapat menerbitkan cerita baru.`,
      });
      loadUsers();
    } catch (error) {
      setErrorMessage(error.message);
      setFeedback({
        tone: "danger",
        eyebrow: "Aksi Gagal",
        title: "Akun belum berhasil di-ban.",
        message: error.message,
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
              <Users size={14} className="text-neutral-400" />
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Admin Aksara
              </p>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Akun terdaftar.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
              Pantau seluruh akun komunitas, hak akses peran (*role*), status
              penangguhan akun, dan produktivitas karya tulis mereka.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <span className="hidden sm:inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              Total {users.length} Akun
            </span>
            <Link
              to="/creator/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300"
            >
              <span>Moderasi tulisan</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ================= PESAN ERROR ================= */}
        {errorMessage && (
          <div className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        {/* ================= TABEL PENGGUNA ================= */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm font-sans text-neutral-400">
            <Loader2 className="animate-spin mr-2" size={16} />
            <span>Memuat daftar akun...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-neutral-700 mb-1">
              Belum ada akun komunitas terdaftar.
            </p>
            <p className="text-xs text-neutral-400 font-sans">
              Daftar pengguna terdaftar akan tampil di sini secara terpusat.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/75 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 font-sans">
                  <th className="py-3.5 pl-6 pr-4">Profil Penulis</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4 text-center">Role</th>
                  <th className="py-3.5 px-4 text-center">Karya</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {users.map((account) => {
                  const displayName =
                    account.pen_name || account.name || "Tanpa nama";
                  const isAdminRole = account.role === "admin";

                  return (
                    <tr
                      key={account.id}
                      className="group transition-colors hover:bg-neutral-50/60"
                    >
                      {/* Kolom 1: Profil (Avatar & Nama) */}
                      <td className="py-4 pl-6 pr-4 align-middle">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={account} />
                          <div className="min-w-0">
                            <p className="font-sans font-bold capitalize text-neutral-900 group-hover:text-neutral-700 transition">
                              {displayName}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                              {account.name}
                            </p>
                            {account.is_banned && (
                              <span className="mt-0.5 inline-block text-[10px] font-semibold text-red-600">
                                ● Akun Dibatasi
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Email */}
                      <td className="py-4 px-4 align-middle font-sans text-xs text-neutral-500">
                        <span
                          className="truncate max-w-[200px] block"
                          title={account.email}
                        >
                          {account.email}
                        </span>
                      </td>

                      {/* Kolom 3: Role Badge */}
                      <td className="py-4 px-4 align-middle font-sans text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize border ${
                            isAdminRole
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200/60"
                          }`}
                        >
                          {isAdminRole && <ShieldCheck size={11} />}
                          <span>{account.role}</span>
                        </span>
                      </td>

                      {/* Kolom 4: Jumlah Tulisan */}
                      <td className="py-4 px-4 align-middle font-sans text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
                          <BookOpen size={12} className="text-neutral-400" />
                          <span>{account.stories_count || 0} tulisan</span>
                        </div>
                      </td>

                      {/* Kolom 5: Aksi */}
                      <td className="py-4 pl-4 pr-6 align-middle font-sans text-right">
                        {!isAdminRole && !account.is_banned ? (
                          <button
                            onClick={() => handleBanUser(account)}
                            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-amber-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 active:scale-95"
                            title="Batasi akses akun ini"
                          >
                            <UserX size={12} />
                            <span>Ban User</span>
                          </button>
                        ) : isAdminRole ? (
                          <span className="text-[11px] text-neutral-300 font-medium">
                            Admin Utama
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-500 font-medium">
                            Telah Di-ban
                          </span>
                        )}
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
