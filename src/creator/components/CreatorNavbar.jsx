import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine, UserCircle } from "lucide-react";
import { useCommunityAuth } from "../context/CommunityAuthContext";
import { getAvatarUrl } from "../services/communityApi";

export default function CreatorNavbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, signOut } = useCommunityAuth();

  const handleLogout = () => {
    signOut();
    navigate("/creator/auth");
  };

  const displayName = user?.pen_name || user?.name || "Profil";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = getAvatarUrl(user?.avatar);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="hidden items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-950 sm:inline-flex"
          >
            <ArrowLeft size={14} />
            <span>Aksara Utama</span>
          </Link>
          <Link
            to="/creator"
            className="font-serif text-2xl font-bold tracking-tight"
          >
            Aksara
          </Link>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/creator/write"
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            <PenLine size={14} />
            <span>Write</span>
          </Link>

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-neutral-100" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/creator/stories"
                className="hidden text-xs font-medium text-neutral-500 hover:text-neutral-950 sm:inline"
              >
                {displayName}
              </Link>
              <div className="group relative">
                <button
                  className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-xs font-semibold text-white"
                  title={displayName}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : initial ? (
                    initial
                  ) : (
                    <UserCircle size={20} />
                  )}
                </button>
                <div className="invisible absolute right-0 top-11 w-48 translate-y-1 rounded-2xl border border-neutral-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    to="/creator/stories"
                    className="block rounded-xl px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                  >
                    Stories saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/creator/auth?mode=signup"
                className="hidden rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 sm:inline-flex"
              >
                Sign up
              </Link>
              <Link
                to="/creator/auth?mode=signin"
                className="rounded-full px-3 py-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
