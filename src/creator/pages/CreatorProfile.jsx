import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreatorStoryCard from "../components/CreatorStoryCard";
import EditProfileModal from "../components/EditProfileModal";
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
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
        Memuat profil...
      </div>
    );
  }

  const displayName = user.pen_name || user.name || "Penulis Aksara";
  const initial = displayName.charAt(0).toUpperCase() || "A";
  const avatarUrl = getAvatarUrl(user.avatar);
  const publishedStories = stories.filter((story) => story.status === "published");

  const handleSaveProfile = async (payload) => {
    const data = await communityApi.updateProfile(payload);
    updateUser(data.user);
  };

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 border-neutral-200 lg:border-r lg:pr-10">
          <header className="border-b border-neutral-200 pb-5">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
              {displayName}
            </h1>

            <div className="mt-8 flex gap-8 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className={`border-b pb-3 transition ${
                  activeTab === "home"
                    ? "border-neutral-950 text-neutral-950"
                    : "border-transparent text-neutral-400 hover:text-neutral-950"
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`border-b pb-3 transition ${
                  activeTab === "about"
                    ? "border-neutral-950 text-neutral-950"
                    : "border-transparent text-neutral-400 hover:text-neutral-950"
                }`}
              >
                About
              </button>
            </div>
          </header>

          {activeTab === "home" ? (
            <section className="py-2">
              {loadingStories && (
                <div className="py-10 text-sm text-neutral-400">Memuat tulisan...</div>
              )}

              {!loadingStories && errorMessage && (
                <div className="py-10 text-sm text-red-600">{errorMessage}</div>
              )}

              {!loadingStories && !errorMessage && publishedStories.length === 0 && (
                <div className="py-14 text-center">
                  <p className="font-serif text-2xl font-bold text-neutral-950">
                    Belum ada cerita terbit.
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Tulisan yang sudah dipublikasikan akan tampil di profilmu.
                  </p>
                  <Link
                    to="/creator/write"
                    className="mt-5 inline-flex rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Tulis sekarang
                  </Link>
                </div>
              )}

              {!loadingStories &&
                !errorMessage &&
                publishedStories.map((story) => (
                  <CreatorStoryCard key={story.id} story={{ ...story, author: user }} />
                ))}
            </section>
          ) : (
            <section className="max-w-2xl py-10">
              <h2 className="font-serif text-2xl font-bold text-neutral-950">
                Tentang {displayName}
              </h2>
              <p className="mt-4 text-base leading-8 text-neutral-700">
                {user.bio || "Penulis ini belum menambahkan bio."}
              </p>
              <div className="mt-8 border-t border-neutral-200 pt-5 text-sm text-neutral-500">
                Bergabung sejak {formatJoinDate(user.created_at)}
              </div>
            </section>
          )}
        </main>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="border-neutral-200 pb-8 lg:border-b">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-neutral-950 text-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                  {initial}
                </div>
              )}
            </div>

            <h2 className="mt-4 text-base font-semibold text-neutral-950">
              {displayName}
            </h2>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-neutral-500">
              {user.bio || "Tambahkan bio singkat agar pembaca mengenalmu."}
            </p>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-4 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              Edit profile
            </button>
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
