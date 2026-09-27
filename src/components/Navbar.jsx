// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { Menu, X, PenLine, Search, UserCircle } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useCommunityAuth } from "../creator/context/CommunityAuthContext";
import { getAvatarUrl } from "../creator/services/communityApi";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useCommunityAuth();
  const displayName = user?.pen_name || user?.name || "Profil";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = getAvatarUrl(user?.avatar);
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Sisi Kiri: Tombol Hamburger + Logo */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-all duration-150 ease-out hover:bg-neutral-100 hover:text-neutral-900 active:scale-90"
            aria-label="Toggle menu"
          >
            <div className="relative h-5 w-5">
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "rotate-90 opacity-0 scale-75"
                    : "rotate-0 opacity-100 scale-100"
                }`}
              >
                <Menu size={20} strokeWidth={2} />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "rotate-0 opacity-100 scale-100"
                    : "-rotate-90 opacity-0 scale-75"
                }`}
              >
                <X size={20} />
              </span>
            </div>
          </button>

          <Link
            to="/"
            className="font-serif text-2xl font-bold tracking-tight text-neutral-900"
          >
            Aksara
          </Link>

          <label className="hidden min-w-0 items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-500 md:flex md:w-[300px]">
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
            <Link
              to="/creator/profile"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-xs font-semibold text-white"
              title={displayName}
              aria-label={`Buka profil ${displayName}`}
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
            </Link>
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
