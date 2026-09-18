import {
  BookMarked,
  Home,
  Library,
  LogOut,
  PenLine,
  Shield,
  UserCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCommunityAuth } from "../creator/context/CommunityAuthContext";

const baseNavItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Stories", path: "/creator/stories", icon: BookMarked },
  { label: "Write", path: "/creator/write", icon: PenLine },
  { label: "Library", path: "/creator/library", icon: Library },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useCommunityAuth();
  const navItems = [
    ...baseNavItems,
    ...(isAuthenticated
      ? [{ label: "Profile", path: "/creator/profile", icon: UserCircle }]
      : []),
    ...(user?.role === "admin"
      ? [{ label: "Admin", path: "/creator/admin", icon: Shield }]
      : []),
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="flex flex-col justify-between md:sticky md:top-[88px] md:h-[calc(100vh-7rem)]">
      <nav className="flex gap-1.5 overflow-x-auto border-b border-neutral-200 pb-3 md:block md:space-y-1 md:border-b-0 md:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/" || location.pathname === "/home"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition md:w-full ${
                isActive
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {isAuthenticated && (
        <div className="hidden border-t border-neutral-200 pt-3 md:block">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-semibold text-neutral-900">
                {user?.pen_name || user?.name}
              </p>
              <p className="truncate text-[11px] text-neutral-400">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="rounded-md p-1.5 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
