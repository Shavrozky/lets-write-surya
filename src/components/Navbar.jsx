// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function Navbar() {
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
        <nav className="flex items-center gap-6 text-sm font-sans text-proseMuted">
          <Link to="/" className="hover:text-proseText transition-colors">
            Cerita
          </Link>
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
