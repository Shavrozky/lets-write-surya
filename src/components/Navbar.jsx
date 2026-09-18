// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { PenLine, Search, UserCircle } from "lucide-react";
import { useCommunityAuth } from "../creator/context/CommunityAuthContext";
import { getAvatarUrl } from "../creator/services/communityApi";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useCommunityAuth();
  const displayName = user?.pen_name || user?.name || "Profil";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = getAvatarUrl(user?.avatar);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to="/"
            className="shrink-0 font-serif text-3xl font-bold tracking-tight text-neutral-950"
          >
            Aksara
          </Link>

          <label className="hidden min-w-0 items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-500 md:flex md:w-[320px]">
            <Search size={16} className="shrink-0" />
            <input
              type="search"
              placeholder="Cari tulisan"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400"
            />
          </label>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto text-sm">
          <Link
            to="/creator/write"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <PenLine size={15} />
            <span>Write</span>
          </Link>

          {isLoading ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-neutral-100" />
          ) : isAuthenticated ? (
            <div className="group relative shrink-0">
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

              <div className="invisible absolute right-0 top-11 w-52 translate-y-1 rounded-2xl border border-neutral-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="border-b border-neutral-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-neutral-950">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-neutral-400">{user?.email}</p>
                </div>
                <Link
                  to="/creator/stories"
                  className="mt-1 block rounded-xl px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                >
                  Stories saya
                </Link>
                <Link
                  to="/creator/profile"
                  className="block rounded-xl px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                >
                  Profil
                </Link>
                <button
                  onClick={() => navigate("/creator/stories")}
                  className="block w-full rounded-xl px-3 py-2 text-left text-xs text-neutral-500 hover:bg-neutral-50"
                >
                  Keluar lewat sidebar
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/creator/auth?mode=signup"
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
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
