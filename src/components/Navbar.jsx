// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, SquarePen, LogOut } from "lucide-react";
import { auth } from "../utils/auth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = auth.isAuthenticated();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <header className="border-b border-proseBorder sticky top-0 bg-white/90 backdrop-blur-sm z-50">
      <div className="max-w-[760px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="font-serif text-2xl font-bold tracking-tight text-proseText hover:opacity-80 transition-opacity"
        >
          katasurya.
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-5 text-sm font-sans text-proseMuted">
          <Link
            to="/"
            className={`transition-colors ${location.pathname === "/" ? "text-proseText font-medium" : "hover:text-proseText"}`}
          >
            Cerita
          </Link>

          <Link
            to="/tentang"
            className={`transition-colors ${location.pathname === "/tentang" ? "text-proseText font-medium" : "hover:text-proseText"}`}
          >
            Tentang
          </Link>

          {/* Tombol Write */}
          <Link
            to="/write"
            className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 transition-colors py-1 px-2 rounded-md hover:bg-neutral-100"
            title="Tulis Cerita Baru"
          >
            <SquarePen size={16} strokeWidth={1.75} />
            <span className="text-xs font-normal">Write</span>
          </Link>

          {/* Tombol Logout (Hanya muncul jika sudah login) */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-neutral-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-neutral-100"
              title="Keluar (Logout)"
            >
              <LogOut size={15} />
            </button>
          )}

          {/* External Portfolio */}
          <a
            href="https://portfolio.katasurya.my.id"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-proseText transition-colors text-xs font-medium bg-neutral-100 px-3 py-1.5 rounded-full"
          >
            <span>Portfolio</span>
            <ExternalLink size={13} />
          </a>
        </nav>
      </div>
    </header>
  );
}
