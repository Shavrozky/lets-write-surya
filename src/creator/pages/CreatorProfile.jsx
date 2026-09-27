import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreatorStoryCard from "../components/CreatorStoryCard";
import EditProfileModal from "../components/EditProfileModal";
import FeedbackModal from "../components/FeedbackModal";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import { communityApi, getAvatarUrl } from "../services/communityApi";

const formatJoinDate = (date) => {
  if (!date) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export default function CreatorProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, updateUser } = useCommunityAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/creator/auth?mode=signin", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isMounted = true;

    communityApi
      .getMyStories()
      .then((data) => {
        if (isMounted) {
          setStories(data.data || []);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingStories(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-sans text-neutral-400">
        Memuat profil...
      </div>
    );
  }

  const displayName = user.pen_name || user.name || "Penulis Aksara";
  const initial = displayName.charAt(0).toUpperCase() || "A";
  const avatarUrl = getAvatarUrl(user.avatar);
  const publishedStories = stories.filter(
    (story) => story.status === "published",
  );

  const handleSaveProfile = async (payload) => {
    const data = await communityApi.updateProfile(payload);
    updateUser(data.user);
    setFeedback({
      tone: "success",
      eyebrow: "Profil diperbarui",
      title: "Profil berhasil disimpan.",
      message: "Perubahan profilmu sudah tersimpan dan tampil untuk pembaca.",
    });
  };

  return (
    <>
      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />

      {/* Kontainer Utama dengan Padding dan Gap Lega */}
      <div className="mx-auto grid max-w-6xl gap-12 px-6 sm:px-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        {/* ================= KOLOM KIRI (ARTIKEL) ================= */}
        <main className="min-w-0 lg:border-r lg:border-neutral-100 lg:pr-14">
          {/* Header Profil (Tanpa double-border) */}
          <header className="mb-8">
            <h1 className="font-serif text-4xl font-bold capitalize tracking-tight text-neutral-950 sm:text-5xl">
              {displayName}
            </h1>

            {/* Tab Navigasi Bersih ala Medium */}
            <div className="mt-8 flex gap-8 border-b border-neutral-200/80 text-sm font-sans">
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className={`relative pb-3 font-medium transition-colors ${
                  activeTab === "home"
                    ? "text-neutral-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-neutral-950"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`relative pb-3 font-medium transition-colors ${
                  activeTab === "about"
                    ? "text-neutral-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-neutral-950"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                About
              </button>
            </div>
          </header>

          {/* Tab Home: Cerita Terbit */}
          {activeTab === "home" ? (
            <section className="divide-y divide-neutral-100">
              {loadingStories && (
                <div className="py-12 text-center text-sm font-sans text-neutral-400">
                  Memuat tulisan...
                </div>
              )}

              {!loadingStories && errorMessage && (
                <div className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
                  {errorMessage}
                </div>
              )}

              {!loadingStories &&
                !errorMessage &&
                publishedStories.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="font-serif text-2xl font-bold text-neutral-950">
                      Belum ada cerita terbit.
                    </p>
                    <p className="mt-2 text-sm text-neutral-500 font-sans">
                      Tulisan yang sudah dipublikasikan akan tampil di profilmu.
                    </p>
                    <Link
                      to="/creator/write"
                      className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800 shadow-sm"
                    >
                      Tulis sekarang
                    </Link>
                  </div>
                )}

              {!loadingStories &&
                !errorMessage &&
                publishedStories.map((story) => (
                  <div key={story.id} className="py-2">
                    <CreatorStoryCard
                      story={{
                        ...story,
                        author: {
                          ...user,
                          pen_name: displayName,
                          name: displayName,
                        },
                      }}
                    />
                  </div>
                ))}
            </section>
          ) : (
            /* Tab About */
            <section className="max-w-2xl py-6 font-serif">
              <h2 className="text-2xl font-bold text-neutral-950">
                Tentang {displayName}
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-neutral-700">
                {user.bio || "Penulis ini belum menambahkan bio narasi."}
              </p>
              <div className="mt-8 border-t border-neutral-100 pt-5 text-xs font-sans text-neutral-400">
                Bergabung sejak {formatJoinDate(user.created_at)}
              </div>
            </section>
          )}
        </main>

        {/* ================= SIDEBAR KANAN (PROFIL RINGKAS) ================= */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="space-y-4">
            {/* Avatar Bulat Minimalis */}
            <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-200/60">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-semibold">
                  {initial}
                </div>
              )}
            </div>

            {/* Nama & Bio */}
            <div>
              <h2 className="font-sans text-base font-bold capitalize text-neutral-950">
                {displayName}
              </h2>
              <p className="mt-1.5 line-clamp-4 font-sans text-xs leading-relaxed text-neutral-500">
                {user.bio ||
                  "Tambahkan bio singkat agar pembaca mengenalmu lebih dekat."}
              </p>
            </div>

            {/* Tombol Edit Profile */}
            <div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-2 inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:border-neutral-900 hover:text-neutral-950 active:scale-95"
              >
                Edit profile
              </button>
            </div>

            {/* Info Jumlah Cerita (Pengganti garis kosong) */}
            <div className="pt-6 border-t border-neutral-100 text-[11px] font-sans text-neutral-400">
              <span>{publishedStories.length} cerita telah terbit</span>
            </div>
          </div>
        </aside>
      </div>

      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}
