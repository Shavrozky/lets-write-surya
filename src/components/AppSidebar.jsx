import {
  BookMarked,
  Home,
  Library,
  LogOut,
  PenLine,
  Shield,
  Users,
  UserCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCommunityAuth } from "../creator/context/CommunityAuthContext";

const baseNavItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Library", path: "/creator/library", icon: Library },
  { label: "Stories", path: "/creator/stories", icon: BookMarked },
  { label: "Write", path: "/creator/write", icon: PenLine },
];

const adminNavItems = [
  { label: "Admin", path: "/creator/admin", icon: Shield },
  { label: "Users", path: "/creator/admin/users", icon: Users },
];

function SidebarLink({ item, isActive }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={`flex shrink-0 items-center gap-3 py-2 text-sm transition md:w-full ${
        isActive
          ? "font-medium text-neutral-950"
          : "text-neutral-500 hover:text-neutral-950"
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useCommunityAuth();
  const mainNavItems = [
    ...baseNavItems,
    ...(isAuthenticated
      ? [{ label: "Profile", path: "/creator/profile", icon: UserCircle }]
      : []),
  ];
  const visibleAdminItems = user?.role === "admin" ? adminNavItems : [];

  const isItemActive = (item) =>
    item.path === "/"
      ? location.pathname === "/" || location.pathname === "/home"
      : location.pathname.startsWith(item.path);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="flex h-full flex-col justify-between md:border-r md:border-neutral-200/70 md:pr-6 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] md:w-60">
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              isActive={isItemActive(item)}
            />
          ))}
        </nav>

        {visibleAdminItems.length > 0 && (
          <nav className="mt-5 border-t border-neutral-200/70 pt-5 space-y-1">
            {visibleAdminItems.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                isActive={isItemActive(item)}
              />
            ))}
          </nav>
        )}
      </div>

      {isAuthenticated && (
        <div className="border-t border-neutral-200/70 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 pr-2">
              <p className="truncate text-sm font-medium text-neutral-950">
                {user?.pen_name || user?.name}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 text-neutral-500 transition hover:text-neutral-950"
            >
              <LogOut size={18} strokeWidth={1.9} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
