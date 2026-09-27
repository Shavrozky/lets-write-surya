// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { Menu, PenLine, Search } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useCommunityAuth } from "../creator/context/CommunityAuthContext";
import { getAvatarUrl } from "../creator/services/communityApi";

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, isLoading } = useCommunityAuth();
  const { toggleSidebar } = useSidebar();

  const displayName = user?.pen_name || user?.name || "Profil";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = getAvatarUrl(user?.avatar);

  // Fallback: gunakan prop onToggleSidebar jika ada, atau toggleSidebar dari context
  const handleToggle = onToggleSidebar || toggleSidebar;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      {/* Kontainer dengan max-w-6xl mx-auto px-6 */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* ================= SISI KIRI: HAMBURGER + BRAND ================= */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          <Link
            to="/"
            className="font-serif text-2xl font-bold tracking-tight text-neutral-900 transition-opacity hover:opacity-80"
          >
            Aksara
          </Link>
        </div>

        {/* ================= TENGAH: PENCARIAN TULISAN ================= */}
        <div className="hidden sm:block flex-1 max-w-sm md:max-w-md mx-6">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Cari tulisan..."
              className="w-full rounded-full bg-neutral-100/80 py-2 pl-9 pr-4 text-xs font-sans text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300 transition"
            />
          </div>
        </div>

        {/* ================= SISI KANAN: TULIS & PROFIL ================= */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Tombol Tulis Naskah */}
          <Link
            to="/creator/write"
            className="flex items-center gap-1.5 text-xs font-sans font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <PenLine size={16} />
            <span className="hidden sm:inline">Write</span>
          </Link>

          {/* Profil Avatar / Tombol Masuk */}
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse" />
          ) : isAuthenticated ? (
            <Link
              to="/creator/profile"
              className="flex items-center gap-2 group"
              title={displayName}
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xs font-semibold text-white shadow-xs ring-1 ring-neutral-200 transition group-hover:ring-neutral-400">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
            </Link>
          ) : (
            <Link
              to="/creator/auth?mode=signin"
              className="rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 shadow-xs"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
